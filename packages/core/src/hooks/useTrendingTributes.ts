import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useTrendingTributes(limit = 20) {
  return useQuery({
    queryKey: ["trending-tributes", limit],
    queryFn: async () => {
      // Fetch recent tributes with high engagement, joined with memorial + profile
      const { data, error } = await (supabase as any)
        .from("tributes")
        .select(`
          id,
          content,
          type,
          media_url,
          like_count,
          comment_count,
          created_at,
          memorial:memorials!tributes_memorial_id_fkey(
            id, first_name, last_name, date_of_birth, date_of_death,
            profile_photo_url, cover_photo_url, slug, lifecycle_stage
          ),
          user:profiles!tributes_author_id_fkey(
            id, display_name, username, avatar_url
          )
        `)
        .order("like_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
