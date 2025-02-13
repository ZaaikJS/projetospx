import FriendsList from "../components/Main/FriendsList";
import PlayControl from "../components/Main/PlayControl";
import Posts from "../components/Main/Posts";

export default function Home() {
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