import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
  tribute_posted: { icon: "heart", color: "#DC2626" },
  memorial_followed: { icon: "bookmark", color: "#7C3AED" },
  candle_lit: { icon: "flame", color: "#D97706" },
  comment_posted: { icon: "chatbubble", color: "#2563EB" },
  reaction_given: { icon: "happy", color: "#EC4899" },
  streak_achieved: { icon: "trophy", color: "#059669" },
  badge_earned: { icon: "ribbon", color: "#8B5CF6" },
  vault_item_added: { icon: "archive", color: "#0891B2" },
  capsule_created: { icon: "time", color: "#D97706" },
  event_created: { icon: "calendar", color: "#2563EB" },
  donation_made: { icon: "gift", color: "#DC2626" },
  user_followed: { icon: "person-add", color: "#7C3AED" },
};

interface TimelineActivity {
  id: string;
  activityType: string;
  description: string;
  createdAt: string;
}

interface ProfileActivityTimelineProps {
  activities: TimelineActivity[];
}

export function ProfileActivityTimeline({ activities }: ProfileActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="time-outline" size={32} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-2">No recent activity</Text>
      </View>
    );
  }

  // Group by date
  const grouped: Record<string, TimelineActivity[]> = {};
  activities.forEach((a) => {
    const date = new Date(a.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <View>
      {Object.entries(grouped).map(([date, items]) => (
        <View key={date} className="mb-4">
          {/* Date Separator */}
          <View className="flex-row items-center mb-2">
            <View className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
            <Text className="text-[10px] font-sans-medium text-gray-400 px-3">{date}</Text>
            <View className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
          </View>

          {/* Activities */}
          {items.map((item, idx) => {
            const config = ACTIVITY_ICONS[item.activityType] ?? { icon: "ellipse", color: "#6B7280" };
            const isLast = idx === items.length - 1;
            return (
              <View key={item.id} className="flex-row ml-2">
                {/* Timeline line + dot */}
                <View className="items-center mr-3" style={{ width: 24 }}>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Ionicons name={config.icon as any} size={12} color={config.color} />
                  </View>
                  {!isLast && (
                    <View className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-0.5" />
                  )}
                </View>

                {/* Content */}
                <View className={`flex-1 ${!isLast ? "pb-3" : ""}`}>
                  <Text className="text-xs font-sans text-gray-700 dark:text-gray-300" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
