import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";

const GIFT_KEY = "gifts";

// ============================================================
// Emoji map — converts DB icon names to display emojis
// ============================================================

export const GIFT_EMOJI_MAP: Record<string, string> = {
  // Flowers
  rose: "\u{1F339}",
  flower: "\u{1F338}",
  sunflower: "\u{1F33B}",
  tulip: "\u{1F337}",
  lily: "\u{1F33C}",
  orchid: "\u{1F490}",
  bouquet: "\u{1F490}",
  blossom: "\u{1F33A}",
  // Candles & Light
  flame: "\u{1F56F}\uFE0F",
  candle: "\u{1F56F}\uFE0F",
  fire: "\u{1F525}",
  // Cards & Messages
  mail: "\u{1F48C}",
  card: "\u{1F48C}",
  heart: "\u2764\uFE0F",
  envelope: "\u{1F48C}",
  // Celebrations
  balloon: "\u{1F388}",
  gift: "\u{1F381}",
  star: "\u2B50",
  confetti: "\u{1F389}",
  sparkles: "\u2728",
  trophy: "\u{1F3C6}",
  medal: "\u{1F3C5}",
  crown: "\u{1F451}",
  cake: "\u{1F382}",
  champagne: "\u{1F37E}",
  clap: "\u{1F44F}",
  party: "\u{1F973}",
  // Memorial & Sympathy
  dove: "\u{1F54A}\uFE0F",
  butterfly: "\u{1F98B}",
  angel: "\u{1F47C}",
  pray: "\u{1F64F}",
  rainbow: "\u{1F308}",
  // Baby & Birth
  baby: "\u{1F476}",
  baby_bottle: "\u{1F37C}",
  stork: "\u{1FAB6}",
  rattle: "\u{1FA87}",
  footprints: "\u{1F463}",
  cradle: "\u{1F6CF}\uFE0F",
  pacifier: "\u{1F37C}",
  // Life & Turning Points
  graduation: "\u{1F393}",
  ring: "\u{1F48D}",
  house: "\u{1F3E0}",
  briefcase: "\u{1F4BC}",
  airplane: "\u2708\uFE0F",
  car: "\u{1F697}",
  diploma: "\u{1F4DC}",
  key: "\u{1F511}",
  // Objects & More
  book: "\u{1F4D6}",
  frame: "\u{1F5BC}\uFE0F",
  bear: "\u{1F9F8}",
  ribbon: "\u{1F380}",
  gem: "\u{1F48E}",
  seedling: "\u{1F331}",
  tree: "\u{1F333}",
  // Faith & Spiritual
  cross: "\u271D\uFE0F",
  peace: "\u262E\uFE0F",
  yin_yang: "\u262F\uFE0F",
  om: "\u{1F549}\uFE0F",
  hands_together: "\u{1F64F}",
};

/** Get the display emoji for a gift icon name. Falls back to gift */
export function getGiftEmoji(icon: string | null | undefined): string {
  if (!icon) return "\u{1F381}";
  return GIFT_EMOJI_MAP[icon] ?? "\u{1F381}";
}

// ============================================================
// Types (matching DB schema from 00022_gift_economy.sql + point_cost)
// ============================================================

export type GiftCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  image_url: string | null;
  price_cents: number;
  is_premium: boolean;
  is_physical: boolean;
  is_active: boolean;
  sort_order: number;
  point_cost: number;
  created_at: string;
};

