import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  TextInput,
  Text as RNText,
  Animated as RNAnimated,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  EternLogo,
  CandleAnimation,
  HeartAnimation,
  DoveAnimation,
  BalloonAnimation,
  FlowerAnimation,
  CheersAnimation,
  getLifecycleConfig,
  MEMORIAL_REACTIONS,
  CELEBRATION_REACTIONS,
  ReactionBar,
  ExpandableText,
  AIRewriteButton,
  AmbientReactions,
  SocialProofToast,
  ViewerCountBadge,
  EngagementPrompt,
} from "@foreverr/ui";
import type { ReactionDef } from "@foreverr/ui";
import {
  useTrendingTributes,
  useAuth,
  useUserLocation,
  useRequireAuth,
  useToggleReaction,
  useToggleFollow,
  useIsFollowing,
  useCreateTribute,
  useTributes,
  useAIRewrite,
  heavyTap,
  mediumTap,
  lightTap,
  successHaptic,
} from "@foreverr/core";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── UUID regex for detecting real DB IDs vs static IDs ─────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Extended story data model ──────────────────────────────────────────────

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
  doves: number;
  balloons: number;
  cheers: number;
  flowers: number;
  gifts: number;
  contributorName: string;
  contributorHandle: string;
  coverImageUrl?: string | null;
  // Mode awareness
  lifecycleStage?: string | null;
  memorialId?: string | null;
  tributeId?: string | null;
  // Contributor info for follow/profile
  contributorUserId?: string | null;
}

// ─── Sample memorial story data (with full-screen images) ───────────────────

const CELEBRITY_STORIES: StoryData[] = [
  {
    id: "1",
    name: "Kobe Bryant",
    birthYear: 1978,
    deathYear: 2020,
    title: "Basketball Legend",
    relationship: "Beloved by millions",
    tributeText:
      "The Mamba Mentality wasn't just about basketball. It was a way of life. Kobe taught us that greatness is earned through relentless dedication, and his legacy continues to inspire every dreamer who refuses to quit.",
    accentColor: "#6D28D9",
    accentLight: "#A78BFA",
    iconName: "basketball-outline",
    hearts: 284300,
    comments: 42100,
    shares: 18900,
    candles: 156200,
    doves: 89400,
    balloons: 67200,
    cheers: 0,
    flowers: 45100,
    gifts: 0,
    contributorName: "Vanessa Bryant",
    contributorHandle: "@vanessabryant",
    lifecycleStage: "remember",
    memorialId: "c0000002-0000-0000-0000-000000000002",
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=1200&h=1800&fit=crop",
  },
  {
    id: "2",
    name: "Nipsey Hussle",
    birthYear: 1985,
    deathYear: 2019,
    title: "Community Leader & Artist",
    relationship: "The Marathon Continues",
    tributeText:
      "Nipsey showed us that real success means lifting your community with you. From Slauson to the world, his vision for economic empowerment and cultural pride lives on in every block, every business, every dream he planted.",
    accentColor: "#0891B2",
    accentLight: "#67E8F9",
    iconName: "mic-outline",
    hearts: 198700,
    comments: 31400,
    shares: 22300,
    candles: 112800,
    doves: 56300,
    balloons: 41200,
    cheers: 0,
    flowers: 33800,
    gifts: 0,
    contributorName: "Lauren London",
    contributorHandle: "@laurenlondon",
    lifecycleStage: "remember",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=1800&fit=crop",
  },
  {
    id: "3",
    name: "Princess Diana",
    birthYear: 1961,
    deathYear: 1997,
    title: "The People's Princess",
    relationship: "Legacy of compassion",
    tributeText:
      "Diana broke barriers with her warmth and humanity. She held the hands of those the world had forgotten and reminded us that royalty is measured by the size of one's heart.",
    accentColor: "#DB2777",
    accentLight: "#F9A8D4",
    iconName: "heart-outline",
    hearts: 412500,
    comments: 67800,
    shares: 45200,
    candles: 289300,
    doves: 134500,
    balloons: 78900,
    cheers: 0,
    flowers: 98200,
    gifts: 0,
    contributorName: "Prince William",
    contributorHandle: "@kensingtonroyal",
    lifecycleStage: "remember",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=1800&fit=crop",
  },
  {
    id: "4",
    name: "Robin Williams",
    birthYear: 1951,
    deathYear: 2014,
    title: "Bringer of Laughter",
    relationship: "Left lasting joy",
    tributeText:
      "Robin could make you laugh until you cried, and then make you cry with the depth of his soul. He wore a thousand faces to bring the world joy, and in doing so, became the most beloved entertainer of his generation.",
    accentColor: "#2563EB",
    accentLight: "#93C5FD",
    iconName: "happy-outline",
    hearts: 356100,
    comments: 54200,
    shares: 38700,
    candles: 201400,
    doves: 98700,
    balloons: 61300,
    cheers: 0,
    flowers: 72400,
    gifts: 0,
    contributorName: "Zelda Williams",
    contributorHandle: "@zfrail",
    lifecycleStage: "remember",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1517242027094-631f188b4909?w=1200&h=1800&fit=crop",
  },
  {
    id: "5",
    name: "Chadwick Boseman",
    birthYear: 1976,
    deathYear: 2020,
    title: "Wakanda Forever",
    relationship: "Quiet strength personified",
    tributeText:
      "Chadwick fought his battle in silence while giving the world a king. His portrayal became a cultural movement, and his courage off-screen surpassed any heroism on it.",
    accentColor: "#7C3AED",
    accentLight: "#C4B5FD",
    iconName: "shield-outline",
    hearts: 267800,
    comments: 39600,
    shares: 28400,
    candles: 178900,
    doves: 82300,
    balloons: 53700,
    cheers: 0,
    flowers: 61200,
    gifts: 0,
    contributorName: "Ryan Coogler",
    contributorHandle: "@ryancoogler",
    lifecycleStage: "remember",
    memorialId: "c0000001-0000-0000-0000-000000000001",
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=1800&fit=crop",
  },
  {
    id: "6",
    name: "Betty White",
    birthYear: 1922,
    deathYear: 2021,
    title: "America's Golden Girl",
    relationship: "A life well lived",
    tributeText:
      "Nearly a century of laughter, grace, and an unwavering love for animals. Betty White proved that joy is ageless and that kindness never goes out of style. She lived her life as an example that the best is always yet to come.",
    accentColor: "#D97706",
    accentLight: "#FCD34D",
    iconName: "sunny-outline",
    hearts: 389200,
    comments: 58100,
    shares: 41600,
    candles: 234500,
    doves: 112800,
    balloons: 89600,
    cheers: 0,
    flowers: 76300,
    gifts: 0,
    contributorName: "Jeff Witjas",
    contributorHandle: "@bettyslegacy",
    lifecycleStage: "remember",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=1800&fit=crop",
  },
  // ─── Celebration mode stories (living people) ──────────────────────
  {
    id: "celeb-9",
    name: "Beyonce",
    birthYear: 1981,
    deathYear: 0,
    title: "Queen of Music",
    relationship: "Living Icon",
    tributeText:
      "From Destiny's Child to global icon, Beyonce continues to redefine artistry, empowerment, and cultural impact. Her work transcends music \u2014 it's a movement that inspires millions to embrace their power.",
    accentColor: "#D97706",
    accentLight: "#FCD34D",
    iconName: "musical-notes-outline",
    hearts: 521000,
    comments: 89400,
    shares: 67200,
    candles: 0,
    doves: 0,
    balloons: 312000,
    cheers: 445000,
    flowers: 198000,
    gifts: 156000,
    contributorName: "BeyHive Community",
    contributorHandle: "@beyhive",
    lifecycleStage: "celebrate",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1800&fit=crop",
  },
  {
    id: "celeb-10",
    name: "LeBron James",
    birthYear: 1984,
    deathYear: 0,
    title: "The King",
    relationship: "Living Legend",
    tributeText:
      "More than basketball \u2014 LeBron has built schools, empowered communities, and shown that greatness extends far beyond the court. His I PROMISE School in Akron is changing lives daily.",
    accentColor: "#7C3AED",
    accentLight: "#C4B5FD",
    iconName: "basketball-outline",
    hearts: 478000,
    comments: 76300,
    shares: 54100,
    candles: 0,
    doves: 0,
    balloons: 289000,
    cheers: 398000,
    flowers: 167000,
    gifts: 134000,
    contributorName: "Lakers Nation",
    contributorHandle: "@lakersnation",
    lifecycleStage: "celebrate",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=1800&fit=crop",
  },
  {
    id: "celeb-11",
    name: "Dolly Parton",
    birthYear: 1946,
    deathYear: 0,
    title: "National Treasure",
    relationship: "Living Legend",
    tributeText:
      "Dolly has given millions to literacy programs, donated $1M to COVID vaccine research, and continues to spread joy through music and generosity. A true embodiment of grace and giving.",
    accentColor: "#EC4899",
    accentLight: "#F9A8D4",
    iconName: "sparkles-outline",
    hearts: 445000,
    comments: 67800,
    shares: 48900,
    candles: 0,
    doves: 0,
    balloons: 267000,
    cheers: 378000,
    flowers: 289000,
    gifts: 198000,
    contributorName: "Dollywood Foundation",
    contributorHandle: "@dollywood",
    lifecycleStage: "celebrate",
    memorialId: null,
    tributeId: null,
    contributorUserId: null,
    coverImageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=1800&fit=crop",
  },
];

