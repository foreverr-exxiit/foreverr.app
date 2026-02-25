import React, { useState } from "react";
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDirectoryListings } from "@foreverr/core";
import { DirectoryCard } from "@foreverr/ui";

const BUSINESS_TYPES = [
  { key: undefined, label: "All" },
  { key: "funeral_home", label: "Funeral Homes" },
  { key: "cemetery", label: "Cemeteries" },
  { key: "florist", label: "Florists" },
  { key: "crematorium", label: "Crematoriums" },
  { key: "grief_counselor", label: "Counselors" },
  { key: "monument_maker", label: "Monuments" },
  { key: "catering", label: "Catering" },
  { key: "photographer", label: "Photographers" },
  { key: "other", label: "Other" },
];

export default function DirectoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();

  const {
    data: listings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useDirectoryListings({
    search: search || undefined,
    city: city || undefined,
    businessType: selectedType,
  });

  const allListings = listings?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search area */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        {/* Search by name */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Search businesses..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Search by city */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2 mt-2">
          <Feather name="map-pin" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="City or location..."
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {BUSINESS_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key ?? "all"}
              onPress={() => setSelectedType(selectedType === type.key ? undefined : type.key)}
              className={`px-4 py-2 rounded-full border ${
                selectedType === type.key
                  ? "bg-purple-600 border-purple-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedType === type.key ? "text-white" : "text-gray-600"
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <Text className="text-sm text-gray-500 px-4 pt-3 pb-1">
        {allListings.length} businesses found
      </Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
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
              <Feather name="map" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-400 mt-4">No businesses found</Text>
              <Text className="text-sm text-gray-400 mt-1">Try a different location or search</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
