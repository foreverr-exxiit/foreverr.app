import React, { useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useMemorial,
  useMemorialMilestones,
  useMilestonesByCategory,
  useMilestoneCompletion,
} from "@foreverr/core";
import { Text } from "@foreverr/ui";

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  childhood: { label: "Childhood", icon: "happy", color: "#F59E0B" },
  education: { label: "Education", icon: "school", color: "#6366F1" },
  career: { label: "Career", icon: "briefcase", color: "#84CC16" },
  relationships: { label: "Relationships", icon: "heart", color: "#F43F5E" },
  family: { label: "Family", icon: "people", color: "#EC4899" },
  spiritual: { label: "Spiritual", icon: "sparkles", color: "#A855F7" },
  achievements: { label: "Achievements", icon: "trophy", color: "#F97316" },
  lifestyle: { label: "Lifestyle", icon: "sunny", color: "#14B8A6" },
};

export default function MilestonesScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(memorialId);
  const { data: milestones, isLoading: milestonesLoading } = useMemorialMilestones(memorialId);
  const { data: byCategory, isLoading: templatesLoading } = useMilestonesByCategory();
  const completion = useMilestoneCompletion(memorialId);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const name = memorial ? `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim() || "Their" : "Their";
  const isLoading = milestonesLoading || templatesLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Stack.Screen options={{ title: "Turning Points" }} />
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <Stack.Screen options={{ title: `${name}'s Turning Points` }} />

      {/* Header with progress */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
          Turning Points
        </Text>
        <Text className="text-sm font-sans text-gray-500 mt-1">
          Capture the defining moments of {name}'s journey
        </Text>

        {/* Progress bar */}
        <View className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">
              Story Completeness
            </Text>
            <Text className="text-sm font-sans-bold text-brand-700">
              {completion.percentage}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-brand-700 rounded-full"
              style={{ width: `${completion.percentage}%` }}
            />
          </View>
          <Text className="text-[10px] font-sans text-gray-500 mt-2">
            {completion.completedCount} of {completion.totalTemplates} turning points recorded
          </Text>
        </View>

        {/* Suggestions */}
        {completion.suggested.length > 0 && (
          <View className="mt-4">
            <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
              Suggested to add next
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {completion.suggested.map((template) => (
                  <Pressable
                    key={template.milestone_type}
                    className="bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2 flex-row items-center"
                    onPress={() => router.push(`/milestones/add?memorialId=${memorialId}&type=${template.milestone_type}`)}
                  >
                    <Text className="text-base mr-1.5">{template.emoji}</Text>
                    <Text className="text-xs font-sans-medium text-brand-700">{template.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Recorded milestones */}
      {(milestones ?? []).length > 0 && (
        <View className="px-4 mb-4">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-3">
            Recorded Turning Points
          </Text>
          {(milestones ?? []).map((m) => (
            <View key={m.id} className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2">
              <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                <Text className="text-lg">{m.emoji ?? "⭐"}</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{m.title}</Text>
                <View className="flex-row items-center mt-0.5">
                  {m.milestone_date && (
                    <Text className="text-[10px] font-sans text-gray-500">
                      {new Date(m.milestone_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  )}
                  {m.age_at_milestone != null && (
                    <Text className="text-[10px] font-sans text-gray-400 ml-2">
                      Age {m.age_at_milestone}
                    </Text>
                  )}
                </View>
              </View>
              {m.is_verified && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
            </View>
          ))}
        </View>
      )}

      {/* Category browser */}
      <View className="px-4 pb-8">
        <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-3">
          Browse by Category
        </Text>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            <Pressable
              className={`rounded-full px-4 py-2 ${activeCategory === null ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-800"}`}
              onPress={() => setActiveCategory(null)}
            >
              <Text className={`text-xs font-sans-semibold ${activeCategory === null ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
                All
              </Text>
            </Pressable>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Pressable
                key={key}
                className={`rounded-full px-4 py-2 flex-row items-center ${activeCategory === key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-800"}`}
                onPress={() => setActiveCategory(key)}
              >
                <Ionicons
                  name={config.icon as any}
                  size={12}
                  color={activeCategory === key ? "white" : config.color}
                />
                <Text className={`text-xs font-sans-semibold ml-1.5 ${activeCategory === key ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
                  {config.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Templates grid */}
        {Object.entries(byCategory ?? {})
          .filter(([cat]) => !activeCategory || cat === activeCategory)
          .map(([category, templates]) => {
            const config = CATEGORY_CONFIG[category] ?? { label: category, icon: "star", color: "#6B7280" };
            return (
              <View key={category} className="mb-5">
                <View className="flex-row items-center mb-2">
                  <Ionicons name={config.icon as any} size={16} color={config.color} />
                  <Text className="text-sm font-sans-bold text-gray-800 dark:text-gray-200 ml-2">
                    {config.label}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {(templates ?? []).map((template) => {
                    const isCompleted = completion.completedTypes.has(template.milestone_type);
                    return (
                      <Pressable
                        key={template.milestone_type}
                        className={`rounded-xl px-3 py-2.5 flex-row items-center ${
                          isCompleted
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        }`}
                        onPress={() => {
                          if (!isCompleted) {
                            router.push(`/milestones/add?memorialId=${memorialId}&type=${template.milestone_type}`);
                          }
                        }}
                      >
                        <Text className="text-base mr-1.5">{template.emoji}</Text>
                        <View>
                          <Text className={`text-xs font-sans-semibold ${isCompleted ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>
                            {template.label}
                          </Text>
                          {template.typical_age_range && (
                            <Text className="text-[9px] font-sans text-gray-400">
                              Age {template.typical_age_range}
                            </Text>
                          )}
                        </View>
                        {isCompleted && (
                          <Ionicons name="checkmark-circle" size={14} color="#10B981" className="ml-2" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}
