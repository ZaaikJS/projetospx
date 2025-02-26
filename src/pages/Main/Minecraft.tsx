import React, { useState, useRef, useEffect } from "react";
import "../../components/Main/Minecraft/PlayControl.css";
import FriendsList from "../../components/Main/FriendsList";
import PlayControl from "../../components/Main/Minecraft/PlayControl";

const Minecraft: React.FC = () => {
    const [isPlayOptionsOpen, setPlayOptionsOpen] = useState<boolean>(false);
    const PlayOptionsRef = useRef<HTMLDivElement | null>(null);

    const togglePlayOptions = () => {
        setPlayOptionsOpen(!isPlayOptionsOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (PlayOptionsRef.current && !PlayOptionsRef.current.contains(event.target as Node)) {
            setPlayOptionsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="relative flex-1 flex flex-col">
                <PlayControl onTogglePlayOptions={togglePlayOptions} isPlayOptionsOpen={isPlayOptionsOpen} />
                {isPlayOptionsOpen && (
                    <div className="absolute top-44 mt-4 w-full flex justify-center">
                        <div ref={PlayOptionsRef} className={`options-box w-1/2 h-32 z-20`}>
                            <select name="select" className="">
                                <option value="valor1">Valor 1</option>
                                <option value="valor2" selected>Valor 2</option>
                                <option value="valor3">Valor 3</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
            <FriendsList />
        </>
    );
};

export default Minecraft;
