import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface GiftTransactionCardProps {
  senderName: string;
  senderAvatar?: string | null;
  giftName: string;
  giftIcon: string;
  message?: string;
  isAnonymous: boolean;
  amountCents: number;
  timestamp: string;
  onReact?: () => void;
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function GiftTransactionCard({
  senderName,
  senderAvatar,
  giftName,
  giftIcon,
  message,
  isAnonymous,
  amountCents,
  timestamp,
  onReact,
}: GiftTransactionCardProps) {
  const displayName = isAnonymous ? "Anonymous" : senderName;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-3 mb-2 border border-gray-100 dark:border-gray-700">
      <View className="flex-row">
        {/* Avatar */}
        {isAnonymous ? (
          <View className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
            <Ionicons name="person" size={16} color="#9ca3af" />
          </View>
        ) : senderAvatar ? (
          <Image
            source={{ uri: senderAvatar }}
            className="w-9 h-9 rounded-full"
          />
        ) : (
          <View className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
            <Ionicons name="person" size={16} color="#7C3AED" />
          </View>
        )}

        {/* Gift Info */}
        <View className="flex-1 ml-2.5">
          <View className="flex-row items-center gap-1.5">
            <View className="h-6 w-6 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center">
              <Text style={{ fontSize: 14 }}>{giftIcon}</Text>
            </View>
            <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white flex-shrink">
              {displayName}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400 ml-auto">{formatRelativeTime(timestamp)}</Text>
          </View>
          <Text className="text-[11px] font-sans text-gray-400 mt-0.5">
            sent {giftName}
          </Text>
          {message ? (
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-2.5 py-1.5 mt-1.5">
              <Text className="text-xs font-sans text-gray-600 dark:text-gray-300">
                &ldquo;{message}&rdquo;
              </Text>
            </View>
          ) : null}
        </View>

        {/* Amount */}
        {amountCents > 0 && (
          <View className="ml-2 self-start">
            <View className="bg-green-50 dark:bg-green-900/20 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-sans-bold text-green-700 dark:text-green-400">
                ${(amountCents / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* React Button */}
      {onReact && (
        <Pressable
          className="flex-row items-center gap-1 mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50 self-start py-1 px-2 rounded-full"
          onPress={onReact}
        >
          <Ionicons name="heart-outline" size={14} color="#9ca3af" />
          <Text className="text-[11px] font-sans-medium text-gray-400">
            React
          </Text>
        </Pressable>
      )}
    </View>
  );
}
