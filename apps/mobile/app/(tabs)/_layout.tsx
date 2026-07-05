import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, useColorScheme } from "react-native";
import { lightTap, useAuth, useMyPointBalance } from "@foreverr/core";
import { CreateFAB } from "@foreverr/ui";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAuth();
  const { data: pointBalance } = useMyPointBalance(user?.id);
  // Only gate once the real balance has loaded — undefined (guests, or
  // while loading) makes CreateFAB show every option, so an established
  // user never sees their unlocked options flash as "locked".
  const currentLevel = pointBalance ? (pointBalance as any).level ?? 1 : undefined;
  const currentPoints = (pointBalance as any)?.current_balance ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: Platform.OS !== "web",
          freezeOnBlur: Platform.OS !== "web",
          tabBarActiveTintColor: "#4A2D7A",
          tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
          tabBarStyle: {
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderTopColor: isDark ? "#1f2937" : "#f3f4f6",
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 88 : 64,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_500Medium",
            fontSize: 11,
          },
        }}
        screenListeners={{
          tabPress: () => {
            lightTap();
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "The Orbit",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Discover",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden from tab bar — FAB replaces it */}
        <Tabs.Screen
          name="create"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Echoes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Floating Action Button — replaces the old Create tab */}
      <CreateFAB
        onOptionPress={(route) => router.push(route as any)}
        currentLevel={currentLevel}
        currentPoints={currentPoints}
        onViewProgress={() => router.push("/points" as any)}
      />
    </View>
  );
}
