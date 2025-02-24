import voxyLogo from '../assets/images/logo_v.png';
import grassBlock from '../assets/images/grass_block.png';

import { IoFolderOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";

export default function Installs() {
    return (
        <div className='flex flex-col gap-4 w-full h-full mr-4'>
            <div className='flex gap-4'>
                <div>
                    <p>Search</p>
                    <input className='p-0.5 px-1 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200' />
                </div>
                <div>
                    <p>Order by</p>
                </div>
                <div className='ml-auto'>
                    New
                </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-tr from-white/10 to-white/5 hover:from-white/20 shadow-lg p-4 cursor-pointer group">
                <div>
                    <img src={voxyLogo} width={48} />
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
                    <img src={voxyLogo} width={48} />
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
                    <img src={grassBlock} width={48} />
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