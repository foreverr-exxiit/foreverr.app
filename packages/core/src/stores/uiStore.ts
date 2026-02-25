import { create } from "zustand";

interface UIState {
  colorScheme: "light" | "dark";
  toggleColorScheme: () => void;
  setColorScheme: (scheme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  colorScheme: "light",
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === "light" ? "dark" : "light",
    })),
  setColorScheme: (colorScheme) => set({ colorScheme }),
}));
