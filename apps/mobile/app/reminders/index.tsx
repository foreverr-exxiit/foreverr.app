import { View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyReminders, useUpcomingReminders, useCreateReminder, useToggleReminder, useDeleteReminder } from "@foreverr/core";
import { Text, ReminderCard } from "@foreverr/ui";

export default function RemindersScreen() {
  const { user } = useAuth();
  const { data: allReminders, isLoading } = useMyReminders(user?.id);
  const { data: upcoming } = useUpcomingReminders(user?.id, 30);
  const createReminder = useCreateReminder();
  const toggleReminder = useToggleReminder();
  const deleteReminder = useDeleteReminder();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  const handleCreate = async () => {
    if (!user?.id || !title.trim() || !reminderDate.trim()) {
      Alert.alert("Required", "Please enter a title and date.");
      return;
    }
    try {
      await createReminder.mutateAsync({
        user_id: user.id,
        title: title.trim(),
        reminder_type: "custom",
        reminder_date: reminderDate.trim(),
      });
      setTitle("");
      setReminderDate("");
      setShowCreate(false);
      Alert.alert("Created!", "Your reminder has been set.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not create reminder.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Upcoming section */}
      {(upcoming ?? []).length > 0 && (
        <View className="mt-4">
          <View className="flex-row items-center px-4 mb-3">
            <Ionicons name="alarm" size={18} color="#EF4444" />
            <Text className="ml-2 text-base font-sans-bold text-gray-900 dark:text-white">
              Coming Up
            </Text>
          </View>
          {(upcoming as any[]).map((r: any) => (
            <ReminderCard
              key={r.id}
              title={r.title}
              reminderDate={r.reminder_date}
              reminderType={r.reminder_type}
              isEnabled={r.is_enabled}
              onToggle={() => toggleReminder.mutate({ id: r.id, isEnabled: r.is_enabled })}
            />
          ))}
        </View>
      )}

      {/* All reminders */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
            All Reminders
          </Text>
          <Pressable
            className="rounded-full bg-brand-700 px-4 py-2"
            onPress={() => setShowCreate(true)}
          >
            <Text className="text-xs font-sans-semibold text-white">+ Add</Text>
          </Pressable>
        </View>

        {/* Create form */}
        {showCreate && (
          <View className="mx-4 mb-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <TextInput
              className="bg-white dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 mb-3"
              placeholder="Reminder title"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="bg-white dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 mb-3"
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#9ca3af"
              value={reminderDate}
              onChangeText={setReminderDate}
            />
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 rounded-full bg-gray-200 dark:bg-gray-600 py-2.5 items-center"
                onPress={() => setShowCreate(false)}
              >
                <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-300">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-full bg-brand-700 py-2.5 items-center"
                onPress={handleCreate}
                disabled={createReminder.isPending}
              >
                <Text className="text-sm font-sans-semibold text-white">
                  {createReminder.isPending ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {(allReminders ?? []).length === 0 ? (
          <View className="items-center py-10 px-8">
            <Ionicons name="alarm-outline" size={36} color="#d1d5db" />
            <Text className="text-sm font-sans text-gray-400 text-center mt-2">
              No reminders yet. Add one to never forget an important date.
            </Text>
          </View>
        ) : (
          (allReminders as any[]).map((r: any) => (
            <ReminderCard
              key={r.id}
              title={r.title}
              reminderDate={r.reminder_date}
              reminderType={r.reminder_type}
              isEnabled={r.is_enabled}
              onToggle={() => toggleReminder.mutate({ id: r.id, isEnabled: r.is_enabled })}
            />
          ))
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
