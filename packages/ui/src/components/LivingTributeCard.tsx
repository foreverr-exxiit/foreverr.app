import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface LivingTributeCardProps {
  title: string;
  honoreeName: string;
  honoreePhotoUrl?: string | null;
  occasion?: string | null;
  contributorCount: number;
  messageCount: number;
  onPress?: () => void;
  variant?: "compact" | "full";
}

const OCCASION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  birthday: { label: "Birthday", color: "#EC4899", icon: "gift" },
  anniversary: { label: "Anniversary", color: "#8B5CF6", icon: "heart" },
  retirement: { label: "Retirement", color: "#F59E0B", icon: "trophy" },
  graduation: { label: "Graduation", color: "#059669", icon: "school" },
  appreciation: { label: "Appreciation", color: "#4A2D7A", icon: "sparkles" },
  get_well: { label: "Get Well", color: "#EF4444", icon: "medkit" },
  wedding: { label: "Wedding", color: "#EC4899", icon: "rose" },
  achievement: { label: "Achievement", color: "#D97706", icon: "star" },
  just_because: { label: "Just Because", color: "#7C3AED", icon: "heart-circle" },
  other: { label: "Other", color: "#6B7280", icon: "ellipse" },
};

export function LivingTributeCard({
  title,
  honoreeName,
  honoreePhotoUrl,
  occasion,
  contributorCount,
  messageCount,
  onPress,
  variant = "full",
}: LivingTributeCardProps) {
  const occasionInfo = OCCASION_LABELS[occasion ?? "appreciation"] ?? OCCASION_LABELS.appreciation;

  if (variant === "compact") {
    return (
      <Pressable
        className="mr-3 w-44 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
        onPress={onPress}
      >
        <View className="h-20 bg-brand-50 dark:bg-brand-900/30 items-center justify-center">
          <Ionicons name={occasionInfo.icon as any} size={32} color={occasionInfo.color} />
        </View>
        <View className="p-3">
          <Text className="text-xs font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-[10px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
            For {honoreeName}
          </Text>
          <View className="flex-row items-center mt-2 gap-3">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={12} color="#9ca3af" />
              <Text className="ml-1 text-[10px] font-sans text-gray-400">{contributorCount}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="#9ca3af" />
              <Text className="ml-1 text-[10px] font-sans text-gray-400">{messageCount}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
      onPress={onPress}
    >
      <View className="flex-row items-center p-4">
        {/* Occasion icon */}
        <View
          className="h-14 w-14 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: `${occasionInfo.color}15` }}
        >
          <Ionicons name={occasionInfo.icon as any} size={28} color={occasionInfo.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">
            Honoring <Text className="font-sans-semibold text-brand-700">{honoreeName}</Text>
          </Text>
          <View className="flex-row items-center mt-1.5 gap-4">
            <View className="flex-row items-center rounded-full bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5">
              <Text className="text-[10px] font-sans-semibold" style={{ color: occasionInfo.color }}>
                {occasionInfo.label}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={12} color="#9ca3af" />
              <Text className="ml-1 text-[10px] font-sans text-gray-400">{contributorCount} contributors</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="#9ca3af" />
              <Text className="ml-1 text-[10px] font-sans text-gray-400">{messageCount}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>
    </Pressable>
  );
}
