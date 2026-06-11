import React from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useLifeTimeline, useTimelineStats, useMemorial } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  milestone: { icon: "star", color: "#F59E0B" },
  tribute: { icon: "heart", color: "#EC4899" },
  photo: { icon: "camera", color: "#3B82F6" },
  memory: { icon: "book", color: "#8B5CF6" },
  achievement: { icon: "trophy", color: "#F97316" },
  life_event: { icon: "calendar", color: "#10B981" },
  medical: { icon: "medkit", color: "#EF4444" },
  travel: { icon: "airplane", color: "#06B6D4" },
  education: { icon: "school", color: "#6366F1" },
  career: { icon: "briefcase", color: "#84CC16" },
  relationship: { icon: "heart-circle", color: "#F43F5E" },
  spiritual: { icon: "sparkles", color: "#A855F7" },
  hobby: { icon: "color-palette", color: "#14B8A6" },
  community: { icon: "people", color: "#F59E0B" },
  custom: { icon: "ellipsis-horizontal-circle", color: "#6B7280" },
};

export default function TimelineScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(memorialId);
  const { data: events, isLoading } = useLifeTimeline(memorialId);
  const { data: stats } = useTimelineStats(memorialId);

  const name = memorial ? `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim() || "Their" : "Their";

  // Group events by year
  const eventsByYear = (events ?? []).reduce<Record<string, typeof events>>((acc, event) => {
    const year = event.sort_date
      ? new Date(event.sort_date).getFullYear().toString()
      : "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year]!.push(event);
    return acc;
  }, {});

  const sortedYears = Object.keys(eventsByYear).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return parseInt(a) - parseInt(b);
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Stack.Screen options={{ title: "The Arc" }} />
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <Stack.Screen options={{ title: `${name}'s Arc` }} />

      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              The Arc
            </Text>
            <Text className="text-sm font-sans text-gray-500 mt-1">
              {stats?.totalEvents ?? 0} moments captured
              {stats?.highlights ? ` · ${stats.highlights} highlights` : ""}
            </Text>
          </View>
          <Pressable
            className="bg-brand-700 rounded-full px-4 py-2 flex-row items-center"
            onPress={() => router.push(`/timeline/add?memorialId=${memorialId}`)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-xs font-sans-semibold text-white ml-1">Add Event</Text>
          </Pressable>
        </View>

        {/* Stats bar */}
        {stats && stats.totalEvents > 0 && (
          <View className="flex-row gap-2 mb-4">
            {Object.entries(stats.byType).slice(0, 4).map(([type, count]) => {
              const config = EVENT_TYPE_CONFIG[type] ?? EVENT_TYPE_CONFIG.custom;
              return (
                <View key={type} className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5">
                  <Ionicons name={config.icon as any} size={12} color={config.color} />
                  <Text className="text-[10px] font-sans-medium text-gray-600 dark:text-gray-400 ml-1">
                    {count} {type.replace("_", " ")}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Timeline */}
      {sortedYears.length === 0 ? (
        <View className="items-center py-16 px-8">
          <Ionicons name="time-outline" size={48} color="#d1d5db" />
          <Text className="text-base font-sans-semibold text-gray-400 text-center mt-4">
            No timeline events yet
          </Text>
          <Text className="text-sm font-sans text-gray-400 text-center mt-1">
            Start capturing {name}'s life story by adding milestones and events.
          </Text>
          <View className="flex-row gap-3 mt-6">
            <Pressable
              className="bg-brand-700 rounded-full px-5 py-2.5"
              onPress={() => router.push(`/milestones?memorialId=${memorialId}`)}
            >
              <Text className="text-sm font-sans-semibold text-white">Add Turning Points</Text>
            </Pressable>
            <Pressable
              className="bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-2.5"
              onPress={() => router.push(`/timeline/add?memorialId=${memorialId}`)}
            >
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">Add Event</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="px-4 pb-8">
          {sortedYears.map((year) => (
            <View key={year} className="mb-6">
              {/* Year header */}
              <View className="flex-row items-center mb-3">
                <View className="h-8 w-8 rounded-full bg-brand-700 items-center justify-center">
                  <Text className="text-[10px] font-sans-bold text-white">
                    {year === "Unknown" ? "?" : year.slice(-2)}
                  </Text>
                </View>
                <View className="ml-3 flex-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
                <Text className="ml-3 text-sm font-sans-bold text-gray-500">{year}</Text>
              </View>

              {/* Events in this year */}
              {eventsByYear[year]!.map((event, idx) => {
                const config = EVENT_TYPE_CONFIG[event.event_type] ?? EVENT_TYPE_CONFIG.custom;
                const isLast = idx === eventsByYear[year]!.length - 1;

                return (
                  <View key={event.id} className="flex-row ml-4">
                    {/* Timeline line + dot */}
                    <View className="items-center mr-3">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: event.color || config.color }}
                      />
                      {!isLast && (
                        <View className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[40px]" />
                      )}
                    </View>

                    {/* Event card */}
                    <View className="flex-1 mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <View className="flex-row items-center">
                        <View
                          className="h-7 w-7 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${event.color || config.color}20` }}
                        >
                          <Ionicons
                            name={(event.icon || config.icon) as any}
                            size={14}
                            color={event.color || config.color}
                          />
                        </View>
                        <View className="flex-1 ml-2">
                          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </Text>
                          {event.event_date && (
                            <Text className="text-[10px] font-sans text-gray-500">
                              {new Date(event.event_date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Text>
                          )}
                        </View>
                        {event.is_highlight && (
                          <Ionicons name="star" size={14} color="#F59E0B" />
                        )}
                      </View>

                      {event.description && (
                        <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-2" numberOfLines={3}>
                          {event.description}
                        </Text>
                      )}

                      {event.photo_url && (
                        <Image
                          source={{ uri: event.photo_url }}
                          className="w-full h-32 rounded-lg mt-2"
                          resizeMode="cover"
                        />
                      )}

                      {event.location && (
                        <View className="flex-row items-center mt-2">
                          <Ionicons name="location-outline" size={10} color="#9ca3af" />
                          <Text className="text-[10px] font-sans text-gray-400 ml-1">{event.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
