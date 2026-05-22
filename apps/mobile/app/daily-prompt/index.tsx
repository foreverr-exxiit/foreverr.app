import { View, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useTodayPrompt, useRespondToPromptDaily, useMyPromptHistory, useRecordEngagement, analytics } from "@foreverr/core";
import { Text, DailyPromptCard } from "@foreverr/ui";

type LifecycleMode = "celebrate" | "preserve" | "support" | "remember" | "legacy";

const LIFECYCLE_TABS: { mode: LifecycleMode; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { mode: "remember",  label: "Remember",  icon: "flower",   color: "#8B5CF6" },
  { mode: "celebrate", label: "Celebrate", icon: "sparkles", color: "#F59E0B" },
  { mode: "preserve",  label: "Preserve",  icon: "book",     color: "#3B82F6" },
  { mode: "support",   label: "Support",   icon: "heart",    color: "#EC4899" },
  { mode: "legacy",    label: "The Core",    icon: "star",     color: "#F97316" },
];

export default function DailyPromptScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: todayPrompt, isLoading } = useTodayPrompt();
  const respondToPrompt = useRespondToPromptDaily();
  const recordEngagement = useRecordEngagement();
  const { data: history } = useMyPromptHistory(user?.id);

  const [responseText, setResponseText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedMode, setSelectedMode] = useState<LifecycleMode>("remember");

  const todayResponded = (history ?? []).some((r: any) => {
    const responseDate = new Date(r.created_at).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return responseDate === today && r.prompt_id === todayPrompt?.id;
  });

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !user?.id || !todayPrompt?.id) return;
    try {
      await respondToPrompt.mutateAsync({
        userId: user.id,
        promptId: todayPrompt.id,
        content: responseText.trim(),
      });
      await recordEngagement.mutateAsync({ userId: user.id, type: "prompt" });
      analytics.track("daily_prompt_answered", {
        prompt_id: todayPrompt.id,
        response_length: responseText.trim().length,
        lifecycle_mode: selectedMode,
      });
      setResponseText("");
      setShowInput(false);
      Alert.alert("Shared!", "Your response has been shared with the community.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not submit response.");
    }
  };

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Daily Prompts
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Reflect across every stage of life
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/daily-prompt/feed")}
            className="p-2"
          >
            <Ionicons name="people" size={22} color="#4A2D7A" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Lifecycle Mode Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {LIFECYCLE_TABS.map((tab) => {
            const isActive = selectedMode === tab.mode;
            return (
              <Pressable
                key={tab.mode}
                onPress={() => setSelectedMode(tab.mode)}
                className={`flex-row items-center rounded-full px-3.5 py-2 ${
                  isActive ? "" : "bg-gray-100 dark:bg-gray-800"
                }`}
                style={isActive ? { backgroundColor: `${tab.color}15` } : undefined}
              >
                <Ionicons
                  name={isActive ? tab.icon : (`${tab.icon}-outline` as any)}
                  size={14}
                  color={isActive ? tab.color : "#9ca3af"}
                />
                <Text
                  className={`ml-1.5 text-xs font-sans-semibold ${
                    isActive ? "" : "text-gray-500"
                  }`}
                  style={isActive ? { color: tab.color } : undefined}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Today's Prompt */}
        {todayPrompt ? (
          <DailyPromptCard
            promptText={todayPrompt.prompt_text}
            category={todayPrompt.prompt_category}
            icon={todayPrompt.icon}
            hasResponded={todayResponded}
            lifecycleMode={selectedMode}
            onRespond={() => {
              if (todayResponded) {
                router.push("/daily-prompt/feed");
              } else {
                setShowInput(true);
              }
            }}
            onSkip={() => setShowInput(false)}
          />
        ) : (
          <View className="items-center py-10">
            <Text className="text-sm font-sans text-gray-400">No prompt for today.</Text>
          </View>
        )}

        {/* Response input */}
        {showInput && !todayResponded && (
          <View className="mx-4 mt-4 rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
            <TextInput
              className="bg-white dark:bg-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white min-h-[100px] border border-gray-200 dark:border-gray-600"
              placeholder="Share your thoughts..."
              placeholderTextColor="#9ca3af"
              value={responseText}
              onChangeText={setResponseText}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View className="flex-row gap-2 mt-3">
              <Pressable
                className="flex-1 rounded-full bg-gray-200 dark:bg-gray-600 py-2.5 items-center"
                onPress={() => setShowInput(false)}
              >
                <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-300">Cancel</Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-full py-2.5 items-center ${responseText.trim() ? "bg-brand-700" : "bg-brand-300"}`}
                onPress={handleSubmitResponse}
                disabled={!responseText.trim() || respondToPrompt.isPending}
              >
                <Text className="text-sm font-sans-semibold text-white">
                  {respondToPrompt.isPending ? "Sharing..." : "Share"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Community feed link */}
        <Pressable
          className="mx-4 mt-4 flex-row items-center justify-between rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4"
          onPress={() => router.push("/daily-prompt/feed")}
        >
          <View className="flex-row items-center">
            <Ionicons name="people" size={20} color="#4A2D7A" />
            <Text className="ml-2 text-sm font-sans-semibold text-brand-700">View Community Responses</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
        </Pressable>

        {/* My history */}
        <View className="mt-6 px-4 mb-6">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-3">My Response History</Text>
          {(history ?? []).length === 0 ? (
            <Text className="text-sm font-sans text-gray-400">No responses yet. Start with today's prompt!</Text>
          ) : (
            (history as any[]).slice(0, 10).map((item: any) => (
              <View key={item.id} className="mb-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                <Text className="text-[10px] font-sans text-gray-400 mb-1">
                  {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {item.prompt?.prompt_text ? ` \u00B7 ${item.prompt.prompt_text}` : ""}
                </Text>
                <Text className="text-sm font-sans text-gray-700 dark:text-gray-300" numberOfLines={3}>
                  {item.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