// ─── Accent color rotation for real tributes ────────────────────────────────

const ACCENT_COLORS = CELEBRITY_STORIES.map((s) => ({
  accentColor: s.accentColor,
  accentLight: s.accentLight,
}));

// ─── Map tribute_type to Ionicon name ───────────────────────────────────────

function tributeTypeIcon(
  tributeType: string | null | undefined
): keyof typeof Ionicons.glyphMap {
  switch (tributeType) {
    case "text": return "book-outline";
    case "candle": return "flame-outline";
    case "flower": return "flower-outline";
    default: return "heart-outline";
  }
}

// ─── Convert real tributes to StoryData ─────────────────────────────────────

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

  const lifecycleStage =
    memorial?.lifecycle_stage ?? (deathYear > 0 ? "remember" : "celebrate");

  return {
    id: `tribute-${tribute.id}`,
    name: `${memorial?.first_name ?? ""} ${memorial?.last_name ?? ""}`.trim() || "Unknown",
    birthYear,
    deathYear,
    title: lifecycleStage === "celebrate" ? "Living Celebration" : "Memorial Tribute",
    relationship: "Community Tribute",
    tributeText: tribute.content ?? "",
    accentColor: colors.accentColor,
    accentLight: colors.accentLight,
    iconName: tributeTypeIcon(tribute.type),
    hearts: tribute.like_count ?? 0,
    comments: 0,
    shares: 0,
    candles: 0,
    doves: 0,
    balloons: 0,
    cheers: 0,
    flowers: 0,
    gifts: 0,
    contributorName: user?.display_name ?? "Anonymous",
    contributorHandle: user?.username ? `@${user.username}` : "@anonymous",
    coverImageUrl: memorial?.cover_photo_url ?? memorial?.profile_photo_url ?? null,
    lifecycleStage,
    memorialId: memorial?.id ?? null,
    tributeId: tribute.id ?? null,
    contributorUserId: user?.id ?? null,
  };
}

