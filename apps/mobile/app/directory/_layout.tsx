import { Stack } from "expo-router";

export default function DirectoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2D1B4E" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Funeral Directory" }} />
      <Stack.Screen name="[id]" options={{ title: "Business Details" }} />
    </Stack>
  );
}
