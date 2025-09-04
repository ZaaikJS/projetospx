import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

ipcMain.handle('read-file', async (event, fileName) => {
    const filePath = path.join(app.getPath('appData'), 'VoxyLauncherDev', fileName);
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Erro ao escrever no arquivo:', error);
      throw error;
    }
  });