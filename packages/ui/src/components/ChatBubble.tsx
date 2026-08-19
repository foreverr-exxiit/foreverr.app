import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ChatBubbleProps {
  content: string | null;
  senderName: string;
  senderAvatarUrl?: string | null;
  timestamp: string;
  isOwn: boolean;
  type?: string;
  mediaUrl?: string | null;
  replyPreview?: string | null;
  onLongPress?: () => void;
  onReplyPress?: () => void;
  onPressSender?: () => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatBubble({
  content,
  senderName,
  timestamp,
  isOwn,
  type = "text",
  mediaUrl,
  replyPreview,
  onLongPress,
  onPressSender,
}: ChatBubbleProps) {
  return (
    <View className={`px-3 py-1 ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <Pressable onPress={onPressSender} disabled={!onPressSender}>
          <Text className="text-[10px] font-sans-medium text-gray-400 ml-2 mb-0.5">{senderName}</Text>
        </Pressable>
      )}
      <Pressable
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
          isOwn ? "bg-brand-700 rounded-br-sm" : "bg-gray-100 dark:bg-gray-800 rounded-bl-sm"
        }`}
        onLongPress={onLongPress}
      >
        {replyPreview && (
          <View className={`border-l-2 pl-2 mb-1.5 ${isOwn ? "border-brand-300" : "border-gray-300"}`}>
            <Text className={`text-[10px] font-sans ${isOwn ? "text-brand-200" : "text-gray-400"}`} numberOfLines={1}>
              {replyPreview}
            </Text>
          </View>
        )}
        {type === "voice" ? (
          <View className="flex-row items-center gap-2">
            <Ionicons name="mic" size={16} color={isOwn ? "#ffffff" : "#4A2D7A"} />
            <Text className={`text-sm font-sans ${isOwn ? "text-white" : "text-gray-900 dark:text-white"}`}>
              Voice message
            </Text>
          </View>
        ) : type === "image" ? (
          mediaUrl ? (
            <View>
              <Image
                source={{ uri: mediaUrl }}
                style={{ width: 200, height: 200, borderRadius: 12 }}
                contentFit="cover"
                transition={150}
              />
              {!!content && (
                <Text className={`text-sm font-sans leading-5 mt-1.5 ${isOwn ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {content}
                </Text>
              )}
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="image" size={16} color={isOwn ? "#ffffff" : "#4A2D7A"} />
              <Text className={`text-sm font-sans ${isOwn ? "text-white" : "text-gray-900 dark:text-white"}`}>
                Photo
              </Text>
            </View>
          )
        ) : (
          <Text className={`text-sm font-sans leading-5 ${isOwn ? "text-white" : "text-gray-900 dark:text-white"}`}>
            {content}
          </Text>
        )}
        <Text className={`text-[9px] font-sans mt-1 ${isOwn ? "text-brand-200" : "text-gray-400"}`}>
          {formatTime(timestamp)}
        </Text>
      </Pressable>
    </View>
  );
}
