import { FaTimes } from "react-icons/fa";
import { ReactNode } from "react";

interface DrawerProps {
    size: string;
    content: ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export default function Drawer({ size, content, isOpen, onClose }: DrawerProps) {
    return (
        <div
            className={`z-50 fixed inset-0 mt-8 flex bg-black/50 justify-end backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            onClick={onClose}
        >
            <div
                className={`relative p-4 h-full ${size} bg-gray-900 shadow-xl text-gray-200 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <FaTimes
                    className="absolute -left-8 top-2 text-2xl cursor-pointer opacity-40 hover:opacity-80 duration-75"
                    onClick={onClose}
                />
                <div>
                    {content}
                </div>
            </div>
        </div>
    );
}
