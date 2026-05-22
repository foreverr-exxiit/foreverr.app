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
    first_name: string;
    last_name: string;
    slug: string;
    profile_photo_url: string | null;
    cover_photo_url: string | null;
    date_of_birth: string | null;
    date_of_death: string | null;
    lifecycle_stage: string;
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
        .select("id, first_name, last_name, slug, profile_photo_url, cover_photo_url, date_of_birth, date_of_death, lifecycle_stage")
        .eq("created_by", userId!)
        .eq("status", "active")
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
        .eq("author_id", userId!);
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
