import { useCallback } from "react";
import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

export default function UserProfileLayout() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerLeft: () => (
          <Pressable onPress={goBack} className="mr-2">
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="followers" options={{ title: "Connections" }} />
    </Stack>
  );
}
