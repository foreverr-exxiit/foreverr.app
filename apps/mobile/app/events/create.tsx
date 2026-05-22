import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateEvent, useAuth } from "@foreverr/core";
import { Text, EternLogo, DatePickerField } from "@foreverr/ui";

const EVENT_TYPES = [
  { key: "ceremony", label: "Ceremony", icon: "flower" },
  { key: "celebration", label: "Celebration", icon: "sparkles" },
  { key: "gathering", label: "Gathering", icon: "people" },
  { key: "vigil", label: "Vigil", icon: "flame" },
  { key: "fundraiser", label: "Fundraiser", icon: "cash" },
  { key: "birthday", label: "Birthday", icon: "gift" },
  { key: "anniversary", label: "Anniversary", icon: "heart" },
  { key: "baby_shower", label: "Baby Shower", icon: "happy" },
  { key: "graduation", label: "Graduation", icon: "school" },
  { key: "retirement", label: "Retirement", icon: "trophy" },
  { key: "wedding", label: "Wedding", icon: "rose" },
  { key: "reunion", label: "Reunion", icon: "people-circle" },
  { key: "other", label: "Other", icon: "calendar" },
] as const;

const DURATION_OPTIONS = [
  { label: "1 hour", value: "1" },
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
  { label: "Half day", value: "4" },
  { label: "Full day", value: "8" },
];

const QUICK_TIMES = [
  { label: "10 AM", hour: 10 },
  { label: "12 PM", hour: 12 },
  { label: "2 PM", hour: 14 },
  { label: "4 PM", hour: 16 },
  { label: "6 PM", hour: 18 },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("celebration");
  const [location, setLocation] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState(12);
  const [duration, setDuration] = useState("2");
  const [isTicketed, setIsTicketed] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketLimit, setTicketLimit] = useState("");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultId, setResultId] = useState("");

  const isSignedIn = !!user?.id;

  // Quick date options
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const nextWeek = new Date(Date.now() + 7 * 86400000);
  const nextMonth = new Date(Date.now() + 30 * 86400000);
  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatDateValue = (d: Date) => d.toISOString().split("T")[0];

  const quickDates = [
    { label: `Today (${formatDateLabel(today)})`, value: formatDateValue(today) },
    { label: `Tomorrow (${formatDateLabel(tomorrow)})`, value: formatDateValue(tomorrow) },
    { label: `Next Week (${formatDateLabel(nextWeek)})`, value: formatDateValue(nextWeek) },
    { label: `Next Month (${formatDateLabel(nextMonth)})`, value: formatDateValue(nextMonth) },
  ];

  const handleCreate = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to create an event.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }
    if (!startDate) {
      setError("Please select a date for the event.");
      return;
    }

    try {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour, 0, 0, 0);

      const durationHours = parseInt(duration, 10) || 2;
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

      const result = await createEvent.mutateAsync({
        memorialId: memorialId || "",
        createdBy: user!.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        location: location.trim() || undefined,
        isVirtual,
        virtualLink: virtualLink.trim() || undefined,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        isTicketed,
        ticketPriceCents: isTicketed ? Math.round(parseFloat(ticketPrice || "0") * 100) : 0,
        ticketLimit: ticketLimit ? parseInt(ticketLimit) : undefined,
      });
      setResultId(result.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not create event. Please try again.");
    }
  };

  // ─── Success state ──────────────────────────────────────────────
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            Event Created!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your event "{title}" has been created. Share it with others so they can RSVP!
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={goBack}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Create Event
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Plan a gathering for any occasion
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign-in banner */}
        {!isSignedIn && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-4 mt-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to create an event
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        {/* Hero */}
        <View className="items-center py-6">
          <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
            <Ionicons name="calendar" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Plan Your Event
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Create celebrations, ceremonies, gatherings and more — invite people to join.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Event Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Event Title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Birthday Party for Mom"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Event Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Event Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    type === t.key
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setType(t.key)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={14}
                    color={type === t.key ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      type === t.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Date Picker */}
          <DatePickerField
            label="Date"
            value={startDate}
            onChange={(d) => { setStartDate(d); setError(""); }}
            placeholder="Select event date"
            quickOptions={quickDates}
          />

          {/* Time Picker — quick chips */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_TIMES.map((t) => (
                <Pressable
                  key={t.hour}
                  className={`rounded-full px-3.5 py-2.5 ${
                    startHour === t.hour
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setStartHour(t.hour)}
                >
                  <Text
                    className={`text-xs font-sans-medium ${
                      startHour === t.hour ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DURATION_OPTIONS.map((d) => (
                <Pressable
                  key={d.value}
                  className={`rounded-full px-3.5 py-2.5 ${
                    duration === d.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setDuration(d.value)}
                >
                  <Text
                    className={`text-xs font-sans-medium ${
                      duration === d.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Tell people what to expect..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          {/* Virtual toggle */}
          <Pressable
            className="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
            onPress={() => setIsVirtual(!isVirtual)}
          >
            <View className="flex-row items-center">
              <Ionicons name="videocam" size={20} color="#7C3AED" />
              <View className="ml-3">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Virtual Event
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Online via Zoom, Meet, etc.
                </Text>
              </View>
            </View>
            <View
              className={`h-6 w-10 rounded-full ${
                isVirtual ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
              } justify-center px-0.5`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  isVirtual ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>

          {/* Virtual Link or Location */}
          {isVirtual ? (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Meeting Link
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="https://zoom.us/j/..."
                placeholderTextColor="#9ca3af"
                value={virtualLink}
                onChangeText={setVirtualLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          ) : (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Location (optional)
              </Text>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="e.g. 123 Main St, City"
                placeholderTextColor="#9ca3af"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          )}

          {/* Ticketing */}
          <Pressable
            className="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
            onPress={() => setIsTicketed(!isTicketed)}
          >
            <View className="flex-row items-center">
              <Ionicons name="ticket" size={20} color="#7C3AED" />
              <View className="ml-3">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Paid Event
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Sell tickets and earn revenue
                </Text>
              </View>
            </View>
            <View
              className={`h-6 w-10 rounded-full ${
                isTicketed ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
              } justify-center px-0.5`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  isTicketed ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>

          {isTicketed && (
            <View className="gap-3">
              <View>
                <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Price
                </Text>
                <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700">
                  <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
                  <TextInput
                    className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    value={ticketPrice}
                    onChangeText={setTicketPrice}
                  />
                </View>
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Limit (optional)
                </Text>
                <TextInput
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  placeholder="Unlimited"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={ticketLimit}
                  onChangeText={setTicketLimit}
                />
              </View>
              <View className="flex-row items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3">
                <Ionicons name="information-circle-outline" size={16} color="#d97706" />
                <Text className="flex-1 text-xs font-sans text-amber-700 dark:text-amber-400">
                  ǝterrn takes a 10% platform fee on ticket sales. You earn 90% of each sale.
                </Text>
              </View>
            </View>
          )}

          {/* Error Message (inline) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Create button */}
          <Pressable
            onPress={handleCreate}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              createEvent.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createEvent.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Create Event
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              After creating your event, share it so people can RSVP and join.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
