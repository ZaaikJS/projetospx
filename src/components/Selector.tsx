import { Link, useLocation } from "react-router-dom";
import logo from '../assets/images/logo.png';
import logoV from '../assets/images/logo_v.png';
import mcLogo from '../assets/images/mc-logo.png';

export default function Selector() {
    const location = useLocation();

    return (
        <>
            <div className="w-20 h-full">
                <div className="flex flex-col items-center">
                    <img className="p-3" src={logo} alt="Logo" />
                    <div className="w-20 flex flex-col gap-4">
                        <Link
                            className={`mr-2 flex justify-center items-center h-16 rounded-r-2xl hover:bg-white/10 hover:shadow-lg duration-75 ${location.pathname === "/main" && "bg-white/10 shadow-lg"}`}
                            to="/main"
                        >
                            <img className="ml-2" src={logoV} alt="Logo V" width={45} />
                        </Link>
                        <Link
                            className={`mr-2 flex justify-center items-center h-16 rounded-r-2xl hover:bg-white/10 hover:shadow-lg duration-75 ${location.pathname === "/main/minecraft" && "bg-white/10 shadow-lg"}`}
                            to="/main/minecraft"
                        >
                            <img className="ml-2 rounded-xl" src={mcLogo} alt="MC Logo" width={45} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}