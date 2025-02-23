import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args), // Adicionando invoke
    openLink: (url: string) => ipcRenderer.invoke("open-link", url),
    readFile: (filePath: string): Promise<string> => ipcRenderer.invoke("read-file", filePath),
    writeFile: (filePath: string, data: string): Promise<void> => ipcRenderer.invoke("write-file", filePath, data),
    logoutMicrosoft: (): Promise<any> => ipcRenderer.invoke("logoutMicrosoft"),
    loginMicrosoft: (): Promise<any> => ipcRenderer.invoke("loginMicrosoft"),
    loadMicrosoft: (): Promise<any> => ipcRenderer.invoke("loadMicrosoft"),
    launchMinecraft: (version: string, loginMode: string | null, uuid: string | null, name: string | null): Promise<any> => ipcRenderer.invoke("launch-minecraft", version, loginMode, uuid, name),
  },
});
