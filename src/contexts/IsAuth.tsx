import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../services/auth";

interface IsAuthProps {
    children: React.ReactNode;
}

export default function IsAuth({ children }: IsAuthProps) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const voxyLogin = async () => {
        try {
            await axios.get(`http://localhost:3000/api/launcher/auth/capture`, {
                params: {
                    refreshToken: localStorage.getItem('refreshToken'),
                }
            });
            setIsAuthenticated(true)
        } catch (err) {
            navigate("/auth")
        }
    };

    const microsoft = async () => {
        try {
            await window.electron.ipcRenderer.loginMicrosoft()
            setIsAuthenticated(true)
        } catch (err) {
            navigate("/auth")
        }
    };

    useEffect(() => {
        setTimeout(() => {
            switch (auth.getSession()) {
                case 'voxy':
                    return voxyLogin();
                case 'microsoft':
                    return setIsAuthenticated(true);
                case 'offline':
                    return setIsAuthenticated(true);
                default:
                    return setIsAuthenticated(false);
            }
        }, 1000);
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex justify-center items-center w-full h-screen">Uma tela de carregamento foda...</div>;
    }

    if (!isAuthenticated) {
        navigate("/auth");
    }

    return <>{children}</>;
}