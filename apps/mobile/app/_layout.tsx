import { useEffect, useState } from "react";
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
} from "@foreverr/core";
import { ErrorBoundary } from "@foreverr/ui";
import { features } from "@foreverr/config";

import "../global.css";

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
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  // Push notification registration
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(user.id, token);
      }
      await clearBadgeCount();
    })();
  }, [isAuthenticated, user?.id]);

  // Push notification tap listener
  useEffect(() => {
    const cleanup = setupNotificationListeners((url) => {
      router.push(url as any);
    });
    return cleanup;
  }, [router]);

  // Onboarding redirect — new guests who haven't seen onboarding get routed there once
  useEffect(() => {
    if (!isInitialized || onboardingChecked) return;

    if (
      features.onboardingEnabled &&
      !isAuthenticated &&
      !hasSeenOnboarding &&
      segments[0] !== "onboarding"
    ) {
      router.replace("/onboarding");
    }
    setOnboardingChecked(true);
  }, [isInitialized, isAuthenticated, hasSeenOnboarding, onboardingChecked, segments]);

  if (!isInitialized) return null;

  // Content-first UX: ALL users land on (tabs) immediately.
  // Auth screens are a modal that slides up only when triggered by write actions.
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="memorial" options={{ headerShown: false }} />
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
        <Stack.Screen name="lifecycle" options={{ headerShown: false }} />
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
