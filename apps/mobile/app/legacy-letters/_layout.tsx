import { Stack } from "expo-router";

export default function LegacyLettersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontWeight: "600" },
      }}
    />
  );
}
