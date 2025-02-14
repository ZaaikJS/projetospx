import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import microsoft_logo_icon from '../assets/images/microsoft_logo_icon.png';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function AuthSelect({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    return (
        <>
            <button className="mcb-voxy" onClick={() => setPage('voxyaccount')}>Voxy Account</button>
            <button className="mcb flex gap-2" onClick={() => setPage('microsoft')}>Microsoft <img src={microsoft_logo_icon} width={18} /></button>
            <button className="mcb-offline" onClick={() => setPage('offline')}>Offline</button>
            <Link to="/main">Home</Link>
        </>
    );
}

function VoxyAccount({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    const [nick, setNick] = useState(false)
    const [verify, setVerify] = useState(false)

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confPassword: '',
        uuid: '<VOXY>' + uuidv4() as string,
        language: 'pt-BR'
    });

    const [errors, setErrors] = useState({} as any);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
    
        if (name === "username") {
            const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
            setFormData({ ...formData, [name]: sanitizedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    useEffect(() => {
        setNick(false)
        if (formData.username.length < 4) return;

        const timeout = setTimeout(() => {
            setNick(true)
        }, 800);

        return () => clearTimeout(timeout);
    }, [formData.username]);


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setErrors({});

        try {
            const response = await fetch('http://localhost:3000/api/launcher/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log('User registered successfully');
            } else {
                const errorData = await response.json();
                setErrors({ general: errorData.error });
            }
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred.' });
        }
    }
    return (
            <form className='w-full flex flex-col items-center gap-10' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4'>
                    <div className='relative flex flex-col'>
                        <label htmlFor='username' className='text-xs -text-semibold mb-1'>Nick / Username</label>
                        <input
                            className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg outline-none focus:bg-black/80 duration-200'
                            name="username"
                            id="username"
                            placeholder='Notch'
                            maxLength={16}
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <AiOutlineLoading3Quarters className={`absolute top-8 right-3 animate-spin ${verify ? 'block' : 'hidden'}`} />
                        {nick ? 'true' : 'false'}
                        {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='email' className='relative text-xs -text-semibold mb-1'>Email <span className='absolute text-[10px] text-neutral-400 bottom-1 pl-1'>Optional</span></label>
                        <input
                            className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg outline-none focus:bg-black/80 duration-200'
                            name="email"
                            id="email"
                            placeholder='email@example.com'
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                    </div>
                    <div className='flex gap-4'>
                        <div className='flex flex-col'>
                            <label htmlFor='password' className='text-xs -text-semibold mb-1'>Password</label>
                            <input
                                className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg outline-none focus:bg-black/80 duration-200'
                                name="password"
                                id="password"
                                type='password'
                                placeholder='••••••••••'
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor='confPassword' className='text-xs -text-semibold mb-1'>Confirm password</label>
                            <input
                                className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg outline-none focus:bg-black/80 duration-200'
                                name="confPassword"
                                id="confPassword"
                                type='password'
                                placeholder='••••••••••'
                                value={formData.confPassword}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                    </div>
                </div>
                <div className='flex justify-between w-full'>
                    <button className='flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage(null)}><FaArrowLeft /> Back</button>
                    <button className='mcb w-fit'>Create Account</button>
                </div>
                {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
            </form>
    );
}

function Microsoft({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    return (
        <p onClick={() => setPage(null)}>Microsoft</p>
    );
}

function Offline({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    return (
        <div className='w-full flex flex-col items-center gap-10'>
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
            <div className='flex justify-between w-full'>
                <button className='flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage(null)}><FaArrowLeft /> Back</button>
                <button className='mcb w-fit'>Confirm</button>
            </div>
        </div>
    );
}

export default function Auth() {
    const [page, setPage] = useState<any>(null);

    let component;
    switch (page) {
        case 'voxyaccount':
            component = <VoxyAccount setPage={setPage} />;
            break;
        case 'microsoft':
            component = <Microsoft setPage={setPage} />;
            break;
        case 'offline':
            component = <Offline setPage={setPage} />;
            break;
        default:
            component = <AuthSelect setPage={setPage} />;
    }

    return (
        <div className="p-8 w-5xl flex flex-col justify-center items-center gap-10 bg-black/40 rounded-xl backdrop-blur-xs">
            <img src={logo} width={160} />
            {component}
        </div>
    );
}