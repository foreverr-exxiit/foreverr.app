import React, { useRef, useState } from "react";
import { View, FlatList, Pressable, Dimensions, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGuestStore } from "@foreverr/core";
import { Text, ForeverrLogo, OnboardingIllustration } from "@foreverr/ui";

const { width } = Dimensions.get("window");

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
    title: "Remember Together",
    subtitle: "Create Digital Memorials",
    description:
      "Build beautiful, lasting tributes for the people who mattered most. Share their story with the world and keep their memory alive forever.",
  },
  {
    id: "2",
    slideKey: "share",
    title: "Share Their Story",
    subtitle: "Tributes, Photos & Memories",
    description:
      "Write heartfelt tributes, share treasured photos, and collect memories from everyone who loved them. Every story matters.",
  },
  {
    id: "3",
    slideKey: "legacy",
    title: "A Living Legacy",
    subtitle: "Candles, Flowers & Special Dates",
    description:
      "Light candles, lay flowers, and never miss an important anniversary. Their legacy grows with every act of remembrance.",
  },
  {
    id: "4",
    slideKey: "community",
    title: "Join the Community",
    subtitle: "Connect Through Remembrance",
    description:
      "You are not alone in remembering. Connect with others who understand, share in each other's memories, and find comfort together.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useGuestStore((s) => s.setHasSeenOnboarding);

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
    router.replace("/(tabs)");
  };

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToOffset({
      offset: index * width,
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

  return (
    <View className="flex-1 bg-brand-900">
      {/* Logo at top */}
      <View className="items-center pt-14 pb-2">
        <ForeverrLogo width={280} variant="full" />
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
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <View className="mb-8">
              <OnboardingIllustration slide={item.slideKey} size={200} />
            </View>
            <Text className="text-4xl font-sans-bold text-white text-center mb-3">
              {item.title}
            </Text>
            <Text className="text-lg font-sans-semibold text-yellow-300 text-center mb-4">
              {item.subtitle}
            </Text>
            <Text className="text-lg font-sans text-white text-center leading-8 px-2">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View className="flex-row justify-center mb-6">
        {SLIDES.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => scrollToIndex(index)}
            hitSlop={8}
          >
            <View
              className={`h-2 mx-1 rounded-full ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30"
              }`}
            />
          </Pressable>
        ))}
      </View>

      {/* Bottom buttons */}
      <View className="px-8 pb-12">
        {/* Back / Next row */}
        <View className="flex-row gap-3 mb-3">
          {currentIndex > 0 && (
            <Pressable
              className="rounded-full bg-white/15 py-4 items-center justify-center px-6"
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>
          )}
          <Pressable
            className="flex-1 rounded-full bg-white py-4 items-center"
            onPress={handleNext}
          >
            <Text className="text-base font-sans-bold text-brand-900">
              {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>

        {currentIndex < SLIDES.length - 1 && (
          <Pressable
            className="w-full py-3 items-center"
            onPress={handleGetStarted}
          >
            <Text className="text-base font-sans-medium text-white/80">
              Skip
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
