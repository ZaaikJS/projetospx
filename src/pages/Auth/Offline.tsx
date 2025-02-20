import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import auth from "../../services/auth";
import { useState } from "react";

interface OfflineProps {
    setPage: (value: string | null) => void;
}

export default function Offline({ setPage }: OfflineProps) {
    const navigate = useNavigate();
    const [nick, setNick] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateNick = (name: string) => {
        if (name.length < 3) return "Nickname must be at least 3 characters.";
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newNick = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
        setNick(newNick);
        setError(null);
    };

    const Login = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateNick(nick);
        
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            auth.saveSession('offline', nick, null, null, null);
            navigate('/main');
        } catch (error: any) {
            console.log('Error.');
        }
    };

    return (
        <>
            <form onSubmit={Login} className='w-full flex flex-col items-center gap-6'>
                <div className='flex flex-col gap-4 w-fit'>
                    <div className='relative flex flex-col'>
                        <label htmlFor='username' className='text-xs font-semibold mb-1'>Nick / Username</label>
                        <input
                            className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200 
                                ${error ? 'outline-2 outline-red-500' : 'outline-none'}`}
                            name="username"
                            id="username"
                            placeholder='Notch'
                            value={nick}
                            onChange={handleChange}
                            maxLength={16}
                        />
                        {error && <p className="absolute -bottom-5 text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                </div>
                <div className='flex justify-end w-full'>
                    <button className='mcb w-fit'>Confirm</button>
                </div>
            </form>
            <button 
                className='absolute bottom-10 left-10 flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' 
                onClick={() => setPage(null)}
            >
                <FaArrowLeft /> Back
            </button>
        </>
    );
}