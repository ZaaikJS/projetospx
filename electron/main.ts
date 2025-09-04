import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
const { shell } = require('electron');
import './database';
import './fileHandler';
import { initWhatsapp } from './whatsapp';
import { initializeDatabases } from './database';
import { getClientId, getAccessToken } from './client';
import keytar from 'keytar';
import { randomBytes } from 'crypto';
import { getActiveResourcesInfo } from 'process';
import { autoUpdater } from "electron-updater";

let mainWindow: BrowserWindow | null = null;
let logWindow: BrowserWindow | null = null;

// Evita criar mais de um cliente/instância por engano em dev/hot-reload
let whatsappInitialized = false;

let serverUrl = 'http://localhost:3000'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    icon: path.join(__dirname, "../public", "icon.ico"),
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // Se não quiser DevTools em produção, comente a linha abaixo
    // mainWindow.webContents.openDevTools();
  }

  /* Inicializa o WhatsApp APENAS uma vez por processo
  if (!whatsappInitialized) {
    whatsappInitialized = true;
    initWhatsapp(mainWindow).catch((e) =>
      console.error('Falha ao iniciar WhatsApp:', e)
    );
  } */

  ipcMain.on('minimize-window', () => mainWindow?.minimize());
  ipcMain.on('maximize-window', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('close-window', () => mainWindow?.close());

  ipcMain.handle('open-url', async (_event, { url }: { url: string }) => {
    if (typeof url !== 'string') throw new Error('URL inválida');
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    await shell.openExternal(url);
    return true;
  });
}

function createLogWindow() {
  if (logWindow) {
    logWindow.focus();
    return;
  }

  logWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Console do Minecraft",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    logWindow.loadURL("http://localhost:5173/#/console");
  } else {
    logWindow.loadFile(path.join(__dirname, "../dist/index.html"), { hash: "console" });
  }

  logWindow.on("closed", () => { logWindow = null; });
}

// Variável para guardar URL passada na inicialização
let deeplinkingUrl: string | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const url = argv.find(arg => arg.startsWith('neooh://'));
    if (url && mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send('uri', url);
    }
  });

  app.whenReady().then(async () => {
    if (process.defaultApp && process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('neooh', process.execPath, [path.resolve(process.argv[1])]);
    } else {
      app.setAsDefaultProtocolClient('neooh');
    }

    initializeDatabases();
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();

    const args = process.argv;
    const uriArg = args.find(arg => arg.startsWith('neooh://'));
    if (uriArg) {
      deeplinkingUrl = uriArg;
    }

    mainWindow?.webContents.once('did-finish-load', () => {
      if (deeplinkingUrl) {
        mainWindow?.webContents.send('uri', deeplinkingUrl);
        deeplinkingUrl = null;
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // macOS: evento padrão para url customizada
  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.webContents.send('uri', url);
    }
  });

  autoUpdater.on("update-downloaded", () => {
    if (mainWindow) {
      mainWindow.webContents.send("update-ready");
    }
  });
}

// ====== Auth ======
ipcMain.handle('openAuth', async (_event) => {
  const clientId = await getClientId();
  shell.openExternal(`${serverUrl}/external?clientId=${clientId}`)
});

ipcMain.handle('authProvider', async (_event, { token, session }) => {
  const clientId = await getClientId();

  try {
    const res = await fetch(`${serverUrl}/api/external/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, refreshToken: token, sessionId: session }),
    });

    const data = await res.json();

    if (res.ok) {
      await keytar.setPassword('Neooh', 'accessToken', data.accessToken);
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('Erro ao chamar API de login:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
});

ipcMain.handle('verifyAuth', async (_event) => {
  const clientId = await getClientId();
  const accessToken = await getAccessToken();

  try {
    const res = await fetch(
      `${serverUrl}/api/external/user?clientId=${clientId}&accessToken=${accessToken}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false || 'Unknown error' };
    }
  } catch (error) {
    console.error('Erro ao chamar API de login:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
});

// ====== Pipefy ======
const query = `
  query ($pipeId: ID!, $first: Int!, $after: String) {
    allCards(pipeId: $pipeId, first: $first, after: $after) {
      edges {
        node {
          id
          title
          created_at
          current_phase {
            name
            color
          }
          assignees {
            name
            email
            avatar_url
          }
          labels {
            name
            color
          }
          fields {
            name
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

ipcMain.handle('get-pipefy-cards', async (_event, { after, email }) => {
  try {
    const response = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await keytar.getPassword('Neooh', 'token')}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          pipeId: '304134796',
          first: 50,
          after,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const edges = result.data.allCards.edges;
    const pageInfo = result.data.allCards.pageInfo;

    let cards = edges.map((e: any) => e.node);

    // Filtro
    if (email) {
      cards = cards.filter(
        (card: any) =>
          card.assignees.some((a: any) => a.email === email) &&
          card.current_phase?.name !== 'CONCLUÍDO' &&
          card.current_phase?.name !== 'ENCERRAMENTO'
      );
    }

    // Ordena por data desc
    cards.sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return { cards, pageInfo };
  } catch (err: any) {
    return { error: err.message };
  }
});

// ====== Pipefy: buscar 1 card por ID ======
const queryCardById = `
  query ($id: ID!) {
    card(id: $id) {
      id
      title
      created_at
      current_phase { name color }
      assignees { name email avatar_url }
      labels { name color }
      fields { name value }
    }
  }
`;

ipcMain.handle('get-pipefy-card-by-id', async (_event, { id }) => {
  try {
    const response = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await keytar.getPassword('Neooh', 'token')}`,
      },
      body: JSON.stringify({
        query: queryCardById,
        variables: { id: String(id) },
      }),
    });

    const result = await response.json();

    // Erros do GraphQL
    if (result.errors?.length) {
      throw new Error(result.errors[0].message || 'Erro ao buscar card');
    }

    const card = result?.data?.card || null;

    if (!card) {
      // Pipefy pode retornar null quando não encontra
      return { error: 'Card não encontrado.' };
    }

    return { card };
  } catch (err: any) {
    return { error: err?.message || 'Erro ao buscar card' };
  }
});

