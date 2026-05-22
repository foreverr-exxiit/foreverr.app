import React, { useState, useCallback } from "react";
import { View, FlatList, TextInput, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDirectoryListings } from "@foreverr/core";
import { DirectoryCard, ListSkeleton, QueryError } from "@foreverr/ui";
import { Text, EternLogo } from "@foreverr/ui";

// ── Lifecycle-organised categories ─────────────────────────────────
type DirType = { key: string | undefined; label: string; icon: string };
type DirCategory = { section: string; types: DirType[] };

const CATEGORIES: DirCategory[] = [
  {
    section: "All",
    types: [{ key: undefined, label: "All", icon: "grid-outline" }],
  },
  {
    section: "Memorial",
    types: [
      { key: "funeral_home", label: "Funeral Homes", icon: "home-outline" },
      { key: "cemetery", label: "Cemeteries", icon: "leaf-outline" },
      { key: "crematorium", label: "Crematoriums", icon: "flame-outline" },
      { key: "monument_maker", label: "Monuments", icon: "cube-outline" },
      { key: "grief_counselor", label: "Grief Counselors", icon: "heart-half-outline" },
      { key: "estate_planner", label: "Estate Planners", icon: "document-text-outline" },
      { key: "transport", label: "Transport", icon: "car-outline" },
    ],
  },
  {
    section: "Birth & Baby",
    types: [
      { key: "maternity", label: "Maternity", icon: "woman-outline" },
      { key: "doula_midwife", label: "Doulas & Midwives", icon: "medkit-outline" },
      { key: "baby_store", label: "Baby Stores", icon: "storefront-outline" },
      { key: "pediatrician", label: "Pediatricians", icon: "medical-outline" },
    ],
  },
  {
    section: "Wedding",
    types: [
      { key: "wedding_venue", label: "Venues", icon: "business-outline" },
      { key: "wedding_planner", label: "Planners", icon: "clipboard-outline" },
      { key: "bridal_shop", label: "Bridal Shops", icon: "shirt-outline" },
      { key: "jeweler", label: "Jewelers", icon: "diamond-outline" },
    ],
  },
  {
    section: "Events",
    types: [
      { key: "event_venue", label: "Event Venues", icon: "business-outline" },
      { key: "event_planner", label: "Event Planners", icon: "calendar-outline" },
      { key: "party_supplies", label: "Party Supplies", icon: "balloon-outline" },
      { key: "entertainer", label: "Entertainers", icon: "musical-notes-outline" },
    ],
  },
  {
    section: "Shared Services",
    types: [
      { key: "florist", label: "Florists", icon: "flower-outline" },
      { key: "catering", label: "Catering", icon: "restaurant-outline" },
      { key: "photographer", label: "Photographers", icon: "camera-outline" },
      { key: "videographer", label: "Videographers", icon: "videocam-outline" },
      { key: "musician", label: "Musicians", icon: "musical-note-outline" },
      { key: "celebrant", label: "Celebrants", icon: "mic-outline" },
      { key: "bakery", label: "Bakeries", icon: "cafe-outline" },
      { key: "cleaning_service", label: "Cleaning", icon: "sparkles-outline" },
      { key: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
    ],
  },
];

// Flatten for quick look-ups
const ALL_TYPES = CATEGORIES.flatMap((c) => c.types);

export default function DirectoryScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const {
    data: listings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useDirectoryListings({
    search: search || undefined,
    city: city || undefined,
    businessType: selectedType,
  });

  const allListings = listings?.pages.flatMap((p) => p.data) ?? [];

  const selectedLabel = ALL_TYPES.find((t) => t.key === selectedType)?.label ?? "All";

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              Directory
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Find services for every life moment
            </Text>
          </View>
        </View>

        {/* Search by name */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="Search businesses..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Search by city */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2.5 gap-2 mt-2">
          <Ionicons name="location-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
            placeholder="City or location..."
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
          {city.length > 0 && (
            <Pressable onPress={() => setCity("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Category section chips — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 6 }}
        >
          {CATEGORIES.map((cat) => {
            const isAll = cat.section === "All";
            const isSectionActive = isAll
              ? selectedType === undefined
              : cat.types.some((t) => t.key === selectedType);
            const isExpanded = expandedSection === cat.section;

            return (
              <Pressable
                key={cat.section}
                onPress={() => {
                  if (isAll) {
                    setSelectedType(undefined);
                    setExpandedSection(null);
                  } else {
                    setExpandedSection(isExpanded ? null : cat.section);
                  }
                }}
                className={`flex-row items-center rounded-full px-3.5 py-2 ${
                  isSectionActive
                    ? "bg-brand-700"
                    : isExpanded
                    ? "bg-brand-100 dark:bg-brand-900/30 border border-brand-300 dark:border-brand-700"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-xs font-sans-medium ${
                    isSectionActive
                      ? "text-white"
                      : isExpanded
                      ? "text-brand-700 dark:text-brand-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cat.section}
                </Text>
                {!isAll && (
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    color={isSectionActive ? "white" : isExpanded ? "#7C3AED" : "#9CA3AF"}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Expanded sub-types */}
        {expandedSection && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ gap: 6, paddingBottom: 2 }}
          >
            {CATEGORIES.find((c) => c.section === expandedSection)?.types.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setSelectedType(selectedType === t.key ? undefined : t.key)}
                className={`flex-row items-center rounded-full px-3 py-2 ${
                  selectedType === t.key
                    ? "bg-brand-700"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Ionicons
                  name={t.icon as any}
                  size={14}
                  color={selectedType === t.key ? "white" : "#6b7280"}
                />
                <Text
                  className={`ml-1.5 text-xs font-sans-medium ${
                    selectedType === t.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Active filter pill */}
      {selectedType && (
        <View className="flex-row items-center px-4 pt-3 gap-2">
          <View className="flex-row items-center bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1.5 gap-1.5">
            <Text className="text-xs font-sans-medium text-brand-700 dark:text-brand-400">
              {selectedLabel}
            </Text>
            <Pressable onPress={() => setSelectedType(undefined)}>
              <Ionicons name="close-circle" size={14} color="#7C3AED" />
            </Pressable>
          </View>
          <Text className="text-xs font-sans text-gray-400">
            {allListings.length} found
          </Text>
        </View>
      )}

      {/* Results count (when no active filter) */}
      {!selectedType && (
        <Text className="text-xs font-sans text-gray-400 px-4 pt-3">
          {allListings.length} businesses found
        </Text>
      )}

      {/* Results */}
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <QueryError message={error?.message} onRetry={refetch} />
      ) : (
        <FlatList
          data={allListings}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DirectoryCard
              businessName={item.business_name}
              businessType={item.business_type}
              address={item.address}
              city={item.city}
              state={item.state}
              coverImageUrl={item.cover_image_url}
              ratingAvg={item.rating_avg}
              reviewCount={item.review_count}
              priceRange={item.price_range}
              isVerified={item.is_verified}
              isFeatured={item.is_featured}
              services={item.services}
              onPress={() => router.push(`/directory/${item.id}`)}
            />
          )}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator size="small" color="#4A2D7A" /> : null
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
                <Ionicons name="business-outline" size={32} color="#7C3AED" />
              </View>
              <Text className="text-lg font-sans-bold text-gray-400 mt-2">No businesses found</Text>
              <Text className="text-sm font-sans text-gray-400 mt-1 text-center px-8">
                Try a different location, search term, or category
              </Text>
              <Pressable
                onPress={() => {
                  setSearch("");
                  setCity("");
                  setSelectedType(undefined);
                  setExpandedSection(null);
                }}
                className="mt-4 bg-brand-100 dark:bg-brand-900/20 rounded-xl px-6 py-2.5"
              >
                <Text className="text-sm font-sans-medium text-brand-700 dark:text-brand-400">
                  Clear Filters
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}
