import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type VaultFolder = Tables["vault_folders"]["Row"];
type VaultItemTag = Tables["vault_item_tags"]["Row"];
type VaultItemFolder = Tables["vault_item_folders"]["Row"];
type MemoryVaultItem = Tables["memory_vault_items"]["Row"];

const VAULT_FOLDERS_KEY = "vault-folders";
const VAULT_TAGS_KEY = "vault-tags";
const VAULT_SEARCH_KEY = "vault-search";
const VAULT_STATS_KEY = "vault-stats";
const VAULT_KEY = "memory-vault";

// ============================================================
// Vault Folders
// ============================================================

/** Fetch vault folders for a memorial */
export function useVaultFolders(memorialId: string | undefined) {
  return useQuery({
    queryKey: [VAULT_FOLDERS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_folders")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VaultFolder[];
    },
    enabled: !!memorialId,
  });
}

/** Create a vault folder */
export function useCreateVaultFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      createdBy: string;
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      parentFolderId?: string;
    }) => {
      const { data, error } = await supabase
        .from("vault_folders")
        .insert({
          memorial_id: params.memorialId,
          created_by: params.createdBy,
          name: params.name,
          description: params.description,
          icon: params.icon ?? "folder",
          color: params.color ?? "#7C3AED",
          parent_folder_id: params.parentFolderId,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as VaultFolder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [VAULT_STATS_KEY] });
    },
  });
}

/** Delete a vault folder */
export function useDeleteVaultFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from("vault_folders")
        .delete()
        .eq("id", folderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [VAULT_STATS_KEY] });
    },
  });
}

/** Assign a vault item to a folder */
export function useAssignItemToFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; folderId: string }) => {
      const { data, error } = await supabase
        .from("vault_item_folders")
        .insert({
          item_id: params.itemId,
          folder_id: params.folderId,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as VaultItemFolder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [VAULT_KEY] });
    },
  });
}

/** Remove a vault item from a folder */
export function useRemoveItemFromFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; folderId: string }) => {
      const { error } = await supabase
        .from("vault_item_folders")
        .delete()
        .eq("item_id", params.itemId)
        .eq("folder_id", params.folderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_FOLDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [VAULT_KEY] });
    },
  });
}

// ============================================================
// Vault Tags
// ============================================================

/** Fetch all distinct tags for a memorial's vault */
export function useVaultItemTags(memorialId: string | undefined) {
  return useQuery({
    queryKey: [VAULT_TAGS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_item_tags")
        .select("*")
        .eq("memorial_id", memorialId!)
        .order("tag", { ascending: true });
      if (error) throw error;
      // Deduplicate tags
      const tagSet = new Set<string>();
      const uniqueTags: VaultItemTag[] = [];
      for (const item of (data ?? []) as VaultItemTag[]) {
        if (!tagSet.has(item.tag)) {
          tagSet.add(item.tag);
          uniqueTags.push(item);
        }
      }
      return uniqueTags;
    },
    enabled: !!memorialId,
  });
}

/** Add a tag to a vault item */
export function useTagVaultItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      itemId: string;
      tag: string;
    }) => {
      const { data, error } = await supabase
        .from("vault_item_tags")
        .insert({
          memorial_id: params.memorialId,
          item_id: params.itemId,
          tag: params.tag.toLowerCase().trim(),
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as VaultItemTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_TAGS_KEY] });
    },
  });
}

/** Remove a tag from a vault item */
export function useUntagVaultItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; tag: string }) => {
      const { error } = await supabase
        .from("vault_item_tags")
        .delete()
        .eq("item_id", params.itemId)
        .eq("tag", params.tag);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VAULT_TAGS_KEY] });
    },
  });
}

// ============================================================
// Vault Search
// ============================================================

/** Search vault items by title/description/content */
export function useSearchVaultItems(
  memorialId: string | undefined,
  query: string
) {
  return useQuery({
    queryKey: [VAULT_SEARCH_KEY, memorialId, query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_vault_items")
        .select("*")
        .eq("memorial_id", memorialId!)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as MemoryVaultItem[];
    },
    enabled: !!memorialId && query.length >= 2,
  });
}

// ============================================================
// Vault Stats
// ============================================================

/** Get aggregated vault stats for a memorial */
export function useVaultStats(memorialId: string | undefined) {
  return useQuery({
    queryKey: [VAULT_STATS_KEY, memorialId],
    queryFn: async () => {
      // Fetch all vault items to compute stats
      const { data: items, error: itemsError } = await supabase
        .from("memory_vault_items")
        .select("item_type")
        .eq("memorial_id", memorialId!);
      if (itemsError) throw itemsError;

      const allItems = (items ?? []) as { item_type: string }[];

      // Count by type
      const typeCounts: Record<string, number> = {};
      for (const item of allItems) {
        typeCounts[item.item_type] = (typeCounts[item.item_type] || 0) + 1;
      }

      // Fetch pending capsules
      const { count: capsulesPending } = await supabase
        .from("time_capsules")
        .select("id", { count: "exact", head: true })
        .eq("memorial_id", memorialId!)
        .eq("is_unlocked", false);

      // Fetch folder count
      const { count: folderCount } = await supabase
        .from("vault_folders")
        .select("id", { count: "exact", head: true })
        .eq("memorial_id", memorialId!);

      return {
        totalItems: allItems.length,
        typeCounts,
        capsulesPending: capsulesPending ?? 0,
        folderCount: folderCount ?? 0,
      };
    },
    enabled: !!memorialId,
  });
}
