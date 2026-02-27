import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database, Json } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type VirtualSpace = Tables["virtual_spaces"]["Row"];
type VirtualSpaceItem = Tables["virtual_space_items"]["Row"];
type MemoryStreak = Tables["memory_streaks"]["Row"];
type SeasonalDecoration = Tables["seasonal_decorations"]["Row"];
type AppliedDecoration = Tables["applied_decorations"]["Row"];

const VIRTUAL_SPACES_KEY = "virtual-spaces";
const SPACE_ITEMS_KEY = "space-items";
const MEMORY_STREAKS_KEY = "memory-streaks";
const SEASONAL_DECORATIONS_KEY = "seasonal-decorations";
const APPLIED_DECORATIONS_KEY = "applied-decorations";

// ============================================================
// Virtual Spaces
// ============================================================

/** Fetch virtual spaces for a memorial */
export function useVirtualSpaces(memorialId: string | undefined) {
  return useQuery({
    queryKey: [VIRTUAL_SPACES_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_spaces")
        .select("*, creator:profiles!virtual_spaces_created_by_fkey(id, username, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (VirtualSpace & { creator: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!memorialId,
  });
}

/** Fetch a single virtual space */
export function useVirtualSpace(spaceId: string | undefined) {
  return useQuery({
    queryKey: [VIRTUAL_SPACES_KEY, "detail", spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_spaces")
        .select("*, creator:profiles!virtual_spaces_created_by_fkey(id, username, display_name, avatar_url), memorial:memorials!virtual_spaces_memorial_id_fkey(id, first_name, last_name)")
        .eq("id", spaceId!)
        .single();
      if (error) throw error;
      return data as VirtualSpace & {
        creator: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
        memorial: { id: string; first_name: string; last_name: string } | null;
      };
    },
    enabled: !!spaceId,
  });
}

/** Create a virtual space */
export function useCreateVirtualSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      name: string;
      description?: string;
      spaceType?: string;
      themeData?: Record<string, unknown>;
      backgroundMusicUrl?: string;
      isPublic?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("virtual_spaces")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          name: params.name,
          description: params.description,
          space_type: params.spaceType ?? "memorial_room",
          theme_data: (params.themeData ?? {}) as unknown as Json,
          background_music_url: params.backgroundMusicUrl,
          is_public: params.isPublic ?? true,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as VirtualSpace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_SPACES_KEY] });
    },
  });
}

/** Update a virtual space */
export function useUpdateVirtualSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      spaceId: string;
      name?: string;
      description?: string;
      spaceType?: string;
      themeData?: Record<string, unknown>;
      backgroundMusicUrl?: string;
      isPublic?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (params.name !== undefined) updateData.name = params.name;
      if (params.description !== undefined) updateData.description = params.description;
      if (params.spaceType !== undefined) updateData.space_type = params.spaceType;
      if (params.themeData !== undefined) updateData.theme_data = params.themeData as unknown as Json;
      if (params.backgroundMusicUrl !== undefined) updateData.background_music_url = params.backgroundMusicUrl;
      if (params.isPublic !== undefined) updateData.is_public = params.isPublic;

      const { error } = await supabase
        .from("virtual_spaces")
        .update(updateData as any)
        .eq("id", params.spaceId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_SPACES_KEY, "detail", vars.spaceId] });
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_SPACES_KEY] });
    },
  });
}

// ============================================================
// Virtual Space Items
// ============================================================

/** Fetch items in a virtual space */
export function useVirtualSpaceItems(spaceId: string | undefined) {
  return useQuery({
    queryKey: [SPACE_ITEMS_KEY, spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_space_items")
        .select("*, placer:profiles!virtual_space_items_placed_by_fkey(id, username, display_name, avatar_url)")
        .eq("space_id", spaceId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (VirtualSpaceItem & { placer: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!spaceId,
  });
}

/** Place an item in a virtual space */
export function usePlaceSpaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      spaceId: string;
      placedBy: string;
      itemType: string;
      positionX?: number;
      positionY?: number;
      positionZ?: number;
      rotationX?: number;
      rotationY?: number;
      rotationZ?: number;
      scale?: number;
      mediaUrl?: string;
      textContent?: string;
      message?: string;
      color?: string;
      animation?: string;
      isPermanent?: boolean;
      expiresAt?: string;
      ribbonCost?: number;
    }) => {
      const { data, error } = await supabase
        .from("virtual_space_items")
        .insert({
          space_id: params.spaceId,
          placed_by: params.placedBy,
          item_type: params.itemType,
          position_x: params.positionX ?? 0,
          position_y: params.positionY ?? 0,
          position_z: params.positionZ ?? 0,
          rotation_x: params.rotationX ?? 0,
          rotation_y: params.rotationY ?? 0,
          rotation_z: params.rotationZ ?? 0,
          scale: params.scale ?? 1.0,
          media_url: params.mediaUrl,
          text_content: params.textContent,
          message: params.message,
          color: params.color,
          animation: params.animation,
          is_permanent: params.isPermanent ?? false,
          expires_at: params.expiresAt,
          ribbon_cost: params.ribbonCost ?? 0,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as VirtualSpaceItem;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [SPACE_ITEMS_KEY, vars.spaceId] });
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_SPACES_KEY] });
    },
  });
}

