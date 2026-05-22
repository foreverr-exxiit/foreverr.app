import { useCallback } from "react";
import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ImportLayout() {
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
      <Stack.Screen name="index" options={{ title: "Import Center" }} />
      <Stack.Screen name="[source]" options={{ title: "Import" }} />
      <Stack.Screen name="gedcom" options={{ title: "GEDCOM Import" }} />
    </Stack>
  );
}
