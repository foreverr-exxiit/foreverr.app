import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share, Platform } from "react-native";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type ShareCard = Database["public"]["Tables"]["share_cards"]["Row"];
type ShareCardInsert = Database["public"]["Tables"]["share_cards"]["Insert"];
type LegacyLink = Database["public"]["Tables"]["legacy_links"]["Row"];

const SHARING_KEY = "sharing";
const LEGACY_LINK_KEY = "legacy-links";

const APP_BASE_URL = "https://foreverr.app";

// ============================================================
// Generate share card data for any target
// ============================================================

interface ShareCardData {
  shareUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
}

export function useGenerateShareCard(
  targetType: string | undefined,
  targetId: string | undefined
) {
  return useQuery({
    queryKey: [SHARING_KEY, "card", targetType, targetId],
    queryFn: async (): Promise<ShareCardData> => {
      if (!targetType || !targetId) {
        return { shareUrl: APP_BASE_URL, ogTitle: "Foreverr", ogDescription: "Honor. Remember. Forever.", ogImageUrl: null };
      }

      // Build share data based on target type
      switch (targetType) {
        case "memorial": {
          const { data } = await supabase
            .from("memorials")
            .select("id, first_name, last_name, slug, profile_photo_url, obituary")
            .eq("id", targetId)
            .single();
          if (!data) break;
          const slug = data.slug || data.id;
          return {
            shareUrl: `${APP_BASE_URL}/memorial/${slug}`,
            ogTitle: `${data.first_name} ${data.last_name} — Memorial on Foreverr`,
            ogDescription: data.obituary
              ? `${(data.obituary as string).slice(0, 150)}...`
              : `Remember and honor ${data.first_name} ${data.last_name} on Foreverr`,
            ogImageUrl: data.profile_photo_url,
          };
        }
        case "tribute": {
          const { data } = await supabase
            .from("tributes")
            .select("id, content, memorial_id, author_id, memorials:memorial_id(first_name, last_name, slug)")
            .eq("id", targetId)
            .single();
          if (!data) break;
          const memorial = data.memorials as any;
          const slug = memorial?.slug || data.memorial_id;
          return {
            shareUrl: `${APP_BASE_URL}/memorial/${slug}`,
            ogTitle: `Tribute for ${memorial?.first_name ?? ""} ${memorial?.last_name ?? ""} — Foreverr`,
            ogDescription: data.content
              ? `"${(data.content as string).slice(0, 150)}..."`
              : "A heartfelt tribute on Foreverr",
            ogImageUrl: null,
          };
        }
        case "profile": {
          const { data } = await supabase
            .from("profiles")
            .select("id, display_name, username, avatar_url, bio, legacy_link_slug")
            .eq("id", targetId)
            .single();
          if (!data) break;
          const slug = data.legacy_link_slug || data.username || data.id;
          return {
            shareUrl: `${APP_BASE_URL}/${slug}`,
            ogTitle: `${data.display_name} — Foreverr`,
            ogDescription: data.bio || `View ${data.display_name}'s legacy on Foreverr`,
            ogImageUrl: data.avatar_url,
          };
        }
        case "event": {
          const { data } = await supabase
            .from("events")
            .select("id, title, description, memorial_id")
            .eq("id", targetId)
            .single();
          if (!data) break;
          return {
            shareUrl: `${APP_BASE_URL}/events/${data.id}`,
            ogTitle: `${data.title} — Foreverr`,
            ogDescription: data.description || "An event on Foreverr",
            ogImageUrl: null,
          };
        }
        case "badge": {
          return {
            shareUrl: `${APP_BASE_URL}/badges`,
            ogTitle: "I earned a badge on Foreverr!",
            ogDescription: "Join me in honoring and remembering those who matter most.",
            ogImageUrl: null,
          };
        }
        default:
          break;
      }

      return {
        shareUrl: APP_BASE_URL,
        ogTitle: "Foreverr",
        ogDescription: "Honor. Remember. Forever.",
        ogImageUrl: null,
      };
    },
    enabled: !!targetType && !!targetId,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}

// ============================================================
// Share content via native share sheet + log analytics
// ============================================================

export function useShareContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      targetType,
      targetId,
      title,
      message,
      url,
      platform,
    }: {
      userId?: string | null;
      targetType: string;
      targetId: string;
      title: string;
      message: string;
      url: string;
      platform?: string;
    }) => {
      // Trigger native share sheet
      const shareResult = await Share.share(
        Platform.OS === "ios"
          ? { message, url }
          : { message: `${message}\n\n${url}` },
        { dialogTitle: title }
      );

      // Determine platform from result
      const sharePlatform = platform || (shareResult.action === Share.sharedAction ? "native" : "copy_link");

      // Log to analytics
      const { error } = await supabase.from("share_cards").insert({
        user_id: userId || null,
        target_type: targetType,
        target_id: targetId,
        share_platform: sharePlatform,
        share_url: url,
        og_title: title,
        og_description: message.slice(0, 300),
      } as any);
      if (error) console.warn("Share log error:", error.message);

      return shareResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHARING_KEY] });
    },
  });
}

