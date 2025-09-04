import { useEffect, useState } from 'react';
import { CgSpinner, CgCheckO } from "react-icons/cg";

interface WhatsappStatus {
  connected: boolean;
  qr: string | null;
}

export default function Whatsapp() {
  const [status, setStatus] = useState<WhatsappStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    window.electron.ipcRenderer
      .invoke('whatsapp-get-status')
      .then((data: WhatsappStatus) => {
        if (mounted) setStatus(data);
      })
      .catch(() => { /* tratar erro */ });

    const listener = (_: unknown, data: WhatsappStatus) => {
      if (mounted) setStatus(data);
    };

    window.electron.ipcRenderer.on('whatsapp-status', listener);

    return () => {
      mounted = false;
      // remove apenas este listener
      if (window.electron?.ipcRenderer?.removeListener) {
        window.electron.ipcRenderer.removeListener('whatsapp-status', listener);
      } else {
        (window.electron.ipcRenderer as any).removeAllListeners?.('whatsapp-status');
      }
    };
  }, []);

  if (!status) {
    return (
      <div className="w-fit mx-auto p-8 bg-white shadow-lg text-neutral-950 flex flex-col items-center text-center gap-4">
        <CgSpinner className='text-3xl animate-spin' />
        <p>Carregando status do Whatsapp...</p>
      </div>
    );
  }

  return (
    <div className="w-fit mx-auto p-8 bg-white shadow-lg text-neutral-950 flex flex-col items-center text-center gap-4">
      {status.connected ? (
        <div className='contents'>
          <CgCheckO className='text-3xl' />
          <p>WhatsApp conectado</p>
        </div>
      ) : (
        <div>
          <p>WhatsApp desconectado</p>
          <p className="mb-4 text-xs">Escaneie o QRCode abaixo para conectar</p>
          {status.qr ? (
            <img
              src={status.qr}
              alt="QR Code"
              className="mx-auto"
              style={{ width: 250, height: 250, objectFit: 'contain' }}
            />
          ) : (
            <p>Aguardando QR Code...</p>
          )}
        </div>
      )}
    </div>
  );
}
