import { View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyUpcomingEvents, useAuth } from "@foreverr/core";
import { Text, EventCard, ListSkeleton } from "@foreverr/ui";

export default function EventsListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: events, isLoading } = useMyUpcomingEvents(user?.id);

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-800">
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            type={item.type}
            location={item.location}
            startDate={item.start_date}
            isVirtual={item.is_virtual}
            rsvpCount={item.rsvp_count}
            status={item.status}
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 12 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="h-16 w-16 rounded-full bg-brand-100 items-center justify-center mb-4">
              <Ionicons name="calendar-outline" size={32} color="#4A2D7A" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">No upcoming events</Text>
            <Text className="text-sm font-sans text-center text-gray-500">
              Events you RSVP to will show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
