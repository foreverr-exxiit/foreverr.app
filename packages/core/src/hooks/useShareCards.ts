import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/types";

type ShareCardTemplate = Database["public"]["Tables"]["share_card_templates"]["Row"];

const SHARE_CARDS_KEY = "share-card-templates";

// ============================================================
// Fetch share card templates (optionally filtered by type)
// ============================================================

export function useShareCardTemplates(templateType?: string) {
  return useQuery({
    queryKey: [SHARE_CARDS_KEY, templateType ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("share_card_templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (templateType) {
        query = query.eq("template_type", templateType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ShareCardTemplate[];
    },
    staleTime: 30 * 60 * 1000, // 30 min cache — templates rarely change
  });
}

// ============================================================
// Generate a share image from template + data
// Returns shareable metadata for building a visual card
// ============================================================

interface ShareImageData {
  templateId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  backgroundColor: string;
  textColor: string;
  layout: string;
}

export function useGenerateShareImage() {
  return useMutation({
    mutationFn: async ({
      templateType,
      title,
      subtitle,
      imageUrl,
    }: {
      templateType: string;
      title: string;
      subtitle?: string;
      imageUrl?: string | null;
    }): Promise<ShareImageData> => {
      // Fetch the first matching active template
      const { data: templates, error } = await supabase
        .from("share_card_templates")
        .select("*")
        .eq("template_type", templateType)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (error) throw error;

      const template = (templates ?? [])[0] as ShareCardTemplate | undefined;

      // Fallback defaults if no template found
      const backgroundColor = template?.background_color ?? "#2D1B4E";
      const textColor = template?.text_color ?? "#FFFFFF";
      const layout = template?.layout ?? "standard";

      return {
        templateId: template?.id ?? "default",
        title,
        subtitle,
        imageUrl,
        backgroundColor,
        textColor,
        layout,
      };
    },
  });
}
