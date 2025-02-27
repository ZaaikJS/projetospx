import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FriendsList from "../../components/Main/FriendsList";
import PlayControl from "../../components/Main/PlayControl";
import PlayMinecraft from "../../components/Main/Minecraft/PlayControl";
import Posts from "../../components/Main/Posts";

export default function Home() {
    const { playSelect } = useOutletContext<{ playSelect: string }>();

    return (
        <>
            <div className="flex-1 flex flex-col">
                <div className="relative h-72">
                <AnimatePresence mode="sync">
                    {playSelect === "voxy" && (
                        <motion.div
                            key="voxy"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                        >
                            <PlayControl />
                        </motion.div>
                    )}
                    {playSelect === "minecraft" && (
                        <motion.div
                            key="minecraft"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                        >
                            <PlayMinecraft />
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>

                <Posts />
            </div>
            <FriendsList />
        </>
    );
}