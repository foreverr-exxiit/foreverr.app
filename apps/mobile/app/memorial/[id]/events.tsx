import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

export default function EventsScreen() {
  return (
    <View className="flex-1">
      {/* Placeholder for future events */}
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
        <Text className="mt-3 text-lg font-sans-bold text-gray-900 dark:text-white text-center">Events</Text>
        <Text className="mt-1 text-sm font-sans text-center text-gray-500">
          No events scheduled. Memorial hosts can create{"\n"}services, celebrations, and remembrance gatherings.
        </Text>
        <Pressable className="mt-4 rounded-full bg-brand-700 px-6 py-2.5">
          <Text className="text-sm font-sans-semibold text-white">Create Event</Text>
        </Pressable>
      </View>
    </View>
  );
}
