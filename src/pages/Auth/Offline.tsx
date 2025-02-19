import { FaArrowLeft } from "react-icons/fa6";

interface OfflineProps {
    setPage: (value: string | null) => void;
}

export default function Offline({ setPage }: OfflineProps) {
    return (
        <div className='w-full flex flex-col items-center gap-6'>
            <p className='text-xl'>Please enter a player name</p>
            <div className='flex flex-col gap-4 w-fit'>
                <div className='flex flex-col'>
                    <label htmlFor='username' className='text-xs -text-semibold mb-1'>Nick / Username</label>
                    <input
                        className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg outline-none focus:bg-black/80 duration-200'
                        name="username"
                        id="username"
                        placeholder='Notch'
                    />
                </div>
            </div>
            <div className='flex justify-end w-full'>
                <button className='mcb w-fit'>Confirm</button>
            </div>
            <button className='absolute bottom-10 left-10 flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage(null)}><FaArrowLeft /> Back</button>
        </div>
    );
}