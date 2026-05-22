import { View, FlatList, Pressable, ActivityIndicator, Platform, Alert } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useServiceOrders, useUpdateServiceOrder } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: "time-outline" },
  accepted: { label: "Accepted", color: "text-blue-700", bg: "bg-blue-100", icon: "checkmark-circle-outline" },
  in_progress: { label: "In Progress", color: "text-indigo-700", bg: "bg-indigo-100", icon: "construct-outline" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100", icon: "checkmark-done-outline" },
  revision_requested: { label: "Revision", color: "text-orange-700", bg: "bg-orange-100", icon: "refresh-outline" },
  completed: { label: "Completed", color: "text-green-800", bg: "bg-green-200", icon: "trophy-outline" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100", icon: "close-circle-outline" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-100", icon: "warning-outline" },
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default function MyOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const { data: orders, isLoading } = useServiceOrders(user?.id, "buyer");
  const updateOrder = useUpdateServiceOrder();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeTab === "active") return orders.filter((o: any) => !["completed", "cancelled"].includes(o.status));
    if (activeTab === "completed") return orders.filter((o: any) => o.status === "completed");
    return orders;
  }, [orders, activeTab]);

  const activeCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter((o: any) => !["completed", "cancelled"].includes(o.status)).length;
  }, [orders]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">My Orders</Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Services you've ordered from creators
            </Text>
          </View>
          {activeCount > 0 && (
            <View className="bg-brand-700 rounded-full px-2.5 py-1">
              <Text className="text-[10px] font-sans-bold text-white">{activeCount} active</Text>
            </View>
          )}
        </View>
        <View className="flex-row gap-2">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              className={`px-4 py-2 rounded-full ${activeTab === tab.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"}`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text className={`text-xs font-sans-semibold ${activeTab === tab.key ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        renderItem={({ item }: { item: any }) => {
          const statusInfo = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          return (
            <Pressable
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3"
              onPress={() => router.push(`/creator/orders/${item.id}` as any)}
            >
              {/* Title & Status */}
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.service && (
                    <Text className="text-[11px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
                      {item.service.title}
                    </Text>
                  )}
                </View>
                <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${statusInfo.bg}`}>
                  <Ionicons name={statusInfo.icon as any} size={10} color={statusInfo.color.includes("amber") ? "#b45309" : statusInfo.color.includes("blue") ? "#1d4ed8" : statusInfo.color.includes("indigo") ? "#4338ca" : statusInfo.color.includes("green") ? "#15803d" : statusInfo.color.includes("orange") ? "#c2410c" : "#b91c1c"} />
                  <Text className={`text-[10px] font-sans-bold ${statusInfo.color}`}>{statusInfo.label}</Text>
                </View>
              </View>

              {/* Price & Time */}
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  {formatCents(item.amount_cents)}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">{timeAgo(item.created_at)}</Text>
              </View>

              {/* Progress indicator for active orders */}
              {!["completed", "cancelled"].includes(item.status) && (
                <View className="flex-row items-center gap-1.5 mt-3">
                  {["pending", "accepted", "in_progress", "delivered"].map((step, i) => {
                    const steps = ["pending", "accepted", "in_progress", "delivered"];
                    const currentIdx = steps.indexOf(item.status);
                    const isComplete = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <View key={step} className="flex-1 flex-row items-center">
                        <View className={`flex-1 h-1 rounded-full ${isComplete ? "bg-brand-700" : "bg-gray-200 dark:bg-gray-700"}`} />
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Buyer action hint */}
              {item.status === "delivered" && (
                <View className="flex-row items-center gap-1.5 mt-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                  <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
                  <Text className="text-[11px] font-sans-semibold text-green-700 dark:text-green-400">
                    Ready for review — tap to accept or request revision
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="bag-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No orders yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1">
                Browse the marketplace to hire a creator
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-6 py-3"
                onPress={() => router.push("/services" as any)}
              >
                <Text className="text-sm font-sans-semibold text-white">Browse Services</Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
}
