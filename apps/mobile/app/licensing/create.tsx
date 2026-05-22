import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Platform, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreateContentLicense, CONTENT_TYPES, LICENSE_TYPES } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function CreateContentLicenseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyCreatorProfile(user?.id);
  const createLicense = useCreateContentLicense();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("text");
  const [licenseType, setLicenseType] = useState("personal");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = async () => {
    if (!profile?.id) {
      const msg = "You need a creator profile to list content. Go to Creator Hub first.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Creator Profile Required", msg);
      return;
    }
    if (!title.trim()) {
      const msg = "Please enter a title for your content.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }

    const priceCents = Math.round(parseFloat(price || "0") * 100);

    try {
      await createLicense.mutateAsync({
        creator_id: profile.id,
        title: title.trim(),
        description: description.trim(),
        content_type: contentType,
        license_type: licenseType,
        price_cents: priceCents,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      const msg = "Your content license has been listed!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Listed! 🎉", msg);
      router.back();
    } catch {
      const msg = "Failed to create listing. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-1">List Content</Text>
        <Text className="text-xs font-sans text-gray-500 mb-6">
          License your memorial & celebration content for others to use
        </Text>

        {/* Title */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="e.g., Elegant Memorial Photo Collection"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Content Type */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Content Type *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {Object.entries(CONTENT_TYPES).map(([key, info]) => {
            const selected = contentType === key;
            return (
              <Pressable
                key={key}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  selected ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
                }`}
                onPress={() => setContentType(key)}
              >
                <Ionicons name={info.icon as any} size={14} color={selected ? "#ffffff" : "#4A2D7A"} />
                <Text className={`text-[11px] font-sans-semibold ${selected ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                  {info.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* License Type */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">License Type *</Text>
        <View className="gap-2 mb-4">
          {Object.entries(LICENSE_TYPES).map(([key, info]) => {
            const selected = licenseType === key;
            return (
              <Pressable
                key={key}
                className={`rounded-xl p-3 border ${
                  selected ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700"
                }`}
                onPress={() => setLicenseType(key)}
              >
                <Text className={`text-sm font-sans-semibold ${selected ? "text-brand-700" : "text-gray-900 dark:text-white"}`}>
                  {info.label}
                </Text>
                <Text className="text-xs font-sans text-gray-500">{info.description}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Description */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Describe what's included and how it can be used..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />

        {/* Price */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price</Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
          <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="0.00 (free)"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Tags */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tags</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="memorial, elegant, modern (comma separated)"
          placeholderTextColor="#9ca3af"
          value={tags}
          onChangeText={setTags}
        />

        {/* Fee info */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 flex-row items-start gap-2">
          <Ionicons name="information-circle-outline" size={16} color="#3b82f6" />
          <Text className="text-xs font-sans text-blue-700 dark:text-blue-400 flex-1">
            ǝterrn takes a 12% platform fee on paid license sales. Free content has no fees.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center ${createLicense.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleCreate}
          disabled={createLicense.isPending}
        >
          {createLicense.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
              <Text className="text-base font-sans-bold text-white">List Content</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
