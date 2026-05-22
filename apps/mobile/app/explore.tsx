import { View, ScrollView, TextInput, Pressable } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, EternLogo } from "@foreverr/ui";

// ── Feature definitions ──────────────────────────────────────────────

type Feature = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
};

type FeatureCategory = {
  title: string;
  features: Feature[];
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: "Memories & The Core",
    features: [
      {
        title: "The Core",
        description: "Store and protect precious digital memories",
        icon: "lock-closed",
        route: "/memory-vault",
        color: "#7C3AED",
      },
      {
        title: "Core Letters",
        description: "Write heartfelt letters to loved ones",
        icon: "mail",
        route: "/legacy-letters",
        color: "#8B5CF6",
      },
      {
        title: "Scrapbook",
        description: "Create beautiful digital scrapbooks",
        icon: "book",
        route: "/scrapbook",
        color: "#A78BFA",
      },
      {
        title: "Memory Prompts",
        description: "Guided prompts to capture memories",
        icon: "bulb",
        route: "/memory-prompts",
        color: "#6D28D9",
      },
    ],
  },
  {
    title: "Honor the Living",
    features: [
      {
        title: "Living Tributes",
        description: "Create tribute pages for people who are alive",
        icon: "gift",
        route: "/living-tribute",
        color: "#059669",
      },
      {
        title: "Appreciation Letters",
        description: "Write heartfelt letters to those who matter",
        icon: "mail",
        route: "/appreciation",
        color: "#8B5CF6",
      },
      {
        title: "Core Link",
        description: "Claim your eterrn.app/yourname link",
        icon: "link",
        route: "/legacy-link",
        color: "#7C3AED",
      },
      {
        title: "Give Flowers",
        description: "Send flowers to someone you appreciate today",
        icon: "flower",
        route: "/gifts",
        color: "#EC4899",
      },
      {
        title: "Little Arcs",
        description: "Track your baby's journey from pregnancy to adulthood",
        icon: "happy",
        route: "/baby",
        color: "#F59E0B",
      },
      {
        title: "Relationship Journey",
        description: "Record life's relationship milestones and chapters",
        icon: "heart-half",
        route: "/relationship/history",
        color: "#EC4899",
      },
    ],
  },
  {
    title: "Community",
    features: [
      {
        title: "Messages",
        description: "Connect with family and friends",
        icon: "chatbubbles",
        route: "/chat",
        color: "#2563EB",
      },
      {
        title: "Events",
        description: "Celebrations, events, and gatherings",
        icon: "calendar",
        route: "/events",
        color: "#3B82F6",
      },
      {
        title: "Family Tree",
        description: "Build and explore your family tree",
        icon: "git-branch",
        route: "/family-tree",
        color: "#1D4ED8",
      },
      {
        title: "Virtual Spaces",
        description: "Visit virtual tribute and memorial spaces",
        icon: "globe",
        route: "/virtual-space",
        color: "#60A5FA",
      },
    ],
  },
  {
    title: "Services & Earning",
    features: [
      {
        title: "Creator Hub",
        description: "Earn money by honoring people you love",
        icon: "cash",
        route: "/creator",
        color: "#059669",
      },
      {
        title: "Service Marketplace",
        description: "Hire creators for tributes, art, and more",
        icon: "briefcase",
        route: "/services",
        color: "#7c3aed",
      },
      {
        title: "Honor Fundraiser",
        description: "Raise money in someone's honor",
        icon: "ribbon",
        route: "/honor-fundraiser/create",
        color: "#f59e0b",
      },
      {
        title: "Templates",
        description: "Beautiful memorial & celebration designs",
        icon: "color-palette",
        route: "/creator/templates",
        color: "#ec4899",
      },
      {
        title: "My Orders",
        description: "Track services you've ordered",
        icon: "bag-check",
        route: "/creator/my-orders",
        color: "#3b82f6",
      },
      {
        title: "Marketplace",
        description: "Gifts, keepsakes, and meaningful products",
        icon: "storefront",
        route: "/marketplace",
        color: "#059669",
      },
      {
        title: "Directory",
        description: "Find services, florists, and support",
        icon: "business",
        route: "/directory",
        color: "#10B981",
      },
      {
        title: "Donate",
        description: "Support causes and campaigns",
        icon: "heart",
        route: "/donate",
        color: "#EC4899",
      },
      {
        title: "Content Licensing",
        description: "License reusable memorial content",
        icon: "document-text",
        route: "/licensing",
        color: "#6366f1",
      },
      {
        title: "Honor a Day",
        description: "Sponsor a day on a memorial",
        icon: "flame",
        route: "/honor-day",
        color: "#f97316",
      },
      {
        title: "Grief Coaching",
        description: "Connect with compassionate grief coaches",
        icon: "heart-half",
        route: "/grief-coaching",
        color: "#6366f1",
      },
      {
        title: "My Tickets",
        description: "Event tickets you've purchased",
        icon: "ticket",
        route: "/creator/my-tickets",
        color: "#06b6d4",
      },
      {
        title: "My Subscriptions",
        description: "Channels and creators you subscribe to",
        icon: "star-half",
        route: "/creator/my-subscriptions",
        color: "#8b5cf6",
      },
    ],
  },
  {
    title: "Social",
    features: [
      {
        title: "Echoes",
        description: "See what your community is up to",
        icon: "pulse",
        route: "/activity",
        color: "#7C3AED",
      },
      {
        title: "Find Friends",
        description: "Discover and connect with others",
        icon: "people",
        route: "/directory",
        color: "#2563EB",
      },
      {
        title: "Badges",
        description: "Earn badges for your contributions",
        icon: "ribbon",
        route: "/badges",
        color: "#D97706",
      },
      {
        title: "Stories",
        description: "Watch tribute stories from the community",
        icon: "play-circle",
        route: "/stories",
        color: "#EC4899",
      },
    ],
  },
  {
    title: "Daily Life",
    features: [
      {
        title: "Daily Prompt",
        description: "Today's reflection prompt for you",
        icon: "sparkles",
        route: "/daily-prompt",
        color: "#F59E0B",
      },
      {
        title: "Reminders",
        description: "Never forget an important date",
        icon: "alarm",
        route: "/reminders",
        color: "#2563EB",
      },
    ],
  },
  {
    title: "Tools",
    features: [
      {
        title: "QR Codes",
        description: "Create QR codes for tributes and memorials",
        icon: "qr-code",
        route: "/qr-codes",
        color: "#F59E0B",
      },
      {
        title: "Streaks",
        description: "Build daily memory streaks",
        icon: "flame",
        route: "/streaks",
        color: "#EF4444",
      },
      {
        title: "Seasonal",
        description: "Seasonal themes and decorations",
        icon: "snow",
        route: "/seasonal-decorations",
        color: "#06B6D4",
      },
    ],
  },
  {
    title: "Gift Economy",
    features: [
      {
        title: "Send Gifts",
        description: "Give someone their flowers — living or remembered",
        icon: "flower",
        route: "/gifts",
        color: "#EC4899",
      },
      {
        title: "Core Points",
        description: "Track your engagement and level up",
        icon: "star",
        route: "/points",
        color: "#059669",
      },
    ],
  },
  {
    title: "Trust & Safety",
    features: [
      {
        title: "Trust Level",
        description: "Build trust through positive contributions",
        icon: "shield-checkmark",
        route: "/trust",
        color: "#0284C7",
      },
      {
        title: "Claim Memorial",
        description: "Claim ownership of a memorial page",
        icon: "hand-left",
        route: "/trust",
        color: "#6366F1",
      },
      {
        title: "Stewardship",
        description: "Transfer, manage, and protect page ownership",
        icon: "swap-horizontal",
        route: "/stewardship",
        color: "#4A2D7A",
      },
      {
        title: "Page Valuation",
        description: "See how much your pages are worth",
        icon: "analytics",
        route: "/stewardship/valuation",
        color: "#7C3AED",
      },
    ],
  },
  {
    title: "Content Import",
    features: [
      {
        title: "Import Content",
        description: "Import photos and memories from other platforms",
        icon: "cloud-upload",
        route: "/import",
        color: "#64748B",
      },
      {
        title: "GEDCOM Import",
        description: "Import family tree data from GEDCOM files",
        icon: "git-branch",
        route: "/import/gedcom",
        color: "#059669",
      },
    ],
  },
  {
    title: "Life Story",
    features: [
      {
        title: "The Arc",
        description: "A chronological journey through their entire life",
        icon: "time",
        route: "/timeline",
        color: "#8B5CF6",
      },
      {
        title: "Turning Points",
        description: "Track first steps, graduations, weddings & more",
        icon: "trophy",
        route: "/milestones",
        color: "#F59E0B",
      },
      {
        title: "Photo Tags",
        description: "Tag and find people across all photos",
        icon: "people-circle",
        route: "/photo-tags",
        color: "#3B82F6",
      },
      {
        title: "Lifecycle Stages",
        description: "Navigate life's milestones and transitions",
        icon: "sync",
        route: "/lifecycle",
        color: "#7C3AED",
      },
    ],
  },
  {
    title: "Celebrity",
    features: [
      {
        title: "Celebrity Request",
        description: "Request a notable person's memorial page",
        icon: "star",
        route: "/trust",
        color: "#D97706",
      },
      {
        title: "Celebrity Memorials",
        description: "Browse celebrity and notable person pages",
        icon: "sparkles",
        route: "/stories",
        color: "#f59e0b",
      },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter features based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FEATURE_CATEGORIES;

    const q = searchQuery.toLowerCase();
    return FEATURE_CATEGORIES.map((category) => ({
      ...category,
      features: category.features.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          category.title.toLowerCase().includes(q)
      ),
    })).filter((category) => category.features.length > 0);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* ── Branded header ── */}
      <View className="bg-brand-900 px-4 pb-4 pt-14">
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center mb-4">
          <View className="items-center">
            <EternLogo width={960} variant="full" />
          </View>
        </Pressable>

        {/* Search bar */}
        <View className="flex-row items-center rounded-full bg-white/15 px-4 py-2.5">
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            className="ml-2 flex-1 text-sm font-sans text-white"
            placeholder="Search features..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          )}
        </View>

        {/* Subtitle */}
        <Text className="text-white/70 text-xs font-sans text-center mt-3">
          Everything you need, all in one place
        </Text>
      </View>

      {/* ── Feature grid ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.length === 0 ? (
          <View className="items-center justify-center px-8 py-20">
            <Ionicons name="search" size={48} color="#d1d5db" />
            <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
              No features found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredCategories.map((category) => (
            <View key={category.title} className="px-4 pt-5">
              {/* Category header */}
              <View className="flex-row items-center mb-3">
                <View className="h-1 w-4 rounded-full bg-brand-700 mr-2" />
                <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                  {category.title}
                </Text>
              </View>

              {/* 2-column grid */}
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {category.features.map((feature) => (
                  <Pressable
                    key={feature.route}
                    className="rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden active:opacity-80"
                    style={{ width: "48.5%" }}
                    onPress={() => router.push(feature.route as any)}
                  >
                    {/* Icon row */}
                    <View className="px-4 pt-4 pb-2">
                      <View
                        className="h-11 w-11 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${feature.color}18` }}
                      >
                        <Ionicons
                          name={feature.icon}
                          size={22}
                          color={feature.color}
                        />
                      </View>
                    </View>

                    {/* Text */}
                    <View className="px-4 pb-4">
                      <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </Text>
                      <Text
                        className="text-[11px] font-sans text-gray-500 dark:text-gray-400 mt-0.5"
                        numberOfLines={2}
                      >
                        {feature.description}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}

        {/* Back to home footer */}
        <View className="items-center mt-6 mb-4">
          <Pressable
            className="flex-row items-center rounded-full bg-brand-900 px-6 py-3"
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="home" size={16} color="white" />
            <Text className="ml-2 text-sm font-sans-semibold text-white">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
