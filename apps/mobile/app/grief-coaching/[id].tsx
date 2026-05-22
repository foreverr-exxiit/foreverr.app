import { View, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useServiceListing, useCreateServiceOrder, useCreatorReviews, TIER_INFO } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function GriefCoachDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: service, isLoading } = useServiceListing(id);
  const { data: reviews } = useCreatorReviews(service?.creator_id);
  const createOrder = useCreateServiceOrder();

  const creator = (service as any)?.creator;
  const tierInfo = TIER_INFO[(creator?.tier as keyof typeof TIER_INFO) ?? "rising"];
  const isOwner = creator?.user_id === user?.id;

  const handleBookSession = () => {
    requireAuth(async () => {
      if (!user?.id || !service) return;
      try {
        const feeRate = 0.15;
        const platformFee = Math.round(service.price_cents * feeRate);
        await createOrder.mutateAsync({
          service_id: service.id,
          buyer_id: user.id,
          creator_id: service.creator_id,
          title: service.title,
          description: "Grief coaching session",
          amount_cents: service.price_cents,
          platform_fee_cents: platformFee,
          creator_payout_cents: service.price_cents - platformFee,
        });
        const msg = "Your grief coaching session has been booked. The coach will reach out shortly.";
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Session Booked 💜", msg);
      } catch {
        const msg = "Could not book the session. Please try again.";
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
      }
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
        <Ionicons name="heart-dislike-outline" size={48} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-3">Service not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Coach Header */}
        <View className="items-center pt-6 pb-4 px-4">
          <View className="h-20 w-20 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
            <Ionicons name="heart" size={36} color="#4A2D7A" />
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              {creator?.display_name ?? "Grief Coach"}
            </Text>
            {creator?.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color="#4A2D7A" />
            )}
          </View>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Text className="text-sm">{tierInfo.icon}</Text>
            <Text className="text-xs font-sans-semibold" style={{ color: tierInfo.color }}>
              {tierInfo.name}
            </Text>
          </View>
        </View>

        {/* Session Title */}
        <View className="bg-gray-50 dark:bg-gray-800 mx-4 rounded-2xl p-4">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white">{service.title}</Text>
          <View className="flex-row items-center gap-4 mt-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300">
                {creator?.rating_avg?.toFixed(1) ?? "New"}
              </Text>
              <Text className="text-[10px] font-sans text-gray-400">({creator?.rating_count ?? 0})</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
              <Text className="text-xs font-sans text-gray-500">{service.order_count ?? 0} sessions</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-xs font-sans text-gray-500">{service.delivery_days ?? 3} day response</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {service.description && (
          <View className="mx-4 mt-3">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About This Service</Text>
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5">{service.description}</Text>
          </View>
        )}

        {/* What to Expect */}
        <View className="bg-blue-50 dark:bg-blue-900/20 mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-blue-800 dark:text-blue-300 mb-3">What to Expect</Text>
          {[
            { icon: "shield-checkmark-outline", text: "Safe, confidential space" },
            { icon: "chatbubbles-outline", text: "Compassionate listening & guidance" },
            { icon: "calendar-outline", text: "Flexible scheduling" },
            { icon: "heart-outline", text: "Personalized coping strategies" },
          ].map((item) => (
            <View key={item.text} className="flex-row items-center gap-2.5 mb-2">
              <Ionicons name={item.icon as any} size={16} color="#2563eb" />
              <Text className="text-xs font-sans text-blue-700 dark:text-blue-400">{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <View className="mx-4 mt-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">Topics Covered</Text>
            <View className="flex-row flex-wrap gap-2">
              {service.tags.map((tag: string) => (
                <View key={tag} className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1">
                  <Text className="text-[11px] font-sans-semibold text-brand-700">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Creator Profile Card */}
        <Pressable
          className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
          onPress={() => creator?.user_id && router.push(`/user/${creator.user_id}` as any)}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
              <Ionicons name="person" size={24} color="#4A2D7A" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                {creator?.display_name ?? "Coach"}
              </Text>
              {creator?.tagline && (
                <Text className="text-[11px] font-sans text-gray-500" numberOfLines={1}>{creator.tagline}</Text>
              )}
              <Text className="text-[10px] font-sans text-gray-400 mt-0.5">
                {creator?.lifetime_orders ?? 0} lifetime sessions · {creator?.completion_rate?.toFixed(0) ?? "100"}% completion
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>
        </Pressable>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <View className="mx-4 mt-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
              Client Reviews ({reviews.length})
            </Text>
            {reviews.slice(0, 5).map((review: any) => (
              <View key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2">
                <View className="flex-row items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < (review.rating ?? 0) ? "star" : "star-outline"}
                      size={12}
                      color={i < (review.rating ?? 0) ? "#f59e0b" : "#d1d5db"}
                    />
                  ))}
                  <Text className="text-[10px] font-sans text-gray-400 ml-1">
                    {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
                {review.comment && (
                  <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Crisis helpline */}
        <View className="mx-4 mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="warning-outline" size={16} color="#d97706" />
            <Text className="text-xs font-sans-semibold text-amber-800 dark:text-amber-300">
              In a crisis?
            </Text>
          </View>
          <Text className="text-[11px] font-sans text-amber-700 dark:text-amber-400">
            If you or someone you know is in immediate danger, please call 911 or the 988 Suicide & Crisis Lifeline.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      {!isOwner && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-sans-bold text-brand-700">{formatCents(service.price_cents)}</Text>
            <Text className="text-[10px] font-sans text-gray-400">per session · 15% platform fee</Text>
          </View>
          <Pressable
            className={`rounded-xl py-4 items-center ${createOrder.isPending ? "bg-brand-400" : "bg-brand-700"}`}
            onPress={handleBookSession}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text className="text-sm font-sans-bold text-white">Book a Session</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
