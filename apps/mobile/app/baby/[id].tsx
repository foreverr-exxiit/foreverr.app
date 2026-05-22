import { View, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { useAuth } from "@foreverr/core";
import {
  useBabyPage,
  useBabyMilestones,
  useMilestoneChecklist,
  useNextMilestones,
  BABY_STAGES,
  type BabyStage,
} from "@foreverr/core/src/hooks/useBabyJourney";

export default function BabyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: page, isLoading } = useBabyPage(id);
  const { data: milestones } = useBabyMilestones(id);
  const nextMilestones = useNextMilestones(id);

  if (isLoading || !page) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <Text className="text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  const stageInfo = BABY_STAGES.find((s) => s.key === page.current_stage) ?? BABY_STAGES[0]!;
  const checklist = useMilestoneChecklist(id, page.current_stage as BabyStage);
  const completedCount = checklist.filter((c) => c.isCompleted).length;
  const totalCount = checklist.length;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          {page.baby_name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1">
        {/* Cover / Stage Hero */}
        <View
          className="h-40 items-center justify-center"
          style={{ backgroundColor: `${stageInfo.color}15` }}
        >
          {page.cover_photo_url ? (
            <Image source={{ uri: page.cover_photo_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Text className="text-5xl">{stageInfo.icon}</Text>
              <Text className="text-base font-sans-bold mt-1" style={{ color: stageInfo.color }}>
                {stageInfo.label}
              </Text>
              <Text className="text-xs font-sans text-gray-500">{stageInfo.ageRange}</Text>
            </View>
          )}
        </View>

        <View className="px-4 pt-4">
          {/* Name and details */}
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
                {page.baby_name}
                {page.nickname ? ` "${page.nickname}"` : ""}
              </Text>
              {page.date_of_birth && (
                <Text className="text-sm font-sans text-gray-500">
                  Born {new Date(page.date_of_birth).toLocaleDateString()}
                </Text>
              )}
              {!page.date_of_birth && page.due_date && (
                <Text className="text-sm font-sans text-gray-500">
                  Due {new Date(page.due_date).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${stageInfo.color}20` }}
            >
              <Text className="text-xs font-sans-bold" style={{ color: stageInfo.color }}>
                {stageInfo.icon} {stageInfo.label}
              </Text>
            </View>
          </View>

          {page.bio && (
            <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 mb-4">
              {page.bio}
            </Text>
          )}

          {/* Stats row */}
          <View className="flex-row gap-4 mb-6">
            {[
              { label: "Milestones", value: page.milestone_count, icon: "flag" as const },
              { label: "Updates", value: page.update_count, icon: "document-text" as const },
              { label: "Photos", value: page.photo_count, icon: "camera" as const },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 items-center">
                <Ionicons name={stat.icon} size={18} color="#7C3AED" />
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stat.value}</Text>
                <Text className="text-[10px] font-sans text-gray-500">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Stage progress */}
          <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {stageInfo.label} Milestones
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                {completedCount}/{totalCount} completed
              </Text>
            </View>
            {/* Progress bar */}
            <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: stageInfo.color,
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </View>

            {/* Checklist preview */}
            {checklist.slice(0, 5).map((item) => (
              <View key={item.type} className="flex-row items-center py-1.5">
                <Ionicons
                  name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={item.isCompleted ? "#10B981" : "#D1D5DB"}
                />
                <Text className={`text-sm font-sans ml-2 ${item.isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>
                  {item.emoji} {item.label}
                </Text>
              </View>
            ))}

            {totalCount > 5 && (
              <Text className="text-xs font-sans text-brand-600 mt-2">
                + {totalCount - 5} more milestones
              </Text>
            )}
          </View>

          {/* Up next */}
          {nextMilestones.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">
                Up Next
              </Text>
              {nextMilestones.map((item) => (
                <Pressable
                  key={item.type}
                  className="flex-row items-center bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 mb-2"
                  onPress={() => router.push(`/baby/${id}/milestone?type=${item.type}&stage=${page.current_stage}`)}
                >
                  <Text className="text-xl mr-3">{item.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{item.label}</Text>
                    <Text className="text-xs font-sans text-gray-500">Tap to record this milestone</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color="#7C3AED" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Recent milestones */}
          {milestones && milestones.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">
                Recent Milestones
              </Text>
              {milestones.slice(-5).reverse().map((m) => (
                <View key={m.id} className="flex-row items-center py-2 border-b border-gray-50 dark:border-gray-800">
                  <Text className="text-lg mr-3">{m.emoji ?? "⭐"}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">{m.title}</Text>
                    {m.milestone_date && (
                      <Text className="text-xs font-sans text-gray-500">
                        {new Date(m.milestone_date).toLocaleDateString()}
                        {m.age_at_milestone ? ` · ${m.age_at_milestone}` : ""}
                      </Text>
                    )}
                  </View>
                  {m.photo_url && (
                    <Image source={{ uri: m.photo_url }} className="h-10 w-10 rounded-lg" />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className="flex-1 bg-brand-700 rounded-xl py-3 items-center"
              onPress={() => router.push(`/baby/${id}/milestone?stage=${page.current_stage}`)}
            >
              <Text className="text-white font-sans-bold text-sm">Add Milestone</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-brand-100 dark:bg-brand-900/30 rounded-xl py-3 items-center"
              onPress={() => router.push(`/baby/${id}/updates`)}
            >
              <Text className="text-brand-700 dark:text-brand-300 font-sans-bold text-sm">Journal</Text>
            </Pressable>
          </View>

          {/* Stage navigation */}
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">
            All Stages
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {BABY_STAGES.map((stage) => {
              const isCurrent = stage.key === page.current_stage;
              return (
                <View
                  key={stage.key}
                  className={`mr-2 px-3 py-2 rounded-xl border ${
                    isCurrent ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text className="text-lg text-center">{stage.icon}</Text>
                  <Text className={`text-[10px] font-sans-medium text-center ${isCurrent ? "text-brand-700" : "text-gray-500"}`}>
                    {stage.label}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
