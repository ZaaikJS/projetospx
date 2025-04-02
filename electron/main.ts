import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
const { shell } = require('electron');
import fs from 'fs';
import { Client } from "minecraft-launcher-core";
import { Auth } from "msmc";

import Database from "better-sqlite3";

import keytar from 'keytar';

const SERVICE_NAME = "VoxyLauncher";
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

let logWindow: BrowserWindow | null = null;

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
    logWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "console",
    });
  }

  logWindow.on("closed", () => {
    logWindow = null;
  });
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

ipcMain.handle("launch-minecraft", async (event, version, type, loginMode, uuid, name) => {
  try {
    let session = await loadSession();

    if (loginMode === "offline" || loginMode === "voxy") {
      authorization = {
        name,
        uuid,
        access_token: "offline",
      };
    } else if (session) {
      console.log("Sessão encontrada, reutilizando...");
      authorization = session;
      console.log(session)
    } else {
      console.log("Sessão não encontrada.");
    }

    let opts = {
      clientPackage: null,
      authorization,
      root: path.join(app.getPath("appData"), "VoxyLauncherDev"),
      version: {
        number: version,
        type,
      },
      javaPath: path.join(app.getPath("appData"), "VoxyLauncherDev", "runtime", "jdk-24", "bin", "java.exe"),
      memory: {
        max: "6G",
        min: "4G",
      },
    };

    launcher.launch(opts as any);

    event.sender.send("minecraft-started");

    launcher.on("data", (log) => {
      if (logWindow) {
        logWindow.webContents.send("consoleLog", { console: log });
      }
    });

    launcher.on("progress", (progress) => {
      if (progress.total > 0) {
        event.sender.send("download-progress", {
          current: progress.task,
          total: progress.total,
          type: progress.type,
        });

        if (progress.task >= progress.total) {
          event.sender.send("download-complete", { type: progress.type });
        }
      }
    });

    launcher.on("close", () => {
      event.sender.send("minecraft-closed");
      if (logWindow) {
        logWindow.close();
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao iniciar o Minecraft:", error);
    return { success: false, error: error.message };
  }
});

const cacheDbPath: string = path.join(app.getPath("appData"), "VoxyLauncherDev", "data", "local");
const mainDbPath: string = path.join(app.getPath("appData"), "VoxyLauncherDev", "data", "main");

const cacheDb = new Database(cacheDbPath);
const mainDb = new Database(mainDbPath);

const ensureTableExists = (tableName: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error("Invalid table name!");
  }

  cacheDb.exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
};

const ensureMainTableExists = (tableName: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error("Invalid table name!");
  }

  mainDb.exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      value TEXT NOT NULL
    )
  `);
};

type IPCHandler = (_: Electron.IpcMainInvokeEvent, table: string, key: string, value?: any, subKey?: string) => Promise<any>;

ipcMain.handle("cacheDb:put", (async (_, table: string, key: string, value: any) => {
  ensureTableExists(table);
  const stmt = cacheDb.prepare(`
    INSERT INTO ${table} (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, JSON.stringify(value));
  return true;
}) as IPCHandler);

ipcMain.handle("cacheDb:get", (async (_, table: string, key: string, subKey?: string) => {
  ensureTableExists(table);
  const stmt = cacheDb.prepare(`SELECT value FROM ${table} WHERE key = ?`);
  const row = stmt.get(key) as { value: string } | undefined;

  if (row) {
    const data = JSON.parse(row.value);
    return subKey && typeof data === "object" ? data[subKey] : data;
  }

  return null;
}) as IPCHandler);

ipcMain.handle("cacheDb:delete", (async (_, table: string, key: string) => {
  ensureTableExists(table);
  const stmt = cacheDb.prepare(`DELETE FROM ${table} WHERE key = ?`);
  stmt.run(key);
  return true;
}) as IPCHandler);

ipcMain.handle("cacheDb:update", (async (_, table: string, key: string, value: any) => {
  ensureTableExists(table);
  const stmt = cacheDb.prepare(`
    UPDATE ${table} 
    SET value = ? 
    WHERE key = ?
  `);
  const result = stmt.run(JSON.stringify(value), key);

  return result.changes > 0;
}) as IPCHandler);


ipcMain.handle("mainDb:insert", (async (_, table: string, key: string, value: any) => {
  ensureMainTableExists(table);
  const stmt = mainDb.prepare(`
    INSERT INTO ${table} (key, value) VALUES (?, ?)
  `);
  stmt.run(key, JSON.stringify(value));
  return true;
}) as IPCHandler);

ipcMain.handle("mainDb:get", (async (_, table: string, key: string) => {
  ensureMainTableExists(table);
  const stmt = mainDb.prepare(`SELECT value FROM ${table} WHERE key = ?`);
  const row = stmt.get(key) as { value: string } | undefined;
  return row ? JSON.parse(row.value) : null;
}) as IPCHandler);

ipcMain.handle("mainDb:update", (async (_, table: string, key: string, value: any) => {
  ensureMainTableExists(table);
  const stmt = mainDb.prepare(`
    UPDATE ${table} SET value = ? WHERE key = ?
  `);
  stmt.run(JSON.stringify(value), key);
  return true;
}) as IPCHandler);

ipcMain.handle("mainDb:delete", (async (_, table: string, key: string) => {
  ensureMainTableExists(table);
  const stmt = mainDb.prepare(`DELETE FROM ${table} WHERE key = ?`);
  stmt.run(key);
  return true;
}) as IPCHandler);

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
