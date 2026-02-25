import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSellerProfile, useSellerReviews, useMyListings } from "@foreverr/core";
import { SellerCard, ListingCard } from "@foreverr/ui";

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: seller, isLoading: sellerLoading } = useSellerProfile(id);
  const { data: reviews } = useSellerReviews(seller?.id);
  const { data: listings, isLoading: listingsLoading } = useMyListings(id);

  if (sellerLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  const activeListings = listings?.filter((l) => l.status === "active") ?? [];

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ListHeaderComponent={
        <View className="mb-4">
          {/* Seller info */}
          <SellerCard
            businessName={seller?.business_name}
            userName={id ?? ""}
            isVerified={seller?.is_verified}
            ratingAvg={seller?.rating_avg ?? 0}
            ratingCount={seller?.rating_count ?? 0}
            totalSales={seller?.total_sales ?? 0}
            responseTimeHours={seller?.response_time_hours}
          />

          {/* Description */}
          {seller?.business_description && (
            <View className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
              <Text className="text-sm text-gray-600 leading-5">{seller.business_description}</Text>
            </View>
          )}

          {/* Reviews section */}
          {reviews && reviews.length > 0 && (
            <View className="mt-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Reviews ({reviews.length})
              </Text>
              {reviews.slice(0, 3).map((review: any) => (
                <View key={review.id} className="bg-white rounded-xl p-3 border border-gray-100 mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="flex-row">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Feather
                          key={i}
                          name="star"
                          size={12}
                          color={i < review.rating ? "#F59E0B" : "#D1D5DB"}
                        />
                      ))}
                    </View>
                    <Text className="text-xs text-gray-500">
                      {review.reviewer?.display_name ?? "User"}
                    </Text>
                  </View>
                  {review.review_text && (
                    <Text className="text-sm text-gray-600 mt-1">{review.review_text}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Listings header */}
          <Text className="text-base font-semibold text-gray-900 mt-4 mb-3">
            Listings ({activeListings.length})
          </Text>
        </View>
      }
      data={activeListings}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }: { item: any }) => (
        <View className="flex-1">
          <ListingCard
            title={item.title}
            priceCents={item.price_cents}
            currency={item.currency}
            images={item.images ?? []}
            location={item.location}
            sellerName=""
            isService={item.listing_type === "service"}
            condition={item.condition}
            onPress={() => router.push(`/marketplace/${item.id}`)}
          />
        </View>
      )}
      ListEmptyComponent={
        listingsLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          <View className="items-center py-8">
            <Feather name="package" size={32} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 mt-2">No active listings</Text>
          </View>
        )
      }
    />
  );
}
