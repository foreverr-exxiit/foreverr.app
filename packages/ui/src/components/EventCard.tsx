import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface EventCardProps {
  title: string;
  type: string;
  location?: string | null;
  startDate: string;
  isVirtual?: boolean;
  rsvpCount: number;
  status: string;
  onPress: () => void;
}

const EVENT_ICONS: Record<string, string> = {
  ceremony: "flower",
  celebration: "sparkles",
  gathering: "people",
  vigil: "flame",
  anniversary: "heart",
  birthday: "gift",
  fundraiser: "cash",
  other: "calendar",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function EventCard({ title, type, location, startDate, isVirtual, rsvpCount, status, onPress }: EventCardProps) {
  const iconName = (EVENT_ICONS[type] ?? "calendar") as any;
  const isPast = status === "completed" || status === "cancelled";

  return (
    <Pressable
      className={`mx-4 mb-3 rounded-xl border border-gray-100 bg-white p-4 ${isPast ? "opacity-60" : ""}`}
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <View className="h-11 w-11 rounded-xl bg-brand-100 items-center justify-center mr-3">
          <Ionicons name={iconName} size={20} color="#4A2D7A" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{title}</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">{formatDate(startDate)}</Text>
          <View className="flex-row items-center gap-3 mt-1.5">
            {(location || isVirtual) && (
              <View className="flex-row items-center gap-1">
                <Ionicons name={isVirtual ? "videocam" : "location"} size={12} color="#9ca3af" />
                <Text className="text-[10px] font-sans text-gray-400">{isVirtual ? "Virtual" : location}</Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <Ionicons name="people" size={12} color="#9ca3af" />
              <Text className="text-[10px] font-sans text-gray-400">{rsvpCount} attending</Text>
            </View>
          </View>
        </View>
        {status === "cancelled" && (
          <View className="bg-red-100 rounded-full px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-red-600">Cancelled</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
