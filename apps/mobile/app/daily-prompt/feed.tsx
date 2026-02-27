import { View, FlatList, ActivityIndicator } from "react-native";
import { usePromptFeed } from "@foreverr/core";
import { Text, PromptResponseCard } from "@foreverr/ui";

export default function DailyPromptFeedScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePromptFeed();
  const responses = data?.pages.flatMap((p) => p.data) ?? [];

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
        data={responses}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <PromptResponseCard
            authorName="Community Member"
            content={item.content}
            reactionCount={item.reaction_count ?? 0}
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
            <Text className="text-sm font-sans text-gray-400">No community responses yet.</Text>
          </View>
        }
      />
    </View>
  );
}
