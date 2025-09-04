import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WhatsappState {
  connected: boolean;
  setConnected: (value: boolean) => void;
}

export const useWhatsapp = create<WhatsappState>()(
  persist(
    (set) => ({
      connected: false,
      setConnected: (value: boolean) => set({ connected: value }),
    }),
    {
      name: "whatsapp-storage",
    }
  )
);