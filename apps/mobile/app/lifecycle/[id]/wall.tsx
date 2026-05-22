import { View, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTributes, useCreateTribute, useToggleReaction, useAuth, useRequireAuth, useMemorial, useAIRewrite } from "@foreverr/core";
import { Text, getLifecycleConfig, AIRewriteButton, ExpandableText, ReactionBar } from "@foreverr/ui";

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

export default function WallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: memorial } = useMemorial(id);
  const aiRewrite = useAIRewrite();
  const [message, setMessage] = useState("");

  // ── Lifecycle config for dynamic sub-tab names ──────────────────
  const config = useMemo(
    () => getLifecycleConfig((memorial as any)?.lifecycle_stage),
    [(memorial as any)?.lifecycle_stage],
  );

  const [activeSubTab, setActiveSubTab] = useState<string>(config.wallSubTabs[0] ?? "Condolences");

  const { data, isLoading } = useTributes(id);
  const createTribute = useCreateTribute();
  const toggleReaction = useToggleReaction();

  const tributes = data?.pages.flatMap((p) => p.data) ?? [];

  // Filter tributes by sub-tab type (first tab = text, second = non-text, third = all)
  const filteredTributes = tributes.filter((t: any) => {
    const subTabs = config.wallSubTabs;
    if (activeSubTab === subTabs[0]) return t.type === "text";
    if (activeSubTab === subTabs[1]) return t.type !== "text";
    return true; // Third tab (Social Tags) shows all
  });

  // Dynamic placeholder based on config
  const inputPlaceholder = config.mode === "memorial"
    ? `Add a ${activeSubTab === config.wallSubTabs[0] ? "condolence" : "tribute"}...`
    : `Send a ${activeSubTab === config.wallSubTabs[0] ? "cheer" : "memory"}...`;

  const handleSend = () => {
    if (!message.trim()) return;
    requireAuth(async () => {
      if (!user?.id || !id) return;
      try {
        await createTribute.mutateAsync({
          memorial_id: id,
          author_id: user.id,
          type: "text",
          content: message.trim(),
          ribbon_type: "silver",
          ribbon_count: 1,
        });
        setMessage("");
      } catch {
        Alert.alert("Error", "Failed to post. Please try again.");
      }
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={180}>
      {/* Sub-tabs — config-driven */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-700 px-4">
        {config.wallSubTabs.map((tab) => (
          <Pressable
            key={tab}
            className={`mr-6 py-3 ${
              activeSubTab === tab ? "border-b-2 border-brand-700" : ""
            }`}
            onPress={() => setActiveSubTab(tab)}
          >
            <Text
              className={`text-sm font-sans-medium ${
                activeSubTab === tab ? "text-brand-700" : "text-gray-500"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={filteredTributes}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <View className="flex-row items-start">
              <Pressable
                className="flex-row items-start flex-1"
                onPress={() => item.author?.id && router.push(`/user/${item.author.id}` as any)}
                disabled={!item.author?.id}
              >
                <View className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden">
                  {item.author?.avatar_url ? (
                    <Image source={{ uri: item.author.avatar_url }} style={{ width: 32, height: 32 }} contentFit="cover" />
                  ) : (
                    <Ionicons name="person" size={14} color="#4A2D7A" />
                  )}
                </View>
              </Pressable>
              <View className="ml-2.5 flex-1">
                <View className="flex-row items-center">
                  <Pressable onPress={() => item.author?.id && router.push(`/user/${item.author.id}` as any)} disabled={!item.author?.id}>
                    <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                      {item.author?.display_name ?? "Anonymous"}
                    </Text>
                  </Pressable>
                  <Text className="text-[10px] font-sans text-gray-400 ml-2">{timeAgo(item.created_at)}</Text>
                </View>
                {item.content && (
                  <View className="mt-1">
                    <ExpandableText
                      className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5"
                      numberOfLines={4}
                    >
                      {item.content}
                    </ExpandableText>
                  </View>
                )}
                {item.media_url && (
                  <View className="rounded-2xl overflow-hidden mt-2">
                    <Image source={{ uri: item.media_url }} style={{ width: "100%", height: 150 }} contentFit="cover" />
                  </View>
                )}
                <View className="mt-1.5">
                  <ReactionBar
                    mode={config.mode}
                    memorialName={memorial ? `${memorial.first_name} ${memorial.last_name}` : ""}
                    counts={{
                      heart: item.like_count ?? 0,
                      candle: item.candle_count ?? 0,
                      flower: item.flower_count ?? 0,
                    }}
                    onReact={(type) => {
                      requireAuth(() => {
                        if (!user?.id) return;
                        toggleReaction.mutate({
                          userId: user.id,
                          targetType: "tribute",
                          targetId: item.id,
                          reactionType: type as "heart" | "candle" | "flower" | "prayer" | "dove",
                        });
                      });
                    }}
                    compact
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-16">
            <Ionicons name="chatbubble-ellipses-outline" size={36} color="#d1d5db" />
            <Text className="mt-3 text-center text-gray-400 text-xs font-sans">
              No {activeSubTab.toLowerCase()} yet.{"\n"}{config.emptyTributeText}
            </Text>
          </View>
        }
      />

      {/* Bottom input */}
      <View className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex-row items-center gap-2">
        <View className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 32, height: 32 }} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={14} color="#4A2D7A" />
          )}
        </View>
        <View className="flex-1 flex-row items-center rounded-full bg-gray-50 dark:bg-gray-800 px-3.5 py-2">
          <TextInput
            className="flex-1 text-xs font-sans text-gray-900 dark:text-white"
            placeholder={inputPlaceholder}
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            style={{ maxHeight: 60 }}
          />
        </View>
        <AIRewriteButton
          compact
          currentText={message}
          onResult={setMessage}
          contextType="wall_message"
          memorialId={id}
          hint={`${config.mode} wall message for ${memorial?.first_name ?? ""} ${memorial?.last_name ?? ""}`}
          onAISuggest={(params) => aiRewrite.mutateAsync(params)}
        />
        <Pressable
          className={`h-8 w-8 rounded-full items-center justify-center ${message.trim() ? "bg-brand-700" : "bg-gray-200 dark:bg-gray-700"}`}
          onPress={handleSend}
          disabled={!message.trim() || createTribute.isPending}
        >
          <Ionicons name="arrow-up" size={16} color={message.trim() ? "#ffffff" : "#9ca3af"} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
