import { View, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useMyCreatorProfile, useCreateTemplate, TEMPLATE_CATEGORIES, TemplateCategory } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const CATEGORY_OPTIONS = Object.entries(TEMPLATE_CATEGORIES).map(([key, val]) => ({ key: key as TemplateCategory, ...val }));

export default function CreateTemplateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyCreatorProfile(user?.id);
  const createTemplate = useCreateTemplate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("memorial");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = async () => {
    if (!profile?.id) {
      const msg = "You need a creator profile to create templates. Go to Creator Hub first.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Creator Profile Required", msg);
      return;
    }
    if (!title.trim()) {
      const msg = "Please enter a template title.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }
    if (!description.trim()) {
      const msg = "Please add a description.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }

    const priceCents = isFree ? 0 : Math.round(parseFloat(price || "0") * 100);

    try {
      await createTemplate.mutateAsync({
        creator_id: profile.id,
        title: title.trim(),
        description: description.trim(),
        category,
        price_cents: priceCents,
        is_free: isFree,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      const msg = "Your template has been published!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Published! 🎉", msg);
      router.back();
    } catch {
      const msg = "Failed to create template. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-1">Create Template</Text>
        <Text className="text-xs font-sans text-gray-500 mb-6">
          Design and sell memorial or celebration templates
        </Text>

        {/* Title */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Template Title *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="e.g., Peaceful Garden Memorial"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORY_OPTIONS.map((opt) => {
            const selected = category === opt.key;
            return (
              <Pressable
                key={opt.key}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                  selected ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
                }`}
                onPress={() => setCategory(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={14} color={selected ? "#ffffff" : "#4A2D7A"} />
                <Text className={`text-[11px] font-sans-semibold ${selected ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Description */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Describe your template's design, features, and who it's perfect for..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />

        {/* Pricing */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Pricing</Text>

        {/* Free toggle */}
        <Pressable
          className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3"
          onPress={() => setIsFree(!isFree)}
        >
          <Ionicons
            name={isFree ? "checkmark-circle" : "close-circle"}
            size={22}
            color={isFree ? "#059669" : "#9ca3af"}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
              {isFree ? "Free Template" : "Paid Template"}
            </Text>
            <Text className="text-xs font-sans text-gray-500">
              {isFree ? "Anyone can use this template" : "Set your price below"}
            </Text>
          </View>
        </Pressable>

        {!isFree && (
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
            <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
            <TextInput
              className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="4.99"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        )}

        {/* Tags */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tags</Text>
        <Text className="text-[10px] font-sans text-gray-400 mb-1.5">Comma separated (e.g., elegant, floral, modern)</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-6"
          placeholder="elegant, floral, modern"
          placeholderTextColor="#9ca3af"
          value={tags}
          onChangeText={setTags}
        />

        {/* Preview info */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 flex-row items-start gap-2">
          <Ionicons name="information-circle-outline" size={16} color="#3b82f6" />
          <Text className="text-xs font-sans text-blue-700 dark:text-blue-400 flex-1">
            Template images and design files can be uploaded after creation. Your template will be published immediately and visible in the marketplace.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center ${createTemplate.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleCreate}
          disabled={createTemplate.isPending}
        >
          {createTemplate.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
              <Text className="text-base font-sans-bold text-white">Publish Template</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
