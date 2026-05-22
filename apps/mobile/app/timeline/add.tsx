import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateTimelineEvent } from "@foreverr/core";
import type { TimelineEventType } from "@foreverr/core";
import { Text, EternLogo, DatePickerField } from "@foreverr/ui";

const EVENT_TYPE_OPTIONS = [
  { value: "life_event", label: "Life Event", emoji: "🎉" },
  { value: "achievement", label: "Achievement", emoji: "🏆" },
  { value: "education", label: "Education", emoji: "🎓" },
  { value: "career", label: "Career", emoji: "💼" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "relationship", label: "Relationship", emoji: "❤️" },
  { value: "spiritual", label: "Spiritual", emoji: "✨" },
  { value: "medical", label: "Medical", emoji: "🏥" },
  { value: "hobby", label: "Hobby", emoji: "🎨" },
  { value: "community", label: "Community", emoji: "🤝" },
  { value: "memory", label: "Memory", emoji: "💭" },
  { value: "photo", label: "Photo", emoji: "📷" },
  { value: "custom", label: "Custom", emoji: "⭐" },
] as const;

const DATE_QUICK = [
  { label: "Today", value: new Date().toISOString().split("T")[0] },
  { label: "Yesterday", value: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
  { label: "Last Week", value: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] },
  { label: "Last Month", value: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0] },
];

export default function AddTimelineEventScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createEvent = useCreateTimelineEvent();

  const [eventType, setEventType] = useState<string>("life_event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to add a timeline event.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title for this event.");
      return;
    }

    try {
      await createEvent.mutateAsync({
        memorial_id: memorialId || "",
        created_by: user!.id,
        event_type: eventType as TimelineEventType,
        title: title.trim(),
        description: description.trim() || undefined,
        event_date: eventDate || undefined,
        location: location.trim() || undefined,
        is_highlight: isHighlight,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not add event. Please try again.");
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
            Added to The Arc!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            "{title}" has been added to The Arc. Every moment helps tell the full story.
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
              The Arc
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Add a moment to the story
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
                Sign in to add timeline events
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
            <Ionicons name="git-commit" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Add to The Arc
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Every event helps tell the complete story of a life well lived.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Event Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Event Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EVENT_TYPE_OPTIONS.map((t) => (
                <Pressable
                  key={t.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    eventType === t.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setEventType(t.value)}
                >
                  <Text className="text-sm mr-1">{t.emoji}</Text>
                  <Text
                    className={`text-xs font-sans-medium ${
                      eventType === t.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="What happened?"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Tell the story behind this moment..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          {/* Date */}
          <DatePickerField
            label="When did this happen?"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Select a date"
            optional
            maximumDate={new Date()}
            quickOptions={DATE_QUICK}
          />

          {/* Location */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Location (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Where did this happen?"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Highlight toggle */}
          <Pressable
            className="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
            onPress={() => setIsHighlight(!isHighlight)}
          >
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <View className="ml-3">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Key Moment
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Highlighted events appear prominently on the timeline
                </Text>
              </View>
            </View>
            <View
              className={`h-6 w-10 rounded-full ${
                isHighlight ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
              } justify-center px-0.5`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  isHighlight ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>

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

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
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
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Add to The Arc
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Timeline events create a chronological story — from the earliest memories to the most recent moments.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
