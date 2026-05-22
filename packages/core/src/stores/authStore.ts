import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    ribbon_balance: number;
    is_verified: boolean;
    onboarding_completed: boolean;
    trust_level?: number;
    premium_tier?: number;
    legacy_link_slug?: string | null;
    prompt_streak?: number;
    role?: string;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    feature_tier?: number;
    stewardship_score?: number;
    is_guardian_subscriber?: boolean;
    [key: string]: unknown;
  } | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AuthState["profile"]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () =>
    set({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    }),
}));
