import { View, ScrollView, FlatList, Pressable, TextInput, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUpdateServiceOrder, TIER_INFO, supabase } from "@foreverr/core";
import { Text } from "@foreverr/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Pending Review", color: "#d97706", bg: "#fef3c7", icon: "hourglass-outline" },
  accepted: { label: "Accepted", color: "#2563eb", bg: "#dbeafe", icon: "checkmark-circle-outline" },
  in_progress: { label: "In Progress", color: "#7c3aed", bg: "#ede9fe", icon: "construct-outline" },
  delivered: { label: "Delivered", color: "#059669", bg: "#d1fae5", icon: "gift-outline" },
  revision_requested: { label: "Revision Requested", color: "#ea580c", bg: "#ffedd5", icon: "refresh-outline" },
  completed: { label: "Completed", color: "#059669", bg: "#d1fae5", icon: "checkmark-done-outline" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" },
  disputed: { label: "Disputed", color: "#dc2626", bg: "#fee2e2", icon: "warning-outline" },
};

// ── Inline hooks for order detail + messages ──
function useOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ["service-order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await (supabase as any)
        .from("service_orders")
        .select("*, service:service_id(title, category, cover_image_url), buyer:buyer_id(display_name, avatar_url, username), creator_profile:creator_id(display_name, user_id, tier)")
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!orderId,
  });
}

