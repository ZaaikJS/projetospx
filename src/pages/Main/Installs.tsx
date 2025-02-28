import voxyLogo from '../../assets/images/logo_v.png';
import grassBlock from '../../assets/images/grass_block.png';

import { IoFolderOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";

export default function Installs() {
    const [order, setOrder] = useState(0)

    return (
        <div className='flex flex-col gap-4 w-full h-full mr-4'>
            <div className='flex gap-4'>
                <div>
                    <p>Search</p>
                    <input
                        className='p-1 px-2 text-sm bg-black/40 text-neutral-200 placeholder:text-neutral-600 rounded-lg shadow-lg hover:bg-black/60 focus:bg-black/60 duration-200 outline-none'
                        placeholder='Installation name'
                    />
                </div>
                <div>
                    <p>Order by</p>
                    <div className='flex gap-2 text-sm'>
                        <button
                            className={`bg-white/5 px-2 py-1 rounded-lg shadow-lg hover:bg-white/10 duration-75 cursor-pointer ${order === 1 && 'bg-white/10'}`}
                            onClick={() => setOrder(1)}
                        >
                            A-Z
                        </button>
                        <button
                            className={`bg-white/5 px-2 py-1 rounded-lg shadow-lg hover:bg-white/10 duration-75 cursor-pointer ${order === 2 && 'bg-white/10'}`}
                            onClick={() => setOrder(2)}
                        >
                            Version
                        </button>
                    </div>
                </div>
                <div className='ml-auto my-auto'>
                    <button className="bg-green-600 text-white text-sm px-2 py-1 -text-semibold shadow-lg hover:bg-green-500 cursor-pointer duration-75">
                        New
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-tr from-white/10 to-white/5 hover:from-white/20 shadow-lg p-4 cursor-pointer group">
                <div>
                    <img draggable={false} src={voxyLogo} width={48} />
                </div>
                <div>
                    <p className='-text-semibold'>Voxy FullPvp</p>
                    <p className='text-sm text-neutral-400'>1.5.2</p>
                </div>
                <div className='ml-auto hidden group-hover:block'>
                    <button className='bg-green-600 text-white text-sm px-2 py-1 -text-semibold shadow-lg hover:bg-green-500 cursor-pointer'>Play</button>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-tr from-white/10 to-white/5 hover:from-white/20 shadow-lg p-4 cursor-pointer group">
                <div>
                    <img draggable={false} src={voxyLogo} width={48} />
                </div>
                <div>
                    <p className='-text-semibold'>Voxy Minigames</p>
                    <p className='text-sm text-neutral-400'>1.16</p>
                </div>
                <div className='ml-auto hidden group-hover:block'>
                    <button className='bg-green-600 text-white text-sm px-2 py-1 -text-semibold shadow-lg hover:bg-green-500 cursor-pointer'>Play</button>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-tr from-white/10 to-white/5 hover:from-white/20 shadow-lg p-4 cursor-pointer group">
                <div>
                    <img draggable={false} src={grassBlock} width={48} />
                </div>
                <div>
                    <p className='-text-semibold'>{'<Unnamed installation>'}</p>
                    <p className='text-sm text-neutral-400'>1.8.9</p>
                </div>
                <div className='ml-auto hidden group-hover:block'>
                    <div className='flex items-center gap-2'>
                        <button className='bg-green-600 text-white text-sm px-2 py-1 -text-semibold shadow-lg hover:bg-green-500 cursor-pointer'>Play</button>
                        <button className='bg-white/5 text-white text-lg p-1 -text-semibold shadow-lg hover:bg-white/10 cursor-pointer border-2 border-white/15'><IoFolderOutline /></button>
                        <button className='bg-white/5 text-white text-lg p-1 -text-semibold shadow-lg hover:bg-white/10 cursor-pointer border-2 border-white/15'><BsThreeDots /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}