import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import type { Database, Json } from "../supabase/types";

type Tables = Database["public"]["Tables"];
type ScrapbookElement = Tables["scrapbook_elements"]["Row"];

const SCRAPBOOK_ELEMENTS_KEY = "scrapbook-elements";
const SCRAPBOOK_KEY = "scrapbook-pages";

// ============================================================
// Scrapbook Elements
// ============================================================

/** Fetch all elements for a scrapbook page */
export function useScrapbookElements(pageId: string | undefined) {
  return useQuery({
    queryKey: [SCRAPBOOK_ELEMENTS_KEY, pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrapbook_elements")
        .select("*")
        .eq("page_id", pageId!)
        .order("z_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ScrapbookElement[];
    },
    enabled: !!pageId,
  });
}

/** Add a new element to a scrapbook page */
export function useAddScrapbookElement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageId: string;
      elementType: string;
      content?: string;
      mediaUrl?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      rotation?: number;
      zIndex?: number;
      styleData?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("scrapbook_elements")
        .insert({
          page_id: params.pageId,
          element_type: params.elementType,
          content: params.content,
          media_url: params.mediaUrl,
          position_x: params.positionX ?? 0,
          position_y: params.positionY ?? 0,
          width: params.width ?? 200,
          height: params.height ?? 200,
          rotation: params.rotation ?? 0,
          z_index: params.zIndex ?? 0,
          style_data: (params.styleData ?? {}) as unknown as Json,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ScrapbookElement;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [SCRAPBOOK_ELEMENTS_KEY, vars.pageId],
      });
    },
  });
}

/** Update a scrapbook element (position, size, content, etc.) */
export function useUpdateScrapbookElement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      elementId: string;
      pageId: string;
      content?: string;
      mediaUrl?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      rotation?: number;
      zIndex?: number;
      styleData?: Record<string, unknown>;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (params.content !== undefined) updateData.content = params.content;
      if (params.mediaUrl !== undefined) updateData.media_url = params.mediaUrl;
      if (params.positionX !== undefined)
        updateData.position_x = params.positionX;
      if (params.positionY !== undefined)
        updateData.position_y = params.positionY;
      if (params.width !== undefined) updateData.width = params.width;
      if (params.height !== undefined) updateData.height = params.height;
      if (params.rotation !== undefined) updateData.rotation = params.rotation;
      if (params.zIndex !== undefined) updateData.z_index = params.zIndex;
      if (params.styleData !== undefined)
        updateData.style_data = params.styleData as unknown as Json;

      const { error } = await supabase
        .from("scrapbook_elements")
        .update(updateData as any)
        .eq("id", params.elementId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [SCRAPBOOK_ELEMENTS_KEY, vars.pageId],
      });
    },
  });
}

/** Delete a scrapbook element */
export function useDeleteScrapbookElement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { elementId: string; pageId: string }) => {
      const { error } = await supabase
        .from("scrapbook_elements")
        .delete()
        .eq("id", params.elementId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [SCRAPBOOK_ELEMENTS_KEY, vars.pageId],
      });
    },
  });
}
