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
        const token = localStorage.getItem('refreshToken');

        try {
            await axios.get(`http://localhost:3000/api/launcher/auth/capture`, {
                params: {
                    refreshToken: token,
                }
            });
            setIsAuthenticated(true)
        } catch (err) {
            navigate("/auth")
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const session = await auth.getSession();

            switch (session) {
                case "voxy":
                    voxyLogin();
                    break;
                case "microsoft":
                    setIsAuthenticated(true);
                    break;
                case "offline":
                    setIsAuthenticated(true);
                    break;
                default:
                    setIsAuthenticated(false);
                    break;
            }
        };

        checkSession();
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex justify-center items-center w-full h-screen">Uma tela de carregamento foda...</div>;
    }

    if (!isAuthenticated) {
        navigate("/auth");
    }

    return <>{children}</>;
}