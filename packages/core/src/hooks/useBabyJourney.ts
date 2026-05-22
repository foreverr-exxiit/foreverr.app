import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";

const BABY_KEY = "baby-journey";
const PAGE_SIZE = 20;

// ============================================================
// Types
// ============================================================

export type BabyStage =
  | "expecting" | "newborn" | "infant" | "toddler" | "preschool"
  | "elementary" | "tween" | "teenager" | "young_adult" | "adult";

export type BabyMilestoneType =
  // Expecting
  | "first_ultrasound" | "gender_reveal" | "first_kick" | "baby_shower"
  | "nursery_ready" | "birth_plan" | "hospital_bag" | "contractions_start"
  | "water_broke" | "birth"
  // Newborn
  | "first_cry" | "first_hold" | "first_feed" | "umbilical_cord_off"
  | "first_bath" | "first_smile" | "first_night_home" | "naming_ceremony"
  // Infant
  | "first_laugh" | "first_roll" | "first_solid_food" | "first_tooth"
  | "first_crawl" | "first_steps" | "first_word" | "first_haircut"
  | "first_birthday" | "first_wave"
  // Toddler
  | "first_sentence" | "potty_trained" | "first_friend" | "first_tantrum"
  | "first_drawing" | "learned_abc" | "first_bike" | "started_daycare"
  // Preschool
  | "first_day_preschool" | "learned_to_write_name" | "first_performance"
  | "lost_first_tooth" | "first_sleepover" | "kindergarten_ready"
  // Elementary
  | "first_day_school" | "first_report_card" | "learned_to_read"
  | "first_sports_team" | "first_instrument" | "elementary_graduation"
  // Tween/Teen
  | "middle_school" | "first_phone" | "learners_permit" | "first_date"
  | "high_school_graduation" | "college_acceptance"
  // Young Adult
  | "moved_out" | "first_job" | "college_graduation" | "first_apartment"
  | "custom";

export type BabyMood =
  | "joyful" | "proud" | "tired" | "grateful" | "emotional" | "funny" | "challenging";

export interface BabyPage {
  id: string;
  created_by: string;
  baby_name: string;
  nickname: string | null;
  date_of_birth: string | null;
  due_date: string | null;
  gender: string | null;
  birth_weight_oz: number | null;
  birth_length_in: number | null;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  bio: string | null;
  current_stage: BabyStage;
  privacy: string;
  status: string;
  slug: string | null;
  follower_count: number;
  milestone_count: number;
  photo_count: number;
  update_count: number;
  lifecycle_stage: string;
  created_at: string;
  updated_at: string;
}

