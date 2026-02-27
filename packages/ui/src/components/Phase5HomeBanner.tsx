import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface Phase5HomeBannerProps {
  variant: "daily_prompt" | "campaign" | "streak" | "living_tribute_cta";
  data: {
    title: string;
    subtitle?: string;
    value?: number;
    ctaText?: string;
  };
  onPress: () => void;
  onDismiss?: () => void;
}

const VARIANT_CONFIG = {
  daily_prompt: { icon: "sparkles" as const, bg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "#F59E0B", textColor: "text-amber-800 dark:text-amber-200" },
  campaign: { icon: "megaphone" as const, bg: "bg-brand-50 dark:bg-brand-900/20", iconColor: "#7C3AED", textColor: "text-brand-800 dark:text-brand-200" },
  streak: { icon: "flame" as const, bg: "bg-red-50 dark:bg-red-900/20", iconColor: "#EF4444", textColor: "text-red-800 dark:text-red-200" },
  living_tribute_cta: { icon: "gift" as const, bg: "bg-green-50 dark:bg-green-900/20", iconColor: "#059669", textColor: "text-green-800 dark:text-green-200" },
};

export function Phase5HomeBanner({ variant, data, onPress, onDismiss }: Phase5HomeBannerProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Pressable className={`mx-4 mt-3 rounded-2xl ${config.bg} overflow-hidden`} onPress={onPress}>
      <View className="flex-row items-center p-3.5">
        <View className="h-10 w-10 rounded-full bg-white/60 dark:bg-black/20 items-center justify-center mr-3">
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-sm font-sans-semibold ${config.textColor}`} numberOfLines={1}>
            {data.title}
          </Text>
          {data.subtitle && (
            <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
              {data.subtitle}
            </Text>
          )}
        </View>
        {data.ctaText && (
          <View className="rounded-full bg-white dark:bg-gray-800 px-3 py-1.5">
            <Text className="text-[10px] font-sans-semibold text-brand-700">{data.ctaText}</Text>
          </View>
        )}
        {onDismiss && (
          <Pressable className="ml-2 p-1" onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={16} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
