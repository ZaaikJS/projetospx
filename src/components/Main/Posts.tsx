import { useEffect, useState } from "react";
import axios from "axios";

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(
                "https://voxymc.net/api/post/get?page=1&limit=6&visible=1"
            );
            setPosts(response.data.posts);
        } catch (error) {
            console.error("Erro ao buscar posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const openExternalLink = () => {
        window.electron.ipcRenderer.openLink('https://voxymc.net/post/all/1');
    };

    return (
        <>
            <div className="my-2 flex justify-between items-center">
                <p className="font-semibold text-2xl text-shadow">Latest News</p>
                <p onClick={openExternalLink} className="text-xs text-neutral-300 mr-4 text-shadow cursor-pointer hover:opacity-90 duration-100">View all</p>
            </div>
            <div className="relative flex-1 flex flex-col overflow-y-scroll">
                <div className="max-h-px mr-2">
                    <div className="grid grid-cols-2 gap-4">
                        {loading ? (
                            <>
                                <div className="flex gap-4">
                                    <div className="w-28 !h-28 skeleton-box rounded-xl shadow-lg"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="skeleton-box w-72 !h-6 rounded-md shadow-lg mb-4"></div>
                                        <div className="skeleton-box w-56 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-64 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-60 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-48 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-18 !h-3 rounded-sm shadow-lg mt-4"></div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-28 !h-28 skeleton-box rounded-xl shadow-lg"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="skeleton-box w-72 !h-6 rounded-md shadow-lg mb-4"></div>
                                        <div className="skeleton-box w-56 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-64 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-60 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-48 !h-4 rounded-sm shadow-lg"></div>
                                        <div className="skeleton-box w-18 !h-3 rounded-sm shadow-lg mt-4"></div>
                                    </div>
                                </div>
                            </>
                        ) :
                            posts.map((post: any) => (
                                <div
                                    key={post._id}
                                    className="rounded-xl border-2 border-white/10"
                                >
                                    <div
                                        className="relative h-52 rounded-xl overflow-hidden"
                                        style={{
                                            backgroundImage: `url('https://voxymc.net/uploads/images/posts/${post.image}')`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            backgroundRepeat: "no-repeat",
                                        }}
                                    >
                                        <div className="absolute bottom-0 w-full bg-white/10">
                                            <p className="p-4 text-shadow font-semibold">{post.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    );
}