function useOrderMessages(orderId?: string) {
  return useQuery({
    queryKey: ["order-messages", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await (supabase as any)
        .from("service_order_messages")
        .select("*, sender:sender_id(display_name, avatar_url)")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!orderId,
    refetchInterval: 10000, // poll every 10s
  });
}

function useSendOrderMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { order_id: string; sender_id: string; content: string }) => {
      const { data: result, error } = await (supabase as any)
        .from("service_order_messages")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: ["order-messages", vars.order_id] });
    },
  });
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrderDetail(id);
  const { data: messages } = useOrderMessages(id);
  const sendMessage = useSendOrderMessage();
  const updateOrder = useUpdateServiceOrder();
  const [msgText, setMsgText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const isCreator = order?.creator_profile?.user_id === user?.id;
  const isBuyer = order?.buyer_id === user?.id;
  const statusInfo = STATUS_CONFIG[order?.status ?? "pending"] ?? STATUS_CONFIG.pending;

  const handleSendMessage = async () => {
    if (!msgText.trim() || !user?.id || !id) return;
    await sendMessage.mutateAsync({ order_id: id, sender_id: user.id, content: msgText.trim() });
    setMsgText("");
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!id) return;
    updateOrder.mutate({ id, status: newStatus });
  };

  const handleComplete = () => {
    if (!id) return;
    updateOrder.mutate({ id, status: "completed", buyer_rating: rating, buyer_review: reviewText.trim() || undefined });
    const msg = "Order completed! Thank you for your review.";
    Platform.OS === "web" ? window.alert(msg) : Alert.alert("Completed!", msg);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-lg font-sans-bold text-gray-400 mt-4">Order Not Found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50 dark:bg-gray-900" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Status Banner */}
        <View className="px-4 py-4 flex-row items-center gap-3" style={{ backgroundColor: statusInfo.bg }}>
          <Ionicons name={statusInfo.icon as any} size={22} color={statusInfo.color} />
          <View className="flex-1">
            <Text className="text-sm font-sans-bold" style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
            <Text className="text-[10px] font-sans" style={{ color: statusInfo.color + "99" }}>
              Order placed {formatDate(order.created_at)}
            </Text>
          </View>
          <Text className="text-lg font-sans-bold" style={{ color: statusInfo.color }}>
            {formatCents(order.amount_cents)}
          </Text>
        </View>

        {/* Order Info */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-1">{order.title}</Text>
          {order.service && (
            <Pressable
              className="flex-row items-center gap-2 mt-1"
              onPress={() => router.push(`/services/${order.service_id}` as any)}
            >
              <Ionicons name="briefcase-outline" size={12} color="#4A2D7A" />
              <Text className="text-xs font-sans text-brand-700">{order.service.title}</Text>
            </Pressable>
          )}
          {order.package_name && (
            <Text className="text-xs font-sans text-gray-500 mt-1">Package: {order.package_name}</Text>
          )}
          {order.description && (
            <Text className="text-xs font-sans text-gray-500 mt-2">{order.description}</Text>
          )}
        </View>

        {/* Parties */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-sans text-gray-400 mb-1">Buyer</Text>
              <Pressable className="flex-row items-center gap-2" onPress={() => router.push(`/user/${order.buyer_id}` as any)}>
                <View className="h-7 w-7 rounded-full bg-brand-100 items-center justify-center">
                  <Ionicons name="person" size={12} color="#4A2D7A" />
                </View>
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">{order.buyer?.display_name ?? "Buyer"}</Text>
              </Pressable>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#d1d5db" />
            <View className="items-end">
              <Text className="text-[10px] font-sans text-gray-400 mb-1">Creator</Text>
              <Pressable className="flex-row items-center gap-2" onPress={() => order.creator_profile?.user_id && router.push(`/user/${order.creator_profile.user_id}` as any)}>
                <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">{order.creator_profile?.display_name ?? "Creator"}</Text>
                <View className="h-7 w-7 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="person" size={12} color="#059669" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mb-2">Payment Breakdown</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-sans text-gray-500">Order Amount</Text>
            <Text className="text-xs font-sans text-gray-900 dark:text-white">{formatCents(order.amount_cents)}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-sans text-gray-500">Platform Fee</Text>
            <Text className="text-xs font-sans text-gray-400">-{formatCents(order.platform_fee_cents)}</Text>
          </View>
          <View className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
          <View className="flex-row justify-between">
            <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">Creator Payout</Text>
            <Text className="text-xs font-sans-bold text-green-700">{formatCents(order.creator_payout_cents)}</Text>
          </View>
        </View>

        {/* Deliverables Section */}
        {order.deliverables && (
          <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="folder-outline" size={18} color="#4A2D7A" />
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Deliverables</Text>
            </View>
            {(() => {
              const delivs = Array.isArray(order.deliverables) ? order.deliverables : [order.deliverables];
              return delivs.map((d: any, i: number) => (
                <View key={i} className="flex-row items-center py-2.5 border-b border-gray-50 dark:border-gray-700 gap-3">
                  <View className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                    <Ionicons
                      name={
                        d.type === "image" ? "image-outline" :
                        d.type === "document" ? "document-text-outline" :
                        d.type === "video" ? "videocam-outline" :
                        d.type === "audio" ? "musical-notes-outline" :
                        "attach-outline"
                      }
                      size={16}
                      color="#3b82f6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {d.name ?? d.title ?? d.filename ?? `File ${i + 1}`}
                    </Text>
                    {d.description && (
                      <Text className="text-[10px] font-sans text-gray-400" numberOfLines={1}>{d.description}</Text>
                    )}
                    {d.size && (
                      <Text className="text-[9px] font-sans text-gray-400">{d.size}</Text>
                    )}
                  </View>
                  {d.url && (
                    <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full px-2.5 py-1">
                      <Text className="text-[10px] font-sans-semibold text-blue-700">View</Text>
                    </View>
                  )}
                </View>
              ));
            })()}
          </View>
        )}

        {/* Deliverable Upload for Creator (when in_progress or revision_requested) */}
        {isCreator && (order.status === "in_progress" || order.status === "revision_requested") && (
          <View className="bg-blue-50 dark:bg-blue-900/10 mx-4 mt-3 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="cloud-upload-outline" size={18} color="#3b82f6" />
              <Text className="text-sm font-sans-semibold text-blue-800 dark:text-blue-300">Upload Deliverables</Text>
            </View>
            <Text className="text-[11px] font-sans text-blue-600 dark:text-blue-400 mb-3">
              Attach files or links for the buyer. Use the message thread to share deliverable URLs, then mark as delivered.
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
                onPress={() => {
                  const msg = "Share your deliverable URLs in the message thread below, then click 'Mark as Delivered'.";
                  Platform.OS === "web" ? window.alert(msg) : Alert.alert("Tip 💡", msg);
                }}
              >
                <Ionicons name="link-outline" size={14} color="#2563eb" />
                <Text className="text-xs font-sans-semibold text-blue-700">Share via Message</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Creator Actions */}
        {isCreator && (
          <View className="mx-4 mt-3 flex-row gap-2">
            {order.status === "pending" && (
              <>
                <Pressable className="flex-1 bg-green-600 rounded-xl py-3 items-center" onPress={() => handleStatusUpdate("accepted")}>
                  <Text className="text-sm font-sans-semibold text-white">Accept Order</Text>
                </Pressable>
                <Pressable className="flex-1 bg-red-100 rounded-xl py-3 items-center" onPress={() => handleStatusUpdate("cancelled")}>
                  <Text className="text-sm font-sans-semibold text-red-700">Decline</Text>
                </Pressable>
              </>
            )}
            {order.status === "accepted" && (
              <Pressable className="flex-1 bg-brand-700 rounded-xl py-3 items-center" onPress={() => handleStatusUpdate("in_progress")}>
                <Text className="text-sm font-sans-semibold text-white">Start Working</Text>
              </Pressable>
            )}
            {(order.status === "in_progress" || order.status === "revision_requested") && (
              <Pressable className="flex-1 bg-green-600 rounded-xl py-3 items-center" onPress={() => handleStatusUpdate("delivered")}>
                <Text className="text-sm font-sans-semibold text-white">Mark as Delivered</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Buyer Actions */}
        {isBuyer && order.status === "delivered" && (
          <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Review & Complete</Text>
            {/* Star rating */}
            <View className="flex-row items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setRating(s)}>
                  <Ionicons name={s <= rating ? "star" : "star-outline"} size={28} color="#fbbf24" />
                </Pressable>
              ))}
            </View>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-3"
              placeholder="Write a review (optional)..."
              placeholderTextColor="#9ca3af"
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              style={{ minHeight: 60, textAlignVertical: "top" }}
            />
            <View className="flex-row gap-2">
              <Pressable className="flex-1 bg-green-600 rounded-xl py-3 items-center" onPress={handleComplete}>
                <Text className="text-sm font-sans-semibold text-white">Accept & Complete</Text>
              </Pressable>
              <Pressable className="flex-1 bg-amber-100 rounded-xl py-3 items-center" onPress={() => handleStatusUpdate("revision_requested")}>
                <Text className="text-sm font-sans-semibold text-amber-700">Request Revision</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Messages */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Messages ({messages?.length ?? 0})
          </Text>
          {(!messages || messages.length === 0) ? (
            <View className="items-center py-6 bg-white dark:bg-gray-800 rounded-2xl">
              <Ionicons name="chatbubbles-outline" size={28} color="#d1d5db" />
              <Text className="text-xs font-sans text-gray-400 mt-2">No messages yet. Start the conversation!</Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
              {messages.map((msg: any) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <View key={msg.id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 ${isOwn ? "bg-brand-50/30 dark:bg-brand-900/10" : ""}`}>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-[10px] font-sans-semibold text-gray-600 dark:text-gray-300">
                        {msg.sender?.display_name ?? "User"}{isOwn ? " (You)" : ""}
                      </Text>
                      <Text className="text-[9px] font-sans text-gray-400">{timeAgo(msg.created_at)}</Text>
                    </View>
                    <Text className="text-xs font-sans text-gray-700 dark:text-gray-300 leading-5">{msg.content}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Message Input */}
      {!["completed", "cancelled"].includes(order.status) && (
        <View className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex-row items-center gap-2">
          <TextInput
            className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={msgText}
            onChangeText={setMsgText}
            multiline
            style={{ maxHeight: 80 }}
          />
          <Pressable
            className={`h-10 w-10 rounded-full items-center justify-center ${msgText.trim() ? "bg-brand-700" : "bg-gray-200"}`}
            onPress={handleSendMessage}
            disabled={!msgText.trim() || sendMessage.isPending}
          >
            <Ionicons name="send" size={16} color={msgText.trim() ? "#ffffff" : "#9ca3af"} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
