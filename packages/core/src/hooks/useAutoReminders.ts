import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ReminderRuleType =
  | "birthday"
  | "death_anniversary"
  | "wedding_anniversary"
  | "milestone_birthday"
  | "custom_recurring"
  | "days_before";

export interface AutoReminderRule {
  id: string;
  user_id: string;
  memorial_id: string | null;
  rule_type: ReminderRuleType;
  title_template: string;
  days_before: number;
  is_recurring: boolean;
  is_enabled: boolean;
  recurring_month: number | null;
  recurring_day: number | null;
  last_triggered_at: string | null;
  next_trigger_date: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  useMyAutoReminders — all auto-reminder rules for current user      */
/* ------------------------------------------------------------------ */
export function useMyAutoReminders(userId: string | undefined) {
  return useQuery({
    queryKey: ["auto-reminders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("auto_reminder_rules")
        .select("*")
        .eq("user_id", userId!)
        .order("next_trigger_date", { ascending: true });

      if (error) throw error;
      return (data ?? []) as AutoReminderRule[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useUpcomingAutoReminders — next N days of auto reminders           */
/* ------------------------------------------------------------------ */
export function useUpcomingAutoReminders(userId: string | undefined, daysAhead = 30) {
  return useQuery({
    queryKey: ["upcoming-auto-reminders", userId, daysAhead],
    enabled: !!userId,
    queryFn: async () => {
      const futureDate = new Date(Date.now() + daysAhead * 86400000).toISOString().split("T")[0];

      const { data, error } = await (supabase as any)
        .from("auto_reminder_rules")
        .select("*")
        .eq("user_id", userId!)
        .eq("is_enabled", true)
        .lte("next_trigger_date", futureDate)
        .gte("next_trigger_date", new Date().toISOString().split("T")[0])
        .order("next_trigger_date", { ascending: true });

      if (error) throw error;
      return (data ?? []) as AutoReminderRule[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useCreateAutoReminder — set up a new auto-reminder rule            */
/* ------------------------------------------------------------------ */
export function useCreateAutoReminder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      memorial_id?: string;
      rule_type: ReminderRuleType;
      title_template: string;
      days_before?: number;
      is_recurring?: boolean;
      recurring_month?: number;
      recurring_day?: number;
    }) => {
      const { data, error } = await (supabase as any)
        .from("auto_reminder_rules")
        .insert({
          user_id: input.user_id,
          memorial_id: input.memorial_id ?? null,
          rule_type: input.rule_type,
          title_template: input.title_template,
          days_before: input.days_before ?? 1,
          is_recurring: input.is_recurring ?? true,
          recurring_month: input.recurring_month ?? null,
          recurring_day: input.recurring_day ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AutoReminderRule;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["auto-reminders", vars.user_id] });
      qc.invalidateQueries({ queryKey: ["upcoming-auto-reminders", vars.user_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useToggleAutoReminder — enable/disable an auto-reminder            */
/* ------------------------------------------------------------------ */
export function useToggleAutoReminder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; user_id: string; is_enabled: boolean }) => {
      const { data, error } = await (supabase as any)
        .from("auto_reminder_rules")
        .update({ is_enabled: !input.is_enabled })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as AutoReminderRule;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["auto-reminders", vars.user_id] });
      qc.invalidateQueries({ queryKey: ["upcoming-auto-reminders", vars.user_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useDeleteAutoReminder                                              */
/* ------------------------------------------------------------------ */
export function useDeleteAutoReminder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; user_id: string }) => {
      const { error } = await (supabase as any)
        .from("auto_reminder_rules")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["auto-reminders", vars.user_id] });
      qc.invalidateQueries({ queryKey: ["upcoming-auto-reminders", vars.user_id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  useAutoSetupReminders — auto-create standard reminders for a       */
/*  memorial based on its dates (birthday, death anniversary)          */
/* ------------------------------------------------------------------ */
export function useAutoSetupReminders() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      memorial_id: string;
      memorial_name: string;
      date_of_birth?: string;
      date_of_death?: string;
      wedding_date?: string;
    }) => {
      const rules: Array<{
        user_id: string;
        memorial_id: string;
        rule_type: ReminderRuleType;
        title_template: string;
        days_before: number;
        is_recurring: boolean;
      }> = [];

      if (input.date_of_birth) {
        rules.push({
          user_id: input.user_id,
          memorial_id: input.memorial_id,
          rule_type: "birthday",
          title_template: `${input.memorial_name}'s birthday is coming up`,
          days_before: 1,
          is_recurring: true,
        });
      }

      if (input.date_of_death) {
        rules.push({
          user_id: input.user_id,
          memorial_id: input.memorial_id,
          rule_type: "death_anniversary",
          title_template: `Remembering ${input.memorial_name} — anniversary of passing`,
          days_before: 1,
          is_recurring: true,
        });
      }

      if (input.wedding_date) {
        rules.push({
          user_id: input.user_id,
          memorial_id: input.memorial_id,
          rule_type: "wedding_anniversary",
          title_template: `${input.memorial_name}'s wedding anniversary`,
          days_before: 1,
          is_recurring: true,
        });
      }

      if (rules.length === 0) return [];

      const { data, error } = await (supabase as any)
        .from("auto_reminder_rules")
        .insert(rules)
        .select();

      if (error) throw error;
      return (data ?? []) as AutoReminderRule[];
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["auto-reminders", vars.user_id] });
      qc.invalidateQueries({ queryKey: ["upcoming-auto-reminders", vars.user_id] });
    },
  });
}
