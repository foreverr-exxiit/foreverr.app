import { Stack } from "expo-router";

export default function CreateMemorialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="details" />
      <Stack.Screen name="media" />
    </Stack>
  );
}
