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
