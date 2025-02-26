import "./PlayControl.css"
import playBg from "../../../assets/images/play/mc.jpg"

import { BsFillCaretDownFill } from "react-icons/bs";

export default function PlayControl() {
    return (
        <>
            <div className="h-72 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg shadow-black/20">
                <div className="relative h-full bg-white/10">
                    <div className="relative w-full h-full overflow-hidden flex justify-center items-center shine-image group">
                        <img
                            className="object-cover w-full h-full opacity-80 scale-100 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                            src={playBg}
                            alt="VoxyMC"
                        />
                        <div className="absolute flex">
                            <button
                                className="mcb flex flex-col w-80"
                            >
                                <span className="z-10 text-2xl">Play</span>
                                <span className="z-10 text-xs font-semibold mt-2">{'<Unnamed installation>'}</span>
                                <span className="z-10 text-[10px] font-extralight opacity-90">1.8.9</span>
                            </button>
                            <button className="mcb text-xl !px-4">
                                <BsFillCaretDownFill />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}