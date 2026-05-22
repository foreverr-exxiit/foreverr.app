import { Stack } from "expo-router";

export default function LivingTributeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Living Tributes" }} />
      <Stack.Screen name="create" options={{ title: "Create Living Tribute" }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
