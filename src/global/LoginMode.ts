import { create } from "zustand";

interface LoginModeState {
    LoginModeState: string;
    setLoginModeState: (name: string) => void;
}

export const useLoginMode = create<LoginModeState>((set) => ({
    LoginModeState: "",
  setLoginModeState: (name) => set({ LoginModeState: name }),
}));