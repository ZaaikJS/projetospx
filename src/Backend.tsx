export default function Backend() {
    const handleLaunch = async (version: string, loginMode: string | null, uuid: string | null, name: string | null) => {
        try {
            const result = await window.electron.ipcRenderer.launchMinecraft(version, loginMode, uuid, name);
            if (result.success) {
                alert(`Minecraft versão ${version} iniciado com sucesso!`);
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
                console.log('Login realizado!')
            } else {
                console.log("Erro ao logar: " + result.error);
            }
        } catch (error) {
            console.error("Ocorreu um erro:", error);
        }
    };

    const handleLogoutMicrosoft = async () => {
        try {
            const result = await window.electron.ipcRenderer.logoutMicrosoft();
            if (result.success) {
                console.log('Logout realizado!')
            } else {
                console.log("Erro ao sair: " + result.error);
            }
        } catch (error) {
            console.error("Ocorreu um erro:", error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <button onClick={() => handleLoginMicrosoft()}>Login microsoft</button>
            <button onClick={() => handleLogoutMicrosoft()}>Sair microsoft</button>
            <button onClick={() => handleLaunch("1.8.9", "offline", "00000000-0000-0000-0000-000000000000", "Zaaik3843")}>Iniciar Minecraft 1.8.9</button>
            <button onClick={() => handleLaunch("1.20.1", null, null, null)}>Iniciar Minecraft 1.20.1</button>
        </div>
    );
}
