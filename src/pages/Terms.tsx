import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from '../assets/images/logo.png';
import TermsText from "../components/Terms/TermsText";
import { useState } from "react";

export default function Terms() {
    const navigate = useNavigate();
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState(false)

    const handleTerms = () => {
        setTerms(!terms)
        setError(false)
    };

    const handleWriteFile = async () => {
        if (!terms) {
            setError(true);
            return;
        }

        try {
            const newData = { terms: terms };
            await window.electron.ipcRenderer.writeFile("terms.json", newData as any);
            localStorage.setItem('terms', 'true')
            navigate("/auth")
        } catch (error) {
            console.error('Erro ao escrever no arquivo:', error);
        }
    };

    return (
        <div className="p-8 w-5xl flex flex-col justify-center items-center bg-black/40 rounded-xl backdrop-blur-xs">
            <img src={logo} width={160} />
            <div className="pr-2 my-4 bg-black/40 rounded-xl">
                <div className="p-4 max-h-72 overflow-y-auto">
                    <TermsText />
                </div>
            </div>
            <div className="flex flex-col justify-center items-center mb-4">
                <div className="flex items-center">
                    <input
                        id="terms"
                        type="checkbox"
                        value=""
                        onChange={handleTerms}
                        className="w-5 h-5 text-amber-600 border-gray-300 rounded-sm focus:ring-amber-500"
                    />
                    <label htmlFor="terms" className="ms-2 text-base font-medium">Agree to Terms and Conditions</label>
                </div>
            </div>
            {error && (
                <span className="text-xs text-red-500 mb-4">You must accept the terms and conditions to proceed.</span>
            )}
            <button className="mcb" onClick={handleWriteFile}>Continue</button>
        </div>
    );
}