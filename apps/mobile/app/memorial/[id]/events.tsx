import {
  View,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorialEvents, useCreateEvent, useAuth } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const EVENT_TYPES = [
  "ceremony",
  "celebration",
  "remembrance",
  "birthday",
  "anniversary",
  "other",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

/** Map event type to an Ionicons icon name */
function eventTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "ceremony":
      return "calendar";
    case "celebration":
      return "star";
    case "remembrance":
      return "flame";
    case "birthday":
      return "gift";
    case "anniversary":
      return "heart";
    default:
      return "ellipse";
  }
}

/** Map event type to an accent color */
function eventTypeColor(type: string): string {
  switch (type) {
    case "ceremony":
      return "#4A2D7A";
    case "celebration":
      return "#F59E0B";
    case "remembrance":
      return "#EF4444";
    case "birthday":
      return "#EC4899";
    case "anniversary":
      return "#E11D48";
    default:
      return "#6B7280";
  }
}

/** Format an ISO date string into a human-readable form */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function EventsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { data: events, isLoading } = useMemorialEvents(id);
  const createEvent = useCreateEvent();

  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>("ceremony");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setSelectedType("ceremony");
    setStartDate("");
    setLocation("");
  }, []);

  const handleToggleForm = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign in required",
        "You need to sign in to create an event."
      );
      return;
    }
    setShowForm((prev) => !prev);
  }, [isAuthenticated]);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }
    if (!startDate.trim()) {
      Alert.alert("Missing date", "Please enter a start date.");
      return;
    }
    if (!user?.id || !id) return;

    try {
      await createEvent.mutateAsync({
        memorialId: id,
        createdBy: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type: selectedType,
        location: location.trim() || undefined,
        startDate: new Date(startDate.trim()).toISOString(),
      });
      resetForm();
      setShowForm(false);
    } catch {
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  }, [
    title,
    description,
    selectedType,
    startDate,
    location,
    user?.id,
    id,
    createEvent,
    resetForm,
  ]);

  // ----- Render helpers -----

  const renderEventCard = useCallback(
    ({ item }: { item: any }) => {
      const iconName = eventTypeIcon(item.type);
      const accentColor = eventTypeColor(item.type);
      const isVirtual = item.is_virtual;

      return (
        <View className="mx-4 mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Top accent strip */}
          <View style={{ height: 4, backgroundColor: accentColor }} />

          <View className="p-4">
            {/* Header row: icon + title + type badge */}
            <View className="flex-row items-start">
              <View
                className="h-10 w-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${accentColor}18` }}
              >
                <Ionicons name={iconName} size={20} color={accentColor} />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                  {item.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: `${accentColor}18` }}
                  >
                    <Text
                      className="text-[11px] font-sans-semibold capitalize"
                      style={{ color: accentColor }}
                    >
                      {item.type}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            {item.description ? (
              <Text
                className="mt-3 text-sm font-sans text-gray-600 dark:text-gray-400 leading-5"
                numberOfLines={3}
              >
                {item.description}
              </Text>
            ) : null}

            {/* Metadata row */}
            <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-2">
              {/* Date */}
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="ml-1.5 text-xs font-sans-medium text-gray-500 dark:text-gray-400">
                  {formatDate(item.start_date)}
                  {item.start_date ? ` at ${formatTime(item.start_date)}` : ""}
                </Text>
              </View>

              {/* Location or Virtual badge */}
              {isVirtual ? (
                <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-2.5 py-0.5">
                  <Ionicons name="videocam" size={12} color="#3B82F6" />
                  <Text className="ml-1 text-[11px] font-sans-semibold text-blue-600 dark:text-blue-400">
                    Virtual
                  </Text>
                </View>
              ) : item.location ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#6B7280"
                  />
                  <Text
                    className="ml-1 text-xs font-sans-medium text-gray-500 dark:text-gray-400"
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              ) : null}

              {/* Attendees */}
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-xs font-sans-medium text-gray-500 dark:text-gray-400">
                  {item.rsvp_count ?? 0}
                  {item.max_attendees ? ` / ${item.max_attendees}` : ""}{" "}
                  attending
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    },
    []
  );

  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center px-8 py-20">
        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
        <Text className="mt-3 text-lg font-sans-bold text-gray-900 dark:text-white text-center">
          No events scheduled
        </Text>
        <Text className="mt-1 text-sm font-sans text-center text-gray-500">
          Memorial hosts can create services, celebrations,{"\n"}and remembrance
          gatherings.
        </Text>
        {isAuthenticated && (
          <Pressable
            className="mt-4 rounded-full bg-brand-700 px-6 py-2.5"
            onPress={handleToggleForm}
          >
            <Text className="text-sm font-sans-semibold text-white">
              Create Event
            </Text>
          </Pressable>
        )}
      </View>
    ),
    [isAuthenticated, handleToggleForm]
  );

  // ----- Create event form -----

  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={140}
    >
      <ScrollView
        className="mx-4 mb-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4">
          {/* Form header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
              Create Event
            </Text>
            <Pressable onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          {/* Title */}
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Title
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="Event title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Description
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="Add details about the event..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 72 }}
          />

          {/* Type selector */}
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {EVENT_TYPES.map((type) => {
              const isActive = selectedType === type;
              return (
                <Pressable
                  key={type}
                  className={`rounded-full px-3.5 py-2 border ${
                    isActive
                      ? "bg-brand-700 border-brand-700"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  }`}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    className={`text-xs font-sans-semibold capitalize ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Start date */}
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Date
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={startDate}
            onChangeText={setStartDate}
          />

          {/* Location */}
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Location
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="Address or venue name"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />

          {/* Create button */}
          <Pressable
            className={`rounded-full py-3.5 items-center ${
              createEvent.isPending ? "bg-brand-700/60" : "bg-brand-700"
            }`}
            onPress={handleCreate}
            disabled={createEvent.isPending}
          >
            {createEvent.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-sm font-sans-bold text-white">
                Create Event
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ----- Main render -----

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center dark:bg-gray-900">
        <ActivityIndicator size="small" color="#4A2D7A" />
        <Text className="mt-3 text-sm font-sans text-gray-500">
          Loading events...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 dark:bg-gray-900">
      {/* Create event form (toggled) */}
      {showForm && <View className="mt-3">{renderForm()}</View>}

      {/* Event list */}
      <FlatList
        data={events ?? []}
        keyExtractor={(item: any) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 80 }}
        ListEmptyComponent={renderEmptyState}
      />

      {/* FAB — show when there are events (or form is closed and list is not empty) */}
      {!showForm && (events ?? []).length > 0 && (
        <Pressable
          className="absolute bottom-4 right-4 h-14 w-14 rounded-full bg-brand-700 items-center justify-center shadow-lg"
          onPress={handleToggleForm}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}
    </View>
  );
}
