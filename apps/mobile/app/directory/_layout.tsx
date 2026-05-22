import { Stack } from "expo-router";

export default function DirectoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Funeral Directory" }} />
      <Stack.Screen name="[id]" options={{ title: "Business Details" }} />
    </Stack>
  );
}
