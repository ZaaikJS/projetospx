import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface IsAuthProps {
    children: React.ReactNode;
}

export default function IsAuth({ children }: IsAuthProps) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/launcher/auth/capture`, {
                        params: {
                            refreshToken: localStorage.getItem('refreshToken'),
                        }
                    });
                    setIsAuthenticated(true)
                } catch (err) {
                    navigate("/auth")
                }
            };

            fetchData();
        }, 1000);
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex justify-center items-center w-full h-screen">Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <p>Você não tem permissão para acessar esta área.</p>;
    }

    return <>{children}</>;
}