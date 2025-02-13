import { useState } from "react";
import { IoMdExit } from "react-icons/io";

export default function Navbar() {
    const [jump, setJump] = useState(false)
    
    return (
        <>
            <div className="flex gap-4 w-full h-20 py-4 pr-4">
                <div className="flex items-center w-full h-full px-4 bg-white/10 rounded-xl shadow-lg">
                    Aqui vai ser o menu
                </div>
                <div className="relative w-96 flex items-center h-full px-4 bg-white/10 rounded-xl shadow-lg" onMouseEnter={() => setJump(true)} onMouseLeave={() => setJump(false)}>
                    <div className="absolute h-16 w-18 bottom-0 left-1 overflow-hidden">
                        <img className={`absolute ${jump ? 'bottom-0' : '-bottom-1.5'} h-16 drop-shadow-lg transition-all duration-300`} src="https://starlightskins.lunareclipse.studio/render/pointing/Zaaik/bust?borderHighlight=true&borderHighlightRadius=10" />
                    </div>
                    <div className="flex flex-col justify-center ml-16">
                        <p className="text-xs text-neutral-400">Logged as:</p>
                        <div className="flex items-center gap-1">
                            <p className="-text-semibold">Zaaik</p>
                            <p className="text-xs text-neutral-400">(Microsoft)</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <IoMdExit className="text-neutral-300" />
                    </div>
                </div>
            </div>
        </>
    );
}