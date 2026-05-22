import { View, ScrollView, Pressable, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useTemplate, usePurchaseTemplate, TEMPLATE_CATEGORIES, TIER_INFO } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: template, isLoading } = useTemplate(id);
  const purchaseTemplate = usePurchaseTemplate();

  if (isLoading || !template) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  const categoryInfo = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES];
  const tierInfo = template.creator ? TIER_INFO[(template.creator.tier as keyof typeof TIER_INFO) ?? "rising"] : null;
  const isOwnTemplate = template.creator?.user_id === user?.id;

  const handleUseTemplate = async () => {
    if (!user?.id) return;
    if (template.price_cents > 0 && !isOwnTemplate) {
      const msg = `Purchase "${template.title}" for ${formatPrice(template.price_cents)}? (Payment processing coming soon — template will be unlocked immediately)`;
      if (Platform.OS === "web") {
        if (!window.confirm(msg)) return;
      } else {
        return new Promise<void>((resolve) => {
          Alert.alert("Purchase Template", msg, [
            { text: "Cancel", style: "cancel", onPress: () => resolve() },
            {
              text: `Buy ${formatPrice(template.price_cents)}`,
              onPress: async () => {
                try {
                  await purchaseTemplate.mutateAsync({ template_id: template.id, buyer_id: user.id });
                  const successMsg = "Template unlocked! You can now use it.";
                  Alert.alert("Success! 🎉", successMsg);
                } catch {
                  Alert.alert("Error", "Failed to purchase. Please try again.");
                }
                resolve();
              },
            },
          ]);
        });
      }
      // Web path
      try {
        await purchaseTemplate.mutateAsync({ template_id: template.id, buyer_id: user.id });
        window.alert("Template unlocked! You can now use it.");
      } catch {
        window.alert("Failed to purchase. Please try again.");
      }
      return;
    }
    // Free template
    try {
      await purchaseTemplate.mutateAsync({ template_id: template.id, buyer_id: user.id });
      const msg = "Template added to your collection!";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Added! 🎉", msg);
    } catch {
      const msg = "Failed to download. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Preview — show preview images if available, else fallback icon */}
        {template.preview_images && template.preview_images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="h-56"
          >
            {template.preview_images.map((img: string, i: number) => (
              <View key={i} className="h-56 w-screen bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <View className="h-56 w-full bg-brand-50 dark:bg-brand-900/10 items-center justify-center">
                  <Ionicons name="image-outline" size={40} color="#4A2D7A" />
                  <Text className="text-[10px] font-sans text-brand-500 mt-1">Preview {i + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="h-56 bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
            <Ionicons name={(categoryInfo?.icon ?? "document-outline") as any} size={48} color="#4A2D7A" />
            <Text className="text-sm font-sans-semibold text-brand-700 mt-2 capitalize">
              {categoryInfo?.label ?? template.category}
            </Text>
            <Text className="text-[10px] font-sans text-brand-500 mt-0.5">Template Preview</Text>
          </View>
        )}

        {/* Preview image indicators */}
        {template.preview_images && template.preview_images.length > 1 && (
          <View className="flex-row items-center justify-center gap-1.5 py-2 bg-white dark:bg-gray-900">
            {template.preview_images.map((_: string, i: number) => (
              <View key={i} className="h-1.5 w-1.5 rounded-full bg-brand-300" />
            ))}
          </View>
        )}

        {/* Template Structure Preview */}
        {template.template_data && (
          <View className="bg-gray-50 dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="code-outline" size={16} color="#4A2D7A" />
              <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">Template Structure</Text>
            </View>
            {(() => {
              const td = template.template_data as any;
              const sections = td?.sections ?? td?.blocks ?? td?.layout ?? [];
              if (Array.isArray(sections) && sections.length > 0) {
                return sections.slice(0, 6).map((section: any, i: number) => (
                  <View key={i} className="flex-row items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <View className="h-5 w-5 rounded bg-brand-100 dark:bg-brand-900/20 items-center justify-center">
                      <Text className="text-[8px] font-sans-bold text-brand-700">{i + 1}</Text>
                    </View>
                    <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-400 capitalize">
                      {section.type ?? section.name ?? section.label ?? `Section ${i + 1}`}
                    </Text>
                  </View>
                ));
              }
              const keys = Object.keys(td).filter(k => k !== "id").slice(0, 6);
              return keys.map((key: string) => (
                <View key={key} className="flex-row items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                  <Ionicons name="layers-outline" size={12} color="#9ca3af" />
                  <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/_/g, " ")}
                  </Text>
                </View>
              ));
            })()}
          </View>
        )}

        <View className="px-4 pt-4">
          {/* Title & Price */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white flex-1 mr-3">
              {template.title}
            </Text>
            <View className={`px-3 py-1.5 rounded-full ${template.price_cents === 0 ? "bg-green-100" : "bg-amber-100"}`}>
              <Text className={`text-sm font-sans-bold ${template.price_cents === 0 ? "text-green-700" : "text-amber-700"}`}>
                {formatPrice(template.price_cents)}
              </Text>
            </View>
          </View>

          {/* Category badge */}
          <View className="flex-row items-center gap-1.5 mb-4">
            <Ionicons name={(categoryInfo?.icon ?? "document-outline") as any} size={12} color="#4A2D7A" />
            <Text className="text-xs font-sans text-brand-700 capitalize">{categoryInfo?.label ?? template.category}</Text>
          </View>

          {/* Stats row */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="download-outline" size={14} color="#6b7280" />
              <Text className="text-xs font-sans text-gray-500">{template.download_count ?? 0} downloads</Text>
            </View>
            {template.rating_avg > 0 && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300">
                  {template.rating_avg.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">About this template</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-5 mb-5">
            {template.description}
          </Text>

          {/* Creator Card */}
          {template.creator && (
            <Pressable
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5"
              onPress={() => router.push(`/user/${template.creator.user_id}` as any)}
            >
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center border-2 mr-3" style={{ borderColor: tierInfo?.color ?? "#9ca3af" }}>
                  <Ionicons name="person" size={22} color="#4A2D7A" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    {template.creator.display_name}
                  </Text>
                  {tierInfo && (
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Text className="text-xs">{tierInfo.icon}</Text>
                      <Text className="text-[10px] font-sans" style={{ color: tierInfo.color }}>{tierInfo.name}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </View>
            </Pressable>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <View className="mb-5">
              <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {template.tags.map((tag: string) => (
                  <View key={tag} className="bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1">
                    <Text className="text-[10px] font-sans text-gray-600 dark:text-gray-400">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* What's included */}
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
            <Text className="text-sm font-sans-semibold text-blue-800 dark:text-blue-300 mb-2">What's Included</Text>
            {[
              { icon: "color-palette-outline", text: "Full memorial/celebration page layout" },
              { icon: "text-outline", text: "Pre-designed text styles and typography" },
              { icon: "images-outline", text: "Photo placement guides" },
              { icon: "brush-outline", text: "Color scheme and theme settings" },
            ].map((item, i) => (
              <View key={i} className="flex-row items-center gap-2 mb-1.5">
                <Ionicons name={item.icon as any} size={14} color="#3b82f6" />
                <Text className="text-xs font-sans text-blue-700 dark:text-blue-400">{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {!isOwnTemplate && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4">
          <Pressable
            className={`rounded-xl py-4 items-center ${purchaseTemplate.isPending ? "bg-brand-400" : "bg-brand-700"}`}
            onPress={handleUseTemplate}
            disabled={purchaseTemplate.isPending}
          >
            {purchaseTemplate.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name={template.price_cents === 0 ? "download-outline" : "cart-outline"} size={18} color="#ffffff" />
                <Text className="text-base font-sans-bold text-white">
                  {template.price_cents === 0 ? "Use Template — Free" : `Buy Template — ${formatPrice(template.price_cents)}`}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
