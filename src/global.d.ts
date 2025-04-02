declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, ...args: any[]): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        removeAllListeners(channel: string): void;

        // Funções específicas
        openLink(url: string): Promise<void>;
        readFile(filePath: string): Promise<string>;
        writeFile(filePath: string, data: string): Promise<void>;

        // Autenticação Microsoft
        logoutMicrosoft(): Promise<any>;
        loginMicrosoft(): Promise<any>;
        loadMicrosoft(): Promise<any>;

        // Lançamento do Minecraft
        launchMinecraft(
          version: string,
          type: string,
          loginMode: string | null,
          uuid: string | null,
          name: string | null
        ): Promise<any>;

        // Banco de Dados
        cacheDb: {
          put(table: string, key: string, value: any): Promise<void>;
          get(table: string, key: string): Promise<any>;
          update(table: string, key: string, value: any): Promise<void>;
          delete(table: string, key: string): Promise<void>;
        };
        mainDb: {
          insert(table: string, key: string, value: any): Promise<boolean>;
          get(table: string, key: string): Promise<any>;
          update(table: string, key: string, value: any): Promise<boolean>;
          delete(table: string, key: string): Promise<boolean>;
        };
      };
    };
  }
}

export { };  