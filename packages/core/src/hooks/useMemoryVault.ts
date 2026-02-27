import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database, Json } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type MemoryVaultItem = Tables["memory_vault_items"]["Row"];
type TimeCapsule = Tables["time_capsules"]["Row"];
type LegacyLetter = Tables["legacy_letters"]["Row"];
type ScrapbookPage = Tables["scrapbook_pages"]["Row"];
type MemorialQRCode = Tables["memorial_qr_codes"]["Row"];

const VAULT_KEY = "memory-vault";
const TIME_CAPSULES_KEY = "time-capsules";
const LEGACY_LETTERS_KEY = "legacy-letters";
const SCRAPBOOK_KEY = "scrapbook-pages";
const QR_CODES_KEY = "qr-codes";
const PAGE_SIZE = 20;

// ============================================================
// Memory Vault Items
// ============================================================

/** Fetch vault items for a memorial */
export function useMemoryVaultItems(memorialId: string | undefined, itemType?: string) {
  return useInfiniteQuery({
    queryKey: [VAULT_KEY, memorialId, itemType],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("memory_vault_items")
        .select("*, uploader:profiles!memory_vault_items_uploaded_by_fkey(id, username, display_name, avatar_url)")
        .eq("memorial_id", memorialId!);

      if (itemType) {
        query = query.eq("item_type", itemType);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      const items = (data ?? []) as (MemoryVaultItem & { uploader: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
      return {
        data: items,
        nextCursor: items.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!memorialId,
  });
}

/** Create a vault item */
export function useCreateVaultItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      uploadedBy: string;
      itemType: string;
      title: string;
      description?: string;
      content?: string;
      mediaUrl?: string;
      thumbnailUrl?: string;
      metadata?: Record<string, unknown>;
      isPrivate?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("memory_vault_items")
        .insert({
          memorial_id: params.memorialId,
          uploaded_by: params.uploadedBy,
          item_type: params.itemType,
          title: params.title,
          description: params.description,
          content: params.content,
          media_url: params.mediaUrl,
          thumbnail_url: params.thumbnailUrl,
          metadata: (params.metadata ?? {}) as unknown as Json,
          is_private: params.isPrivate ?? false,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as MemoryVaultItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_KEY] });
    },
  });
}

/** Delete a vault item */
export function useDeleteVaultItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("memory_vault_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_KEY] });
    },
  });
}

// ============================================================
// Time Capsules
// ============================================================

/** Fetch time capsules for a memorial */
export function useTimeCapsules(memorialId: string | undefined) {
  return useQuery({
    queryKey: [TIME_CAPSULES_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_capsules")
        .select("*, creator:profiles!time_capsules_created_by_fkey(id, username, display_name, avatar_url)")
        .eq("memorial_id", memorialId!)
        .order("unlock_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (TimeCapsule & { creator: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!memorialId,
  });
}

/** Create a time capsule */
export function useCreateTimeCapsule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      title: string;
      description?: string;
      content?: string;
      mediaUrl?: string;
      unlockDate: string;
      recipientIds?: string[];
      notifyOnUnlock?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("time_capsules")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          title: params.title,
          description: params.description,
          content: params.content,
          media_url: params.mediaUrl,
          unlock_date: params.unlockDate,
          recipient_ids: params.recipientIds ?? [],
          notify_on_unlock: params.notifyOnUnlock ?? true,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as TimeCapsule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIME_CAPSULES_KEY] });
    },
  });
}

// ============================================================
// Legacy Letters
// ============================================================

/** Fetch legacy letters written by a user */
export function useMyLegacyLetters(userId: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_LETTERS_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_letters")
        .select("*")
        .eq("author_id", userId!)
        .order("delivery_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as LegacyLetter[];
    },
    enabled: !!userId,
  });
}

