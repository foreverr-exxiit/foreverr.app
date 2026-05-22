import { View, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useRequireAuth, useMyCreatorProfile, useCreateServiceListing, SERVICE_CATEGORIES, ServiceCategory } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const CATEGORY_LIST = Object.entries(SERVICE_CATEGORIES).map(([key, val]) => ({ key: key as ServiceCategory, ...val }));
const PRICING_TYPES = [
  { key: "fixed", label: "Fixed Price", desc: "One set price for the service" },
  { key: "hourly", label: "Hourly Rate", desc: "Price per hour of work" },
  { key: "package", label: "Packages", desc: "Multiple tiers of service" },
  { key: "custom", label: "Custom Quote", desc: "Price discussed per project" },
];

export default function CreateServiceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data: creatorProfile } = useMyCreatorProfile(user?.id);
  const createService = useCreateServiceListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [pricingType, setPricingType] = useState("fixed");
  const [priceStr, setPriceStr] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [maxRevisions, setMaxRevisions] = useState("2");
  const [tags, setTags] = useState("");

  const handleCreate = () => {
    requireAuth(async () => {
      if (!creatorProfile?.id) {
        const msg = "You need to join the Creator Program first.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Not a Creator", msg);
        router.push("/creator" as any);
        return;
      }
      if (!title.trim() || !category || !priceStr) {
        const msg = "Please fill in the title, category, and price.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Missing Info", msg);
        return;
      }

      try {
        const priceCents = Math.round(parseFloat(priceStr) * 100);
        await createService.mutateAsync({
          creator_id: creatorProfile.id,
          title: title.trim(),
          description: description.trim(),
          category,
          pricing_type: pricingType,
          price_cents: priceCents,
          delivery_days: parseInt(deliveryDays) || 7,
          max_revisions: parseInt(maxRevisions) || 2,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        });
        const msg = "Your service is now live!";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Service Created!", msg);
        router.back();
      } catch {
        const msg = "Failed to create service. Please try again.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Error", msg);
      }
    });
  };

  if (!creatorProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-8">
        <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mt-4 text-center">
          Join the Creator Program
        </Text>
        <Text className="text-sm font-sans text-gray-500 text-center mt-2">
          You need a creator profile to offer services.
        </Text>
        <Pressable
          className="mt-6 bg-brand-700 rounded-xl px-6 py-3"
          onPress={() => router.push("/creator" as any)}
        >
          <Text className="text-sm font-sans-semibold text-white">Go to Creator Hub</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-1">Create Service</Text>
        <Text className="text-xs font-sans text-gray-500 mb-6">
          Offer your skills and earn money honoring people
        </Text>

        {/* Title */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Service Title *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder='e.g., "Beautiful Tribute Writing for Your Loved One"'
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORY_LIST.map((cat) => (
            <Pressable
              key={cat.key}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                category === cat.key ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
              }`}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={category === cat.key ? "#ffffff" : "#4A2D7A"}
              />
              <Text
                className={`text-[11px] font-sans-semibold ${
                  category === cat.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Description */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Describe what you offer, your process, and what buyers can expect..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />

        {/* Pricing Type */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Pricing Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {PRICING_TYPES.map((pt) => (
            <Pressable
              key={pt.key}
              className={`px-3 py-2 rounded-xl ${
                pricingType === pt.key ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"
              }`}
              onPress={() => setPricingType(pt.key)}
            >
              <Text
                className={`text-[11px] font-sans-semibold ${
                  pricingType === pt.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {pt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Price */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Price (USD) * {pricingType === "hourly" ? "per hour" : pricingType === "custom" ? "(starting from)" : ""}
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
          <Text className="text-sm font-sans-semibold text-gray-400 mr-1">$</Text>
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="25.00"
            placeholderTextColor="#9ca3af"
            value={priceStr}
            onChangeText={setPriceStr}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Delivery & Revisions */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Delivery (days)</Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
              value={deliveryDays}
              onChangeText={setDeliveryDays}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Max Revisions</Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
              value={maxRevisions}
              onChangeText={setMaxRevisions}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Tags */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma separated)</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-6"
          placeholder="e.g., tribute, poem, eulogy, memorial"
          placeholderTextColor="#9ca3af"
          value={tags}
          onChangeText={setTags}
        />

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center ${createService.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleCreate}
          disabled={createService.isPending}
        >
          {createService.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-sans-bold text-white">Publish Service</Text>
          )}
        </Pressable>

        <Text className="text-[10px] font-sans text-gray-400 mt-2 text-center">
          Your service will be immediately visible to all users
        </Text>
      </View>
    </ScrollView>
  );
}
