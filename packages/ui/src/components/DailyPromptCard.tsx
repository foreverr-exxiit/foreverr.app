import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

type LifecycleMode = "celebrate" | "preserve" | "support" | "remember" | "legacy";

interface DailyPromptCardProps {
  promptText: string;
  category: string;
  icon: string;
  hasResponded?: boolean;
  onRespond: () => void;
  onSkip?: () => void;
  /** Lifecycle mode — adjusts color accent & category label */
  lifecycleMode?: LifecycleMode;
}

// Category accent per lifecycle stage
const LIFECYCLE_ACCENTS: Record<LifecycleMode, { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  celebrate: { color: "#F59E0B", label: "Celebrate", icon: "sparkles" },
  preserve: { color: "#3B82F6", label: "Preserve", icon: "book" },
  support:  { color: "#EC4899", label: "Support",  icon: "heart" },
  remember: { color: "#8B5CF6", label: "Remember", icon: "flower" },
  legacy:   { color: "#F97316", label: "The Core",   icon: "star" },
};

const CATEGORY_COLORS: Record<string, string> = {
  gratitude: "#F59E0B",
  remembrance: "#8B5CF6",
  appreciation: "#059669",
  reflection: "#2563EB",
  connection: "#EC4899",
  milestone: "#D97706",
};

export function DailyPromptCard({
  promptText,
  category,
  icon,
  hasResponded,
  onRespond,
  onSkip,
  lifecycleMode,
}: DailyPromptCardProps) {
  // Use lifecycle accent if provided, otherwise fall back to category color
  const lifecycleAccent = lifecycleMode ? LIFECYCLE_ACCENTS[lifecycleMode] : null;
  const color = lifecycleAccent?.color ?? CATEGORY_COLORS[category] ?? "#7C3AED";
  const headerLabel = lifecycleAccent
    ? `${lifecycleAccent.label} Prompt \u00B7 ${category}`
    : `Daily Prompt \u00B7 ${category}`;

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons
            name={(lifecycleAccent?.icon ?? icon) as any}
            size={18}
            color={color}
          />
        </View>
        <View className="ml-2 flex-1">
          <Text className="text-[10px] font-sans-semibold uppercase tracking-wider" style={{ color }}>
            {headerLabel}
          </Text>
        </View>
        {/* Lifecycle pill */}
        {lifecycleAccent && (
          <View
            className="rounded-full px-2 py-0.5 mr-2"
            style={{ backgroundColor: `${color}15` }}
          >
            <Text className="text-[9px] font-sans-bold" style={{ color }}>
              {lifecycleAccent.label}
            </Text>
          </View>
        )}
        {hasResponded && (
          <View className="rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-green-700">Done</Text>
          </View>
        )}
      </View>

      {/* Prompt text */}
      <View className="px-4 py-3">
        <Text className="text-base font-sans-semibold text-gray-900 dark:text-white leading-6">
          {promptText}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row px-4 pb-4 gap-2">
        <Pressable
          className="flex-1 rounded-full py-2.5 items-center"
          style={{ backgroundColor: hasResponded ? "#e5e7eb" : color }}
          onPress={onRespond}
        >
          <Text className={`text-sm font-sans-semibold ${hasResponded ? "text-gray-600" : "text-white"}`}>
            {hasResponded ? "View Response" : "Respond"}
          </Text>
        </Pressable>
        {!hasResponded && onSkip && (
          <Pressable
            className="rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2.5 items-center"
            onPress={onSkip}
          >
            <Text className="text-sm font-sans-medium text-gray-500">Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
