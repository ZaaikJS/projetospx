import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import microsoft_logo_icon from '../assets/images/microsoft_logo_icon.png';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from 'axios';

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
    const [nick, setNick] = useState(null as null | boolean);
    const [verify, setVerify] = useState(false);

    const generateRandomNumber = (): string => {
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        return randomNumber.toString().padStart(4, '0');
    };

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confPassword: '',
        uuid: '<VOXY>' + uuidv4() as string,
        tagName: generateRandomNumber(),
        language: 'pt-BR'
    });
    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        if (name === "username") {
            const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
            setFormData({ ...formData, [name]: sanitizedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: null }));
    };

    useEffect(() => {
        setNick(null);
        setVerify(false);

        if (!formData.username || formData.username.length < 4) return;

        const timeout = setTimeout(async () => {
            try {
                setVerify(true);

                const response = await axios.get(`http://localhost:3000/api/launcher/register`, {
                    params: {
                        name: formData.username,
                        tagName: formData.tagName
                    }
                });

                if (response.data.exists) {
                    setFormData((prevData) => ({
                        ...prevData,
                        tagName: generateRandomNumber()
                    }));
                } else {
                    setNick(true);
                }
            } catch (error: any) {
                setErrors({ general: error.response?.data?.error || 'An unexpected error occurred.' });
                setNick(false);
            } finally {
                setVerify(false);
            }
        }, 800);

        return () => clearTimeout(timeout);
    }, [formData.username, formData.tagName]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setErrors({});

        if (!formData.username) {
            setErrors((prev: any) => ({ ...prev, username: "Please enter a nickname." }));
        }
        if (!formData.password || formData.password.length < 6) {
            setErrors((prev: any) => ({ ...prev, password: "Please choose a more secure password. Use at least 8 characters, including letters, numbers, and symbols." }));
        }
        if (formData.password !== formData.confPassword) {
            setErrors((prev: any) => ({ ...prev, confPassword: "Passwords do not match." }));
        }

        if (Object.keys(errors).length > 0) return;

        try {
            const response = await axios.post('http://localhost:3000/api/launcher/register', formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('User registered successfully', response.data);
        } catch (error: any) {
            setErrors({ general: error.response?.data?.error || 'An unexpected error occurred.' });
        }
    }

    return (
        <form className='w-full flex flex-col items-center gap-10' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col mb-4'>
                    <label htmlFor='email' className='text-xs -text-semibold mb-1'>Email</label>
                    <input
                        className='p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200 outline-none'
                        name="email"
                        id="email"
                        type='email'
                        placeholder='email@example.com'
                        value={formData.email}
                        onChange={handleChange}
                        required={true}
                    />
                </div>
                <div className='relative flex flex-col'>
                    <label htmlFor='username' className='text-xs -text-semibold mb-1'>Nick / Username</label>
                    <input
                        className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 transition-colors duration-200 
                        ${errors.username ? 'outline-2 outline-red-500' : nick === true ? 'outline-2 outline-green-500' : 'outline-none'}`}
                        name="username"
                        id="username"
                        placeholder="Notch"
                        maxLength={16}
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <AiOutlineLoading3Quarters className={`absolute top-8 right-3 animate-spin ${verify ? 'block' : 'hidden'}`} />
                    <p className={`text-xs mt-1 ${nick === true ? 'text-green-500' : nick === false ? 'text-red-500' : 'invisible'}`}>
                        {nick ? 'This nickname/username is available!' : 'This nickname/username is already being used by another user.'}
                    </p>
                </div>
                <div className='flex gap-4'>
                    <div className='flex flex-col'>
                        <label htmlFor='password' className='text-xs -text-semibold mb-1'>Password</label>
                        <input
                            className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200
                            ${errors.password ? 'outline-2 outline-red-500' : 'outline-none'}`}
                            name="password"
                            id="password"
                            type='password'
                            placeholder='••••••••••'
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 max-w-56">{errors.password}</p>}
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='confPassword' className='text-xs -text-semibold mb-1'>Confirm password</label>
                        <input
                            className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200
                            ${errors.confPassword ? 'outline-2 outline-red-500' : 'outline-none'}`}
                            name="confPassword"
                            id="confPassword"
                            type='password'
                            placeholder='••••••••••'
                            value={formData.confPassword}
                            onChange={handleChange}
                        />
                        {errors.confPassword && <p className="text-red-500 text-xs mt-1">{errors.confPassword}</p>}
                    </div>
                </div>
            </div>
            <div className='flex justify-between w-full'>
                <button className='flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage(null)}><FaArrowLeft /> Back</button>
                <button className='mcb w-fit'>Create Account</button>
            </div>
            {errors.general && <p className="text-red-500 text-xs mt-1">{errors.general}</p>}
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