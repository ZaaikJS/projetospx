import { useState } from "react";
import { IoMdExit } from "react-icons/io";
import auth from "../services/auth";
import { useNavigate } from "react-router-dom";
import bust from '../assets/images/logo.png';

export default function Navbar() {
    const navigate = useNavigate();
    const [jump, setJump] = useState(false);
    const [skinUrl, setSkinUrl] = useState(`https://starlightskins.lunareclipse.studio/render/pointing/Zaaik/bust?borderHighlight=true&borderHighlightRadius=10`);

    const logout = async () => {
        try {
            auth.destroySession();
            navigate('/auth');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <>
            <div className="flex gap-4 w-full h-20 py-4 pr-4">
                <div className="flex items-center w-full h-full px-4 bg-white/10 rounded-xl shadow-lg">
                    Aqui vai ser o menu
                </div>
                <div 
                    className="relative w-96 flex items-center h-full px-4 bg-white/10 rounded-xl shadow-lg" 
                    onMouseEnter={() => setJump(true)} 
                    onMouseLeave={() => setJump(false)}
                >
                    <div className="absolute h-16 w-18 bottom-0 left-1 overflow-hidden">
                        <img 
                            className={`absolute ${jump ? "bottom-0" : "-bottom-1.5"} h-16 drop-shadow-lg transition-all duration-300`} 
                            src={skinUrl} 
                            onError={() => setSkinUrl(bust)}
                            alt="Player Skin"
                        />
                    </div>
                    <div className="flex flex-col justify-center ml-16">
                        <p className="text-xs text-neutral-400">Logged as:</p>
                        <div className="flex items-center gap-1">
                            <p className="-text-semibold">{auth.getData("username")}</p>
                            <p className="text-xs text-neutral-400">(Microsoft)</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <IoMdExit 
                            className="text-neutral-300 cursor-pointer hover:text-neutral-100 duration-100" 
                            onClick={logout} 
                            aria-label="Logout" 
                        />
                    </div>
                </div>
            </div>
        </>
    );
}