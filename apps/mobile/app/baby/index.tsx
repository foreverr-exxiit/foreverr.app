import { View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { useAuth } from "@foreverr/core";
import { useMyBabyPages, BABY_STAGES } from "@foreverr/core/src/hooks/useBabyJourney";

export default function BabyIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: pages, isLoading } = useMyBabyPages(user?.id);

  const getStageInfo = (stage: string) =>
    BABY_STAGES.find((s) => s.key === stage) ?? BABY_STAGES[0]!;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Little Arcs
        </Text>
        <Pressable onPress={() => router.push("/baby/create")} hitSlop={8}>
          <Ionicons name="add-circle" size={28} color="#7C3AED" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Intro */}
        <View className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-5 mb-6">
          <Text className="text-2xl mb-1">👶</Text>
          <Text className="text-base font-sans-bold text-brand-800 dark:text-brand-200 mb-1">
            Track Your Little One's Journey
          </Text>
          <Text className="text-sm font-sans text-brand-600 dark:text-brand-400">
            From pregnancy through adulthood — capture every milestone, first step, and precious moment.
          </Text>
        </View>

        {/* Baby pages list */}
        {isLoading ? (
          <View className="py-12 items-center">
            <Text className="text-gray-400">Loading...</Text>
          </View>
        ) : pages && pages.length > 0 ? (
          pages.map((page) => {
            const stage = getStageInfo(page.current_stage);
            return (
              <Pressable
                key={page.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-3 overflow-hidden"
                onPress={() => router.push(`/baby/${page.id}`)}
              >
                {/* Cover image or gradient */}
                <View
                  className="h-24 items-center justify-center"
                  style={{ backgroundColor: `${stage.color}20` }}
                >
                  {page.cover_photo_url ? (
                    <Image
                      source={{ uri: page.cover_photo_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-4xl">{stage.icon}</Text>
                  )}
                </View>

                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                      {page.baby_name}
                      {page.nickname ? ` (${page.nickname})` : ""}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${stage.color}20` }}
                    >
                      <Text className="text-xs font-sans-medium" style={{ color: stage.color }}>
                        {stage.icon} {stage.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4 mt-2">
                    <Text className="text-xs font-sans text-gray-500">
                      {page.milestone_count} milestones
                    </Text>
                    <Text className="text-xs font-sans text-gray-500">
                      {page.update_count} updates
                    </Text>
                    <Text className="text-xs font-sans text-gray-500">
                      {page.photo_count} photos
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View className="items-center py-12">
            <Text className="text-5xl mb-3">🍼</Text>
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-1">
              No Little Arcs Yet
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mb-4">
              Create a page to start tracking your child's journey
            </Text>
            <Pressable
              className="bg-brand-700 px-6 py-3 rounded-xl"
              onPress={() => router.push("/baby/create")}
            >
              <Text className="text-white font-sans-bold">Create Little Arc</Text>
            </Pressable>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
