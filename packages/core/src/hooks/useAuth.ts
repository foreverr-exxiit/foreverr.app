import { useEffect, useCallback } from "react";
import { supabase } from "../supabase/client";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const { session, user, profile, isLoading, isInitialized, setSession, setProfile, setLoading, setInitialized, reset } =
    useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, ribbon_balance, is_verified, onboarding_completed")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      return { data, error };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: displayName },
        },
      });
      setLoading(false);
      return { data, error };
    },
    []
  );

  const signInWithApple = useCallback(async (identityToken: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
    });
    setLoading(false);
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    setLoading(false);
    return { data, error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "foreverr://reset-password",
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) reset();
    return { error };
  }, []);

  const updateProfile = useCallback(
    async (updates: { username?: string; display_name?: string; avatar_url?: string; bio?: string }) => {
      if (!user) return { error: new Error("Not authenticated") };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      if (data && !error && profile) {
        setProfile({ ...profile, ...data } as typeof profile);
      }
      return { data, error };
    },
    [user, profile]
  );

  return {
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
    resetPassword,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
