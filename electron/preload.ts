import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),

    // Funções específicas
    openLink: (url: string) => ipcRenderer.invoke("open-link", url),
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

    // Banco de Dados (LMDB)
    db: {
      put: (table: string, key: string, value: any): Promise<void> =>
        ipcRenderer.invoke("db:put", table, key, value),

      get: (table: string, key: string): Promise<any> =>
        ipcRenderer.invoke("db:get", table, key),

      delete: (table: string, key: string): Promise<void> =>
        ipcRenderer.invoke("db:delete", table, key),
    },
  },
});