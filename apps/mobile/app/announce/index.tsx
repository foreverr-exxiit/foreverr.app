import { View, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, usePremium, useRevenueCat } from "@foreverr/core";
import { Text, EternLogo, ShareCardPreview, PaywallModal, DatePickerField } from "@foreverr/ui";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

// ── Announcement Types ──────────────────────────────────────────────

type AnnouncementType = {
  key: string;
  emoji: string;
  label: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  color: string;
  bgColor: string;
  isPremium?: boolean;
};

const ANNOUNCEMENT_TYPES: AnnouncementType[] = [
  {
    key: "memorial",
    emoji: "\uD83D\uDD4A\uFE0F",
    label: "Memorial",
    description: "Celebrate a life lived",
    defaultTitle: "Celebrating a Beautiful Life",
    defaultSubtitle: "Join us in honoring and remembering",
    color: "#4A2D7A",
    bgColor: "#F5F3FF",
  },
  {
    key: "birthday",
    emoji: "\uD83C\uDF82",
    label: "Birthday",
    description: "Celebrate a birthday",
    defaultTitle: "Happy Birthday!",
    defaultSubtitle: "Join us in celebrating this special day",
    color: "#EC4899",
    bgColor: "#FDF2F8",
  },
  {
    key: "tribute_launch",
    emoji: "\uD83C\uDF89",
    label: "Tribute Launch",
    description: "Share a new tribute",
    defaultTitle: "We Created a Tribute!",
    defaultSubtitle: "Come celebrate and share your memories",
    color: "#059669",
    bgColor: "#ECFDF5",
  },
  {
    key: "anniversary",
    emoji: "\uD83D\uDD6F\uFE0F",
    label: "Anniversary",
    description: "Remember a loved one",
    defaultTitle: "Remembering Today",
    defaultSubtitle: "Join us in honoring their memory",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
  },
  {
    key: "new_baby",
    emoji: "\uD83D\uDC76",
    label: "New Baby",
    description: "Welcome a newborn",
    defaultTitle: "Welcome to the World!",
    defaultSubtitle: "Join us in celebrating this new life",
    color: "#EC4899",
    bgColor: "#FDF2F8",
  },
  {
    key: "wedding",
    emoji: "\uD83D\uDC92",
    label: "Wedding",
    description: "Celebrate a union",
    defaultTitle: "Just Married!",
    defaultSubtitle: "Celebrate this beautiful union with us",
    color: "#E11D48",
    bgColor: "#FFF1F2",
  },
  {
    key: "event",
    emoji: "\uD83D\uDCC5",
    label: "Event",
    description: "Invite to an event",
    defaultTitle: "You're Invited!",
    defaultSubtitle: "Join us for a special gathering",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    key: "flowers",
    emoji: "\uD83C\uDF38",
    label: "Give Flowers",
    description: "Appreciation campaign",
    defaultTitle: "Give Them Their Flowers",
    defaultSubtitle: "Let's show some love and appreciation",
    color: "#E11D48",
    bgColor: "#FFF1F2",
  },
  {
    key: "milestone",
    emoji: "\uD83C\uDFC6",
    label: "Turning Point",
    description: "Celebrate an achievement",
    defaultTitle: "What a Turning Point!",
    defaultSubtitle: "Come celebrate this incredible achievement",
    color: "#D97706",
    bgColor: "#FFFBEB",
  },
  {
    key: "graduation",
    emoji: "\uD83C\uDF93",
    label: "Graduation",
    description: "Honor a graduate",
    defaultTitle: "Congratulations, Graduate!",
    defaultSubtitle: "Celebrate this incredible accomplishment",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
  },
  {
    key: "retirement",
    emoji: "\uD83C\uDF05",
    label: "Retirement",
    description: "Celebrate a new chapter",
    defaultTitle: "Happy Retirement!",
    defaultSubtitle: "Cheers to a wonderful career and new beginnings",
    color: "#059669",
    bgColor: "#ECFDF5",
  },
  {
    key: "custom",
    emoji: "\u2728",
    label: "Custom",
    description: "Create your own",
    defaultTitle: "Something Special",
    defaultSubtitle: "A message from the heart",
    color: "#374151",
    bgColor: "#F9FAFB",
  },
];

// ── Template Styles ─────────────────────────────────────────────────

type TemplateStyle = {
  key: "standard" | "photo_overlay" | "minimal" | "celebration";
  label: string;
  bgColor: string;
  textColor: string;
  isPremium?: boolean;
};

