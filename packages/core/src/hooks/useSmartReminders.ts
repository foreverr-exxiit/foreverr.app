import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type SmartReminder = Database["public"]["Tables"]["smart_reminders"]["Row"];
type SmartReminderInsert = Database["public"]["Tables"]["smart_reminders"]["Insert"];

const REMINDER_KEY = "smart-reminders";

// ============================================================
// My reminders
// ============================================================

export function useMyReminders(userId: string | undefined) {
  return useQuery({
    queryKey: [REMINDER_KEY, "all", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smart_reminders")
        .select("*")
        .eq("user_id", userId!)
        .order("reminder_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SmartReminder[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Upcoming reminders (next N days)
// ============================================================

export function useUpcomingReminders(userId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: [REMINDER_KEY, "upcoming", userId, days],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("smart_reminders")
        .select("*")
        .eq("user_id", userId!)
        .eq("is_enabled", true)
        .gte("reminder_date", today!)
        .lte("reminder_date", futureDateStr!)
        .order("reminder_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SmartReminder[];
    },
    enabled: !!userId,
  });
}

// ============================================================
// Create reminder
// ============================================================

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SmartReminderInsert) => {
      const { data, error } = await supabase
        .from("smart_reminders")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as SmartReminder;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [REMINDER_KEY] });
    },
  });
}

// ============================================================
// Update reminder
// ============================================================

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<SmartReminder>) => {
      const { data, error } = await supabase
        .from("smart_reminders")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SmartReminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REMINDER_KEY] });
    },
  });
}

// ============================================================
// Delete reminder
// ============================================================

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("smart_reminders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REMINDER_KEY] });
    },
  });
}

// ============================================================
// Toggle reminder enabled/disabled
// ============================================================

export function useToggleReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { data, error } = await supabase
        .from("smart_reminders")
        .update({ is_enabled: !isEnabled } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SmartReminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REMINDER_KEY] });
    },
  });
}