type GiftTransaction = {
  id: string;
  sender_id: string;
  recipient_type: string;
  recipient_id: string;
  recipient_user_id: string | null;
  gift_id: string;
  quantity: number;
  message: string | null;
  is_anonymous: boolean;
  amount_cents: number;
  created_at: string;
  gift?: GiftCatalogItem | null;
  sender?: { id: string; username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

type FlowerWall = {
  target_type: string;
  target_id: string;
  total_flowers: number;
  total_candles: number;
  total_gifts: number;
  total_amount_cents: number;
  last_gift_at: string | null;
};

type GiftReaction = {
  id: string;
  gift_transaction_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

type LeaderboardEntry = {
  sender_id: string;
  total_quantity: number;
  sender: { id: string; username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

// ============================================================
// Built-in gift catalog (fallback when DB is empty / migration not deployed)
// Matches seeded data from 00022_gift_economy.sql + point_cost
// ============================================================

export const BUILT_IN_GIFTS: GiftCatalogItem[] = [
  // ══════════════════════════════════════════════════════════
  // 🌹 FLOWERS — Universal
  // ══════════════════════════════════════════════════════════
  { id: "builtin-rose",         name: "Single Rose",     description: "A single red rose to show you care",                      category: "flowers", icon: "rose",      image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 1,  point_cost: 0,   created_at: "" },
  { id: "builtin-bouquet",      name: "Bouquet",          description: "A beautiful mixed bouquet of fresh flowers",              category: "flowers", icon: "bouquet",   image_url: null, price_cents: 299, is_premium: false, is_physical: false, is_active: true, sort_order: 2,  point_cost: 25,  created_at: "" },
  { id: "builtin-sunflower",    name: "Sunflower",        description: "A bright sunflower to bring warmth and light",            category: "flowers", icon: "sunflower", image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 3,  point_cost: 15,  created_at: "" },
  { id: "builtin-lily",         name: "Lily",             description: "An elegant lily symbolizing peace and purity",             category: "flowers", icon: "lily",      image_url: null, price_cents: 249, is_premium: false, is_physical: false, is_active: true, sort_order: 4,  point_cost: 20,  created_at: "" },
  { id: "builtin-orchid",       name: "Orchid",           description: "A graceful orchid representing eternal love",              category: "flowers", icon: "orchid",    image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 5,  point_cost: 35,  created_at: "" },
  { id: "builtin-tulip",        name: "Tulip",            description: "A cheerful tulip to brighten someone's day",               category: "flowers", icon: "tulip",     image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 6,  point_cost: 10,  created_at: "" },
  { id: "builtin-eternal-rose", name: "Eternal Rose",     description: "A preserved rose that lasts forever, just like your love", category: "flowers", icon: "rose",      image_url: null, price_cents: 999, is_premium: true,  is_physical: false, is_active: true, sort_order: 7,  point_cost: 100, created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 👶 BABY & BIRTH — Celebrating new life
  // ══════════════════════════════════════════════════════════
  { id: "builtin-welcome-baby",    name: "Welcome Baby",       description: "Celebrate the arrival of a precious new life",             category: "baby", icon: "baby",         image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 10, point_cost: 0,   created_at: "" },
  { id: "builtin-baby-footprints", name: "Baby Footprints",    description: "Adorable footprints marking first tiny steps in the world", category: "baby", icon: "footprints",   image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 11, point_cost: 15,  created_at: "" },
  { id: "builtin-baby-bear",       name: "Baby Bear",          description: "A cuddly teddy bear for the newest family member",          category: "baby", icon: "bear",         image_url: null, price_cents: 299, is_premium: false, is_physical: false, is_active: true, sort_order: 12, point_cost: 25,  created_at: "" },
  { id: "builtin-baby-bottle",     name: "Baby Bottle",        description: "A cute baby bottle to wish healthy growth",                 category: "baby", icon: "baby_bottle",  image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 13, point_cost: 10,  created_at: "" },
  { id: "builtin-baby-shower",     name: "Baby Shower Gift",   description: "A special gift bundle for expectant parents",               category: "baby", icon: "gift",         image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 14, point_cost: 40,  created_at: "" },
  { id: "builtin-first-birthday",  name: "First Birthday",     description: "Celebrate baby's very first birthday milestone",            category: "baby", icon: "cake",         image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 15, point_cost: 30,  created_at: "" },
  { id: "builtin-nursery-star",    name: "Nursery Star",       description: "A glowing star to watch over the nursery",                  category: "baby", icon: "star",         image_url: null, price_cents: 599, is_premium: true,  is_physical: false, is_active: true, sort_order: 16, point_cost: 60,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 🎓 MILESTONES — Life achievements
  // ══════════════════════════════════════════════════════════
  { id: "builtin-graduation-cap",   name: "Graduation Cap",     description: "Congratulations on this amazing academic achievement",     category: "milestones", icon: "graduation",  image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 20, point_cost: 0,   created_at: "" },
  { id: "builtin-diploma",          name: "Diploma",            description: "A diploma to honor years of hard work and dedication",     category: "milestones", icon: "diploma",     image_url: null, price_cents: 249, is_premium: false, is_physical: false, is_active: true, sort_order: 21, point_cost: 20,  created_at: "" },
  { id: "builtin-engagement-ring",  name: "Engagement Ring",    description: "Celebrate the start of a beautiful forever together",      category: "milestones", icon: "ring",        image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 22, point_cost: 35,  created_at: "" },
  { id: "builtin-wedding-bells",    name: "Wedding Bells",      description: "Wishing you a lifetime of love and happiness",            category: "milestones", icon: "sparkles",    image_url: null, price_cents: 599, is_premium: true,  is_physical: false, is_active: true, sort_order: 23, point_cost: 50,  created_at: "" },
  { id: "builtin-new-home",         name: "New Home",           description: "Congrats on the new place — may it be filled with joy",   category: "milestones", icon: "house",       image_url: null, price_cents: 349, is_premium: false, is_physical: false, is_active: true, sort_order: 24, point_cost: 30,  created_at: "" },
  { id: "builtin-new-job",          name: "New Job",            description: "Way to go! Celebrating your exciting career move",         category: "milestones", icon: "briefcase",   image_url: null, price_cents: 249, is_premium: false, is_physical: false, is_active: true, sort_order: 25, point_cost: 20,  created_at: "" },
  { id: "builtin-retirement",       name: "Retirement",         description: "Cheers to a well-earned retirement and new adventures",    category: "milestones", icon: "champagne",   image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 26, point_cost: 40,  created_at: "" },
  { id: "builtin-first-car",        name: "First Car",          description: "The keys to freedom — congrats on your first car!",        category: "milestones", icon: "car",         image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 27, point_cost: 15,  created_at: "" },
  { id: "builtin-bon-voyage",       name: "Bon Voyage",         description: "Wishing safe and wonderful travels ahead",                category: "milestones", icon: "airplane",    image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 28, point_cost: 15,  created_at: "" },
  { id: "builtin-golden-key",       name: "Golden Key",         description: "A golden key for unlocking life's greatest milestones",    category: "milestones", icon: "key",         image_url: null, price_cents: 799, is_premium: true,  is_physical: false, is_active: true, sort_order: 29, point_cost: 80,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 🎉 CELEBRATIONS — Birthdays, achievements, fun
  // ══════════════════════════════════════════════════════════
  { id: "builtin-birthday-cake",       name: "Birthday Cake",       description: "Make a wish! A birthday cake to celebrate another year",    category: "celebrations", icon: "cake",       image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 30, point_cost: 0,   created_at: "" },
  { id: "builtin-party-popper",        name: "Party Popper",        description: "Pop! Time to celebrate the good times",                     category: "celebrations", icon: "confetti",   image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 31, point_cost: 10,  created_at: "" },
  { id: "builtin-birthday-balloons",   name: "Birthday Balloons",   description: "Colorful birthday balloons to brighten the day",            category: "celebrations", icon: "balloon",    image_url: null, price_cents: 299, is_premium: false, is_physical: false, is_active: true, sort_order: 32, point_cost: 25,  created_at: "" },
  { id: "builtin-celebration-bundle",  name: "Celebration Bundle",   description: "A festive bundle of balloons for any occasion",             category: "celebrations", icon: "balloon",    image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 33, point_cost: 30,  created_at: "" },
  { id: "builtin-trophy",             name: "Trophy",               description: "A gold trophy to honor an outstanding achievement",          category: "celebrations", icon: "trophy",     image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 34, point_cost: 40,  created_at: "" },
  { id: "builtin-gold-medal",         name: "Gold Medal",           description: "You're a champion! A gold medal for going above and beyond", category: "celebrations", icon: "medal",      image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 35, point_cost: 35,  created_at: "" },
  { id: "builtin-standing-ovation",   name: "Standing Ovation",     description: "A round of applause for something truly special",            category: "celebrations", icon: "clap",       image_url: null, price_cents: 249, is_premium: false, is_physical: false, is_active: true, sort_order: 36, point_cost: 20,  created_at: "" },
  { id: "builtin-champagne-toast",    name: "Champagne Toast",      description: "Raise a glass! Here's to you and your success",              category: "celebrations", icon: "champagne",  image_url: null, price_cents: 599, is_premium: true,  is_physical: false, is_active: true, sort_order: 37, point_cost: 50,  created_at: "" },
  { id: "builtin-crown",              name: "Royal Crown",          description: "You're royalty today — wear this crown with pride",           category: "celebrations", icon: "crown",      image_url: null, price_cents: 799, is_premium: true,  is_physical: false, is_active: true, sort_order: 38, point_cost: 80,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 🕯️ CANDLES & LIGHT — Remembrance
  // ══════════════════════════════════════════════════════════
  { id: "builtin-prayer-candle",   name: "Prayer Candle",    description: "Light a prayer candle in remembrance",           category: "candles", icon: "flame",  image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 40, point_cost: 0,   created_at: "" },
  { id: "builtin-memorial-candle", name: "Memorial Candle",  description: "A memorial candle that burns bright",            category: "candles", icon: "candle", image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 41, point_cost: 20,  created_at: "" },
  { id: "builtin-vigil-light",     name: "Vigil Light",      description: "A vigil light to keep the memory alive",         category: "candles", icon: "flame",  image_url: null, price_cents: 299, is_premium: false, is_physical: false, is_active: true, sort_order: 42, point_cost: 25,  created_at: "" },
  { id: "builtin-eternal-flame",   name: "Eternal Flame",    description: "An eternal flame that never goes out",           category: "candles", icon: "fire",   image_url: null, price_cents: 799, is_premium: true,  is_physical: false, is_active: true, sort_order: 43, point_cost: 80,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 💌 CARDS & MESSAGES — All occasions
  // ══════════════════════════════════════════════════════════
  { id: "builtin-thank-you",       name: "Thank You Card",     description: "Express your gratitude with a heartfelt thank you", category: "cards", icon: "heart",    image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 50, point_cost: 0,   created_at: "" },
  { id: "builtin-custom-message",  name: "Custom Message",     description: "Write your own personal message from the heart",    category: "cards", icon: "mail",     image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 51, point_cost: 0,   created_at: "" },
  { id: "builtin-thinking-of-you", name: "Thinking of You",    description: "Let someone know they are in your thoughts",        category: "cards", icon: "envelope", image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 52, point_cost: 15,  created_at: "" },
  { id: "builtin-birthday",        name: "Birthday Card",      description: "Celebrate a birthday with a special card",           category: "cards", icon: "card",     image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 53, point_cost: 15,  created_at: "" },
  { id: "builtin-get-well",        name: "Get Well",           description: "Send warm wishes for a speedy recovery",             category: "cards", icon: "mail",     image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 54, point_cost: 15,  created_at: "" },
  { id: "builtin-anniversary",     name: "Anniversary Card",   description: "Mark a special anniversary with love",               category: "cards", icon: "heart",    image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 55, point_cost: 20,  created_at: "" },
  { id: "builtin-congrats-card",   name: "Congratulations",    description: "A card to celebrate any wonderful achievement",      category: "cards", icon: "card",     image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 56, point_cost: 15,  created_at: "" },
  { id: "builtin-love-letter",     name: "Love Letter",        description: "A heartfelt love letter sealed with a kiss",         category: "cards", icon: "heart",    image_url: null, price_cents: 399, is_premium: true,  is_physical: false, is_active: true, sort_order: 57, point_cost: 35,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 🕊️ SYMPATHY & COMFORT — Support during loss
  // ══════════════════════════════════════════════════════════
  { id: "builtin-sympathy-dove",        name: "Peace Dove",          description: "A dove carrying wishes of peace and comfort",                 category: "sympathy", icon: "dove",      image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 60, point_cost: 0,   created_at: "" },
  { id: "builtin-comfort-bear",         name: "Comfort Bear",        description: "A soft bear to bring comfort during difficult times",          category: "sympathy", icon: "bear",      image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 61, point_cost: 40,  created_at: "" },
  { id: "builtin-memorial-butterfly",   name: "Memorial Butterfly",  description: "A butterfly symbolizing transformation and hope",              category: "sympathy", icon: "butterfly", image_url: null, price_cents: 399, is_premium: false, is_physical: false, is_active: true, sort_order: 62, point_cost: 35,  created_at: "" },
  { id: "builtin-guardian-angel",        name: "Guardian Angel",     description: "A guardian angel to watch over your loved ones",                category: "sympathy", icon: "angel",     image_url: null, price_cents: 699, is_premium: true,  is_physical: false, is_active: true, sort_order: 63, point_cost: 60,  created_at: "" },
  { id: "builtin-rainbow-bridge",        name: "Rainbow Bridge",    description: "A rainbow connecting heaven and earth",                         category: "sympathy", icon: "rainbow",   image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 64, point_cost: 40,  created_at: "" },
  { id: "builtin-praying-hands",         name: "Praying Hands",     description: "Sending prayers and strength during this time",                 category: "sympathy", icon: "pray",      image_url: null, price_cents: 199, is_premium: false, is_physical: false, is_active: true, sort_order: 65, point_cost: 15,  created_at: "" },
  { id: "builtin-memory-tree",           name: "Memory Tree",       description: "A tree of life honoring memories that grow forever",            category: "sympathy", icon: "tree",      image_url: null, price_cents: 599, is_premium: true,  is_physical: false, is_active: true, sort_order: 66, point_cost: 50,  created_at: "" },
  { id: "builtin-sympathy-ribbon",       name: "Remembrance Ribbon", description: "A ribbon to show solidarity and remembrance",                 category: "sympathy", icon: "ribbon",    image_url: null, price_cents: 149, is_premium: false, is_physical: false, is_active: true, sort_order: 67, point_cost: 10,  created_at: "" },

  // ══════════════════════════════════════════════════════════
  // 🌱 GROWTH & LEGACY — Lasting tributes
  // ══════════════════════════════════════════════════════════
  { id: "builtin-seedling",       name: "Seedling",         description: "Plant a seedling — a symbol of new beginnings and growth",    category: "legacy", icon: "seedling",  image_url: null, price_cents: 0,   is_premium: false, is_physical: false, is_active: true, sort_order: 70, point_cost: 0,   created_at: "" },
  { id: "builtin-photo-frame",    name: "Photo Frame",      description: "A digital photo frame to display cherished memories",          category: "legacy", icon: "frame",     image_url: null, price_cents: 499, is_premium: false, is_physical: false, is_active: true, sort_order: 71, point_cost: 40,  created_at: "" },
  { id: "builtin-memory-book",    name: "Memory Book",       description: "A collaborative memory book for friends and family",          category: "legacy", icon: "book",      image_url: null, price_cents: 599, is_premium: false, is_physical: false, is_active: true, sort_order: 72, point_cost: 50,  created_at: "" },
  { id: "builtin-legacy-gem",     name: "Legacy Gem",        description: "A precious gem representing an enduring legacy",              category: "legacy", icon: "gem",       image_url: null, price_cents: 999, is_premium: true,  is_physical: false, is_active: true, sort_order: 73, point_cost: 100, created_at: "" },
  { id: "builtin-heritage-tree",  name: "Heritage Tree",     description: "A mighty tree representing deep roots and lasting heritage",  category: "legacy", icon: "tree",      image_url: null, price_cents: 799, is_premium: true,  is_physical: false, is_active: true, sort_order: 74, point_cost: 80,  created_at: "" },
  { id: "builtin-eternal-star",   name: "Eternal Star",      description: "Name a star in the sky — forever shining bright",             category: "legacy", icon: "star",      image_url: null, price_cents: 1499, is_premium: true, is_physical: false, is_active: true, sort_order: 75, point_cost: 150, created_at: "" },
];

// ============================================================
// 1. Gift Catalog Items (with built-in fallback)
// ============================================================

/** Fetch active gift catalog items, optionally filtered by category.
 *  Always includes BUILT_IN_GIFTS as a baseline so every category has items.
 *  DB records override matching built-in items by name/id. */
export function useGiftCatalogItems(category?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "catalog", category],
    queryFn: async () => {
      let dbItems: any[] = [];

      try {
        let query = supabase
          .from("gift_catalog")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          dbItems = (data as any[]).map((item) => {
            const builtIn = BUILT_IN_GIFTS.find(
              (b) => b.name === item.name || b.id === item.id
            );
            return {
              ...item,
              point_cost: (item as any).point_cost ?? builtIn?.point_cost ?? 0,
            } as GiftCatalogItem;
          });
        }
      } catch {
        // DB not reachable — use built-in gifts only
      }

      // Merge: start with built-in gifts, overlay DB items (DB wins on name/id match)
      let baseItems = BUILT_IN_GIFTS;
      if (category) {
        baseItems = baseItems.filter((g) => g.category === category);
      }

      // If no DB items, just return built-in
      if (dbItems.length === 0) return baseItems;

      // Merge: keep all built-in items not overridden by DB, then add all DB items
      const dbIds = new Set(dbItems.map((d) => d.id));
      const dbNames = new Set(dbItems.map((d) => d.name));
      const uniqueBuiltIns = baseItems.filter(
        (b) => !dbIds.has(b.id) && !dbNames.has(b.name)
      );

      return [...dbItems, ...uniqueBuiltIns];
    },
  });
}

// ============================================================
// 2. Send Gift Transaction
// ============================================================

/** Insert a gift_transaction record */
export function useSendGiftTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      senderId: string;
      recipientType: "user" | "memorial" | "living_tribute";
      recipientId: string;
      recipientUserId?: string;
      giftId: string;
      quantity?: number;
      message?: string;
      isAnonymous?: boolean;
      amountCents?: number;
    }) => {
      const { data, error } = await supabase
        .from("gift_transactions")
        .insert({
          sender_id: params.senderId,
          recipient_type: params.recipientType,
          recipient_id: params.recipientId,
          recipient_user_id: params.recipientUserId ?? null,
          gift_id: params.giftId,
          quantity: params.quantity ?? 1,
          message: params.message ?? null,
          is_anonymous: params.isAnonymous ?? false,
          amount_cents: params.amountCents ?? 0,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as any as GiftTransaction;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GIFT_KEY] });
      // Award engagement points for sending a gift
      if (variables.senderId) {
        awardEngagementPoints(variables.senderId, "send_gift", { referenceId: (data as any)?.id });
      }
    },
  });
}

// ============================================================
// 3. Gifts Received (paginated)
// ============================================================

/** Fetch paginated gifts received by a target (memorial, user, living_tribute) */
export function useGiftsReceived(targetType?: string, targetId?: string) {
  return useInfiniteQuery({
    queryKey: [GIFT_KEY, "received", targetType, targetId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;

      try {
        const { data, error } = await supabase
          .from("gift_transactions")
          .select(
            "*, gift:gift_catalog(*), sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
          )
          .eq("recipient_type", targetType!)
          .eq("recipient_id", targetId!)
          .order("created_at", { ascending: false })
          .range(pageParam, pageParam + pageSize - 1);

        if (error) {
          // Table may not exist yet — return empty gracefully
          const msg = error.message ?? "";
          if (msg.includes("relation") && msg.includes("does not exist")) {
            return { data: [] as GiftTransaction[], nextCursor: undefined };
          }
          throw error;
        }
        return {
          data: (data ?? []) as any as GiftTransaction[],
          nextCursor:
            data && data.length === pageSize ? pageParam + pageSize : undefined,
        };
      } catch {
        // DB not reachable — return empty
        return { data: [] as GiftTransaction[], nextCursor: undefined };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!targetType && !!targetId,
  });
}

// ============================================================
// 4. Gifts Sent (paginated)
// ============================================================

/** Fetch paginated gifts sent by a user */
export function useGiftsSent(userId?: string) {
  return useInfiniteQuery({
    queryKey: [GIFT_KEY, "sent", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;

      const { data, error } = await supabase
        .from("gift_transactions")
        .select(
          "*, gift:gift_catalog(*), sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
        )
        .eq("sender_id", userId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (error) throw error;
      return {
        data: (data ?? []) as any as GiftTransaction[],
        nextCursor:
          data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!userId,
  });
}

// ============================================================
// 5. Flower Wall (aggregated gift stats for a target)
// ============================================================

/** Fetch the flower_walls record for a target — returns summary stats or null */
export function useFlowerWall(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "flower-wall", targetType, targetId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("flower_walls")
          .select("*")
          .eq("target_type", targetType!)
          .eq("target_id", targetId!)
          .maybeSingle();

        if (error) {
          // Table may not exist yet — return null gracefully
          const msg = error.message ?? "";
          if (msg.includes("relation") && msg.includes("does not exist")) {
            return null;
          }
          throw error;
        }
        return (data as any as FlowerWall) ?? null;
      } catch {
        // DB not reachable — return null
        return null;
      }
    },
    enabled: !!targetType && !!targetId,
    retry: 1,
  });
}

// ============================================================
// 6. Record Gift to Flower Wall (for built-in gifts)
// ============================================================

/** Directly upsert flower_walls via RPC — used for built-in gifts that
 *  skip the gift_transactions table (and therefore skip the DB trigger). */
export function useRecordGiftToWall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      targetType: string;
      targetId: string;
      category: string;
      quantity?: number;
      amountCents?: number;
    }) => {
      const { error } = await (supabase as any).rpc("record_gift_to_wall", {
        p_target_type: params.targetType,
        p_target_id: params.targetId,
        p_category: params.category,
        p_quantity: params.quantity ?? 1,
        p_amount_cents: params.amountCents ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GIFT_KEY, "flower-wall", variables.targetType, variables.targetId],
      });
    },
  });
}