// ─── Engagement-weighted ranking algorithm ─────────────────────────────────
function engagementScore(story: StoryData): number {
  const raw =
    story.hearts * 1.0 +
    story.candles * 1.5 +
    story.shares * 2.0 +
    story.comments * 1.8 +
    story.doves * 1.3 +
    story.balloons * 1.2 +
    story.cheers * 1.4;

  const logScore = Math.log10(Math.max(raw, 1));
  const qualityBonus = story.tributeText.length > 100 ? 0.5 : 0;
  const imageBonus = story.coverImageUrl ? 1.0 : 0;

  return logScore + qualityBonus + imageBonus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getStoryMode(story: StoryData): "memorial" | "celebration" {
  return getLifecycleConfig(story.lifecycleStage).mode;
}

function getReactionsForMode(mode: "memorial" | "celebration"): ReactionDef[] {
  return mode === "celebration" ? CELEBRATION_REACTIONS : MEMORIAL_REACTIONS;
}

function getReactionCount(story: StoryData, type: string): number {
  switch (type) {
    case "heart": return story.hearts;
    case "candle": return story.candles;
    case "dove": return story.doves;
    case "balloon": return story.balloons;
    case "flower": return story.flowers;
    case "cheers": return story.cheers;
    case "gift": return story.gifts;
    default: return 0;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

// ─── Gradient overlay using stacked View layers ────────────────────────────

function GradientOverlay({ position, height }: { position: "top" | "bottom"; height: number }) {
  const BASE = "rgba(26,15,46,";
  const layers =
    position === "top"
      ? [
          { opacity: 0.95, flex: 1 }, { opacity: 0.8, flex: 1 },
          { opacity: 0.6, flex: 1 }, { opacity: 0.35, flex: 1 },
          { opacity: 0.15, flex: 1 }, { opacity: 0.05, flex: 1 },
          { opacity: 0, flex: 1 },
        ]
      : [
          { opacity: 0, flex: 1 }, { opacity: 0.05, flex: 1 },
          { opacity: 0.15, flex: 1 }, { opacity: 0.35, flex: 1 },
          { opacity: 0.55, flex: 1 }, { opacity: 0.75, flex: 1 },
          { opacity: 0.9, flex: 1 }, { opacity: 0.98, flex: 1 },
        ];

  return (
    <View
      style={{ position: "absolute", [position === "top" ? "top" : "bottom"]: 0, left: 0, right: 0, height, zIndex: 1 }}
      pointerEvents="none"
    >
      {layers.map((layer, i) => (
        <View key={i} style={{ flex: layer.flex, backgroundColor: `${BASE}${layer.opacity})` }} />
      ))}
    </View>
  );
}

// ─── Enhanced Engagement Button ────────────────────────────────────────────

function EngagementButton({
  icon, emoji, count, color = "white", activeColor, isActive = false, label, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap; emoji?: string; count: number;
  color?: string; activeColor?: string; isActive?: boolean; label?: string;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handlePress = useCallback(() => {
    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      RNAnimated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress?.();
  }, [onPress, scaleAnim]);

  const displayColor = isActive ? (activeColor ?? color) : color;

  return (
    <Pressable onPress={handlePress} style={{ alignItems: "center", marginBottom: 16 }}>
      <RNAnimated.View
        style={{
          transform: [{ scale: scaleAnim }],
          height: 44, width: 44, borderRadius: 22,
          alignItems: "center", justifyContent: "center",
          marginBottom: 2,
          shadowColor: isActive ? (activeColor ?? "#7C3AED") : "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isActive ? 0.6 : 0,
          shadowRadius: isActive ? 12 : 0,
          elevation: isActive ? 8 : 0,
        }}
      >
        <View
          style={{
            height: 44, width: 44, borderRadius: 22,
            alignItems: "center", justifyContent: "center",
            backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
          }}
        >
          {emoji ? (
            <RNText style={{ fontSize: 22, opacity: isActive ? 1 : 0.7 }}>{emoji}</RNText>
          ) : (
            <Ionicons name={icon} size={24} color={displayColor} />
          )}
        </View>
      </RNAnimated.View>
      <RNText style={{ fontSize: 12, fontWeight: "600", color: isActive ? (activeColor ?? "white") : "rgba(255,255,255,0.7)" }}>
        {count > 0 ? formatCount(count) : (label ?? "")}
      </RNText>
    </Pressable>
  );
}

// ─── Story Progress Bars ────────────────────────────────────────────────────

function StoryProgressBars({ total, current }: { total: number; current: number }) {
  const maxVisible = Math.min(total, 20);
  return (
    <View className="flex-row items-center gap-0.5 py-1" style={{ paddingHorizontal: 4 }}>
      {Array.from({ length: maxVisible }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1, height: 2, borderRadius: 1,
            backgroundColor: i <= (current % maxVisible) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </View>
  );
}

// ─── Tribute Comment Drawer (slides up/down with Modal) ─────────────────────

/** Draft text storage per story (in-memory for session persistence) */
const _draftsByStory: Record<string, string> = {};

/** Local tributes for celebrity stories (no real memorialId) */
const _localTributesByStory: Record<string, Array<{
  id: string;
  content: string;
  created_at: string;
  author: { display_name: string; avatar_url: string | null };
  reaction_counts: Record<string, number>;
  user_reactions: string[];
}>> = {};

/** Local reaction deltas per tribute: tributeId → { heart: +1, candle: -1, ... } */
const _localReactionDeltas: Record<string, Record<string, number>> = {};
/** Local user reaction sets per tribute: tributeId → Set<"heart"|"candle"|...> */
const _localUserReactions: Record<string, Set<string>> = {};

function TributeDrawer({
  visible,
  onClose,
  story,
  mode,
}: {
  visible: boolean;
  onClose: () => void;
  story: StoryData;
  mode: "memorial" | "celebration";
}) {
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const createTribute = useCreateTribute();
  const toggleReaction = useToggleReaction();
  const aiRewrite = useAIRewrite();
  const [text, setText] = useState(() => _draftsByStory[story.id] ?? "");
  const [isSending, setIsSending] = useState(false);
  // Force re-render when local reaction state changes
  const [reactionTick, setReactionTick] = useState(0);
  // Force re-render when local tributes change
  const [tributeTick, setTributeTick] = useState(0);

  const isRealMemorial = !!(story.memorialId && UUID_RE.test(story.memorialId));

  // Save draft on change so it persists when drawer closes / story changes
  const handleTextChange = useCallback((val: string) => {
    setText(val);
    _draftsByStory[story.id] = val;
  }, [story.id]);

  // Fetch real tributes if story has a valid memorialId
  const { data: tributePages, isLoading } = useTributes(
    isRealMemorial ? story.memorialId! : undefined,
    user?.id
  );
  const serverTributes = tributePages?.pages?.flatMap((p: any) => p.data) ?? [];

  // Merge server tributes + local tributes (for celebrity stories)
  const localTributes = _localTributesByStory[story.id] ?? [];
  const allTributes = useMemo(() => {
    // Local tributes go first (most recent), then server tributes
    return [...localTributes, ...serverTributes];
  }, [localTributes, serverTributes, tributeTick]);

  // Handle tribute reaction toggle
  const handleTributeReaction = useCallback((tributeId: string, reactionType: string) => {
    // Initialize if needed
    if (!_localReactionDeltas[tributeId]) _localReactionDeltas[tributeId] = {};
    if (!_localUserReactions[tributeId]) _localUserReactions[tributeId] = new Set();

    // Find the tribute to check server-side user_reactions
    const tribute = allTributes.find((t: any) => t.id === tributeId);
    const serverUserReactions: string[] = tribute?.user_reactions ?? [];
    const localUserSet = _localUserReactions[tributeId];

    // Determine effective state: check if user has reacted (server XOR local toggle)
    const serverHas = serverUserReactions.includes(reactionType);
    const localToggled = localUserSet.has(reactionType);
    const effectivelyActive = serverHas !== localToggled; // XOR

    if (effectivelyActive) {
      // Currently active → remove
      localUserSet.add(reactionType); // toggle local
      _localReactionDeltas[tributeId][reactionType] = (_localReactionDeltas[tributeId][reactionType] ?? 0) - 1;
      lightTap();
    } else {
      // Currently inactive → add
      localUserSet.add(reactionType); // toggle local
      _localReactionDeltas[tributeId][reactionType] = (_localReactionDeltas[tributeId][reactionType] ?? 0) + 1;
      mediumTap();
    }

    // Force UI update
    setReactionTick((t) => t + 1);

    // Persist to DB for real tributes (valid UUID)
    if (UUID_RE.test(tributeId)) {
      requireAuth(() => {
        if (!user?.id) return;
        toggleReaction.mutate({
          userId: user.id,
          targetType: "tribute",
          targetId: tributeId,
          reactionType,
        });
      });
    }
  }, [allTributes, user?.id, requireAuth, toggleReaction]);

  // Get merged counts for a tribute
  const getMergedCounts = useCallback((item: any): Record<string, number> => {
    const baseCounts: Record<string, number> = item.reaction_counts ?? {};
    const deltas = _localReactionDeltas[item.id] ?? {};
    const merged: Record<string, number> = { ...baseCounts };
    for (const [type, delta] of Object.entries(deltas)) {
      merged[type] = Math.max(0, (merged[type] ?? 0) + delta);
    }
    return merged;
  }, [reactionTick]);

  // Get merged user reactions for a tribute
  const getMergedUserReactions = useCallback((item: any): string[] => {
    const serverReactions: string[] = item.user_reactions ?? [];
    const localToggled = _localUserReactions[item.id];
    if (!localToggled || localToggled.size === 0) return serverReactions;

    const result: string[] = [];
    const allTypes = new Set([...serverReactions, ...localToggled]);
    for (const type of allTypes) {
      const serverHas = serverReactions.includes(type);
      const localHas = localToggled.has(type);
      const effective = serverHas !== localHas; // XOR
      if (effective) result.push(type);
    }
    return result;
  }, [reactionTick]);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;

    if (isRealMemorial) {
      // Real memorial — persist to DB
      requireAuth(() => {
        if (!user?.id) return;
        setIsSending(true);
        createTribute.mutate(
          {
            memorial_id: story.memorialId!,
            author_id: user.id,
            content: text.trim(),
            type: "text",
            ribbon_type: "none",
          } as any,
          {
            onSuccess: () => {
              setText("");
              _draftsByStory[story.id] = "";
              setIsSending(false);
              successHaptic();
            },
            onError: () => {
              setIsSending(false);
              Alert.alert("Error", "Failed to send tribute. Please try again.");
            },
          }
        );
      });
    } else {
      // Celebrity story — store locally (session-only)
      const localTribute = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: text.trim(),
        created_at: new Date().toISOString(),
        author: {
          display_name: user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "You",
          avatar_url: user?.user_metadata?.avatar_url ?? null,
        },
        reaction_counts: {},
        user_reactions: [],
      };
      if (!_localTributesByStory[story.id]) _localTributesByStory[story.id] = [];
      _localTributesByStory[story.id].unshift(localTribute);
      setText("");
      _draftsByStory[story.id] = "";
      setTributeTick((t) => t + 1);
      successHaptic();
    }
  }, [text, story.memorialId, story.id, user, isRealMemorial, requireAuth, createTribute]);

  const handleAISuggest = useCallback(async (params: any) => {
    const result = await aiRewrite.mutateAsync(params);
    return result;
  }, [aiRewrite]);

  const drawerTitle = mode === "celebration" ? "Cheers & Messages" : "Tributes & Condolences";
  const placeholder = mode === "celebration" ? "Send a cheer..." : "Share a tribute...";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={{ flex: 1 }} />
        {/* Bottom sheet — takes ~85% of screen */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.tributeSheet}>
          <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <View style={{ alignItems: "center", paddingVertical: 10 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" }} />
            </View>

            {/* Close button */}
            <Pressable onPress={onClose} style={{ position: "absolute", top: 10, right: 14, zIndex: 10, padding: 2 }} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color="#9CA3AF" />
            </Pressable>

            {/* Header */}
            <View style={{ paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB", marginHorizontal: 20 }}>
              <RNText style={{ fontSize: 16, fontWeight: "700", color: "#1F2937", textAlign: "center" }}>
                {drawerTitle}
              </RNText>
              <RNText style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 2 }}>
                {allTributes.length > 0 ? `${allTributes.length} tributes` : "Be the first to share"}
              </RNText>
            </View>

            {/* Tribute list */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} bounces={false}>
              {isLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                </View>
              ) : allTributes.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                  <Ionicons
                    name={mode === "celebration" ? "sparkles-outline" : "flower-outline"}
                    size={40}
                    color="#9CA3AF"
                  />
                  <RNText style={{ fontSize: 14, color: "#6B7280", marginTop: 12, textAlign: "center" }}>
                    {mode === "celebration"
                      ? "No cheers yet. Be the first to celebrate!"
                      : "No tributes yet. Share a memory or message."}
                  </RNText>
                </View>
              ) : (
                <View style={{ paddingBottom: 80 }}>
                  {allTributes.map((item: any) => {
                    const mergedCounts = getMergedCounts(item);
                    const mergedUserReactions = getMergedUserReactions(item);
                    const totalReactions = Object.values(mergedCounts).reduce((sum: number, c: number) => sum + c, 0);

                    return (
                      <View key={item.id} style={{ paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                          <View style={{ height: 36, width: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#F3F0FF" }}>
                            {item.author?.avatar_url ? (
                              <Image source={{ uri: item.author.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
                            ) : (
                              <Ionicons name="person" size={16} color="#7C3AED" />
                            )}
                          </View>
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <RNText style={{ fontSize: 14, fontWeight: "600", color: "#1F2937" }}>
                                {item.author?.display_name ?? "Anonymous"}
                              </RNText>
                              {item.created_at && (
                                <RNText style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>
                                  {timeAgo(item.created_at)}
                                </RNText>
                              )}
                            </View>
                            {item.content && (
                              <RNText style={{ fontSize: 14, color: "#374151", marginTop: 4, lineHeight: 20 }}>
                                {item.content}
                              </RNText>
                            )}
                            {item.media_url && (
                              <View style={{ borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                                <Image source={{ uri: item.media_url }} style={{ width: "100%", height: 140 }} contentFit="cover" />
                              </View>
                            )}
                            {/* Reaction bar with working counters */}
                            <View style={{ marginTop: 8 }}>
                              <ReactionBar
                                compact
                                mode={mode}
                                counts={mergedCounts}
                                userReactions={mergedUserReactions}
                                memorialName={story.name}
                                onReact={(type) => handleTributeReaction(item.id, type)}
                              />
                            </View>
                            {/* Total reaction count badge */}
                            {totalReactions > 0 && (
                              <RNText style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                                {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
                              </RNText>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Compose bar — pinned at bottom of sheet, always active */}
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingBottom: Platform.OS === "ios" ? 34 : 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                <AIRewriteButton
                  compact
                  currentText={text}
                  onResult={(result) => handleTextChange(result)}
                  contextType="tribute"
                  memorialId={story.memorialId ?? undefined}
                  onAISuggest={handleAISuggest}
                />
                <TextInput
                  value={text}
                  onChangeText={handleTextChange}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  style={{ flex: 1, fontSize: 14, marginLeft: 8, paddingVertical: 8, maxHeight: 80, color: "#1F2937" }}
                  multiline
                />
                {text.trim().length > 0 && (
                  <Pressable
                    onPress={handleSend}
                    disabled={isSending}
                    style={{ marginLeft: 8, height: 36, width: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: isSending ? "#C4B5FD" : "#7C3AED" }}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="send" size={15} color="white" />
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── Save Options + Album Creation ─────────────────────────────────────────

/** In-memory saved stories (would use AsyncStorage in production) */
const _savedStories: Record<string, string> = {}; // storyId → albumName ("general" | custom)

function SaveOptionsSheet({
  visible,
  onClose,
  story,
}: {
  visible: boolean;
  onClose: () => void;
  story: StoryData;
}) {
  const [showAlbumInput, setShowAlbumInput] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const isSaved = !!_savedStories[story.id];

  const handleSaveGeneral = useCallback(() => {
    _savedStories[story.id] = "general";
    successHaptic();
    onClose();
  }, [story.id, onClose]);

  const handleCreateAlbum = useCallback(() => {
    if (!albumName.trim()) return;
    _savedStories[story.id] = albumName.trim();
    successHaptic();
    setAlbumName("");
    setShowAlbumInput(false);
    onClose();
  }, [albumName, story.id, onClose]);

  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const url = story.memorialId
      ? `https://foreverr-app.vercel.app/s/${story.memorialId}`
      : `https://foreverr-app.vercel.app/stories/${story.id}`;
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const Clipboard = require("expo-clipboard");
        await Clipboard.setStringAsync(url);
      }
      successHaptic();
      setCopyFeedback(true);
      setTimeout(() => {
        setCopyFeedback(false);
        onClose();
      }, 1200);
    } catch {
      // Fallback: show alert with link
      Alert.alert("Share Link", url);
      onClose();
    }
  }, [story, onClose]);

  const handleClose = useCallback(() => {
    setShowAlbumInput(false);
    setAlbumName("");
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <View style={{ flex: 1 }} />
        {/* Bottom sheet content — stop propagation so taps inside don't close */}
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" }} />
          </View>

          {/* Header */}
          <View style={{ paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB", marginHorizontal: 20 }}>
            <RNText style={{ fontSize: 16, fontWeight: "700", color: "#1F2937", textAlign: "center" }}>
              Save Story
            </RNText>
            {isSaved && (
              <RNText style={{ fontSize: 12, color: "#10B981", textAlign: "center", marginTop: 4 }}>
                ✓ Already saved to {_savedStories[story.id] === "general" ? "General" : `"${_savedStories[story.id]}"`}
              </RNText>
            )}
          </View>

          {/* Options */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
            {/* Save to General */}
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderRadius: 12, backgroundColor: "#F9FAFB", marginBottom: 8 }}
              onPress={handleSaveGeneral}
            >
              <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#F3F0FF", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="bookmark" size={20} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={{ fontSize: 14, fontWeight: "600", color: "#1F2937" }}>Save to General</RNText>
                <RNText style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Quick save to your collection</RNText>
              </View>
              {_savedStories[story.id] === "general" && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
            </Pressable>

            {/* Create Album — toggle inline input */}
            {!showAlbumInput ? (
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderRadius: 12, backgroundColor: "#F9FAFB", marginBottom: 8 }}
                onPress={() => setShowAlbumInput(true)}
              >
                <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Ionicons name="albums-outline" size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <RNText style={{ fontSize: 14, fontWeight: "600", color: "#1F2937" }}>Create Album</RNText>
                  <RNText style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Organize into a themed collection</RNText>
                </View>
              </Pressable>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12, backgroundColor: "#F3F0FF", marginBottom: 8 }}>
                <TextInput
                  value={albumName}
                  onChangeText={setAlbumName}
                  placeholder="Album name..."
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  style={{ flex: 1, fontSize: 14, color: "#1F2937", paddingVertical: 8, paddingHorizontal: 12 }}
                  onSubmitEditing={handleCreateAlbum}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={handleCreateAlbum}
                  disabled={!albumName.trim()}
                  style={{ height: 36, paddingHorizontal: 16, borderRadius: 18, backgroundColor: albumName.trim() ? "#7C3AED" : "#D1D5DB", alignItems: "center", justifyContent: "center", marginLeft: 8 }}
                >
                  <RNText style={{ fontSize: 13, fontWeight: "600", color: "white" }}>Save</RNText>
                </Pressable>
                <Pressable onPress={() => { setShowAlbumInput(false); setAlbumName(""); }} style={{ marginLeft: 8, padding: 4 }}>
                  <Ionicons name="close" size={18} color="#6B7280" />
                </Pressable>
              </View>
            )}

            {/* Copy Link */}
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderRadius: 12, backgroundColor: copyFeedback ? "#F0FDF4" : "#F9FAFB" }}
              onPress={handleCopyLink}
            >
              <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: copyFeedback ? "#DCFCE7" : "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name={copyFeedback ? "checkmark-circle" : "link-outline"} size={20} color={copyFeedback ? "#10B981" : "#6B7280"} />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={{ fontSize: 14, fontWeight: "600", color: copyFeedback ? "#10B981" : "#1F2937" }}>
                  {copyFeedback ? "Link Copied!" : "Copy Link"}
                </RNText>
                <RNText style={{ fontSize: 12, color: copyFeedback ? "#6EE7B7" : "#6B7280", marginTop: 2 }}>
                  {copyFeedback ? "Ready to share" : "Share this story's link"}
                </RNText>
              </View>
            </Pressable>
          </View>

          {/* Bottom safe area */}
          <View style={{ height: Platform.OS === "ios" ? 34 : 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Simulated Engagement Data ──────────────────────────────────────────────

const SIMULATED_NAMES = [
  "Sarah", "Marcus", "Emily", "James", "Aisha", "David", "Maria", "Carlos",
  "Priya", "Michael", "Fatima", "Andre", "Sakura", "Thomas", "Zara", "Ryan",
  "Amara", "Daniel", "Sofia", "Isaiah", "Grace", "Omar", "Luna", "Xavier",
];

const MEMORIAL_ACTIONS = [
  "lit a candle \uD83D\uDD6F\uFE0F",
  "sent love \u2764\uFE0F",
  "honored with a dove \uD83D\uDD4A\uFE0F",
  "placed flowers \uD83C\uDF38",
];

const CELEBRATION_ACTIONS = [
  "sent cheers \uD83C\uDF89",
  "celebrated with balloons \uD83C\uDF88",
  "sent love \u2764\uFE0F",
  "sent a star \u2B50",
];

const PROMPT_CYCLE: Array<"double_tap" | "react" | "tribute"> = [
  "double_tap",
  "react",
  "tribute",
];

function getTotalEngagement(story: StoryData): number {
  return (
    story.hearts + story.candles + story.doves + story.balloons +
    story.cheers + story.flowers + story.gifts + story.comments + story.shares
  );
}

function computeViewerCount(totalEngagement: number): number {
  if (totalEngagement > 100_000) {
    // Celebrity-tier
    return Math.floor(totalEngagement * 0.003 + 500 + Math.random() * 800);
  }
  return Math.max(24, Math.floor(totalEngagement * 0.002 + 80 + Math.random() * 150));
}

// ─── Story Card ─────────────────────────────────────────────────────────────

function StoryCard({ story, isActive }: { story: StoryData; isActive: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const toggleReaction = useToggleReaction();
  const toggleFollow = useToggleFollow();

  // Mode detection
  const mode = getStoryMode(story);
  const reactions = getReactionsForMode(mode);

  // Follow state for memorial
  const realMemorialId = story.memorialId && UUID_RE.test(story.memorialId) ? story.memorialId : undefined;
  const { data: serverIsFollowing } = useIsFollowing(realMemorialId, user?.id);
  // Local follow toggle for immediate UI feedback (works on all profiles including celebrity)
  const [localFollowToggle, setLocalFollowToggle] = useState<boolean | null>(null);
  // Effective follow state: local override if set, otherwise server state
  const isFollowing = localFollowToggle !== null ? localFollowToggle : !!serverIsFollowing;

  // Local state
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set());
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
  const [activeAnimation, setActiveAnimation] = useState<"candle" | "heart" | "dove" | "balloon" | "flower" | "cheers" | null>(null);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const doubleTapHeartAnim = useRef(new RNAnimated.Value(0)).current;
  const lastTapRef = useRef<number>(0);
  const [tributeDrawerVisible, setTributeDrawerVisible] = useState(false);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);
  const isSaved = !!_savedStories[story.id];

  // ── Ambient engagement state ──
  const totalEngagement = useMemo(() => getTotalEngagement(story), [story]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [viewerCount, setViewerCount] = useState(() => computeViewerCount(totalEngagement));
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptType, setPromptType] = useState<"double_tap" | "react" | "tribute">("double_tap");
  const hasInteractedRef = useRef(false);
  const promptCycleRef = useRef(0);

  // Mark user as having interacted (hides engagement prompt)
  const markInteracted = useCallback(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setPromptVisible(false);
    }
  }, []);

  // Ambient reactions interval (faster for popular stories)
  const ambientInterval = useMemo(() => {
    if (totalEngagement <= 1) return 7000;
    return Math.max(3000, 7000 - Math.log10(totalEngagement) * 1000);
  }, [totalEngagement]);

  // Ambient reactions counts for weighted selection
  const ambientCounts = useMemo(() => ({
    heart: story.hearts,
    candle: story.candles,
    dove: story.doves,
    balloon: story.balloons,
    flower: story.flowers,
    cheers: story.cheers,
  }), [story]);

  // ── Simulated social proof toast ──
  useEffect(() => {
    if (!isActive) {
      setToastVisible(false);
      return;
    }

    const actions = mode === "celebration" ? CELEBRATION_ACTIONS : MEMORIAL_ACTIONS;
    const baseInterval = totalEngagement <= 1
      ? 10000
      : Math.max(4000, 10000 - Math.log10(totalEngagement) * 1500);

    const scheduleToast = () => {
      const jitter = 1 + (Math.random() - 0.5) * 0.6; // ±30%
      return setTimeout(() => {
        if (!isActive) return;

        // 25% batch message
        if (Math.random() < 0.25) {
          const batchCount = Math.floor(Math.random() * 5) + 2;
          setToastMessage(`${batchCount} people just reacted`);
        } else {
          const name = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          setToastMessage(`${name} ${action}`);
        }
        setToastVisible(true);

        // Auto-hide after 2.5s
        setTimeout(() => setToastVisible(false), 2500);
      }, baseInterval * jitter);
    };

    // Initial delay before first toast
    let timer = setTimeout(() => {
      // Show first toast
      const name = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      setToastMessage(`${name} ${action}`);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);

      // Schedule recurring toasts
      const interval = setInterval(() => {
        if (!isActive) return;
        const jitter = 1 + (Math.random() - 0.5) * 0.6;
        const delay = baseInterval * jitter;
        setTimeout(() => {
          if (Math.random() < 0.25) {
            const batchCount = Math.floor(Math.random() * 5) + 2;
            setToastMessage(`${batchCount} people just reacted`);
          } else {
            const n = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
            const a = actions[Math.floor(Math.random() * actions.length)];
            setToastMessage(`${n} ${a}`);
          }
          setToastVisible(true);
          setTimeout(() => setToastVisible(false), 2500);
        }, 0);
      }, baseInterval);

      return () => clearInterval(interval);
    }, 2000 + Math.random() * 2000);

    return () => clearTimeout(timer);
  }, [isActive, totalEngagement, mode]);

  // ── Viewer count drift ──
  useEffect(() => {
    if (!isActive) return;
    setViewerCount(computeViewerCount(totalEngagement));

    const drift = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 16) - 5; // -5 to +10
        return Math.max(24, prev + delta);
      });
    }, 12000);

    return () => clearInterval(drift);
  }, [isActive, totalEngagement]);

  // ── Engagement prompt (show after 5s idle) ──
  useEffect(() => {
    if (!isActive) {
      setPromptVisible(false);
      hasInteractedRef.current = false;
      promptCycleRef.current = 0;
      return;
    }

    const idleTimer = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setPromptType(PROMPT_CYCLE[promptCycleRef.current % PROMPT_CYCLE.length]);
        setPromptVisible(true);

        // Auto-hide after 4s
        setTimeout(() => {
          setPromptVisible(false);
          promptCycleRef.current += 1;
        }, 4000);
      }
    }, 5000);

    return () => clearTimeout(idleTimer);
  }, [isActive]);

  // Auto-close drawers when swiping away from this story
  useEffect(() => {
    if (!isActive) {
      setTributeDrawerVisible(false);
      setSaveSheetVisible(false);
    }
  }, [isActive]);

  const triggerHaptic = useCallback((level: "light" | "medium" | "heavy") => {
    if (level === "heavy") heavyTap();
    else if (level === "medium") mediumTap();
    else lightTap();
  }, []);

  const handleReaction = useCallback((reaction: ReactionDef) => {
    markInteracted();
    if (reaction.type === "gift" && story.memorialId) {
      mediumTap();
      router.push(`/gifts/memorial/${story.memorialId}` as any);
      return;
    }

    triggerHaptic(reaction.hapticLevel);
    const isCurrentlyActive = activeReactions.has(reaction.type);

    setActiveReactions((prev) => {
      const next = new Set(prev);
      if (isCurrentlyActive) next.delete(reaction.type);
      else next.add(reaction.type);
      return next;
    });

    setLocalCounts((prev) => ({
      ...prev,
      [reaction.type]: (prev[reaction.type] ?? 0) + (isCurrentlyActive ? -1 : 1),
    }));

    if (!isCurrentlyActive && reaction.animation) {
      setActiveAnimation(reaction.animation);
      if (reaction.animation === "dove") setTimeout(() => successHaptic(), 800);
      if (reaction.animation === "cheers") setTimeout(() => successHaptic(), 400);
    }

    const realTributeId = story.tributeId;
    if (realTributeId && UUID_RE.test(realTributeId)) {
      requireAuth(() => {
        if (!user?.id) return;
        toggleReaction.mutate({
          userId: user.id,
          targetType: "tribute",
          targetId: realTributeId,
          reactionType: reaction.type,
        });
      });
    }
  }, [activeReactions, story, user?.id, requireAuth, toggleReaction, triggerHaptic, router]);

  // Double-tap handler
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      markInteracted();
      mediumTap();
      if (!activeReactions.has("heart")) {
        const heartReaction = reactions.find((r) => r.type === "heart");
        if (heartReaction) handleReaction(heartReaction);
      }
      setShowDoubleTapHeart(true);
      doubleTapHeartAnim.setValue(0);
      RNAnimated.sequence([
        RNAnimated.timing(doubleTapHeartAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.delay(400),
        RNAnimated.timing(doubleTapHeartAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowDoubleTapHeart(false));
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [activeReactions, reactions, handleReaction, doubleTapHeartAnim]);

  // Follow handler — works on all profiles; persists to DB for real memorials
  const handleFollow = useCallback(() => {
    markInteracted();
    mediumTap();
    // Toggle local state immediately for visual feedback
    setLocalFollowToggle((prev) => {
      const current = prev !== null ? prev : !!serverIsFollowing;
      return !current;
    });

    // Persist to DB for real memorial IDs
    if (realMemorialId) {
      requireAuth(() => {
        if (!user?.id) return;
        toggleFollow.mutate({
          memorialId: realMemorialId,
          userId: user.id,
          isFollowing: isFollowing,
        });
      });
    }
  }, [realMemorialId, user?.id, isFollowing, serverIsFollowing, requireAuth, toggleFollow]);

  // Profile icon — navigate to memorial/user profile or show celebrity info
  const handleProfilePress = useCallback(() => {
    markInteracted();
    if (story.tributeId && story.memorialId && UUID_RE.test(story.memorialId)) {
      // Real tribute-backed memorial — go to lifecycle profile
      router.push(`/lifecycle/${story.memorialId}` as any);
    } else if (story.contributorUserId) {
      // Has contributor user — go to user profile
      router.push(`/user/${story.contributorUserId}` as any);
    } else {
      // Celebrity / static story — show profile info with options
      lightTap();
      const dateStr = story.deathYear > 0
        ? `${story.birthYear} \u2014 ${story.deathYear}`
        : `Born ${story.birthYear}`;
      const statsLine = mode === "celebration"
        ? `${formatCount(story.hearts)} love \u00B7 ${formatCount(story.cheers)} cheers \u00B7 ${formatCount(story.balloons)} balloons`
        : `${formatCount(story.hearts)} love \u00B7 ${formatCount(story.candles)} candles \u00B7 ${formatCount(story.doves)} doves`;
      Alert.alert(
        story.name,
        `${story.title}\n${dateStr}\n\n${statsLine}\n\n${story.relationship}`,
        [
          { text: "View Tributes", onPress: () => setTributeDrawerVisible(true) },
          {
            text: "Create Memorial",
            onPress: () => router.push("/lifecycle/create/basic-info" as any),
          },
          { text: "Close", style: "cancel" },
        ]
      );
    }
  }, [story, router, mode, markInteracted]);

  const handleShare = useCallback(async () => {
    markInteracted();
    try {
      const modeLabel = mode === "celebration" ? "Celebrating" : "Remembering";
      const dateStr = story.deathYear > 0
        ? `(${story.birthYear}\u2013${story.deathYear})`
        : `(b. ${story.birthYear})`;
      await Share.share({
        message: `${modeLabel} ${story.name} ${dateStr} \u2014 "${story.tributeText.slice(0, 80)}..." via ǝterrn`,
      });
    } catch {}
  }, [story, mode]);

  const modeLabel = mode === "celebration" ? "Celebration" : "Memorial Tribute";

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* ── Full-screen background ── */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTap}>
        {story.coverImageUrl ? (
          <Image
            source={{ uri: story.coverImageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={StyleSheet.absoluteFill} className="bg-[#1A0F2E]">
            <View style={[styles.accentCircle, { backgroundColor: story.accentColor, top: -80, right: -60, opacity: 0.08 }]} />
            <View style={[styles.accentCircleSmall, { backgroundColor: story.accentLight, bottom: 200, left: -40, opacity: 0.06 }]} />
            <View style={[styles.accentCircleMedium, { backgroundColor: story.accentColor, top: SCREEN_HEIGHT * 0.35, right: -100, opacity: 0.05 }]} />
          </View>
        )}
      </Pressable>

      <GradientOverlay position="top" height={SCREEN_HEIGHT * 0.3} />
      <GradientOverlay position="bottom" height={SCREEN_HEIGHT * 0.6} />

      {/* ── Ambient floating reactions ── */}
      <AmbientReactions
        mode={mode}
        intervalMs={ambientInterval}
        enabled={isActive}
        counts={ambientCounts}
      />

      {/* ── Viewer count badge ── */}
      <View style={{ position: "absolute", top: 108, left: 16, zIndex: 3 }} pointerEvents="none">
        <ViewerCountBadge count={viewerCount} isLive />
      </View>

      {/* ── Social proof toast ── */}
      <View style={{ position: "absolute", top: 140, left: 16, zIndex: 3 }} pointerEvents="none">
        <SocialProofToast message={toastMessage} visible={toastVisible} mode={mode} />
      </View>

      {/* ── Engagement prompt (idle CTA) ── */}
      <View style={{ position: "absolute", bottom: "15%", left: 0, right: 0, alignItems: "center", zIndex: 3 }} pointerEvents="none">
        <EngagementPrompt visible={promptVisible} mode={mode} promptType={promptType} />
      </View>

      {/* ── Double-tap floating heart ── */}
      {showDoubleTapHeart && (
        <RNAnimated.View
          pointerEvents="none"
          style={{
            position: "absolute", top: SCREEN_HEIGHT * 0.35, left: SCREEN_WIDTH / 2 - 40, zIndex: 20,
            opacity: doubleTapHeartAnim,
            transform: [{ scale: doubleTapHeartAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.2, 1] }) }],
          }}
        >
          <Ionicons name="heart" size={80} color="#F43F5E" />
        </RNAnimated.View>
      )}

      {/* ── Center: Memorial/Celebration identity ── */}
      <View className="flex-1 items-center justify-center" style={{ paddingBottom: 80, zIndex: 2 }} pointerEvents="box-none">
        <View className="items-center justify-center rounded-full" style={[styles.centralIcon, { backgroundColor: story.coverImageUrl ? "rgba(0,0,0,0.35)" : `${story.accentColor}18`, borderColor: story.coverImageUrl ? "rgba(255,255,255,0.2)" : `${story.accentColor}40` }]}>
          <View className="items-center justify-center rounded-full" style={{ width: 80, height: 80, backgroundColor: story.coverImageUrl ? "rgba(0,0,0,0.25)" : `${story.accentColor}25` }}>
            <Ionicons name={story.iconName} size={40} color={story.coverImageUrl ? "white" : story.accentLight} />
          </View>
        </View>
        <Text className="text-white text-2xl font-sans-bold mt-6 text-center px-8">{story.name}</Text>
        <Text className="text-white/50 text-sm font-sans mt-1 text-center">
          {story.deathYear > 0 ? `${story.birthYear} \u2014 ${story.deathYear}` : `Born ${story.birthYear}`}
        </Text>
        <View className="mt-3 px-4 py-1.5 rounded-full" style={{ backgroundColor: story.coverImageUrl ? "rgba(0,0,0,0.4)" : `${story.accentColor}20` }}>
          <Text style={{ color: story.coverImageUrl ? "white" : story.accentLight }} className="text-xs font-sans-semibold">{story.title}</Text>
        </View>
      </View>

      {/* ── Right engagement sidebar ── */}
      <View style={styles.engagementSidebar}>
        {/* Profile avatar — navigates to memorial/user profile */}
        <Pressable style={{ alignItems: "center", marginBottom: 20 }} onPress={handleProfilePress}>
          <View style={{ height: 44, width: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: story.accentLight, backgroundColor: `${story.accentColor}30` }}>
            <Ionicons name="person" size={20} color={story.accentLight} />
          </View>
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: -8, backgroundColor: story.accentColor, width: 18, height: 18, borderRadius: 9 }}>
            <Ionicons name="add" size={12} color="white" />
          </View>
        </Pressable>

        {/* Mode-aware reaction buttons */}
        {reactions.map((reaction) => {
          const isActive = activeReactions.has(reaction.type);
          const baseCount = getReactionCount(story, reaction.type);
          const localDelta = localCounts[reaction.type] ?? 0;
          return (
            <EngagementButton
              key={reaction.type}
              icon={isActive ? reaction.icon : reaction.outlineIcon}
              emoji={reaction.emoji}
              count={Math.max(0, baseCount + localDelta)}
              color="white"
              activeColor={reaction.activeColor}
              isActive={isActive}
              label={reaction.label}
              onPress={() => handleReaction(reaction)}
            />
          );
        })}

        {/* Comment/tribute drawer button */}
        <EngagementButton
          icon="chatbubble-outline"
          count={story.comments}
          label="Reply"
          onPress={() => { markInteracted(); setTributeDrawerVisible(true); }}
        />

        <EngagementButton icon="share-social-outline" count={story.shares} label="Share" onPress={handleShare} />

        {/* Bookmark / Save with options */}
        <Pressable onPress={() => { markInteracted(); setSaveSheetVisible(true); }} style={{ alignItems: "center", marginTop: 4 }}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isSaved ? "#F59E0B" : "rgba(255,255,255,0.6)"}
          />
        </Pressable>
      </View>

      {/* ── Bottom content section ── */}
      <View style={styles.bottomContent}>
        <View className="flex-row items-center mb-2.5">
          <View className="h-8 w-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: `${story.accentColor}30` }}>
            <Ionicons name="person" size={14} color={story.accentLight} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-sans-bold">{story.contributorName}</Text>
            <Text className="text-white/40 text-xs font-sans">{story.contributorHandle}</Text>
          </View>
          {/* Working follow button */}
          <Pressable
            className="rounded-full px-4 py-1.5"
            style={{
              borderWidth: 1,
              borderColor: isFollowing ? "rgba(255,255,255,0.3)" : story.accentLight,
              backgroundColor: isFollowing ? "rgba(255,255,255,0.1)" : "transparent",
            }}
            onPress={handleFollow}
          >
            <Text
              style={{ color: isFollowing ? "rgba(255,255,255,0.7)" : story.accentLight }}
              className="text-xs font-sans-semibold"
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <Text className="text-white/90 text-sm font-sans leading-5" numberOfLines={3}>
          {story.tributeText}
        </Text>

        <View className="flex-row items-center mt-2.5">
          <Ionicons name={mode === "celebration" ? "sparkles-outline" : "flower-outline"} size={14} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/40 text-xs font-sans ml-1.5">{story.relationship}</Text>
          <Text className="text-white/20 mx-2">|</Text>
          <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/40 text-xs font-sans ml-1">{modeLabel}</Text>
        </View>
      </View>

      {/* ── Reaction Animations ── */}
      <CandleAnimation visible={activeAnimation === "candle"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} />
      <HeartAnimation visible={activeAnimation === "heart"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} />
      <DoveAnimation visible={activeAnimation === "dove"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} />
      <BalloonAnimation visible={activeAnimation === "balloon"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} mode={mode} />
      <FlowerAnimation visible={activeAnimation === "flower"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} />
      <CheersAnimation visible={activeAnimation === "cheers"} memorialName={story.name} onDismiss={() => setActiveAnimation(null)} />

      {/* ── Tribute Drawer (slides up/down) ── */}
      <TributeDrawer
        visible={tributeDrawerVisible}
        onClose={() => setTributeDrawerVisible(false)}
        story={story}
        mode={mode}
      />

      {/* ── Save Options Sheet ── */}
      <SaveOptionsSheet
        visible={saveSheetVisible}
        onClose={() => setSaveSheetVisible(false)}
        story={story}
      />
    </View>
  );
}

// ─── Main Stories Screen ────────────────────────────────────────────────────

export default function StoriesScreen() {
  const router = useRouter();
  const { memorialId, startIndex } = useLocalSearchParams<{ memorialId?: string; startIndex?: string }>();
  const { isAuthenticated } = useAuth();
  const { location: userLocation } = useUserLocation();
  const [currentIndex, setCurrentIndex] = useState(startIndex ? parseInt(startIndex, 10) : 0);

  // Back button: go to previous screen or fall back to home feed
  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else if (memorialId) {
      // Deep-linked into a memorial's stories — go to that memorial
      router.replace(`/lifecycle/${memorialId}` as any);
    } else {
      // No history — go to home feed
      router.replace("/(tabs)" as any);
    }
  }, [router, memorialId]);

  const { data: realTributes, isLoading } = useTrendingTributes(30);

  const stories: StoryData[] = useMemo(() => {
    let realStories = (realTributes ?? []).map(mapTributeToStory);

    if (memorialId) {
      const filtered = realStories.filter((s) => s.id.includes(memorialId));
      if (filtered.length > 0) return filtered;
    }

    const combined = [...realStories, ...CELEBRITY_STORIES];
    return combined.sort((a, b) => {
      const scoreA = engagementScore(a) + Math.random() * 0.3;
      const scoreB = engagementScore(b) + Math.random() * 0.3;
      return scoreB - scoreA;
    });
  }, [realTributes, memorialId]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: StoryData; index: number }) => (
      <StoryCard story={item} isActive={index === currentIndex} />
    ),
    [currentIndex]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1A0F2E] items-center justify-center">
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text className="text-white/60 text-sm font-sans mt-3">Loading stories...</Text>
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
        onEndReachedThreshold={2}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== "web"}
        getItemLayout={(_, index) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })}
      />

      {/* ── Floating top bar ── */}
      <View style={styles.topBar}>
        {isAuthenticated ? (
          <Pressable onPress={goBack} className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
        ) : (
          <View style={{ width: 100 }}>
            <EternLogo width={560} variant="full" />
          </View>
        )}
        <View className="flex-1 items-center">
          <Text className="text-white text-base font-sans-bold">Stories</Text>
          <StoryProgressBars total={Math.min(stories.length, 20)} current={currentIndex % 20} />
        </View>
        <Pressable onPress={() => router.push("/lifecycle/create/basic-info")} className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
          <Ionicons name="camera-outline" size={22} color="white" />
        </Pressable>
      </View>

      {/* ── Guest CTA ── */}
      {!isAuthenticated && (
        <View style={styles.guestCTA}>
          <Pressable className="flex-1 rounded-full bg-white py-3.5 items-center" onPress={() => router.push("/(auth)/login")}>
            <Text className="text-base font-sans-bold text-brand-900">Sign In</Text>
          </Pressable>
          <Pressable className="flex-1 rounded-full bg-white/15 py-3.5 items-center border border-white/30" onPress={() => router.push("/(tabs)")}>
            <Text className="text-base font-sans-semibold text-white">Explore</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    paddingTop: 54, paddingHorizontal: 16, paddingBottom: 8, zIndex: 10,
  },
  engagementSidebar: {
    position: "absolute", right: 10, bottom: SCREEN_HEIGHT * 0.18,
    alignItems: "center", zIndex: 5,
    opacity: 1,
    overflow: "visible" as const,
  },
  bottomContent: {
    position: "absolute", bottom: 0, left: 0, right: 65,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    zIndex: 5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  tributeSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  accentCircle: { position: "absolute", width: 300, height: 300, borderRadius: 150 },
  accentCircleSmall: { position: "absolute", width: 200, height: 200, borderRadius: 100 },
  accentCircleMedium: { position: "absolute", width: 350, height: 350, borderRadius: 175 },
  centralIcon: { width: 120, height: 120, borderWidth: 1 },
  guestCTA: {
    position: "absolute", bottom: 36, left: 16, right: 16,
    flexDirection: "row", gap: 12, zIndex: 15,
  },
});
