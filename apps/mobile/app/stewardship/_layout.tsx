import { Stack } from "expo-router";

export default function StewardshipLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="transfer/[id]" />
      <Stack.Screen name="initiate" />
      <Stack.Screen name="valuation" />
      <Stack.Screen name="history" />
      <Stack.Screen name="successor" />
      <Stack.Screen name="score" />
      <Stack.Screen name="guardian" />
      <Stack.Screen name="purchase" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="marketplace/[id]" />
      <Stack.Screen name="marketplace/create" />
      <Stack.Screen name="analytics/[id]" />
    </Stack>
  );
}
