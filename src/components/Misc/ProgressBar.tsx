import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    content: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, content }) => {

    const progress = (current / total) * 100;

    return (
        <div className="relative w-full bg-white/10 h-6">
            <div
                className="absolute bg-green-400/60 h-6"
                style={{ width: `${progress}%` }}
            >
                <span className='ml-2 whitespace-nowrap opacity-80'>
                    {content}
                </span>
            </div>
        </div>
    );
};

export default ProgressBar;