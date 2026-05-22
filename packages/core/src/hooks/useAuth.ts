import { useEffect, useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { supabase } from "../supabase/client";
import { useAuthStore } from "../stores/authStore";
import { getPendingAction, clearPendingAction } from "./useRequireAuth";

/* ------------------------------------------------------------------ */
/*  Module-level singleton — auth listeners registered ONCE globally.  */
/*  Prevents N components × N listeners = N² store mutations that      */
/*  overflow React's render limit (Error #310).                        */
/* ------------------------------------------------------------------ */

let _authInitialized = false;
let _initialSessionHandled = false;
let _profileFetchingForUser: string | null = null;

function fetchProfile(userId: string) {
  // Deduplicate: if we're already fetching for this exact user, skip.
  if (_profileFetchingForUser === userId) return;
  _profileFetchingForUser = userId;

  supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
    .then(({ data, error }) => {
      _profileFetchingForUser = null;
      if (error) {
        console.warn("[useAuth] profile fetch failed:", error.message);
        return;
      }
      if (data) {
        useAuthStore.getState().setProfile(data as any);
      }
    });
}

function initAuth() {
  if (_authInitialized) return;
  _authInitialized = true;

  // Register onAuthStateChange FIRST, but it will skip the initial
  // INITIAL_SESSION event because _initialSessionHandled is false.
  // This prevents the duplicate fetchProfile that caused Error #310.
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      // Skip the INITIAL_SESSION event — getSession() handles it below.
      // Supabase fires INITIAL_SESSION synchronously when onAuthStateChange
      // is registered, which duplicates the getSession() result.
      if (!_initialSessionHandled) return;

      useAuthStore.setState({
        session,
        user: session?.user ?? null,
      });
      if (session?.user) {
        fetchProfile(session.user.id);
        const pending = getPendingAction();
        if (pending) {
          setTimeout(() => {
            pending();
            clearPendingAction();
          }, 300);
        }
      } else {
        useAuthStore.setState({ profile: null });
      }
    }
  );

  // Get initial session — single source of truth for first load.
  // BATCH all updates into ONE set() call to minimize re-renders.
  supabase.auth.getSession().then(({ data: { session } }) => {
    // Set initialized state in ONE atomic update
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      isLoading: false,
      isInitialized: true,
    });

    // NOW allow onAuthStateChange to process future events
    _initialSessionHandled = true;

    if (session?.user) {
      fetchProfile(session.user.id);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  useAuth — safe to call from any number of components.              */
/*                                                                     */
/*  Uses ONE useShallow selector (= ONE useSyncExternalStore sub)      */
/*  instead of 8 individual selectors. This drastically reduces the    */
/*  number of concurrent subscriptions and torn-read retries.          */
/* ------------------------------------------------------------------ */

export function useAuth() {
  // ONE selector → ONE useSyncExternalStore subscription per component.
  // useShallow does a shallow-equal comparison on the returned object,
  // so it only triggers a re-render if an actual field value changed.
  const { session, user, profile, isLoading, isInitialized } =
    useAuthStore(useShallow((s) => ({
      session: s.session,
      user: s.user,
      profile: s.profile,
      isLoading: s.isLoading,
      isInitialized: s.isInitialized,
    })));

  // Initialize auth once on first mount of any useAuth() consumer.
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      initAuth();
    }
  }, []);

  // All callbacks use getState() inside the body for stable references.
  // This means their useCallback deps are [] (empty), so they never change.
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      useAuthStore.getState().setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      useAuthStore.getState().setLoading(false);
      return { data, error };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      useAuthStore.getState().setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, display_name: displayName } },
      });
      useAuthStore.getState().setLoading(false);
      return { data, error };
    },
    []
  );

  const signInWithApple = useCallback(async (identityToken: string) => {
    useAuthStore.getState().setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: identityToken });
    useAuthStore.getState().setLoading(false);
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    useAuthStore.getState().setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
    useAuthStore.getState().setLoading(false);
    return { data, error };
  }, []);

  const signInWithFacebook = useCallback(async (accessToken: string) => {
    useAuthStore.getState().setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: "facebook", token: accessToken });
    useAuthStore.getState().setLoading(false);
    return { data, error };
  }, []);

  const signInWithTwitter = useCallback(async (accessToken: string, _accessTokenSecret?: string) => {
    useAuthStore.getState().setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: "twitter" as any, token: accessToken });
    useAuthStore.getState().setLoading(false);
    return { data, error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "eterrn://reset-password",
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) useAuthStore.getState().reset();
    return { error };
  }, []);

  const updateProfile = useCallback(
    async (updates: { username?: string; display_name?: string; avatar_url?: string; bio?: string }) => {
      const currentUser = useAuthStore.getState().user;
      const currentProfile = useAuthStore.getState().profile;
      if (!currentUser) return { error: new Error("Not authenticated") };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUser.id)
        .select()
        .single();
      if (data && !error && currentProfile) {
        useAuthStore.getState().setProfile({ ...currentProfile, ...data } as typeof currentProfile);
      }
      return { data, error };
    },
    []
  );

  const refreshProfile = useCallback(() => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) fetchProfile(currentUser.id);
  }, []);

  // useMemo prevents creating a new object reference on every render.
  // The deps are now ALL stable (callbacks have [] deps), so this
  // only recalculates when actual auth state values change.
  return useMemo(() => ({
    session,
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    signInWithEmail,
    signUpWithEmail,
    signInWithApple,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    resetPassword,
    signOut,
    updateProfile,
    refreshProfile,
  }), [session, user, profile, isLoading, isInitialized]);
  // Note: callbacks omitted from deps because they have [] deps (never change)
}
