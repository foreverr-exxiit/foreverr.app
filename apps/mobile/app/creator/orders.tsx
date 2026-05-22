import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useServiceOrders, useUpdateServiceOrder } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100" },
  accepted: { label: "Accepted", color: "text-blue-700", bg: "bg-blue-100" },
  in_progress: { label: "In Progress", color: "text-indigo-700", bg: "bg-indigo-100" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
  revision_requested: { label: "Revision", color: "text-orange-700", bg: "bg-orange-100" },
  completed: { label: "Completed", color: "text-green-800", bg: "bg-green-200" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
  disputed: { label: "Disputed", color: "text-red-700", bg: "bg-red-100" },
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default function CreatorOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const { data: orders, isLoading } = useServiceOrders(user?.id, "creator");
  const updateOrder = useUpdateServiceOrder();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeTab === "active") return orders.filter((o: any) => !["completed", "cancelled"].includes(o.status));
    if (activeTab === "completed") return orders.filter((o: any) => o.status === "completed");
    return orders;
  }, [orders, activeTab]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrder.mutate({ id: orderId, status: newStatus });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-2">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">Orders</Text>
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
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
              {/* Title & Status */}
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
                  {item.title}
                </Text>
                <View className={`px-2.5 py-1 rounded-full ${statusInfo.bg}`}>
                  <Text className={`text-[10px] font-sans-bold ${statusInfo.color}`}>{statusInfo.label}</Text>
                </View>
              </View>

              {/* Service info */}
              {item.service && (
                <Text className="text-xs font-sans text-gray-500 mb-2" numberOfLines={1}>
                  Service: {item.service.title}
                </Text>
              )}

              {/* Price & Time */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-sans-bold text-green-700 dark:text-green-400">
                  {formatCents(item.creator_payout_cents || item.amount_cents)}
                </Text>
                <Text className="text-[10px] font-sans text-gray-400">{timeAgo(item.created_at)}</Text>
              </View>

              {/* Action buttons based on status */}
              <View className="flex-row gap-2">
                {item.status === "pending" && (
                  <>
                    <Pressable
                      className="flex-1 bg-green-600 rounded-lg py-2.5 items-center"
                      onPress={() => handleStatusUpdate(item.id, "accepted")}
                    >
                      <Text className="text-xs font-sans-semibold text-white">Accept</Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 bg-red-100 rounded-lg py-2.5 items-center"
                      onPress={() => handleStatusUpdate(item.id, "cancelled")}
                    >
                      <Text className="text-xs font-sans-semibold text-red-700">Decline</Text>
                    </Pressable>
                  </>
                )}
                {item.status === "accepted" && (
                  <Pressable
                    className="flex-1 bg-brand-700 rounded-lg py-2.5 items-center"
                    onPress={() => handleStatusUpdate(item.id, "in_progress")}
                  >
                    <Text className="text-xs font-sans-semibold text-white">Start Working</Text>
                  </Pressable>
                )}
                {item.status === "in_progress" && (
                  <Pressable
                    className="flex-1 bg-green-600 rounded-lg py-2.5 items-center"
                    onPress={() => handleStatusUpdate(item.id, "delivered")}
                  >
                    <Text className="text-xs font-sans-semibold text-white">Mark Delivered</Text>
                  </Pressable>
                )}
                {item.status === "revision_requested" && (
                  <Pressable
                    className="flex-1 bg-brand-700 rounded-lg py-2.5 items-center"
                    onPress={() => handleStatusUpdate(item.id, "delivered")}
                  >
                    <Text className="text-xs font-sans-semibold text-white">Deliver Revision</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20"><ActivityIndicator size="large" color="#4A2D7A" /></View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No orders yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1">
                Orders will appear here when buyers hire you
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
