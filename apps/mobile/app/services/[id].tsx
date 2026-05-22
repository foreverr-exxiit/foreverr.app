import { View, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useServiceListing, useCreatorReviews, useCreateServiceOrder, SERVICE_CATEGORIES, TIER_INFO } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatPrice(cents: number, type?: string): string {
  if (cents === 0) return "Free";
  const base = `$${(cents / 100).toFixed(0)}`;
  if (type === "hourly") return `${base}/hr`;
  if (type === "custom") return `From ${base}`;
  return base;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: service, isLoading } = useServiceListing(id);
  const { data: reviews } = useCreatorReviews(service?.creator_id);
  const createOrder = useCreateServiceOrder();

  const catInfo = service ? SERVICE_CATEGORIES[service.category as keyof typeof SERVICE_CATEGORIES] : null;
  const tierInfo = service?.creator ? TIER_INFO[(service.creator.tier as keyof typeof TIER_INFO) ?? "rising"] : TIER_INFO.rising;
  const isOwnService = user?.id === service?.creator?.user_id;

  const packages = useMemo(() => {
    if (!service?.packages) return [];
    try {
      return Array.isArray(service.packages) ? service.packages : JSON.parse(service.packages);
    } catch { return []; }
  }, [service?.packages]);

  const handleOrder = (packageName?: string, priceCents?: number) => {
    requireAuth(async () => {
      if (!user?.id || !service) return;
      if (isOwnService) {
        const msg = "You can't order your own service!";
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Oops", msg);
        return;
      }
      const amount = priceCents ?? service.price_cents;
      const platformFee = Math.round(amount * 0.15); // 15% default, adjusted by tier on backend
      try {
        const order = await createOrder.mutateAsync({
          service_id: service.id,
          creator_id: service.creator_id,
          buyer_id: user.id,
          title: service.title,
          description: packageName ? `Package: ${packageName}` : undefined,
          package_name: packageName,
          amount_cents: amount,
          platform_fee_cents: platformFee,
          creator_payout_cents: amount - platformFee,
        });
        const msg = "Your order has been placed! The creator will review it shortly.";
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Order Placed!", msg);
        router.push(`/creator/orders/${order.id}` as any);
      } catch {
        const msg = "Failed to place order. Please try again.";
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
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-4">Service Not Found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Cover */}
      <View className="h-44 bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
        <Ionicons name={(catInfo?.icon ?? "briefcase-outline") as any} size={44} color="#4A2D7A" />
        <Text className="text-sm font-sans-semibold text-brand-600 mt-2">{catInfo?.label ?? service.category}</Text>
        {isOwnService && (
          <Pressable
            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 rounded-full px-3 py-1.5 flex-row items-center gap-1"
            onPress={() => router.push(`/services/edit?id=${service.id}` as any)}
          >
            <Ionicons name="create-outline" size={14} color="#4A2D7A" />
            <Text className="text-xs font-sans-semibold text-brand-700">Edit</Text>
          </Pressable>
        )}
      </View>

      {/* Title & Price */}
      <View className="px-4 pt-4">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">{service.title}</Text>
        <View className="flex-row items-center gap-3 mt-2">
          <View className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-1.5">
            <Text className="text-lg font-sans-bold text-green-700 dark:text-green-400">
              {formatPrice(service.price_cents, service.pricing_type)}
            </Text>
          </View>
          {service.rating_avg > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">
                {service.rating_avg.toFixed(1)}
              </Text>
              <Text className="text-xs font-sans text-gray-400">({service.rating_count})</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="cart-outline" size={14} color="#9ca3af" />
            <Text className="text-xs font-sans text-gray-400">{service.order_count} orders</Text>
          </View>
        </View>
      </View>

      {/* Quick stats row */}
      <View className="flex-row mx-4 mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 gap-4">
        <View className="flex-1 items-center">
          <Ionicons name="time-outline" size={16} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">{service.delivery_days} days</Text>
          <Text className="text-[10px] font-sans text-gray-400">Delivery</Text>
        </View>
        <View className="flex-1 items-center">
          <Ionicons name="refresh-outline" size={16} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">{service.max_revisions}</Text>
          <Text className="text-[10px] font-sans text-gray-400">Revisions</Text>
        </View>
        <View className="flex-1 items-center">
          <Ionicons name="eye-outline" size={16} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">{service.view_count}</Text>
          <Text className="text-[10px] font-sans text-gray-400">Views</Text>
        </View>
      </View>

      {/* Description */}
      {service.description && (
        <View className="px-4 mt-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About This Service</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">{service.description}</Text>
        </View>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <View className="px-4 mt-5">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Packages</Text>
          {packages.map((pkg: any, i: number) => (
            <View key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{pkg.name}</Text>
                <Text className="text-sm font-sans-bold text-green-700 dark:text-green-400">
                  ${((pkg.price_cents ?? 0) / 100).toFixed(0)}
                </Text>
              </View>
              {pkg.description && (
                <Text className="text-xs font-sans text-gray-500 mb-2">{pkg.description}</Text>
              )}
              {pkg.features && (
                <View className="mb-2">
                  {pkg.features.map((f: string, j: number) => (
                    <View key={j} className="flex-row items-center gap-1.5 mt-1">
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">{f}</Text>
                    </View>
                  ))}
                </View>
              )}
              {pkg.delivery_days && (
                <Text className="text-[10px] font-sans text-gray-400">{pkg.delivery_days} day delivery</Text>
              )}
              <Pressable
                className="mt-3 bg-brand-700 rounded-lg py-2.5 items-center"
                onPress={() => handleOrder(pkg.name, pkg.price_cents)}
                disabled={createOrder.isPending}
              >
                <Text className="text-xs font-sans-semibold text-white">
                  {createOrder.isPending ? "Ordering..." : `Order — $${((pkg.price_cents ?? 0) / 100).toFixed(0)}`}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Creator Card */}
      <View className="px-4 mt-5">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">About the Creator</Text>
        <Pressable
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
          onPress={() => service.creator?.user_id && router.push(`/user/${service.creator.user_id}` as any)}
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-2" style={{ borderColor: tierInfo.color }}>
              <Ionicons name="person" size={24} color="#4A2D7A" />
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  {service.creator?.display_name ?? "Creator"}
                </Text>
                {service.creator?.is_verified && (
                  <Ionicons name="checkmark-circle" size={14} color="#4A2D7A" />
                )}
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Text className="text-xs">{tierInfo.icon}</Text>
                <Text className="text-[11px] font-sans" style={{ color: tierInfo.color }}>{tierInfo.name}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>

          {service.creator?.bio && (
            <Text className="text-xs font-sans text-gray-500 mt-3" numberOfLines={2}>{service.creator.bio}</Text>
          )}

          <View className="flex-row mt-3 gap-4">
            <View className="items-center">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {service.creator?.rating_avg?.toFixed(1) ?? "N/A"}
              </Text>
              <Text className="text-[10px] font-sans text-gray-400">Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {service.creator?.lifetime_orders ?? 0}
              </Text>
              <Text className="text-[10px] font-sans text-gray-400">Orders</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {service.creator?.response_time_hours ?? 24}h
              </Text>
              <Text className="text-[10px] font-sans text-gray-400">Response</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Reviews */}
      <View className="px-4 mt-5">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
          Reviews ({reviews?.length ?? 0})
        </Text>
        {(!reviews || reviews.length === 0) ? (
          <View className="items-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#d1d5db" />
            <Text className="text-xs font-sans text-gray-400 mt-2">No reviews yet</Text>
          </View>
        ) : (
          reviews.slice(0, 5).map((review: any) => (
            <View key={review.id} className="mb-3 pb-3 border-b border-gray-50 dark:border-gray-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                    <Ionicons name="person" size={12} color="#4A2D7A" />
                  </View>
                  <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                    {review.reviewer?.display_name ?? "User"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name={s <= review.rating ? "star" : "star-outline"} size={12} color="#fbbf24" />
                  ))}
                </View>
              </View>
              {review.review_text && (
                <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-2 leading-5">{review.review_text}</Text>
              )}
              <Text className="text-[9px] font-sans text-gray-400 mt-1">{timeAgo(review.created_at)}</Text>
            </View>
          ))
        )}
      </View>

      {/* Tags */}
      {service.tags && service.tags.length > 0 && (
        <View className="px-4 mt-4">
          <View className="flex-row flex-wrap gap-2">
            {service.tags.map((tag: string) => (
              <View key={tag} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                <Text className="text-[10px] font-sans text-gray-500">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bottom CTA */}
      {!isOwnService && packages.length === 0 && (
        <View className="px-4 mt-6">
          <Pressable
            className={`rounded-xl py-4 items-center ${createOrder.isPending ? "bg-brand-400" : "bg-brand-700"}`}
            onPress={() => handleOrder()}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-sans-bold text-white">
                Order Now — {formatPrice(service.price_cents, service.pricing_type)}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
