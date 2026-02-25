import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListing, useCreateInquiry, useAuth } from "@foreverr/core";

const { width } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const createInquiry = useCreateInquiry();

  const [currentImage, setCurrentImage] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Feather name="alert-circle" size={48} color="#D1D5DB" />
        <Text className="text-lg font-semibold text-gray-400 mt-4">Listing not found</Text>
      </View>
    );
  }

  const images = (listing as any).images ?? [];
  const seller = (listing as any).seller;
  const category = (listing as any).category;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (listing.currency ?? "usd").toUpperCase(),
  }).format(listing.price_cents / 100);

  const handleSendInquiry = async () => {
    if (!session?.user?.id || !inquiryMessage.trim()) return;
    try {
      await createInquiry.mutateAsync({
        listingId: listing.id,
        buyerId: session.user.id,
        message: inquiryMessage.trim(),
      });
      setShowInquiry(false);
      setInquiryMessage("");
      Alert.alert("Sent!", "Your inquiry has been sent to the seller.");
    } catch {
      Alert.alert("Error", "Failed to send inquiry. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Image carousel */}
        <View className="relative">
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImage(index);
              }}
            >
              {images.map((uri: string, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={{ width, height: 300 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ width, height: 300 }} className="bg-gray-100 items-center justify-center">
              <Feather name="image" size={48} color="#D1D5DB" />
            </View>
          )}

          {/* Image dots */}
          {images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
              {images.map((_: string, idx: number) => (
                <View
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentImage ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Details */}
        <View className="px-4 pt-4 pb-6">
          {/* Price & category */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">{formattedPrice}</Text>
            {category && (
              <View className="bg-purple-100 rounded-full px-3 py-1">
                <Text className="text-xs font-medium text-purple-700">{category.name}</Text>
              </View>
            )}
          </View>

          <Text className="text-lg text-gray-800 mt-2">{listing.title}</Text>

          {/* Badges */}
          <View className="flex-row gap-2 mt-3">
            {listing.listing_type === "service" && (
              <View className="flex-row items-center gap-1 bg-blue-50 rounded-full px-2.5 py-1">
                <Feather name="tool" size={12} color="#3B82F6" />
                <Text className="text-xs font-medium text-blue-600">Service</Text>
              </View>
            )}
            {listing.condition && (
              <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
                <Text className="text-xs font-medium text-gray-600 capitalize">
                  {listing.condition.replace("_", " ")}
                </Text>
              </View>
            )}
            {listing.shipping_available && (
              <View className="flex-row items-center gap-1 bg-green-50 rounded-full px-2.5 py-1">
                <Feather name="truck" size={12} color="#16A34A" />
                <Text className="text-xs font-medium text-green-600">Ships</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {listing.description && (
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
              <Text className="text-sm text-gray-600 leading-5">{listing.description}</Text>
            </View>
          )}

          {/* Location */}
          {listing.location && (
            <View className="flex-row items-center gap-2 mt-4 p-3 bg-gray-50 rounded-xl">
              <Feather name="map-pin" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">{listing.location}</Text>
            </View>
          )}

          {/* Seller info */}
          {seller && (
            <TouchableOpacity
              onPress={() => router.push(`/marketplace/seller/${seller.id}`)}
              className="flex-row items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl"
            >
              {seller.avatar_url ? (
                <Image source={{ uri: seller.avatar_url }} className="w-10 h-10 rounded-full" />
              ) : (
                <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                  <Feather name="user" size={18} color="#7C3AED" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">{seller.display_name}</Text>
                <Text className="text-xs text-gray-500">@{seller.username}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View className="flex-row mt-4 gap-4">
            <View className="flex-row items-center gap-1">
              <Feather name="eye" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">{listing.view_count} views</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Feather name="message-circle" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">{listing.inquiry_count} inquiries</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row gap-3">
        <TouchableOpacity
          onPress={() => setShowInquiry(!showInquiry)}
          className="flex-1 bg-purple-600 rounded-xl py-3.5 items-center"
        >
          <Text className="text-white font-semibold text-base">Contact Seller</Text>
        </TouchableOpacity>
      </View>

      {/* Inquiry input */}
      {showInquiry && (
        <View className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-sm text-gray-900 border border-gray-200"
            placeholder="Write your message to the seller..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={inquiryMessage}
            onChangeText={setInquiryMessage}
          />
          <TouchableOpacity
            onPress={handleSendInquiry}
            disabled={!inquiryMessage.trim() || createInquiry.isPending}
            className={`mt-2 rounded-xl py-3 items-center ${
              inquiryMessage.trim() ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-semibold">
              {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
