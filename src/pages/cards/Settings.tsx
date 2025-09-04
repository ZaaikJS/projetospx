import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCircleInfo } from "react-icons/fa6";

type Settings = {
    onChangeOpen?: (open: boolean) => void;
    onSave?: () => void;
};

type Member = { name: string; phone: string };

const STORAGE_KEY_PHONES = "settings:selectedPhones";

export default function Settings({ onChangeOpen, onSave }: Settings) {
    const [open, setOpen] = useState(true);
    const [token, setToken] = useState('');
    const [tokenTooltip, setTokenTooltip] = useState(false)

    useEffect(() => {
        onChangeOpen?.(open);
    }, [open, onChangeOpen]);

    const options: Member[] = [
        { name: "Hugo Chaves", phone: "553199999999" },
        { name: "Breno Santos", phone: "553188888888" },
        { name: "Rafael Batista", phone: "553177777777" },
        { name: "Harrison Viana", phone: "553166666666" },
        { name: "Fabrícia Melo", phone: "553155555555" },
        { name: "Laís Moreira", phone: "553144444444" },
    ];

    const [selected, setSelected] = useState<string[]>(() => {
        try {
            if (typeof window === "undefined") return [];
            const raw = localStorage.getItem(STORAGE_KEY_PHONES);
            if (!raw) return [];
            const stored = JSON.parse(raw);
            if (!Array.isArray(stored)) return [];
            const valid = new Set(options.map((o) => o.phone));
            return stored.filter(
                (p: unknown): p is string => typeof p === "string" && valid.has(p)
            );
        } catch {
            return [];
        }
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await window.electron.ipcRenderer.invoke("getToken");
                if (res?.success && typeof res.token === "string") {
                    setToken(res.token);
                }
            } catch { }
        })();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_PHONES, JSON.stringify(selected));
        } catch { }
    }, [selected]);

    useEffect(() => {
        const valid = new Set(options.map((o) => o.phone));
        setSelected((prev) => prev.filter((p) => valid.has(p)));
    }, [options.length]);

    const toggle = (phone: string) => {
        setSelected((prev) =>
            prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
        );
    };

    const handleSalvar = async () => {
        try {
            localStorage.setItem(STORAGE_KEY_PHONES, JSON.stringify(selected));
            const res = await window.electron.ipcRenderer.invoke("saveToken", { token });

            if (!res?.success) {
                toast.error("Erro ao salvar token.", { duration: 4000, style: { background: "#d32f2f", color: "#fff" } });
                return;
            }

            toast.success("Preferências salvas!", { duration: 4000, style: { background: "#43a047", color: "#fff" } });
            onSave?.();
            setOpen(false);
        } catch {
            toast.error("Ocorreu um erro ao salvar.", { duration: 4000, style: { background: "#d32f2f", color: "#fff" } });
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-4 p-8 w-96 bg-white text-black">
            <p className="text-xl">Preferências</p>

            <div className="flex flex-col gap-2 w-full">
                <p className="text-sm text-center opacity-80">
                    Selecione os integrantes que serão adicionados inicialmente aos grupos
                </p>

                {options.map((opt) => (
                    <label key={opt.phone} className="flex items-center gap-2 cursor-pointer ml-8">
                        <input
                            type="checkbox"
                            checked={selected.includes(opt.phone)}
                            onChange={() => toggle(opt.phone)}
                            className="accent-green-600 w-4 h-4"
                        />
                        <span className="text-sm">{opt.name}</span>
                    </label>
                ))}
            </div>

            <div className="relative flex flex-col">
                <label className="text-sm opacity-80 flex gap-1" htmlFor="token">
                    Token Pipefy
                    <FaCircleInfo
                        className="text-red-700 opacity-80"
                        onMouseEnter={() => setTokenTooltip(true)}
                        onMouseLeave={() => setTokenTooltip(false)}
                    />
                </label>
                <div className={`absolute -top-28 p-4 bg-red-500 border border-red-600 text-white rounded-lg z-30 ${tokenTooltip ? 'block' : 'hidden'}`}>
                    <span className="text-xs">
                        Esse token é pessoal, não o compartilhe com <b>ninguém</b>. Mesmo que seja solicitado por alguém da equipe.
                    </span>
                </div>
                <input
                    id="token"
                    className="bg-black/10 w-80 p-3 py-2 rounded text-sm hover:bg-black/15 focus:bg-black/15"
                    placeholder="Ex: eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOi..."
                    autoComplete="off"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                />
                <span className="text-xs opacity-60">
                    Obtenha o token{" "}
                    <span
                        onClick={() =>
                            window.electron.ipcRenderer.invoke("open-url", {
                                url: "https://app.pipefy.com/tokens",
                            })
                        }
                        className="underline text-blue-600 cursor-pointer"
                    >
                        aqui
                    </span>
                    .
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSalvar}
                    className="p-2 px-4 text-sm bg-green-600 rounded text-neutral-100 cursor-pointer hover:bg-green-700"
                >
                    Salvar
                </button>
            </div>
        </div>
    );
}