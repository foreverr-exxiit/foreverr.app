import { Stack } from "expo-router";

export default function AppreciationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2D1B4E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Appreciation Letters" }} />
      <Stack.Screen name="compose" options={{ title: "Write a Letter" }} />
    </Stack>
  );
}
