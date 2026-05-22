import { Stack } from "expo-router";

export default function PhotoTagsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    />
  );
}
