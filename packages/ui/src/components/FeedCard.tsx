import React from "react";
import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface FeedCardProps {
  itemType: "memorial" | "living_tribute" | "event" | "wedding" | "pet_page";
  itemId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  lifecycleStage?: string;
  stats?: { label: string; count: number }[];
  onPress: () => void;
}

// Type indicator emoji mapping
const TYPE_EMOJI: Record<FeedCardProps["itemType"], string> = {
  memorial: "\uD83D\uDD4A\uFE0F",
  living_tribute: "\uD83C\uDF89",
  event: "\uD83D\uDCC5",
  wedding: "\uD83D\uDC92",
  pet_page: "\uD83D\uDC3E",
};

// Placeholder icon mapping when no image is provided
const TYPE_ICON: Record<
  FeedCardProps["itemType"],
  { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  memorial: { name: "flower", color: "#4A2D7A", bg: "rgba(74, 45, 122, 0.08)" },
  living_tribute: { name: "sparkles", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.08)" },
  event: { name: "calendar", color: "#2563EB", bg: "rgba(37, 99, 235, 0.08)" },
  wedding: { name: "heart", color: "#EC4899", bg: "rgba(236, 72, 153, 0.08)" },
  pet_page: { name: "paw", color: "#D97706", bg: "rgba(217, 119, 6, 0.08)" },
};

// Lifecycle stage badge configuration
const STAGE_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string; bg: string }
> = {
  remember: {
    emoji: "\uD83D\uDD4A\uFE0F",
    label: "Remember",
    color: "#4A2D7A",
    bg: "rgba(74, 45, 122, 0.08)",
  },
  celebrate: {
    emoji: "\uD83C\uDF89",
    label: "Celebrate",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.08)",
  },
  preserve: {
    emoji: "\uD83D\uDCDA",
    label: "Preserve",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
  },
  support: {
    emoji: "\uD83E\uDD1D",
    label: "Support",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.08)",
  },
  legacy: {
    emoji: "\u2B50",
    label: "The Core",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.08)",
  },
};

export function FeedCard({
  itemType,
  itemId,
  title,
  subtitle,
  imageUrl,
  lifecycleStage,
  stats,
  onPress,
}: FeedCardProps) {
  const typeIcon = TYPE_ICON[itemType];
  const stageInfo = lifecycleStage ? STAGE_CONFIG[lifecycleStage] : null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3.5 mb-3 flex-row items-center"
    >
      {/* Left: image thumbnail or placeholder */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-12 w-12 rounded-xl"
          style={{ backgroundColor: "#f3f4f6" }}
        />
      ) : (
        <View
          className="h-12 w-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: typeIcon.bg }}
        >
          <Ionicons name={typeIcon.name} size={22} color={typeIcon.color} />
        </View>
      )}

      {/* Center content */}
      <View className="flex-1 ml-3 mr-2">
        {/* Title row with type indicator */}
        <View className="flex-row items-center gap-1.5">
          <Text
            className="text-sm font-sans-semibold text-gray-900 dark:text-white flex-shrink"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={{ fontSize: 12 }}>{TYPE_EMOJI[itemType]}</Text>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <Text
            className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <View className="flex-row items-center gap-3 mt-1.5">
            {stats.map((stat, i) => (
              <View key={i} className="flex-row items-center gap-1">
                <Text className="text-[10px] font-sans-semibold text-gray-700 dark:text-gray-300">
                  {stat.count}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400 dark:text-gray-500">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Right: lifecycle stage badge */}
      {stageInfo ? (
        <View
          className="rounded-full px-2.5 py-1 flex-row items-center gap-1"
          style={{ backgroundColor: stageInfo.bg }}
        >
          <Text style={{ fontSize: 10 }}>{stageInfo.emoji}</Text>
          <Text
            className="text-[10px] font-sans-semibold"
            style={{ color: stageInfo.color }}
          >
            {stageInfo.label}
          </Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      )}
    </Pressable>
  );
}
