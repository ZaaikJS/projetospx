import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Importando o ícone
import "./PlayControl.css"
import playBg from "../../assets/images/play/1.jpg"
import ProgressBar from "../Misc/ProgressBar";
import { ReactNode, useEffect, useState } from "react";
import auth from "../../services/auth";
import { useNavigate } from "react-router-dom";
import player from "../../services/player";
import Dialog from "../Misc/Dialog";
import axios from "axios";
import toast from "react-hot-toast";

export default function PlayControl() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);
  const [playerData, setPlayerData] = useState<any | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, type: "" });
  const [insName, setInsName] = useState('');
  const [version, setVersion] = useState('');
  const [minecraftRunning, setMinecraftRunning] = useState(false);
  const [dialogLName, setDialogLName] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const fetchUserData = await auth.getData();
      if (!fetchUserData) {
        return navigate('/auth');
      }

      setUserData(fetchUserData);
    };

    fetchUserData();
  }, []);

  // Fetch player data if login mode is "voxy"
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (userData?.loginMode === "voxy") {
        const token = localStorage.getItem('refreshToken');
        if (!token) {
          return navigate('/auth');
        }

        const fetchPlayerData = await player.getData(token);
        if (!fetchPlayerData) {
          return navigate('/auth');
        }

        setPlayerData(fetchPlayerData);
      }
    };

    fetchPlayerData();
  }, [userData]);

  // Update download progress
  useEffect(() => {
    window.electron.ipcRenderer.on("download-progress", (event, data) => {
      setProgress(data);
    });

    window.electron.ipcRenderer.on("download-complete", (event, data) => {
      setProgress({ current: 0, total: 0, type: "" });
    });

    window.electron.ipcRenderer.on("minecraft-started", () => {
      setMinecraftRunning(true);
    });

    window.electron.ipcRenderer.on("minecraft-closed", () => {
      setMinecraftRunning(false);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("download-progress");
      window.electron.ipcRenderer.removeAllListeners("download-complete");
    };
  }, []);

  // Handle Minecraft launch
  const handleLaunch = async (version: string, type: string, loginMode: string | null, uuid: string | null, name: string | null) => {
    try {
      const result = await window.electron.ipcRenderer.launchMinecraft(version, type, loginMode, uuid, name);
      if (!result.success) {
        alert("Erro ao iniciar Minecraft: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao lançar Minecraft:", error);
    }
  };

  const playFullPvP = () => {
    let uuid: string | null = null;
    let username: string | null = null;

    if (playerData?.uuid) {
      uuid = playerData.uuid;
    } else if (userData?.loginMode === "offline") {
      uuid = "03be0ef8-b317-4302-b218-35731881e0cc";
    }

    if (userData?.username && userData?.tagName) {
      username = `${userData.username}#${userData.tagName}`;
    } else if (userData?.loginMode === "offline") {
      username = userData.username;
    }

    setInsName('VoxyMC FullPvP');
    setVersion('1.8.9');

    handleLaunch("1.8.9", "release", userData?.loginMode, uuid, username);
  };

  const playMinigames = () => {
    let uuid: string | null = null;
    let username: string | null = null;

    if (playerData?.uuid) {
      uuid = playerData.uuid;
    } else if (userData?.loginMode === "offline") {
      uuid = "03be0ef8-b317-4302-b218-35731881e0cc";
    }

    if (userData?.username && userData?.tagName) {
      username = `${userData.username}#${userData.tagName}`;
    } else if (userData?.loginMode === "offline") {
      username = userData.username;
    }

    setInsName('VoxyMC Minigames');
    setVersion('1.18.2');

    handleLaunch("1.18.2", "release", userData?.loginMode, uuid, username);
  };

  return (
    <>
      <div className="relative h-72 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg shadow-black/20">
        <div className="relative h-full bg-white/10">
          <div className="relative w-full h-full overflow-hidden flex justify-center items-center shine-image group">
            <img draggable={false}
              className="object-cover w-full h-full opacity-80 scale-100 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
              src={playBg}
              alt="VoxyMC"
            />
            <div className="absolute flex gap-36">
              {minecraftRunning ? (
                <button
                  className="relative w-52 h-18 bg-neutral-500/80 shadow-md shadow-neutral-500/80 text-white/80 btn-text-shadow font-bold flex flex-col items-center justify-center overflow-hidden rounded-xl transition-all duration-300"
                >
                  <span className="z-10 text-base">Running</span>
                  <span className="z-10">{insName}</span>
                  <span className="z-10 text-[10px] font-extralight opacity-90">{version}</span>

                  <div
                    className="absolute top-0 left-0 w-full h-full bg-white/10"
                    style={{
                      clipPath: 'circle(360% at 50% -660%)',
                    }}
                  ></div>
                </button>
              ) : (
                <>
                  <button
                    className="relative w-52 h-18 active:bg-red-500/70 bg-red-500/80 shadow-md shadow-red-500/80 text-white btn-text-shadow font-bold flex flex-col items-center justify-center overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:bg-red-500/85 hover:shadow-lg"
                    onClick={playFullPvP}
                  >
                    <span className="z-10">Play</span>
                    <span className="z-10">VoxyMC FullPvP</span>
                    <span className="z-10 text-[10px] font-extralight opacity-90">Version 1.8.9 </span>

                    <div
                      className="absolute top-0 left-0 w-full h-full bg-white/10"
                      style={{
                        clipPath: 'circle(360% at 50% -660%)',
                      }}
                    ></div>
                  </button>

                  <button
                    className="relative w-52 h-18 active:bg-amber-500/80 bg-amber-500/90 shadow-md shadow-amber-500/80 text-white btn-text-shadow font-bold flex flex-col items-center justify-center overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:bg-amber-500/85 hover:shadow-lg"
                    onClick={playMinigames}
                  >
                    <span className="z-10">Play</span>
                    <span className="z-10">VoxyMC Minigames</span>
                    <span className="z-10 text-[10px] font-extralight opacity-90">Release 1.18.2 </span>

                    <div
                      className="absolute top-0 left-0 w-full h-full bg-white/20"
                      style={{
                        clipPath: 'circle(360% at 50% -660%)',
                      }}
                    ></div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 w-full ${progress.type.length > 0 ? 'block' : 'hidden'}`}>
          <ProgressBar current={progress.current} total={progress.total} content={`Downloading ${progress.type}... ${progress.current} / ${progress.total}`} />
        </div>
      </div>
    </>
  );
}
