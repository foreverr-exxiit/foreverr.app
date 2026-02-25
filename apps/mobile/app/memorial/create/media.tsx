import { View, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, supabase, useWizardStore } from "@foreverr/core";
import type { Memorial } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

const PRIVACY_OPTIONS = [
  { value: "public" as const, label: "Public", description: "Anyone can find and view this memorial" },
  { value: "private" as const, label: "Private", description: "Only you and co-hosts can view" },
  { value: "invited" as const, label: "Invite Only", description: "Only people you invite can view" },
];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, updateData, reset } = useWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: "profile" | "cover") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "profile") {
        updateData({ profilePhotoUri: uri });
      } else {
        updateData({ coverPhotoUri: uri });
      }
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Create the memorial
      const { data: memorialRow, error } = await supabase
        .from("memorials")
        .insert({
          created_by: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          middle_name: data.middleName || null,
          nickname: data.nickname || null,
          date_of_birth: data.dateOfBirth || null,
          date_of_death: data.dateOfDeath || null,
          obituary: null,
          biography: null,
          privacy: data.privacy,
          status: "active",
          slug: "",
        })
        .select()
        .single();

      if (error) throw error;
      const memorial = memorialRow as unknown as Memorial;

      // Create the host record
      await supabase.from("memorial_hosts").insert({
        memorial_id: memorial.id,
        user_id: user.id,
        role: "owner",
        relationship: data.relationship as any || "friend",
        relationship_detail: data.relationshipDetail || null,
      });

      // Auto-follow the memorial
      await supabase.from("followers").insert({
        memorial_id: memorial.id,
        user_id: user.id,
      });

      reset();
      router.replace(`/memorial/${memorial.id}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create memorial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-6 pt-14">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base font-sans-medium text-brand-700 mb-4">← Back</Text>
        </Pressable>

        {/* Progress */}
        <View className="mb-6 flex-row gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
          <View className="h-1.5 flex-1 rounded-full bg-brand-700" />
        </View>

        <Text variant="h2" className="mb-1">Photos & Privacy</Text>
        <Text variant="body" className="mb-6 text-gray-500">Step 3 of 3 — Final touches</Text>

        {/* Profile Photo */}
        <Text className="mb-2 text-sm font-sans-medium text-gray-700">Profile Photo</Text>
        <Pressable
          onPress={() => pickImage("profile")}
          className="mb-6 h-32 w-32 items-center justify-center self-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50"
        >
          {data.profilePhotoUri ? (
            <Image source={{ uri: data.profilePhotoUri }} style={{ width: 128, height: 128 }} contentFit="cover" />
          ) : (
            <View className="items-center">
              <Ionicons name="camera" size={32} color="#9ca3af" />
              <Text variant="caption">Add Photo</Text>
            </View>
          )}
        </Pressable>

        {/* Cover Photo */}
        <Text className="mb-2 text-sm font-sans-medium text-gray-700">Cover Photo</Text>
        <Pressable
          onPress={() => pickImage("cover")}
          className="mb-6 h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
        >
          {data.coverPhotoUri ? (
            <Image source={{ uri: data.coverPhotoUri }} style={{ width: "100%", height: 160 }} contentFit="cover" />
          ) : (
            <View className="items-center">
              <Ionicons name="image" size={32} color="#9ca3af" />
              <Text variant="caption">Add Cover Photo (optional)</Text>
            </View>
          )}
        </Pressable>

        {/* Privacy */}
        <Text className="mb-3 text-sm font-sans-medium text-gray-700">Privacy Setting</Text>
        <View className="mb-8 gap-2">
          {PRIVACY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              className={`flex-row items-center rounded-xl border p-4 ${
                data.privacy === opt.value
                  ? "border-brand-700 bg-brand-50"
                  : "border-gray-200 bg-white dark:border-gray-700"
              }`}
              onPress={() => updateData({ privacy: opt.value })}
            >
              <View className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                data.privacy === opt.value ? "border-brand-700" : "border-gray-300"
              }`}>
                {data.privacy === opt.value && (
                  <View className="h-2.5 w-2.5 rounded-full bg-brand-700" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-sans-semibold text-gray-900">{opt.label}</Text>
                <Text variant="caption">{opt.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Button
          title="Create Memorial"
          size="lg"
          fullWidth
          loading={isSubmitting}
          onPress={handleCreate}
        />
      </View>
    </ScrollView>
  );
}
