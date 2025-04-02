import { useEffect, useState } from "react";

const Console = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleLog = (_: any, data: { console: string }) => {
      setLogs((prevLogs) => [...prevLogs, data.console]);
    };

    window.electron.ipcRenderer.on("consoleLog", handleLog);

    return () => {
        window.electron.ipcRenderer.removeAllListeners("consoleLog");
    };
  }, []);

  return (
    <div className="fixed top-0 w-full h-full p-4 z-50 bg-black text-neutral-200 h-screen overflow-auto">
      {logs.map((log, index) => (
        <p key={index} className="select">{log}</p>
      ))}
    </div> 
  );
};

export default Console;
