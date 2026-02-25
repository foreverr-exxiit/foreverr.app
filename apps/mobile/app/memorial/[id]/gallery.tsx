import { View, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with 16px padding + 8px gaps

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .eq("memorial_id", id!)
        .in("type", ["photo", "video"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <FlatList
      data={media ?? []}
      keyExtractor={(item: any) => item.id}
      numColumns={3}
      contentContainerStyle={{ padding: 16, gap: 4 }}
      columnWrapperStyle={{ gap: 4 }}
      renderItem={({ item }: { item: any }) => (
        <Pressable
          style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
          className="rounded-lg overflow-hidden bg-gray-100"
        >
          <Image
            source={{ uri: item.url || item.thumbnail_url }}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            contentFit="cover"
          />
          {item.type === "video" && (
            <View className="absolute inset-0 items-center justify-center bg-black/20">
              <Ionicons name="play-circle" size={32} color="white" />
            </View>
          )}
        </Pressable>
      )}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-8 py-20">
          <Ionicons name="images-outline" size={48} color="#d1d5db" />
          <Text className="mt-3 text-lg font-sans-bold text-gray-900 dark:text-white text-center">Photo Gallery</Text>
          <Text className="mt-1 text-sm font-sans text-center text-gray-500">
            No photos uploaded yet. Share photos and{"\n"}videos to celebrate their life.
          </Text>
        </View>
      }
    />
  );
}
