import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type FamilyTree = Tables["family_trees"]["Row"];
type FamilyTreeMember = Tables["family_tree_members"]["Row"];
type FamilyTreeConnection = Tables["family_tree_connections"]["Row"];
type MemoryPrompt = Tables["memory_prompts"]["Row"];
type MemoryPromptResponse = Tables["memory_prompt_responses"]["Row"];

const FAMILY_TREES_KEY = "family-trees";
const TREE_MEMBERS_KEY = "tree-members";
const TREE_CONNECTIONS_KEY = "tree-connections";
const MEMORY_PROMPTS_KEY = "memory-prompts";
const PROMPT_RESPONSES_KEY = "prompt-responses";

// ============================================================
// Family Trees
// ============================================================

/** Fetch family trees created by a user */
export function useMyFamilyTrees(userId: string | undefined) {
  return useQuery({
    queryKey: [FAMILY_TREES_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_trees")
        .select("*")
        .eq("created_by", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FamilyTree[];
    },
    enabled: !!userId,
  });
}

/** Fetch a single family tree */
export function useFamilyTree(treeId: string | undefined) {
  return useQuery({
    queryKey: [FAMILY_TREES_KEY, treeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_trees")
        .select("*, creator:profiles!family_trees_created_by_fkey(id, username, display_name, avatar_url)")
        .eq("id", treeId!)
        .single();
      if (error) throw error;
      return data as FamilyTree & { creator: { id: string; username: string; display_name: string; avatar_url: string | null } | null };
    },
    enabled: !!treeId,
  });
}

/** Create a family tree */
export function useCreateFamilyTree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      createdBy: string;
      description?: string;
      coverImageUrl?: string;
      isPublic?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("family_trees")
        .insert({
          name: params.name,
          created_by: params.createdBy,
          description: params.description,
          cover_image_url: params.coverImageUrl,
          is_public: params.isPublic ?? true,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as FamilyTree;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAMILY_TREES_KEY] });
    },
  });
}

/** Update a family tree */
export function useUpdateFamilyTree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      treeId: string;
      name?: string;
      description?: string;
      coverImageUrl?: string;
      isPublic?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (params.name !== undefined) updateData.name = params.name;
      if (params.description !== undefined) updateData.description = params.description;
      if (params.coverImageUrl !== undefined) updateData.cover_image_url = params.coverImageUrl;
      if (params.isPublic !== undefined) updateData.is_public = params.isPublic;

      const { error } = await supabase
        .from("family_trees")
        .update(updateData as any)
        .eq("id", params.treeId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [FAMILY_TREES_KEY, vars.treeId] });
      queryClient.invalidateQueries({ queryKey: [FAMILY_TREES_KEY, "my"] });
    },
  });
}

// ============================================================
// Family Tree Members
// ============================================================

/** Fetch all members of a family tree */
export function useFamilyTreeMembers(treeId: string | undefined) {
  return useQuery({
    queryKey: [TREE_MEMBERS_KEY, treeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_tree_members")
        .select("*")
        .eq("tree_id", treeId!)
        .order("generation_level", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FamilyTreeMember[];
    },
    enabled: !!treeId,
  });
}

/** Add a member to a family tree */
export function useAddTreeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      treeId: string;
      firstName: string;
      lastName: string;
      memorialId?: string;
      profileId?: string;
      dateOfBirth?: string;
      dateOfDeath?: string;
      photoUrl?: string;
      gender?: string;
      bio?: string;
      isLiving?: boolean;
      positionX?: number;
      positionY?: number;
      generationLevel?: number;
    }) => {
      const { data, error } = await supabase
        .from("family_tree_members")
        .insert({
          tree_id: params.treeId,
          first_name: params.firstName,
          last_name: params.lastName,
          memorial_id: params.memorialId,
          profile_id: params.profileId,
          date_of_birth: params.dateOfBirth,
          date_of_death: params.dateOfDeath,
          photo_url: params.photoUrl,
          gender: params.gender,
          bio: params.bio,
          is_living: params.isLiving ?? true,
          position_x: params.positionX ?? 0,
          position_y: params.positionY ?? 0,
          generation_level: params.generationLevel ?? 0,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as FamilyTreeMember;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [TREE_MEMBERS_KEY, vars.treeId] });
      queryClient.invalidateQueries({ queryKey: [FAMILY_TREES_KEY, vars.treeId] });
    },
  });
}

