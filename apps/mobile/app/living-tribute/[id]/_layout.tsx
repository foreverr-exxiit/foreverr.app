import { Stack } from "expo-router";

export default function LivingTributeDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tribute" }} />
      <Stack.Screen name="messages" options={{ title: "Messages" }} />
    </Stack>
  );
}
