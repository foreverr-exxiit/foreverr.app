import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const PAGE_HOSTS_KEY = "page-hosts";
const PAGE_INVITATIONS_KEY = "page-invitations";

// ============================================================
// Types
// ============================================================

export type PageType =
  | "memorial"
  | "living_tribute"
  | "event"
  | "family_tree"
  | "virtual_space"
  | "wedding"
  | "pet_page";

export type HostRole = "owner" | "co_host" | "contributor" | "moderator";

export type PageHostRelationship =
  | "immediate_family"
  | "extended_family"
  | "friend"
  | "colleague"
  | "fan"
  | "spouse"
  | "partner"
  | "pet_owner"
  | "caretaker"
  | "wedding_party"
  | "organizer"
  | "other";

export interface PageHost {
  id: string;
  page_type: PageType;
  page_id: string;
  role: HostRole;
  relationship: PageHostRelationship | null;
  relationship_detail: string | null;
  permissions: Record<string, boolean>;
  invite_status: string;
  user: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  created_at: string;
}

export interface PageInvitation {
  id: string;
  page_type: PageType;
  page_id: string;
  inviter_id: string;
  invitee_id: string;
  role: HostRole;
  relationship: PageHostRelationship | null;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  inviter?: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

// ============================================================
// Permission helpers
// ============================================================

interface PagePermissions {
  isOwner: boolean;
  isCoHost: boolean;
  isContributor: boolean;
  isModerator: boolean;
  canEdit: boolean;
  canAddMedia: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canModerate: boolean;
  role: HostRole | null;
}

const NO_PERMISSIONS: PagePermissions = {
  isOwner: false,
  isCoHost: false,
  isContributor: false,
  isModerator: false,
  canEdit: false,
  canAddMedia: false,
  canInvite: false,
  canDelete: false,
  canModerate: false,
  role: null,
};

// ============================================================
// 1. Fetch all hosts for a page
// ============================================================

/** Fetch all hosts for a page, joining with profiles for user info.
 *  Returns array of hosts ordered by role (owner first). */
export function usePageHosts(pageType: PageType | undefined, pageId: string | undefined) {
  return useQuery({
    queryKey: [PAGE_HOSTS_KEY, pageType, pageId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("page_hosts")
          .select("id, page_type, page_id, user_id, role, relationship, relationship_detail, permissions, invite_status, created_at")
          .eq("page_type", pageType!)
          .eq("page_id", pageId!)
          .order("role", { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) return [] as PageHost[];

        // Fetch profiles for each host
        const userIds = (data as any[]).map((h: any) => h.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", userIds);

        const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

        return (data as any[]).map((host: any) => ({
          id: host.id,
          page_type: host.page_type as PageType,
          page_id: host.page_id as string,
          role: host.role as HostRole,
          relationship: (host.relationship as PageHostRelationship) ?? null,
          relationship_detail: (host.relationship_detail as string) ?? null,
          permissions: (host.permissions as Record<string, boolean>) ?? {},
          invite_status: (host.invite_status as string) ?? "accepted",
          user: profileMap.get(host.user_id) ?? {
            id: host.user_id,
            display_name: "Unknown",
            username: null,
            avatar_url: null,
          },
          created_at: host.created_at as string,
        })) as PageHost[];
      } catch {
        // DB not reachable — return empty
        return [] as PageHost[];
      }
    },
    enabled: !!pageType && !!pageId,
  });
}

// ============================================================
// 2. Page permissions for current user
// ============================================================

/** Returns computed permissions for a user on a page by checking page_hosts */
export function usePagePermissions(
  pageType: PageType | undefined,
  pageId: string | undefined,
  userId: string | undefined,
) {
  return useQuery({
    queryKey: [PAGE_HOSTS_KEY, "permissions", pageType, pageId, userId],
    queryFn: async (): Promise<PagePermissions> => {
      try {
        const { data, error } = await (supabase as any)
          .from("page_hosts")
          .select("role, permissions")
          .eq("page_type", pageType!)
          .eq("page_id", pageId!)
          .eq("user_id", userId!)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NO_PERMISSIONS;

        const role = data.role as HostRole;
        const customPerms = (data.permissions as Record<string, boolean>) ?? {};

        const isOwner = role === "owner";
        const isCoHost = role === "co_host";
        const isModerator = role === "moderator";
        const isContributor = role === "contributor";

        return {
          isOwner,
          isCoHost,
          isContributor,
          isModerator,
          role,
          canEdit: isOwner || isCoHost || customPerms.can_edit === true,
          canAddMedia: isOwner || isCoHost || isContributor || customPerms.can_add_media === true,
          canInvite: isOwner || isCoHost || customPerms.can_invite === true,
          canDelete: isOwner || customPerms.can_delete === true,
          canModerate: isOwner || isCoHost || isModerator || customPerms.can_moderate === true,
        };
      } catch {
        return NO_PERMISSIONS;
      }
    },
    enabled: !!pageType && !!pageId && !!userId,
  });
}

// ============================================================
// 3. Add a page host
// ============================================================

/** Insert a new host into page_hosts */
export function useAddPageHost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      pageType: PageType;
      pageId: string;
      userId: string;
      role: HostRole;
      relationship?: PageHostRelationship;
      relationshipDetail?: string;
      permissions?: Record<string, boolean>;
    }) => {
      const { data, error } = await (supabase as any)
        .from("page_hosts")
        .insert({
          page_type: params.pageType,
          page_id: params.pageId,
          user_id: params.userId,
          role: params.role,
          relationship: params.relationship ?? null,
          relationship_detail: params.relationshipDetail ?? null,
          permissions: params.permissions ?? {},
          invite_status: "accepted",
        })
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, vars.pageType, vars.pageId] });
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, "permissions", vars.pageType, vars.pageId] });
    },
  });
}

