import { View, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useServiceListing, useUpdateServiceListing, SERVICE_CATEGORIES, ServiceCategory } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const CATEGORY_LIST = Object.entries(SERVICE_CATEGORIES).map(([key, val]) => ({ key: key as ServiceCategory, ...val }));
const PRICING_TYPES = [
  { key: "fixed", label: "Fixed Price", desc: "One set price for the service" },
  { key: "hourly", label: "Hourly Rate", desc: "Price per hour of work" },
  { key: "package", label: "Packages", desc: "Multiple tiers of service" },
  { key: "custom", label: "Custom Quote", desc: "Price discussed per project" },
];

export default function EditServiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: service, isLoading } = useServiceListing(id);
  const updateService = useUpdateServiceListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [pricingType, setPricingType] = useState("fixed");
  const [priceStr, setPriceStr] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [maxRevisions, setMaxRevisions] = useState("2");
  const [tags, setTags] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Populate from existing service
  useEffect(() => {
    if (service) {
      setTitle(service.title ?? "");
      setDescription(service.description ?? "");
      setCategory(service.category ?? "");
      setPricingType(service.pricing_type ?? "fixed");
      setPriceStr(service.price_cents ? (service.price_cents / 100).toString() : "");
      setDeliveryDays(service.delivery_days?.toString() ?? "7");
      setMaxRevisions(service.max_revisions?.toString() ?? "2");
      setTags((service.tags ?? []).join(", "));
      setIsActive(service.is_active ?? true);
    }
  }, [service]);

  const handleSave = async () => {
    if (!id) return;
    if (!title.trim()) {
      const msg = "Please enter a service title.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }
    if (!category) {
      const msg = "Please select a category.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Required", msg);
      return;
    }

    const priceCents = Math.round(parseFloat(priceStr || "0") * 100);
    if (pricingType !== "custom" && priceCents < 100) {
      const msg = "Minimum price is $1.00";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Price Required", msg);
      return;
    }

    try {
      await updateService.mutateAsync({
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        pricing_type: pricingType,
        price_cents: priceCents,
        delivery_days: parseInt(deliveryDays) || 7,
        max_revisions: parseInt(maxRevisions) || 2,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_active: isActive,
      });
      const msg = "Your service has been updated!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Saved!", msg);
      router.back();
    } catch {
      const msg = "Failed to update. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-1">Edit Service</Text>
        <Text className="text-xs font-sans text-gray-500 mb-6">
          Update your service listing details
        </Text>

        {/* Title */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Service Title *</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="What do you offer?"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {CATEGORY_LIST.map((cat) => {
              const selected = category === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${selected ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"}`}
                  onPress={() => setCategory(cat.key)}
                >
                  <Ionicons name={cat.icon as any} size={14} color={selected ? "#ffffff" : "#4A2D7A"} />
                  <Text className={`text-[11px] font-sans-semibold ${selected ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Description */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="Describe what you offer, your experience, and what buyers get..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />

        {/* Pricing Type */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Pricing Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {PRICING_TYPES.map((pt) => (
            <Pressable
              key={pt.key}
              className={`px-3 py-2 rounded-xl ${pricingType === pt.key ? "bg-brand-700" : "bg-gray-50 dark:bg-gray-800"}`}
              onPress={() => setPricingType(pt.key)}
            >
              <Text className={`text-[11px] font-sans-semibold ${pricingType === pt.key ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                {pt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Price */}
        {pricingType !== "custom" && (
          <>
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Price {pricingType === "hourly" ? "(per hour)" : ""}
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
              <TextInput
                className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={priceStr}
                onChangeText={setPriceStr}
              />
            </View>
          </>
        )}

        {/* Delivery & Revisions */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Delivery (days)</Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="7"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={deliveryDays}
              onChangeText={setDeliveryDays}
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Max Revisions</Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="2"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={maxRevisions}
              onChangeText={setMaxRevisions}
            />
          </View>
        </View>

        {/* Tags */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tags</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-4"
          placeholder="memorial, tribute, personalized (comma separated)"
          placeholderTextColor="#9ca3af"
          value={tags}
          onChangeText={setTags}
        />

        {/* Active Toggle */}
        <Pressable
          className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6"
          onPress={() => setIsActive(!isActive)}
        >
          <Ionicons
            name={isActive ? "checkmark-circle" : "close-circle"}
            size={22}
            color={isActive ? "#059669" : "#ef4444"}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
              {isActive ? "Active — Visible in Marketplace" : "Inactive — Hidden from Marketplace"}
            </Text>
            <Text className="text-xs font-sans text-gray-500">
              {isActive ? "Buyers can find and order this service" : "This service won't appear in searches"}
            </Text>
          </View>
        </Pressable>

        {/* Save Button */}
        <Pressable
          className={`rounded-xl py-4 items-center ${updateService.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleSave}
          disabled={updateService.isPending}
        >
          {updateService.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-sans-bold text-white">Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
