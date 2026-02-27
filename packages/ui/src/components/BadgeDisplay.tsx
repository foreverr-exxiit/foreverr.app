import React from "react";
import { View, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

interface Badge {
  id: string;
  badgeType: string;
  badgeTier: string;
  icon: string;
  name: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  onPress?: (badgeId: string) => void;
}

export function BadgeDisplay({ badges, onPress }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {badges.map((badge) => {
        const tierColor = TIER_COLORS[badge.badgeTier] ?? "#C0C0C0";
        return (
          <View
            key={badge.id}
            className="items-center"
            style={{ width: 64 }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-1"
              style={{
                borderWidth: 2.5,
                borderColor: tierColor,
                backgroundColor: `${tierColor}15`,
              }}
            >
              <Ionicons name={badge.icon as any} size={20} color={tierColor} />
            </View>
            <Text
              className="text-[10px] font-sans-medium text-gray-700 dark:text-gray-300 text-center"
              numberOfLines={1}
            >
              {badge.name}
            </Text>
            <Text
              className="text-[9px] font-sans capitalize"
              style={{ color: tierColor }}
            >
              {badge.badgeTier}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
