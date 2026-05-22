import { View, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useMyCreatorProfile, useUpsertCreatorProfile, useMyServiceListings, useEarningsSummary, useCreatorPayouts, useServiceOrders, TIER_INFO, SERVICE_CATEGORIES } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: creatorProfile, isLoading } = useMyCreatorProfile(user?.id);
  const upsertProfile = useUpsertCreatorProfile();

  // Only fetch these if user has a creator profile
  const creatorId = creatorProfile?.id;
  const { data: services } = useMyServiceListings(creatorId);
  const { data: earnings } = useEarningsSummary(creatorId);
  const { data: payouts } = useCreatorPayouts(creatorId);
  const { data: orders } = useServiceOrders(user?.id, "creator");

  const tierInfo = TIER_INFO[(creatorProfile?.tier as keyof typeof TIER_INFO) ?? "rising"];
  const activeOrders = useMemo(() => (orders ?? []).filter((o: any) => !["completed", "cancelled"].includes(o.status)), [orders]);

  // ── Become a Creator ────────────────────────────────────────
  const handleBecomeCreator = () => {
    requireAuth(async () => {
      if (!user?.id) return;
      // Profile may still be loading — use fallback values
      const displayName = profile?.display_name || profile?.username || user.email?.split("@")[0] || "Creator";
      try {
        await upsertProfile.mutateAsync({
          user_id: user.id,
          display_name: displayName,
          tagline: "",
          bio: profile?.bio ?? "",
          specialties: [],
          avatar_url: profile?.avatar_url ?? null,
        });
        const msg = "Welcome to the Creator Program! You can now offer services and earn money.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("You're a Creator!", msg);
      } catch (err: any) {
        const errMsg = err?.message ?? "Failed to set up your creator profile. Please try again.";
        if (Platform.OS === "web") window.alert(errMsg);
        else Alert.alert("Error", errMsg);
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

  // ── Not a creator yet → onboarding view ─────────────────────
  if (!creatorProfile) {
    return (
      <ScrollView className="flex-1 bg-white dark:bg-gray-900">
        <View className="items-center px-6 py-12">
          <Text className="text-5xl mb-4">💰</Text>
          <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white text-center mb-2">
            Creator Program
          </Text>
          <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
            Earn money by honoring people. Offer tribute writing, memorial design, life storytelling, and more.
          </Text>

          {/* Benefits */}
          {[
            { icon: "create-outline", title: "Offer Services", desc: "Write tributes, design memorials, tell life stories" },
            { icon: "cash-outline", title: "Earn Income", desc: "Set your prices and get paid for your work" },
            { icon: "trophy-outline", title: "Level Up", desc: "Climb tiers from Rising to Legend with lower fees" },
            { icon: "heart-outline", title: "Honor Fundraisers", desc: "Create fundraisers and earn an organizer fee" },
            { icon: "star-outline", title: "Build Reputation", desc: "Get reviews, badges, and featured placement" },
            { icon: "people-outline", title: "Connect", desc: "Help families and fans celebrate the people they love" },
          ].map((item) => (
            <View key={item.title} className="flex-row items-start w-full max-w-sm mb-4">
              <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mr-3">
                <Ionicons name={item.icon as any} size={20} color="#4A2D7A" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{item.title}</Text>
                <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">{item.desc}</Text>
              </View>
            </View>
          ))}

          <Pressable
            className="mt-6 w-full max-w-sm rounded-xl bg-brand-700 py-4 items-center"
            onPress={handleBecomeCreator}
            disabled={upsertProfile.isPending}
          >
            {upsertProfile.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-sans-bold text-white">Become a Creator</Text>
            )}
          </Pressable>

          <Text className="text-[10px] font-sans text-gray-400 mt-3 text-center">
            Free to join. Platform takes 20% (less at higher tiers).
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ── Creator Dashboard ───────────────────────────────────────
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Profile header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5 mb-2">
        <View className="flex-row items-center">
          <View className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <View className="h-14 w-14">
                <Ionicons name="person" size={28} color="#4A2D7A" />
              </View>
            ) : (
              <Ionicons name="person" size={28} color="#4A2D7A" />
            )}
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                {creatorProfile.display_name || profile?.display_name}
              </Text>
              {creatorProfile.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color="#4A2D7A" />
              )}
            </View>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text className="text-sm">{tierInfo.icon}</Text>
              <Text className="text-xs font-sans-semibold" style={{ color: tierInfo.color }}>
                {tierInfo.name}
              </Text>
              <Text className="text-[10px] font-sans text-gray-400 ml-1">
                {creatorProfile.tier_points} pts
              </Text>
            </View>
          </View>
          <Pressable
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700"
            onPress={() => router.push("/creator/edit" as any)}
          >
            <Text className="text-xs font-sans-semibold text-gray-600 dark:text-gray-300">Edit</Text>
          </Pressable>
        </View>

        {/* Rating & Stats Row */}
        <View className="flex-row mt-4 gap-4">
          <View className="items-center flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {creatorProfile.rating_avg?.toFixed(1) ?? "0.0"}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Rating</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {creatorProfile.lifetime_orders ?? 0}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Orders</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {creatorProfile.completion_rate?.toFixed(0) ?? "100"}%
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Completion</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {services?.length ?? 0}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Services</Text>
          </View>
        </View>
      </View>

      {/* Earnings Card */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Earnings</Text>
          <Pressable onPress={() => router.push("/creator/earnings" as any)}>
            <Text className="text-xs font-sans-semibold text-brand-700">View All</Text>
          </Pressable>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 items-center">
            <Text className="text-[10px] font-sans text-green-600 mb-1">Total Earned</Text>
            <Text className="text-base font-sans-bold text-green-700 dark:text-green-400">
              {formatCents(earnings?.totalEarned ?? creatorProfile.total_earned_cents ?? 0)}
            </Text>
          </View>
          <View className="flex-1 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 items-center">
            <Text className="text-[10px] font-sans text-brand-600 mb-1">Available</Text>
            <Text className="text-base font-sans-bold text-brand-700 dark:text-brand-400">
              {formatCents(earnings?.clearedEarnings ?? creatorProfile.pending_balance_cents ?? 0)}
            </Text>
          </View>
          <View className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 items-center">
            <Text className="text-[10px] font-sans text-amber-600 mb-1">Pending</Text>
            <Text className="text-base font-sans-bold text-amber-700 dark:text-amber-400">
              {formatCents(earnings?.pendingEarnings ?? 0)}
            </Text>
          </View>
        </View>
        {(earnings?.clearedEarnings ?? 0) > 0 && (
          <Pressable
            className="mt-3 bg-green-600 rounded-xl py-3 items-center"
            onPress={() => router.push("/creator/payout" as any)}
          >
            <Text className="text-sm font-sans-semibold text-white">Request Payout</Text>
          </Pressable>
        )}
      </View>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Active Orders</Text>
              <View className="bg-brand-700 rounded-full px-2 py-0.5">
                <Text className="text-[10px] font-sans-bold text-white">{activeOrders.length}</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/creator/orders" as any)}>
              <Text className="text-xs font-sans-semibold text-brand-700">View All</Text>
            </Pressable>
          </View>
          {activeOrders.slice(0, 3).map((order: any) => (
            <Pressable
              key={order.id}
              className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-700"
              onPress={() => router.push(`/creator/orders/${order.id}` as any)}
            >
              <View className={`h-2 w-2 rounded-full mr-3 ${
                order.status === "in_progress" ? "bg-blue-500" :
                order.status === "delivered" ? "bg-green-500" :
                order.status === "revision_requested" ? "bg-amber-500" : "bg-gray-400"
              }`} />
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                  {order.title}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400 capitalize">{order.status.replace(/_/g, " ")}</Text>
              </View>
              <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
                {formatCents(order.amount_cents)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View className="mx-4 mt-3">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          {[
            { icon: "add-circle-outline", label: "New Service", route: "/services/create", color: "#4A2D7A" },
            { icon: "ribbon-outline", label: "Honor Fundraiser", route: "/honor-fundraiser/create", color: "#059669" },
            { icon: "color-palette-outline", label: "Templates", route: "/creator/templates", color: "#ec4899" },
            { icon: "people-outline", label: "Top Creators", route: "/creator/leaderboard", color: "#7c3aed" },
          ].map((action) => (
            <Pressable
              key={action.label}
              className="flex-1 min-w-[45%] bg-white dark:bg-gray-800 rounded-xl p-4 items-center"
              onPress={() => router.push(action.route as any)}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
              <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-2 text-center">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Management Links */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl overflow-hidden">
        {[
          { icon: "bar-chart-outline", label: "Analytics", subtitle: "Track your performance", route: "/creator/analytics", color: "#3b82f6" },
          { icon: "shield-checkmark-outline", label: "Verification", subtitle: creatorProfile.is_verified ? "Verified ✓" : "Get verified", route: "/verification", color: "#059669" },
          { icon: "receipt-outline", label: "Orders", subtitle: `${activeOrders.length} active`, route: "/creator/orders", color: "#4A2D7A" },
          { icon: "bag-outline", label: "My Orders (Buyer)", subtitle: "Services you've ordered", route: "/creator/my-orders", color: "#3b82f6" },
          { icon: "star-outline", label: "Reviews", subtitle: `${creatorProfile.rating_count ?? 0} reviews`, route: "/creator/reviews", color: "#f59e0b" },
          { icon: "cash-outline", label: "Payouts", subtitle: "Request & track payouts", route: "/creator/payout", color: "#059669" },
          { icon: "storefront-outline", label: "Browse Marketplace", subtitle: "Discover services", route: "/services", color: "#d97706" },
          { icon: "ribbon-outline", label: "Fundraisers", subtitle: "Browse active fundraisers", route: "/honor-fundraiser", color: "#7c3aed" },
          { icon: "document-text-outline", label: "Content Licensing", subtitle: "License reusable content", route: "/licensing", color: "#6366f1" },
          { icon: "flame-outline", label: "Honor-a-Day", subtitle: "Sponsor memorial days", route: "/honor-day", color: "#f97316" },
          { icon: "ticket-outline", label: "My Tickets", subtitle: "Events you've bought tickets for", route: "/creator/my-tickets", color: "#06b6d4" },
          { icon: "star-half-outline", label: "My Subscriptions", subtitle: "Creators you subscribe to", route: "/creator/my-subscriptions", color: "#8b5cf6" },
          { icon: "sunny-outline", label: "My Sponsored Days", subtitle: "Days you've honored", route: "/honor-day/my-sponsorships", color: "#0891b2" },
        ].map((item, i) => (
          <Pressable
            key={item.label}
            className={`flex-row items-center px-4 py-3.5 ${i > 0 ? "border-t border-gray-50 dark:border-gray-700" : ""}`}
            onPress={() => router.push(item.route as any)}
          >
            <View className="h-8 w-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.color + "15" }}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{item.label}</Text>
              <Text className="text-[10px] font-sans text-gray-400">{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        ))}
      </View>

      {/* My Services */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">My Services</Text>
          <Pressable onPress={() => router.push("/services/create" as any)}>
            <Ionicons name="add-circle-outline" size={20} color="#4A2D7A" />
          </Pressable>
        </View>
        {!services || services.length === 0 ? (
          <View className="items-center py-6">
            <Ionicons name="briefcase-outline" size={32} color="#d1d5db" />
            <Text className="text-xs font-sans text-gray-400 mt-2 text-center">
              No services yet. Create your first service to start earning.
            </Text>
            <Pressable
              className="mt-3 rounded-full bg-brand-700 px-5 py-2"
              onPress={() => router.push("/services/create" as any)}
            >
              <Text className="text-xs font-sans-semibold text-white">Create Service</Text>
            </Pressable>
          </View>
        ) : (
          services.slice(0, 5).map((service: any) => (
            <Pressable
              key={service.id}
              className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-700"
              onPress={() => router.push(`/services/${service.id}` as any)}
            >
              <View className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
                <Ionicons
                  name={(SERVICE_CATEGORIES[service.category as keyof typeof SERVICE_CATEGORIES]?.icon ?? "briefcase-outline") as any}
                  size={18}
                  color="#4A2D7A"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                  {service.title}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">
                  {service.order_count} orders · {formatCents(service.price_cents)}
                </Text>
              </View>
              <View className={`px-2 py-0.5 rounded-full ${service.is_active ? "bg-green-100" : "bg-gray-100"}`}>
                <Text className={`text-[10px] font-sans-semibold ${service.is_active ? "text-green-700" : "text-gray-500"}`}>
                  {service.is_active ? "Active" : "Paused"}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Creator Tier Progress */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 mb-4 rounded-2xl p-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Creator Tier</Text>
        <View className="flex-row items-center justify-between mb-2">
          {(["rising", "bronze", "silver", "gold", "platinum", "legend"] as const).map((t) => {
            const info = TIER_INFO[t];
            const isActive = t === creatorProfile.tier;
            return (
              <View key={t} className={`items-center ${isActive ? "opacity-100" : "opacity-40"}`}>
                <Text className="text-lg">{info.icon}</Text>
                <Text className="text-[8px] font-sans mt-0.5" style={{ color: info.color }}>{info.name.split(" ")[0]}</Text>
              </View>
            );
          })}
        </View>
        <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
          <View
            className="h-full rounded-full bg-brand-700"
            style={{ width: `${Math.min((creatorProfile.tier_points / 15000) * 100, 100)}%` }}
          />
        </View>
        <Text className="text-[10px] font-sans text-gray-400 mt-1 text-center">
          {creatorProfile.tier_points} / 15,000 points to Legend
        </Text>
      </View>
    </ScrollView>
  );
}
