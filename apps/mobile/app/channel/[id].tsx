import { View, ScrollView, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useCreatorProfile, useChannelSubscribers, useChannelSubscription, useSubscribeToChannel, useMyServiceListings, useCreatorReviews, SUBSCRIPTION_TIERS, TIER_INFO } from "@foreverr/core";
import { Text, SubscribeSheet } from "@foreverr/ui";

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: creator, isLoading } = useCreatorProfile(id);
  const { data: subscribers } = useChannelSubscribers(id);
  const { data: mySub } = useChannelSubscription(id, user?.id);
  const { data: services } = useMyServiceListings(id);
  const { data: reviews } = useCreatorReviews(id);
  const subscribeMutation = useSubscribeToChannel();
  const [showSubscribeSheet, setShowSubscribeSheet] = useState(false);

  const tierInfo = TIER_INFO[(creator?.tier as keyof typeof TIER_INFO) ?? "rising"];
  const subscriberCount = subscribers?.length ?? 0;
  const isSubscribed = !!mySub;
  const isOwner = creator?.user_id === user?.id;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!creator) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
        <Ionicons name="tv-outline" size={48} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-3">Channel not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Channel Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-6 items-center">
        <View className="h-20 w-20 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-3">
          <Ionicons name="person" size={40} color="#4A2D7A" />
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
            {creator.display_name ?? "Creator"}
          </Text>
          {creator.is_verified && (
            <Ionicons name="checkmark-circle" size={18} color="#4A2D7A" />
          )}
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Text className="text-sm">{tierInfo.icon}</Text>
          <Text className="text-xs font-sans-semibold" style={{ color: tierInfo.color }}>
            {tierInfo.name}
          </Text>
        </View>
        {creator.tagline && (
          <Text className="text-xs font-sans text-gray-500 mt-2 text-center px-8">{creator.tagline}</Text>
        )}

        {/* Stats Row */}
        <View className="flex-row gap-6 mt-4">
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{formatCount(subscriberCount)}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Subscribers</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{services?.length ?? 0}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Services</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{creator.rating_avg?.toFixed(1) ?? "—"}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Rating</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{creator.lifetime_orders ?? 0}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Orders</Text>
          </View>
        </View>

        {/* Subscribe / Manage Button */}
        {!isOwner && (
          <View className="flex-row gap-3 mt-5 w-full">
            <Pressable
              className={`flex-1 rounded-xl py-3 items-center ${isSubscribed ? "bg-gray-100 dark:bg-gray-700" : "bg-brand-700"}`}
              onPress={() => requireAuth(() => setShowSubscribeSheet(true))}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name={isSubscribed ? "checkmark-circle" : "star"} size={16} color={isSubscribed ? "#4A2D7A" : "#fff"} />
                <Text className={`text-sm font-sans-semibold ${isSubscribed ? "text-brand-700" : "text-white"}`}>
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Text>
              </View>
            </Pressable>
            <Pressable
              className="bg-gray-100 dark:bg-gray-700 rounded-xl px-5 py-3 items-center"
              onPress={() => router.push(`/user/${creator.user_id}` as any)}
            >
              <Ionicons name="person-outline" size={18} color="#4A2D7A" />
            </Pressable>
          </View>
        )}

        {/* Current subscription badge */}
        {isSubscribed && mySub && (
          <View className="flex-row items-center gap-2 mt-3 bg-brand-50 dark:bg-brand-900/20 rounded-full px-4 py-1.5">
            <Ionicons name="star" size={12} color="#4A2D7A" />
            <Text className="text-[11px] font-sans-semibold text-brand-700">
              {SUBSCRIPTION_TIERS[mySub.tier as keyof typeof SUBSCRIPTION_TIERS]?.label ?? mySub.tier} Plan
            </Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {creator.bio && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About</Text>
          <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5">{creator.bio}</Text>
        </View>
      )}

      {/* Specialties */}
      {creator.specialties && (creator.specialties as string[]).length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Specialties</Text>
          <View className="flex-row flex-wrap gap-2">
            {(creator.specialties as string[]).map((s: string) => (
              <View key={s} className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1">
                <Text className="text-[11px] font-sans-semibold text-brand-700 capitalize">{s.replace(/_/g, " ")}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subscription Tiers */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Subscription Plans</Text>
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isCurrentTier = mySub?.tier === key;
          return (
            <View
              key={key}
              className={`p-3 rounded-xl mb-2 border ${isCurrentTier ? "border-brand-300 bg-brand-50 dark:bg-brand-900/20" : "border-gray-100 dark:border-gray-700"}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name={(tier.icon ?? "star-outline") as any} size={18} color="#4A2D7A" />
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{tier.label}</Text>
                  {isCurrentTier && (
                    <View className="bg-brand-700 rounded-full px-2 py-0.5">
                      <Text className="text-[8px] font-sans-bold text-white">CURRENT</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-sans-bold text-brand-700">
                  ${(tier.price / 100).toFixed(2)}/mo
                </Text>
              </View>
              {tier.description && (
                <Text className="text-[11px] font-sans text-gray-500 mt-1 ml-7">{tier.description}</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Services */}
      {services && services.length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Services Offered</Text>
          {services.slice(0, 5).map((service: any) => (
            <Pressable
              key={service.id}
              className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-700"
              onPress={() => router.push(`/services/${service.id}` as any)}
            >
              <View className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
                <Ionicons name="briefcase-outline" size={18} color="#4A2D7A" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>{service.title}</Text>
                <Text className="text-[10px] font-sans text-gray-400">{service.order_count ?? 0} orders</Text>
              </View>
              <Text className="text-xs font-sans-bold text-brand-700">${((service.price_cents ?? 0) / 100).toFixed(2)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Recent Reviews */}
      {reviews && reviews.length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4 mb-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Reviews ({reviews.length})
          </Text>
          {reviews.slice(0, 3).map((review: any) => (
            <View key={review.id} className="py-2.5 border-b border-gray-50 dark:border-gray-700">
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
                  {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
              {review.comment && (
                <Text className="text-xs font-sans text-gray-600 dark:text-gray-400" numberOfLines={3}>{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Subscribe Sheet */}
      <SubscribeSheet
        visible={showSubscribeSheet}
        onClose={() => setShowSubscribeSheet(false)}
        channelName={creator.display_name ?? "Creator"}
        channelId={id}
        currentTier={mySub?.tier ?? null}
        onSubscribe={async (tier: string, amountCents: number) => {
          if (!user?.id) return;
          await subscribeMutation.mutateAsync({
            channel_id: id,
            subscriber_id: user.id,
            tier,
            amount_cents: amountCents,
          });
          setShowSubscribeSheet(false);
        }}
      />
    </ScrollView>
  );
}
