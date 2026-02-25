import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useDirectoryListing, useDirectoryReviews, useCreateDirectoryLead, useAuth } from "@foreverr/core";

export default function DirectoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { data: listing, isLoading } = useDirectoryListing(id);
  const { data: reviews } = useDirectoryReviews(id);
  const createLead = useCreateDirectoryLead();

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Feather name="alert-circle" size={48} color="#D1D5DB" />
        <Text className="text-lg text-gray-400 mt-4">Business not found</Text>
      </View>
    );
  }

  const handleSubmitLead = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      return Alert.alert("Missing info", "Please fill in all required fields.");
    }
    try {
      await createLead.mutateAsync({
        listingId: listing.id,
        userId: session?.user?.id,
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim(),
      });
      setShowContactForm(false);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      Alert.alert("Sent!", "Your request has been sent to the business.");
    } catch {
      Alert.alert("Error", "Failed to send request.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Cover image */}
        {listing.cover_image_url ? (
          <Image source={{ uri: listing.cover_image_url }} className="w-full h-52" resizeMode="cover" />
        ) : (
          <View className="w-full h-36 bg-purple-50 items-center justify-center">
            <Feather name="home" size={48} color="#7C3AED" />
          </View>
        )}

        <View className="px-4 pt-4 pb-8">
          {/* Name & verified */}
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-gray-900 flex-1">{listing.business_name}</Text>
            {listing.is_verified && (
              <View className="flex-row items-center gap-1 bg-purple-100 rounded-full px-2 py-1">
                <Feather name="check-circle" size={12} color="#7C3AED" />
                <Text className="text-xs font-medium text-purple-700">Verified</Text>
              </View>
            )}
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-row">
              {Array.from({ length: 5 }, (_, i) => (
                <Feather
                  key={i}
                  name="star"
                  size={16}
                  color={i < Math.round(listing.rating_avg) ? "#F59E0B" : "#D1D5DB"}
                />
              ))}
            </View>
            <Text className="text-sm text-gray-600">
              {listing.rating_avg.toFixed(1)} ({listing.review_count} reviews)
            </Text>
            {listing.price_range && (
              <Text className="text-sm text-gray-400 ml-2">{listing.price_range}</Text>
            )}
          </View>

          {/* Description */}
          {listing.description && (
            <Text className="text-sm text-gray-600 leading-5 mt-4">{listing.description}</Text>
          )}

          {/* Services */}
          {listing.services.length > 0 && (
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Services</Text>
              <View className="flex-row flex-wrap gap-2">
                {listing.services.map((s, i) => (
                  <View key={i} className="bg-purple-50 rounded-full px-3 py-1">
                    <Text className="text-xs font-medium text-purple-700">{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact info */}
          <View className="mt-4 bg-gray-50 rounded-xl p-4 gap-3">
            <Text className="text-sm font-semibold text-gray-700">Contact Information</Text>

            <View className="flex-row items-center gap-2">
              <Feather name="map-pin" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 flex-1">
                {listing.address}, {listing.city}{listing.state ? `, ${listing.state}` : ""} {listing.zip_code}
              </Text>
            </View>

            {listing.phone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${listing.phone}`)}
                className="flex-row items-center gap-2"
              >
                <Feather name="phone" size={16} color="#7C3AED" />
                <Text className="text-sm text-purple-600">{listing.phone}</Text>
              </TouchableOpacity>
            )}

            {listing.email && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`mailto:${listing.email}`)}
                className="flex-row items-center gap-2"
              >
                <Feather name="mail" size={16} color="#7C3AED" />
                <Text className="text-sm text-purple-600">{listing.email}</Text>
              </TouchableOpacity>
            )}

            {listing.website_url && (
              <TouchableOpacity
                onPress={() => Linking.openURL(listing.website_url!)}
                className="flex-row items-center gap-2"
              >
                <Feather name="globe" size={16} color="#7C3AED" />
                <Text className="text-sm text-purple-600">Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <View className="mt-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Reviews ({reviews.length})
              </Text>
              {reviews.map((review: any) => (
                <View key={review.id} className="bg-gray-50 rounded-xl p-3 mb-2">
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
                    <Text className="text-xs text-gray-500 font-medium">
                      {review.reviewer?.display_name ?? "User"}
                    </Text>
                  </View>
                  {review.title && (
                    <Text className="text-sm font-medium text-gray-800 mt-1">{review.title}</Text>
                  )}
                  {review.review_text && (
                    <Text className="text-sm text-gray-600 mt-0.5">{review.review_text}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row gap-3">
        <TouchableOpacity
          onPress={() => setShowContactForm(!showContactForm)}
          className="flex-1 bg-purple-600 rounded-xl py-3.5 items-center"
        >
          <Text className="text-white font-semibold">Request Quote</Text>
        </TouchableOpacity>
        {listing.phone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${listing.phone}`)}
            className="w-14 bg-gray-100 rounded-xl items-center justify-center"
          >
            <Feather name="phone" size={20} color="#4A2D7A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contact form */}
      {showContactForm && (
        <View className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-sm border border-gray-200 mb-2"
            placeholder="Your name *"
            placeholderTextColor="#9CA3AF"
            value={contactName}
            onChangeText={setContactName}
          />
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-sm border border-gray-200 mb-2"
            placeholder="Email address *"
            placeholderTextColor="#9CA3AF"
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
          />
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-sm border border-gray-200 mb-3"
            placeholder="How can they help you? *"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            value={contactMessage}
            onChangeText={setContactMessage}
          />
          <TouchableOpacity
            onPress={handleSubmitLead}
            disabled={createLead.isPending}
            className="bg-purple-600 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold">
              {createLead.isPending ? "Sending..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
