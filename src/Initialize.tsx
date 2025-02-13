import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Initialize() {
    const navigate = useNavigate();
    const [isValidLanguage, setIsValidLanguage] = useState<boolean | null>(null);
    const [isValidTerms, setIsValidTerms] = useState<boolean | null>(null);

    const allowedLanguages = ["en_US", "pt_BR", "es_ES", "zh_CN", "hi_IN", "ar_SA"];

    const checkFiles = async () => {
        try {
            const languageContent: any = await window.electron.ipcRenderer.readFile("language.json");
            if (languageContent && typeof languageContent === "object" && "language" in languageContent) {
                setIsValidLanguage(allowedLanguages.includes(languageContent.language));
            } else {
                setIsValidLanguage(false);
            }

            const termsContent: any = await window.electron.ipcRenderer.readFile("terms.json");
            if (termsContent && typeof termsContent === "object" && "terms" in termsContent) {
                setIsValidTerms(termsContent.terms === true);
            } else {
                setIsValidTerms(false);
            }
        } catch (error) {
            console.error("Erro ao ler os arquivos:", error);
            setIsValidLanguage(false);
            setIsValidTerms(false);
        }
    };

    useEffect(() => {
        checkFiles();
    }, []);

    useEffect(() => {
        if (isValidLanguage === false) {
            navigate("/lang");
        } else if (isValidTerms === false) {
            navigate("/terms");
        } else if (isValidLanguage === true && isValidTerms === true) {
            navigate("/auth");
        }
    }, [isValidLanguage, isValidTerms, navigate]);

    return (
        <>
        </>
    );
}
