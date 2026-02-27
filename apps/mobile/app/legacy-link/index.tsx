import { View, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useAuth, useLegacyLink, useCreateLegacyLink } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const APP_BASE_URL = "https://foreverr.app";

export default function LegacyLinkScreen() {
  const { user } = useAuth();
  const { data: legacyLink, isLoading } = useLegacyLink(user?.id);
  const createLink = useCreateLegacyLink();
  const [slug, setSlug] = useState("");
  const [editing, setEditing] = useState(false);

  const currentSlug = legacyLink?.slug;

  const handleClaim = async () => {
    if (!user?.id || !slug.trim()) return;

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").trim();
    if (cleanSlug.length < 3) {
      Alert.alert("Too Short", "Your legacy link must be at least 3 characters.");
      return;
    }

    try {
      await createLink.mutateAsync({ userId: user.id, slug: cleanSlug });
      setEditing(false);
      Alert.alert("Claimed!", `Your legacy link is now foreverr.app/${cleanSlug}`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not claim this link. Try another.");
    }
  };

  const handleCopy = async () => {
    if (currentSlug) {
      await Clipboard.setStringAsync(`${APP_BASE_URL}/${currentSlug}`);
      Alert.alert("Copied!", "Your Legacy Link has been copied to clipboard.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero */}
      <View className="bg-brand-900 px-6 pb-8 pt-6 items-center">
        <View className="h-20 w-20 rounded-full bg-white/10 items-center justify-center mb-4">
          <Ionicons name="link" size={36} color="#e9d5ff" />
        </View>
        <Text className="text-xl font-sans-bold text-white text-center">
          Your Legacy Link
        </Text>
        <Text className="text-sm font-sans text-white/60 mt-2 text-center">
          One link for all your social media bios.{"\n"}Share your Foreverr profile everywhere.
        </Text>
      </View>

      <View className="px-5 pt-6">
        {/* Current Link or Claim Section */}
        {currentSlug && !editing ? (
          <>
            <View className="rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-5 items-center">
              <Text className="text-xs font-sans-semibold text-brand-700 mb-2">YOUR LEGACY LINK</Text>
              <Text className="text-lg font-sans-bold text-brand-900 dark:text-brand-100">
                foreverr.app/{currentSlug}
              </Text>

              <View className="flex-row gap-3 mt-4">
                <Pressable
                  className="flex-row items-center rounded-full bg-brand-700 px-5 py-2.5"
                  onPress={handleCopy}
                >
                  <Ionicons name="copy-outline" size={16} color="white" />
                  <Text className="ml-2 text-sm font-sans-semibold text-white">Copy</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center rounded-full bg-gray-100 dark:bg-gray-800 px-5 py-2.5"
                  onPress={() => {
                    setSlug(currentSlug);
                    setEditing(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color="#4A2D7A" />
                  <Text className="ml-2 text-sm font-sans-semibold text-brand-700">Edit</Text>
                </Pressable>
              </View>
            </View>

            {/* Where to use it */}
            <View className="mt-6">
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-3">
                Add it everywhere
              </Text>
              {[
                { icon: "logo-instagram" as const, label: "Instagram Bio", color: "#E4405F" },
                { icon: "logo-twitter" as const, label: "Twitter / X Bio", color: "#1DA1F2" },
                { icon: "logo-tiktok" as const, label: "TikTok Bio", color: "#000000" },
                { icon: "logo-facebook" as const, label: "Facebook About", color: "#1877F2" },
                { icon: "logo-linkedin" as const, label: "LinkedIn Profile", color: "#0A66C2" },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center py-3 border-b border-gray-50 dark:border-gray-800">
                  <View className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="ml-3 text-sm font-sans-medium text-gray-700 dark:text-gray-300 flex-1">
                    {item.label}
                  </Text>
                  <Pressable onPress={handleCopy}>
                    <Text className="text-xs font-sans-medium text-brand-700">Copy Link</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Claim / Edit form */}
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-1">
              {currentSlug ? "Edit your link" : "Choose your link"}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mb-4">
              Lowercase letters, numbers, and hyphens. 3-30 characters.
            </Text>

            <View className="flex-row items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <View className="bg-gray-50 dark:bg-gray-800 px-3 py-3.5">
                <Text className="text-sm font-sans-medium text-gray-400">foreverr.app/</Text>
              </View>
              <TextInput
                className="flex-1 px-3 py-3.5 text-sm font-sans text-gray-900 dark:text-white"
                placeholder="yourname"
                placeholderTextColor="#9ca3af"
                value={slug}
                onChangeText={(t) => setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>

            {slug.length >= 3 && (
              <View className="mt-3 rounded-xl bg-green-50 dark:bg-green-900/20 p-3 flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text className="ml-2 text-xs font-sans-medium text-green-700 dark:text-green-400">
                  Preview: foreverr.app/{slug}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3 mt-5">
              <Pressable
                className={`flex-1 rounded-xl py-3.5 items-center ${
                  slug.length >= 3 ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
                }`}
                onPress={handleClaim}
                disabled={slug.length < 3 || createLink.isPending}
              >
                {createLink.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-sans-semibold text-white">
                    {currentSlug ? "Update Link" : "Claim This Link"}
                  </Text>
                )}
              </Pressable>
              {editing && (
                <Pressable
                  className="rounded-xl bg-gray-100 dark:bg-gray-800 px-5 py-3.5 items-center"
                  onPress={() => setEditing(false)}
                >
                  <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
