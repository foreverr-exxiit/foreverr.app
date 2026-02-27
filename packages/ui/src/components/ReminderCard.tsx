import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ReminderCardProps {
  title: string;
  reminderDate: string;
  reminderType: string;
  isEnabled: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  birthday: { icon: "gift", color: "#EC4899" },
  anniversary: { icon: "heart", color: "#8B5CF6" },
  death_anniversary: { icon: "flower", color: "#4A2D7A" },
  holiday: { icon: "calendar", color: "#059669" },
  custom: { icon: "alarm", color: "#2563EB" },
  auto_generated: { icon: "sparkles", color: "#F59E0B" },
};

export function ReminderCard({
  title,
  reminderDate,
  reminderType,
  isEnabled,
  onToggle,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const config = TYPE_CONFIG[reminderType] ?? TYPE_CONFIG.custom;
  const date = new Date(reminderDate + "T00:00:00");
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Days until reminder
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const urgency = diffDays <= 0 ? "Today!" : diffDays <= 7 ? `${diffDays}d` : diffDays <= 30 ? `${diffDays}d` : "";

  return (
    <View className={`mx-4 mb-2 rounded-xl p-3 flex-row items-center ${isEnabled ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"} border border-gray-100 dark:border-gray-700`}>
      <View
        className="h-10 w-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${config.color}15`, opacity: isEnabled ? 1 : 0.5 }}
      >
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-sans-semibold ${isEnabled ? "text-gray-900 dark:text-white" : "text-gray-400"}`} numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-[10px] font-sans text-gray-500">{dateLabel}</Text>
          {urgency ? (
            <View className="ml-2 rounded-full bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5">
              <Text className="text-[10px] font-sans-semibold text-red-600">{urgency}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable onPress={onToggle} className="p-2">
        <View className={`h-6 w-10 rounded-full ${isEnabled ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"} justify-center px-0.5`}>
          <View className={`h-5 w-5 rounded-full bg-white ${isEnabled ? "self-end" : "self-start"}`} />
        </View>
      </Pressable>
    </View>
  );
}