/** Fetch legacy letters received by a user */
export function useReceivedLetters(userId: string | undefined) {
  return useQuery({
    queryKey: [LEGACY_LETTERS_KEY, "received", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legacy_letters")
        .select("*, author:profiles!legacy_letters_author_id_fkey(id, username, display_name, avatar_url)")
        .eq("recipient_user_id", userId!)
        .eq("is_delivered", true)
        .order("delivered_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (LegacyLetter & { author: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!userId,
  });
}

/** Create a legacy letter */
export function useCreateLegacyLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      authorId: string;
      memorialId?: string;
      recipientName: string;
      recipientEmail?: string;
      recipientUserId?: string;
      subject: string;
      content: string;
      mediaUrl?: string;
      deliveryDate: string;
      deliveryType?: string;
    }) => {
      const { data, error } = await supabase
        .from("legacy_letters")
        .insert({
          author_id: params.authorId,
          memorial_id: params.memorialId,
          recipient_name: params.recipientName,
          recipient_email: params.recipientEmail,
          recipient_user_id: params.recipientUserId,
          subject: params.subject,
          content: params.content,
          media_url: params.mediaUrl,
          delivery_date: params.deliveryDate,
          delivery_type: params.deliveryType ?? "in_app",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as LegacyLetter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEGACY_LETTERS_KEY] });
    },
  });
}

/** Mark a letter as read */
export function useMarkLetterRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (letterId: string) => {
      const { error } = await supabase
        .from("legacy_letters")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", letterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEGACY_LETTERS_KEY] });
    },
  });
}

// ============================================================
// Scrapbook Pages
// ============================================================

/** Fetch scrapbook pages for a memorial */
export function useScrapbookPages(memorialId: string | undefined) {
  return useQuery({
    queryKey: [SCRAPBOOK_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrapbook_pages")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("page_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ScrapbookPage[];
    },
    enabled: !!memorialId,
  });
}

/** Create a scrapbook page */
export function useCreateScrapbookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      title: string;
      pageNumber?: number;
      layoutData?: Record<string, unknown>;
      backgroundColor?: string;
      backgroundImageUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("scrapbook_pages")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          title: params.title,
          page_number: params.pageNumber,
          layout_data: (params.layoutData ?? {}) as unknown as Json,
          background_color: params.backgroundColor,
          background_image_url: params.backgroundImageUrl,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ScrapbookPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCRAPBOOK_KEY] });
    },
  });
}

/** Update a scrapbook page layout */
export function useUpdateScrapbookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageId: string;
      layoutData?: Record<string, unknown>;
      title?: string;
      backgroundColor?: string;
      backgroundImageUrl?: string;
      isPublished?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (params.layoutData !== undefined) updateData.layout_data = params.layoutData as unknown as Json;
      if (params.title !== undefined) updateData.title = params.title;
      if (params.backgroundColor !== undefined) updateData.background_color = params.backgroundColor;
      if (params.backgroundImageUrl !== undefined) updateData.background_image_url = params.backgroundImageUrl;
      if (params.isPublished !== undefined) updateData.is_published = params.isPublished;

      const { error } = await supabase
        .from("scrapbook_pages")
        .update(updateData as any)
        .eq("id", params.pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCRAPBOOK_KEY] });
    },
  });
}

// ============================================================
// Memorial QR Codes
// ============================================================

/** Fetch QR codes for a memorial */
export function useMemorialQRCodes(memorialId: string | undefined) {
  return useQuery({
    queryKey: [QR_CODES_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorial_qr_codes")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemorialQRCode[];
    },
    enabled: !!memorialId,
  });
}

/** Create a QR code for a memorial */
export function useCreateQRCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      label?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      // Generate a unique short code
      const code = `FVR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from("memorial_qr_codes")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          code,
          label: params.label,
          location_name: params.locationName,
          latitude: params.latitude,
          longitude: params.longitude,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as MemorialQRCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QR_CODES_KEY] });
    },
  });
}

/** Look up a memorial by QR code */
export function useQRCodeLookup(code: string | undefined) {
  return useQuery({
    queryKey: [QR_CODES_KEY, "lookup", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorial_qr_codes")
        .select("*, memorial:memorials!memorial_qr_codes_memorial_id_fkey(id, first_name, last_name, slug, profile_photo_url)")
        .eq("code", code!)
        .eq("is_active", true)
        .single();
      if (error) throw error;

      const qr = data as MemorialQRCode & { memorial: { id: string; first_name: string; last_name: string; slug: string; profile_photo_url: string | null } | null };

      // Increment scan count
      await supabase
        .from("memorial_qr_codes")
        .update({ scan_count: qr.scan_count + 1, last_scanned_at: new Date().toISOString() } as any)
        .eq("id", qr.id);

      return qr;
    },
    enabled: !!code,
  });
}
