import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { useAuth, useLegacyProfile, useUpdateLegacyProfile, useUserShareStats } from "@foreverr/core";
import { Text, LegacyProfileSection } from "@foreverr/ui";

export default function EditLegacyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile, isLoading } = useLegacyProfile(user?.id);
  const { data: shareStats } = useUserShareStats(user?.id);
  const updateProfile = useUpdateLegacyProfile();

  const [legacyMessage, setLegacyMessage] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLegacyMessage(profile.legacy_message ?? "");
      setSlug(profile.legacy_link_slug ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        legacy_message: legacyMessage.trim(),
        legacy_link_slug: slug.trim() || undefined,
      });
      Alert.alert("Saved!", "Your legacy profile has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save changes.");
    } finally {
      setIsSaving(false);
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
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white flex-1">
          Edit Legacy Profile
        </Text>
      </View>

      {/* Preview */}
      <LegacyProfileSection
        legacyMessage={legacyMessage || null}
        legacyLinkSlug={slug || null}
        shareStats={
          shareStats
            ? {
                totalShares: shareStats.total_shares ?? 0,
                totalInvitesSent: shareStats.total_invites_sent ?? 0,
                totalConversions: shareStats.total_conversions ?? 0,
                totalPromptsAnswered: shareStats.total_prompts_answered ?? 0,
              }
            : null
        }
        isOwnProfile={false}
        onShareProfile={async () => {
          if (slug) {
            await Share.share({
              message: `Check out my legacy profile on Foreverr: https://foreverr.app/${slug}`,
            });
          }
        }}
      />

      {/* Legacy Message */}
      <View className="mx-4 mb-4">
        <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">
          Legacy Message
        </Text>
        <Text className="text-xs font-sans text-gray-400 mb-2">
          What do you want to be remembered for? This appears on your public profile.
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 min-h-[100px]"
          placeholder="Write your legacy message..."
          placeholderTextColor="#9ca3af"
          value={legacyMessage}
          onChangeText={setLegacyMessage}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text className="text-[10px] font-sans text-gray-400 text-right mt-1">
          {legacyMessage.length}/500
        </Text>
      </View>

      {/* Legacy Link */}
      <View className="mx-4 mb-4">
        <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">
          Legacy Link
        </Text>
        <Text className="text-xs font-sans text-gray-400 mb-2">
          Claim a unique URL for your profile. Share it in your social media bios.
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <View className="bg-gray-100 dark:bg-gray-700 px-3 py-3">
            <Text className="text-xs font-sans text-gray-500">foreverr.app/</Text>
          </View>
          <TextInput
            className="flex-1 px-3 py-3 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="your-name"
            placeholderTextColor="#9ca3af"
            value={slug}
            onChangeText={(text) => setSlug(text.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
        </View>
        {slug.trim() !== "" && (
          <Pressable
            className="mt-2"
            onPress={async () => {
              await Clipboard.setStringAsync(`https://foreverr.app/${slug}`);
              Alert.alert("Copied!", "Link copied to clipboard.");
            }}
          >
            <Text className="text-xs font-sans-medium text-brand-700">
              Copy: foreverr.app/{slug}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Save button */}
      <View className="mx-4 mb-6">
        <Pressable
          className="rounded-full bg-brand-700 py-3.5 items-center"
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text className="text-sm font-sans-semibold text-white">
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
