import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ChatListItemProps {
  roomName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount?: number;
  isMemorial?: boolean;
  onPress: () => void;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function ChatListItem({
  roomName,
  lastMessage,
  lastMessageAt,
  unreadCount = 0,
  isMemorial = false,
  onPress,
}: ChatListItemProps) {
  return (
    <Pressable
      className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
      onPress={onPress}
    >
      <View className="h-12 w-12 rounded-full bg-brand-100 items-center justify-center">
        <Ionicons
          name={isMemorial ? "people" : "person"}
          size={22}
          color="#4A2D7A"
        />
      </View>
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
            {roomName}
          </Text>
          <Text className="text-[10px] font-sans text-gray-400 ml-2">
            {timeAgo(lastMessageAt)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-xs font-sans text-gray-500 flex-1" numberOfLines={1}>
            {lastMessage ?? "No messages yet"}
          </Text>
          {unreadCount > 0 && (
            <View className="ml-2 bg-brand-700 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-[10px] font-sans-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