export interface BabyMilestone {
  id: string;
  baby_page_id: string;
  created_by: string | null;
  stage: BabyStage;
  milestone_type: BabyMilestoneType;
  title: string;
  description: string | null;
  milestone_date: string | null;
  age_at_milestone: string | null;
  photo_url: string | null;
  media_urls: string[];
  height_in: number | null;
  weight_oz: number | null;
  emoji: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BabyUpdate {
  id: string;
  baby_page_id: string;
  author_id: string | null;
  content: string;
  media_url: string | null;
  media_type: string | null;
  mood: BabyMood | null;
  stage: string | null;
  reaction_count: number;
  created_at: string;
}

// ============================================================
// Constants
// ============================================================

export const BABY_STAGES: { key: BabyStage; label: string; icon: string; color: string; ageRange: string }[] = [
  { key: "expecting",    label: "Expecting",     icon: "🤰", color: "#EC4899", ageRange: "Pre-birth"      },
  { key: "newborn",      label: "Newborn",       icon: "👶", color: "#F59E0B", ageRange: "0-28 days"      },
  { key: "infant",       label: "Infant",        icon: "🍼", color: "#F97316", ageRange: "1-12 months"    },
  { key: "toddler",      label: "Toddler",       icon: "🧒", color: "#EF4444", ageRange: "1-3 years"      },
  { key: "preschool",    label: "Preschool",     icon: "🎨", color: "#8B5CF6", ageRange: "3-5 years"      },
  { key: "elementary",   label: "Elementary",    icon: "📚", color: "#3B82F6", ageRange: "5-11 years"     },
  { key: "tween",        label: "Tween",         icon: "🎮", color: "#06B6D4", ageRange: "11-13 years"    },
  { key: "teenager",     label: "Teenager",      icon: "🎓", color: "#10B981", ageRange: "13-18 years"    },
  { key: "young_adult",  label: "Young Adult",   icon: "🌟", color: "#7C3AED", ageRange: "18-25 years"    },
  { key: "adult",        label: "Adult",         icon: "🏠", color: "#4A2D7A", ageRange: "25+ years"      },
];

export const STAGE_MILESTONES: Record<BabyStage, { type: BabyMilestoneType; label: string; emoji: string }[]> = {
  expecting: [
    { type: "first_ultrasound",    label: "First Ultrasound",      emoji: "📸" },
    { type: "gender_reveal",       label: "Gender Reveal",         emoji: "🎉" },
    { type: "first_kick",          label: "First Kick",            emoji: "🦶" },
    { type: "baby_shower",         label: "Baby Shower",           emoji: "🎁" },
    { type: "nursery_ready",       label: "Nursery Ready",         emoji: "🏠" },
    { type: "birth_plan",          label: "Birth Plan Done",       emoji: "📋" },
    { type: "hospital_bag",        label: "Hospital Bag Packed",   emoji: "🧳" },
    { type: "contractions_start",  label: "Contractions Started",  emoji: "⏰" },
    { type: "water_broke",         label: "Water Broke",           emoji: "💧" },
    { type: "birth",               label: "Born!",                 emoji: "🎊" },
  ],
  newborn: [
    { type: "first_cry",           label: "First Cry",             emoji: "😭" },
    { type: "first_hold",          label: "First Hold",            emoji: "🤱" },
    { type: "first_feed",          label: "First Feed",            emoji: "🍼" },
    { type: "umbilical_cord_off",  label: "Umbilical Cord Off",    emoji: "✂️" },
    { type: "first_bath",          label: "First Bath",            emoji: "🛁" },
    { type: "first_smile",         label: "First Smile",           emoji: "😊" },
    { type: "first_night_home",    label: "First Night Home",      emoji: "🏡" },
    { type: "naming_ceremony",     label: "Naming Ceremony",       emoji: "📜" },
  ],
  infant: [
    { type: "first_laugh",         label: "First Laugh",           emoji: "😄" },
    { type: "first_roll",          label: "First Roll Over",       emoji: "🔄" },
    { type: "first_solid_food",    label: "First Solid Food",      emoji: "🥣" },
    { type: "first_tooth",         label: "First Tooth",           emoji: "🦷" },
    { type: "first_crawl",         label: "First Crawl",           emoji: "🐛" },
    { type: "first_steps",         label: "First Steps",           emoji: "👣" },
    { type: "first_word",          label: "First Word",            emoji: "🗣️" },
    { type: "first_haircut",       label: "First Haircut",         emoji: "✂️" },
    { type: "first_birthday",      label: "First Birthday",        emoji: "🎂" },
    { type: "first_wave",          label: "First Wave",            emoji: "👋" },
  ],
  toddler: [
    { type: "first_sentence",      label: "First Sentence",        emoji: "💬" },
    { type: "potty_trained",       label: "Potty Trained",         emoji: "🚽" },
    { type: "first_friend",        label: "First Friend",          emoji: "👫" },
    { type: "first_tantrum",       label: "First Tantrum",         emoji: "😤" },
    { type: "first_drawing",       label: "First Drawing",         emoji: "🖍️" },
    { type: "learned_abc",         label: "Learned ABCs",          emoji: "🔤" },
    { type: "first_bike",          label: "First Bike",            emoji: "🚲" },
    { type: "started_daycare",     label: "Started Daycare",       emoji: "🏫" },
  ],
  preschool: [
    { type: "first_day_preschool",     label: "First Day of Preschool", emoji: "🎒" },
    { type: "learned_to_write_name",   label: "Wrote Their Name",       emoji: "✍️" },
    { type: "first_performance",       label: "First Performance",      emoji: "🎭" },
    { type: "lost_first_tooth",        label: "Lost First Tooth",       emoji: "🧚" },
    { type: "first_sleepover",         label: "First Sleepover",        emoji: "😴" },
    { type: "kindergarten_ready",      label: "Kindergarten Ready",     emoji: "🌈" },
  ],
  elementary: [
    { type: "first_day_school",        label: "First Day of School",    emoji: "🏫" },
    { type: "first_report_card",       label: "First Report Card",      emoji: "📝" },
    { type: "learned_to_read",         label: "Learned to Read",        emoji: "📖" },
    { type: "first_sports_team",       label: "First Sports Team",      emoji: "⚽" },
    { type: "first_instrument",        label: "First Instrument",       emoji: "🎵" },
    { type: "elementary_graduation",   label: "Elementary Graduation",  emoji: "🎓" },
  ],
  tween: [
    { type: "middle_school",           label: "Started Middle School",  emoji: "🏫" },
    { type: "first_phone",             label: "First Phone",            emoji: "📱" },
    { type: "learners_permit",         label: "Learner's Permit",       emoji: "🚗" },
    { type: "first_date",              label: "First Date",             emoji: "💕" },
    { type: "high_school_graduation",  label: "High School Graduation", emoji: "🎓" },
    { type: "college_acceptance",      label: "College Acceptance",     emoji: "🎉" },
  ],
  teenager: [
    { type: "middle_school",           label: "Started Middle School",  emoji: "🏫" },
    { type: "first_phone",             label: "First Phone",            emoji: "📱" },
    { type: "learners_permit",         label: "Learner's Permit",       emoji: "🚗" },
    { type: "first_date",              label: "First Date",             emoji: "💕" },
    { type: "high_school_graduation",  label: "High School Graduation", emoji: "🎓" },
    { type: "college_acceptance",      label: "College Acceptance",     emoji: "🎉" },
  ],
  young_adult: [
    { type: "moved_out",               label: "Moved Out",              emoji: "🏠" },
    { type: "first_job",               label: "First Job",              emoji: "💼" },
    { type: "college_graduation",      label: "College Graduation",     emoji: "🎓" },
    { type: "first_apartment",         label: "First Apartment",        emoji: "🔑" },
  ],
  adult: [
    { type: "custom",                  label: "Custom Milestone",       emoji: "⭐" },
  ],
};

export const MOOD_OPTIONS: { key: BabyMood; label: string; emoji: string }[] = [
  { key: "joyful",      label: "Joyful",      emoji: "😄" },
  { key: "proud",       label: "Proud",       emoji: "🥲" },
  { key: "tired",       label: "Tired",       emoji: "😴" },
  { key: "grateful",    label: "Grateful",    emoji: "🙏" },
  { key: "emotional",   label: "Emotional",   emoji: "🥺" },
  { key: "funny",       label: "Funny",       emoji: "😂" },
  { key: "challenging", label: "Challenging", emoji: "💪" },
];

// ============================================================
// useMyBabyPages — fetch user's baby pages
// ============================================================

export function useMyBabyPages(userId: string | undefined) {
  return useQuery({
    queryKey: [BABY_KEY, "my-pages", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("baby_pages")
        .select("*")
        .eq("created_by", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BabyPage[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// useBabyPage — fetch a single baby page
// ============================================================

export function useBabyPage(pageId: string | undefined) {
  return useQuery({
    queryKey: [BABY_KEY, "page", pageId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("baby_pages")
        .select("*")
        .eq("id", pageId!)
        .single();
      if (error) throw error;
      return data as BabyPage;
    },
    enabled: !!pageId,
  });
}

// ============================================================
// useCreateBabyPage
// ============================================================

export function useCreateBabyPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      created_by: string;
      baby_name: string;
      nickname?: string;
      date_of_birth?: string;
      due_date?: string;
      gender?: string;
      birth_weight_oz?: number;
      birth_length_in?: number;
      profile_photo_url?: string;
      cover_photo_url?: string;
      bio?: string;
      privacy?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("baby_pages")
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      awardEngagementPoints(params.created_by, "create_baby_page");
      return data as BabyPage;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "my-pages", variables.created_by] });
    },
  });
}

