import { View, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreatorEarnings, useEarningsSummary, useServiceOrders, useMyServiceListings, useCreatorReviews } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EARNING_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  service_order: { label: "Services", icon: "briefcase-outline", color: "#4A2D7A" },
  tip: { label: "Tips", icon: "heart-outline", color: "#ec4899" },
  fundraiser_fee: { label: "Fundraisers", icon: "ribbon-outline", color: "#059669" },
  tribute_gift: { label: "Gifts", icon: "gift-outline", color: "#f59e0b" },
  template_sale: { label: "Templates", icon: "document-outline", color: "#3b82f6" },
  event_ticket: { label: "Tickets", icon: "ticket-outline", color: "#8b5cf6" },
  referral_bonus: { label: "Referrals", icon: "people-outline", color: "#10b981" },
  bonus: { label: "Bonuses", icon: "star-outline", color: "#f97316" },
};

export default function CreatorAnalyticsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: creatorProfile, isLoading } = useMyCreatorProfile(user?.id);
  const creatorId = creatorProfile?.id;
  const { data: earnings } = useCreatorEarnings(creatorId);
  const { data: summary } = useEarningsSummary(creatorId);
  const { data: orders } = useServiceOrders(user?.id, "creator");
  const { data: services } = useMyServiceListings(creatorId);
  const { data: reviews } = useCreatorReviews(creatorId);

  // Monthly earnings for chart
  const monthlyData = useMemo(() => {
    if (!earnings) return [];
    const now = new Date();
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const matching = earnings.filter((e: any) => e.created_at?.startsWith(key));
      const total = matching.reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0);
      months.push({ label: MONTHS[d.getMonth()], total });
    }
    return months;
  }, [earnings]);

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 100);

  // Order stats
  const orderStats = useMemo(() => {
    if (!orders) return { total: 0, completed: 0, active: 0, cancelled: 0, avgValue: 0 };
    const completed = orders.filter((o: any) => o.status === "completed");
    const active = orders.filter((o: any) => !["completed", "cancelled"].includes(o.status));
    const cancelled = orders.filter((o: any) => o.status === "cancelled");
    const totalValue = completed.reduce((sum: number, o: any) => sum + (o.amount_cents ?? 0), 0);
    return {
      total: orders.length,
      completed: completed.length,
      active: active.length,
      cancelled: cancelled.length,
      avgValue: completed.length > 0 ? Math.round(totalValue / completed.length) : 0,
    };
  }, [orders]);

  // Revenue by type
  const revenueByType = useMemo(() => {
    if (!summary?.byType) return [];
    return Object.entries(summary.byType)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([type, amount]) => ({
        type,
        amount: amount as number,
        config: EARNING_TYPE_CONFIG[type] ?? { label: type, icon: "ellipsis-horizontal-outline", color: "#9ca3af" },
        pct: summary.totalEarned > 0 ? Math.round(((amount as number) / summary.totalEarned) * 100) : 0,
      }));
  }, [summary]);

  // Top services
  const topServices = useMemo(() => {
    if (!services) return [];
    return [...services].sort((a: any, b: any) => (b.order_count ?? 0) - (a.order_count ?? 0)).slice(0, 5);
  }, [services]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!creatorProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
        <Ionicons name="bar-chart-outline" size={48} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-3 text-center">
          Become a creator to access analytics
        </Text>
        <Pressable className="mt-4 bg-brand-700 rounded-xl px-6 py-3" onPress={() => router.push("/creator" as any)}>
          <Text className="text-sm font-sans-bold text-white">Go to Creator Hub</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Analytics</Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Track your performance and growth
        </Text>
      </View>

      {/* Key Metrics */}
      <View className="px-4 mt-3">
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
            <Ionicons name="wallet-outline" size={22} color="#059669" />
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mt-1">
              {formatCents(summary?.totalEarned ?? 0)}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Total Revenue</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
            <Ionicons name="cart-outline" size={22} color="#4A2D7A" />
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mt-1">
              {orderStats.total}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Total Orders</Text>
          </View>
        </View>
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
            <Ionicons name="star-outline" size={22} color="#f59e0b" />
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mt-1">
              {creatorProfile.rating_avg?.toFixed(1) ?? "0.0"}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Avg Rating ({reviews?.length ?? 0})</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
            <Ionicons name="trending-up-outline" size={22} color="#3b82f6" />
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mt-1">
              {formatCents(orderStats.avgValue)}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Avg Order Value</Text>
          </View>
        </View>
      </View>

      {/* Monthly Revenue Chart */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-4">Revenue (Last 6 Months)</Text>
        <View className="flex-row items-end justify-between" style={{ height: 120 }}>
          {monthlyData.map((m) => {
            const barHeight = Math.max((m.total / maxMonthly) * 100, 4);
            return (
              <View key={m.label} className="items-center flex-1">
                <Text className="text-[8px] font-sans-semibold text-gray-500 mb-1">
                  {m.total > 0 ? formatCents(m.total) : ""}
                </Text>
                <View
                  className="w-8 rounded-t-lg bg-brand-700"
                  style={{ height: barHeight }}
                />
                <Text className="text-[10px] font-sans text-gray-400 mt-1">{m.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Performance */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Order Performance</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center">
            <Text className="text-base font-sans-bold text-green-700 dark:text-green-400">{orderStats.completed}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Completed</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-base font-sans-bold text-blue-700 dark:text-blue-400">{orderStats.active}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Active</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-base font-sans-bold text-red-700 dark:text-red-400">{orderStats.cancelled}</Text>
            <Text className="text-[10px] font-sans text-gray-400">Cancelled</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
              {orderStats.total > 0 ? `${Math.round((orderStats.completed / orderStats.total) * 100)}%` : "—"}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400">Completion</Text>
          </View>
        </View>
      </View>

      {/* Revenue Breakdown */}
      {revenueByType.length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Revenue Breakdown</Text>
          {revenueByType.map(({ type, amount, config, pct }) => (
            <View key={type} className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 rounded-full items-center justify-center" style={{ backgroundColor: config.color + "15" }}>
                    <Ionicons name={config.icon as any} size={12} color={config.color} />
                  </View>
                  <Text className="text-xs font-sans text-gray-600 dark:text-gray-300">{config.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">{formatCents(amount)}</Text>
                  <Text className="text-[10px] font-sans text-gray-400">{pct}%</Text>
                </View>
              </View>
              <View className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: config.color }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Top Services */}
      {topServices.length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Top Services</Text>
          {topServices.map((service: any, i: number) => (
            <Pressable
              key={service.id}
              className={`flex-row items-center py-2.5 ${i > 0 ? "border-t border-gray-50 dark:border-gray-700" : ""}`}
              onPress={() => router.push(`/services/${service.id}` as any)}
            >
              <View className="h-6 w-6 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
                <Text className="text-[10px] font-sans-bold text-brand-700">#{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                  {service.title}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">
                  {service.order_count} orders · {formatCents(service.price_cents)}
                </Text>
              </View>
              <Text className="text-xs font-sans-bold text-green-700">
                {formatCents((service.order_count ?? 0) * (service.price_cents ?? 0))}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick Links */}
      <View className="flex-row gap-3 mx-4 mt-3 mb-4">
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push("/creator/earnings" as any)}
        >
          <Ionicons name="receipt-outline" size={20} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Earnings</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push("/creator/reviews" as any)}
        >
          <Ionicons name="star-outline" size={20} color="#f59e0b" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Reviews</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push("/creator/orders" as any)}
        >
          <Ionicons name="bag-outline" size={20} color="#3b82f6" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Orders</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