// ====== Pipefy: buscar cards por TÍTULO (contém) ======
const queryAllCards = `
  query ($pipeId: ID!, $first: Int!, $after: String) {
    allCards(pipeId: $pipeId, first: $first, after: $after) {
      edges {
        node {
          id
          title
          created_at
          current_phase { name color }
          assignees { name email avatar_url }
          labels { name color }
          fields { name value }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

ipcMain.handle('get-pipefy-cards-by-title', async (_event, { title, email }) => {
  try {
    const pipeId = '304134796';
    const pageSize = 100;         // você pode ajustar
    const hardLimit = 500;        // máximo de cards a varrer
    let after: string | null = null;
    let hasNextPage = true;
    let scanned = 0;
    const all: any[] = [];

    while (hasNextPage && scanned < hardLimit) {
      const response: any = await fetch('https://api.pipefy.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await keytar.getPassword('Neooh', 'token')}`,
        },
        body: JSON.stringify({
          query: queryAllCards,
          variables: { pipeId, first: pageSize, after },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) throw new Error(result.errors[0].message);

      const edges = result.data.allCards.edges || [];
      const pageInfo = result.data.allCards.pageInfo || {};
      hasNextPage = !!pageInfo.hasNextPage;
      after = pageInfo.endCursor || null;

      const pageCards = edges.map((e: any) => e.node);
      scanned += pageCards.length;
      all.push(...pageCards);
    }

    // Normaliza string (case-insensitive + remove acentos)
    const norm = (s: string) =>
      (s || "")
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    let cards = all.filter((c) => norm(c.title).includes(norm(title || "")));

    // Filtro por responsável + fases (igual ao seu handle atual)
    if (email) {
      cards = cards.filter(
        (card: any) =>
          card.assignees?.some((a: any) => a.email === email) &&
          card.current_phase?.name !== 'CONCLUÍDO' &&
          card.current_phase?.name !== 'ENCERRAMENTO'
      );
    }

    // Ordena por data desc
    cards.sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return { cards };
  } catch (err: any) {
    return { error: err.message || 'Erro ao buscar cards por título' };
  }
});

ipcMain.handle('saveToken', async (_event, { token }) => {
  try {
    await keytar.setPassword('Neooh', 'token', token);
    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar o token:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
});

ipcMain.handle('getToken', async (_event) => {
  try {
    const token = await keytar.getPassword('Neooh', 'token');
    return { success: true, token }
  } catch (error) {
    console.error('Erro ao buscar o token:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
});