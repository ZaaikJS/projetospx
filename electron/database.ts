import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";

let cacheDb: DatabaseType;
let mainDb: DatabaseType;

export function initializeDatabases() {
  const basePath = path.join(app.getPath('userData'));
  const cacheDbPath = path.join(basePath, "Data", "local");
  const mainDbPath = path.join(basePath, "Data", "main");

  fs.mkdirSync(path.dirname(cacheDbPath), { recursive: true });
  fs.mkdirSync(path.dirname(mainDbPath), { recursive: true });

  cacheDb = new Database(cacheDbPath);
  mainDb = new Database(mainDbPath);
}

function ensureTableExists(tableName: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw new Error("Invalid table name!");

  cacheDb.exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

function ensureMainTableExists(tableName: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw new Error("Invalid table name!");

  mainDb.exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      value TEXT NOT NULL
    )
  `);
}

type IPCHandler = (_: Electron.IpcMainInvokeEvent, table: string, key: string, value?: never, subKey?: string) => Promise<never>;

ipcMain.handle("cacheDb:put", (async (_, table, key, value) => {
  ensureTableExists(table);
  cacheDb.prepare(`
    INSERT INTO ${table} (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, JSON.stringify(value));
  return true;
}) as IPCHandler);

ipcMain.handle("cacheDb:get", (async (_, table, key, subKey) => {
  ensureTableExists(table);
  const row = cacheDb.prepare(`SELECT value FROM ${table} WHERE key = ?`).get(key);
  if (row) {
    const data = JSON.parse((row as { value: string }).value);
    return subKey && typeof data === "object" ? data[subKey] : data;
  }
  return null;
}) as IPCHandler);

ipcMain.handle("cacheDb:delete", (async (_, table, key) => {
  ensureTableExists(table);
  cacheDb.prepare(`DELETE FROM ${table} WHERE key = ?`).run(key);
  return true;
}) as IPCHandler);

ipcMain.handle("cacheDb:update", (async (_, table, key, value) => {
  ensureTableExists(table);
  const result = cacheDb.prepare(`
    UPDATE ${table} SET value = ? WHERE key = ?
  `).run(JSON.stringify(value), key);
  return result.changes > 0;
}) as IPCHandler);

ipcMain.handle("mainDb:insert", (async (_, table, key, value) => {
  ensureMainTableExists(table);
  mainDb.prepare(`
    INSERT INTO ${table} (key, value) VALUES (?, ?)
  `).run(key, JSON.stringify(value));
  return true;
}) as IPCHandler);

ipcMain.handle("mainDb:get", (async (_, table, key) => {
  ensureMainTableExists(table);
  const row = mainDb.prepare(`SELECT value FROM ${table} WHERE key = ?`).get(key);
  return row ? JSON.parse((row as { value: string }).value) : null;
}) as IPCHandler);

ipcMain.handle("mainDb:update", (async (_, table, key, value) => {
  ensureMainTableExists(table);
  mainDb.prepare(`
    UPDATE ${table} SET value = ? WHERE key = ?
  `).run(JSON.stringify(value), key);
  return true;
}) as IPCHandler);

ipcMain.handle("mainDb:delete", (async (_, table, key) => {
  ensureMainTableExists(table);
  mainDb.prepare(`DELETE FROM ${table} WHERE key = ?`).run(key);
  return true;
}) as IPCHandler);