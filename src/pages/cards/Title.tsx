import { useState } from "react";
import toast from "react-hot-toast";
import { CgSpinner } from "react-icons/cg";

export default function Title() {
    const [cardTitle, setCardTitle] = useState("");
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingTitle, setLoadingTitle] = useState<number | null>(null);

    const handleSearch = async () => {
        if (!cardTitle.trim()) return;
        setLoading(true);
        setError(null);
        setCards([]);

        try {
            const result = await window.electron.ipcRenderer.invoke(
                "get-pipefy-cards-by-title",
                { title: cardTitle /*, email */ }
            );
            if (result?.error) {
                setError(result.error);
            } else {
                setCards(result.cards || []);
            }
        } catch (e: any) {
            setError(e?.message || "Erro ao buscar cards.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-4 p-8 w-full bg-white text-black">
            <p className="text-xl">Criar grupo por assunto</p>

            <div className="flex flex-col w-full">
                <label className="text-sm opacity-80" htmlFor="id">
                    Insira o assunto do card para buscar
                </label>
                <input
                    id="id"
                    className="bg-black/10 w-full p-3 py-2 rounded text-sm hover:bg-black/15 focus:bg-black/15"
                    placeholder="Ex: TIM | MG | SAVASSI"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                />
                <span className="text-xs opacity-60">
                    A pesquisa irá retornar todos os cards que possuem o título acima
                </span>

                <div className="mt-3">
                    <button
                        onClick={handleSearch}
                        className={`p-3 py-2 w-fit mx-auto bg-green-600 rounded text-neutral-100 ${loading || !cardTitle.trim() ? "opacity-60" : "cursor-pointer hover:bg-green-700"
                            }`}
                        disabled={loading || !cardTitle.trim()}
                    >
                        {loading ? <CgSpinner className="animate-spin text-2xl" /> : "Buscar"}
                    </button>
                </div>

                {error && <p className="text-sm text-red-600 mt-2">Erro: {error}</p>}
            </div>

            <div className="overflow-x-auto w-full">
                <table className="min-w-full table-auto border-collapse border border-gray-300 text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Responsável</th>
                            <th className="border border-gray-300 px-4 py-2 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.map((card, index) => (
                            <tr key={card.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{card.title}</td>

                                <td className="border border-gray-300 px-4 py-2">
                                    {card.assignees?.length > 0 ? (
                                        <div className="flex gap-2 items-center">
                                            {card.assignees.map((a: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    {a.avatar_url && (
                                                        <img
                                                            src={a.avatar_url}
                                                            alt={a.name}
                                                            className="w-6 h-6 rounded-full border"
                                                        />
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
                                    {card.labels?.length > 0 ? (
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
                                        className={`bg-green-600 hover:bg-green-700 rounded px-2 py-1.5 text-neutral-100 text-xs cursor-pointer ${loadingTitle === index ? "opacity-60 cursor-not-allowed" : ""
                                            }`}
                                        disabled={loadingTitle === index}
                                        onClick={async () => {
                                            setLoadingTitle(index);

                                            const description =
                                                card.fields?.find(
                                                    (f: { name: string }) =>
                                                        f.name === "Prévia da descrição da demanda"
                                                )?.value || "";

                                            const participantsArray = ["553198315201", "553182378662"];

                                            try {
                                                await toast.promise(
                                                    window.electron.ipcRenderer.invoke(
                                                        "whatsapp-create-group",
                                                        {
                                                            groupName: card.title,
                                                            participants: participantsArray,
                                                            groupDesc: description,
                                                        }
                                                    ),
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
                                                setLoadingTitle(null);
                                            }
                                        }}
                                    >
                                        {loadingTitle === index ? (
                                            <CgSpinner className="animate-spin h-4 w-4 mx-auto" />
                                        ) : (
                                            "Criar grupo"
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && cards.length === 0 && (
                            <tr>
                                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                                    {cardTitle.trim()
                                        ? "Nenhum card encontrado para esse título."
                                        : "Digite um título e clique em Buscar."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}