import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import microsoft_logo_icon from '../assets/images/microsoft_logo_icon.png';
import { useEffect, useState } from 'react';
import VoxyLogin from './Auth/VoxyLogin';
import Offline from './Auth/Offline';
import VoxyRegister from './Auth/VoxyRegister';
import auth from '../services/auth';

function AuthSelect({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    return (
        <>
            <button className="mcb-voxy" onClick={() => setPage('voxylogin')}>Voxy Account</button>
            <button className="mcb flex gap-2" onClick={() => setPage('microsoft')}>Microsoft <img src={microsoft_logo_icon} width={18} /></button>
            <button className="mcb-offline" onClick={() => setPage('offline')}>Offline</button>
            <Link to="/main">Home</Link>
        </>
    );
}

export default function Auth() {
    const navigate = useNavigate();
    const session = auth.getSession();

    useEffect(() => {
        if (session === "voxy" || session === "offline") {
            navigate("/main");
        }
    }, []);

    const [page, setPage] = useState<any>(null);

    let component;
    switch (page) {
        case 'voxylogin':
            component = <VoxyLogin setPage={setPage} />;
            break;
        case 'voxyregister':
            component = <VoxyRegister setPage={setPage} />;
            break;
        case 'microsoft':
            component = undefined;
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