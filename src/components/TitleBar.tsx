import { useEffect, useState } from "react";
import icon from "@/assets/icon.ico";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

const TitleBar = () => {
    const navigate = useNavigate();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const ipc = window.electron?.ipcRenderer;
        if (!ipc) return;

        // pega status inicial
        ipc.invoke?.('whatsapp-get-status')
            .then((data: { connected: boolean; qr: string | null }) => setConnected(!!data?.connected))
            .catch(err => console.error('Erro ao obter status do WhatsApp:', err));

        // handler compatível com on('canal', data) OU on('canal', event, data)
        const handle = (a: any, b?: any) => {
            const data = (b === undefined ? a : b) as { connected: boolean; qr: string | null };
            if (data && typeof data.connected === 'boolean') setConnected(data.connected);
        };

        // evita listeners duplicados (hot reload/dev)
        ipc.removeAllListeners?.('whatsapp-status');
        ipc.on?.('whatsapp-status', handle);

        // (opcional) heartbeat por polling, caso algum evento não chegue
        const interval = setInterval(() => {
            ipc.invoke?.('whatsapp-get-status')
                .then((d: { connected: boolean }) => setConnected(!!d?.connected))
                .catch(() => { });
        }, 30000); // 30s

        return () => {
            clearInterval(interval);
            ipc.removeListener?.('whatsapp-status', handle);
        };
    }, []);

    const handleMinimize = () => window.electron?.ipcRenderer?.send('minimize-window');
    const handleMaximize = () => window.electron?.ipcRenderer?.send('maximize-window');
    const handleClose = () => window.electron?.ipcRenderer?.send('close-window');

    return (
        <div className="h-8 grid grid-cols-3 items-center bg-white/5 absolute w-full -webkit-app-region-drag z-50">
            <div className="flex items-center">
                <img draggable={false} className="h-8 w-8 p-2" src={icon} />
                <p className="text-sm text-neutral-300">Projetos PX</p>
            </div>
            <div className="flex justify-center items-center gap-1">
                <p className="text-xs">Atualização disponível</p>
                <button className="text-[10px] bg-green-600 px-1 py-0.5 rounded hover:opacity-80 cursor-pointer -webkit-app-region-no-drag">Atualize agora</button>
            </div>
            <div className="flex justify-end items-center">
                <div className="flex text-gray-300 -webkit-app-region-no-drag">
                    <div className="flex gap-1 mr-2 items-center cursor-pointer" onClick={() => navigate('/main/whatsapp')}>
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-600' : 'bg-red-700'}`}></div>
                        <p className="text-xs text-gray-100">WhatsApp</p>
                    </div>
                    <button className="px-3 h-8 hover:bg-white/10 outline-none" onClick={handleMinimize}><VscChromeMinimize /></button>
                    <button className="px-3 h-8 hover:bg-white/10" onClick={handleMaximize}><VscChromeMaximize /></button>
                    <button className="px-3 h-8 hover:bg-white/10 hover:text-red-400" onClick={handleClose}><VscChromeClose /></button>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;