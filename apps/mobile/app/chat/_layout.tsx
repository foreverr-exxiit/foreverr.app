import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#2D1B4E",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Messages" }} />
      <Stack.Screen name="[id]" options={{ title: "Chat" }} />
    </Stack>
  );
}
