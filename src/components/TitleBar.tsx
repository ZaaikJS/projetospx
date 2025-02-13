import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from "react-icons/vsc";

const TitleBar = () => {
    const handleMinimize = () => {
        window.electron.ipcRenderer.send('minimize-window');
    };

    const handleMaximize = () => {
        window.electron.ipcRenderer.send('maximize-window');
    };

    const handleClose = () => {
        window.electron.ipcRenderer.send('close-window');
    };

    return (
        <div className="h-8 grid grid-cols-3 items-center absolute w-full bg-white/5 -webkit-app-region-drag z-50">
            <div className="flex items-center">
                <img className="h-8 w-8 p-2" src="icon.ico" />
                <p className="text-sm text-neutral-300">Voxy Launcher</p>
            </div>
            <div className="">

            </div>
            <div className="flex justify-end">
                <div className="flex text-gray-300 -webkit-app-region-no-drag">
                    <button className="px-3 h-8 hover:bg-white/10 outline-none" onClick={handleMinimize}><VscChromeMinimize /></button>
                    <button className="px-3 h-8 hover:bg-white/10" onClick={handleMaximize}><VscChromeMaximize /></button>
                    <button className="px-3 h-8 hover:bg-white/10 hover:text-red-400" onClick={handleClose}><VscChromeClose /></button>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;