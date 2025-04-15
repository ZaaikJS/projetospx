export default function Loading() {
    return (
        <div className="loading-bg w-full h-screen flex justify-center items-center">
            <div className="flex items-center">
                <span className="loader"></span>
                <p className="minecraftia text-2xl ml-4 mt-4">Loading...</p>
            </div>
        </div>
    );
}