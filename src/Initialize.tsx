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
            const languageContent: any = await window.electron.ipcRenderer.db.get("language");
            if (languageContent && typeof languageContent === "object" && "language" in languageContent) {
                setIsValidLanguage(allowedLanguages.includes(languageContent.language));
            } else {
                setIsValidLanguage(false);
            }
    
            const termsContent: any = await window.electron.ipcRenderer.db.get("terms");
            if (termsContent && typeof termsContent === "object" && "terms" in termsContent) {
                setIsValidTerms(termsContent.terms === true);
            } else {
                setIsValidTerms(false);
            }
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
    
        if (isValidLanguage === false) {
            navigate("/lang");
            return;
        } 
    
        if (isValidTerms === false) {
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
