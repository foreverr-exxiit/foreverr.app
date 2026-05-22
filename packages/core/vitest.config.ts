import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Provide dummy Supabase env vars so importing the client during a
// test doesn't trip validateSupabaseUrl. Tests that actually hit the
// network should mock `supabase.from(...)` explicitly.
process.env.EXPO_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

export default defineConfig({
  // React Native / Metro defines __DEV__ globally. Tests run in node,
  // so we shim it as `true` so dev-only branches (console fallbacks,
  // logs) are exercised.
  define: {
    __DEV__: "true",
  },
  resolve: {
    alias: {
      // Real react-native uses Flow + native bridges that can't be
      // parsed/resolved in plain Node. Replace with a tiny stub for
      // tests; per-test vi.mock can override when richer behavior is
      // needed.
      "react-native": resolve(
        __dirname,
        "src/services/__tests__/__mocks__/react-native.ts",
      ),
      "expo-secure-store": resolve(
        __dirname,
        "src/services/__tests__/__mocks__/expo-secure-store.ts",
      ),
      "expo-modules-core": resolve(
        __dirname,
        "src/services/__tests__/__mocks__/expo-modules-core.ts",
      ),
    },
  },
  test: {
    // Node env — most of @foreverr/core is pure logic + Supabase client.
    // Tests that exercise React Native modules should be added with
    // happy-dom env and explicit jest-style mocks for "react-native".
    environment: "node",
    globals: false,
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "src/**/__tests__/**",
        "src/types/**",
        "src/supabase/types.ts",
      ],
    },
  },
});
