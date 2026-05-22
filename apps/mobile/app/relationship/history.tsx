import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { useAuth } from "@foreverr/core";
import {
  useRelationshipTimeline,
  useWeddingPageChapters,
  EMOTIONAL_TAGS,
} from "@foreverr/core/src/hooks/useRelationshipLifecycle";

export default function RelationshipHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const timeline = useRelationshipTimeline(user?.id);
  const { data: chapters } = useWeddingPageChapters(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Relationship Journey
        </Text>
        <Pressable onPress={() => router.push("/relationship/status")} hitSlop={8}>
          <Ionicons name="add-circle" size={28} color="#7C3AED" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Chapters summary */}
        {chapters && chapters.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-2">
              Chapters
            </Text>
            {chapters.map((chapter) => (
              <View
                key={chapter.id}
                className="flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-2"
              >
                <View className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mr-3">
                  <Text className="text-xs font-sans-bold text-brand-700">{chapter.chapter}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    {chapter.partner1_name} & {chapter.partner2_name}
                  </Text>
                  <Text className="text-xs font-sans text-gray-500">
                    {chapter.relationship_status === "married" ? "Current" : chapter.relationship_status}
                    {chapter.wedding_date ? ` · ${new Date(chapter.wedding_date).getFullYear()}` : ""}
                  </Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${
                  chapter.relationship_status === "married"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  <Text className={`text-[10px] font-sans-medium ${
                    chapter.relationship_status === "married"
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}>
                    {chapter.relationship_status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        <Text className="text-xs font-sans-bold text-gray-500 uppercase tracking-wider mb-3">
          Timeline
        </Text>

        {timeline.length > 0 ? (
          timeline.map((event, index) => {
            const tagInfo = EMOTIONAL_TAGS.find((t) => t.key === event.emotional_tag);
            return (
              <View key={event.id} className="flex-row mb-4">
                {/* Timeline line */}
                <View className="items-center mr-3">
                  <View
                    className="h-10 w-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${event.color}20` }}
                  >
                    <Text className="text-lg">{event.emoji}</Text>
                  </View>
                  {index < timeline.length - 1 && (
                    <View className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                  )}
                </View>

                {/* Event content */}
                <View className="flex-1 pb-4">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    {event.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text className="text-xs font-sans text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()}
                    </Text>
                    {event.chapter && (
                      <Text className="text-xs font-sans text-brand-600">
                        Chapter {event.chapter}
                      </Text>
                    )}
                    {event.is_private && (
                      <Ionicons name="lock-closed" size={10} color="#9CA3AF" />
                    )}
                  </View>
                  {event.partnerNames && (
                    <Text className="text-xs font-sans text-gray-400 mt-0.5">
                      {event.partnerNames}
                    </Text>
                  )}
                  {event.description && (
                    <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </Text>
                  )}
                  {tagInfo && (
                    <View className="flex-row items-center mt-1.5">
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${tagInfo.color}15` }}
                      >
                        <Text className="text-[10px] font-sans-medium" style={{ color: tagInfo.color }}>
                          {tagInfo.emoji} {tagInfo.label}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">💕</Text>
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-1">
              No Events Yet
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mb-4">
              Your relationship journey timeline will appear here as you add events.
            </Text>
            <Pressable
              className="bg-brand-700 px-6 py-3 rounded-xl"
              onPress={() => router.push("/relationship/status")}
            >
              <Text className="text-white font-sans-bold">Add Event</Text>
            </Pressable>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
