import { useEffect, useState } from "react";
import { HiMiniCog6Tooth } from "react-icons/hi2";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Id from "./Id";
import Title from "./Title";
import Settings from "./Settings";
import { CgSpinner } from "react-icons/cg";

export default function Cards() {
    const email = "harrison.viana@neooh.com.br";
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    const [openId, setOpenId] = useState(false);
    const [openTitle, setOpenTitle] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [saveSettings, setSaveSettings] = useState(false);

    const [after, setAfter] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);

    async function fetchCards(nextAfter: string | null = null) {
        setLoading(true);
        setError(null);
        try {
            const result = await window.electron.ipcRenderer.invoke("get-pipefy-cards", { after: nextAfter, email });
            if (result.error) throw new Error(result.error);
            setCards((old) => [...old, ...result.cards]);
            setAfter(result.pageInfo.endCursor);
            setHasNextPage(result.pageInfo.hasNextPage);
        } catch {
            setError("Não foi possível se conectar ao servidor, verifique seu token nas preferências.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCards();
    }, [saveSettings]);

    return (
        <>
            <div className="text-neutral-950">
                <div className="p-8 bg-white shadow-lg shadow-black/40">
                    <p className="text-xl font-semibold mb-2">Criar grupo Whatsapp</p>
                    {loading ? (
                        <div className="flex justify-center mt-4">
                            <CgSpinner className="animate-spin text-3xl text-gray-700" />
                        </div>
                    ) : (
                        <>
                            <div className="text-sm mb-2 flex justify-between items-center">
                                <div className="flex gap-1">
                                    {!error && (
                                        <>
                                            <p className="font-bold mr-1">Criar grupo por:</p>
                                            <button
                                                className="flex px-2 py-1 mx-auto rounded bg-green-600 text-xs text-white hover:bg-green-700 cursor-pointer"
                                                onClick={() => setOpenId(true)}
                                            >
                                                ID
                                            </button>
                                            <button
                                                className="flex px-2 py-1 mx-auto rounded bg-amber-600 text-xs text-white hover:bg-amber-700 cursor-pointer"
                                                onClick={() => setOpenTitle(true)}
                                            >
                                                Assunto
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="group cursor-pointer" onClick={() => setOpenSettings(true)}>
                                    <HiMiniCog6Tooth className="m-2 text-2xl opacity-80 group-hover:opacity-60" />
                                </div>
                            </div>

                            {error ? (
                                <div className="mt-3 text-sm text-center text-red-600">
                                    Não foi possível se conectar ao servidor, verifique seu token nas preferências.
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full table-auto border-collapse border border-gray-300 text-xs">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">Fase</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">Responsável</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">Tags</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cards.map((card, index) => (
                                                    <tr key={card.id} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-4 py-2">{card.title}</td>
                                                        <td className="border border-gray-300 px-4 py-2">
                                                            <span className="relative flex justify-center items-center px-2 py-1 rounded text-white text-xs overflow-hidden">
                                                                <span
                                                                    className="absolute inset-0 z-0 rounded"
                                                                    style={{
                                                                        backgroundColor:
                                                                            card.current_phase?.name === "EM ANÁLISE"
                                                                                ? "#BDBDBD"
                                                                                : card.current_phase?.color || "#999",
                                                                        filter: "brightness(85%)",
                                                                    }}
                                                                />
                                                                <span className="relative z-10">{card.current_phase?.name || "-"}</span>
                                                            </span>
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2">
                                                            {card.assignees.length > 0 ? (
                                                                <div className="flex gap-2 items-center">
                                                                    {card.assignees.map((a: any, i: number) => (
                                                                        <div key={i} className="flex items-center gap-2">
                                                                            {a.avatar_url && (
                                                                                <img src={a.avatar_url} alt={a.name} className="w-6 h-6 rounded-full border" />
                                                                            )}
                                                                            <span className="text-sm">{a.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2">
                                                            {card.labels.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {card.labels.map((label: any, i: number) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-1 rounded text-white text-xs"
                                                                            style={{ backgroundColor: label.color }}
                                                                        >
                                                                            {label.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2">
                                                            <button
                                                                className={`bg-green-600 hover:bg-green-700 rounded px-2 py-1.5 text-neutral-100 text-xs cursor-pointer ${loadingIndex === index ? "opacity-60 cursor-not-allowed" : ""
                                                                    }`}
                                                                disabled={loadingIndex === index}
                                                                onClick={async () => {
                                                                    setLoadingIndex(index);
                                                                    const description =
                                                                        card.fields?.find((f: { name: string }) => f.name === "Prévia da descrição da demanda")
                                                                            ?.value || "";
                                                                    const participantsArray = ["553198315201", "553182378662"];
                                                                    try {
                                                                        await toast.promise(
                                                                            window.electron.ipcRenderer.invoke("whatsapp-create-group", {
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
                                                                                style: { background: "#1e293b", color: "#fff" },
                                                                                success: { style: { background: "#16a34a", color: "#fff" } },
                                                                                error: { style: { background: "#dc2626", color: "#fff" } },
                                                                            }
                                                                        );
                                                                    } catch (err) {
                                                                        console.error("Erro ao criar grupo:", err);
                                                                    } finally {
                                                                        setLoadingIndex(null);
                                                                    }
                                                                }}
                                                            >
                                                                {loadingIndex === index ? (
                                                                    <CgSpinner className="animate-spin h-4 w-4 mx-auto" />
                                                                ) : (
                                                                    "Criar grupo"
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {hasNextPage && !loading && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => fetchCards(after)}
                                                className="px-4 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                            >
                                                Carregar mais
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal isOpen={openId} onClose={() => setOpenId(false)}>
                <Id />
            </Modal>

            <Modal isOpen={openTitle} onClose={() => setOpenTitle(false)}>
                <Title />
            </Modal>

            <Modal isOpen={openSettings} onClose={() => setOpenSettings(false)}>
                <Settings
                    onChangeOpen={setOpenSettings}
                    onSave={() => setSaveSettings(s => !s)}
                />
            </Modal>
        </>
    );
}