// ============================================================
// Share to Instagram/Facebook Stories
// ============================================================

export function useShareToStory() {
  return useMutation({
    mutationFn: async ({
      platform,
      message,
      url,
    }: {
      platform: "instagram" | "facebook";
      message: string;
      url: string;
    }) => {
      // For now, use the native share with a message including the URL
      // Full Instagram Stories SDK integration would require expo-sharing with image
      const result = await Share.share(
        Platform.OS === "ios"
          ? { message: `${message}\n\n${url}`, url }
          : { message: `${message}\n\n${url}` },
        { dialogTitle: `Share to ${platform === "instagram" ? "Instagram" : "Facebook"}` }
      );
      return result;
    },
  });
}

// ============================================================
// Legacy Link — query user's vanity URL
// ============================================================

export function useLegacyLink(userId: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_LINK_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_links")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as LegacyLink | null;
    },
    enabled: !!userId,
  });
}

// ============================================================
// Legacy Link — claim a vanity URL slug
// ============================================================

export function useCreateLegacyLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      slug,
    }: {
      userId: string;
      slug: string;
    }) => {
      // Validate slug format
      const slugRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
      if (!slugRegex.test(slug)) {
        throw new Error("Slug must be 3-30 characters, lowercase letters, numbers, and hyphens only");
      }

      // Check if slug is taken
      const { data: existing } = await supabase
        .from("legacy_links")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) {
        throw new Error("This link is already taken. Try another one!");
      }

      // Check if user already has a link (upsert)
      const { data: userLink } = await supabase
        .from("legacy_links")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (userLink) {
        // Update existing
        const { data, error } = await supabase
          .from("legacy_links")
          .update({ slug })
          .eq("user_id", userId)
          .select()
          .single();
        if (error) throw error;
        return data as LegacyLink;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("legacy_links")
          .insert({ user_id: userId, slug })
          .select()
          .single();
        if (error) throw error;
        return data as LegacyLink;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LEGACY_LINK_KEY, vars.userId] });
      queryClient.invalidateQueries({ queryKey: ["public-profile", vars.userId] });
    },
  });
}

// ============================================================
// Share analytics for a target
// ============================================================

export function useShareAnalytics(
  targetType: string | undefined,
  targetId: string | undefined
) {
  return useQuery({
    queryKey: [SHARING_KEY, "analytics", targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("share_cards")
        .select("share_platform, created_at")
        .eq("target_type", targetType!)
        .eq("target_id", targetId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const totalShares = (data ?? []).length;
      const platformCounts: Record<string, number> = {};
      for (const card of data ?? []) {
        const p = card.share_platform ?? "other";
        platformCounts[p] = (platformCounts[p] ?? 0) + 1;
      }

      return { totalShares, platformCounts };
    },
    enabled: !!targetType && !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}
