import { Stack } from "expo-router";

export default function DailyPromptLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2D1B4E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Daily Prompt" }} />
      <Stack.Screen name="feed" options={{ title: "Community Feed" }} />
    </Stack>
  );
}
