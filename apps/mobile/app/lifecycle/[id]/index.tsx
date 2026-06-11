import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTributes, useMemorial, useCreateTribute, useToggleReaction, useAuth, useAIRewrite, useRequireAuth } from "@foreverr/core";
import { Text, TributeComposer, ReactionBar, getLifecycleConfig, AIRewriteButton, ExpandableText } from "@foreverr/ui";

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
  const { requireAuth } = useRequireAuth();
  const { data: memorial } = useMemorial(id);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTributes(id, user?.id);
  const createTribute = useCreateTribute();
  const toggleReaction = useToggleReaction();
  const aiRewrite = useAIRewrite();
  const [composerVisible, setComposerVisible] = useState(false);

  const tributes = data?.pages.flatMap((p) => p.data) ?? [];

  // ── Lifecycle config ─────────────────────────────────────────────
  const config = useMemo(
    () => getLifecycleConfig((memorial as any)?.lifecycle_stage),
    [(memorial as any)?.lifecycle_stage],
  );

  // ── Show AI bio button only if user owns it AND bio is empty/AI-generated ──
  const showAiBioButton = useMemo(() => {
    if (!memorial || !user?.id) return false;
    const isOwner = memorial.created_by === user.id;
    if (!isOwner) return false;
    return !memorial.biography || (memorial as any).biography_is_ai_generated;
  }, [memorial, user?.id]);

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

  const handleReaction = (tributeId: string, type: string) => {
    requireAuth(() => {
      if (!user?.id) return;
      toggleReaction.mutate({ userId: user.id, targetType: "tribute", targetId: tributeId, reactionType: type as any });
    });
  };

  const handleOpenComposer = () => {
    requireAuth(() => setComposerVisible(true));
  };

  // ── List header: AI bio button (bio is shown inline in _layout.tsx) ──
  const listHeader = useMemo(() => (
    <>
      {showAiBioButton && (
        <Pressable
          className="mx-4 mt-3 mb-2 flex-row items-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-3"
          onPress={() => requireAuth(() => router.push(`/lifecycle/${id}/ai-biography`))}
        >
          <Ionicons name="sparkles" size={16} color="#4A2D7A" />
          <Text className="ml-2 text-xs font-sans-semibold text-brand-700">
            {memorial?.biography ? "Regenerate Biography with AI" : "Generate Biography with AI"}
          </Text>
          <View className="flex-1" />
          <Ionicons name="chevron-forward" size={14} color="#4A2D7A" />
        </Pressable>
      )}
    </>
  ), [showAiBioButton, id, memorial?.biography]);

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="small" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={tributes}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={listHeader}
          renderItem={({ item }: { item: any }) => (
            <View className="mx-4 mb-2.5 rounded-2xl bg-white dark:bg-gray-800/50 p-3.5">
              {/* Author row */}
              <View className="flex-row items-center mb-3">
                <Pressable
                  className="flex-row items-center flex-1"
                  onPress={() => item.author?.id && router.push(`/user/${item.author.id}` as any)}
                  disabled={!item.author?.id}
                >
                  <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center overflow-hidden">
                    {item.author?.avatar_url ? (
                      <Image source={{ uri: item.author.avatar_url }} style={{ width: 40, height: 40 }} contentFit="cover" />
                    ) : (
                      <Ionicons name="person" size={20} color="#4A2D7A" />
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                      {item.author?.display_name ?? "Anonymous"}
                    </Text>
                    <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">{timeAgo(item.created_at)}</Text>
                  </View>
                </Pressable>
                {item.ribbon_type && (
                  <View className="flex-row items-center gap-1 bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1.5">
                    <Ionicons name="ribbon" size={13} color="#4A2D7A" />
                    <Text className="text-[11px] font-sans-semibold text-brand-700 capitalize">{item.ribbon_type}</Text>
                  </View>
                )}
                {item.is_pinned && (
                  <Ionicons name="pin" size={14} color="#4A2D7A" style={{ marginLeft: 6 }} />
                )}
              </View>

              {/* Content */}
              {item.content && (
                <View className="mb-3">
                  <ExpandableText
                    className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-6"
                    numberOfLines={4}
                  >
                    {item.content}
                  </ExpandableText>
                </View>
              )}

              {/* Media */}
              {item.media_url && (
                <View className="rounded-2xl overflow-hidden mb-3">
                  <Image source={{ uri: item.media_url }} style={{ width: "100%", height: 220 }} contentFit="cover" />
                </View>
              )}

              {/* Reactions */}
              <ReactionBar
                compact
                mode={config.mode}
                onReact={(type) => handleReaction(item.id, type)}
                counts={item.reaction_counts ?? {}}
                userReactions={item.user_reactions ?? []}
                memorialName={memorial ? `${memorial.first_name} ${memorial.last_name}` : ""}
                onGiftPress={() => router.push(`/gifts/memorial/${id}` as any)}
              />
            </View>
          )}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-4xl mb-4">{config.mode === "memorial" ? "\uD83D\uDD4A\uFE0F" : "\uD83C\uDF89"}</Text>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
                {config.mode === "memorial" ? "No tributes yet" : "No cheers yet"}
              </Text>
              <Text className="text-sm font-sans text-center text-gray-500 mb-4">
                {config.emptyTributeText}
              </Text>
              <Pressable
                className="rounded-full bg-brand-700 px-6 py-2.5"
                onPress={handleOpenComposer}
              >
                <Text className="text-sm font-sans-semibold text-white">{config.tributeLabel}</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* FAB to create tribute */}
      {tributes.length > 0 && (
        <Pressable
          className="absolute bottom-4 right-4 h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
          onPress={handleOpenComposer}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

      {/* Tribute Composer Modal */}
      <TributeComposer
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onSubmit={handleCreateTribute}
        renderAIButtons={({ currentText, onResult }) => (
          <AIRewriteButton
            currentText={currentText}
            onResult={onResult}
            contextType="tribute"
            memorialId={id}
            hint={`${config.tributeComposerPlaceholder} ${memorial?.first_name} ${memorial?.last_name}`}
            onAISuggest={(params) => aiRewrite.mutateAsync(params)}
          />
        )}
        userAvatarUrl={profile?.avatar_url}
        ribbonBalance={profile?.ribbon_balance ?? 0}
      />
    </View>
  );
}
