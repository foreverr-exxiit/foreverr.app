import { useRef, useEffect } from "react";
import { View, ScrollView, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text } from "../primitives/Text";

interface TributeStory {
  id: string;
  author: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface StoriesCarouselProps {
  tributes: TributeStory[];
  onPressStory: (index: number) => void;
  onPressAdd: () => void;
  onPressSeeAll: () => void;
  /** Set of tribute IDs the user has already viewed */
  seenIds?: Set<string>;
  /** Current user's avatar URL for "Your Story" slot */
  currentUserAvatar?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getFirstName(name: string): string {
  const first = name.split(" ")[0] ?? name;
  return first.length > 8 ? first.slice(0, 7) + "..." : first;
}

// ─── Pulsing ring for unseen stories ────────────────────────────────────────

function PulsingRing({ children, active }: { children: React.ReactNode; active: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      pulseAnim.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
}

export function StoriesCarousel({
  tributes,
  onPressStory,
  onPressAdd,
  onPressSeeAll,
  seenIds,
  currentUserAvatar,
}: StoriesCarouselProps) {
  if (!tributes || tributes.length === 0) return null;

  // Deduplicate by author — show each author once
  const seen = new Set<string>();
  const uniqueTributes: TributeStory[] = [];
  for (const t of tributes) {
    const key = t.author?.display_name ?? t.id;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTributes.push(t);
    }
    if (uniqueTributes.length >= 10) break;
  }

  return (
    <View className="px-4 pt-1 pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, alignItems: "center" }}
      >
        {/* Your Story / Add button */}
        <Pressable className="items-center" onPress={onPressAdd}>
          <View className="h-[60px] w-[60px] rounded-full items-center justify-center"
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#7C3AED",
              backgroundColor: "rgba(124, 58, 237, 0.06)",
            }}
          >
            {currentUserAvatar ? (
              <View className="h-[52px] w-[52px] rounded-full overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: currentUserAvatar }}
                  style={{ width: 52, height: 52 }}
                  contentFit="cover"
                />
                <View
                  className="absolute bottom-0 right-0 h-5 w-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#7C3AED" }}
                >
                  <Ionicons name="add" size={14} color="white" />
                </View>
              </View>
            ) : (
              <Ionicons name="add" size={24} color="#7C3AED" />
            )}
          </View>
          <Text className="text-[10px] font-sans-medium text-brand-600 mt-1.5">
            {currentUserAvatar ? "Your Story" : "Add"}
          </Text>
        </Pressable>

        {/* Story bubbles */}
        {uniqueTributes.map((tribute, index) => {
          const isSeen = seenIds?.has(tribute.id) ?? false;

          return (
            <Pressable
              key={tribute.id}
              className="items-center"
              onPress={() => onPressStory(index)}
            >
              <PulsingRing active={!isSeen}>
                <View
                  className="h-[60px] w-[60px] rounded-full items-center justify-center overflow-hidden"
                  style={{
                    borderWidth: 2.5,
                    borderColor: isSeen
                      ? "rgba(124, 58, 237, 0.25)"
                      : "#7C3AED",
                  }}
                >
                  <View
                    className="h-[52px] w-[52px] rounded-full items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: isSeen
                        ? "rgba(107, 114, 128, 0.15)"
                        : "rgba(124, 58, 237, 0.08)",
                    }}
                  >
                    {tribute.author?.avatar_url ? (
                      <Image
                        source={{ uri: tribute.author.avatar_url }}
                        style={{ width: 52, height: 52 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Text
                        className="text-sm font-sans-bold"
                        style={{
                          color: isSeen ? "#9CA3AF" : "#7C3AED",
                        }}
                      >
                        {getInitials(tribute.author?.display_name ?? "?")}
                      </Text>
                    )}
                  </View>
                </View>
              </PulsingRing>
              <Text
                className="text-[10px] font-sans mt-1.5"
                style={{
                  color: isSeen ? "#9CA3AF" : "#4B5563",
                }}
                numberOfLines={1}
              >
                {getFirstName(tribute.author?.display_name ?? "User")}
              </Text>
            </Pressable>
          );
        })}

        {/* See All */}
        {uniqueTributes.length >= 3 && (
          <Pressable className="items-center" onPress={onPressSeeAll}>
            <View
              className="h-[60px] w-[60px] rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}
            >
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
            <Text className="text-[10px] font-sans-medium text-gray-500 mt-1.5">
              See All
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
