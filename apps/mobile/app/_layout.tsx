import { useEffect, useRef, useState } from "react";
import { Platform, useColorScheme } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useAuth,
  useGuestStore,
  registerForPushNotifications,
  savePushToken,
  setupNotificationListeners,
  clearBadgeCount,
  initErrorReporting,
} from "@foreverr/core";
import { ErrorBoundary } from "@foreverr/ui";
import { features } from "@foreverr/config";

import "../global.css";

// Initialize error reporting before anything else can throw.
// No-op if @sentry/react-native isn't installed or DSN isn't set —
// see packages/core/src/services/errorReporting.ts for activation steps.
initErrorReporting({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutInner() {
  const { isInitialized, isAuthenticated, user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const hasSeenOnboarding = useGuestStore((s) => s.hasSeenOnboarding);
  const onboardingCheckedRef = useRef(false);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  // Push notification registration — native only.
  // expo-notifications calls into native modules that throw on web.
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!isAuthenticated || !user?.id) return;

    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(user.id, token);
      }
      await clearBadgeCount();
    })();
  }, [isAuthenticated, user?.id]);

  // Push notification tap listener — native only (same reason).
  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const cleanup = setupNotificationListeners((url) => {
      router.push(url as any);
    });
    return cleanup;
  }, [router]);

  // Onboarding / guest stories redirect — only fires once per app launch.
  // Uses a ref (not state) so the guard takes effect synchronously, preventing
  // infinite re-render loops caused by router.replace changing segments.
  // IMPORTANT: Public content routes (memorial, events, etc.) are never
  // redirected so unauthenticated users can view shared links.
  useEffect(() => {
    if (!isInitialized || onboardingCheckedRef.current) return;

    // Mark checked BEFORE any navigation to prevent re-entry
    onboardingCheckedRef.current = true;

    // Routes that should be publicly accessible without auth or onboarding
    const publicRoutes = [
      "lifecycle", "stories", "onboarding", "(auth)", "explore",
      "events", "directory", "marketplace", "user", "living-tribute",
      "donate", "lifecycle", "wedding", "pet",
    ];
    const currentRoute = segments[0] as string;
    const isPublicRoute = publicRoutes.includes(currentRoute);

    // Never redirect if already on a public content route (e.g. shared link)
    if (isPublicRoute) return;

    if (
      features.onboardingEnabled &&
      !isAuthenticated &&
      !hasSeenOnboarding
    ) {
      // Brand-new guest → show onboarding first
      router.replace("/onboarding");
    } else if (!isAuthenticated) {
      // Returning guest (past onboarding) → immersive stories landing
      router.replace("/stories");
    }
  }, [isInitialized, isAuthenticated, hasSeenOnboarding]);

  if (!isInitialized) return null;

  // Content-first UX: ALL users land on (tabs) immediately.
  // Auth screens are a modal that slides up only when triggered by write actions.
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lifecycle" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="memory-vault" />
        <Stack.Screen name="family-tree" />
        <Stack.Screen name="legacy-letters" />
        <Stack.Screen name="scrapbook" />
        <Stack.Screen name="qr-codes" />
        <Stack.Screen name="memory-prompts" />
        <Stack.Screen name="streaks" />
        <Stack.Screen name="seasonal-decorations" />
        <Stack.Screen name="resources" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="stories" options={{ headerShown: false }} />
        <Stack.Screen name="donate" options={{ headerShown: false }} />
        <Stack.Screen name="marketplace" options={{ headerShown: false }} />
        <Stack.Screen name="directory" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="virtual-space" options={{ headerShown: false }} />
        <Stack.Screen name="activity" options={{ headerShown: false }} />
        <Stack.Screen name="badges" options={{ headerShown: false }} />
        <Stack.Screen name="user" options={{ headerShown: false }} />
        <Stack.Screen name="legacy-link" options={{ headerShown: false }} />
        <Stack.Screen name="living-tribute" options={{ headerShown: false }} />
        <Stack.Screen name="appreciation" options={{ headerShown: false }} />
        <Stack.Screen name="daily-prompt" options={{ headerShown: false }} />
        <Stack.Screen name="reminders" options={{ headerShown: false }} />
        <Stack.Screen name="invite" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="gifts" options={{ headerShown: false }} />
        <Stack.Screen name="points" options={{ headerShown: false }} />
        <Stack.Screen name="trust" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ headerShown: false }} />
        <Stack.Screen name="announce" options={{ headerShown: false }} />
        <Stack.Screen name="billing" options={{ headerShown: false }} />
        <Stack.Screen name="timeline" options={{ headerShown: false }} />
        <Stack.Screen name="milestones" options={{ headerShown: false }} />
        <Stack.Screen name="photo-tags" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="wedding" options={{ headerShown: false }} />
        <Stack.Screen name="pet" options={{ headerShown: false }} />
        <Stack.Screen name="quests" options={{ headerShown: false }} />
        <Stack.Screen name="creator" options={{ headerShown: false }} />
        <Stack.Screen name="services" options={{ headerShown: false }} />
        <Stack.Screen name="honor-fundraiser" options={{ headerShown: false }} />
        <Stack.Screen name="honor-day" options={{ headerShown: false }} />
        <Stack.Screen name="licensing" options={{ headerShown: false }} />
        <Stack.Screen name="channel" options={{ headerShown: false }} />
        <Stack.Screen name="grief-coaching" options={{ headerShown: false }} />
        <Stack.Screen name="celebrity" options={{ headerShown: false }} />
        <Stack.Screen name="verification" options={{ headerShown: false }} />
        <Stack.Screen name="stewardship" options={{ headerShown: false }} />
        <Stack.Screen name="baby" options={{ headerShown: false }} />
        <Stack.Screen name="relationship" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  // On web, font loading can time out — don't block the entire app.
  // After 3s on web, proceed without custom fonts (system fonts will be used).
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    if (Platform.OS === "web" && !fontsLoaded && !fontError) {
      const timer = setTimeout(() => setFontTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  const fontsReady = fontsLoaded || fontError || fontTimeout;
  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <RootLayoutInner />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
