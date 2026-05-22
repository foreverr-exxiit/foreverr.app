import { View, ScrollView, Pressable, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { useAuth } from "@foreverr/core";
import {
  useBabyPage,
  useBabyUpdates,
  useCreateBabyUpdate,
  MOOD_OPTIONS,
  type BabyMood,
} from "@foreverr/core/src/hooks/useBabyJourney";

export default function BabyUpdatesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: page } = useBabyPage(id);
  const { data: updatesData, fetchNextPage, hasNextPage } = useBabyUpdates(id);
  const createUpdate = useCreateBabyUpdate();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<BabyMood | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const updates = updatesData?.pages?.flat() ?? [];

  const handlePost = async () => {
    if (!user?.id || !content.trim() || !id) return;
    try {
      await createUpdate.mutateAsync({
        baby_page_id: id,
        author_id: user.id,
        content: content.trim(),
        mood: mood ?? undefined,
        stage: page?.current_stage,
      });
      setContent("");
      setMood(null);
      setShowComposer(false);
    } catch {
      // handled
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Journal
        </Text>
        <Pressable onPress={() => setShowComposer(true)} hitSlop={8}>
          <Ionicons name="add-circle" size={28} color="#7C3AED" />
        </Pressable>
      </View>

      {/* Composer */}
      {showComposer && (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write a journal entry..."
            multiline
            numberOfLines={3}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-3 min-h-[80px]"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
            autoFocus
          />

          {/* Mood selector */}
          <Text className="text-xs font-sans-bold text-gray-500 mb-1.5">How are you feeling?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {MOOD_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                className={`mr-2 px-3 py-1.5 rounded-full border ${
                  mood === opt.key
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => setMood(mood === opt.key ? null : opt.key)}
              >
                <Text className="text-sm">{opt.emoji} {opt.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-2.5 items-center"
              onPress={() => { setShowComposer(false); setContent(""); setMood(null); }}
            >
              <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300">Cancel</Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-xl py-2.5 items-center ${content.trim() ? "bg-brand-700" : "bg-gray-300"}`}
              onPress={handlePost}
              disabled={!content.trim() || createUpdate.isPending}
            >
              <Text className="text-sm font-sans-bold text-white">
                {createUpdate.isPending ? "Posting..." : "Post"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Updates list */}
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📔</Text>
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-1">
              No Journal Entries Yet
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center">
              Tap + to write your first journal entry about {page?.baby_name ?? "your little one"}.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                {item.mood && (
                  <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    <Text className="text-xs">
                      {MOOD_OPTIONS.find((m) => m.key === item.mood)?.emoji}{" "}
                      {MOOD_OPTIONS.find((m) => m.key === item.mood)?.label}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs font-sans text-gray-400">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-sm font-sans text-gray-800 dark:text-gray-200 leading-5">
              {item.content}
            </Text>
            {item.reaction_count > 0 && (
              <Text className="text-xs font-sans text-gray-400 mt-2">
                {item.reaction_count} reactions
              </Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
