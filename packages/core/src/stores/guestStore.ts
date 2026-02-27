import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Safe localStorage wrapper that works in both web and SSR contexts
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(name);
      }
    } catch {
      // Ignore — SSR or restricted environment
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(name, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(name);
      }
    } catch {
      // Ignore
    }
  },
};

interface GuestState {
  /** Memorial IDs bookmarked by guest (locally saved before sign-up) */
  savedMemorialIds: string[];
  /** Whether the user has seen the onboarding carousel */
  hasSeenOnboarding: boolean;
  /** Add a memorial to local bookmarks */
  saveMemorial: (id: string) => void;
  /** Remove a memorial from local bookmarks */
  unsaveMemorial: (id: string) => void;
  /** Check if a memorial is saved */
  isSaved: (id: string) => boolean;
  /** Mark onboarding as seen */
  setHasSeenOnboarding: (seen: boolean) => void;
  /** Clear all guest bookmarks (after syncing to server on sign-up) */
  clearSavedMemorials: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      savedMemorialIds: [],
      hasSeenOnboarding: false,
      saveMemorial: (id) =>
        set((state) => ({
          savedMemorialIds: state.savedMemorialIds.includes(id)
            ? state.savedMemorialIds
            : [...state.savedMemorialIds, id],
        })),
      unsaveMemorial: (id) =>
        set((state) => ({
          savedMemorialIds: state.savedMemorialIds.filter((mid) => mid !== id),
        })),
      isSaved: (id) => get().savedMemorialIds.includes(id),
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      clearSavedMemorials: () => set({ savedMemorialIds: [] }),
    }),
    {
      name: "foreverr-guest-store",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
