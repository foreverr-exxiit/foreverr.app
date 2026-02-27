import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface LegacyLinkCardProps {
  slug: string | null;
  onEdit: () => void;
  onCopy: () => void;
  onShare: () => void;
}

export function LegacyLinkCard({ slug, onEdit, onCopy, onShare }: LegacyLinkCardProps) {
  if (!slug) {
    return (
      <Pressable
        className="mx-4 mt-4 rounded-2xl border-2 border-dashed border-brand-200 dark:border-brand-800 p-4 items-center"
        onPress={onEdit}
      >
        <View className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-2">
          <Ionicons name="link" size={24} color="#7C3AED" />
        </View>
        <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
          Claim Your Legacy Link
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1 text-center">
          Get your personal foreverr.app/yourname link{"\n"}to share on social media bios
        </Text>
        <View className="mt-3 rounded-full bg-brand-700 px-5 py-2">
          <Text className="text-xs font-sans-semibold text-white">Claim Now</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons name="link" size={16} color="#7C3AED" />
          <Text className="ml-1.5 text-xs font-sans-semibold text-brand-700">
            Legacy Link
          </Text>
        </View>
        <Pressable onPress={onEdit}>
          <Text className="text-xs font-sans-medium text-brand-700">Edit</Text>
        </Pressable>
      </View>

      <Pressable
        className="flex-row items-center rounded-xl bg-white dark:bg-gray-800 px-4 py-3 border border-brand-100 dark:border-brand-900"
        onPress={onCopy}
      >
        <Text className="flex-1 text-sm font-sans-semibold text-brand-900 dark:text-brand-100">
          foreverr.app/{slug}
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onCopy} hitSlop={8}>
            <Ionicons name="copy-outline" size={18} color="#4A2D7A" />
          </Pressable>
          <Pressable onPress={onShare} hitSlop={8}>
            <Ionicons name="share-outline" size={18} color="#4A2D7A" />
          </Pressable>
        </View>
      </Pressable>

      <Text className="text-[10px] font-sans text-gray-400 mt-2 text-center">
        Add this to your Instagram, Twitter, or TikTok bio
      </Text>
    </View>
  );
}
