"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWhatsapp = initWhatsapp;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const wppconnect = __importStar(require("@wppconnect-team/wppconnect"));
const wppconnect_1 = require("@wppconnect-team/wppconnect");
const puppeteer_1 = __importDefault(require("puppeteer"));
let client = null;
let qrCodeData = null;
let mainWindow;
// Evita inicializar mais de uma vez
let initializing = false;
function pushStatus(status) {
    try {
        mainWindow?.webContents?.send('whatsapp-status', status);
    }
    catch (e) {
        console.warn('Falha ao enviar whatsapp-status ao renderer:', e);
    }
}
async function initWhatsapp(window) {
    // Se já temos cliente conectado ou em inicialização, não reinicializa
    if (client || initializing)
        return;
    initializing = true;
    mainWindow = window;
    // ✅ Registra os handlers IMEDIATAMENTE (antes de qualquer await)
    setupIpcHandlers();
    // Diretório persistente para tokens (por usuário do SO)
    const tokenDir = path_1.default.join(electron_1.app.getPath('userData'), 'wppconnect-tokens');
    const store = new wppconnect_1.tokenStore.FileTokenStore({
        path: tokenDir, // caminho ABSOLUTO e estável
    });
    const config = {
        headless: true,
        useChrome: false,
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
        puppeteerOptions: { executablePath: puppeteer_1.default.executablePath() },
        autoClose: 0,
        logQR: false,
    };
    const options = {
        session: 'neooh',
        tokenStore: store, // <- ESSENCIAL para reusar o login
        // QR gerado/renovado → ainda não conectado
        catchQR: (base64Qrimg, asciiQR) => {
            qrCodeData = base64Qrimg;
            console.log('QR Code gerado/atualizado');
            if (asciiQR)
                console.log(asciiQR);
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
        client.onStateChange?.((state) => {
            const s = String(state || '').toUpperCase();
            console.log('[onStateChange]', s);
            if (s.includes('CONNECTED') || s === 'OPEN' || s === 'SYNCED') {
                qrCodeData = null;
                pushStatus({ connected: true, qr: null });
            }
            else if (s.includes('DISCONNECTED') ||
                s.includes('CONFLICT') ||
                s.includes('UNPAIRED') ||
                s.includes('LOGOUT') ||
                s.includes('CLOSE')) {
                pushStatus({ connected: false, qr: null });
            }
        });
        // 2) Mudanças de stream (ex.: CONNECTED/DISCONNECTED/SYNCING)
        client.onStreamChange?.((state) => {
            const s = String(state || '').toUpperCase();
            console.log('[onStreamChange]', s);
            if (s === 'CONNECTED') {
                pushStatus({ connected: true, qr: null });
            }
            else if (s === 'DISCONNECTED' || s === 'RESUMING' || s === 'SYNCING') {
                pushStatus({ connected: false, qr: null });
            }
        });
        // 3) Logout/removido (algumas versões expõem onLogout/onRemoved)
        client.onLogout?.(() => {
            console.log('[onLogout]');
            client = null;
            pushStatus({ connected: false, qr: null });
        });
        client.onRemoved?.(() => {
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
        }
        catch { }
        // 5) (Opcional) heartbeat por polling
        // setInterval(async () => {
        //   try {
        //     const st = await client?.getConnectionState?.(); // retorna string
        //     const ok = String(st || '').toUpperCase().includes('CONNECTED');
        //     pushStatus({ connected: ok, qr: ok ? null : qrCodeData });
        //   } catch {}
        // }, 15000);
    }
    catch (err) {
        console.error('Erro ao conectar WhatsApp:', err);
        pushStatus({ connected: false, qr: qrCodeData });
    }
    finally {
        initializing = false;
    }
}
function setupIpcHandlers() {
    ipcMainRemoveHandlerSafe('whatsapp-get-status');
    ipcMainRemoveHandlerSafe('whatsapp-create-group');
    electron_1.ipcMain.handle('whatsapp-get-status', async () => {
        let connected = !!client;
        try {
            const st = await client?.getConnectionState?.();
            if (st)
                connected = String(st).toUpperCase().includes('CONNECTED');
        }
        catch { }
        return { connected, qr: connected ? null : qrCodeData };
    });
    electron_1.ipcMain.handle('whatsapp-create-group', async (_event, options) => {
        try {
            if (!client)
                throw new Error('WhatsApp não conectado');
            const formattedParticipants = options.participants
                .map((num) => num.replace(/\D/g, '') + '@c.us')
                .filter((num) => num.length > 6);
            if (formattedParticipants.length === 0)
                throw new Error('Nenhum participante válido');
            const response = await client.createGroup(options.groupName, formattedParticipants);
            const groupId = response.gid?._serialized;
            if (!groupId)
                throw new Error('Não foi possível obter o ID do grupo');
            if (options.groupDesc) {
                await client.setGroupDescription(groupId, options.groupDesc);
            }
            const participants = Object.values(response.participants).map((p) => p.wid);
            return { groupId, participants };
        }
        catch (err) {
            console.error('Erro ao criar grupo:', err);
            throw new Error(err?.message || 'Erro desconhecido ao criar grupo');
        }
    });
    electron_1.ipcMain.handle('whatsapp-create-group-per-id', async (_event, options) => {
        try {
            if (!client)
                throw new Error('WhatsApp não conectado');
            const formattedParticipants = options.participants
                .map((num) => num.replace(/\D/g, '') + '@c.us')
                .filter((num) => num.length > 6);
            if (formattedParticipants.length === 0)
                throw new Error('Nenhum participante válido');
            const response = await client.createGroup(options.groupName, formattedParticipants);
            const groupId = response.gid?._serialized;
            if (!groupId)
                throw new Error('Não foi possível obter o ID do grupo');
            if (options.groupDesc) {
                await client.setGroupDescription(groupId, options.groupDesc);
            }
            const participants = Object.values(response.participants).map((p) => p.wid);
            return { groupId, participants };
        }
        catch (err) {
            console.error('Erro ao criar grupo:', err);
            throw new Error(err?.message || 'Erro desconhecido ao criar grupo');
        }
    });
}
/**
 * Remove um handler existente (evita "Error: Attempted to register a second handler")
 */
function ipcMainRemoveHandlerSafe(channel) {
    try {
        // @ts-ignore - API privada usada por segurança
        if (electron_1.ipcMain._invokeHandlers?.has(channel)) {
            electron_1.ipcMain.removeHandler(channel);
        }
        else {
            electron_1.ipcMain.removeHandler(channel);
        }
    }
    catch {
        try {
            electron_1.ipcMain.removeHandler(channel);
        }
        catch { }
    }
}
/**
 * Gerencia histórico de criação de grupos (ADICIONAR ACCESSTOKEN NA REQUISIÇÃO POR SEGURANÇA)
 */
