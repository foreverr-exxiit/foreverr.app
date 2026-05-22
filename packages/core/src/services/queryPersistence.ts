/**
 * TanStack Query Persistence — Offline Support
 *
 * Persists TanStack Query cache to AsyncStorage so the app works offline.
 * Uses expo-secure-store for small data and a custom AsyncStorage adapter.
 *
 * Usage in _layout.tsx:
 *   import { persistQueryClient } from "./queryPersistence";
 *   persistQueryClient(queryClient);
 */

import { Platform } from "react-native";
import type { QueryClient } from "@tanstack/react-query";

// ── Storage adapter ──────────────────────────────────────────

const CACHE_KEY = "FOREVERR_QUERY_CACHE";
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

// Simple localStorage-based persistence for web, AsyncStorage for native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    }
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return AsyncStorage.getItem(key);
    } catch {
      // AsyncStorage not installed — use in-memory fallback
      return inMemoryCache.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      return;
    }
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } catch {
      inMemoryCache.set(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      return;
    }
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem(key);
    } catch {
      inMemoryCache.delete(key);
    }
  },
};

const inMemoryCache = new Map<string, string>();

// ── Persistence logic ────────────────────────────────────────

// Keys that should be persisted for offline use
const PERSIST_KEYS = [
  "memorials",
  "memorial-detail",
  "memorial-milestones",
  "life-timeline",
  "milestone-templates",
  "lifecycle-stages",
  "global-search",
  "directory-listings",
  "user-profile",
  "notifications",
];

function shouldPersist(queryKey: unknown[]): boolean {
  const key = queryKey[0];
  if (typeof key !== "string") return false;
  return PERSIST_KEYS.some((k) => key.startsWith(k));
}

export async function persistQueryClient(queryClient: QueryClient): Promise<void> {
  // Restore from storage on startup
  try {
    const cached = await storage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < MAX_AGE) {
        // Hydrate cache
        for (const entry of data) {
          queryClient.setQueryData(entry.queryKey, entry.data);
        }
      } else {
        // Cache expired
        await storage.removeItem(CACHE_KEY);
      }
    }
  } catch {
    // Ignore restore errors
  }

  // Subscribe to cache changes and persist periodically
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    // Debounce saves to avoid excessive writes
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        const queries = queryClient.getQueryCache().getAll();
        const toPersist = queries
          .filter((q) => q.state.data !== undefined && shouldPersist(q.queryKey as unknown[]))
          .map((q) => ({
            queryKey: q.queryKey,
            data: q.state.data,
          }));

        if (toPersist.length > 0) {
          await storage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: toPersist })
          );
        }
      } catch {
        // Ignore persistence errors
      }
    }, 2000); // Save max every 2 seconds
  });

  // Cleanup not used in typical app lifecycle but available if needed
  void unsubscribe;
}

export async function clearQueryCache(): Promise<void> {
  await storage.removeItem(CACHE_KEY);
}
