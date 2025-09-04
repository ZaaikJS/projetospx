import { useState } from "react";
import toast from "react-hot-toast";
import { CgSpinner } from "react-icons/cg";

export default function Id() {
    const [cardId, setCardId] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [card, setCard] = useState<any>(null);

    const handleCardIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyNums = e.target.value.replace(/\D/g, "");
        setCardId(onlyNums);
    };

    const handleSearch = async () => {
        if (!cardId) return;
        setLoading(true);
        setError(null);
        setCard(null);
        try {
            const result = await window.electron.ipcRenderer.invoke(
                "get-pipefy-card-by-id",
                { id: cardId }
            );
            if (result?.error) {
                setError(result.error);
                return;
            }
            setCard(result.card);
        } catch (e: any) {
            setError(e?.message || "Erro ao buscar card.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-4 p-8 w-96 bg-white text-black">
            <p className="text-xl">Criar grupo por ID</p>

            <div className="flex flex-col">
                <label className="text-sm opacity-80" htmlFor="id">
                    Insira o ID do card
                </label>
                <input
                    id="id"
                    className="bg-black/10 w-80 p-3 py-2 rounded text-sm hover:bg-black/15 focus:bg-black/15"
                    placeholder="Ex: 302462108"
                    value={cardId}
                    onChange={handleCardIdChange}
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={12}
                />
            </div>

            <button
                onClick={handleSearch}
                className={`p-4 py-2 mt-2 bg-green-600 rounded text-neutral-100 ${loading || !cardId ? "opacity-60" : "cursor-pointer hover:bg-green-700"
                    }`}
                disabled={loading || !cardId}
            >
                {loading ? <CgSpinner className="animate-spin text-2xl" /> : "Buscar"}
            </button>

            {error && (
                <p className="text-sm text-red-600 mt-2">Erro: 1194027422 {error}</p>
            )}

            {card && (
                <div className="mt-2 w-full text-sm bg-gray-50 p-3 rounded">
                    <div><b>ID:</b> {card.id}</div>
                    <div><b>Título:</b> {card.title}</div>
                    <div><b>Fase:</b> {card.current_phase?.name}</div>
                    <div>
                        <b>Responsáveis:</b>{" "}
                        {card.assignees.map((a: any) => (
                            <span key={a.email} className="inline-flex items-center gap-2 mr-3">
                                {a.name}
                            </span>
                        ))}
                    </div>
                    <div className="w-fit mx-auto">
                        <button
                            className={`p-4 py-2 mt-2 bg-green-600 rounded text-neutral-100 ${loadingCreate || !cardId ? "opacity-60" : "cursor-pointer hover:bg-green-700"
                                }`}
                            disabled={loadingCreate || !cardId}
                            onClick={async () => {
                                setLoadingCreate(true);

                                const description = card.fields?.find(
                                    (f: { name: string }) => f.name === "Prévia da descrição da demanda"
                                )?.value || "";

                                const participantsArray = ["553198315201", "553182378662"];

                                try {
                                    await toast.promise(
                                        window.electron.ipcRenderer.invoke('whatsapp-create-group', {
                                            groupName: card.title,
                                            participants: participantsArray,
                                            groupDesc: description,
                                        }),
                                        {
                                            loading: "Criando grupo, aguarde...",
                                            success: "Grupo criado com sucesso!",
                                            error: "Não foi possível criar o grupo.",
                                        },
                                        {
                                            style: {
                                                background: "#1e293b",
                                                color: "#fff",
                                            },
                                            success: {
                                                style: {
                                                    background: "#16a34a",
                                                    color: "#fff",
                                                },
                                            },
                                            error: {
                                                style: {
                                                    background: "#dc2626",
                                                    color: "#fff",
                                                },
                                            },
                                        }
                                    );
                                } catch (err) {
                                    console.error("Erro ao criar grupo:", err);
                                } finally {
                                    setLoadingCreate(false);
                                }
                            }}
                        >
                            {loading ? <CgSpinner className="animate-spin text-2xl" /> : "Criar grupo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}