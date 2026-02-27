import React from "react";
import { View, SectionList } from "react-native";
import { Stack } from "expo-router";
import { Text, ScreenWrapper, BadgeCard } from "@foreverr/ui";
import {
  useUserBadges,
  useBadgeDefinitions,
  useAuthStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  contribution: { label: "Contribution", icon: "heart" },
  engagement: { label: "Engagement", icon: "star" },
  streak: { label: "Streak", icon: "flame" },
  social: { label: "Social", icon: "people" },
  special: { label: "Special", icon: "diamond" },
};

export default function BadgesScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: earnedBadges } = useUserBadges(user?.id);
  const { data: allDefinitions } = useBadgeDefinitions();

  const earnedMap = new Map(
    (earnedBadges ?? []).map((b) => [b.badge_type, b])
  );

  // Group by category
  const categorized: Record<string, Array<{
    def: typeof allDefinitions extends (infer U)[] ? U : never;
    earned: typeof earnedBadges extends (infer U)[] ? U : never | null;
  }>> = {};

  (allDefinitions ?? []).forEach((def) => {
    if (!categorized[def.category]) categorized[def.category] = [];
    categorized[def.category].push({
      def,
      earned: earnedMap.get(def.badge_type) ?? null,
    });
  });

  const sections = Object.entries(categorized).map(([category, items]) => ({
    title: CATEGORY_LABELS[category]?.label ?? category,
    icon: CATEGORY_LABELS[category]?.icon ?? "ribbon",
    data: items,
  }));

  const earnedCount = earnedBadges?.length ?? 0;
  const totalCount = allDefinitions?.length ?? 0;

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Badges",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Stats Header */}
      <View className="mx-4 mt-3 mb-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mr-3">
          <Ionicons name="ribbon" size={24} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
            {earnedCount} / {totalCount}
          </Text>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
            Badges earned
          </Text>
        </View>
        <View className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          <Text className="text-lg font-sans-bold text-brand-700">
            {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
          </Text>
        </View>
      </View>

      {/* Badge List by Category */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.def.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center mt-4 mb-2">
            <Ionicons name={section.icon as any} size={16} color="#7C3AED" />
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white ml-2">
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isEarned = !!item.earned;
          const thresholds = (item.def.tier_thresholds ?? {}) as Record<string, number>;
          const currentTier = item.earned?.badge_tier;
          let nextThreshold: number | undefined;
          if (!isEarned) {
            nextThreshold = thresholds.bronze ?? 1;
          } else if (currentTier === "bronze") {
            nextThreshold = thresholds.silver;
          } else if (currentTier === "silver") {
            nextThreshold = thresholds.gold;
          } else if (currentTier === "gold") {
            nextThreshold = thresholds.platinum;
          }

          return (
            <BadgeCard
              name={item.def.name}
              description={item.def.description}
              icon={item.def.icon}
              category={item.def.category}
              badgeTier={item.earned?.badge_tier}
              progress={item.earned?.progress ?? 0}
              nextThreshold={nextThreshold}
              isEarned={isEarned}
            />
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 font-sans mt-3">No badges available</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
