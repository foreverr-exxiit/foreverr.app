import { Stack } from "expo-router";

export default function MarketplaceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4A2D7A",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Marketplace" }} />
      <Stack.Screen name="[id]" options={{ title: "Listing" }} />
      <Stack.Screen name="create" options={{ title: "Create Listing" }} />
      <Stack.Screen name="seller/[id]" options={{ title: "Seller Profile" }} />
    </Stack>
  );
}
