import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface LegacyProfileSectionProps {
  legacyMessage: string | null;
  legacyLinkSlug: string | null;
  shareStats: {
    totalShares: number;
    totalInvitesSent: number;
    totalConversions: number;
    totalPromptsAnswered: number;
  } | null;
  isOwnProfile: boolean;
  onEditMessage?: () => void;
  onShareProfile?: () => void;
}

export function LegacyProfileSection({
  legacyMessage,
  legacyLinkSlug,
  shareStats,
  isOwnProfile,
  onEditMessage,
  onShareProfile,
}: LegacyProfileSectionProps) {
  return (
    <View className="mx-4 mb-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 overflow-hidden">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={16} color="#7C3AED" />
            <Text className="ml-2 text-sm font-sans-bold text-gray-900 dark:text-white">
              Living Legacy
            </Text>
          </View>
          {isOwnProfile && onEditMessage && (
            <Pressable onPress={onEditMessage}>
              <Text className="text-xs font-sans-medium text-brand-700">Edit</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Legacy Message */}
      {legacyMessage ? (
        <View className="px-4 pb-3">
          <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 italic leading-5">
            &ldquo;{legacyMessage}&rdquo;
          </Text>
        </View>
      ) : isOwnProfile ? (
        <Pressable className="px-4 pb-3" onPress={onEditMessage}>
          <Text className="text-xs font-sans text-gray-400">
            Add a legacy message — what do you want to be remembered for?
          </Text>
        </Pressable>
      ) : null}

      {/* Legacy Link */}
      {legacyLinkSlug && (
        <View className="px-4 pb-3">
          <View className="flex-row items-center">
            <Ionicons name="link" size={14} color="#4A2D7A" />
            <Text className="ml-1.5 text-xs font-sans-medium text-brand-700">
              foreverr.app/{legacyLinkSlug}
            </Text>
          </View>
        </View>
      )}

      {/* Share Stats */}
      {shareStats && (
        <View className="flex-row border-t border-brand-100 dark:border-brand-800/30">
          <View className="flex-1 items-center py-3">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">{shareStats.totalShares}</Text>
            <Text className="text-[9px] font-sans text-gray-500">Shares</Text>
          </View>
          <View className="flex-1 items-center py-3 border-l border-brand-100 dark:border-brand-800/30">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">{shareStats.totalInvitesSent}</Text>
            <Text className="text-[9px] font-sans text-gray-500">Invites</Text>
          </View>
          <View className="flex-1 items-center py-3 border-l border-brand-100 dark:border-brand-800/30">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">{shareStats.totalConversions}</Text>
            <Text className="text-[9px] font-sans text-gray-500">Conversions</Text>
          </View>
          <View className="flex-1 items-center py-3 border-l border-brand-100 dark:border-brand-800/30">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">{shareStats.totalPromptsAnswered}</Text>
            <Text className="text-[9px] font-sans text-gray-500">Prompts</Text>
          </View>
        </View>
      )}

      {/* Share Profile button */}
      {onShareProfile && (
        <Pressable
          className="flex-row items-center justify-center py-2.5 border-t border-brand-100 dark:border-brand-800/30"
          onPress={onShareProfile}
        >
          <Ionicons name="share-outline" size={14} color="#4A2D7A" />
          <Text className="ml-1.5 text-xs font-sans-semibold text-brand-700">Share Profile</Text>
        </Pressable>
      )}
    </View>
  );
}
