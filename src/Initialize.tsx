import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import auth from "./services/auth";

export default function Initialize() {
    const navigate = useNavigate();
    const [isValidLanguage, setIsValidLanguage] = useState<boolean | null>(null);
    const [isValidTerms, setIsValidTerms] = useState<boolean | null>(null);

    const allowedLanguages = ["en_US", "pt_BR", "es_ES", "zh_CN", "hi_IN", "ar_SA"];

    const checkData = async () => {
        try {
            const languageContent: any = await window.electron.ipcRenderer.cacheDb.get("preferences", "language");
            setIsValidLanguage(allowedLanguages.includes(languageContent));

            const termsContent: any = await window.electron.ipcRenderer.cacheDb.get("preferences", "terms");
            setIsValidTerms(termsContent === true);
        } catch (error) {
            setIsValidLanguage(false);
            setIsValidTerms(false);
        }
    };    

    useEffect(() => {
        checkData();
    }, []);
    
    useEffect(() => {
        if (isValidLanguage === null || isValidTerms === null) return;
    
        if (!isValidLanguage) {
            navigate("/lang");
            return;
        } 
    
        if (!isValidTerms) {
            navigate("/terms");
            return;
        }
    
        const checkSession = async () => {
            const session = await auth.getSession();
    
            if (session === "voxy" || session === "microsoft" || session === "offline") {
                navigate("/main");
            } else {
                navigate("/auth");
            }
        };
    
        checkSession();
    }, [isValidLanguage, isValidTerms, navigate]);       

    return null;
}