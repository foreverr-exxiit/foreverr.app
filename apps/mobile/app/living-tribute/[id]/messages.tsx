import { View, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useLivingTributeMessages } from "@foreverr/core";
import { Text, TributeMessageCard } from "@foreverr/ui";

export default function LivingTributeMessagesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, fetchNextPage, hasNextPage } = useLivingTributeMessages(id);

  const messages = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <FlatList
        data={messages}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <TributeMessageCard
            content={item.content}
            mediaUrl={item.media_url}
            authorName={(item.author as any)?.display_name ?? "User"}
            authorAvatarUrl={(item.author as any)?.avatar_url}
            isAnonymous={item.is_anonymous}
            reactionCount={item.reaction_count}
            timestamp={item.created_at}
          />
        )}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-sm font-sans text-gray-400">No messages yet.</Text>
          </View>
        }
      />
    </View>
  );
}
