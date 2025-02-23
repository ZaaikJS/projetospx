import { useEffect } from 'react';
import './loading.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface MicrosoftProps {
    setPage: (value: string | null) => void;
}

export default function Microsoft({ setPage }: MicrosoftProps) {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col items-center gap-8'>
            <p className='text-xl'>Logging into Microsoft account</p>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    );
}