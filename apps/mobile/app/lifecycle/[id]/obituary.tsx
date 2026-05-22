import { View, ScrollView, Pressable } from "react-native";
import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorial, useAuth } from "@foreverr/core";
import { Text, getLifecycleConfig } from "@foreverr/ui";

export default function SupportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(id);

  // ── Lifecycle config ─────────────────────────────────────────────
  const config = useMemo(
    () => getLifecycleConfig((memorial as any)?.lifecycle_stage),
    [(memorial as any)?.lifecycle_stage],
  );

  // Show AI obituary link only for owner + memorial mode
  const showAiObitLink = useMemo(() => {
    if (!user || config.mode !== "memorial") return false;
    return memorial?.created_by === user.id;
  }, [user, config.mode, memorial?.created_by]);

  // Format dates
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  // Dynamic support button descriptions based on mode
  const supportButtonDescriptions: Record<string, string> = config.mode === "memorial"
    ? {
        "Send Flowers": "Choose from our selection of sympathy arrangements",
        "Memorial Gift": "Send a gift to honor their memory",
        "Donate": "Contribute to a cause in their name",
        "Light a Candle": "Light a virtual candle in remembrance",
      }
    : {
        "Send Gift": "Choose a thoughtful gift for the occasion",
        "Send Flowers": "Brighten their day with a beautiful arrangement",
        "Share Story": "Share a meaningful story or memory",
        "Celebrate": "Join in the celebration",
      };

  // Icon colors for support buttons
  const supportButtonIcons: Record<string, { icon: string; bgColor: string; iconColor: string }> = {
    "Send Flowers": { icon: "flower", bgColor: "bg-green-50 dark:bg-green-900/20", iconColor: "#059669" },
    "Memorial Gift": { icon: "gift", bgColor: "bg-brand-100 dark:bg-brand-900/20", iconColor: "#4A2D7A" },
    "Donate": { icon: "heart", bgColor: "bg-red-50 dark:bg-red-900/20", iconColor: "#ef4444" },
    "Light a Candle": { icon: "flame", bgColor: "bg-amber-50 dark:bg-amber-900/20", iconColor: "#d97706" },
    "Send Gift": { icon: "gift", bgColor: "bg-brand-100 dark:bg-brand-900/20", iconColor: "#8b5cf6" },
    "Share Story": { icon: "book", bgColor: "bg-blue-50 dark:bg-blue-900/20", iconColor: "#3b82f6" },
    "Celebrate": { icon: "sparkles", bgColor: "bg-amber-50 dark:bg-amber-900/20", iconColor: "#f59e0b" },
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
      {/* Details Card — config-driven heading */}
      {memorial && (memorial.date_of_birth || memorial.date_of_death || memorial.place_of_birth || memorial.place_of_death) && (
        <View className="mx-4 mt-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4">
          <Text className="text-sm font-sans-bold text-brand-800 dark:text-brand-200 mb-3">
            {config.supportHeading}
          </Text>
          <View className="gap-3">
            {memorial.date_of_birth && (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                  <Ionicons name="star" size={16} color="#4A2D7A" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans text-gray-500">{config.dateLabels.birth}</Text>
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(memorial.date_of_birth)}{memorial.place_of_birth ? ` · ${memorial.place_of_birth}` : ""}
                  </Text>
                </View>
              </View>
            )}
            {/* Death date — only in memorial mode */}
            {config.mode === "memorial" && memorial.date_of_death && (
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center">
                  <Ionicons name="flower" size={16} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans text-gray-500">{config.dateLabels.death}</Text>
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(memorial.date_of_death)}{memorial.place_of_death ? ` · ${memorial.place_of_death}` : ""}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Obituary section — only in memorial mode */}
      {config.mode === "memorial" && memorial?.obituary ? (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-2">Obituary</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">
            {memorial.obituary}
          </Text>
        </View>
      ) : null}

      {/* Biography section — celebration mode shows bio here */}
      {config.mode === "celebration" && memorial?.biography ? (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-2">About</Text>
          <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-6">
            {memorial.biography}
          </Text>
        </View>
      ) : null}

      {/* Personality Traits */}
      {(() => {
        const m = memorial as any;
        const raw = m?.personality_traits;
        const traits: string[] = !raw ? [] : Array.isArray(raw) ? raw : String(raw).split(",").map((s: string) => s.trim()).filter(Boolean);
        if (traits.length === 0) return null;
        return (
          <View className="px-4 pt-4 pb-2">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Personality</Text>
            <View className="flex-row flex-wrap gap-2">
              {traits.map((trait: string, i: number) => (
                <View key={i} className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5">
                  <Text className="text-xs font-sans-medium text-brand-700">{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Accomplishments */}
      {(() => {
        const m = memorial as any;
        const raw = m?.accomplishments;
        const items: string[] = !raw ? [] : Array.isArray(raw) ? raw : String(raw).split(",").map((s: string) => s.trim()).filter(Boolean);
        if (items.length === 0) return null;
        return (
          <View className="px-4 pt-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Accomplishments</Text>
            {items.map((item: string, i: number) => (
              <View key={i} className="flex-row items-start gap-2.5 mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#4A2D7A" style={{ marginTop: 2 }} />
                <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 flex-1 leading-5">{item}</Text>
              </View>
            ))}
          </View>
        );
      })()}

      {/* Hobbies / Interests */}
      {(() => {
        const m = memorial as any;
        const raw = m?.hobbies;
        const hobbies: string[] = !raw ? [] : Array.isArray(raw) ? raw : String(raw).split(",").map((s: string) => s.trim()).filter(Boolean);
        if (hobbies.length === 0) return null;
        return (
          <View className="px-4 pt-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Hobbies & Interests</Text>
            <View className="flex-row flex-wrap gap-2">
              {hobbies.map((hobby: string, i: number) => (
                <View key={i} className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
                  <Text className="text-xs font-sans-medium text-amber-700 dark:text-amber-300">{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Support / Action options — config-driven */}
      <View className="px-4 py-6">
        <Text className="text-base font-sans-bold text-gray-900 dark:text-white mb-4">
          {config.mode === "memorial" ? "Show Your Support" : "Take Action"}
        </Text>

        {config.supportButtons.map((btn, index) => {
          const iconInfo = supportButtonIcons[btn.label] ?? { icon: "heart", bgColor: "bg-gray-100", iconColor: "#6b7280" };
          const desc = supportButtonDescriptions[btn.label] ?? "";
          return (
            <Pressable
              key={btn.label}
              className={`flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 ${index < config.supportButtons.length - 1 ? "mb-3" : ""}`}
              onPress={() => router.push("/donate")}
            >
              <View className={`h-10 w-10 rounded-full ${iconInfo.bgColor} items-center justify-center`}>
                <Ionicons name={iconInfo.icon as any} size={20} color={iconInfo.iconColor} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">{btn.label}</Text>
                {desc ? <Text className="text-xs font-sans text-gray-500">{desc}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          );
        })}
      </View>

      {/* AI Generate button for hosts — memorial mode only */}
      {showAiObitLink && (
        <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Pressable
            className="flex-row items-center rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4"
            onPress={() => router.push(`/lifecycle/${id}/ai-obituary`)}
          >
            <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
              <Ionicons name="sparkles" size={20} color="#4A2D7A" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-sans-semibold text-brand-700">
                {memorial?.obituary ? "Regenerate with AI" : "Generate Obituary with AI"}
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                Create a meaningful obituary using AI
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
          </Pressable>
        </View>
      )}

      {/* If no obituary, show placeholder — memorial mode only */}
      {config.mode === "memorial" && !memorial?.obituary && !showAiObitLink && (
        <View className="items-center px-8 py-8">
          <View className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
            <Ionicons name="document-text-outline" size={28} color="#9ca3af" />
          </View>
          <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 text-center mb-1">
            No obituary yet
          </Text>
          <Text className="text-xs font-sans text-gray-500 text-center">
            The memorial host can add an obituary or generate one with AI.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
