import { View, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useCreateHonorFundraiser } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const BENEFICIARY_TYPES = [
  { key: "family", label: "Family", icon: "people-outline" },
  { key: "charity", label: "Charity", icon: "heart-outline" },
  { key: "scholarship", label: "Scholarship", icon: "school-outline" },
  { key: "funeral_costs", label: "Funeral Costs", icon: "flower-outline" },
  { key: "medical", label: "Medical", icon: "medkit-outline" },
  { key: "education", label: "Education", icon: "book-outline" },
  { key: "community", label: "Community", icon: "earth-outline" },
  { key: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const FEE_OPTIONS = [
  { pct: 0, label: "0% — All goes to beneficiary" },
  { pct: 5, label: "5% — Small organizer fee" },
  { pct: 10, label: "10% — Standard organizer fee" },
  { pct: 15, label: "15% — Premium organizer fee" },
];

export default function CreateHonorFundraiserScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const createFundraiser = useCreateHonorFundraiser();

  // Form state
  const [honoreeName, setHonoreeName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [goalStr, setGoalStr] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryType, setBeneficiaryType] = useState("family");
  const [beneficiaryUrl, setBeneficiaryUrl] = useState("");
  const [organizerFeePct, setOrganizerFeePct] = useState(0);

  const handleCreate = () => {
    requireAuth(async () => {
      if (!user?.id) return;
      if (!honoreeName.trim() || !title.trim() || !goalStr) {
        const msg = "Please fill in the honoree name, title, and goal amount.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Missing Info", msg);
        return;
      }

      try {
        const goalCents = Math.round(parseFloat(goalStr) * 100);
        const result = await createFundraiser.mutateAsync({
          organizer_id: user.id,
          honoree_name: honoreeName.trim(),
          title: title.trim(),
          description: description.trim(),
          story: story.trim(),
          goal_cents: goalCents,
          beneficiary_name: beneficiaryName.trim() || honoreeName.trim(),
          beneficiary_type: beneficiaryType,
          beneficiary_url: beneficiaryUrl.trim() || undefined,
          organizer_fee_pct: organizerFeePct,
        });
        const msg = "Your honor fundraiser is now live! Share it with friends and family.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Fundraiser Created!", msg);
        router.replace(`/honor-fundraiser/${result.id}` as any);
      } catch {
        const msg = "Failed to create fundraiser. Please try again.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Error", msg);
      }
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-3xl mb-2">🎗️</Text>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
            Create Honor Fundraiser
          </Text>
          <Text className="text-xs font-sans text-gray-500 text-center mt-1">
            Raise money in someone's honor and earn an organizer fee
          </Text>
        </View>

        {/* Who are you honoring? */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Who are you honoring? *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="e.g., John Smith, Coach Williams, Grandma Rose"
          placeholderTextColor="#9ca3af"
          value={honoreeName}
          onChangeText={setHonoreeName}
        />

        {/* Fundraiser Title */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Fundraiser Title *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder='e.g., "In Memory of Dad — Cancer Research Fund"'
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Short Description */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Short Description
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="A brief description of why you're fundraising..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        {/* Story */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          The Full Story
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Tell the story of the person you're honoring and why this fundraiser matters..."
          placeholderTextColor="#9ca3af"
          value={story}
          onChangeText={setStory}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />

        {/* Goal Amount */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Goal Amount (USD) *
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
          <Text className="text-sm font-sans-semibold text-gray-400 mr-1">$</Text>
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="5,000"
            placeholderTextColor="#9ca3af"
            value={goalStr}
            onChangeText={setGoalStr}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Beneficiary Type */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Beneficiary Type
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {BENEFICIARY_TYPES.map((bt) => (
            <Pressable
              key={bt.key}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                beneficiaryType === bt.key ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
              }`}
              onPress={() => setBeneficiaryType(bt.key)}
            >
              <Ionicons
                name={bt.icon as any}
                size={14}
                color={beneficiaryType === bt.key ? "#ffffff" : "#4A2D7A"}
              />
              <Text
                className={`text-[11px] font-sans-semibold ${
                  beneficiaryType === bt.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {bt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Beneficiary Name */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Beneficiary Name
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Who receives the funds? (family, charity name, etc.)"
          placeholderTextColor="#9ca3af"
          value={beneficiaryName}
          onChangeText={setBeneficiaryName}
        />

        {/* Beneficiary URL */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Beneficiary Website (optional)
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="https://charity-name.org"
          placeholderTextColor="#9ca3af"
          value={beneficiaryUrl}
          onChangeText={setBeneficiaryUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Organizer Fee */}
        <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="cash-outline" size={18} color="#059669" />
            <Text className="text-sm font-sans-semibold text-green-800 dark:text-green-300">
              Organizer Fee
            </Text>
          </View>
          <Text className="text-xs font-sans text-green-700 dark:text-green-400 mb-3">
            As the organizer, you can earn a percentage of each donation. This is transparent to donors.
          </Text>
          {FEE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.pct}
              className={`flex-row items-center py-2.5 px-3 rounded-xl mb-1.5 ${
                organizerFeePct === opt.pct ? "bg-green-200 dark:bg-green-800/40" : "bg-transparent"
              }`}
              onPress={() => setOrganizerFeePct(opt.pct)}
            >
              <View className={`h-5 w-5 rounded-full border-2 mr-3 items-center justify-center ${
                organizerFeePct === opt.pct ? "border-green-600 bg-green-600" : "border-green-300"
              }`}>
                {organizerFeePct === opt.pct && (
                  <Ionicons name="checkmark" size={12} color="#ffffff" />
                )}
              </View>
              <Text className={`text-xs font-sans ${
                organizerFeePct === opt.pct ? "font-sans-semibold text-green-800 dark:text-green-200" : "text-green-700 dark:text-green-400"
              }`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          {organizerFeePct > 0 && goalStr && (
            <View className="mt-2 p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
              <Text className="text-[10px] font-sans text-green-700 dark:text-green-300 text-center">
                If fully funded, you'd earn ~${((parseFloat(goalStr || "0") * organizerFeePct) / 100).toFixed(0)} as organizer
              </Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center ${createFundraiser.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleCreate}
          disabled={createFundraiser.isPending}
        >
          {createFundraiser.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-sans-bold text-white">Launch Fundraiser</Text>
          )}
        </Pressable>

        <Text className="text-[10px] font-sans text-gray-400 mt-2 text-center">
          Platform fee: 5% of each donation. Organizer fee is separate and transparent.
        </Text>
      </View>
    </ScrollView>
  );
}
