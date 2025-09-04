import { contextBridge, ipcRenderer } from "electron";

const uriListeners = new Map<Function, (...args: any[]) => void>();

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.removeListener(channel, listener),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
    onCustomURL: (callback: (url: string) => void) => {
      const listener = (_event: any, url: string) => callback(url);
      uriListeners.set(callback, listener);
      ipcRenderer.on('uri', listener);
    },

    removeCustomURL: (callback: (url: string) => void) => {
      const listener = uriListeners.get(callback);
      if (listener) {
        ipcRenderer.removeListener('uri', listener);
        uriListeners.delete(callback);
      }
    },

    // Funções específicas
    openLink: (url: string) => ipcRenderer.invoke("open-url", url),
    readFile: (filePath: string): Promise<string> => ipcRenderer.invoke("read-file", filePath),
    writeFile: (filePath: string, data: string): Promise<void> =>
      ipcRenderer.invoke("write-file", filePath, data),

    // Autenticação Microsoft
    logoutMicrosoft: (): Promise<any> => ipcRenderer.invoke("logoutMicrosoft"),
    loginMicrosoft: (): Promise<any> => ipcRenderer.invoke("loginMicrosoft"),
    loadMicrosoft: (): Promise<any> => ipcRenderer.invoke("loadMicrosoft"),

    // Lançamento do Minecraft
    launchMinecraft: (
      version: string,
      type: string,
      loginMode: string | null,
      uuid: string | null,
      name: string | null
    ): Promise<any> => ipcRenderer.invoke("launch-minecraft", version, type, loginMode, uuid, name),

    // Banco de Dados
    cacheDb: {
      put: (table: string, key: string, value: any): Promise<void> =>
        ipcRenderer.invoke("cacheDb:put", table, key, value),
      get: (table: string, key: string): Promise<any> =>
        ipcRenderer.invoke("cacheDb:get", table, key),
      update: (table: string, key: string, value: any): Promise<void> =>
        ipcRenderer.invoke("cacheDb:update", table, key, value),
      delete: (table: string, key: string): Promise<void> =>
        ipcRenderer.invoke("cacheDb:delete", table, key),
    },
    mainDb: {
      insert: (table: string, key: string, value: any): Promise<boolean> =>
        ipcRenderer.invoke("mainDb:insert", table, key, value),
      get: (table: string, key: string): Promise<any> =>
        ipcRenderer.invoke("mainDb:get", table, key),
      update: (table: string, key: string, value: any): Promise<boolean> =>
        ipcRenderer.invoke("mainDb:update", table, key, value),
      delete: (table: string, key: string): Promise<boolean> =>
        ipcRenderer.invoke("mainDb:delete", table, key),
    },
  },
});