// ============================================================
// 7. React to Gift
// ============================================================

/** Insert or toggle a reaction on a gift transaction */
export function useReactToGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      giftTransactionId: string;
      userId: string;
      reactionType: string;
    }) => {
      // Check for existing reaction of this type
      const { data: existing } = await supabase
        .from("gift_reactions")
        .select("id")
        .eq("gift_transaction_id", params.giftTransactionId)
        .eq("user_id", params.userId)
        .eq("reaction_type", params.reactionType)
        .maybeSingle();

      if (existing) {
        // Toggle off — remove the reaction
        const { error } = await supabase
          .from("gift_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { removed: true } as const;
      }

      // Insert new reaction
      const { data, error } = await supabase
        .from("gift_reactions")
        .insert({
          gift_transaction_id: params.giftTransactionId,
          user_id: params.userId,
          reaction_type: params.reactionType,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { removed: false, reaction: data as any as GiftReaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GIFT_KEY] });
    },
  });
}

// ============================================================
// 8. Gift Leaderboard (top 10 senders for a target)
// ============================================================

/** Group gift_transactions by sender, sum quantities, return top 10 with profile data */
export function useGiftLeaderboard(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: [GIFT_KEY, "leaderboard", targetType, targetId],
    queryFn: async () => {
      let data: any[] | null = null;
      try {
        // Fetch all transactions for this target to aggregate client-side
        const result = await supabase
          .from("gift_transactions")
          .select(
            "sender_id, quantity, sender:profiles!gift_transactions_sender_id_fkey(id, username, display_name, avatar_url)"
          )
          .eq("recipient_type", targetType!)
          .eq("recipient_id", targetId!)
          .eq("is_anonymous", false);

        if (result.error) {
          // Table may not exist yet — return empty
          const msg = result.error.message ?? "";
          if (msg.includes("relation") && msg.includes("does not exist")) {
            return [] as LeaderboardEntry[];
          }
          throw result.error;
        }
        data = result.data;
      } catch {
        // DB not reachable — return empty
        return [] as LeaderboardEntry[];
      }

      // Aggregate by sender
      const senderMap = new Map<
        string,
        { total_quantity: number; sender: LeaderboardEntry["sender"] }
      >();

      for (const row of (data ?? []) as any[]) {
        const existing = senderMap.get(row.sender_id);
        if (existing) {
          existing.total_quantity += row.quantity ?? 1;
        } else {
          senderMap.set(row.sender_id, {
            total_quantity: row.quantity ?? 1,
            sender: row.sender ?? null,
          });
        }
      }

      // Sort descending by quantity and take top 10
      const leaderboard: LeaderboardEntry[] = Array.from(senderMap.entries())
        .map(([sender_id, entry]) => ({
          sender_id,
          total_quantity: entry.total_quantity,
          sender: entry.sender,
        }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10);

      return leaderboard;
    },
    enabled: !!targetType && !!targetId,
  });
}
