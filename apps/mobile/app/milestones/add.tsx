import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateMilestone, useMilestoneTemplates } from "@foreverr/core";
import type { MilestoneType } from "@foreverr/core";
import { Text, EternLogo, DatePickerField } from "@foreverr/ui";

const BUILT_IN_TYPES = [
  { value: "birth", label: "Birth", emoji: "👶" },
  { value: "first_steps", label: "First Steps", emoji: "🚶" },
  { value: "first_words", label: "First Words", emoji: "💬" },
  { value: "school_start", label: "Started School", emoji: "🎒" },
  { value: "graduation", label: "Graduation", emoji: "🎓" },
  { value: "first_job", label: "First Job", emoji: "💼" },
  { value: "marriage", label: "Marriage", emoji: "💒" },
  { value: "first_child", label: "First Child", emoji: "👪" },
  { value: "career_achievement", label: "Career Win", emoji: "🏆" },
  { value: "retirement", label: "Retirement", emoji: "🌅" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "custom", label: "Custom", emoji: "⭐" },
] as const;

const AGE_OPTIONS = [
  { label: "Baby (0-1)", value: "1" },
  { label: "Toddler (2-4)", value: "3" },
  { label: "Child (5-12)", value: "8" },
  { label: "Teen (13-17)", value: "15" },
  { label: "Young Adult", value: "21" },
  { label: "Adult", value: "40" },
  { label: "Senior (65+)", value: "70" },
];

const DATE_QUICK = [
  { label: "Today", value: new Date().toISOString().split("T")[0] },
  { label: "This Year", value: `${new Date().getFullYear()}-01-01` },
  { label: "Last Year", value: `${new Date().getFullYear() - 1}-01-01` },
];

export default function AddMilestoneScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId, type: preselectedType } = useLocalSearchParams<{ memorialId: string; type?: string }>();
  const { user } = useAuth();
  const createMilestone = useCreateMilestone();
  const { data: templates } = useMilestoneTemplates();

  const [milestoneType, setMilestoneType] = useState<string>(preselectedType ?? "custom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [ageAtMilestone, setAgeAtMilestone] = useState("");
  const [location, setLocation] = useState("");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  // Use DB templates if available, otherwise built-in
  const typeOptions = templates && templates.length > 0
    ? templates.map((t) => ({ value: t.milestone_type, label: t.label, emoji: t.emoji }))
    : BUILT_IN_TYPES;

  const selectedTemplate = templates?.find((t) => t.milestone_type === milestoneType);

  // Pre-fill title from template when type changes
  useEffect(() => {
    if (templates && milestoneType) {
      const template = templates.find((t) => t.milestone_type === milestoneType);
      if (template && !title) {
        setTitle(template.label);
      }
    }
  }, [milestoneType, templates]);

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to add a milestone.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title for the turning point.");
      return;
    }

    try {
      await createMilestone.mutateAsync({
        memorial_id: memorialId || "",
        created_by: user!.id,
        milestone_type: milestoneType as MilestoneType,
        title: title.trim(),
        description: description.trim() || undefined,
        milestone_date: milestoneDate || undefined,
        age_at_milestone: ageAtMilestone ? parseInt(ageAtMilestone, 10) : undefined,
        location: location.trim() || undefined,
        emoji: selectedTemplate?.emoji,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not add milestone. Please try again.");
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
            Turning Point Recorded!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            "{title}" has been added to the life story. These moments build a beautiful Arc.
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
              Add Milestone
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Record a life moment
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
                Sign in to add milestones
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
            <Ionicons name="flag" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Record a Life Milestone
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            First steps, graduations, achievements — every moment tells a story.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Selected template info */}
          {selectedTemplate && (
            <View className="flex-row items-center bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 border border-brand-100 dark:border-brand-800">
              <Text className="text-3xl mr-3">{selectedTemplate.emoji}</Text>
              <View className="flex-1">
                <Text className="text-sm font-sans-bold text-brand-800 dark:text-brand-300">
                  {selectedTemplate.label}
                </Text>
                {selectedTemplate.description && (
                  <Text className="text-xs font-sans text-brand-600 dark:text-brand-400 mt-0.5">
                    {selectedTemplate.description}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Milestone Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Milestone Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {typeOptions.map((t) => (
                <Pressable
                  key={t.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    milestoneType === t.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => {
                    setMilestoneType(t.value);
                    setTitle("");
                  }}
                >
                  <Text className="text-sm mr-1">{t.emoji}</Text>
                  <Text
                    className={`text-xs font-sans-medium ${
                      milestoneType === t.value ? "text-white" : "text-gray-600 dark:text-gray-400"
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
              placeholder="What milestone is this?"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Story / Details */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Story / Details (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Tell the story behind this milestone..."
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
            value={milestoneDate}
            onChange={setMilestoneDate}
            placeholder="Select a date"
            optional
            maximumDate={new Date()}
            quickOptions={DATE_QUICK}
          />

          {/* Age */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Age at this milestone (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {AGE_OPTIONS.map((a) => (
                <Pressable
                  key={a.value}
                  className={`rounded-full px-3.5 py-2.5 ${
                    ageAtMilestone === a.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setAgeAtMilestone(ageAtMilestone === a.value ? "" : a.value)}
                >
                  <Text
                    className={`text-xs font-sans-medium ${
                      ageAtMilestone === a.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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
              createMilestone.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createMilestone.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="flag-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Record Milestone
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Turning Points build a beautiful life timeline — from first steps to greatest achievements.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
