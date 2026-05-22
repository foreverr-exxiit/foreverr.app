import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { DatePickerField } from "@foreverr/ui";
import { useAuth } from "@foreverr/core";
import { useCreateBabyPage } from "@foreverr/core/src/hooks/useBabyJourney";

const GENDER_OPTIONS = [
  { key: "boy",       label: "Boy",       emoji: "👦" },
  { key: "girl",      label: "Girl",      emoji: "👧" },
  { key: "non_binary", label: "Non-binary", emoji: "🧒" },
  { key: "surprise",  label: "Surprise",  emoji: "🎁" },
];

export default function CreateBabyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createPage = useCreateBabyPage();

  const [babyName, setBabyName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [privacy, setPrivacy] = useState("private");

  const handleCreate = async () => {
    if (!user?.id || !babyName.trim()) return;
    try {
      const result = await createPage.mutateAsync({
        created_by: user.id,
        baby_name: babyName.trim(),
        nickname: nickname.trim() || undefined,
        gender: gender ?? undefined,
        due_date: dueDate || undefined,
        date_of_birth: dateOfBirth || undefined,
        bio: bio.trim() || undefined,
        privacy,
      });
      router.replace(`/baby/${result.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          New Little Arc
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center mb-6">
          <Text className="text-4xl mb-2">👶</Text>
          <Text className="text-sm font-sans text-gray-500 text-center">
            Start recording your little one's journey
          </Text>
        </View>

        {/* Baby name */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">
          Baby's Name *
        </Text>
        <TextInput
          value={babyName}
          onChangeText={setBabyName}
          placeholder="Enter name"
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
          placeholderTextColor="#9CA3AF"
        />

        {/* Nickname */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">
          Nickname (optional)
        </Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="e.g. Little Bear"
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
          placeholderTextColor="#9CA3AF"
        />

        {/* Gender */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
          Gender
        </Text>
        <View className="flex-row gap-2 mb-4">
          {GENDER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              className={`flex-1 items-center py-3 rounded-xl border ${
                gender === opt.key
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              }`}
              onPress={() => setGender(gender === opt.key ? null : opt.key)}
            >
              <Text className="text-xl mb-0.5">{opt.emoji}</Text>
              <Text className={`text-xs font-sans-medium ${gender === opt.key ? "text-brand-700" : "text-gray-600 dark:text-gray-400"}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Due Date */}
        <DatePickerField
          label="Due Date (if expecting)"
          value={dueDate}
          onChange={setDueDate}
          placeholder="Select due date"
          optional
          maximumDate={new Date(Date.now() + 365 * 86400000)}
        />

        {/* Date of Birth */}
        <DatePickerField
          label="Date of Birth (if already born)"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          placeholder="Select date of birth"
          optional
          maximumDate={new Date()}
        />

        {/* Bio */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">
          About (optional)
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="A little about your bundle of joy..."
          multiline
          numberOfLines={3}
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4 min-h-[80px]"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />

        {/* Privacy */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
          Privacy
        </Text>
        <View className="flex-row gap-2 mb-6">
          {[
            { key: "private", label: "Private", icon: "lock-closed" as const },
            { key: "family", label: "Family Only", icon: "people" as const },
            { key: "public", label: "Public", icon: "globe" as const },
          ].map((opt) => (
            <Pressable
              key={opt.key}
              className={`flex-1 items-center py-3 rounded-xl border ${
                privacy === opt.key
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              }`}
              onPress={() => setPrivacy(opt.key)}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={privacy === opt.key ? "#7C3AED" : "#9CA3AF"}
              />
              <Text className={`text-xs font-sans-medium mt-1 ${privacy === opt.key ? "text-brand-700" : "text-gray-600 dark:text-gray-400"}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Create button */}
        <Pressable
          className={`rounded-xl py-4 items-center mb-8 ${
            babyName.trim() ? "bg-brand-700" : "bg-gray-300"
          }`}
          onPress={handleCreate}
          disabled={!babyName.trim() || createPage.isPending}
        >
          <Text className="text-white font-sans-bold text-base">
            {createPage.isPending ? "Creating..." : "Create Little Arc"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
