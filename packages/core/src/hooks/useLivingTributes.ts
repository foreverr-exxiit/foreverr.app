import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type LivingTribute = Database["public"]["Tables"]["living_tributes"]["Row"];
type LivingTributeInsert = Database["public"]["Tables"]["living_tributes"]["Insert"];
type LivingTributeMessage = Database["public"]["Tables"]["living_tribute_messages"]["Row"];
type LivingTributeMessageInsert = Database["public"]["Tables"]["living_tribute_messages"]["Insert"];
type LivingTributeInvite = Database["public"]["Tables"]["living_tribute_invites"]["Row"];

const LIVING_TRIBUTE_KEY = "living-tributes";
const PAGE_SIZE = 20;

// ============================================================
// Browse living tributes (paginated)
// ============================================================

export function useLivingTributes(search?: string) {
  return useInfiniteQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "list", search],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("living_tributes")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,honoree_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as LivingTribute[], nextPage: (data ?? []).length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// ============================================================
// Single living tribute
// ============================================================

export function useLivingTribute(id: string | undefined) {
  return useQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("living_tributes")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as LivingTribute;
    },
    enabled: !!id,
  });
}

// ============================================================
// My created living tributes
// ============================================================

export function useMyLivingTributes(userId: string | undefined) {
  return useQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("living_tributes")
        .select("*")
        .eq("created_by", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LivingTribute[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Tributes honoring a specific user
// ============================================================

export function useHonoredTributes(userId: string | undefined) {
  return useQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "honored", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("living_tributes")
        .select("*")
        .eq("honoree_user_id", userId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LivingTribute[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Create living tribute
// ============================================================

export function useCreateLivingTribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LivingTributeInsert) => {
      const { data, error } = await supabase
        .from("living_tributes")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as LivingTribute;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY] });
    },
  });
}

// ============================================================
// Update living tribute
// ============================================================

export function useUpdateLivingTribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LivingTribute>) => {
      const { data, error } = await supabase
        .from("living_tributes")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as LivingTribute;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY] });
    },
  });
}

// ============================================================
// Tribute messages (paginated)
// ============================================================

export function useLivingTributeMessages(tributeId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "messages", tributeId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("living_tribute_messages")
        .select("*, author:author_id(id, display_name, avatar_url)")
        .eq("tribute_id", tributeId!)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      if (error) throw error;
      return { data: data ?? [], nextPage: (data ?? []).length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!tributeId,
  });
}

// ============================================================
// Add message to tribute
// ============================================================

export function useAddLivingTributeMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LivingTributeMessageInsert) => {
      const { data, error } = await supabase
        .from("living_tribute_messages")
        .insert(input)
        .select("*, author:author_id(id, display_name, avatar_url)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY, "messages", vars.tribute_id] });
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY, "detail", vars.tribute_id] });
    },
  });
}

// ============================================================
// Invite to contribute
// ============================================================

export function useInviteToContribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { tributeId: string; invitedBy: string; invitedEmail?: string; invitedUserId?: string }) => {
      const { data, error } = await supabase
        .from("living_tribute_invites")
        .insert({
          tribute_id: input.tributeId,
          invited_by: input.invitedBy,
          invited_email: input.invitedEmail,
          invited_user_id: input.invitedUserId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as LivingTributeInvite;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY, "invites", vars.tributeId] });
    },
  });
}

// ============================================================
// Get invites for a tribute
// ============================================================

export function useTributeInvites(tributeId: string | undefined) {
  return useQuery({
    queryKey: [LIVING_TRIBUTE_KEY, "invites", tributeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("living_tribute_invites")
        .select("*")
        .eq("tribute_id", tributeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LivingTributeInvite[];
    },
    enabled: !!tributeId,
  });
}

// ============================================================
// Convert living tribute to memorial
// ============================================================

export function useConvertToMemorial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tributeId, userId }: { tributeId: string; userId: string }) => {
      // Get tribute data
      const { data: tributeRaw, error: tributeError } = await supabase
        .from("living_tributes")
        .select("*")
        .eq("id", tributeId)
        .single();
      if (tributeError) throw tributeError;
      if (!tributeRaw) throw new Error("Tribute not found");
      const tribute = tributeRaw as LivingTribute;

      // Create memorial from tribute
      const nameParts = tribute.honoree_name.split(" ");
      const firstName = nameParts[0] || tribute.honoree_name;
      const lastName = nameParts.slice(1).join(" ") || "";

      const { data: memorialData, error: memError } = await supabase
        .from("memorials")
        .insert({
          first_name: firstName,
          last_name: lastName,
          created_by: userId,
          profile_photo_url: tribute.honoree_photo_url,
          cover_photo_url: tribute.cover_photo_url,
          obituary: tribute.description,
          privacy: tribute.privacy === "public" ? "public" : "private",
        } as any)
        .select()
        .single();
      if (memError) throw memError;
      const memorial = memorialData as any;

      // Update tribute status
      await supabase
        .from("living_tributes")
        .update({
          status: "converted_to_memorial",
          memorial_id: memorial.id,
        } as any)
        .eq("id", tributeId);

      return { memorial, tribute };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIVING_TRIBUTE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["memorials"] });
    },
  });
}
