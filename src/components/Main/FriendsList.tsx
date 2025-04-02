import { FaListUl } from "react-icons/fa6";
import Drawer from "../Misc/Drawer";
import { useState } from "react";
import bust_f from '../../assets/images/bust_f.png';

export default function FriendsList() {
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <div className="w-80 h-full ml-auto px-4">
                <div className="flex justify-between items-center">
                    <p className="text-xl">Friends</p>
                    <p
                        className="text-neutral-300 cursor-pointer hover:text-neutral-100 duration-100"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <FaListUl />
                    </p>
                </div>
                <div className="flex flex-col gap-2 py-2">
                    <div className="flex cursor-pointer hover:ml-1 duration-100">
                        <div className="flex justify-center items-center w-14 h-14 pb-1 bg-white/5 rounded-xl border-1 border-white/10 shadow-lg shadow-black/20">
                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                                <img
                                    draggable={false}
                                    className="mx-auto mt-1"
                                    src="https://starlightskins.lunareclipse.studio/render/dungeons/Zaaik/bust?borderHighlight=true&borderHighlightRadius=5"
                                    width={48}
                                    onError={(e) => (e.currentTarget.src = bust_f)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center ml-2">
                            <p className="-text-semibold">Zaaik</p>
                            <p className="flex items-center gap-1 text-xs">
                                <div className="bg-green-400 h-2 w-2 rounded-full"></div>
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex cursor-pointer hover:ml-1 duration-100">
                        <div className="flex justify-center items-center w-14 h-14 pb-1 bg-white/5 rounded-xl border-1 border-white/10 shadow-lg shadow-black/20">
                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                                <img
                                    draggable={false}
                                    className="mx-auto mt-1"
                                    src="https://starlightskins.lunareclipse.studio/render/dungeons/wHenriqueLSH_/bust?borderHighlight=true&borderHighlightRadius=5"
                                    width={48}
                                    onError={(e) => (e.currentTarget.src = bust_f)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center ml-2">
                            <p className="-text-semibold">wHenriqueLSH_</p>
                            <p className="text-neutral-400 text-xs">Last seen 34 minutes ago</p>
                        </div>
                    </div>
                </div>
            </div>
            <Drawer
                size={'w-80'}
                content={
                    <>

                    </>
                }
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
}