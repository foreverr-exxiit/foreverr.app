import { View, ScrollView, Pressable, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useContentLicense, usePurchaseContentLicense, CONTENT_TYPES, LICENSE_TYPES } from "@foreverr/core";
import { Text, DetailScreenSkeleton } from "@foreverr/ui";

export default function LicenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: license, isLoading } = useContentLicense(id);
  const purchaseMutation = usePurchaseContentLicense();

  if (isLoading || !license) {
    return <DetailScreenSkeleton />;
  }

  const typeInfo = CONTENT_TYPES[license.content_type as keyof typeof CONTENT_TYPES];
  const licenseInfo = LICENSE_TYPES[license.license_type as keyof typeof LICENSE_TYPES];
  const isFree = license.price_cents === 0;
  const isOwner = user?.id === license.creator?.user_id;

  const handlePurchase = async () => {
    if (!user?.id) {
      const msg = "Please sign in to purchase content.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Sign In Required", msg);
      return;
    }

    try {
      await purchaseMutation.mutateAsync({
        license_id: license.id,
        buyer_id: user.id,
        amount_paid_cents: license.price_cents,
        license_type: license.license_type,
      });
      const msg = isFree
        ? "Content downloaded successfully!"
        : `License purchased for $${(license.price_cents / 100).toFixed(2)}!`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Success! 🎉", msg);
    } catch {
      const msg = "Could not complete the purchase. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View className="h-48 bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
          <Ionicons
            name={(typeInfo?.icon ?? "document-outline") as any}
            size={56}
            color="#4A2D7A"
          />
          <View className="flex-row items-center gap-1.5 mt-3 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-full">
            <Ionicons name={(typeInfo?.icon ?? "document-outline") as any} size={12} color="#6b7280" />
            <Text className="text-[11px] font-sans-semibold text-gray-600 dark:text-gray-300">
              {typeInfo?.label ?? license.content_type}
            </Text>
          </View>
        </View>

        {/* Title & Meta */}
        <View className="px-4 pt-5">
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
            {license.title}
          </Text>

          <View className="flex-row items-center gap-3 mt-3">
            <View className="bg-brand-100 dark:bg-brand-900/30 rounded-full px-3 py-1">
              <Text className="text-[11px] font-sans-semibold text-brand-700">
                {licenseInfo?.label ?? license.license_type}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="download-outline" size={14} color="#9ca3af" />
              <Text className="text-xs font-sans text-gray-400">
                {license.download_count ?? 0} downloads
              </Text>
            </View>
          </View>
        </View>

        {/* Price */}
        <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-sans text-gray-400">Price</Text>
            <Text className="text-2xl font-sans-bold text-brand-700">
              {isFree ? "Free" : `$${(license.price_cents / 100).toFixed(2)}`}
            </Text>
          </View>
          {licenseInfo && (
            <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 max-w-[55%]">
              <Text className="text-[10px] font-sans text-gray-500 dark:text-gray-400">
                {licenseInfo.label} — {license.license_type === "free" ? "Free to use" : license.license_type === "personal" ? "Personal use only" : license.license_type === "commercial" ? "Commercial use allowed" : "Full ownership transfer"}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {license.description && (
          <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">
              Description
            </Text>
            <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5">
              {license.description}
            </Text>
          </View>
        )}

        {/* Tags */}
        {license.tags && license.tags.length > 0 && (
          <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {license.tags.map((tag: string) => (
                <View key={tag} className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                  <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-300">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Creator */}
        {license.creator && (
          <Pressable
            className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => router.push(`/user/${license.creator.user_id}` as any)}
          >
            <View className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
              {license.creator.avatar_url ? (
                <View className="w-10 h-10 rounded-full bg-brand-200" />
              ) : (
                <Ionicons name="person" size={20} color="#4A2D7A" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                {license.creator.display_name ?? "Creator"}
              </Text>
              {license.creator.bio && (
                <Text className="text-[11px] font-sans text-gray-400 mt-0.5" numberOfLines={1}>
                  {license.creator.bio}
                </Text>
              )}
            </View>
            {license.creator.tier && (
              <View className="bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
                <Text className="text-[10px] font-sans-semibold text-amber-700 capitalize">
                  {license.creator.tier}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        )}

        {/* Platform Fee Info */}
        <View className="mx-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex-row items-start gap-3">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-blue-700 dark:text-blue-300">
              Content Licensing
            </Text>
            <Text className="text-[11px] font-sans text-blue-600 dark:text-blue-400 mt-1">
              12% platform fee supports memorial preservation. Creators receive 88% of each sale.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Purchase Button */}
      {!isOwner && user && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 pb-8">
          <Pressable
            className={`rounded-xl py-4 items-center ${purchaseMutation.isPending ? "bg-brand-400" : "bg-brand-700"}`}
            onPress={handlePurchase}
            disabled={purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name={isFree ? "download-outline" : "cart-outline"} size={20} color="#fff" />
                <Text className="text-base font-sans-bold text-white">
                  {isFree ? "Download Free" : `Purchase License — $${(license.price_cents / 100).toFixed(2)}`}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      {/* Owner View */}
      {isOwner && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 pb-8">
          <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl py-4 items-center flex-row justify-center gap-2">
            <Ionicons name="create-outline" size={18} color="#d97706" />
            <Text className="text-sm font-sans-semibold text-amber-700">
              This is your listing · {license.download_count ?? 0} downloads
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
