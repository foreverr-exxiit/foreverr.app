import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#2D1B4E",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Events" }} />
      <Stack.Screen name="[id]" options={{ title: "Event Details" }} />
      <Stack.Screen name="create" options={{ title: "Create Event", presentation: "modal" }} />
    </Stack>
  );
}
