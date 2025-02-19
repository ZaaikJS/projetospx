import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface VoxyLoginProps {
    setPage: (value: string | null) => void;
}

export default function VoxyLogin({ setPage }: VoxyLoginProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

    const Login = async (e: any) => {
        e.preventDefault();
        const newErrors: any = {};

        if (!formData.email) {
            newErrors.email = "Please enter your email.";
        }
        if (!formData.password) {
            newErrors.password = "Please enter your password.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/launcher/auth', {
                loginMail: formData.email,
                loginPass: formData.password
            });
            localStorage.setItem('loginMode', 'voxy')
            localStorage.setItem('refreshToken', response.data.refreshToken)
        } catch (error: any) {
            if (error.response?.data?.error === "AUTH_EMAIL_NOT_FOUND" || error.response?.data?.error === "AUTH_WRONG_PASSWORD") {
                toast.error('Check email and password.', { duration: 4000, style: { background: '#d32f2f', color: '#fff' } })
                setFormData((prev) => ({ ...prev, password: '' }));
            } else {
                setErrors({ general: error.response?.data?.error || "An unexpected error occurred." });
            }
        }
    };

    return (
        <>
            <form className='w-full flex flex-col items-center gap-6' onSubmit={Login}>
                <p className='text-xl'>Logging into an existing account</p>
                <div className='flex flex-col gap-6 w-72'>
                    <div className='relative flex flex-col'>
                        <label htmlFor='email' className='text-xs font-semibold mb-1'>Email</label>
                        <input
                            className={`p-2 px-3 bg-black/60 text-neutral-200 placeholder:text-neutral-600 rounded-lg focus:bg-black/80 duration-200 
                ${errors.email ? 'outline-2 outline-red-500' : 'outline-none'}`}
                            name="email"
                            id="email"
                            type='email'
                            placeholder='email@example.com'
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="absolute -bottom-5 text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className='relative flex flex-col'>
                        <label htmlFor='password' className='text-xs font-semibold mb-1'>Password</label>
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
                        {errors.password && <p className="absolute -bottom-5 text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div className='flex flex-col items-end'>
                        <p className='text-sm text-neutral-300'>Don't have an account?</p>
                        <p className='text-sm font-semibold hover:text-amber-400 duration-100 cursor-pointer' onClick={() => setPage('voxyregister')}>
                            Create an account
                        </p>
                    </div>
                </div>

                <div className='flex justify-end w-full'>
                    <button className='mcb w-fit'>Login</button>
                </div>

                {errors.general && <p className="text-red-500 text-xs mt-1">{errors.general}</p>}
            </form>
            <button className='absolute bottom-10 left-10 flex gap-1 px-4 text-lg items-center cursor-pointer hover:opacity-60 duration-200' onClick={() => setPage(null)}><FaArrowLeft /> Back</button>
        </>
    );
}