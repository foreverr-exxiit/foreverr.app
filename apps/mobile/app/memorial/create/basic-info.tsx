import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizardStore, memorialStep1Schema } from "@foreverr/core";
import type { z } from "zod";
type MemorialStep1Input = z.infer<typeof memorialStep1Schema>;
import { Text, Input, Button } from "@foreverr/ui";

const RELATIONSHIPS = [
  { value: "immediate_family", label: "Immediate Family" },
  { value: "extended_family", label: "Extended Family" },
  { value: "friend", label: "Friend" },
  { value: "colleague", label: "Colleague" },
  { value: "fan", label: "Fan / Admirer" },
] as const;

export default function BasicInfoScreen() {
  const router = useRouter();
  const { data, updateData, setStep } = useWizardStore();

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<MemorialStep1Input>({
    resolver: zodResolver(memorialStep1Schema),
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      nickname: data.nickname,
      dateOfBirth: data.dateOfBirth,
      dateOfDeath: data.dateOfDeath,
      relationship: data.relationship as any,
      relationshipDetail: data.relationshipDetail,
    },
  });

  const selectedRelationship = watch("relationship");

  const onNext = (formData: MemorialStep1Input) => {
    updateData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || "",
      nickname: formData.nickname || "",
      dateOfBirth: formData.dateOfBirth || "",
      dateOfDeath: formData.dateOfDeath || "",
      relationship: formData.relationship,
      relationshipDetail: formData.relationshipDetail || "",
    });
    setStep(1);
    router.push("/memorial/create/details");
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-6 pt-14">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base font-sans-medium text-brand-700 mb-4">← Cancel</Text>
        </Pressable>

        {/* Progress */}
        <View className="mb-6 flex-row gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
        </View>

        <Text variant="h2" className="mb-1">Who are you honoring?</Text>
        <Text variant="body" className="mb-6 text-gray-500">Step 1 of 3 — Basic Information</Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="First Name *" placeholder="First name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.firstName?.message} />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Last Name *" placeholder="Last name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.lastName?.message} />
            )}
          />

          <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Middle Name" placeholder="Middle name (optional)" value={value || ""} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nickname" placeholder="How they were known (optional)" value={value || ""} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={value || ""} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          <Controller
            control={control}
            name="dateOfDeath"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Date of Death" placeholder="YYYY-MM-DD" value={value || ""} onChangeText={onChange} onBlur={onBlur} />
            )}
          />

          {/* Relationship selector */}
          <View>
            <Text className="mb-1.5 text-sm font-sans-medium text-gray-700 dark:text-gray-300">
              Your Relationship *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {RELATIONSHIPS.map((rel) => (
                <Pressable
                  key={rel.value}
                  className={`rounded-full px-4 py-2 border ${
                    selectedRelationship === rel.value
                      ? "border-brand-700 bg-brand-50"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  }`}
                  onPress={() => setValue("relationship", rel.value, { shouldValidate: true })}
                >
                  <Text
                    className={`text-sm font-sans-medium ${
                      selectedRelationship === rel.value ? "text-brand-700" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {rel.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.relationship && (
              <Text className="mt-1 text-sm text-red-500">{errors.relationship.message}</Text>
            )}
          </View>

          <Button
            title="Continue"
            size="lg"
            fullWidth
            onPress={handleSubmit(onNext)}
          />
        </View>
      </View>
    </ScrollView>
  );
}