// ============================================================
// 4. Remove a page host
// ============================================================

/** Delete a host from page_hosts by host record id */
export function useRemovePageHost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      hostId: string;
      pageType: PageType;
      pageId: string;
    }) => {
      const { error } = await (supabase as any)
        .from("page_hosts")
        .delete()
        .eq("id", params.hostId);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, vars.pageType, vars.pageId] });
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, "permissions", vars.pageType, vars.pageId] });
    },
  });
}

// ============================================================
// 5. Update a host role
// ============================================================

/** Update role of an existing page host */
export function useUpdatePageHostRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      hostId: string;
      pageType: PageType;
      pageId: string;
      role: HostRole;
      permissions?: Record<string, boolean>;
    }) => {
      const update: Record<string, any> = { role: params.role };
      if (params.permissions !== undefined) {
        update.permissions = params.permissions;
      }

      const { data, error } = await (supabase as any)
        .from("page_hosts")
        .update(update)
        .eq("id", params.hostId)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, vars.pageType, vars.pageId] });
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, "permissions", vars.pageType, vars.pageId] });
    },
  });
}

// ============================================================
// 6. Page invitations for a page
// ============================================================

/** Fetch pending invitations for a specific page */
export function usePageInvitations(pageType: PageType | undefined, pageId: string | undefined) {
  return useQuery({
    queryKey: [PAGE_INVITATIONS_KEY, pageType, pageId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("page_invitations")
          .select("*")
          .eq("page_type", pageType!)
          .eq("page_id", pageId!)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) return [] as PageInvitation[];

        // Fetch inviter profiles
        const inviterIds = (data as any[]).map((inv: any) => inv.inviter_id);
        const uniqueIds = [...new Set(inviterIds)];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", uniqueIds);

        const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

        return (data as any[]).map((inv: any) => ({
          ...inv,
          inviter: profileMap.get(inv.inviter_id) ?? {
            id: inv.inviter_id,
            display_name: "Unknown",
            username: null,
            avatar_url: null,
          },
        })) as PageInvitation[];
      } catch {
        return [] as PageInvitation[];
      }
    },
    enabled: !!pageType && !!pageId,
  });
}

// ============================================================
// 7. My pending invitations (across all pages)
// ============================================================

/** Fetch all pending invitations for the current user across all pages */
export function useMyPendingInvitations(userId: string | undefined) {
  return useQuery({
    queryKey: [PAGE_INVITATIONS_KEY, "my-pending", userId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("page_invitations")
          .select("*")
          .eq("invitee_id", userId!)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) return [] as PageInvitation[];

        // Fetch inviter profiles
        const inviterIds = (data as any[]).map((inv: any) => inv.inviter_id);
        const uniqueIds = [...new Set(inviterIds)];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", uniqueIds);

        const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

        return (data as any[]).map((inv: any) => ({
          ...inv,
          inviter: profileMap.get(inv.inviter_id) ?? {
            id: inv.inviter_id,
            display_name: "Unknown",
            username: null,
            avatar_url: null,
          },
        })) as PageInvitation[];
      } catch {
        return [] as PageInvitation[];
      }
    },
    enabled: !!userId,
  });
}

// ============================================================
// 8. Create a page invitation
// ============================================================

/** Create an invitation to join a page as a host */
export function useCreatePageInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      pageType: PageType;
      pageId: string;
      inviterId: string;
      inviteeId: string;
      role: HostRole;
      relationship?: PageHostRelationship;
      message?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("page_invitations")
        .insert({
          page_type: params.pageType,
          page_id: params.pageId,
          inviter_id: params.inviterId,
          invitee_id: params.inviteeId,
          role: params.role,
          relationship: params.relationship ?? null,
          message: params.message ?? null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data as any as PageInvitation;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [PAGE_INVITATIONS_KEY, vars.pageType, vars.pageId] });
      queryClient.invalidateQueries({ queryKey: [PAGE_INVITATIONS_KEY, "my-pending", vars.inviteeId] });
    },
  });
}

// ============================================================
// 9. Respond to invitation (accept / decline)
// ============================================================

/** Accept or decline an invitation. On accept, inserts into page_hosts and updates invitation status. */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      invitationId: string;
      accept: boolean;
      userId: string;
    }) => {
      // Fetch the invitation to get page details
      const { data: invitation, error: fetchErr } = await (supabase as any)
        .from("page_invitations")
        .select("*")
        .eq("id", params.invitationId)
        .single();

      if (fetchErr) throw fetchErr;
      if (!invitation) throw new Error("Invitation not found");

      const inv = invitation as any;
      const newStatus = params.accept ? "accepted" : "declined";

      // Update invitation status
      const { error: updateErr } = await (supabase as any)
        .from("page_invitations")
        .update({ status: newStatus })
        .eq("id", params.invitationId);

      if (updateErr) throw updateErr;

      // If accepted, insert into page_hosts
      if (params.accept) {
        const { error: insertErr } = await (supabase as any)
          .from("page_hosts")
          .insert({
            page_type: inv.page_type,
            page_id: inv.page_id,
            user_id: params.userId,
            role: inv.role,
            relationship: inv.relationship ?? null,
            permissions: {},
            invite_status: "accepted",
          });

        if (insertErr) throw insertErr;
      }

      return { accepted: params.accept, pageType: inv.page_type as PageType, pageId: inv.page_id as string };
    },
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: [PAGE_INVITATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, result.pageType, result.pageId] });
      queryClient.invalidateQueries({ queryKey: [PAGE_HOSTS_KEY, "permissions", result.pageType, result.pageId, vars.userId] });
    },
  });
}
