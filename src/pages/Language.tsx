import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import logo from '../assets/images/logo.png';

export default function Language() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<string | null>(null);

    const languages = [
        { code: 'en', text: 'Select your language' },
        { code: 'pt', text: 'Selecione seu idioma' },
        { code: 'es', text: 'Seleccione su idioma' },
        { code: 'zh', text: '选择您的语言' },
        { code: 'hi', text: 'अपनी भाषा चुनें' },
        { code: 'ar', text: 'اختر لغتك' },
    ];
    const [currentLanguage, setCurrentLanguage] = useState(0);
    const [fade, setFade] = useState('opacity-100');

    useEffect(() => {
        const interval = setInterval(() => {
            setFade('opacity-0');
            setTimeout(() => {
                setCurrentLanguage((prev) => (prev + 1) % languages.length);
                setFade('opacity-100');
            }, 300);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleWriteFile = async () => {
        if (!language) return;
        try {
            await window.electron.ipcRenderer.invoke("db:put", "preferences", "language", language);
            navigate("/terms");
        } catch (error) {
            console.error('Erro ao salvar no banco de dados:', error);
        }
    };

    return (
        <div className="p-8 w-5xl flex flex-col justify-center items-center gap-10 bg-black/40 rounded-xl backdrop-blur-xs">
            <img src={logo} width={160} />
            <h2 className={`text-3xl text-shadow transition-opacity duration-300 ${fade}`}>
                {languages[currentLanguage].text}
            </h2>
            <div className='flex flex-col w-96 bg-black/40 rounded-lg overflow-y-auto overflow-hidden max-h-36 cursor-default'>
                <div onClick={() => setLanguage("en_US")} className={`p-1 px-2 hover:bg-black/40 ${language === "en_US" && 'bg-black/40'}`}>English {'(United States)'}</div>
                <div onClick={() => setLanguage("pt_BR")} className={`p-1 px-2 hover:bg-black/40 ${language === "pt_BR" && 'bg-black/40'}`}>Português {'(Brasil)'}</div>
                <div onClick={() => setLanguage("es_ES")} className={`p-1 px-2 hover:bg-black/40 ${language === "es_ES" && 'bg-black/40'}`}>Español</div>
                <div onClick={() => setLanguage("zh_CN")} className={`p-1 px-2 hover:bg-black/40 ${language === "zh_CN" && 'bg-black/40'}`}>中國人</div>
                <div onClick={() => setLanguage("hi_IN")} className={`p-1 px-2 hover:bg-black/40 ${language === "hi_IN" && 'bg-black/40'}`}>हिन्दी</div>
                <div onClick={() => setLanguage("ar_SA")} className={`p-1 px-2 hover:bg-black/40 ${language === "ar_SA" && 'bg-black/40'}`}>عربي</div>
            </div>
            {language && (
                <button className="mcb" onClick={handleWriteFile}>Continue</button>
            )}
        </div>
    );
}