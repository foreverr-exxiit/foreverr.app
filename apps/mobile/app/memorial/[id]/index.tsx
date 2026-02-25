import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTributes, useMemorial, useCreateTribute, useToggleReaction, useAuth, useGenerateTribute } from "@foreverr/core";
import { Text, TributeComposer, ReactionBar } from "@foreverr/ui";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MemorialFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { data: memorial } = useMemorial(id);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTributes(id);
  const createTribute = useCreateTribute();
  const toggleReaction = useToggleReaction();
  const generateTribute = useGenerateTribute();
  const [composerVisible, setComposerVisible] = useState(false);

  const tributes = data?.pages.flatMap((p) => p.data) ?? [];

  const handleCreateTribute = async (tributeData: { type: string; content: string; ribbonType: string; ribbonCount: number }) => {
    if (!user?.id || !id) return;
    await createTribute.mutateAsync({
      memorial_id: id,
      author_id: user.id,
      type: tributeData.type as any,
      content: tributeData.content,
      ribbon_type: tributeData.ribbonType,
      ribbon_count: tributeData.ribbonCount,
    });
  };

  const handleReaction = (tributeId: string, type: "heart" | "candle" | "flower" | "prayer" | "dove") => {
    if (!user?.id) return;
    toggleReaction.mutate({ userId: user.id, targetType: "tribute", targetId: tributeId, reactionType: type });
  };

  return (
    <View className="flex-1">
      {/* Biography section if available */}
      {memorial?.biography && (
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-1">Biography</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5">
            {memorial.biography}
          </Text>
        </View>
      )}

      {/* AI Biography button for authenticated users */}
      {user && (
        <Pressable
          className="mx-4 mt-3 flex-row items-center rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3"
          onPress={() => router.push(`/memorial/${id}/ai-biography`)}
        >
          <Ionicons name="sparkles" size={16} color="#4A2D7A" />
          <Text className="ml-2 text-xs font-sans-semibold text-brand-700">
            {memorial?.biography ? "Regenerate Biography with AI" : "Generate Biography with AI"}
          </Text>
          <View className="flex-1" />
          <Ionicons name="chevron-forward" size={14} color="#4A2D7A" />
        </Pressable>
      )}

      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="small" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={tributes}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <View className="px-4 py-4 border-b border-gray-50">
              {/* Author row */}
              <View className="flex-row items-center mb-2">
                <View className="h-9 w-9 rounded-full bg-brand-100 items-center justify-center overflow-hidden">
                  {item.author?.avatar_url ? (
                    <Image source={{ uri: item.author.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
                  ) : (
                    <Ionicons name="person" size={18} color="#4A2D7A" />
                  )}
                </View>
                <View className="ml-2.5 flex-1">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                    {item.author?.display_name ?? "Anonymous"}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400">{timeAgo(item.created_at)}</Text>
                </View>
                {item.ribbon_type && (
                  <View className="flex-row items-center gap-1 bg-gray-50 rounded-full px-2.5 py-1">
                    <Ionicons name="ribbon" size={12} color="#4A2D7A" />
                    <Text className="text-[10px] font-sans-medium text-gray-600">{item.ribbon_type}</Text>
                  </View>
                )}
                {item.is_pinned && (
                  <Ionicons name="pin" size={14} color="#4A2D7A" style={{ marginLeft: 4 }} />
                )}
              </View>

              {/* Content */}
              {item.content && (
                <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5 mb-2">{item.content}</Text>
              )}

              {/* Media */}
              {item.media_url && (
                <View className="rounded-xl overflow-hidden mb-2">
                  <Image source={{ uri: item.media_url }} style={{ width: "100%", height: 200 }} contentFit="cover" />
                </View>
              )}

              {/* Reactions */}
              <ReactionBar
                compact
                onReact={(type) => handleReaction(item.id, type)}
                counts={{}}
              />
            </View>
          )}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-4xl mb-4">🕊️</Text>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">No tributes yet</Text>
              <Text className="text-sm font-sans text-center text-gray-500 mb-4">
                Be the first to share a tribute, memory, or photo.
              </Text>
              {user && (
                <Pressable
                  className="rounded-full bg-brand-700 px-6 py-2.5"
                  onPress={() => setComposerVisible(true)}
                >
                  <Text className="text-sm font-sans-semibold text-white">Write a Tribute</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      {/* FAB to create tribute */}
      {user && tributes.length > 0 && (
        <Pressable
          className="absolute bottom-4 right-4 h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
          onPress={() => setComposerVisible(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

      {/* Tribute Composer Modal */}
      <TributeComposer
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onSubmit={handleCreateTribute}
        onAISuggest={async () => {
          if (!id) return null;
          const result = await generateTribute.mutateAsync({
            memorialId: id,
            attributes: `A tribute for ${memorial?.first_name} ${memorial?.last_name}`,
          });
          return result.text;
        }}
        userAvatarUrl={profile?.avatar_url}
        ribbonBalance={profile?.ribbon_balance ?? 0}
      />
    </View>
  );
}