// ============================================================
// useUpdateBabyPage
// ============================================================

export function useUpdateBabyPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BabyPage> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("baby_pages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as BabyPage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "page", data.id] });
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "my-pages"] });
    },
  });
}

// ============================================================
// useBabyMilestones — milestones for a baby page, optionally by stage
// ============================================================

export function useBabyMilestones(pageId: string | undefined, stage?: BabyStage) {
  return useQuery({
    queryKey: [BABY_KEY, "milestones", pageId, stage],
    queryFn: async () => {
      let query = (supabase as any)
        .from("baby_milestones")
        .select("*")
        .eq("baby_page_id", pageId!)
        .order("milestone_date", { ascending: true, nullsFirst: false });

      if (stage) {
        query = query.eq("stage", stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as BabyMilestone[];
    },
    enabled: !!pageId,
  });
}

// ============================================================
// useCreateBabyMilestone
// ============================================================

export function useCreateBabyMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      baby_page_id: string;
      created_by: string;
      stage: BabyStage;
      milestone_type: BabyMilestoneType;
      title: string;
      description?: string;
      milestone_date?: string;
      age_at_milestone?: string;
      photo_url?: string;
      media_urls?: string[];
      height_in?: number;
      weight_oz?: number;
      emoji?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("baby_milestones")
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      awardEngagementPoints(params.created_by, "add_baby_milestone");
      return data as BabyMilestone;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "milestones", variables.baby_page_id] });
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "page", variables.baby_page_id] });
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "checklist", variables.baby_page_id] });
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "growth", variables.baby_page_id] });
    },
  });
}

