import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface NewsCardProps {
  item: {
    id: string;
    title: string;
    summary?: string | null;
    source_name?: string | null;
    category: string;
    published_at: string;
    image_url?: string | null;
    is_featured?: boolean;
  };
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  obituary: { name: "flower", color: "#7C3AED" },
  anniversary: { name: "calendar", color: "#d97706" },
  memorial_news: { name: "newspaper", color: "#3b82f6" },
  platform_update: { name: "megaphone", color: "#059669" },
  celebration: { name: "heart", color: "#EC4899" },
  wedding: { name: "heart", color: "#EC4899" },
  birth: { name: "happy", color: "#EC4899" },
  birthday: { name: "gift", color: "#7C3AED" },
  retirement: { name: "sunny", color: "#059669" },
  graduation: { name: "school", color: "#2563EB" },
  general: { name: "information-circle", color: "#6b7280" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function NewsCard({ item, onPress }: NewsCardProps) {
  const iconInfo = CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.general;

  return (
    <Pressable
      className="flex-row items-start p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2"
      onPress={onPress}
    >
      <View className="h-10 w-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${iconInfo.color}15` }}>
        <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
          {item.title}
        </Text>
        {item.summary && (
          <Text className="text-xs font-sans text-gray-500 mt-1" numberOfLines={2}>
            {item.summary}
          </Text>
        )}
        <View className="flex-row items-center mt-1.5">
          {item.source_name && (
            <Text className="text-[10px] font-sans-medium text-brand-700 dark:text-brand-300 mr-2">
              {item.source_name}
            </Text>
          )}
          <Text className="text-[10px] font-sans text-gray-400">
            {timeAgo(item.published_at)}
          </Text>
          {item.is_featured && (
            <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: "#4A2D7A" }}>
              <Text className="text-[10px] font-sans-bold" style={{ color: "#FFFFFF" }}>FEATURED</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
