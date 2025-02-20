import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

interface VoxyRegisterProps {
    setPage: (value: string | null) => void;
}

export default function VoxyRegister({ setPage }: VoxyRegisterProps) {
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
            const sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, "");
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

                const response = await axios.get(`http://localhost:3000/api/launcher/auth/register`, {
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
        const newErrors: any = {};
    
        if (!formData.username) {
            newErrors.username = "Please enter a nickname.";
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = "Please choose a more secure password. Use at least 8 characters, including letters, numbers, and symbols.";
        }
        if (formData.password !== formData.confPassword) {
            newErrors.confPassword = "Passwords do not match.";
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:3000/api/launcher/auth/register', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            console.log('User registered successfully', response.data);
        } catch (error: any) {
            if (error.response?.data?.error === "EMAIL_IS_ALREADY_USED") {
                setErrors({ email: "This email is already in use." });
            } else {
                setErrors({ general: error.response?.data?.error || 'An unexpected error occurred.' });
            }
        }
    };
    
    return (
        <>
            <form className='w-full flex flex-col items-center gap-6' onSubmit={handleSubmit}>
                <p className='text-xl'>Creating an account</p>
                <div className='flex flex-col gap-4'>
                    <div className='relative flex flex-col mb-4'>
                        <label htmlFor='email' className='text-xs -text-semibold mb-1'>Email</label>
                        <input
                            className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200
                                ${errors.email ? 'outline-2 outline-red-500' : 'outline-none'}`}
                            name="email"
                            id="email"
                            type='email'
                            placeholder='email@example.com'
                            value={formData.email}
                            onChange={handleChange}
                            required={true}
                        />
                        {errors.email && <p className="absolute -bottom-5 text-red-500 text-xs mt-1 max-w-56">{errors.email}</p>}
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
                        {errors.username && <p className="absolute bottom-0 text-red-500 text-xs mt-1 max-w-56">{errors.username}</p>}
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
                <div className='flex justify-end w-full'>
                    <button className='mcb w-fit'>Create Account</button>
                </div>
                {errors.general && <p className="text-red-500 text-xs mt-1">{errors.general}</p>}
            </form>
            <button className='absolute bottom-10 left-10 flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage('voxylogin')}><FaArrowLeft /> Back</button>
        </>
    );
}