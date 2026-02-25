import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const NFT_KEY = "nfts";
const NFT_DETAIL_KEY = "nft-detail";
const MY_NFTS_KEY = "my-nfts";
const NFT_TX_KEY = "nft-transactions";
const PAGE_SIZE = 20;

/** Browse listed NFTs */
export function useNFTGallery(filters?: { memorialId?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: [NFT_KEY, filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("nfts")
        .select("*, creator:profiles!nfts_creator_id_fkey(id, username, display_name, avatar_url), memorial:memorials!nfts_memorial_id_fkey(id, first_name, last_name)")
        .in("status", ["minted", "listed"]);

      if (filters?.memorialId) {
        query = query.eq("memorial_id", filters.memorialId);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return {
        data: data ?? [],
        nextCursor: data?.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Fetch single NFT */
export function useNFT(nftId: string | undefined) {
  return useQuery({
    queryKey: [NFT_DETAIL_KEY, nftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nfts")
        .select("*, creator:profiles!nfts_creator_id_fkey(id, username, display_name, avatar_url), owner:profiles!nfts_owner_id_fkey(id, username, display_name, avatar_url), memorial:memorials!nfts_memorial_id_fkey(id, first_name, last_name, profile_photo_url)")
        .eq("id", nftId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!nftId,
  });
}

/** Fetch NFTs owned by a user */
export function useMyNFTs(userId: string | undefined) {
  return useQuery({
    queryKey: [MY_NFTS_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nfts")
        .select("*, memorial:memorials!nfts_memorial_id_fkey(id, first_name, last_name)")
        .eq("owner_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

/** Mint a new NFT from a memorial photo */
export function useMintNFT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      creatorId: string;
      title: string;
      description?: string;
      mediaUrl: string;
      priceCents?: number;
      totalEditions?: number;
    }) => {
      const { data, error } = await supabase
        .from("nfts")
        .insert({
          memorial_id: params.memorialId,
          creator_id: params.creatorId,
          owner_id: params.creatorId,
          title: params.title,
          description: params.description,
          media_url: params.mediaUrl,
          price_cents: params.priceCents ?? 0,
          total_editions: params.totalEditions ?? 1,
          edition_number: 1,
          status: "minted",
        })
        .select("*")
        .single();
      if (error) throw error;
      const nft = data as any;

      // Log mint transaction
      await supabase.from("nft_transactions").insert({
        nft_id: nft.id,
        from_user_id: null,
        to_user_id: params.creatorId,
        transaction_type: "mint",
        price_cents: 0,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_NFTS_KEY] });
    },
  });
}

/** List an NFT for sale */
export function useListNFT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { nftId: string; priceCents: number; userId: string }) => {
      const { error } = await supabase
        .from("nfts")
        .update({ status: "listed", price_cents: params.priceCents })
        .eq("id", params.nftId)
        .eq("owner_id", params.userId);
      if (error) throw error;

      await supabase.from("nft_transactions").insert({
        nft_id: params.nftId,
        from_user_id: params.userId,
        to_user_id: null,
        transaction_type: "list",
        price_cents: params.priceCents,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_NFTS_KEY] });
    },
  });
}

/** Purchase an NFT */
export function usePurchaseNFT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { nftId: string; buyerId: string; priceCents: number }) => {
      // Get current NFT
      const { data: nft, error: nftErr } = await supabase
        .from("nfts")
        .select("owner_id")
        .eq("id", params.nftId)
        .eq("status", "listed")
        .single();
      if (nftErr) throw nftErr;

      const previousOwner = nft.owner_id;

      // Transfer ownership
      const { error } = await supabase
        .from("nfts")
        .update({ owner_id: params.buyerId, status: "sold" })
        .eq("id", params.nftId);
      if (error) throw error;

      // Log transaction
      await supabase.from("nft_transactions").insert({
        nft_id: params.nftId,
        from_user_id: previousOwner,
        to_user_id: params.buyerId,
        transaction_type: "purchase",
        price_cents: params.priceCents,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_NFTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NFT_DETAIL_KEY] });
    },
  });
}

/** Fetch transaction history for an NFT */
export function useNFTTransactions(nftId: string | undefined) {
  return useQuery({
    queryKey: [NFT_TX_KEY, nftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nft_transactions")
        .select("*, from_user:profiles!nft_transactions_from_user_id_fkey(id, username, display_name), to_user:profiles!nft_transactions_to_user_id_fkey(id, username, display_name)")
        .eq("nft_id", nftId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!nftId,
  });
}
