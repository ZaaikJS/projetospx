import axios from "axios";

const saveSession = (mode: string, username: string, tagname: string | null, legacyname: string | null, token: string | null): void => {
    window.electron.ipcRenderer.db.put("userData", { 
        loginMode: mode,
        username: username,
        tagName: tagname,
        legacyName: legacyname,
        refreshToken: token
     })
};

const getSession = async (): Promise<string | boolean> => {
    const data = await window.electron.ipcRenderer.db.get("userData");

    if (!data || !data.loginMode) return false;

    switch (data.loginMode) {
        case "voxy":
            return data.username && data.tagName && data.refreshToken ? "voxy" : false;
        case "microsoft":
            return "microsoft";
        case "offline":
            return data.username ? "offline" : false;
        default:
            return false;
    }
};

const destroySession = async () => {
    try {
        const userData = await window.electron.ipcRenderer.db.get("userData");

        if (!userData || !userData.loginMode) return;

        if (userData.loginMode === "voxy" && userData.refreshToken) {
            await axios.post("http://localhost:3000/api/launcher/auth/logout", {
                refreshToken: userData.refreshToken,
            });
        }
    } catch (error: any) {
        console.log("An internal error occurred:", error);
    } finally {
        await window.electron.ipcRenderer.db.put("userData", null);
    }
};

const getData = async (key: string): Promise<string | null> => {
    const userData = await window.electron.ipcRenderer.db.get("userData");
    return userData ? userData[key] ?? null : null;
};

export default { saveSession, getSession, destroySession, getData };