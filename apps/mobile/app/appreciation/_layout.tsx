import { Stack } from "expo-router";

export default function AppreciationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Appreciation Letters" }} />
      <Stack.Screen name="compose" options={{ title: "Write a Letter" }} />
    </Stack>
  );
}
