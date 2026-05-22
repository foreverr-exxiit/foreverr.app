import { View, ScrollView, Pressable, Linking, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventRsvps, useMyRsvp, useRsvp, useAuth, usePurchaseEventTicket, useEventTickets } from "@foreverr/core";
import { Text, RsvpButton, DetailScreenSkeleton } from "@foreverr/ui";

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
  const purchaseTicket = usePurchaseEventTicket();
  const { data: tickets } = useEventTickets(id);

  if (isLoading || !event) {
    return <DetailScreenSkeleton />;
  }

  const goingCount = rsvps?.filter((r: any) => r.status === "going").length ?? 0;
  const isTicketed = !!(event as any).is_ticketed;
  const ticketPriceCents = (event as any).ticket_price_cents ?? 0;
  const ticketLimit = (event as any).ticket_limit;
  const ticketsSold = (event as any).tickets_sold ?? 0;
  const userHasTicket = tickets?.some((t: any) => t.buyer_id === user?.id);
  const ticketsSoldOut = ticketLimit && ticketsSold >= ticketLimit;

  const handlePurchaseTicket = async () => {
    if (!user?.id) {
      const msg = "Please sign in to purchase tickets.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Sign In Required", msg);
      return;
    }
    try {
      await purchaseTicket.mutateAsync({
        event_id: event.id,
        buyer_id: user.id,
        amount_paid_cents: ticketPriceCents,
        quantity: 1,
      });
      const msg = ticketPriceCents === 0
        ? "You've reserved your free ticket!"
        : `Ticket purchased for $${(ticketPriceCents / 100).toFixed(2)}!`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Ticket Confirmed! 🎟️", msg);
    } catch {
      const msg = "Could not purchase ticket. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-800" contentContainerStyle={{ paddingBottom: 40 }}>
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
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{formatDate(event.start_date)}</Text>
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
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
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
          <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">
            {goingCount} going{event.max_attendees ? ` · ${event.max_attendees} max` : ""}
          </Text>
        </View>
      </View>

      {/* Description */}
      {event.description && (
        <View className="px-4 mt-6">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5">{event.description}</Text>
        </View>
      )}

      {/* Ticket Purchase Section */}
      {isTicketed && user && event.status !== "cancelled" && event.status !== "completed" && (
        <View className="px-4 mt-6">
          <View className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="ticket-outline" size={20} color="#4A2D7A" />
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                Ticketed Event
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-2xl font-sans-bold text-brand-700">
                {ticketPriceCents === 0 ? "Free" : `$${(ticketPriceCents / 100).toFixed(2)}`}
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                {ticketsSold}{ticketLimit ? ` / ${ticketLimit}` : ""} tickets sold
              </Text>
            </View>

            {/* Progress bar for ticket availability */}
            {ticketLimit && ticketLimit > 0 && (
              <View className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mb-3">
                <View
                  className="h-1.5 bg-brand-700 rounded-full"
                  style={{ width: `${Math.min((ticketsSold / ticketLimit) * 100, 100)}%` }}
                />
              </View>
            )}

            {userHasTicket ? (
              <View className="bg-green-100 dark:bg-green-900/30 rounded-xl py-3 items-center flex-row justify-center gap-2">
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text className="text-sm font-sans-semibold text-green-700">You have a ticket!</Text>
              </View>
            ) : ticketsSoldOut ? (
              <View className="bg-red-100 dark:bg-red-900/30 rounded-xl py-3 items-center flex-row justify-center gap-2">
                <Ionicons name="close-circle" size={18} color="#dc2626" />
                <Text className="text-sm font-sans-semibold text-red-700">Sold Out</Text>
              </View>
            ) : (
              <Pressable
                className={`rounded-xl py-3.5 items-center ${purchaseTicket.isPending ? "bg-brand-400" : "bg-brand-700"}`}
                onPress={handlePurchaseTicket}
                disabled={purchaseTicket.isPending}
              >
                {purchaseTicket.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="ticket" size={18} color="#fff" />
                    <Text className="text-sm font-sans-bold text-white">
                      {ticketPriceCents === 0 ? "Reserve Free Ticket" : `Purchase Ticket — $${(ticketPriceCents / 100).toFixed(2)}`}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}

            {/* 10% platform fee note */}
            {ticketPriceCents > 0 && (
              <Text className="text-[10px] font-sans text-gray-400 text-center mt-2">
                10% platform fee supports memorial preservation
              </Text>
            )}
          </View>
        </View>
      )}

      {/* RSVP */}
      {user && event.status !== "cancelled" && event.status !== "completed" && (
        <View className="px-4 mt-6">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Your RSVP</Text>
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
