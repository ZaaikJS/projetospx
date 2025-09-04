import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import * as wppconnect from '@wppconnect-team/wppconnect';
import {
  Whatsapp,
  CreateConfig,
  CreateOptions,
  tokenStore, // namespace que contém FileTokenStore
} from '@wppconnect-team/wppconnect';
import puppeteer from 'puppeteer';

let client: Whatsapp | null = null;
let qrCodeData: string | null = null;
let mainWindow: BrowserWindow;

// Evita inicializar mais de uma vez
let initializing = false;

interface WhatsappStatus {
  connected: boolean;
  qr: string | null;
}

interface CreateGroupOptions {
  groupName: string;
  groupDesc?: string;
  participants: string[];
}

interface CreateGroupResult {
  groupId: string;
  participants: string[];
}

function pushStatus(status: WhatsappStatus) {
  try {
    mainWindow?.webContents?.send('whatsapp-status', status);
  } catch (e) {
    console.warn('Falha ao enviar whatsapp-status ao renderer:', e);
  }
}

export async function initWhatsapp(window: BrowserWindow) {
  // Se já temos cliente conectado ou em inicialização, não reinicializa
  if (client || initializing) return;
  initializing = true;

  mainWindow = window;

  // ✅ Registra os handlers IMEDIATAMENTE (antes de qualquer await)
  setupIpcHandlers();

  // Diretório persistente para tokens (por usuário do SO)
  const tokenDir = path.join(app.getPath('userData'), 'wppconnect-tokens');
  const store = new tokenStore.FileTokenStore({
    path: tokenDir, // caminho ABSOLUTO e estável
  });

  const config: CreateConfig = {
    headless: true,
    useChrome: false,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    puppeteerOptions: { executablePath: puppeteer.executablePath() },
    autoClose: 0,
    logQR: false,
  };

  const options: CreateOptions = {
    session: 'neooh',
    tokenStore: store, // <- ESSENCIAL para reusar o login
    // QR gerado/renovado → ainda não conectado
    catchQR: (base64Qrimg: string | null, asciiQR?: string) => {
      qrCodeData = base64Qrimg;
      console.log('QR Code gerado/atualizado');
      if (asciiQR) console.log(asciiQR);
      pushStatus({ connected: false, qr: base64Qrimg });
    },
    statusFind: undefined,
    onLoadingScreen: undefined,
    catchLinkCode: undefined,
    ...config,
  };

  try {
    const _client = await wppconnect.create(options);
    client = _client;
    qrCodeData = null;
    console.log('WhatsApp conectado!');
    pushStatus({ connected: true, qr: null });

    // === LISTENERS DE STATUS EM TEMPO REAL ===

    // 1) Mudanças de estado (ex.: CONNECTED, PAIRING, TIMEOUT, etc.)
    client.onStateChange?.((state: string) => {
      const s = String(state || '').toUpperCase();
      console.log('[onStateChange]', s);

      if (s.includes('CONNECTED') || s === 'OPEN' || s === 'SYNCED') {
        qrCodeData = null;
        pushStatus({ connected: true, qr: null });
      } else if (
        s.includes('DISCONNECTED') ||
        s.includes('CONFLICT') ||
        s.includes('UNPAIRED') ||
        s.includes('LOGOUT') ||
        s.includes('CLOSE')
      ) {
        pushStatus({ connected: false, qr: null });
      }
    });

    // 2) Mudanças de stream (ex.: CONNECTED/DISCONNECTED/SYNCING)
    client.onStreamChange?.((state: string) => {
      const s = String(state || '').toUpperCase();
      console.log('[onStreamChange]', s);

      if (s === 'CONNECTED') {
        pushStatus({ connected: true, qr: null });
      } else if (s === 'DISCONNECTED' || s === 'RESUMING' || s === 'SYNCING') {
        pushStatus({ connected: false, qr: null });
      }
    });

    // 3) Logout/removido (algumas versões expõem onLogout/onRemoved)
    (client as any).onLogout?.(() => {
      console.log('[onLogout]');
      client = null;
      pushStatus({ connected: false, qr: null });
    });

    (client as any).onRemoved?.(() => {
      console.log('[onRemoved]');
      client = null;
      pushStatus({ connected: false, qr: null });
    });

    // 4) Browser/WS caiu (guarda-chuva)
    try {
      client.page?.browser()?.on('disconnected', () => {
        console.log('[puppeteer:browser:disconnected]');
        pushStatus({ connected: false, qr: null });
      });
    } catch {}

    // 5) (Opcional) heartbeat por polling
    // setInterval(async () => {
    //   try {
    //     const st = await client?.getConnectionState?.(); // retorna string
    //     const ok = String(st || '').toUpperCase().includes('CONNECTED');
    //     pushStatus({ connected: ok, qr: ok ? null : qrCodeData });
    //   } catch {}
    // }, 15000);
  } catch (err) {
    console.error('Erro ao conectar WhatsApp:', err);
    pushStatus({ connected: false, qr: qrCodeData });
  } finally {
    initializing = false;
  }
}

