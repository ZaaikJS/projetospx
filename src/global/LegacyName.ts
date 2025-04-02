import { create } from "zustand";

interface LegacyNameState {
    legacyNameState: string;
    setLegacyNameState: (name: string) => void;
}

export const useLegacyName = create<LegacyNameState>((set) => ({
    legacyNameState: "",
  setLegacyNameState: (name) => set({ legacyNameState: name }),
}));