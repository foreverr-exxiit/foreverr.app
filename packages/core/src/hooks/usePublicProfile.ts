import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type Profile = Tables["profiles"]["Row"];
type UserBadge = Tables["user_badges"]["Row"];
type BadgeDefinition = Tables["badge_definitions"]["Row"];

const PUBLIC_PROFILE_KEY = "public-profile";

type BadgeWithDef = UserBadge & {
  definition: BadgeDefinition | null;
};

interface PublicProfile {
  profile: Profile;
  hostedMemorials: Array<{
    id: string;
    name: string;
    slug: string;
    cover_image_url: string | null;
    born_date: string | null;
    passed_date: string | null;
  }>;
  displayedBadges: BadgeWithDef[];
  tributeCount: number;
}

// ============================================================
// Full public profile with badges + hosted memorials
// ============================================================

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [PUBLIC_PROFILE_KEY, userId],
    queryFn: async (): Promise<PublicProfile> => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (profileError) throw profileError;

      // Fetch hosted memorials (cast to any to avoid TS2589 deep instantiation)
      const memorialsResult = await (supabase as any)
        .from("memorials")
        .select("id, name, slug, cover_image_url, born_date, passed_date")
        .eq("created_by", userId!)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);
      const memorials = (memorialsResult.data ?? []) as any[];

      // Fetch displayed badges (cast to any to avoid TS2589)
      const badgesResult = await (supabase as any)
        .from("user_badges")
        .select("*, definition:badge_definitions!user_badges_badge_type_fkey(*)")
        .eq("user_id", userId!)
        .eq("is_displayed", true)
        .order("earned_at", { ascending: false });
      const badges = (badgesResult.data ?? []) as unknown as BadgeWithDef[];

      // Fetch tribute count
      const tributeResult = await (supabase as any)
        .from("tributes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId!);
      const tributeCount = (tributeResult.count ?? 0) as number;

      return {
        profile: profile as Profile,
        hostedMemorials: memorials,
        displayedBadges: badges,
        tributeCount,
      };
    },
    enabled: !!userId,
  });
}
