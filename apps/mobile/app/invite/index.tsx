import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth, useMyInviteLinks, useCreateInviteLink, useInviteAnalytics } from "@foreverr/core";
import { Text, InviteCard } from "@foreverr/ui";

const INVITE_TYPES = [
  { key: "app_invite", label: "Invite to Foreverr", icon: "person-add", color: "#7C3AED" },
  { key: "memorial_contributor", label: "Memorial Contributor", icon: "flower", color: "#4A2D7A" },
  { key: "living_tribute_contributor", label: "Tribute Contributor", icon: "gift", color: "#059669" },
  { key: "family_tree_join", label: "Family Tree", icon: "people", color: "#2563EB" },
] as const;

export default function InviteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: invites, isLoading } = useMyInviteLinks(user?.id);
  const { data: analytics } = useInviteAnalytics(user?.id);
  const createInvite = useCreateInviteLink();

  const [selectedType, setSelectedType] = useState<string>("app_invite");

  const handleCreateInvite = async () => {
    if (!user?.id) return;
    try {
      const link = await createInvite.mutateAsync({
        creator_id: user.id,
        invite_type: selectedType,
      });
      const url = `https://foreverr.app/invite/${link.invite_code}`;
      await Share.share({
        message: `Join me on Foreverr — a platform for honoring the people who matter most. ${url}`,
        url,
      });
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not create invite link.");
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
          Invite Friends
        </Text>
      </View>

      {/* Analytics */}
      {analytics && (
        <View className="mx-4 mb-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4">
          <Text className="text-sm font-sans-semibold text-brand-700 mb-3">Your Impact</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">{analytics.totalInvites}</Text>
              <Text className="text-[10px] font-sans text-gray-500">Invites Sent</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">{analytics.totalUses}</Text>
              <Text className="text-[10px] font-sans text-gray-500">People Joined</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">{analytics.activeInvites}</Text>
              <Text className="text-[10px] font-sans text-gray-500">Active Links</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">{analytics.conversionRate}%</Text>
              <Text className="text-[10px] font-sans text-gray-500">Conversion</Text>
            </View>
          </View>
        </View>
      )}

      {/* Create new invite */}
      <View className="mx-4 mb-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
        <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">Create Invite Link</Text>

        {/* Type selector */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {INVITE_TYPES.map((t) => (
            <Pressable
              key={t.key}
              className={`flex-row items-center rounded-full px-3 py-2 ${
                selectedType === t.key
                  ? "bg-brand-700"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
              onPress={() => setSelectedType(t.key)}
            >
              <Ionicons
                name={t.icon as any}
                size={14}
                color={selectedType === t.key ? "#FFFFFF" : t.color}
              />
              <Text
                className={`ml-1.5 text-xs font-sans-medium ${
                  selectedType === t.key ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          className="rounded-full bg-brand-700 py-3 items-center"
          onPress={handleCreateInvite}
          disabled={createInvite.isPending}
        >
          <Text className="text-sm font-sans-semibold text-white">
            {createInvite.isPending ? "Creating..." : "Generate & Share Link"}
          </Text>
        </Pressable>
      </View>

      {/* Existing invites */}
      <View className="mt-2">
        <Text className="px-4 mb-3 text-base font-sans-bold text-gray-900 dark:text-white">
          Your Invite Links
        </Text>
        {(invites ?? []).length === 0 ? (
          <View className="items-center py-10 px-8">
            <Ionicons name="link-outline" size={36} color="#d1d5db" />
            <Text className="text-sm font-sans text-gray-400 text-center mt-2">
              No invite links yet. Create one to start growing your community.
            </Text>
          </View>
        ) : (
          (invites as any[]).map((invite) => {
            const url = `https://foreverr.app/invite/${invite.invite_code}`;
            const typeLabel = INVITE_TYPES.find((t) => t.key === invite.invite_type)?.label ?? invite.invite_type;
            return (
              <InviteCard
                key={invite.id}
                title={typeLabel}
                description={invite.message ?? undefined}
                inviteUrl={url}
                onCopyLink={async () => {
                  await Clipboard.setStringAsync(url);
                  Alert.alert("Copied!", "Invite link copied to clipboard.");
                }}
                onShare={async () => {
                  try {
                    await Share.share({
                      message: `Join me on Foreverr: ${url}`,
                      url,
                    });
                  } catch {}
                }}
                useCount={invite.use_count ?? 0}
              />
            );
          })
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
