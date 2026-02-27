import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";

// Module-level storage for pending action after auth
let pendingAction: (() => void) | null = null;

export function setPendingAction(action: (() => void) | null) {
  pendingAction = action;
}

export function getPendingAction(): (() => void) | null {
  return pendingAction;
}

export function clearPendingAction() {
  pendingAction = null;
}

/**
 * Hook that gates write actions behind authentication.
 *
 * Usage:
 *   const { requireAuth } = useRequireAuth();
 *   requireAuth(() => { createTribute(...) });
 *
 * If user is authenticated, the action runs immediately.
 * If user is a guest, the action is saved and the auth modal opens.
 * After successful login, the pending action resumes automatically.
 */
export function useRequireAuth() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (session) {
        // User is authenticated — run immediately
        action();
      } else {
        // Guest — save action and open auth modal
        setPendingAction(action);
        router.push("/(auth)/login");
      }
    },
    [session, router]
  );

  const isAuthenticated = !!session;

  return { requireAuth, isAuthenticated };
}
