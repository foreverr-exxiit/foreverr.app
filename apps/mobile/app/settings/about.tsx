import { View, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, EternLogo } from "@foreverr/ui";

const SOCIAL_LINKS = [
  { icon: "logo-instagram" as const, label: "Instagram", url: "https://instagram.com/eterrn" },
  { icon: "logo-twitter" as const, label: "X (Twitter)", url: "https://x.com/eterrn" },
  { icon: "logo-facebook" as const, label: "Facebook", url: "https://facebook.com/eterrn" },
  { icon: "logo-tiktok" as const, label: "TikTok", url: "https://tiktok.com/@eterrn" },
];

export default function AboutScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link. Please try again.");
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">About ǝterrn</Text>
        </View>
      </View>

      {/* Hero */}
      <View className="items-center py-8 px-6">
        <View className="h-20 w-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-4">
          <EternLogo width={96} variant="icon" />
        </View>
        <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white">ǝterrn</Text>
        <Text className="text-xs font-sans text-gray-400 mt-1">Version 1.0.0</Text>
        <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center mt-3 leading-5">
          Celebrate life. Honor memories. Connect hearts across generations.
        </Text>
      </View>

      {/* Mission */}
      <View className="mx-5 bg-brand-50 dark:bg-brand-900/10 rounded-2xl p-4 mb-6">
        <Text className="text-xs font-sans-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-2">Our Mission</Text>
        <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
          ǝterrn is a lifecycle memorial and celebration platform that captures everything meaningful about a person — from birth through life milestones to memorialization after passing. We believe every life deserves to be remembered, celebrated, and honored.
        </Text>
      </View>

      {/* Company Info */}
      <View className="mx-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Company</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          <View className="flex-row items-center py-3 px-4">
            <Ionicons name="business-outline" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 ml-3">Eckzet Group</Text>
          </View>
          <View className="flex-row items-center py-3 px-4">
            <Ionicons name="location-outline" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 ml-3">New York City, NY, United States</Text>
          </View>
          <View className="flex-row items-center py-3 px-4">
            <Ionicons name="flag-outline" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 ml-3">HO, Volta Region, Ghana (HQ)</Text>
          </View>
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => openUrl("https://eterrn.app")}
          >
            <Ionicons name="globe-outline" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans text-brand-700 dark:text-brand-400 ml-3">eterrn.app</Text>
            <Ionicons name="open-outline" size={12} color="#9ca3af" className="ml-1" />
          </Pressable>
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => openUrl("mailto:hello@eterrn.app")}
          >
            <Ionicons name="mail-outline" size={16} color="#4A2D7A" />
            <Text className="text-sm font-sans text-brand-700 dark:text-brand-400 ml-3">hello@eterrn.app</Text>
          </Pressable>
        </View>
      </View>

      {/* Social */}
      <View className="mx-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Follow Us</Text>
        <View className="flex-row gap-3">
          {SOCIAL_LINKS.map((link) => (
            <Pressable
              key={link.label}
              className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
              onPress={() => openUrl(link.url)}
            >
              <Ionicons name={link.icon} size={22} color="#4A2D7A" />
              <Text className="text-[10px] font-sans-medium text-gray-500 dark:text-gray-400 mt-1">{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Links */}
      <View className="mx-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Legal</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          <Pressable className="flex-row items-center py-3 px-4" onPress={() => router.push("/settings/terms" as any)}>
            <Ionicons name="document-text-outline" size={16} color="#6b7280" />
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300 ml-3">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center py-3 px-4" onPress={() => router.push("/settings/privacy-policy" as any)}>
            <Ionicons name="lock-closed-outline" size={16} color="#6b7280" />
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300 ml-3">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>

      {/* Acknowledgements */}
      <View className="mx-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Built With</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 leading-5">
            React Native {"\u00B7"} Expo {"\u00B7"} Supabase {"\u00B7"} TypeScript {"\u00B7"} NativeWind {"\u00B7"} TanStack Query
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="items-center pb-10">
        <Text className="text-[11px] font-sans text-gray-400">{"\u00A9"} 2026 Eckzet Group. All rights reserved.</Text>
        <Text className="text-[10px] font-sans text-gray-300 dark:text-gray-600 mt-1">Made with love for every memory that matters</Text>
      </View>
    </ScrollView>
  );
}