function setupIpcHandlers() {
  ipcMainRemoveHandlerSafe('whatsapp-get-status');
  ipcMainRemoveHandlerSafe('whatsapp-create-group');

  ipcMain.handle('whatsapp-get-status', async (): Promise<WhatsappStatus> => {
    let connected = !!client;
    try {
      const st = await client?.getConnectionState?.();
      if (st) connected = String(st).toUpperCase().includes('CONNECTED');
    } catch {}
    return { connected, qr: connected ? null : qrCodeData };
  });

  ipcMain.handle(
    'whatsapp-create-group',
    async (_event: IpcMainInvokeEvent, options: CreateGroupOptions): Promise<CreateGroupResult> => {
      try {
        if (!client) throw new Error('WhatsApp não conectado');

        const formattedParticipants = options.participants
          .map((num) => num.replace(/\D/g, '') + '@c.us')
          .filter((num) => num.length > 6);

        if (formattedParticipants.length === 0) throw new Error('Nenhum participante válido');

        const response = await client.createGroup(options.groupName, formattedParticipants);
        const groupId = (response as any).gid?._serialized;

        if (!groupId) throw new Error('Não foi possível obter o ID do grupo');

        if (options.groupDesc) {
          await client.setGroupDescription(groupId, options.groupDesc);
        }

        const participants = Object.values((response as any).participants).map((p: any) => p.wid);
        return { groupId, participants };
      } catch (err: any) {
        console.error('Erro ao criar grupo:', err);
        throw new Error(err?.message || 'Erro desconhecido ao criar grupo');
      }
    }
  );

    ipcMain.handle(
    'whatsapp-create-group-per-id',
    async (_event: IpcMainInvokeEvent, options: CreateGroupOptions): Promise<CreateGroupResult> => {
      try {
        if (!client) throw new Error('WhatsApp não conectado');

        const formattedParticipants = options.participants
          .map((num) => num.replace(/\D/g, '') + '@c.us')
          .filter((num) => num.length > 6);

        if (formattedParticipants.length === 0) throw new Error('Nenhum participante válido');

        const response = await client.createGroup(options.groupName, formattedParticipants);
        const groupId = (response as any).gid?._serialized;

        if (!groupId) throw new Error('Não foi possível obter o ID do grupo');

        if (options.groupDesc) {
          await client.setGroupDescription(groupId, options.groupDesc);
        }

        const participants = Object.values((response as any).participants).map((p: any) => p.wid);
        return { groupId, participants };
      } catch (err: any) {
        console.error('Erro ao criar grupo:', err);
        throw new Error(err?.message || 'Erro desconhecido ao criar grupo');
      }
    }
  );
}

/**
 * Remove um handler existente (evita "Error: Attempted to register a second handler")
 */
function ipcMainRemoveHandlerSafe(channel: string) {
  try {
    // @ts-ignore - API privada usada por segurança
    if ((ipcMain as any)._invokeHandlers?.has(channel)) {
      ipcMain.removeHandler(channel);
    } else {
      ipcMain.removeHandler(channel);
    }
  } catch {
    try {
      ipcMain.removeHandler(channel);
    } catch {}
  }
}

/**
 * Gerencia histórico de criação de grupos (ADICIONAR ACCESSTOKEN NA REQUISIÇÃO POR SEGURANÇA)
 */
