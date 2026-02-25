import { View, ScrollView, ActivityIndicator, Pressable, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventRsvps, useMyRsvp, useRsvp, useAuth } from "@foreverr/core";
import { Text, RsvpButton } from "@foreverr/ui";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(id);
  const { data: rsvps } = useEventRsvps(id);
  const { data: myRsvp } = useMyRsvp(id, user?.id);
  const rsvpMutation = useRsvp();

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  const goingCount = rsvps?.filter((r: any) => r.status === "going").length ?? 0;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-2xl font-sans-bold text-gray-900 dark:text-white">{event.title}</Text>
        <View className="flex-row items-center gap-2 mt-2">
          <View className="bg-brand-100 rounded-full px-3 py-1">
            <Text className="text-xs font-sans-semibold text-brand-700 capitalize">{event.type}</Text>
          </View>
          {event.status === "cancelled" && (
            <View className="bg-red-100 rounded-full px-3 py-1">
              <Text className="text-xs font-sans-semibold text-red-600">Cancelled</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details */}
      <View className="px-4 gap-4">
        <View className="flex-row items-start gap-3">
          <Ionicons name="calendar" size={20} color="#4A2D7A" />
          <View>
            <Text className="text-sm font-sans-semibold text-gray-900">{formatDate(event.start_date)}</Text>
            {event.end_date && (
              <Text className="text-xs font-sans text-gray-500 mt-0.5">until {formatDate(event.end_date)}</Text>
            )}
          </View>
        </View>

        {(event.location || event.is_virtual) && (
          <Pressable
            className="flex-row items-start gap-3"
            onPress={() => {
              if (event.virtual_link) Linking.openURL(event.virtual_link);
              else if (event.location_url) Linking.openURL(event.location_url);
            }}
          >
            <Ionicons name={event.is_virtual ? "videocam" : "location"} size={20} color="#4A2D7A" />
            <View>
              <Text className="text-sm font-sans-semibold text-gray-900">
                {event.is_virtual ? "Virtual Event" : event.location}
              </Text>
              {event.is_virtual && event.virtual_link && (
                <Text className="text-xs font-sans text-brand-700 mt-0.5">Join link →</Text>
              )}
            </View>
          </Pressable>
        )}

        <View className="flex-row items-center gap-3">
          <Ionicons name="people" size={20} color="#4A2D7A" />
          <Text className="text-sm font-sans text-gray-700">
            {goingCount} going{event.max_attendees ? ` · ${event.max_attendees} max` : ""}
          </Text>
        </View>
      </View>

      {/* Description */}
      {event.description && (
        <View className="px-4 mt-6">
          <Text className="text-sm font-sans-semibold text-gray-900 mb-2">About</Text>
          <Text className="text-sm font-sans text-gray-600 leading-5">{event.description}</Text>
        </View>
      )}

      {/* RSVP */}
      {user && event.status !== "cancelled" && event.status !== "completed" && (
        <View className="px-4 mt-6">
          <Text className="text-sm font-sans-semibold text-gray-900 mb-3">Your RSVP</Text>
          <RsvpButton
            currentStatus={myRsvp?.status ?? null}
            onRsvp={(status) => rsvpMutation.mutate({ eventId: event.id, userId: user.id, status })}
            disabled={rsvpMutation.isPending}
          />
        </View>
      )}
    </ScrollView>
  );
}
