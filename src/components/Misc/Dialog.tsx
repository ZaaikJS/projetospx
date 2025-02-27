import React from "react";
import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

interface DialogProps {
    open: boolean;
    size: 'sm' | 'md' | 'lg';
    onClose: () => void;
    title: () => ReactNode;
    content: () => ReactNode;
}

interface DialogTitleProps {
    children: ReactNode;
}

interface DialogContentProps {
    children: ReactNode;
}

export default function Dialog({ open, size, onClose, title, content }: DialogProps) {
    const sizeClasses = {
        sm: "w-96",
        md: "w-1/2",
        lg: "w-2/3",
    };

    return (
        <div 
            className={`z-50 fixed inset-0 flex bg-black/50 justify-center pt-36 mt-8 backdrop-blur-xs transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div 
                className={`p-8 ${sizeClasses[size]} h-fit bg-gray-900 rounded-lg shadow-xl shadow-black/40 text-gray-200 transition-transform duration-300 ${open ? 'scale-100' : 'scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                <Dialog.Title>{title()}</Dialog.Title>
                    <FaTimes className="cursor-pointer" onClick={onClose} />
                </div>
                <Dialog.Content>{content()}</Dialog.Content>
            </div>
        </div>
    );
}

Dialog.Title = function Title({ children }: DialogTitleProps) {
    return <p className="text-lg">{children}</p>;
};

Dialog.Content = function Content({ children }: DialogContentProps) {
    return <div>{children}</div>;
};