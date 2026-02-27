import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface InviteCardProps {
  title: string;
  description?: string;
  inviteUrl: string;
  onCopyLink: () => void;
  onShare: () => void;
  useCount: number;
}

export function InviteCard({
  title,
  description,
  inviteUrl,
  onCopyLink,
  onShare,
  useCount,
}: InviteCardProps) {
  return (
    <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
      <View className="flex-row items-start mb-3">
        <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
          <Ionicons name="person-add" size={20} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{title}</Text>
          {description && (
            <Text className="text-xs font-sans text-gray-500 mt-0.5" numberOfLines={2}>{description}</Text>
          )}
        </View>
        <View className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5">
          <Text className="text-[10px] font-sans-semibold text-brand-700">{useCount} used</Text>
        </View>
      </View>

      {/* Link preview */}
      <View className="rounded-xl bg-gray-50 dark:bg-gray-900 px-3 py-2 mb-3">
        <Text className="text-xs font-sans text-gray-500" numberOfLines={1}>{inviteUrl}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 flex-row items-center justify-center rounded-full bg-brand-700 py-2.5"
          onPress={onCopyLink}
        >
          <Ionicons name="copy-outline" size={16} color="white" />
          <Text className="ml-1.5 text-xs font-sans-semibold text-white">Copy Link</Text>
        </Pressable>
        <Pressable
          className="flex-1 flex-row items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 py-2.5"
          onPress={onShare}
        >
          <Ionicons name="share-outline" size={16} color="#4A2D7A" />
          <Text className="ml-1.5 text-xs font-sans-semibold text-brand-700">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}
