import { View, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreatorReviews } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#fbbf24" : "#d1d5db"}
        />
      ))}
    </View>
  );
}

export default function CreatorReviewsScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyCreatorProfile(user?.id);
  const { data: reviews, isLoading: reviewsLoading } = useCreatorReviews(profile?.id);

  const isLoading = profileLoading || reviewsLoading;

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: (reviews ?? []).filter((r: any) => r.rating === star).length,
  }));
  const totalReviews = reviews?.length ?? 0;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header with stats */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-4">Reviews</Text>

        {profile && totalReviews > 0 && (
          <View className="flex-row gap-5">
            {/* Average rating */}
            <View className="items-center">
              <Text className="text-4xl font-sans-bold text-gray-900 dark:text-white">
                {(profile.rating_avg ?? 0).toFixed(1)}
              </Text>
              <StarDisplay rating={Math.round(profile.rating_avg ?? 0)} />
              <Text className="text-xs font-sans text-gray-500 mt-1">{totalReviews} reviews</Text>
            </View>

            {/* Distribution bars */}
            <View className="flex-1 justify-center gap-1">
              {distribution.map(({ star, count }) => {
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <View key={star} className="flex-row items-center gap-2">
                    <Text className="text-[10px] font-sans text-gray-500 w-3 text-right">{star}</Text>
                    <Ionicons name="star" size={10} color="#fbbf24" />
                    <View className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                    <Text className="text-[10px] font-sans text-gray-400 w-5">{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Reviews list */}
      <FlatList
        data={reviews ?? []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        renderItem={({ item }: { item: any }) => (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
            {/* Reviewer info */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                  {item.reviewer?.avatar_url ? (
                    <Ionicons name="person" size={14} color="#4A2D7A" />
                  ) : (
                    <Ionicons name="person" size={14} color="#4A2D7A" />
                  )}
                </View>
                <View>
                  <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">
                    {item.reviewer?.display_name ?? "Anonymous"}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400">{timeAgo(item.created_at)}</Text>
                </View>
              </View>
              <StarDisplay rating={item.rating} />
            </View>

            {/* Review text */}
            {item.review_text && (
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5">
                {item.review_text}
              </Text>
            )}

            {/* Featured badge */}
            {item.is_featured && (
              <View className="flex-row items-center gap-1 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1 self-start">
                <Ionicons name="star" size={10} color="#d97706" />
                <Text className="text-[10px] font-sans-semibold text-amber-700 dark:text-amber-400">Featured Review</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No reviews yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-8">
                Reviews will appear here after buyers complete orders and rate your work
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
