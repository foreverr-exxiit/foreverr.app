import { View, ScrollView, Pressable, Switch, Alert, Linking } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useGuestStore } from "@foreverr/core";
import { Text } from "@foreverr/ui";

type SettingsItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  type: "navigate" | "toggle" | "action";
  route?: string;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeAuto, setDarkModeAuto] = useState(true);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile" as any);
    }
  }, [router]);

  const accountItems: SettingsItem[] = [
    { icon: "person-outline", label: "Edit Profile", color: "#4A2D7A", type: "navigate", route: "/profile/edit" },
    { icon: "card-outline", label: "Subscription & Billing", color: "#7C3AED", type: "navigate", route: "/billing" },
    { icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#059669", type: "navigate", route: "/settings/privacy" },
    { icon: "link-outline", label: "Core Link", color: "#7C3AED", type: "navigate", route: "/legacy-link" },
  ];

  const preferencesItems: SettingsItem[] = [
    { icon: "language-outline", label: "Language", color: "#2563EB", type: "navigate", route: "/settings/language" },
  ];

  const supportItems: SettingsItem[] = [
    { icon: "help-circle-outline", label: "Help & Support", color: "#2563EB", type: "navigate", route: "/settings/help" },
    { icon: "document-text-outline", label: "Terms of Service", color: "#6b7280", type: "navigate", route: "/settings/terms" },
    { icon: "lock-closed-outline", label: "Privacy Policy", color: "#6b7280", type: "navigate", route: "/settings/privacy-policy" },
    { icon: "information-circle-outline", label: "About ǝterrn", color: "#4A2D7A", type: "navigate", route: "/settings/about" },
  ];

  function renderItem(item: SettingsItem) {
    return (
      <Pressable
        key={item.label}
        className="flex-row items-center py-3.5 px-4"
        onPress={() => {
          if (item.route) {
            router.push(item.route as any);
          } else if (item.onPress) {
            item.onPress();
          }
        }}
      >
        <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
          <Ionicons name={item.icon} size={18} color={item.color} />
        </View>
        <Text className="flex-1 text-sm font-sans text-gray-900 dark:text-white">{item.label}</Text>
        {item.type === "navigate" && (
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        )}
      </Pressable>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-lg font-sans-bold text-white">Settings</Text>
        </View>
      </View>

      {/* Account Section */}
      <View className="mt-4 px-2">
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider px-4 mb-1">Account</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          {accountItems.map(renderItem)}
        </View>
      </View>

      {/* Preferences Section */}
      <View className="mt-6 px-2">
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider px-4 mb-1">Preferences</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          {/* Notifications toggle */}
          <View className="flex-row items-center py-3.5 px-4">
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="notifications-outline" size={18} color="#D97706" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-900 dark:text-white">Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#d1d5db", true: "#7C3AED" }}
              thumbColor="#ffffff"
            />
          </View>
          {/* Dark Mode toggle */}
          <View className="flex-row items-center py-3.5 px-4">
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="moon-outline" size={18} color="#6b7280" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-900 dark:text-white">Auto Dark Mode</Text>
            <Switch
              value={darkModeAuto}
              onValueChange={setDarkModeAuto}
              trackColor={{ false: "#d1d5db", true: "#7C3AED" }}
              thumbColor="#ffffff"
            />
          </View>
          {preferencesItems.map(renderItem)}
        </View>
      </View>

      {/* Support Section */}
      <View className="mt-6 px-2">
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider px-4 mb-1">Support</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          {supportItems.map(renderItem)}
        </View>
      </View>

      {/* Replay Onboarding */}
      <View className="mt-6 px-4">
        <Pressable
          className="flex-row items-center justify-center py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
          onPress={() => {
            useGuestStore.getState().setHasSeenOnboarding(false);
            router.push("/onboarding");
          }}
        >
          <Ionicons name="play-circle-outline" size={18} color="#6b7280" />
          <Text className="ml-2 text-sm font-sans-medium text-gray-600 dark:text-gray-400">Replay Onboarding</Text>
        </Pressable>
      </View>

      {/* Sign Out */}
      <View className="mt-4 px-4 pb-8">
        <Pressable
          className="flex-row items-center justify-center py-3 rounded-xl border border-red-200 dark:border-red-800"
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: signOut },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text className="ml-2 text-sm font-sans-medium text-red-500">Sign Out</Text>
        </Pressable>
      </View>

      {/* Version */}
      <View className="items-center pb-8">
        <Text className="text-xs font-sans text-gray-400">ǝterrn v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
