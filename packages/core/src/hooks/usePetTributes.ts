import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { captureException } from "../services/errorReporting";

/* ------------------------------------------------------------------ */
/*  Pet tributes — the tribute wall for pet pages.                    */
/*  Backend: pet_tributes (migration 00036).                          */
/* ------------------------------------------------------------------ */

const PET_KEY = "pet-tributes";

export interface PetTribute {
  id: string;
  pet_id: string;
  author_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  reaction_count: number;
  created_at: string;
  author?: { display_name: string | null; avatar_url: string | null } | null;
}

export function usePetTributes(petId: string | undefined) {
  return useQuery({
    queryKey: [PET_KEY, petId],
    enabled: !!petId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pet_tributes")
        .select(
          "*, author:profiles!pet_tributes_author_id_fkey(display_name, avatar_url)",
        )
        .eq("pet_id", petId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PetTribute[];
    },
  });
}

/* ── Pet milestones (growth / journey timeline) ───────────────────── */

export type PetMilestoneType =
  | "birthday"
  | "adoption_day"
  | "training"
  | "health"
  | "travel"
  | "achievement"
  | "funny_moment"
  | "other";

export interface PetMilestone {
  id: string;
  pet_id: string;
  title: string;
  description: string | null;
  milestone_date: string | null;
  photo_url: string | null;
  milestone_type: PetMilestoneType;
  created_at: string;
}

export function usePetMilestones(petId: string | undefined) {
  return useQuery({
    queryKey: ["pet-milestones", petId],
    enabled: !!petId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pet_milestones")
        .select("*")
        .eq("pet_id", petId!)
        .order("milestone_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PetMilestone[];
    },
  });
}

export function useAddPetMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      petId: string;
      title: string;
      milestoneType: PetMilestoneType;
      description?: string;
      milestoneDate?: string;
      photoUrl?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("pet_milestones")
        .insert({
          pet_id: input.petId,
          title: input.title,
          milestone_type: input.milestoneType,
          description: input.description ?? null,
          milestone_date: input.milestoneDate ?? new Date().toISOString().split("T")[0],
          photo_url: input.photoUrl ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PetMilestone;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["pet-milestones", vars.petId] });
    },
    onError: (err, vars) => {
      captureException(err, {
        where: "usePetTributes.useAddPetMilestone",
        pet_id: vars.petId,
      });
    },
  });
}

export function useCreatePetTribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      petId: string;
      authorId: string;
      content: string;
      mediaUrl?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("pet_tributes")
        .insert({
          pet_id: input.petId,
          author_id: input.authorId,
          content: input.content,
          media_url: input.mediaUrl ?? null,
          media_type: input.mediaUrl ? "photo" : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PetTribute;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [PET_KEY, vars.petId] });
    },
    onError: (err, vars) => {
      captureException(err, {
        where: "usePetTributes.useCreatePetTribute",
        pet_id: vars.petId,
      });
    },
  });
}
