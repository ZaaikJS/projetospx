import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logo.png"
import googleLogo from "@/assets/images/Google__G__logo.png";
import { CgSpinner } from "react-icons/cg";
import toast from "react-hot-toast";
import { useUser } from "@/global/User";

export default function Auth() {
    const navigate = useNavigate();
    const [check, setCheck] = useState(true);
    const [checkStatus, setCheckStatus] = useState('')
    const [auth, setAuth] = useState(false)
    const { nome, email, setUser, clearUser } = useUser();

    useEffect(() => {
        setCheckStatus('Verificando conexão com servidor');
        const timer = setTimeout(async () => {
            setCheckStatus('Verificando sessão')
            try {
                const response = await window.electron.ipcRenderer.invoke("verifyAuth");
                if (response.success) {
                    navigate('/main')
                    toast.success("Autenticado com sucesso!", { duration: 4000, style: { background: "#43a047", color: "#fff" } });
                } else {
                    toast.error("Ocorreu um erro ao autenticar. Tente novamente.", { duration: 4000, style: { background: "#d32f2f", color: "#fff" } });
                }
            } catch {

            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const googleAuth = async () => {
        setAuth(true)
        await window.electron.ipcRenderer.invoke("openAuth");
    }

    useEffect(() => {
        if (!auth) return;

        const handler = async (_event: any, url: string) => {
            try {
                const parsed = new URL(url);
                const token = parsed.searchParams.get("t");
                const session = parsed.searchParams.get("s");

                if (token) {
                    const response = await window.electron.ipcRenderer.invoke("authProvider", { token, session });
                    if (response.success) {
                        navigate('/main')
                        toast.success("Autenticado com sucesso!", { duration: 4000, style: { background: "#43a047", color: "#fff" } });
                    } else {
                        toast.error("Ocorreu um erro ao autenticar. Tente novamente.", { duration: 4000, style: { background: "#d32f2f", color: "#fff" } });
                    }
                } else {
                    console.warn("⚠️ Nenhum token encontrado na URL:", url);
                }
            } catch (err) {
                console.error("❌ Erro ao parsear URL:", err);
            }
        };

        window.electron.ipcRenderer.on("uri", handler);

        return () => {
            window.electron.ipcRenderer.removeListener("uri", handler);
        };
    }, [auth]);

    return (
        (check ? (
            <div className="flex flex-col gap-4 items-center">
                <img src={logo} width={360} />
                <p className="text-lg">{checkStatus}</p>
                <div className="text-4xl font-bold">
                    <Loading />
                </div>
            </div>
        ) : (
            auth ? (
                <div className="flex flex-col items-center gap-4">
                    <CgSpinner className="text-4xl animate-spin" />
                    <p>Uma aba foi aberta no seu navegador. Por favor, autentique-se por ela.</p>
                    <button
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                        onClick={() => setAuth(false)}
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center gap-8 p-8">
                    <p className="text-xl text-gray-100">
                        Por favor, identifique-se
                    </p>
                    <div
                        className="px-6 py-2 flex items-center gap-4 bg-white border-2 border-gray-300 rounded-full shadow-lg shadow-black/20 hover:shadow-xl duration-200 cursor-pointer"
                        onClick={googleAuth}
                    >
                        <img src={googleLogo} alt="Google" width={30} />
                        <span className="text-sm text-black">Entrar com Google</span>
                    </div>
                </div>
            )
        ))
    );
}