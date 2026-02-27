import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useNotifications, useMarkRead, useMarkAllRead } from "@foreverr/core";
import { Text, Button, ForeverrLogo } from "@foreverr/ui";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ICON_MAP: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  new_tribute: { name: "chatbubble", color: "#4A2D7A" },
  new_follower: { name: "person-add", color: "#059669" },
  user_followed: { name: "person-add", color: "#059669" },
  reaction: { name: "heart", color: "#ef4444" },
  comment: { name: "chatbubble-ellipses", color: "#3b82f6" },
  memorial_update: { name: "flower", color: "#d97706" },
  mention: { name: "at", color: "#7C3AED" },
  badge_earned: { name: "ribbon", color: "#D97706" },
  candle_lit: { name: "flame", color: "#f59e0b" },
  streak_achieved: { name: "flame", color: "#ef4444" },
  event_reminder: { name: "calendar", color: "#2563EB" },
  // Phase 6 notification types
  gift_received: { name: "flower", color: "#ec4899" },
  gift_sent: { name: "gift", color: "#ec4899" },
  points_earned: { name: "star", color: "#059669" },
  level_up: { name: "trophy", color: "#D97706" },
  trust_updated: { name: "shield-checkmark", color: "#0284c7" },
  claim_approved: { name: "checkmark-circle", color: "#059669" },
  claim_rejected: { name: "close-circle", color: "#ef4444" },
  import_complete: { name: "cloud-done", color: "#64748b" },
  fundraiser_donation: { name: "heart", color: "#ec4899" },
  celebrity_request_approved: { name: "star", color: "#D97706" },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.id);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  // Guest view — sign-in prompt
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
          <Pressable onPress={() => router.push("/(tabs)")}>
            <ForeverrLogo width={550} variant="full" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand-100">
            <Ionicons name="notifications-outline" size={36} color="#4A2D7A" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
            Stay in the Loop
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6 px-4">
            Sign in to get notified when someone lights a candle, shares a tribute, or interacts with your memorials.
          </Text>
          <Button
            title="Sign In"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center mb-2">
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-sans-bold text-white">Notifications</Text>
        {(notifications ?? []).some((n: any) => !n.is_read) && (
          <Pressable onPress={() => user?.id && markAllRead.mutate(user.id)}>
            <Text className="text-sm font-sans-medium text-white/80">Mark all read</Text>
          </Pressable>
        )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => {
            const iconInfo = ICON_MAP[item.type] ?? { name: "notifications" as const, color: "#6b7280" };
            return (
              <Pressable
                className={`flex-row items-start px-4 py-3.5 border-b border-gray-50 ${!item.is_read ? "bg-brand-50" : ""}`}
                onPress={() => { if (!item.is_read) markRead.mutate(item.id); }}
              >
                <View className="h-10 w-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{item.title}</Text>
                  <Text className="text-xs font-sans text-gray-500 mt-0.5" numberOfLines={2}>{item.body}</Text>
                  <Text className="text-[10px] font-sans text-gray-500 mt-1">{timeAgo(item.created_at)}</Text>
                </View>
                {!item.is_read && (
                  <View className="h-2.5 w-2.5 rounded-full bg-brand-700 mt-1.5" />
                )}
              </Pressable>
            );
          }}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                No notifications yet. You'll be notified when{"\n"}someone interacts with your memorials.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
