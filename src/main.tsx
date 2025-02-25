import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/global.scss'
import App from './App.tsx'

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, ...args: any[]): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
        openLink(url: string): Promise<void>;
        readFile(filePath: string): Promise<string>;
        writeFile(filePath: string, data: string): Promise<void>;
        logoutMicrosoft(): Promise<any>;
        loginMicrosoft(): Promise<any>;
        loadMicrosoft(): Promise<any>;
        launchMinecraft(
          version: string,
          loginMode: string | null,
          uuid: string | null,
          name: string | null
        ): Promise<any>;
      };
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
