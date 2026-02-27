import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const LEVEL_COLORS: Record<number, { bg: string; border: string; icon: string; text: string }> = {
  1: { bg: "#f3f4f6", border: "#d1d5db", icon: "#6b7280", text: "#6b7280" },
  2: { bg: "#dbeafe", border: "#3b82f6", icon: "#2563eb", text: "#2563eb" },
  3: { bg: "#ede9fe", border: "#7c3aed", icon: "#6d28d9", text: "#6d28d9" },
  4: { bg: "#fef3c7", border: "#f59e0b", icon: "#d97706", text: "#d97706" },
  5: { bg: "#fee2e2", border: "#ef4444", icon: "#dc2626", text: "#dc2626" },
};

const LEVEL_ICONS: Record<number, string> = {
  1: "shield-outline",
  2: "shield-checkmark-outline",
  3: "shield-checkmark",
  4: "ribbon",
  5: "star",
};

interface TrustLevelBadgeProps {
  level: number;
  levelName: string;
  isVerified: boolean;
  compact?: boolean;
}

export function TrustLevelBadge({ level, levelName, isVerified, compact = false }: TrustLevelBadgeProps) {
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS[1];
  const iconName = LEVEL_ICONS[level] ?? "shield-outline";

  if (compact) {
    return (
      <View
        className="flex-row items-center rounded-full px-2 py-1"
        style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}
      >
        <Ionicons name={iconName as any} size={12} color={colors.icon} />
        {isVerified && (
          <Ionicons name="checkmark-circle" size={10} color={colors.icon} style={{ marginLeft: 2 }} />
        )}
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.border}20` }}
        >
          <Ionicons name={iconName as any} size={24} color={colors.icon} />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-sans-semibold" style={{ color: colors.text }}>
              Level {level}
            </Text>
            {isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.icon}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 mt-0.5">
            {levelName}
          </Text>
        </View>
      </View>
    </View>
  );
}
