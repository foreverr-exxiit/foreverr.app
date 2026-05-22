import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PhotoFaceTag {
  id: string;
  photo_url: string;
  memorial_id: string | null;
  tagged_memorial_id: string | null;
  tagged_profile_id: string | null;
  tagged_name: string | null;
  face_x: number | null;
  face_y: number | null;
  face_width: number | null;
  face_height: number | null;
  confidence: number | null;
  is_verified: boolean;
  is_auto_detected: boolean;
  tagged_by: string | null;
  created_at: string;
}

export interface FaceEmbedding {
  id: string;
  memorial_id: string | null;
  profile_id: string | null;
  source_photo_url: string;
  embedding: number[];
  embedding_model: string;
  quality_score: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  usePhotoFaceTags — get all face tags for a specific photo          */
/* ------------------------------------------------------------------ */
export function usePhotoFaceTags(photoUrl: string | undefined) {
  return useQuery({
    queryKey: ["photo-face-tags", photoUrl],
    enabled: !!photoUrl,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("photo_face_tags")
        .select("*")
        .eq("photo_url", photoUrl!);

      if (error) throw error;
      return (data ?? []) as PhotoFaceTag[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useMemorialPhotoTags — all tags across all photos for a memorial   */
/* ------------------------------------------------------------------ */
export function useMemorialPhotoTags(memorialId: string | undefined) {
  return useQuery({
    queryKey: ["memorial-photo-tags", memorialId],
    enabled: !!memorialId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("photo_face_tags")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PhotoFaceTag[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  usePhotosOfPerson — find all photos a person is tagged in          */
/* ------------------------------------------------------------------ */
export function usePhotosOfPerson(options: {
  memorialId?: string;
  profileId?: string;
}) {
  const hasId = !!(options.memorialId || options.profileId);

  return useQuery({
    queryKey: ["photos-of-person", options.memorialId, options.profileId],
    enabled: hasId,
    queryFn: async () => {
      let query = (supabase as any)
        .from("photo_face_tags")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.memorialId) {
        query = query.eq("tagged_memorial_id", options.memorialId);
      } else if (options.profileId) {
        query = query.eq("tagged_profile_id", options.profileId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Deduplicate by photo_url
      const seen = new Set<string>();
      const unique = ((data ?? []) as PhotoFaceTag[]).filter((tag) => {
        if (seen.has(tag.photo_url)) return false;
        seen.add(tag.photo_url);
        return true;
      });

      return unique;
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useCreatePhotoTag — manually tag someone in a photo                */
/* ------------------------------------------------------------------ */
export function useCreatePhotoTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      photo_url: string;
      memorial_id?: string;
      tagged_memorial_id?: string;
      tagged_profile_id?: string;
      tagged_name?: string;
      face_x?: number;
      face_y?: number;
      face_width?: number;
      face_height?: number;
      tagged_by: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("photo_face_tags")
        .insert({
          photo_url: input.photo_url,
          memorial_id: input.memorial_id ?? null,
          tagged_memorial_id: input.tagged_memorial_id ?? null,
          tagged_profile_id: input.tagged_profile_id ?? null,
          tagged_name: input.tagged_name ?? null,
          face_x: input.face_x ?? null,
          face_y: input.face_y ?? null,
          face_width: input.face_width ?? null,
          face_height: input.face_height ?? null,
          confidence: 1.0, // Manual tags have 100% confidence
          is_verified: true,
          is_auto_detected: false,
          tagged_by: input.tagged_by,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PhotoFaceTag;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["photo-face-tags", vars.photo_url] });
      qc.invalidateQueries({ queryKey: ["memorial-photo-tags", vars.memorial_id] });
      if (vars.tagged_memorial_id) {
        qc.invalidateQueries({ queryKey: ["photos-of-person", vars.tagged_memorial_id] });
      }
      if (vars.tagged_profile_id) {
        qc.invalidateQueries({ queryKey: ["photos-of-person", undefined, vars.tagged_profile_id] });
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useVerifyPhotoTag — confirm an auto-detected tag is correct        */
/* ------------------------------------------------------------------ */
export function useVerifyPhotoTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; photo_url: string }) => {
      const { data, error } = await (supabase as any)
        .from("photo_face_tags")
        .update({ is_verified: true })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as PhotoFaceTag;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["photo-face-tags", vars.photo_url] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useDeletePhotoTag — remove a tag                                   */
/* ------------------------------------------------------------------ */
export function useDeletePhotoTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; photo_url: string; memorial_id?: string }) => {
      const { error } = await (supabase as any)
        .from("photo_face_tags")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["photo-face-tags", vars.photo_url] });
      if (vars.memorial_id) {
        qc.invalidateQueries({ queryKey: ["memorial-photo-tags", vars.memorial_id] });
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useFaceEmbeddings — get stored face embeddings for a person        */
/* ------------------------------------------------------------------ */
export function useFaceEmbeddings(memorialId: string | undefined) {
  return useQuery({
    queryKey: ["face-embeddings", memorialId],
    enabled: !!memorialId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("face_embeddings")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return (data ?? []) as FaceEmbedding[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useTagSuggestions — suggest people to tag based on memorial context */
/* ------------------------------------------------------------------ */
export function useTagSuggestions(memorialId: string | undefined) {
  return useQuery({
    queryKey: ["tag-suggestions", memorialId],
    enabled: !!memorialId,
    queryFn: async () => {
      // Fetch family tree members linked to this memorial
      const { data: treeMembers } = await (supabase as any)
        .from("family_tree_members")
        .select("id, name, memorial_id, profile_id, relationship_type, photo_url")
        .eq("tree_id", memorialId!)
        .limit(50);

      // Fetch contributors who have posted tributes
      const { data: contributors } = await (supabase as any)
        .from("tributes")
        .select("author_id, profiles:profiles!tributes_author_id_fkey(id, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .limit(20);

      const suggestions: Array<{
        id: string;
        name: string;
        type: "memorial" | "profile" | "family_member";
        photo_url: string | null;
        memorial_id?: string;
        profile_id?: string;
      }> = [];

      // Add family members
      for (const m of (treeMembers ?? []) as any[]) {
        suggestions.push({
          id: m.id,
          name: m.name,
          type: "family_member",
          photo_url: m.photo_url,
          memorial_id: m.memorial_id,
          profile_id: m.profile_id,
        });
      }

      // Add contributors
      const seen = new Set(suggestions.map((s) => s.id));
      for (const c of (contributors ?? []) as any[]) {
        const profile = c.profiles;
        if (profile && !seen.has(profile.id)) {
          seen.add(profile.id);
          suggestions.push({
            id: profile.id,
            name: profile.display_name ?? "Unknown",
            type: "profile",
            photo_url: profile.avatar_url,
            profile_id: profile.id,
          });
        }
      }

      return suggestions;
    },
    staleTime: 10 * 60 * 1000,
  });
}
