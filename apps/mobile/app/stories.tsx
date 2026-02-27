import { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Pressable,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
  Share,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";
import { useTrendingTributes } from "@foreverr/core";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Sample memorial story data ───────────────────────────────────────────────

interface StoryData {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number;
  title: string;
  relationship: string;
  tributeText: string;
  accentColor: string;
  accentLight: string;
  iconName: keyof typeof Ionicons.glyphMap;
  hearts: number;
  comments: number;
  shares: number;
  candles: number;
  contributorName: string;
  contributorHandle: string;
}

const CELEBRITY_STORIES: StoryData[] = [
  {
    id: "1",
    name: "Kobe Bryant",
    birthYear: 1978,
    deathYear: 2020,
    title: "Basketball Legend",
    relationship: "Beloved by millions",
    tributeText:
      "\"Everything negative \u2014 pressure, challenges \u2014 is all an opportunity for me to rise.\" The Mamba Mentality wasn't just about basketball. It was a way of life. Kobe taught us that greatness is earned through relentless dedication, and his legacy continues to inspire every dreamer who refuses to quit.",
    accentColor: "#6D28D9",
    accentLight: "#A78BFA",
    iconName: "basketball-outline",
    hearts: 284300,
    comments: 42100,
    shares: 18900,
    candles: 156200,
    contributorName: "Vanessa Bryant",
    contributorHandle: "@vanessabryant",
  },
  {
    id: "2",
    name: "Nipsey Hussle",
    birthYear: 1985,
    deathYear: 2019,
    title: "Community Leader & Artist",
    relationship: "The Marathon Continues",
    tributeText:
      "\"The game is gonna test you never fold. Stay ten toes down.\" Nipsey showed us that real success means lifting your community with you. From Slauson to the world, his vision for economic empowerment and cultural pride lives on in every block, every business, every dream he planted.",
    accentColor: "#0891B2",
    accentLight: "#67E8F9",
    iconName: "mic-outline",
    hearts: 198700,
    comments: 31400,
    shares: 22300,
    candles: 112800,
    contributorName: "Lauren London",
    contributorHandle: "@laurenlondon",
  },
  {
    id: "3",
    name: "Princess Diana",
    birthYear: 1961,
    deathYear: 1997,
    title: "The People's Princess",
    relationship: "Legacy of compassion",
    tributeText:
      "\"Carry out a random act of kindness, with no expectation of reward, safe in the knowledge that one day someone might do the same for you.\" Diana broke barriers with her warmth and humanity. She held the hands of those the world had forgotten and reminded us that royalty is measured by the size of one's heart.",
    accentColor: "#DB2777",
    accentLight: "#F9A8D4",
    iconName: "heart-outline",
    hearts: 412500,
    comments: 67800,
    shares: 45200,
    candles: 289300,
    contributorName: "Prince William",
    contributorHandle: "@kensingtonroyal",
  },
  {
    id: "4",
    name: "Robin Williams",
    birthYear: 1951,
    deathYear: 2014,
    title: "Bringer of Laughter",
    relationship: "Left lasting joy",
    tributeText:
      "\"You're only given a little spark of madness. You mustn't lose it.\" Robin could make you laugh until you cried, and then make you cry with the depth of his soul. He wore a thousand faces to bring the world joy, and in doing so, became the most beloved entertainer of his generation.",
    accentColor: "#2563EB",
    accentLight: "#93C5FD",
    iconName: "happy-outline",
    hearts: 356100,
    comments: 54200,
    shares: 38700,
    candles: 201400,
    contributorName: "Zelda Williams",
    contributorHandle: "@zfrail",
  },
  {
    id: "5",
    name: "Chadwick Boseman",
    birthYear: 1976,
    deathYear: 2020,
    title: "Wakanda Forever",
    relationship: "Quiet strength personified",
    tributeText:
      "\"The only difference between a hero and the villain is that the villain chooses to use that power in a way that is selfish and hurts other people.\" Chadwick fought his battle in silence while giving the world a king. His portrayal became a cultural movement, and his courage off-screen surpassed any heroism on it.",
    accentColor: "#7C3AED",
    accentLight: "#C4B5FD",
    iconName: "shield-outline",
    hearts: 267800,
    comments: 39600,
    shares: 28400,
    candles: 178900,
    contributorName: "Ryan Coogler",
    contributorHandle: "@ryancoogler",
  },
  {
    id: "6",
    name: "Betty White",
    birthYear: 1922,
    deathYear: 2021,
    title: "America's Golden Girl",
    relationship: "A life well lived",
    tributeText:
      "\"I just make it my business to get along with people so I can have fun. It's that simple.\" Nearly a century of laughter, grace, and an unwavering love for animals. Betty White proved that joy is ageless and that kindness never goes out of style. She lived her life as an example that the best is always yet to come.",
    accentColor: "#D97706",
    accentLight: "#FCD34D",
    iconName: "sunny-outline",
    hearts: 389200,
    comments: 58100,
    shares: 41600,
    candles: 234500,
    contributorName: "Jeff Witjas",
    contributorHandle: "@bettyslegacy",
  },
  {
    id: "7",
    name: "Muhammad Ali",
    birthYear: 1942,
    deathYear: 2016,
    title: "The Greatest of All Time",
    relationship: "Float like a butterfly",
    tributeText:
      "\"I am the greatest, I said that even before I knew I was.\" Ali didn't just fight in the ring \u2014 he fought for justice, for peace, for the right to stand by his beliefs. His fists changed boxing, but his words changed the world. He remains the standard by which all champions are measured.",
    accentColor: "#DC2626",
    accentLight: "#FCA5A5",
    iconName: "fitness-outline",
    hearts: 312400,
    comments: 47300,
    shares: 35800,
    candles: 198600,
    contributorName: "Laila Ali",
    contributorHandle: "@lailaali",
  },
  {
    id: "8",
    name: "Selena Quintanilla",
    birthYear: 1971,
    deathYear: 1995,
    title: "Queen of Tejano Music",
    relationship: "Forever in music",
    tributeText:
      "\"If you have a dream, don't let anybody take it away.\" Selena shattered barriers and united cultures through the universal language of music. Her voice carried the hopes of a community, and her spirit ignited a fire that still burns in every young Latina who dares to dream beyond boundaries.",
    accentColor: "#9333EA",
    accentLight: "#D8B4FE",
    iconName: "musical-notes-outline",
    hearts: 276500,
    comments: 41800,
    shares: 29700,
    candles: 167400,
    contributorName: "Chris Perez",
    contributorHandle: "@chrispereznow",
  },
];

// ─── Accent color rotation for real tributes ─────────────────────────────────

const ACCENT_COLORS = CELEBRITY_STORIES.map((s) => ({
  accentColor: s.accentColor,
  accentLight: s.accentLight,
}));

// ─── Map tribute_type to Ionicon name ────────────────────────────────────────

function tributeTypeIcon(
  tributeType: string | null | undefined
): keyof typeof Ionicons.glyphMap {
  switch (tributeType) {
    case "text":
      return "book-outline";
    case "candle":
      return "flame-outline";
    case "flower":
      return "flower-outline";
    default:
      return "heart-outline";
  }
}

// ─── Convert real tributes to StoryData ──────────────────────────────────────

function mapTributeToStory(tribute: any, index: number): StoryData {
  const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const memorial = tribute.memorial;
  const user = tribute.user;

  const birthYear = memorial?.date_of_birth
    ? new Date(memorial.date_of_birth).getFullYear()
    : 0;
  const deathYear = memorial?.date_of_death
    ? new Date(memorial.date_of_death).getFullYear()
    : 0;

  return {
    id: `tribute-${tribute.id}`,
    name: `${memorial?.first_name ?? ""} ${memorial?.last_name ?? ""}`.trim() || "Unknown",
    birthYear,
    deathYear,
    title: "Memorial Tribute",
    relationship: "Community Tribute",
    tributeText: tribute.content ?? "",
    accentColor: colors.accentColor,
    accentLight: colors.accentLight,
    iconName: tributeTypeIcon(tribute.tribute_type),
    hearts: tribute.reaction_count ?? 0,
    comments: 0,
    shares: 0,
    candles: 0,
    contributorName: user?.display_name ?? "Anonymous",
    contributorHandle: user?.username ? `@${user.username}` : "@anonymous",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Gradient overlay using stacked View layers (no expo-linear-gradient) ────

function GradientOverlay({
  position,
  height,
}: {
  position: "top" | "bottom";
  height: number;
}) {
  const BASE = "rgba(26,15,46,";
  const layers =
    position === "top"
      ? [
          { opacity: 0.95, flex: 1 },
          { opacity: 0.8, flex: 1 },
          { opacity: 0.6, flex: 1 },
          { opacity: 0.35, flex: 1 },
          { opacity: 0.15, flex: 1 },
          { opacity: 0.05, flex: 1 },
          { opacity: 0, flex: 1 },
        ]
      : [
          { opacity: 0, flex: 1 },
          { opacity: 0.05, flex: 1 },
          { opacity: 0.15, flex: 1 },
          { opacity: 0.35, flex: 1 },
          { opacity: 0.55, flex: 1 },
          { opacity: 0.75, flex: 1 },
          { opacity: 0.9, flex: 1 },
          { opacity: 0.98, flex: 1 },
        ];

  return (
    <View
      style={{
        position: "absolute",
        [position === "top" ? "top" : "bottom"]: 0,
        left: 0,
        right: 0,
        height,
        zIndex: 1,
      }}
      pointerEvents="none"
    >
      {layers.map((layer, i) => (
        <View
          key={i}
          style={{
            flex: layer.flex,
            backgroundColor: `${BASE}${layer.opacity})`,
          }}
        />
      ))}
    </View>
  );
}

// ─── Engagement Button ────────────────────────────────────────────────────────

function EngagementButton({
  icon,
  count,
  color = "white",
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center mb-5">
      <View className="h-12 w-12 rounded-full bg-white/10 items-center justify-center mb-1">
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text className="text-white text-xs font-sans-semibold">
        {formatCount(count)}
      </Text>
    </Pressable>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <View className="flex-row items-center justify-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`rounded-full ${
            i === current ? "w-6 h-1.5" : "w-1.5 h-1.5"
          }`}
          style={{
            backgroundColor:
              i === current ? "white" : "rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </View>
  );
}

// ─── Story Card ───────────────────────────────────────────────────────────────

function StoryCard({
  story,
  isActive,
}: {
  story: StoryData;
  isActive: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [candleLit, setCandleLit] = useState(false);

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* ── Background layer ── */}
      <View style={StyleSheet.absoluteFill} className="bg-[#1A0F2E]">
        {/* Decorative accent circles */}
        <View
          style={[
            styles.accentCircle,
            {
              backgroundColor: story.accentColor,
              top: -80,
              right: -60,
              opacity: 0.08,
            },
          ]}
        />
        <View
          style={[
            styles.accentCircleSmall,
            {
              backgroundColor: story.accentLight,
              bottom: 200,
              left: -40,
              opacity: 0.06,
            },
          ]}
        />
        <View
          style={[
            styles.accentCircleMedium,
            {
              backgroundColor: story.accentColor,
              top: SCREEN_HEIGHT * 0.35,
              right: -100,
              opacity: 0.05,
            },
          ]}
        />

        {/* Subtle vertical line accent */}
        <View
          style={{
            position: "absolute",
            left: 32,
            top: SCREEN_HEIGHT * 0.15,
            bottom: SCREEN_HEIGHT * 0.35,
            width: 1,
            backgroundColor: story.accentLight,
            opacity: 0.12,
          }}
        />
      </View>

      {/* ── Gradient overlays for text legibility ── */}
      <GradientOverlay position="top" height={SCREEN_HEIGHT * 0.25} />
      <GradientOverlay position="bottom" height={SCREEN_HEIGHT * 0.55} />

      {/* ── Center memorial icon ── */}
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingBottom: 80, zIndex: 2 }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={[
            styles.centralIcon,
            {
              backgroundColor: `${story.accentColor}18`,
              borderColor: `${story.accentColor}40`,
            },
          ]}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 80,
              height: 80,
              backgroundColor: `${story.accentColor}25`,
            }}
          >
            <Ionicons
              name={story.iconName}
              size={40}
              color={story.accentLight}
            />
          </View>
        </View>

        {/* Name and dates under the icon */}
        <Text className="text-white text-2xl font-sans-bold mt-6 text-center">
          {story.name}
        </Text>
        <Text className="text-white/50 text-sm font-sans mt-1 text-center">
          {story.birthYear} {"\u2014"} {story.deathYear}
        </Text>
        <View
          className="mt-3 px-4 py-1.5 rounded-full"
          style={{ backgroundColor: `${story.accentColor}20` }}
        >
          <Text
            style={{ color: story.accentLight }}
            className="text-xs font-sans-semibold"
          >
            {story.title}
          </Text>
        </View>
      </View>

      {/* ── Right engagement sidebar (TikTok-style) ── */}
      <View style={styles.engagementSidebar}>
        {/* Profile avatar */}
        <Pressable
          className="items-center mb-6"
          onPress={() => Alert.alert("Profile", `View ${story.contributorName}'s profile`)}
        >
          <View
            className="h-12 w-12 rounded-full items-center justify-center border-2"
            style={{
              borderColor: story.accentLight,
              backgroundColor: `${story.accentColor}30`,
            }}
          >
            <Ionicons name="person" size={22} color={story.accentLight} />
          </View>
          <View
            className="h-5 w-5 rounded-full items-center justify-center -mt-2.5"
            style={{ backgroundColor: story.accentColor }}
          >
            <Ionicons name="add" size={14} color="white" />
          </View>
        </Pressable>

        <EngagementButton
          icon={liked ? "heart" : "heart-outline"}
          count={story.hearts + (liked ? 1 : 0)}
          color={liked ? "#F43F5E" : "white"}
          onPress={() => setLiked(!liked)}
        />
        <EngagementButton
          icon="chatbubble-outline"
          count={story.comments}
          onPress={() => Alert.alert("Comments", "Comments for stories coming soon!")}
        />
        <EngagementButton
          icon="share-social-outline"
          count={story.shares}
          onPress={async () => {
            try {
              await Share.share({
                message: `Remembering ${story.name} (${story.birthYear}–${story.deathYear}) — "${story.tributeText.slice(0, 100)}..." via Foreverr`,
              });
            } catch {}
          }}
        />
        <EngagementButton
          icon={candleLit ? "flame" : "flame-outline"}
          count={story.candles + (candleLit ? 1 : 0)}
          color={candleLit ? "#FBBF24" : "white"}
          onPress={() => setCandleLit(!candleLit)}
        />
        <Pressable
          className="items-center mt-1"
          onPress={() => Alert.alert("More Options", "Report, save, or copy link", [
            { text: "Cancel", style: "cancel" },
            { text: "Copy Link", onPress: () => {} },
          ])}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="rgba(255,255,255,0.6)"
          />
        </Pressable>
      </View>

      {/* ── Bottom content section ── */}
      <View style={styles.bottomContent}>
        {/* Contributor line */}
        <View className="flex-row items-center mb-2.5">
          <View
            className="h-8 w-8 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: `${story.accentColor}30` }}
          >
            <Ionicons name="person" size={14} color={story.accentLight} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-sans-bold">
              {story.contributorName}
            </Text>
            <Text className="text-white/40 text-xs font-sans">
              {story.contributorHandle}
            </Text>
          </View>
          <Pressable
            className="rounded-full px-4 py-1.5 border"
            style={{ borderColor: story.accentLight }}
            onPress={() => Alert.alert("Follow", `Follow ${story.contributorName} to see more tributes!`)}
          >
            <Text
              style={{ color: story.accentLight }}
              className="text-xs font-sans-semibold"
            >
              Follow
            </Text>
          </Pressable>
        </View>

        {/* Tribute text */}
        <Text
          className="text-white/90 text-sm font-sans leading-5"
          numberOfLines={4}
        >
          {story.tributeText}
        </Text>

        {/* Relationship badge & label */}
        <View className="flex-row items-center mt-3">
          <Ionicons
            name="flower-outline"
            size={14}
            color="rgba(255,255,255,0.4)"
          />
          <Text className="text-white/40 text-xs font-sans ml-1.5">
            {story.relationship}
          </Text>
          <Text className="text-white/20 mx-2">|</Text>
          <Ionicons
            name="time-outline"
            size={13}
            color="rgba(255,255,255,0.4)"
          />
          <Text className="text-white/40 text-xs font-sans ml-1">
            Memorial Tribute
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Stories Screen ──────────────────────────────────────────────────────

export default function StoriesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: realTributes, isLoading } = useTrendingTributes(20);

  // Build the combined story list: real tributes first, then celebrity fallback
  const stories: StoryData[] = useMemo(() => {
    const realStories = (realTributes ?? []).map(mapTributeToStory);
    return [...realStories, ...CELEBRITY_STORIES];
  }, [realTributes]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: StoryData; index: number }) => (
      <StoryCard story={item} isActive={index === currentIndex} />
    ),
    [currentIndex]
  );

  // Show a brief loading indicator while fetching real tributes
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1A0F2E] items-center justify-center">
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1A0F2E]">
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* ── Floating top bar ── */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-white text-base font-sans-bold">
            Memorial Stories
          </Text>
          <ProgressDots total={stories.length} current={currentIndex} />
        </View>

        <Pressable
          onPress={() => router.push("/memorial/create/basic-info")}
          className="h-10 w-10 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="camera-outline" size={22} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  engagementSidebar: {
    position: "absolute",
    right: 12,
    bottom: SCREEN_HEIGHT * 0.22,
    alignItems: "center",
    zIndex: 5,
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 70,
    paddingHorizontal: 16,
    paddingBottom: 40,
    zIndex: 5,
  },
  accentCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  accentCircleSmall: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  accentCircleMedium: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  centralIcon: {
    width: 120,
    height: 120,
    borderWidth: 1,
  },
});
