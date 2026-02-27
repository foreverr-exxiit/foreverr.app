import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ImportLayout() {
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
      <Stack.Screen name="index" options={{ title: "Import Center" }} />
      <Stack.Screen name="[source]" options={{ title: "Import" }} />
      <Stack.Screen name="gedcom" options={{ title: "GEDCOM Import" }} />
    </Stack>
  );
}
