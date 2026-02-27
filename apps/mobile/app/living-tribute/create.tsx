import { View, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateLivingTribute } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

const OCCASIONS = [
  { key: "birthday", label: "Birthday", icon: "gift" },
  { key: "anniversary", label: "Anniversary", icon: "heart" },
  { key: "retirement", label: "Retirement", icon: "trophy" },
  { key: "graduation", label: "Graduation", icon: "school" },
  { key: "appreciation", label: "Appreciation", icon: "sparkles" },
  { key: "get_well", label: "Get Well", icon: "medkit" },
  { key: "wedding", label: "Wedding", icon: "rose" },
  { key: "achievement", label: "Achievement", icon: "star" },
  { key: "just_because", label: "Just Because", icon: "heart-circle" },
] as const;

export default function CreateLivingTributeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createTribute = useCreateLivingTribute();

  const [honoreeName, setHonoreeName] = useState("");
  const [honoreeEmail, setHonoreeEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("appreciation");
  const [privacy, setPrivacy] = useState("public");
  const [isSurprise, setIsSurprise] = useState(false);

  const handleCreate = async () => {
    if (!user?.id) return;
    if (!honoreeName.trim()) {
      Alert.alert("Required", "Please enter the honoree's name.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title for the tribute.");
      return;
    }

    try {
      const result = await createTribute.mutateAsync({
        created_by: user.id,
        honoree_name: honoreeName.trim(),
        honoree_email: honoreeEmail.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        occasion,
        privacy,
        is_surprise: isSurprise,
      });
      Alert.alert("Created!", "Your living tribute has been created. Share it with friends to collect messages!", [
        { text: "View Tribute", onPress: () => router.replace(`/living-tribute/${result.id}`) },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not create tribute. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* Hero */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-3">
            <Ionicons name="gift" size={32} color="#7C3AED" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
            Honor Someone Special
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1">
            Create a tribute page to celebrate someone while they're alive
          </Text>
        </View>

        {/* Honoree Name */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Who are you honoring? *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="Their full name"
          placeholderTextColor="#9ca3af"
          value={honoreeName}
          onChangeText={setHonoreeName}
        />

        {/* Honoree Email */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Their email (optional)
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="so they can be notified"
          placeholderTextColor="#9ca3af"
          value={honoreeEmail}
          onChangeText={setHonoreeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Title */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Tribute title *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="e.g. Happy Birthday Mom!"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Description (optional)
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4 min-h-[100px]"
          placeholder="Why you're honoring them..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Occasion */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Occasion
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {OCCASIONS.map((o) => (
            <Pressable
              key={o.key}
              className={`flex-row items-center rounded-full px-3 py-2 ${
                occasion === o.key
                  ? "bg-brand-700"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
              onPress={() => setOccasion(o.key)}
            >
              <Ionicons
                name={o.icon as any}
                size={14}
                color={occasion === o.key ? "white" : "#6b7280"}
              />
              <Text
                className={`ml-1.5 text-xs font-sans-medium ${
                  occasion === o.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Privacy */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Privacy
        </Text>
        <View className="flex-row gap-2 mb-4">
          {[
            { key: "public", label: "Public", icon: "earth" },
            { key: "private", label: "Private", icon: "lock-closed" },
            { key: "invited", label: "Invite Only", icon: "mail" },
          ].map((p) => (
            <Pressable
              key={p.key}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                privacy === p.key
                  ? "bg-brand-700"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
              onPress={() => setPrivacy(p.key)}
            >
              <Ionicons
                name={p.icon as any}
                size={14}
                color={privacy === p.key ? "white" : "#6b7280"}
              />
              <Text
                className={`ml-1.5 text-xs font-sans-medium ${
                  privacy === p.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Surprise toggle */}
        <Pressable
          className="flex-row items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-6"
          onPress={() => setIsSurprise(!isSurprise)}
        >
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
            <View className="ml-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Surprise Tribute</Text>
              <Text className="text-xs font-sans text-gray-500">
                Hidden until you're ready to reveal
              </Text>
            </View>
          </View>
          <View className={`h-6 w-10 rounded-full ${isSurprise ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"} justify-center px-0.5`}>
            <View className={`h-5 w-5 rounded-full bg-white ${isSurprise ? "self-end" : "self-start"}`} />
          </View>
        </Pressable>

        {/* Create button */}
        <Button
          title={createTribute.isPending ? "Creating..." : "Create Living Tribute"}
          size="lg"
          fullWidth
          onPress={handleCreate}
          disabled={createTribute.isPending || !honoreeName.trim() || !title.trim()}
        />
      </View>
    </ScrollView>
  );
}