/** Update a tree member */
export function useUpdateTreeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memberId: string;
      treeId: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      dateOfDeath?: string;
      photoUrl?: string;
      gender?: string;
      bio?: string;
      isLiving?: boolean;
      positionX?: number;
      positionY?: number;
      generationLevel?: number;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (params.firstName !== undefined) updateData.first_name = params.firstName;
      if (params.lastName !== undefined) updateData.last_name = params.lastName;
      if (params.dateOfBirth !== undefined) updateData.date_of_birth = params.dateOfBirth;
      if (params.dateOfDeath !== undefined) updateData.date_of_death = params.dateOfDeath;
      if (params.photoUrl !== undefined) updateData.photo_url = params.photoUrl;
      if (params.gender !== undefined) updateData.gender = params.gender;
      if (params.bio !== undefined) updateData.bio = params.bio;
      if (params.isLiving !== undefined) updateData.is_living = params.isLiving;
      if (params.positionX !== undefined) updateData.position_x = params.positionX;
      if (params.positionY !== undefined) updateData.position_y = params.positionY;
      if (params.generationLevel !== undefined) updateData.generation_level = params.generationLevel;

      const { error } = await supabase
        .from("family_tree_members")
        .update(updateData as any)
        .eq("id", params.memberId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [TREE_MEMBERS_KEY, vars.treeId] });
    },
  });
}

/** Remove a tree member */
export function useRemoveTreeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { memberId: string; treeId: string }) => {
      const { error } = await supabase
        .from("family_tree_members")
        .delete()
        .eq("id", params.memberId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [TREE_MEMBERS_KEY, vars.treeId] });
      queryClient.invalidateQueries({ queryKey: [TREE_CONNECTIONS_KEY, vars.treeId] });
      queryClient.invalidateQueries({ queryKey: [FAMILY_TREES_KEY, vars.treeId] });
    },
  });
}

// ============================================================
// Family Tree Connections
// ============================================================

/** Fetch all connections in a family tree */
export function useFamilyTreeConnections(treeId: string | undefined) {
  return useQuery({
    queryKey: [TREE_CONNECTIONS_KEY, treeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_tree_connections")
        .select("*")
        .eq("tree_id", treeId!);
      if (error) throw error;
      return (data ?? []) as FamilyTreeConnection[];
    },
    enabled: !!treeId,
  });
}

/** Add a connection between tree members */
export function useAddTreeConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      treeId: string;
      fromMemberId: string;
      toMemberId: string;
      relationshipType: string;
      relationshipLabel?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("family_tree_connections")
        .insert({
          tree_id: params.treeId,
          from_member_id: params.fromMemberId,
          to_member_id: params.toMemberId,
          relationship_type: params.relationshipType,
          relationship_label: params.relationshipLabel,
          start_date: params.startDate,
          end_date: params.endDate,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as FamilyTreeConnection;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [TREE_CONNECTIONS_KEY, vars.treeId] });
    },
  });
}

/** Remove a connection */
export function useRemoveTreeConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { connectionId: string; treeId: string }) => {
      const { error } = await supabase
        .from("family_tree_connections")
        .delete()
        .eq("id", params.connectionId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [TREE_CONNECTIONS_KEY, vars.treeId] });
    },
  });
}

// ============================================================
// Memory Prompts
// ============================================================

/** Fetch active memory prompts for a memorial */
export function useMemoryPrompts(memorialId: string | undefined) {
  return useQuery({
    queryKey: [MEMORY_PROMPTS_KEY, memorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_prompts")
        .select("*")
        .eq("memorial_id", memorialId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemoryPrompt[];
    },
    enabled: !!memorialId,
  });
}

/** Create a memory prompt */
export function useCreateMemoryPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      promptText: string;
      promptType: string;
      triggerDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("memory_prompts")
        .insert({
          memorial_id: params.memorialId,
          prompt_text: params.promptText,
          prompt_type: params.promptType,
          trigger_date: params.triggerDate,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as MemoryPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMORY_PROMPTS_KEY] });
    },
  });
}

/** Fetch responses to a memory prompt */
export function usePromptResponses(promptId: string | undefined) {
  return useQuery({
    queryKey: [PROMPT_RESPONSES_KEY, promptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_prompt_responses")
        .select("*, user:profiles!memory_prompt_responses_user_id_fkey(id, username, display_name, avatar_url)")
        .eq("prompt_id", promptId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (MemoryPromptResponse & { user: { id: string; username: string; display_name: string; avatar_url: string | null } | null })[];
    },
    enabled: !!promptId,
  });
}

/** Respond to a memory prompt */
export function useRespondToPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      promptId: string;
      userId: string;
      content: string;
      mediaUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("memory_prompt_responses")
        .insert({
          prompt_id: params.promptId,
          user_id: params.userId,
          content: params.content,
          media_url: params.mediaUrl,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as MemoryPromptResponse;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [PROMPT_RESPONSES_KEY, vars.promptId] });
      queryClient.invalidateQueries({ queryKey: [MEMORY_PROMPTS_KEY] });
    },
  });
}
