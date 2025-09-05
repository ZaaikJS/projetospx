"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLoginFlow = startLoginFlow;
const electron_1 = require("electron");
const keytar_1 = __importDefault(require("keytar"));
const SERVICE_NAME = "Neooh";
const ACCOUNT_ACCESS = "access_token";
const BACKEND_URL = "http://localhost:3000";
async function startLoginFlow() {
    return new Promise((resolve, reject) => {
        const loginUrl = `${BACKEND_URL}/api/auth/signin/google?callbackUrl=${encodeURIComponent(BACKEND_URL + "/api/external/callback")}`;
        electron_1.shell.openExternal(loginUrl);
        // aguardamos deep link do open-url
        electron_1.app.once("open-url", async (event, url) => {
            event.preventDefault();
            console.log("[Auth] Deep link recebido:", url);
            const parsed = new URL(url);
            const ticket = parsed.searchParams.get("ticket");
            const error = parsed.searchParams.get("error");
            if (error) {
                console.error("[Auth] Erro no login:", error);
                return reject(new Error(error));
            }
            if (!ticket) {
                return reject(new Error("ticket não encontrado no deep link"));
            }
            try {
                const r = await fetch(`${BACKEND_URL}/api/external/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ticket }),
                });
                if (!r.ok)
                    throw new Error("Falha ao trocar ticket por token");
                const { access_token, expires_in } = await r.json();
                await keytar_1.default.setPassword(SERVICE_NAME, ACCOUNT_ACCESS, access_token);
                console.log("[Auth] Access token salvo no Keytar");
                // agenda renovação
                setTimeout(refreshAccessToken, (expires_in - 60) * 1000);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
async function refreshAccessToken() {
    // pode implementar chamada ao backend para renovar
    console.log("[Auth] TODO: implementar refresh token via backend");
}
electron_1.ipcMain.handle("auth:getAccessToken", async () => {
    return keytar_1.default.getPassword(SERVICE_NAME, ACCOUNT_ACCESS);
});