/** Remove an item from a virtual space */
export function useRemoveSpaceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; spaceId: string }) => {
      const { error } = await supabase
        .from("virtual_space_items")
        .delete()
        .eq("id", params.itemId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [SPACE_ITEMS_KEY, vars.spaceId] });
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_SPACES_KEY] });
    },
  });
}

// ============================================================
// Memory Streaks
// ============================================================

/** Fetch user's memory streaks */
export function useMyMemoryStreaks(userId: string | undefined) {
  return useQuery({
    queryKey: [MEMORY_STREAKS_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_streaks")
        .select("*, memorial:memorials!memory_streaks_memorial_id_fkey(id, first_name, last_name, profile_photo_url)")
        .eq("user_id", userId!)
        .order("current_streak", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (MemoryStreak & { memorial: { id: string; first_name: string; last_name: string; profile_photo_url: string | null } | null })[];
    },
    enabled: !!userId,
  });
}

/** Update/record a streak activity */
export function useRecordStreakActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      memorialId: string;
      activityType: "visit" | "candle" | "memory";
    }) => {
      const today = new Date().toISOString().split("T")[0];

      // Upsert the streak record
      const { data: existingRaw } = await supabase
        .from("memory_streaks")
        .select("*")
        .eq("user_id", params.userId)
        .eq("memorial_id", params.memorialId)
        .single();
      const existing = existingRaw as MemoryStreak | null;

      if (!existing) {
        // Create new streak
        const { error } = await supabase.from("memory_streaks").insert({
          user_id: params.userId,
          memorial_id: params.memorialId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_visits: params.activityType === "visit" ? 1 : 0,
          total_candles_lit: params.activityType === "candle" ? 1 : 0,
          total_memories_shared: params.activityType === "memory" ? 1 : 0,
        } as any);
        if (error) throw error;
      } else {
        // Update existing streak
        const lastDate = existing.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const isConsecutive = lastDate === yesterday;
        const isSameDay = lastDate === today;

        const newStreak = isSameDay
          ? existing.current_streak
          : isConsecutive
            ? existing.current_streak + 1
            : 1;
        const newLongest = Math.max(newStreak, existing.longest_streak);

        const updateData: Record<string, unknown> = {
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
        };

        if (params.activityType === "visit") updateData.total_visits = existing.total_visits + 1;
        if (params.activityType === "candle") updateData.total_candles_lit = existing.total_candles_lit + 1;
        if (params.activityType === "memory") updateData.total_memories_shared = existing.total_memories_shared + 1;

        const { error } = await supabase
          .from("memory_streaks")
          .update(updateData as any)
          .eq("id", existing.id);
        if (error) throw error;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [MEMORY_STREAKS_KEY, vars.userId] });
    },
  });
}

// ============================================================
// Seasonal Decorations
// ============================================================

/** Fetch available seasonal decorations */
export function useSeasonalDecorations() {
  return useQuery({
    queryKey: [SEASONAL_DECORATIONS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasonal_decorations")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SeasonalDecoration[];
    },
  });
}

/** Fetch decorations applied to a memorial */
export function useAppliedDecorations(memorialId: string | undefined) {
  return useQuery({
    queryKey: [APPLIED_DECORATIONS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applied_decorations")
        .select("*, decoration:seasonal_decorations!applied_decorations_decoration_id_fkey(*)")
        .eq("memorial_id", memorialId!)
        .gte("expires_at", new Date().toISOString());
      if (error) throw error;
      return (data ?? []) as (AppliedDecoration & { decoration: SeasonalDecoration | null })[];
    },
    enabled: !!memorialId,
  });
}

/** Apply a decoration to a memorial */
export function useApplyDecoration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      decorationId: string;
      appliedBy: string;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase
        .from("applied_decorations")
        .insert({
          memorial_id: params.memorialId,
          decoration_id: params.decorationId,
          applied_by: params.appliedBy,
          expires_at: params.expiresAt,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as AppliedDecoration;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [APPLIED_DECORATIONS_KEY, vars.memorialId] });
    },
  });
}
