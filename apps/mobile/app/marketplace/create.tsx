import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth, useMarketplaceCategories, useCreateListing } from "@foreverr/core";

export default function CreateListingScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { data: categories } = useMarketplaceCategories();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [listingType, setListingType] = useState<"product" | "service">("product");
  const [condition, setCondition] = useState<string>("new");
  const [location, setLocation] = useState("");
  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [shippingPrice, setShippingPrice] = useState("");

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    if (!title.trim()) return Alert.alert("Missing title", "Please enter a listing title.");
    if (!price.trim() || isNaN(Number(price))) return Alert.alert("Invalid price", "Please enter a valid price.");
    if (!selectedCategoryId) return Alert.alert("Missing category", "Please select a category.");

    try {
      const priceCents = Math.round(Number(price) * 100);
      await createListing.mutateAsync({
        sellerId: session.user.id,
        categoryId: selectedCategoryId,
        title: title.trim(),
        description: description.trim() || undefined,
        priceCents,
        listingType,
        condition: listingType === "product" ? condition : undefined,
        location: location.trim() || undefined,
        shippingAvailable,
        shippingPriceCents: shippingAvailable && shippingPrice ? Math.round(Number(shippingPrice) * 100) : undefined,
      });
      Alert.alert("Success!", "Your listing is now live.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to create listing. Please try again.");
    }
  };

  const conditions = [
    { key: "new", label: "New" },
    { key: "like_new", label: "Like New" },
    { key: "good", label: "Good" },
    { key: "fair", label: "Fair" },
  ];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {/* Title */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Title *</Text>
      <TextInput
        className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-gray-200 mb-4"
        placeholder="What are you selling?"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
      />

      {/* Listing type */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">Type *</Text>
      <View className="flex-row gap-3 mb-4">
        {(["product", "service"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setListingType(type)}
            className={`flex-1 py-3 rounded-xl items-center border ${
              listingType === type ? "bg-purple-600 border-purple-600" : "bg-white border-gray-200"
            }`}
          >
            <Feather
              name={type === "product" ? "package" : "tool"}
              size={18}
              color={listingType === type ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              className={`text-sm font-medium mt-1 capitalize ${
                listingType === type ? "text-white" : "text-gray-600"
              }`}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {categories?.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategoryId === cat.id
                  ? "bg-purple-600 border-purple-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  selectedCategoryId === cat.id ? "text-white font-medium" : "text-gray-600"
                }`}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Price */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Price (USD) *</Text>
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200 mb-4">
        <Text className="text-base text-gray-400 mr-1">$</Text>
        <TextInput
          className="flex-1 py-3 text-base text-gray-900"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Condition (products only) */}
      {listingType === "product" && (
        <>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Condition</Text>
          <View className="flex-row gap-2 mb-4 flex-wrap">
            {conditions.map((c) => (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCondition(c.key)}
                className={`px-4 py-2 rounded-full border ${
                  condition === c.key ? "bg-purple-600 border-purple-600" : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm ${
                    condition === c.key ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Description */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
      <TextInput
        className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 border border-gray-200 mb-4"
        placeholder="Describe your item or service..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      {/* Location */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Location</Text>
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200 mb-4">
        <Feather name="map-pin" size={16} color="#9CA3AF" />
        <TextInput
          className="flex-1 py-3 ml-2 text-base text-gray-900"
          placeholder="City, State"
          placeholderTextColor="#9CA3AF"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Shipping */}
      <TouchableOpacity
        onPress={() => setShippingAvailable(!shippingAvailable)}
        className="flex-row items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl"
      >
        <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
          shippingAvailable ? "bg-purple-600 border-purple-600" : "border-gray-300"
        }`}>
          {shippingAvailable && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">Shipping available</Text>
          <Text className="text-xs text-gray-500">Offer delivery to buyers</Text>
        </View>
      </TouchableOpacity>

      {shippingAvailable && (
        <>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Shipping Cost (USD)</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200 mb-4">
            <Text className="text-base text-gray-400 mr-1">$</Text>
            <TextInput
              className="flex-1 py-3 text-base text-gray-900"
              placeholder="0.00 (free shipping)"
              placeholderTextColor="#9CA3AF"
              value={shippingPrice}
              onChangeText={setShippingPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={createListing.isPending}
        className={`rounded-xl py-4 items-center mt-4 ${
          createListing.isPending ? "bg-purple-400" : "bg-purple-600"
        }`}
      >
        {createListing.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-base">Publish Listing</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