// ============================================================
// useMilestoneChecklist — stage milestones with completion status
// ============================================================

export function useMilestoneChecklist(pageId: string | undefined, stage: BabyStage) {
  const { data: completed } = useBabyMilestones(pageId, stage);
  const stageTemplates = STAGE_MILESTONES[stage] ?? [];

  return useMemo(() => {
    const completedTypes = new Set(completed?.map((m) => m.milestone_type) ?? []);
    return stageTemplates.map((template) => ({
      ...template,
      isCompleted: completedTypes.has(template.type),
      milestone: completed?.find((m) => m.milestone_type === template.type) ?? null,
    }));
  }, [completed, stageTemplates]);
}

// ============================================================
// useNextMilestones — upcoming uncompleted milestones for current stage
// ============================================================

export function useNextMilestones(pageId: string | undefined) {
  const { data: page } = useBabyPage(pageId);
  const stage = page?.current_stage ?? "expecting";
  const checklist = useMilestoneChecklist(pageId, stage);

  return useMemo(() => {
    return checklist.filter((item) => !item.isCompleted).slice(0, 5);
  }, [checklist]);
}

// ============================================================
// useBabyUpdates — journal entries (paginated)
// ============================================================

export function useBabyUpdates(pageId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [BABY_KEY, "updates", pageId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await (supabase as any)
        .from("baby_updates")
        .select("*, author:profiles!baby_updates_author_id_fkey(id, display_name, avatar_url)")
        .eq("baby_page_id", pageId!)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return (data ?? []) as (BabyUpdate & {
        author: { id: string; display_name: string | null; avatar_url: string | null } | null;
      })[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
    enabled: !!pageId,
  });
}

// ============================================================
// useCreateBabyUpdate
// ============================================================

export function useCreateBabyUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      baby_page_id: string;
      author_id: string;
      content: string;
      media_url?: string;
      media_type?: string;
      mood?: BabyMood;
      stage?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("baby_updates")
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      awardEngagementPoints(params.author_id, "add_baby_update");
      return data as BabyUpdate;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "updates", variables.baby_page_id] });
      queryClient.invalidateQueries({ queryKey: [BABY_KEY, "page", variables.baby_page_id] });
    },
  });
}

// ============================================================
// useBabyGrowthChart — height/weight data from milestones
// ============================================================

export function useBabyGrowthChart(pageId: string | undefined) {
  const { data: allMilestones } = useBabyMilestones(pageId);

  return useMemo(() => {
    if (!allMilestones) return { heights: [], weights: [] };

    const withMeasurements = allMilestones
      .filter((m) => m.height_in !== null || m.weight_oz !== null)
      .sort((a, b) => {
        if (!a.milestone_date || !b.milestone_date) return 0;
        return new Date(a.milestone_date).getTime() - new Date(b.milestone_date).getTime();
      });

    return {
      heights: withMeasurements
        .filter((m) => m.height_in !== null)
        .map((m) => ({
          date: m.milestone_date ?? m.created_at,
          value: m.height_in!,
          label: m.age_at_milestone ?? m.title,
        })),
      weights: withMeasurements
        .filter((m) => m.weight_oz !== null)
        .map((m) => ({
          date: m.milestone_date ?? m.created_at,
          value: m.weight_oz!,
          label: m.age_at_milestone ?? m.title,
        })),
    };
  }, [allMilestones]);
}
