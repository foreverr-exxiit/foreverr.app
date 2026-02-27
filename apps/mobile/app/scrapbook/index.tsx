import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper, ScrapbookPageCard } from "@foreverr/ui";
import { useScrapbookPages } from "@foreverr/core";

export default function ScrapbookScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { data: pages } = useScrapbookPages(memorialId);

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Scrapbook" }} />

      <FlatList
        data={pages ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="px-3 py-3"
        columnWrapperClassName="gap-3"
        renderItem={({ item }) => (
          <View className="flex-1">
            <ScrapbookPageCard
              title={item.title}
              pageNumber={item.page_number}
              backgroundColor={item.background_color}
              backgroundImageUrl={item.background_image_url}
              isPublished={item.is_published}
              createdAt={item.created_at}
              onPress={() =>
                router.push(
                  `/scrapbook/${item.id}?memorialId=${memorialId}`
                )
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📔</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Start Your Scrapbook
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              Create beautiful pages to preserve photos, stories, and memories
              in a digital scrapbook.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push(`/scrapbook/create?memorialId=${memorialId}`)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-purple-700 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
