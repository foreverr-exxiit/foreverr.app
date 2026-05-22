import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "../supabase/client";
import { awardEngagementPoints } from "../services/engagement";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type MilestoneType =
  | "birth" | "first_steps" | "first_words" | "first_day_school"
  | "graduation_elementary" | "graduation_high_school" | "graduation_college"
  | "first_job" | "promotion" | "retirement"
  | "engagement" | "wedding" | "anniversary" | "first_child" | "adoption"
  | "baptism" | "bar_mitzvah" | "confirmation" | "first_communion"
  | "first_trip" | "milestone_birthday" | "achievement" | "award"
  | "military_service" | "homeownership" | "learned_to_drive" | "first_pet"
  | "custom";

export type MilestoneCategory =
  | "childhood" | "education" | "career" | "relationships"
  | "family" | "spiritual" | "achievements" | "lifestyle";

export interface Milestone {
  id: string;
  memorial_id: string;
  created_by: string;
  milestone_type: MilestoneType;
  title: string;
  description: string | null;
  milestone_date: string | null;
  age_at_milestone: number | null;
  location: string | null;
  photo_url: string | null;
  media_urls: string[];
  is_verified: boolean;
  verified_by: string | null;
  emoji: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneTemplate {
  id: number;
  milestone_type: MilestoneType;
  label: string;
  emoji: string;
  category: MilestoneCategory;
  typical_age_range: string | null;
  description: string | null;
  sort_order: number;
}

/* ------------------------------------------------------------------ */
/*  useMilestoneTemplates — fetch all pre-defined milestone templates   */
/* ------------------------------------------------------------------ */
export function useMilestoneTemplates(category?: MilestoneCategory) {
  return useQuery({
    queryKey: ["milestone-templates", category],
    queryFn: async () => {
      let query = (supabase as any)
        .from("milestone_templates")
        .select("*")
        .order("sort_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MilestoneTemplate[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour — templates rarely change
  });
}

/* ------------------------------------------------------------------ */
/*  useMilestonesByCategory — templates grouped by category            */
/* ------------------------------------------------------------------ */
export function useMilestonesByCategory() {
  const { data: templates, ...rest } = useMilestoneTemplates();

  const byCategory = useMemo(() =>
    (templates ?? []).reduce<Record<string, MilestoneTemplate[]>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {}),
  [templates]);

  return useMemo(() => ({ ...rest, data: byCategory, flatTemplates: templates }), [rest.isLoading, rest.error, byCategory, templates]);
}

/* ------------------------------------------------------------------ */
/*  useMemorialMilestones — fetch milestones for a specific memorial   */
/* ------------------------------------------------------------------ */
export function useMemorialMilestones(memorialId: string | undefined) {
  return useQuery({
    queryKey: ["memorial-milestones", memorialId],
    enabled: !!memorialId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_milestones")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("milestone_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return (data ?? []) as Milestone[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/*  useCreateMilestone — add a new milestone to a memorial             */
/* ------------------------------------------------------------------ */
export function useCreateMilestone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      memorial_id: string;
      created_by: string;
      milestone_type: MilestoneType;
      title: string;
      description?: string;
      milestone_date?: string;
      age_at_milestone?: number;
      location?: string;
      photo_url?: string;
      media_urls?: string[];
      emoji?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("life_milestones")
        .insert({
          memorial_id: input.memorial_id,
          created_by: input.created_by,
          milestone_type: input.milestone_type,
          title: input.title,
          description: input.description ?? null,
          milestone_date: input.milestone_date ?? null,
          age_at_milestone: input.age_at_milestone ?? null,
          location: input.location ?? null,
          photo_url: input.photo_url ?? null,
          media_urls: input.media_urls ?? [],
          emoji: input.emoji ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["memorial-milestones", vars.memorial_id] });
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
      qc.invalidateQueries({ queryKey: ["timeline-stats", vars.memorial_id] });
      awardEngagementPoints(vars.created_by, "add_milestone", { referenceId: data.id });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useUpdateMilestone                                                  */
/* ------------------------------------------------------------------ */
export function useUpdateMilestone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      memorial_id: string;
      title?: string;
      description?: string;
      milestone_date?: string;
      age_at_milestone?: number;
      location?: string;
      photo_url?: string;
      emoji?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.milestone_date !== undefined) updates.milestone_date = input.milestone_date;
      if (input.age_at_milestone !== undefined) updates.age_at_milestone = input.age_at_milestone;
      if (input.location !== undefined) updates.location = input.location;
      if (input.photo_url !== undefined) updates.photo_url = input.photo_url;
      if (input.emoji !== undefined) updates.emoji = input.emoji;

      const { data, error } = await (supabase as any)
        .from("life_milestones")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["memorial-milestones", vars.memorial_id] });
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useDeleteMilestone                                                  */
/* ------------------------------------------------------------------ */
export function useDeleteMilestone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; memorial_id: string }) => {
      const { error } = await (supabase as any)
        .from("life_milestones")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["memorial-milestones", vars.memorial_id] });
      qc.invalidateQueries({ queryKey: ["life-timeline", vars.memorial_id] });
      qc.invalidateQueries({ queryKey: ["timeline-stats", vars.memorial_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useMilestoneCompletion — which milestones have been recorded       */
/* ------------------------------------------------------------------ */
export function useMilestoneCompletion(memorialId: string | undefined) {
  const { data: milestones } = useMemorialMilestones(memorialId);
  const { data: templates } = useMilestoneTemplates();

  return useMemo(() => {
    const completedTypes = new Set((milestones ?? []).map((m) => m.milestone_type));
    const totalTemplates = (templates ?? []).length;
    const completedCount = (templates ?? []).filter((t) => completedTypes.has(t.milestone_type)).length;
    const percentage = totalTemplates > 0 ? Math.round((completedCount / totalTemplates) * 100) : 0;

    const uncompleted = (templates ?? []).filter((t) => !completedTypes.has(t.milestone_type));
    const suggested = uncompleted.slice(0, 5); // Top 5 suggestions

    return {
      completedTypes,
      completedCount,
      totalTemplates,
      percentage,
      uncompleted,
      suggested,
    };
  }, [milestones, templates]);
}
