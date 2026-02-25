import React, { useState } from "react";
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListings, useMarketplaceCategories } from "@foreverr/core";
import { ListingCard, CategoryChip } from "@foreverr/ui";

type SortOption = "newest" | "price_low" | "price_high" | "popular";

export default function MarketplaceScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSort, setShowSort] = useState(false);

  const { data: categories } = useMarketplaceCategories();
  const {
    data: listings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useListings({
    search: search || undefined,
    categorySlug: selectedCategory,
    sortBy,
  });

  const allListings = listings?.pages.flatMap((p) => p.data) ?? [];

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "price_low", label: "Price: Low → High" },
    { key: "price_high", label: "Price: High → Low" },
    { key: "popular", label: "Most Popular" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search bar */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Search products & services..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          <CategoryChip
            name="All"
            isSelected={!selectedCategory}
            onPress={() => setSelectedCategory(undefined)}
          />
          {categories?.map((cat) => (
            <CategoryChip
              key={cat.id}
              name={cat.name}
              iconName={cat.icon_name}
              isSelected={selectedCategory === cat.slug}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat.slug ? undefined : cat.slug)
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Sort & results count */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-sm text-gray-500">{allListings.length} results</Text>
        <TouchableOpacity
          onPress={() => setShowSort(!showSort)}
          className="flex-row items-center gap-1"
        >
          <Feather name="sliders" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            {sortOptions.find((s) => s.key === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View className="absolute top-0 right-4 z-50 mt-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                setSortBy(opt.key);
                setShowSort(false);
              }}
              className={`px-4 py-3 border-b border-gray-50 ${sortBy === opt.key ? "bg-purple-50" : ""}`}
            >
              <Text className={`text-sm ${sortBy === opt.key ? "text-purple-600 font-medium" : "text-gray-700"}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Listings */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A2D7A" />
        </View>
      ) : (
        <FlatList
          data={allListings}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <View className="flex-1">
              <ListingCard
                title={item.title}
                priceCents={item.price_cents}
                currency={item.currency}
                images={item.images ?? []}
                location={item.location}
                sellerName={item.seller?.display_name ?? "Seller"}
                sellerAvatar={item.seller?.avatar_url}
                isService={item.listing_type === "service"}
                condition={item.condition}
                onPress={() => router.push(`/marketplace/${item.id}`)}
              />
            </View>
          )}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#4A2D7A" className="py-4" />
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <Feather name="shopping-bag" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-400 mt-4">No listings found</Text>
              <Text className="text-sm text-gray-400 text-center mt-1">
                Try adjusting your filters or search term
              </Text>
            </View>
          }
        />
      )}

      {/* FAB: Create Listing */}
      <TouchableOpacity
        onPress={() => router.push("/marketplace/create")}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 items-center justify-center shadow-lg"
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
