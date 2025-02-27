import { useLocation } from "react-router-dom";
import logo from '../assets/images/logo.png';
import logoV from '../assets/images/logo_v.png';
import mcLogo from '../assets/images/mc-logo.png';
import playVoxy from '../assets/images/playVoxy.png';
import playMc from '../assets/images/playMc.png';
import { useEffect, useState } from "react";

export default function Selector({ onPlaySelectChange }: { onPlaySelectChange: (value: string) => void }) {
    const location = useLocation();
    const [playSelect, setPlaySelect] = useState("voxy");

    useEffect(() => {
        onPlaySelectChange(playSelect);
    }, []);
    
    const handleSelect = (value: string) => {
        setPlaySelect(value);
        onPlaySelectChange(value);
    };

    return (
        <div className="w-20 h-full">
            <div className="flex flex-col items-center">
                <img draggable={false} className="p-3" src={logo} alt="Logo" />
                <div className="w-20 flex flex-col gap-2 mt-4">
                    <div
                        className={`group ml-2 flex justify-center items-center h-16 ${location.pathname !== "/main" ? 'rounded-2xl mr-2' : 'rounded-l-2xl border-r-0'} border-2 border-white/10 shadow-lg duration-75 relative cursor-pointer overflow-hidden`}
                        onClick={() => handleSelect("voxy")}
                    >
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-300 opacity-40 grayscale group-hover:grayscale-0 ${playSelect === "voxy" && "grayscale-0 opacity-40"}`}
                            style={{ backgroundImage: `url(${playVoxy})` }}
                        />
                        <img draggable={false} className="relative z-10" src={logoV} alt="Play Voxy" width={45} />
                    </div>

                    <div
                        className={`group ml-2 flex justify-center items-center h-16 ${location.pathname !== "/main" ? 'rounded-2xl mr-2' : 'rounded-l-2xl border-r-0'} border-2 border-white/10 shadow-lg duration-75 relative cursor-pointer overflow-hidden`}
                        onClick={() => handleSelect("minecraft")}
                    >
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-300 opacity-40 group-hover:opacity-60 grayscale group-hover:grayscale-0 ${playSelect === "minecraft" && "grayscale-0 opacity-60"}`}
                            style={{ backgroundImage: `url(${playMc})` }}
                        />
                        <img draggable={false} className="relative z-10 rounded-xl" src={mcLogo} alt="Play Minecraft" width={45} />
                    </div>
                </div>
            </div>
        </div>
    );
}