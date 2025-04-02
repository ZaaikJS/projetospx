import { useEffect, useState } from "react";
import { IoMdExit } from "react-icons/io";
import auth from "../services/auth";
import { useNavigate, useLocation } from "react-router-dom";
import bust from '../assets/images/bust.png';
import voxyLogo from '../assets/images/logo_v.png';
import msLogo from '../assets/images/microsoft_logo_icon.png';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [jump, setJump] = useState(false);
    const [skinUrl, setSkinUrl] = useState(bust);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [username, setUsername] = useState<string | null>(null);
    const [tagName, setTagName] = useState<string | null>(null);
    const [loginMode, setLoginMode] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await auth.getData();

            if (userData === null) {
                return;
            }

            setLoginMode(userData.loginMode)
            setUsername(userData.username)
            setTagName(userData.tagName)

            if (userData.username) {
                setSkinUrl(`https://starlightskins.lunareclipse.studio/render/pointing/${userData.username}/bust?borderHighlight=true&borderHighlightRadius=10`);
            }
        };

        fetchUserData();
    }, []);

    const logout = async () => {
        try {
            auth.destroySession();
            navigate('/auth');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const logIcon = () => {
        switch (loginMode) {
            case 'voxy':
                return <img draggable={false} src={voxyLogo} alt="Voxy Account" width={14} />;
            case 'microsoft':
                return <img draggable={false} src={msLogo} alt="Microsoft" width={14} />;
            default:
                return null;
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleMouseEnter = (buttonName: any) => {
        setHoveredButton(buttonName);
    };

    const handleMouseLeave = () => {
        setHoveredButton(null);
    };

    return (
        <>
            <div className="flex gap-4 w-full h-20 py-4 pr-4">
                <div className="flex items-center gap-4 w-full h-full px-4 bg-white/10 rounded-xl shadow-lg -text-semibold">
                    <button
                        className={`uppercase cursor-pointer relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:w-0 after:max-w-[2rem] after:h-[2px] after:bg-amber-500 after:transition-all after:duration-300 hover:after:w-full hover:after:translate-x-[-50%] ${isActive('/main') ? 'after:w-full after:translate-x-[-50%]' : ''}`}
                        onClick={() => navigate('/main')}
                        onMouseEnter={() => handleMouseEnter('home')}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            textShadow: isActive('/main') || hoveredButton === 'home' ? '0px 0px 20px rgba(255, 235, 59, 0.3)' : 'none',
                        }}
                    >
                        Home
                    </button>
                    <button
                        className={`uppercase cursor-pointer relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:w-0 after:max-w-[2rem] after:h-[2px] after:bg-green-500 after:transition-all after:duration-300 hover:after:w-full hover:after:translate-x-[-50%] ${isActive('/main/installs') ? 'after:w-full after:translate-x-[-50%]' : ''}`}
                        onClick={() => navigate('/main/installs')}
                        onMouseEnter={() => handleMouseEnter('installs')}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            textShadow: isActive('/main/installs') || hoveredButton === 'installs' ? '0px 0px 20px rgba(76, 175, 80, 0.3)' : 'none',
                        }}
                    >
                        Installations
                    </button>
                    <button
                        className={`uppercase cursor-pointer relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:w-0 after:max-w-[2rem] after:h-[2px] after:bg-pink-500 after:transition-all after:duration-300 hover:after:w-full hover:after:translate-x-[-50%] ${isActive('/main/skins') ? 'after:w-full after:translate-x-[-50%]' : ''}`}
                        onClick={() => navigate('/main/skins')}
                        onMouseEnter={() => handleMouseEnter('skins')}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            textShadow: isActive('/main/skins') || hoveredButton === 'skins' ? '0px 0px 20px rgba(233, 30, 99, 0.3)' : 'none',
                        }}
                    >
                        Skins
                    </button>
                    <button
                        className={`uppercase cursor-pointer relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:w-0 after:max-w-[2rem] after:h-[2px] after:bg-orange-800 after:transition-all after:duration-300 hover:after:w-full hover:after:translate-x-[-50%] ${isActive('/main/options') ? 'after:w-full after:translate-x-[-50%]' : ''}`}
                        onClick={() => navigate('/main/options')}
                        onMouseEnter={() => handleMouseEnter('options')}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            textShadow: isActive('/main/options') || hoveredButton === 'options' ? '0px 0px 20px rgba(245, 124, 0, 0.3)' : 'none',
                        }}
                    >
                        Options
                    </button>
                </div>
                <div
                    className="relative w-96 flex items-center h-full px-4 bg-white/10 rounded-xl shadow-lg"
                    onMouseEnter={() => setJump(true)}
                    onMouseLeave={() => setJump(false)}
                >
                    <div className="absolute h-16 w-18 bottom-0 left-1 overflow-hidden">
                        <img
                            draggable={false}
                            className={`absolute ${jump ? "bottom-0" : "-bottom-1.5"} h-16 drop-shadow-lg transition-all duration-300`}
                            src={skinUrl}
                            onError={() => {
                                setSkinUrl(bust);
                            }}
                            alt="Player Skin"
                        />
                    </div>
                    <div className="flex flex-col justify-center ml-16">
                        <div className="flex items-center gap-1.5">
                            <p className="-text-semibold">
                                {username}
                                {tagName && tagName.length > 3 && <span className="text-xs opacity-30">#{tagName}</span>}
                            </p>
                            <p className="text-xs text-neutral-400">{logIcon()}</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <IoMdExit
                            className="text-neutral-300 cursor-pointer hover:text-neutral-100 duration-100"
                            onClick={logout}
                            aria-label="Logout"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}