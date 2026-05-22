import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreatorEarnings, useEarningsSummary } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const EARNING_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  service_order: { label: "Service Order", icon: "briefcase-outline", color: "#4A2D7A" },
  tip: { label: "Tip", icon: "heart-outline", color: "#ec4899" },
  fundraiser_fee: { label: "Fundraiser Fee", icon: "ribbon-outline", color: "#059669" },
  tribute_gift: { label: "Tribute Gift", icon: "gift-outline", color: "#f59e0b" },
  template_sale: { label: "Template Sale", icon: "document-outline", color: "#3b82f6" },
  event_ticket: { label: "Event Ticket", icon: "ticket-outline", color: "#8b5cf6" },
  referral_bonus: { label: "Referral Bonus", icon: "people-outline", color: "#10b981" },
  bonus: { label: "Platform Bonus", icon: "star-outline", color: "#f97316" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CreatorEarningsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: creatorProfile } = useMyCreatorProfile(user?.id);
  const { data: earnings, isLoading } = useCreatorEarnings(creatorProfile?.id);
  const { data: summary } = useEarningsSummary(creatorProfile?.id);

  // Group earnings by month
  const grouped = useMemo(() => {
    if (!earnings) return [];
    const groups: Record<string, any[]> = {};
    for (const e of earnings) {
      const date = new Date(e.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return Object.entries(groups).map(([key, items]) => ({
      month: new Date(key + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      items,
      total: items.reduce((sum: number, e: any) => sum + (e.net_amount_cents ?? 0), 0),
    }));
  }, [earnings]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Summary Cards */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-4">Earnings Overview</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3.5 items-center">
            <Ionicons name="wallet-outline" size={20} color="#059669" />
            <Text className="text-lg font-sans-bold text-green-700 dark:text-green-400 mt-1">
              {formatCents(summary?.totalEarned ?? 0)}
            </Text>
            <Text className="text-[10px] font-sans text-green-600">Total Earned</Text>
          </View>
          <View className="flex-1 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3.5 items-center">
            <Ionicons name="cash-outline" size={20} color="#4A2D7A" />
            <Text className="text-lg font-sans-bold text-brand-700 dark:text-brand-400 mt-1">
              {formatCents(summary?.clearedEarnings ?? 0)}
            </Text>
            <Text className="text-[10px] font-sans text-brand-600">Available</Text>
          </View>
        </View>
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5 items-center">
            <Ionicons name="hourglass-outline" size={20} color="#d97706" />
            <Text className="text-lg font-sans-bold text-amber-700 dark:text-amber-400 mt-1">
              {formatCents(summary?.pendingEarnings ?? 0)}
            </Text>
            <Text className="text-[10px] font-sans text-amber-600">Pending (7-day hold)</Text>
          </View>
          <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5 items-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="#2563eb" />
            <Text className="text-lg font-sans-bold text-blue-700 dark:text-blue-400 mt-1">
              {formatCents(summary?.paidOut ?? 0)}
            </Text>
            <Text className="text-[10px] font-sans text-blue-600">Paid Out</Text>
          </View>
        </View>

        {(summary?.clearedEarnings ?? 0) > 0 && (
          <Pressable
            className="mt-4 bg-green-600 rounded-xl py-3 items-center"
            onPress={() => router.push("/creator/payout" as any)}
          >
            <Text className="text-sm font-sans-semibold text-white">Request Payout</Text>
          </Pressable>
        )}
      </View>

      {/* Earnings by Type */}
      {summary?.byType && Object.keys(summary.byType).length > 0 && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Earnings by Source</Text>
          {Object.entries(summary.byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => {
            const config = EARNING_TYPE_CONFIG[type] ?? { label: type, icon: "ellipsis-horizontal-outline", color: "#9ca3af" };
            return (
              <View key={type} className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-700">
                <View className="h-8 w-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: config.color + "15" }}>
                  <Ionicons name={config.icon as any} size={16} color={config.color} />
                </View>
                <Text className="text-xs font-sans text-gray-600 dark:text-gray-300 flex-1">{config.label}</Text>
                <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">{formatCents(amount)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Transaction History */}
      <View className="mx-4 mt-4">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Transaction History</Text>
        {grouped.length === 0 ? (
          <View className="items-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <Ionicons name="receipt-outline" size={36} color="#d1d5db" />
            <Text className="text-sm font-sans text-gray-400 mt-3">No earnings yet</Text>
            <Text className="text-xs font-sans text-gray-400 mt-1">Start offering services to earn money</Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.month} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-sans-semibold text-gray-500">{group.month}</Text>
                <Text className="text-xs font-sans-bold text-green-700">{formatCents(group.total)}</Text>
              </View>
              <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                {group.items.map((item: any) => {
                  const config = EARNING_TYPE_CONFIG[item.type] ?? { label: item.type, icon: "ellipsis-horizontal-outline", color: "#9ca3af" };
                  return (
                    <View key={item.id} className="flex-row items-center px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                      <View className="h-8 w-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: config.color + "15" }}>
                        <Ionicons name={config.icon as any} size={14} color={config.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">{config.label}</Text>
                        {item.description && (
                          <Text className="text-[10px] font-sans text-gray-400" numberOfLines={1}>{item.description}</Text>
                        )}
                        <Text className="text-[9px] font-sans text-gray-400 mt-0.5">{timeAgo(item.created_at)}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-sans-bold text-green-700 dark:text-green-400">
                          +{formatCents(item.net_amount_cents)}
                        </Text>
                        <View className={`mt-0.5 px-1.5 py-0.5 rounded-full ${
                          item.status === "cleared" ? "bg-green-100" :
                          item.status === "paid_out" ? "bg-blue-100" :
                          "bg-amber-100"
                        }`}>
                          <Text className={`text-[8px] font-sans-semibold ${
                            item.status === "cleared" ? "text-green-700" :
                            item.status === "paid_out" ? "text-blue-700" :
                            "text-amber-700"
                          }`}>
                            {item.status === "cleared" ? "Available" : item.status === "paid_out" ? "Paid" : "Pending"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
