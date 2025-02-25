import React, { useState, useEffect } from "react";

export default function Backend() {
  const [progress, setProgress] = useState({ current: 0, total: 0, type: "" });
  const [minecraftRunning, setMinecraftRunning] = useState(false);

  useEffect(() => {
    // Ouvir eventos de progresso
    window.electron.ipcRenderer.on("download-progress", (event, data) => {
      setProgress(data);
    });

    // Ouvir eventos de conclusão
    window.electron.ipcRenderer.on("download-complete", (event, data) => {
      setProgress({ current: 0, total: 0, type: "" }); // Resetar progresso
    });

    window.electron.ipcRenderer.on("minecraft-started", () => {
        setMinecraftRunning(true);
      });
  
      window.electron.ipcRenderer.on("minecraft-closed", () => {
        setMinecraftRunning(false);
    });

    // Limpar listeners ao desmontar o componente
    return () => {
      window.electron.ipcRenderer.removeAllListeners("download-progress");
      window.electron.ipcRenderer.removeAllListeners("download-complete");
    };
  }, []);

  const handleLaunch = async (version: string, loginMode: string | null, uuid: string | null, name: string | null) => {
    try {
      const result = await window.electron.ipcRenderer.launchMinecraft(version, loginMode, uuid, name);
      if (result.success) {
      } else {
        alert("Erro ao iniciar Minecraft: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao lançar Minecraft:", error);
    }
  };

  const handleLoginMicrosoft = async () => {
    try {
      const result = await window.electron.ipcRenderer.loginMicrosoft();
      if (result.success) {
        const { authorization } = result;
        return authorization;
      }
      const { error } = result;
      switch (error) {
        case "error.gui.closed":
          break;
        case "error.auth.xsts.userNotFound":
          break;
        default:
          alert("Ocorreu um erro inesperado. Tente novamente.");
          console.error("Erro desconhecido:", error);
      }
    } catch (error) {
      console.error("Ocorreu um erro ao tentar logar:", error);
    }
  };

  const handleLogoutMicrosoft = async () => {
    try {
      const result = await window.electron.ipcRenderer.logoutMicrosoft();
      if (result.success) {
        console.log("Logout realizado!");
      } else {
        console.log("Erro ao sair: " + result.error);
      }
    } catch (error) {
      console.error("Ocorreu um erro:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-black/80 p-8 px-32">
      <button onClick={() => handleLoginMicrosoft()}>Login Microsoft</button>
      <button onClick={() => handleLogoutMicrosoft()}>Sair Microsoft</button>
      <button onClick={() => handleLaunch("1.8.9", "offline", "00000000-0000-0000-0000-000000000000", "Zaaik3843")}>
        Iniciar Minecraft 1.8.9
      </button>
      <button onClick={() => handleLaunch("1.20.1", null, null, null)}>Iniciar Minecraft 1.20.1</button>

      <div className="mt-4">
        <p>Status do Minecraft: {minecraftRunning ? "Em execução" : "Parado"}</p>
      </div>
      <div className={`mt-4 ${progress.current < 1 && 'hidden'}`}>
        <h3>Progresso do Download: {progress.type}</h3>
        <progress value={progress.current} max={progress.total} className="w-full" />
        <p>
          {progress.current} / {progress.total} arquivos
        </p>
      </div>
    </div>
  );
}