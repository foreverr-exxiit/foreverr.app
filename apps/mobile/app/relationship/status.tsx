import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { DatePickerField } from "@foreverr/ui";
import { useAuth } from "@foreverr/core";
import {
  useWeddingPageChapters,
  useArchiveWeddingPage,
  useCreateRelationshipEvent,
  RELATIONSHIP_EVENT_TYPES,
  EMOTIONAL_TAGS,
  type RelationshipEventType,
  type WeddingRelationshipStatus,
  type EmotionalTag,
} from "@foreverr/core/src/hooks/useRelationshipLifecycle";

const STATUS_OPTIONS: { key: WeddingRelationshipStatus; label: string; emoji: string; description: string }[] = [
  { key: "separated",  label: "Separated",    emoji: "💔", description: "You and your partner are living apart" },
  { key: "divorced",   label: "Divorced",     emoji: "📄", description: "The marriage has been legally dissolved" },
  { key: "widowed",    label: "Widowed",      emoji: "🕊️", description: "Your partner has passed away" },
  { key: "renewed",    label: "Vow Renewal",  emoji: "💕", description: "You and your partner renewed your vows" },
];

export default function RelationshipStatusScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: chapters } = useWeddingPageChapters(user?.id);
  const archivePage = useArchiveWeddingPage();
  const createEvent = useCreateRelationshipEvent();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [status, setStatus] = useState<WeddingRelationshipStatus | null>(null);
  const [eventDate, setEventDate] = useState("");
  const [note, setNote] = useState("");
  const [emotionalTag, setEmotionalTag] = useState<EmotionalTag | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);

  const activePages = chapters?.filter((c) => c.status !== "archived") ?? [];

  const handleSubmit = async () => {
    if (!user?.id || !status || !eventDate) return;

    try {
      if (selectedPageId && (status === "divorced" || status === "separated" || status === "widowed")) {
        await archivePage.mutateAsync({
          pageId: selectedPageId,
          userId: user.id,
          reason: status,
          eventDate,
          note: note.trim() || undefined,
        });
      } else if (status === "renewed" && selectedPageId) {
        await createEvent.mutateAsync({
          user_id: user.id,
          wedding_page_id: selectedPageId,
          event_type: "vow_renewal",
          event_date: eventDate,
          title: "Vow Renewal",
          description: note.trim() || undefined,
          is_private: isPrivate,
          emotional_tag: emotionalTag ?? "joyful",
        });
      }
      router.back();
    } catch {
      // handled
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Update Status
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-sans text-brand-700 dark:text-brand-300">
            Life changes, and your ǝterrn story can reflect that. Your existing content is always preserved — nothing is deleted.
          </Text>
        </View>

        {/* Select wedding page */}
        {activePages.length > 0 && (
          <>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Select Relationship
            </Text>
            {activePages.map((page) => (
              <Pressable
                key={page.id}
                className={`border rounded-xl p-4 mb-2 ${
                  selectedPageId === page.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => setSelectedPageId(page.id)}
              >
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  {page.partner1_name} & {page.partner2_name}
                </Text>
                {page.wedding_date && (
                  <Text className="text-xs font-sans text-gray-500 mt-0.5">
                    Married {new Date(page.wedding_date).toLocaleDateString()}
                  </Text>
                )}
              </Pressable>
            ))}
          </>
        )}

        {/* Status selection */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">
          New Status
        </Text>
        {STATUS_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            className={`border rounded-xl p-4 mb-2 ${
              status === opt.key
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700"
            }`}
            onPress={() => setStatus(opt.key)}
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">{opt.emoji}</Text>
              <View className="flex-1">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{opt.label}</Text>
                <Text className="text-xs font-sans text-gray-500">{opt.description}</Text>
              </View>
              {status === opt.key && (
                <Ionicons name="checkmark-circle" size={22} color="#7C3AED" />
              )}
            </View>
          </Pressable>
        ))}

        {/* Date */}
        <View className="mt-4">
          <DatePickerField
            label="Date"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Select date"
            maximumDate={new Date()}
          />
        </View>

        {/* Note */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">Notes (optional, private)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Any thoughts you'd like to record..."
          multiline
          numberOfLines={3}
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4 min-h-[80px]"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />

        {/* Emotional tag */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">How are you feeling?</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {EMOTIONAL_TAGS.map((tag) => (
            <Pressable
              key={tag.key}
              className={`px-3 py-1.5 rounded-full border ${
                emotionalTag === tag.key
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              onPress={() => setEmotionalTag(emotionalTag === tag.key ? null : tag.key)}
            >
              <Text className="text-sm">{tag.emoji} {tag.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Privacy toggle */}
        <Pressable
          className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6"
          onPress={() => setIsPrivate(!isPrivate)}
        >
          <View className="flex-row items-center">
            <Ionicons name={isPrivate ? "lock-closed" : "globe"} size={18} color="#7C3AED" />
            <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 ml-2">
              {isPrivate ? "Private — only you can see this" : "Visible in your Arc timeline"}
            </Text>
          </View>
          <Ionicons
            name={isPrivate ? "toggle-sharp" : "toggle"}
            size={28}
            color={isPrivate ? "#7C3AED" : "#D1D5DB"}
          />
        </Pressable>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center mb-8 ${
            status && eventDate ? "bg-brand-700" : "bg-gray-300"
          }`}
          onPress={handleSubmit}
          disabled={!status || !eventDate || archivePage.isPending || createEvent.isPending}
        >
          <Text className="text-white font-sans-bold text-base">
            {archivePage.isPending || createEvent.isPending ? "Saving..." : "Update Status"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
