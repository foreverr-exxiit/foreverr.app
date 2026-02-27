import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TrustLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2D1B4E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Trust & Verification" }} />
      <Stack.Screen name="claim" options={{ title: "Claim Memorial" }} />
    </Stack>
  );
}
