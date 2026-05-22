import { View, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyEventTickets } from "@foreverr/core";
import { Text, ListSkeleton } from "@foreverr/ui";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function MyTicketsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: tickets, isLoading } = useMyEventTickets(user?.id);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-5">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          My Tickets
        </Text>
        <Text className="text-xs font-sans text-gray-500 mt-1">
          Events you've purchased tickets for
        </Text>
      </View>

      {isLoading ? (
        <View className="p-4">
          <ListSkeleton rows={4} />
        </View>
      ) : (
        <FlatList
          data={tickets ?? []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          renderItem={({ item }: { item: any }) => {
            const event = item.event;
            const isPast = event?.start_date && new Date(event.start_date) < new Date();
            return (
              <Pressable
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
                onPress={() => event?.id && router.push(`/events/${event.id}` as any)}
              >
                <View className="flex-row items-start gap-3">
                  {/* Ticket Icon */}
                  <View className={`w-12 h-12 rounded-xl items-center justify-center ${isPast ? "bg-gray-100 dark:bg-gray-700" : "bg-brand-50 dark:bg-brand-900/20"}`}>
                    <Ionicons name="ticket" size={24} color={isPast ? "#9ca3af" : "#4A2D7A"} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
                      {event?.title ?? "Event"}
                    </Text>

                    {event?.start_date && (
                      <View className="flex-row items-center gap-1 mt-1">
                        <Ionicons name="time-outline" size={12} color="#9ca3af" />
                        <Text className="text-[11px] font-sans text-gray-500">
                          {formatDate(event.start_date)}
                        </Text>
                      </View>
                    )}

                    {(event?.location || event?.is_virtual) && (
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name={event.is_virtual ? "videocam-outline" : "location-outline"} size={12} color="#9ca3af" />
                        <Text className="text-[11px] font-sans text-gray-500">
                          {event.is_virtual ? "Virtual Event" : event.location}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row items-center gap-2 mt-2">
                      <View className={`rounded-full px-2 py-0.5 ${isPast ? "bg-gray-100 dark:bg-gray-700" : "bg-green-100 dark:bg-green-900/30"}`}>
                        <Text className={`text-[10px] font-sans-semibold ${isPast ? "text-gray-500" : "text-green-700"}`}>
                          {isPast ? "Past Event" : "Upcoming"}
                        </Text>
                      </View>
                      <Text className="text-[10px] font-sans text-gray-400">
                        {item.quantity ?? 1} ticket{(item.quantity ?? 1) > 1 ? "s" : ""}
                      </Text>
                      {item.amount_paid_cents > 0 && (
                        <Text className="text-[10px] font-sans-semibold text-brand-700">
                          ${(item.amount_paid_cents / 100).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="ticket-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 mt-3">No tickets yet</Text>
              <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-8">
                Browse events and purchase tickets to see them here
              </Text>
              <Pressable
                className="mt-4 bg-brand-700 rounded-xl px-4 py-2"
                onPress={() => router.push("/(tabs)/explore" as any)}
              >
                <Text className="text-xs font-sans-bold text-white">Browse Events</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
