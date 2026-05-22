import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "@foreverr/ui/src/primitives/Text";
import { DatePickerField } from "@foreverr/ui";
import { useAuth } from "@foreverr/core";
import {
  useCreateBabyMilestone,
  STAGE_MILESTONES,
  BABY_STAGES,
  type BabyStage,
  type BabyMilestoneType,
} from "@foreverr/core/src/hooks/useBabyJourney";

export default function AddBabyMilestoneScreen() {
  const router = useRouter();
  const { id, stage: stageParam, type: typeParam } = useLocalSearchParams<{
    id: string;
    stage?: string;
    type?: string;
  }>();
  const { user } = useAuth();
  const createMilestone = useCreateBabyMilestone();

  const stage = (stageParam ?? "expecting") as BabyStage;
  const stageMilestones = STAGE_MILESTONES[stage] ?? [];
  const stageInfo = BABY_STAGES.find((s) => s.key === stage);

  const [selectedType, setSelectedType] = useState<BabyMilestoneType | null>(
    (typeParam as BabyMilestoneType) ?? null,
  );
  const [title, setTitle] = useState(
    typeParam ? stageMilestones.find((m) => m.type === typeParam)?.label ?? "" : "",
  );
  const [description, setDescription] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [ageAtMilestone, setAgeAtMilestone] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightOz, setWeightOz] = useState("");

  const handleSelectType = (type: BabyMilestoneType, label: string) => {
    setSelectedType(type);
    if (!title) setTitle(label);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedType || !title.trim()) return;
    try {
      await createMilestone.mutateAsync({
        baby_page_id: id!,
        created_by: user.id,
        stage,
        milestone_type: selectedType,
        title: title.trim(),
        description: description.trim() || undefined,
        milestone_date: milestoneDate || undefined,
        age_at_milestone: ageAtMilestone || undefined,
        height_in: heightIn ? parseFloat(heightIn) : undefined,
        weight_oz: weightOz ? parseInt(weightOz, 10) : undefined,
        emoji: stageMilestones.find((m) => m.type === selectedType)?.emoji,
      });
      router.back();
    } catch {
      // handled by mutation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
        </Pressable>
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          Add Milestone
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Stage indicator */}
        {stageInfo && (
          <View className="flex-row items-center mb-4 px-3 py-2 rounded-xl" style={{ backgroundColor: `${stageInfo.color}10` }}>
            <Text className="text-lg mr-2">{stageInfo.icon}</Text>
            <Text className="text-sm font-sans-medium" style={{ color: stageInfo.color }}>
              {stageInfo.label} Stage
            </Text>
          </View>
        )}

        {/* Milestone type selection */}
        {!selectedType && (
          <>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Choose a Milestone
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {stageMilestones.map((m) => (
                <Pressable
                  key={m.type}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                  onPress={() => handleSelectType(m.type, m.label)}
                >
                  <Text className="text-sm">
                    {m.emoji} {m.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                onPress={() => handleSelectType("custom", "")}
              >
                <Text className="text-sm">+ Custom</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Selected milestone form */}
        {selectedType && (
          <>
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-2">
                {stageMilestones.find((m) => m.type === selectedType)?.emoji ?? "⭐"}
              </Text>
              <Pressable onPress={() => setSelectedType(null)}>
                <Text className="text-xs font-sans text-brand-600 underline">Change</Text>
              </Pressable>
            </View>

            {/* Title */}
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Milestone title"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
              placeholderTextColor="#9CA3AF"
            />

            {/* Description */}
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="How did it happen? What was special?"
              multiline
              numberOfLines={3}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4 min-h-[80px]"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />

            {/* Date */}
            <DatePickerField
              label="Date"
              value={milestoneDate}
              onChange={setMilestoneDate}
              placeholder="Select milestone date"
              optional
              maximumDate={new Date()}
            />

            {/* Age */}
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-1">Age at Milestone</Text>
            <TextInput
              value={ageAtMilestone}
              onChangeText={setAgeAtMilestone}
              placeholder="e.g. 6 months, 2 years"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
              placeholderTextColor="#9CA3AF"
            />

            {/* Growth measurements */}
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Growth Measurements (optional)
            </Text>
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className="text-xs font-sans text-gray-500 mb-1">Height (inches)</Text>
                <TextInput
                  value={heightIn}
                  onChangeText={setHeightIn}
                  placeholder="e.g. 24.5"
                  keyboardType="decimal-pad"
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-sans text-gray-500 mb-1">Weight (oz)</Text>
                <TextInput
                  value={weightOz}
                  onChangeText={setWeightOz}
                  placeholder="e.g. 128"
                  keyboardType="number-pad"
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Save button */}
            <Pressable
              className={`rounded-xl py-4 items-center mb-8 ${
                title.trim() ? "bg-brand-700" : "bg-gray-300"
              }`}
              onPress={handleSave}
              disabled={!title.trim() || createMilestone.isPending}
            >
              <Text className="text-white font-sans-bold text-base">
                {createMilestone.isPending ? "Saving..." : "Save Milestone"}
              </Text>
            </Pressable>
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
