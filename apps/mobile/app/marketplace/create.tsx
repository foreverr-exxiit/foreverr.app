import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, EternLogo } from "@foreverr/ui";
import { useAuth, useMarketplaceCategories, useCreateListing } from "@foreverr/core";

// Built-in categories as fallback when DB categories haven't loaded
const BUILT_IN_CATEGORIES = [
  { id: "baby", name: "Baby & Nursery", icon: "\uD83D\uDC76" },
  { id: "celebrations", name: "Celebrations", icon: "\uD83C\uDF89" },
  { id: "flowers", name: "Flowers & Plants", icon: "\uD83C\uDF39" },
  { id: "memorial", name: "Memorial & Sympathy", icon: "\uD83D\uDD4A\uFE0F" },
  { id: "keepsakes", name: "Keepsakes & Jewelry", icon: "\uD83D\uDC8E" },
  { id: "custom", name: "Custom Creations", icon: "\uD83C\uDFA8" },
  { id: "services", name: "Services", icon: "\uD83D\uDEE0\uFE0F" },
  { id: "digital", name: "Digital Products", icon: "\uD83D\uDCF1" },
  { id: "legacy", name: "Legacy & Heritage", icon: "\uD83C\uDF33" },
  { id: "gifts", name: "Gifts & Cards", icon: "\uD83C\uDF81" },
  // Lifecycle categories
  { id: "wedding", name: "Wedding Supplies", icon: "\uD83D\uDC92" },
  { id: "graduation", name: "Graduation Gifts", icon: "\uD83C\uDF93" },
  { id: "retirement", name: "Retirement Keepsakes", icon: "\uD83C\uDF05" },
  { id: "party", name: "Party Decorations", icon: "\uD83C\uDF88" },
  { id: "event-planning", name: "Event Planning Services", icon: "\uD83D\uDCCB" },
  { id: "photography", name: "Photography Packages", icon: "\uD83D\uDCF8" },
  { id: "milestones", name: "Turning Point Markers", icon: "\uD83C\uDFC6" },
  { id: "invitations", name: "Personalized Invitations", icon: "\u2709\uFE0F" },
];

const CONDITIONS = [
  { key: "new", label: "New", icon: "✨" },
  { key: "like_new", label: "Like New", icon: "👍" },
  { key: "good", label: "Good", icon: "👌" },
  { key: "fair", label: "Fair", icon: "🤝" },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { session } = useAuth();
  const { data: dbCategories } = useMarketplaceCategories();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [listingType, setListingType] = useState<"product" | "service">("product");
  const [condition, setCondition] = useState("new");
  const [location, setLocation] = useState("");
  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [shippingPrice, setShippingPrice] = useState("");

  // Inline validation error
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Use DB categories if available, otherwise built-in fallback
  const categories = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((c) => ({ id: c.id, name: c.name, icon: "" }))
    : BUILT_IN_CATEGORIES;

  const isSignedIn = !!session?.user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to publish a listing.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title for your listing.");
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      const priceCents = Math.round(Number(price) * 100);
      await createListing.mutateAsync({
        sellerId: session!.user.id,
        categoryId: selectedCategoryId,
        title: title.trim(),
        description: description.trim() || undefined,
        priceCents,
        listingType,
        condition: listingType === "product" ? condition : undefined,
        location: location.trim() || undefined,
        shippingAvailable,
        shippingPriceCents: shippingAvailable && shippingPrice
          ? Math.round(Number(shippingPrice) * 100)
          : undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create listing. Please try again.");
    }
  };

  // Success state
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            Listing Published!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your listing "{title}" is now live in the marketplace.
          </Text>
          <Pressable
            onPress={goBack}
            className="bg-brand-700 rounded-2xl px-8 py-4"
          >
            <Text className="text-base font-sans-bold text-white">Back to Marketplace</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Create Listing
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Sell products & services on ǝterrn
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign-in banner */}
        {!isSignedIn && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-4 mt-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to list items
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        <View className="px-4 pt-5 gap-5">

          {/* Listing Type Toggle */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              What are you listing? *
            </Text>
            <View className="flex-row gap-3">
              {(["product", "service"] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setListingType(type)}
                  className={`flex-1 py-3.5 rounded-xl items-center border ${
                    listingType === type
                      ? "bg-brand-700 border-brand-700"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name={type === "product" ? "cube-outline" : "construct-outline"}
                    size={20}
                    color={listingType === type ? "#ffffff" : "#6B7280"}
                  />
                  <Text
                    className={`text-sm font-sans-bold mt-1 capitalize ${
                      listingType === type ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder={listingType === "product" ? "What are you selling?" : "What service do you offer?"}
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => { setSelectedCategoryId(cat.id); setError(""); }}
                  className={`px-3.5 py-2 rounded-full border flex-row items-center gap-1.5 ${
                    selectedCategoryId === cat.id
                      ? "bg-brand-700 border-brand-700"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {"icon" in cat && (cat as any).icon ? (
                    <Text style={{ fontSize: 13 }}>{(cat as any).icon}</Text>
                  ) : null}
                  <Text
                    className={`text-xs font-sans-medium ${
                      selectedCategoryId === cat.id
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Price (USD) *
            </Text>
            <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
              <Text className="text-base font-sans-bold text-gray-400 mr-1">$</Text>
              <TextInput
                className="flex-1 py-3.5 text-sm font-sans text-gray-900 dark:text-white"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={(p) => { setPrice(p); setError(""); }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Condition (products only) */}
          {listingType === "product" && (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Condition
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {CONDITIONS.map((c) => (
                  <Pressable
                    key={c.key}
                    onPress={() => setCondition(c.key)}
                    className={`px-4 py-2.5 rounded-full border flex-row items-center gap-1.5 ${
                      condition === c.key
                        ? "bg-brand-700 border-brand-700"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text style={{ fontSize: 12 }}>{c.icon}</Text>
                    <Text
                      className={`text-sm font-sans-medium ${
                        condition === c.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder={listingType === "product" ? "Describe your item..." : "Describe your service..."}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Location
            </Text>
            <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-3.5 ml-2 text-sm font-sans text-gray-900 dark:text-white"
                placeholder="City, State"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Shipping Toggle */}
          {listingType === "product" && (
            <>
              <Pressable
                onPress={() => setShippingAvailable(!shippingAvailable)}
                className="flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <View
                  className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                    shippingAvailable
                      ? "bg-brand-700 border-brand-700"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {shippingAvailable && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    Shipping available
                  </Text>
                  <Text className="text-xs font-sans text-gray-500 mt-0.5">
                    Offer delivery to buyers
                  </Text>
                </View>
              </Pressable>

              {shippingAvailable && (
                <View>
                  <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Cost (USD)
                  </Text>
                  <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
                    <Text className="text-base font-sans-bold text-gray-400 mr-1">$</Text>
                    <TextInput
                      className="flex-1 py-3.5 text-sm font-sans text-gray-900 dark:text-white"
                      placeholder="0.00 (free shipping)"
                      placeholderTextColor="#9CA3AF"
                      value={shippingPrice}
                      onChangeText={setShippingPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              )}
            </>
          )}

          {/* Error Message (inline — works on web!) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Submit Button — always tappable */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              createListing.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createListing.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="pricetag-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Publish Listing
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Your listing will be visible to all ǝterrn users. You can edit or remove it at any time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
