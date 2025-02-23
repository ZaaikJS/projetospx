import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
const { shell } = require('electron');
import fs from 'fs';
import { Client } from "minecraft-launcher-core";
import { Auth } from "msmc";
import keytar from 'keytar';

const SERVICE_NAME = "MinecraftLauncher";
const ACCOUNT_NAME = "user_session";

function createWindow() {
  const win = new BrowserWindow({
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
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  ipcMain.on('minimize-window', () => win.minimize());
  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('close-window', () => win.close());

  ipcMain.handle('open-link', async (_, url) => {
    shell.openExternal(url);
  })
}

const launcher = new Client();

async function loadSession() {
  const data = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

async function saveSession(session: any) {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(session));
}

let authorization: any;

ipcMain.handle("loginMicrosoft", async () => {
  try {
    const authManager = new Auth("select_account");
    const xboxManager = await authManager.launch("electron");
    const token = await xboxManager.getMinecraft();
    authorization = token.mclc();

    await saveSession(authorization);

    return { success: true, authorization };
  } catch (error: any) {
    console.error("Erro ao autenticar com a Microsoft:", error);
    return { success: false, error: error || "Erro desconhecido" };
  }
});

ipcMain.handle("logoutMicrosoft", async () => {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
});

ipcMain.handle("loadMicrosoft", async () => {
  await loadSession();
});

ipcMain.handle("launch-minecraft", async (_event, version, loginMode, uuid, name) => {
  try {

    let session = await loadSession();

    if (loginMode === "offline") {
      authorization = {
        name,
        uuid,
        access_token: "offline",
      }
    } else if (session) {
      console.log("Sessão encontrada, reutilizando...");
      authorization = session;
    } else {
      console.log('Sessão não encontrada.')
    }

    let opts = {
      clientPackage: null,
      authorization,
      root: path.join(app.getPath("appData"), "VoxyLauncherDev", "data"),
      version: {
        number: version,
        type: "release",
      },
      memory: {
        max: "6G",
        min: "4G",
      }
      /*
      quickPlay: {
        type: "legacy",
        identifier: "play.hypixel.net",
      }, */
    };

    console.log("Iniciando Minecraft...");
    launcher.launch(opts as any);

    launcher.on("data", (e) => console.log(e.toString()));
    launcher.on("close", (e) => console.log(`Minecraft fechado com código ${e}`));

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao iniciar o Minecraft:", error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ipcMain.handle('read-file', async (event, fileName) => {
  const filePath = path.join(app.getPath('appData'), 'VoxyLauncherDev', fileName);
  try {
    ensureDirectoryExists(filePath);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler o arquivo:', error);
    throw error;
  }
});

ipcMain.handle('write-file', async (event, fileName, data) => {
  const filePath = path.join(app.getPath('appData'), 'VoxyLauncherDev', fileName);
  try {
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao escrever no arquivo:', error);
    throw error;
  }
});
