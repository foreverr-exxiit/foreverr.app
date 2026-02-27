import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface CampaignBannerProps {
  title: string;
  coverImageUrl?: string | null;
  ctaText: string;
  daysRemaining: number;
  participantCount: number;
  onPress: () => void;
}

export function CampaignBanner({
  title,
  ctaText,
  daysRemaining,
  participantCount,
  onPress,
}: CampaignBannerProps) {
  return (
    <Pressable
      className="mx-4 mt-4 rounded-2xl bg-brand-900 overflow-hidden"
      onPress={onPress}
    >
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className="rounded-full bg-brand-700 px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-white">CAMPAIGN</Text>
          </View>
          {daysRemaining > 0 && (
            <Text className="ml-2 text-[10px] font-sans text-brand-300">{daysRemaining} days left</Text>
          )}
        </View>
        <Text className="text-lg font-sans-bold text-white">{title}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="people" size={14} color="#a78bfa" />
          <Text className="ml-1 text-xs font-sans text-brand-300">{participantCount} participants</Text>
        </View>
        <Pressable
          className="mt-3 self-start rounded-full bg-white px-5 py-2.5"
          onPress={onPress}
        >
          <Text className="text-sm font-sans-semibold text-brand-900">{ctaText}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
