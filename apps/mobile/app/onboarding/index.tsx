import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  ViewToken,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGuestStore } from "@foreverr/core";
import { Text, EternLogo, OnboardingIllustration } from "@foreverr/ui";

interface OnboardingSlide {
  id: string;
  slideKey: "remember" | "share" | "legacy" | "community";
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    slideKey: "remember",
    title: "Honor & Remember",
    subtitle: "Celebrate Lives, Preserve Legacies",
    description:
      "Build beautiful tributes for the people who matter most — whether they're here to celebrate or gone but never forgotten.",
  },
  {
    id: "2",
    slideKey: "share",
    title: "Celebrate Every Story",
    subtitle: "Tributes, Photos & Memories",
    description:
      "Write heartfelt tributes, share treasured photos, and collect memories from everyone who cares. Honor the living. Remember the passed.",
  },
  {
    id: "3",
    slideKey: "legacy",
    title: "Give Them Their Flowers",
    subtitle: "Gifts, Candles & Appreciation",
    description:
      "Send flowers, light candles, and show appreciation while they can still see it. Every act of love becomes part of their lasting legacy.",
  },
  {
    id: "4",
    slideKey: "community",
    title: "You're Not Alone",
    subtitle: "A Community That Cares",
    description:
      "Connect with people who celebrate life and honor those we've lost. Share memories, give flowers, and find comfort in a community that remembers.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useGuestStore((s) => s.setHasSeenOnboarding);

  // Responsive sizing
  const isSmallScreen = height < 700;
  const isWeb = Platform.OS === "web";
  const illustrationSize = isSmallScreen ? 120 : isWeb ? Math.min(160, height * 0.18) : 160;
  const slideWidth = isWeb ? Math.min(width, 500) : width;
  const containerWidth = isWeb ? Math.min(width, 500) : width;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    router.replace("/stories");
  };

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToOffset({
      offset: index * slideWidth,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  // On web, render as a simple scrollable view (no horizontal FlatList paging)
  if (isWeb) {
    const currentSlide = SLIDES[currentIndex];

    return (
      <View
        className="flex-1 bg-brand-900"
        style={{ alignItems: "center" }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "space-between",
            width: containerWidth,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", paddingTop: 48, paddingBottom: 8 }}>
            <EternLogo width={1080} variant="full" />
          </View>

          {/* Slide Content */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
              maxWidth: 440,
            }}
          >
            <View style={{ marginBottom: isSmallScreen ? 16 : 24 }}>
              <OnboardingIllustration slide={currentSlide.slideKey} size={illustrationSize} />
            </View>
            <Text
              style={{ fontSize: isSmallScreen ? 24 : 28, lineHeight: isSmallScreen ? 30 : 36, textAlign: "center", marginBottom: 8 }}
              className="font-sans-bold text-white"
            >
              {currentSlide.title}
            </Text>
            <Text
              style={{ fontSize: isSmallScreen ? 14 : 16, textAlign: "center", marginBottom: 12 }}
              className="font-sans-semibold text-yellow-300"
            >
              {currentSlide.subtitle}
            </Text>
            <Text
              style={{ fontSize: isSmallScreen ? 14 : 15, lineHeight: isSmallScreen ? 22 : 24, textAlign: "center" }}
              className="font-sans text-white/90"
            >
              {currentSlide.description}
            </Text>
          </View>

          {/* Dot indicators */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20, marginBottom: 16 }}>
            {SLIDES.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => setCurrentIndex(index)}
                hitSlop={8}
              >
                <View
                  style={{
                    height: 8,
                    width: index === currentIndex ? 32 : 8,
                    marginHorizontal: 4,
                    borderRadius: 4,
                    backgroundColor: index === currentIndex ? "#ffffff" : "rgba(255,255,255,0.3)",
                  }}
                />
              </Pressable>
            ))}
          </View>

          {/* Bottom buttons */}
          <View style={{ width: "100%", paddingHorizontal: 32, maxWidth: 440 }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {currentIndex > 0 && (
                <Pressable
                  style={{
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={20} color="white" />
                </Pressable>
              )}
              <Pressable
                style={{
                  flex: 1,
                  borderRadius: 999,
                  backgroundColor: "#ffffff",
                  paddingVertical: 16,
                  alignItems: "center",
                }}
                onPress={handleNext}
              >
                <Text className="text-base font-sans-bold text-brand-900">
                  {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                </Text>
              </Pressable>
            </View>

            {currentIndex < SLIDES.length - 1 && (
              <Pressable
                style={{ width: "100%", paddingVertical: 12, alignItems: "center" }}
                onPress={handleGetStarted}
              >
                <Text className="text-base font-sans-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Skip
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Native: horizontal FlatList paging
  return (
    <View className="flex-1 bg-brand-900">
      {/* Logo at top */}
      <View className="items-center" style={{ paddingTop: isSmallScreen ? 40 : 56, paddingBottom: 4 }}>
        <EternLogo width={isSmallScreen ? 960 : 1320} variant="full" />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={4}
        style={{ flex: 1 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-8"
          >
            <View style={{ marginBottom: isSmallScreen ? 16 : 28 }}>
              <OnboardingIllustration slide={item.slideKey} size={illustrationSize} />
            </View>
            <Text
              style={{ fontSize: isSmallScreen ? 24 : 32, lineHeight: isSmallScreen ? 30 : 40, textAlign: "center", marginBottom: 8 }}
              className="font-sans-bold text-white"
            >
              {item.title}
            </Text>
            <Text
              style={{ fontSize: isSmallScreen ? 14 : 17, textAlign: "center", marginBottom: isSmallScreen ? 8 : 14 }}
              className="font-sans-semibold text-yellow-300"
            >
              {item.subtitle}
            </Text>
            <Text
              style={{
                fontSize: isSmallScreen ? 14 : 16,
                lineHeight: isSmallScreen ? 22 : 26,
                textAlign: "center",
                paddingHorizontal: 4,
              }}
              className="font-sans text-white/90"
            >
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View className="flex-row justify-center" style={{ marginBottom: isSmallScreen ? 12 : 20 }}>
        {SLIDES.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => scrollToIndex(index)}
            hitSlop={8}
          >
            <View
              style={{
                height: 8,
                width: index === currentIndex ? 32 : 8,
                marginHorizontal: 4,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? "#ffffff" : "rgba(255,255,255,0.3)",
              }}
            />
          </Pressable>
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 32, paddingBottom: isSmallScreen ? 24 : 48 }}>
        {/* Back / Next row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          {currentIndex > 0 && (
            <Pressable
              className="rounded-full bg-white/15 items-center justify-center"
              style={{ paddingVertical: 16, paddingHorizontal: 24 }}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>
          )}
          <Pressable
            className="flex-1 rounded-full bg-white items-center"
            style={{ paddingVertical: 16 }}
            onPress={handleNext}
          >
            <Text className="text-base font-sans-bold text-brand-900">
              {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>

        {currentIndex < SLIDES.length - 1 && (
          <Pressable
            style={{ width: "100%", paddingVertical: 12, alignItems: "center" }}
            onPress={handleGetStarted}
          >
            <Text className="text-base font-sans-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
