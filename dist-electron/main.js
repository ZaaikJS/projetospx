"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const { shell } = require('electron');
require("./database");
require("./fileHandler");
const database_1 = require("./database");
const client_1 = require("./client");
const keytar_1 = __importDefault(require("keytar"));
const electron_updater_1 = require("electron-updater");
let mainWindow = null;
let logWindow = null;
// Evita criar mais de um cliente/instância por engano em dev/hot-reload
let whatsappInitialized = false;
let serverUrl = 'http://localhost:3000';
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        icon: path_1.default.join(__dirname, "../public", "icon.ico"),
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, 'index.html'));
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
    electron_1.ipcMain.on('minimize-window', () => mainWindow?.minimize());
    electron_1.ipcMain.on('maximize-window', () => {
        if (mainWindow?.isMaximized())
            mainWindow.unmaximize();
        else
            mainWindow?.maximize();
    });
    electron_1.ipcMain.on('close-window', () => mainWindow?.close());
    electron_1.ipcMain.handle('open-url', async (_event, { url }) => {
        if (typeof url !== 'string')
            throw new Error('URL inválida');
        if (!/^https?:\/\//i.test(url))
            url = `https://${url}`;
        await shell.openExternal(url);
        return true;
    });
}
function createLogWindow() {
    if (logWindow) {
        logWindow.focus();
        return;
    }
    logWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        title: "Console do Minecraft",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    if (process.env.NODE_ENV === "development") {
        logWindow.loadURL("http://localhost:5173/#/console");
    }
    else {
        logWindow.loadFile(path_1.default.join(__dirname, "../dist/index.html"), { hash: "console" });
    }
    logWindow.on("closed", () => { logWindow = null; });
}
// Variável para guardar URL passada na inicialização
let deeplinkingUrl = null;
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', (_event, argv) => {
        const url = argv.find(arg => arg.startsWith('neooh://'));
        if (url && mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
            mainWindow.webContents.send('uri', url);
        }
    });
    electron_1.app.whenReady().then(async () => {
        if (process.defaultApp && process.argv.length >= 2) {
            electron_1.app.setAsDefaultProtocolClient('neooh', process.execPath, [path_1.default.resolve(process.argv[1])]);
        }
        else {
            electron_1.app.setAsDefaultProtocolClient('neooh');
        }
        (0, database_1.initializeDatabases)();
        createWindow();
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
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
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin')
            electron_1.app.quit();
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    // macOS: evento padrão para url customizada
    electron_1.app.on('open-url', (event, url) => {
        event.preventDefault();
        if (mainWindow) {
            mainWindow.webContents.send('uri', url);
        }
    });
    electron_updater_1.autoUpdater.on("checking-for-update", () => {
        console.log("🟡 Checando por updates...");
    });
    electron_updater_1.autoUpdater.on("update-available", (info) => {
        console.log("🟢 Update disponível:", info.version);
    });
    electron_updater_1.autoUpdater.on("update-not-available", () => {
        console.log("🔴 Nenhum update encontrado.");
    });
    electron_updater_1.autoUpdater.on("error", (err) => {
        console.error("❌ Erro no autoUpdater:", err);
    });
    electron_updater_1.autoUpdater.on("download-progress", (progress) => {
        console.log(`⬇️ Baixando... ${progress.percent.toFixed(0)}%`);
    });
    electron_updater_1.autoUpdater.on("update-downloaded", () => {
        console.log("✅ Update baixado, pronto para instalar.");
        if (mainWindow) {
            mainWindow.webContents.send("update-ready");
        }
    });
    electron_1.ipcMain.on("install-update", () => {
        electron_updater_1.autoUpdater.quitAndInstall();
    });
}
// ====== Auth ======
electron_1.ipcMain.handle('openAuth', async (_event) => {
    const clientId = await (0, client_1.getClientId)();
    shell.openExternal(`${serverUrl}/external?clientId=${clientId}`);
});
electron_1.ipcMain.handle('authProvider', async (_event, { token, session }) => {
    const clientId = await (0, client_1.getClientId)();
    try {
        const res = await fetch(`${serverUrl}/api/external/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, refreshToken: token, sessionId: session }),
        });
        const data = await res.json();
        if (res.ok) {
            await keytar_1.default.setPassword('Neooh', 'accessToken', data.accessToken);
            return { success: true };
        }
        else {
            return { success: false, error: data.error || 'Unknown error' };
        }
    }
    catch (error) {
        console.error('Erro ao chamar API de login:', error);
        return { success: false, error: 'INTERNAL_ERROR' };
    }
});
electron_1.ipcMain.handle('verifyAuth', async (_event) => {
    const clientId = await (0, client_1.getClientId)();
    const accessToken = await (0, client_1.getAccessToken)();
    try {
        const res = await fetch(`${serverUrl}/api/external/user?clientId=${clientId}&accessToken=${accessToken}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
            return { success: true };
        }
        else {
            return { success: false || 'Unknown error' };
        }
    }
    catch (error) {
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
electron_1.ipcMain.handle('get-pipefy-cards', async (_event, { after, email }) => {
    try {
        const response = await fetch('https://api.pipefy.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await keytar_1.default.getPassword('Neooh', 'token')}`,
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
        let cards = edges.map((e) => e.node);
        // Filtro
        if (email) {
            cards = cards.filter((card) => card.assignees.some((a) => a.email === email) &&
                card.current_phase?.name !== 'CONCLUÍDO' &&
                card.current_phase?.name !== 'ENCERRAMENTO');
        }
        // Ordena por data desc
        cards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { cards, pageInfo };
    }
    catch (err) {
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
electron_1.ipcMain.handle('get-pipefy-card-by-id', async (_event, { id }) => {
    try {
        const response = await fetch('https://api.pipefy.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await keytar_1.default.getPassword('Neooh', 'token')}`,
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
    }
    catch (err) {
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
electron_1.ipcMain.handle('get-pipefy-cards-by-title', async (_event, { title, email }) => {
    try {
        const pipeId = '304134796';
        const pageSize = 100; // você pode ajustar
        const hardLimit = 500; // máximo de cards a varrer
        let after = null;
        let hasNextPage = true;
        let scanned = 0;
        const all = [];
        while (hasNextPage && scanned < hardLimit) {
            const response = await fetch('https://api.pipefy.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await keytar_1.default.getPassword('Neooh', 'token')}`,
                },
                body: JSON.stringify({
                    query: queryAllCards,
                    variables: { pipeId, first: pageSize, after },
                }),
            });
            const result = await response.json();
            if (result.errors?.length)
                throw new Error(result.errors[0].message);
            const edges = result.data.allCards.edges || [];
            const pageInfo = result.data.allCards.pageInfo || {};
            hasNextPage = !!pageInfo.hasNextPage;
            after = pageInfo.endCursor || null;
            const pageCards = edges.map((e) => e.node);
            scanned += pageCards.length;
            all.push(...pageCards);
        }
        // Normaliza string (case-insensitive + remove acentos)
        const norm = (s) => (s || "")
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase();
        let cards = all.filter((c) => norm(c.title).includes(norm(title || "")));
        // Filtro por responsável + fases (igual ao seu handle atual)
        if (email) {
            cards = cards.filter((card) => card.assignees?.some((a) => a.email === email) &&
                card.current_phase?.name !== 'CONCLUÍDO' &&
                card.current_phase?.name !== 'ENCERRAMENTO');
        }
        // Ordena por data desc
        cards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { cards };
    }
    catch (err) {
        return { error: err.message || 'Erro ao buscar cards por título' };
    }
});
electron_1.ipcMain.handle('saveToken', async (_event, { token }) => {
    try {
        await keytar_1.default.setPassword('Neooh', 'token', token);
        return { success: true };
    }
    catch (error) {
        console.error('Erro ao salvar o token:', error);
        return { success: false, error: 'INTERNAL_ERROR' };
    }
});
electron_1.ipcMain.handle('getToken', async (_event) => {
    try {
        const token = await keytar_1.default.getPassword('Neooh', 'token');
        return { success: true, token };
    }
    catch (error) {
        console.error('Erro ao buscar o token:', error);
        return { success: false, error: 'INTERNAL_ERROR' };
    }
});
