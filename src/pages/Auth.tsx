import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import microsoft_logo_icon from '../assets/images/microsoft_logo_icon.png';
import { useEffect, useState } from 'react';
import VoxyLogin from './Auth/VoxyLogin';
import Offline from './Auth/Offline';
import VoxyRegister from './Auth/VoxyRegister';
import auth from '../services/auth';
import Microsoft from './Auth/Microsoft';
import toast from 'react-hot-toast';
import axios from 'axios';

function AuthSelect({ setPage }: { setPage: React.Dispatch<React.SetStateAction<any>> }) {
    const navigate = useNavigate();

    const handleLoginMicrosoft = async () => {
        try {
            setPage('microsoft');
            const result = await window.electron.ipcRenderer.loginMicrosoft();
    
            if (result.success) {
                try {
                    const languageData: any = await window.electron.ipcRenderer.db.get("preferences", "language");
                    const language = languageData.data;
    
                    await axios.post("http://localhost:3000/api/launcher/auth/register", {
                        mode: 'microsoft',
                        uuid: result.authorization.uuid,
                        username: result.authorization.name,
                        microsoft: true,
                        language: language
                    });
                    auth.saveSession('microsoft', result.authorization.name, null, null, null);
                    toast.success('Login successful.', { duration: 4000, style: { background: '#43a047', color: '#fff' } });
                    navigate('/main');
                    return;
                } catch (error: any) {
                    toast.error('An error occurred on Microsoft login. Please try again.', { duration: 4000, style: { background: '#d32f2f', color: '#fff' } });
                    setPage(null);
                }
            }
    
            const { error } = result;
    
            switch (error) {
                case "error.gui.closed":
                    toast.error('Microsoft login canceled.', { duration: 4000, style: { background: '#d32f2f', color: '#fff' } });
                    setPage(null);
                    break;
                case "error.auth.xsts.userNotFound":
                    toast.error("This Microsoft account doesn't have Minecraft.", { duration: 4000, style: { background: '#d32f2f', color: '#fff' } });
                    setPage(null);
                    break;
                default:
                    alert("An unexpected error occurred. Please try again.");
                    console.error("Unknown error:", error);
            }
        } catch (error) {
            console.error("An error occurred while trying to log in:", error);
        }
    };    

    return (
        <>
            <button className="mcb-voxy" onClick={() => setPage('voxylogin')}>Voxy Account</button>
            <button className="mcb flex gap-2" onClick={() => handleLoginMicrosoft()}>Microsoft <img src={microsoft_logo_icon} width={18} /></button>
            <button className="mcb-offline" onClick={() => setPage('offline')}>Offline</button>
        </>
    );
}

export default function Auth() {
    
    const navigate = useNavigate();


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
            <img src={logo} width={160} onClick={() => navigate("/main")} />
            {component}
        </div>
    );
}