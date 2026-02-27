import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore, memorialStep2Schema } from "@foreverr/core";
import type { z } from "zod";
type MemorialStep2Input = z.infer<typeof memorialStep2Schema>;
import { Text, Input, Button, ForeverrLogo } from "@foreverr/ui";

export default function DetailsScreen() {
  const router = useRouter();
  const { data, updateData, setStep } = useWizardStore();

  const { control, handleSubmit } = useForm<MemorialStep2Input>({
    resolver: zodResolver(memorialStep2Schema),
    defaultValues: {
      personality: data.personality,
      accomplishments: data.accomplishments,
      hobbies: data.hobbies,
      favoriteMemories: data.favoriteMemories,
    },
  });

  const onNext = (formData: MemorialStep2Input) => {
    updateData({
      personality: formData.personality || "",
      accomplishments: formData.accomplishments || "",
      hobbies: formData.hobbies || "",
      favoriteMemories: formData.favoriteMemories || "",
    });
    setStep(2);
    router.push("/memorial/create/media");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Branded header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")}>
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
      </View>
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base font-sans-medium text-brand-700 mb-4">← Back</Text>
        </Pressable>

        {/* Progress */}
        <View className="mb-6 flex-row gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
        </View>

        <Text variant="h2" className="mb-1">Tell us about them</Text>
        <Text variant="body" className="mb-2 text-gray-500">Step 2 of 3 — Their Story</Text>
        <Text variant="caption" className="mb-6 text-brand-600">
          This information helps our AI generate a beautiful obituary and biography later.
        </Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="personality"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Personality & Character"
                placeholder="How would you describe them? What made them special?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px]"
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="accomplishments"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Accomplishments"
                placeholder="Career achievements, awards, milestones..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px]"
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="hobbies"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Hobbies & Interests"
                placeholder="What did they love to do?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="min-h-[80px]"
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="favoriteMemories"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Favorite Memories"
                placeholder="Share a cherished memory..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px]"
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Button
            title="Continue"
            size="lg"
            fullWidth
            onPress={handleSubmit(onNext)}
          />

          <Button
            title="Skip for now"
            variant="ghost"
            fullWidth
            onPress={() => {
              setStep(2);
              router.push("/memorial/create/media");
            }}
          />
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
