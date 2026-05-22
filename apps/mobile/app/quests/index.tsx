import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyPointBalance } from "@foreverr/core";
import { supabase } from "@foreverr/core";
import { Text, QuestCard } from "@foreverr/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────
interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
  category: string;
  action_type: string;
  required_count: number;
  reward_points: number;
}

interface QuestProgress {
  quest_id: string;
  current_count: number;
  is_completed: boolean;
  reward_claimed: boolean;
}

// ── Hooks (local to this screen) ──────────────────────────
function useQuests() {
  return useQuery({
    queryKey: ["quests"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("achievement_quests")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Quest[];
    },
  });
}

function useMyQuestProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ["quest-progress", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_quest_progress")
        .select("quest_id, current_count, is_completed, reward_claimed")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []) as QuestProgress[];
    },
    enabled: !!userId,
  });
}

function useClaimQuestReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; questId: string; points: number }) => {
      // Mark reward as claimed
      await (supabase as any)
        .from("user_quest_progress")
        .update({ reward_claimed: true, claimed_at: new Date().toISOString() })
        .eq("user_id", params.userId)
        .eq("quest_id", params.questId);

      // Award points
      await (supabase as any)
        .from("legacy_points")
        .insert({
          user_id: params.userId,
          points: params.points,
          action_type: "quest_complete" as any,
          description: "Quest reward claimed",
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quest-progress"] });
      queryClient.invalidateQueries({ queryKey: ["point-balance"] });
    },
  });
}

// ── Category definitions ──────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "All", emoji: "🏆" },
  { key: "newcomer", label: "Newcomer", emoji: "🌱" },
  { key: "social", label: "Social", emoji: "🦋" },
  { key: "creator", label: "Creator", emoji: "✨" },
  { key: "collector", label: "Collector", emoji: "📸" },
  { key: "community", label: "Community", emoji: "🤝" },
];

export default function QuestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: quests, isLoading: questsLoading } = useQuests();
  const { data: progress } = useMyQuestProgress(user?.id);
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const claimReward = useClaimQuestReward();

  const currentPoints = (pointBalance as any)?.current_balance ?? 0;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);

  const progressMap = new Map<string, QuestProgress>();
  (progress ?? []).forEach((p) => progressMap.set(p.quest_id, p));

  const filteredQuests = (quests ?? []).filter(
    (q) => activeCategory === "all" || q.category === activeCategory
  );

  const completedCount = (quests ?? []).filter((q) => {
    const p = progressMap.get(q.id);
    return p?.is_completed;
  }).length;

  const handleClaim = (quest: Quest) => {
    if (!user?.id) return;
    claimReward.mutate(
      { userId: user.id, questId: quest.id, points: quest.reward_points },
      {
        onSuccess: () => {
          Alert.alert(
            "Reward Claimed! 🎉",
            `You earned ${quest.reward_points} points for completing "${quest.name}"!`
          );
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Quests
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Complete quests to earn Core Points
            </Text>
          </View>
          {/* Points pill */}
          <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 rounded-full px-3 py-1.5">
            <Ionicons name="star" size={14} color="#d97706" />
            <Text className="text-xs font-sans-bold text-amber-600 ml-1">
              {currentPoints}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats bar */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
            </View>
            <View>
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {completedCount} of {(quests ?? []).length}
              </Text>
              <Text className="text-[10px] font-sans text-gray-400">Quests completed</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View className="flex-1 ml-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${Math.min(100, ((completedCount / Math.max(1, (quests ?? []).length)) * 100))}%`,
              }}
            />
          </View>
        </View>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${
                isActive ? "bg-brand-700" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
              <Text
                className={`text-[11px] font-sans-semibold ${
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Quest list */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {questsLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4A2D7A" />
            <Text className="text-sm font-sans text-gray-400 mt-3">Loading quests...</Text>
          </View>
        ) : filteredQuests.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <Text className="text-base font-sans-semibold text-gray-600 dark:text-gray-300 mt-4 text-center">
              No quests in this category
            </Text>
            <Text className="text-sm font-sans text-gray-400 text-center mt-1">
              Try selecting a different category above
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {filteredQuests.map((quest) => {
              const p = progressMap.get(quest.id);
              return (
                <QuestCard
                  key={quest.id}
                  name={quest.name}
                  description={quest.description ?? ""}
                  emoji={quest.emoji ?? "🏆"}
                  currentCount={p?.current_count ?? 0}
                  requiredCount={quest.required_count}
                  rewardPoints={quest.reward_points}
                  isCompleted={p?.is_completed ?? false}
                  rewardClaimed={p?.reward_claimed ?? false}
                  onClaimReward={() => handleClaim(quest)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
