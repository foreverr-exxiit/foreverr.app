import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

const IMPORT_JOBS_KEY = "import-jobs";
const IMPORT_ITEMS_KEY = "import-items";
const CONNECTED_ACCOUNTS_KEY = "connected-accounts";

// ============================================================
// Import Jobs
// ============================================================

/** Fetch all import jobs for the current user */
export function useMyImportJobs(userId: string | undefined) {
  return useQuery({
    queryKey: [IMPORT_JOBS_KEY, "my", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_jobs" as any)
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

/** Fetch a single import job by ID */
export function useImportJob(jobId: string | undefined) {
  return useQuery({
    queryKey: [IMPORT_JOBS_KEY, jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_jobs" as any)
        .select("*")
        .eq("id", jobId!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!jobId,
  });
}

/** Fetch all items belonging to an import job */
export function useImportJobItems(jobId: string | undefined) {
  return useQuery({
    queryKey: [IMPORT_ITEMS_KEY, jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_items" as any)
        .select("*")
        .eq("import_job_id", jobId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!jobId,
  });
}

// ============================================================
// Import Job Mutations
// ============================================================

/** Start a new import — creates a pending import_job record */
export function useStartImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      sourceType: string;
      targetType: string;
      targetId?: string;
      totalItems?: number;
      sourceMetadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("import_jobs" as any)
        .insert({
          user_id: params.userId,
          source_type: params.sourceType,
          target_type: params.targetType,
          target_id: params.targetId,
          total_items: params.totalItems ?? 0,
          source_metadata: params.sourceMetadata ?? {},
        } as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IMPORT_JOBS_KEY] });
    },
  });
}

/** Cancel (fail) an import job */
export function useCancelImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("import_jobs" as any)
        .update({ status: "failed" } as any)
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IMPORT_JOBS_KEY] });
    },
  });
}

/** Retry all failed items within a job — resets their status to pending */
export function useRetryFailedItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("import_items" as any)
        .update({ status: "pending" } as any)
        .eq("import_job_id", jobId)
        .eq("status", "failed");
      if (error) throw error;

      // Reset the parent job status back to processing
      const { error: jobError } = await supabase
        .from("import_jobs" as any)
        .update({ status: "processing", failed_items: 0 } as any)
        .eq("id", jobId);
      if (jobError) throw jobError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IMPORT_JOBS_KEY] });
      queryClient.invalidateQueries({ queryKey: [IMPORT_ITEMS_KEY] });
    },
  });
}

// ============================================================
// Connected Accounts
// ============================================================

/** Fetch connected social accounts for the current user */
export function useConnectedAccounts(userId: string | undefined) {
  return useQuery({
    queryKey: [CONNECTED_ACCOUNTS_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connected_accounts" as any)
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!userId,
  });
}

/** Connect a social account */
export function useConnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      platform: string;
      platformUserId?: string;
      accessTokenEncrypted?: string;
      refreshTokenEncrypted?: string;
      tokenExpiresAt?: string;
      displayName?: string;
      avatarUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("connected_accounts" as any)
        .upsert(
          {
            user_id: params.userId,
            platform: params.platform,
            platform_user_id: params.platformUserId,
            access_token_encrypted: params.accessTokenEncrypted,
            refresh_token_encrypted: params.refreshTokenEncrypted,
            token_expires_at: params.tokenExpiresAt,
            display_name: params.displayName,
            avatar_url: params.avatarUrl,
            is_active: true,
            last_sync_at: new Date().toISOString(),
          } as any,
          { onConflict: "user_id,platform" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTED_ACCOUNTS_KEY] });
    },
  });
}

/** Disconnect a social account (soft-delete by setting is_active to false) */
export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("connected_accounts" as any)
        .update({ is_active: false } as any)
        .eq("id", accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTED_ACCOUNTS_KEY] });
    },
  });
}
