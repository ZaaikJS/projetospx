import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nome: string | null;
  email: string | null;
  setUser: (nome: string, email: string) => void;
  clearUser: () => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      nome: null,
      email: null,
      setUser: (nome, email) => set({ nome, email }),
      clearUser: () => set({ nome: null, email: null }),
    }),
    {
      name: "user-storage",
    }
  )
);