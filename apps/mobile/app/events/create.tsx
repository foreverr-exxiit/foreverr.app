import { View, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateEvent, useAuth } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

const EVENT_TYPES = [
  { key: "ceremony", label: "Ceremony", icon: "flower" },
  { key: "celebration", label: "Celebration", icon: "sparkles" },
  { key: "gathering", label: "Gathering", icon: "people" },
  { key: "vigil", label: "Vigil", icon: "flame" },
  { key: "fundraiser", label: "Fundraiser", icon: "cash" },
  { key: "other", label: "Other", icon: "calendar" },
] as const;

export default function CreateEventScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("ceremony");
  const [location, setLocation] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !user?.id || !memorialId) {
      Alert.alert("Error", "Please fill in the event title.");
      return;
    }
    try {
      await createEvent.mutateAsync({
        memorialId,
        createdBy: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        location: location.trim() || undefined,
        isVirtual,
        virtualLink: virtualLink.trim() || undefined,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // default 1 week from now
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-800" contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Event Title *</Text>
      <TextInput
        className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
        placeholder="e.g. Memorial Service for John"
        value={title}
        onChangeText={setTitle}
      />

      <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Type</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {EVENT_TYPES.map((t) => (
          <Pressable
            key={t.key}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 border ${
              type === t.key ? "border-brand-700 bg-brand-50" : "border-gray-200 dark:border-gray-600"
            }`}
            onPress={() => setType(t.key)}
          >
            <Ionicons name={t.icon as any} size={14} color={type === t.key ? "#4A2D7A" : "#9ca3af"} />
            <Text className={`text-xs font-sans-medium ${type === t.key ? "text-brand-700" : "text-gray-500"}`}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Description</Text>
      <TextInput
        className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4 min-h-[80px]"
        placeholder="Tell people about this event..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Pressable
        className="flex-row items-center gap-2 mb-4"
        onPress={() => setIsVirtual(!isVirtual)}
      >
        <Ionicons name={isVirtual ? "checkbox" : "square-outline"} size={20} color="#4A2D7A" />
        <Text className="text-sm font-sans text-gray-700 dark:text-gray-300">This is a virtual event</Text>
      </Pressable>

      {isVirtual ? (
        <>
          <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Virtual Link</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="https://zoom.us/j/..."
            value={virtualLink}
            onChangeText={setVirtualLink}
            autoCapitalize="none"
            keyboardType="url"
          />
        </>
      ) : (
        <>
          <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Location</Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
            placeholder="e.g. St. Mary's Church, 123 Main St"
            value={location}
            onChangeText={setLocation}
          />
        </>
      )}

      <View className="mt-4">
        <Button
          title="Create Event"
          size="lg"
          fullWidth
          loading={createEvent.isPending}
          disabled={!title.trim()}
          onPress={handleCreate}
        />
      </View>
    </ScrollView>
  );
}
