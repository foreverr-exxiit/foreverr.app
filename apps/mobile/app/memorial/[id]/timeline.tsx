import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorial } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: memorial } = useMemorial(id);

  const timelineItems = [];

  if (memorial?.date_of_birth) {
    timelineItems.push({
      date: memorial.date_of_birth,
      label: "Born",
      icon: "star" as const,
      color: "#4A2D7A",
      detail: memorial.place_of_birth || undefined,
    });
  }

  if (memorial?.date_of_death) {
    timelineItems.push({
      date: memorial.date_of_death,
      label: "Passed Away",
      icon: "flower" as const,
      color: "#ef4444",
      detail: memorial.place_of_death || undefined,
    });
  }

  if (memorial?.created_at) {
    timelineItems.push({
      date: memorial.created_at.split("T")[0],
      label: "Memorial Created",
      icon: "ribbon" as const,
      color: "#059669",
    });
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
      {timelineItems.length > 0 ? (
        <View className="px-6 pt-6">
          {timelineItems.map((item, index) => (
            <View key={index} className="flex-row mb-6">
              {/* Timeline line + dot */}
              <View className="items-center mr-4">
                <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                {index < timelineItems.length - 1 && (
                  <View className="w-0.5 flex-1 bg-gray-200 mt-1" style={{ minHeight: 24 }} />
                )}
              </View>
              {/* Content */}
              <View className="flex-1 pt-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{item.label}</Text>
                <Text className="text-xs font-sans text-gray-500">{item.date}</Text>
                {item.detail && (
                  <Text className="text-xs font-sans text-gray-400 mt-0.5">{item.detail}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="time-outline" size={48} color="#d1d5db" />
          <Text className="mt-3 text-lg font-sans-bold text-gray-900 dark:text-white text-center">Timeline</Text>
          <Text className="mt-1 text-sm font-sans text-center text-gray-500">
            Add birth and death dates to see the timeline.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