const TEMPLATE_STYLES: TemplateStyle[] = [
  { key: "celebration", label: "Celebration", bgColor: "#4A2D7A", textColor: "#FFFFFF" },
  { key: "standard", label: "Classic", bgColor: "#4A2D7A", textColor: "#FFFFFF" },
  { key: "photo_overlay", label: "Photo Card", bgColor: "#1F2937", textColor: "#FFFFFF" },
  { key: "minimal", label: "Minimal", bgColor: "#FFFFFF", textColor: "#1F2937" },
  { key: "celebration", label: "Gold", bgColor: "#78350F", textColor: "#FEF3C7", isPremium: true },
  { key: "standard", label: "Rose", bgColor: "#831843", textColor: "#FCE7F3", isPremium: true },
  { key: "minimal", label: "Ocean", bgColor: "#0C4A6E", textColor: "#E0F2FE", isPremium: true },
];

// ── Component ───────────────────────────────────────────────────────

export default function AnnounceScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { profile, isAuthenticated } = useAuth();
  const { tier, hasFeature, plans } = usePremium();
  const { purchase, isPurchasing } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(false);
  // Form state
  const [selectedType, setSelectedType] = useState<string>("birthday");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  // Derive current type config
  const currentType = useMemo(
    () => ANNOUNCEMENT_TYPES.find((t) => t.key === selectedType) ?? ANNOUNCEMENT_TYPES[0],
    [selectedType]
  );

  const currentTemplate = TEMPLATE_STYLES[selectedTemplate];

  // Build preview strings
  const previewTitle = title || (personName ? `${currentType.defaultTitle.replace("!", "")} ${personName}!` : currentType.defaultTitle);
  const previewSubtitle = subtitle || (eventDate ? `${currentType.defaultSubtitle} • ${eventDate}` : currentType.defaultSubtitle);

  const handleShare = async () => {
    try {
      const shareMessage = `${previewTitle}\n\n${previewSubtitle}\n\nJoin us on ǝterrn — honor the people who matter.\nhttps://eterrn.app`;
      await Share.share({
        message: shareMessage,
        title: previewTitle,
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(`https://eterrn.app`);
      Alert.alert("Copied!", "Link copied to clipboard.");
    } catch {
      // Clipboard not available
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={goBack} className="h-10 w-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View className="items-center">
            <EternLogo width={960} variant="full" />
          </View>
          <View className="w-10" />
        </View>
        <Text className="text-white text-center text-lg font-sans-bold">Create & Share</Text>
        <Text className="text-white/70 text-center text-xs font-sans mt-1">
          Beautiful cards to share with friends, family & social media
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Step 1: Pick Announcement Type ── */}
        <View className="px-4 pt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">
            What are you celebrating?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pb-1">
              {ANNOUNCEMENT_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  className={`rounded-2xl px-4 py-3 items-center border-2 ${
                    selectedType === type.key
                      ? "border-brand-700"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: selectedType === type.key ? type.bgColor : "#F3F4F6",
                    minWidth: 90,
                  }}
                  onPress={() => {
                    setSelectedType(type.key);
                    setTitle("");
                    setSubtitle("");
                  }}
                >
                  <Text className="text-2xl mb-1">{type.emoji}</Text>
                  <Text
                    className="text-xs font-sans-semibold text-center"
                    style={{ color: selectedType === type.key ? type.color : "#1F2937" }}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Step 2: Fill In Details ── */}
        <View className="px-4 pt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">
            Personalize your card
          </Text>

          {/* Person Name */}
          <View className="mb-3">
            <Text className="text-xs font-sans-medium text-gray-500 mb-1">Who is this for?</Text>
            <TextInput
              className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Enter name (optional)"
              placeholderTextColor="#9CA3AF"
              value={personName}
              onChangeText={setPersonName}
            />
          </View>

          {/* Custom Title */}
          <View className="mb-3">
            <Text className="text-xs font-sans-medium text-gray-500 mb-1">Card Title</Text>
            <TextInput
              className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder={currentType.defaultTitle}
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Custom Subtitle / Message */}
          <View className="mb-3">
            <Text className="text-xs font-sans-medium text-gray-500 mb-1">Message</Text>
            <TextInput
              className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder={currentType.defaultSubtitle}
              placeholderTextColor="#9CA3AF"
              value={subtitle}
              onChangeText={setSubtitle}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56 }}
            />
          </View>

          {/* Event Date */}
          <DatePickerField
            label="Date (optional)"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Select a date"
            optional
            minimumDate={new Date()}
            quickOptions={[
              { label: "Today", value: new Date().toISOString().split("T")[0] },
              { label: "Tomorrow", value: new Date(Date.now() + 86400000).toISOString().split("T")[0] },
              { label: "This Weekend", value: (() => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay())); return d.toISOString().split("T")[0]; })() },
              { label: "Next Week", value: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] },
            ]}
          />
        </View>

        {/* ── Step 3: Pick Template Style ── */}
        <View className="px-4 pt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">
            Choose a style
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pb-1">
              {TEMPLATE_STYLES.map((template, index) => (
                <Pressable
                  key={`${template.key}-${index}`}
                  className={`rounded-xl overflow-hidden border-2 ${
                    selectedTemplate === index ? "border-brand-700" : "border-transparent"
                  }`}
                  onPress={() => {
                    if (template.isPremium && !hasFeature("premium_templates")) {
                      setShowPaywall(true);
                      return;
                    }
                    setSelectedTemplate(index);
                  }}
                >
                  <View
                    className="w-20 h-24 items-center justify-center rounded-xl"
                    style={{ backgroundColor: template.bgColor }}
                  >
                    {template.isPremium && (
                      <View className="absolute top-1 right-1">
                        <Ionicons name="lock-closed" size={10} color={template.textColor} />
                      </View>
                    )}
                    <View className="h-3 w-10 rounded-full mb-1" style={{ backgroundColor: template.textColor, opacity: 0.6 }} />
                    <View className="h-2 w-8 rounded-full" style={{ backgroundColor: template.textColor, opacity: 0.3 }} />
                  </View>
                  <Text className="text-[10px] font-sans-medium text-gray-600 dark:text-gray-400 text-center mt-1.5 mb-1">
                    {template.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Step 4: Live Preview ── */}
        <View className="pt-5">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3 px-4">
            Preview
          </Text>
          <ShareCardPreview
            title={previewTitle}
            subtitle={previewSubtitle}
            templateLayout={currentTemplate.key}
            backgroundColor={currentTemplate.bgColor}
            textColor={currentTemplate.textColor}
          />
        </View>

        {/* ── Step 5: Share Actions ── */}
        <View className="px-4 pt-4">
          {/* Primary Share Button */}
          <Pressable
            className="flex-row items-center justify-center rounded-2xl bg-brand-700 py-4 mb-3"
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text className="ml-2 text-base font-sans-bold text-white">Share Card</Text>
          </Pressable>

          {/* Quick Share Row */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 py-3"
              onPress={() => {
                handleShare();
              }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text className="ml-2 text-xs font-sans-semibold text-green-700">WhatsApp</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 py-3"
              onPress={() => {
                handleShare();
              }}
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text className="ml-2 text-xs font-sans-semibold text-blue-700">Facebook</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-900/20 py-3"
              onPress={() => {
                handleShare();
              }}
            >
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              <Text className="ml-2 text-xs font-sans-semibold text-pink-700">Stories</Text>
            </Pressable>
          </View>

          {/* Copy Link */}
          <Pressable
            className="flex-row items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 py-3 mb-3"
            onPress={handleCopyLink}
          >
            <Ionicons name="link-outline" size={18} color="#4A2D7A" />
            <Text className="ml-2 text-sm font-sans-medium text-brand-700">Copy Link</Text>
          </Pressable>

          {/* Invite to ǝterrn CTA */}
          {isAuthenticated && (
            <Pressable
              className="flex-row items-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4 mb-2"
              onPress={() => router.push("/invite" as any)}
            >
              <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center mr-3">
                <Ionicons name="person-add" size={20} color="#4A2D7A" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Invite Friends to ǝterrn
                </Text>
                <Text className="text-xs font-sans text-gray-500 mt-0.5">
                  Send personalized invite links with tracking
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureLabel="Premium Templates"
        featureDescription="Unlock Gold, Rose, Ocean and more exclusive card designs"
        onSelectPlan={async (planSlug, billingPeriod) => {
          const plan = plans.find((p) => p.slug === planSlug);
          if (!plan) return;
          const result = await purchase(plan, billingPeriod);
          if (result.success) {
            setShowPaywall(false);
            Alert.alert("Welcome!", `You now have access to premium templates! 🎉`);
          }
        }}
        currentTier={tier}
        isLoading={isPurchasing}
      />
    </View>
  );
}
