import { Stack } from "expo-router";

export default function DailyPromptLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Daily Prompt" }} />
      <Stack.Screen name="feed" options={{ title: "Community Feed" }} />
    </Stack>
  );
}
