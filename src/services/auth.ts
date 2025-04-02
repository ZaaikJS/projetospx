import axios from "axios";
interface SessionData {
    loginMode: string;
    username: string;
    tagName: string | null;
    refreshToken: string | null;
  }
  
  const saveSession = async (
    mode: string,
    username: string,
    tagname: string | null,
    token: string | null
  ): Promise<void> => {
    await window.electron.ipcRenderer.cacheDb.put("userData", "userData", { 
      loginMode: mode,
      username,
      tagName: tagname,
      refreshToken: token,
    });
  
    if (token) {
      localStorage.setItem("refreshToken", token);
    }
  };
  
  const updateSession = async (field: keyof SessionData, value: any): Promise<void> => {
    const currentSession = await window.electron.ipcRenderer.cacheDb.get("userData", "userData");
  
    if (!currentSession) {
      console.warn("Nenhuma sessão encontrada para atualizar.");
      return;
    }
  
    const updatedSession = { ...currentSession, [field]: value };
  
    await window.electron.ipcRenderer.cacheDb.update("userData", "userData", updatedSession);
  
    if (field === "refreshToken" && value) {
      localStorage.setItem("refreshToken", value);
    }
  };
  
  const getSession = async (): Promise<string | boolean> => {
    const data = await window.electron.ipcRenderer.cacheDb.get("userData", "userData");
  
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
      const userData = await window.electron.ipcRenderer.cacheDb.get("userData", "userData");
  
      if (!userData || !userData.loginMode) return;
  
      if (userData.loginMode === "voxy" && userData.refreshToken) {
        await axios.post("https://voxymc.net/api/launcher/auth/logout", {
          refreshToken: userData.refreshToken,
        });
      }
    } catch (error: any) {
      console.log("An internal error occurred:", error);
    } finally {
      await window.electron.ipcRenderer.cacheDb.put("userData", "userData", null);
      localStorage.removeItem("refreshToken");
    }
  };
  
  const getData = async (): Promise<Record<string, any> | null> => {
    const userData = await window.electron.ipcRenderer.cacheDb.get("userData", "userData");
    return userData ?? null;
  };
  
  export default { saveSession, updateSession, getSession, destroySession, getData };
  