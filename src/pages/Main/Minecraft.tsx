import FriendsList from "../../components/Main/FriendsList";
import PlayControl from "../../components/Main/Minecraft/PlayControl";
import Posts from "../../components/Main/Posts";

export default function Minecraft() {
    return (
        <>
            <div className="flex-1 flex flex-col">
                <PlayControl />
                <Posts />
            </div>
            <FriendsList />
        </>
    );
}