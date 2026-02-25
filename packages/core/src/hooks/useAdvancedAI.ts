import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

/** Generate AI voice from text using ElevenLabs */
export function useGenerateVoice() {
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      text: string;
      voiceSampleUrl?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-voice", {
        body: {
          memorial_id: params.memorialId,
          text: params.text,
          voice_sample_url: params.voiceSampleUrl,
        },
      });
      if (error) throw error;
      return data as { audio_url: string; duration_seconds: number };
    },
  });
}

/** Restore or colorize old photos */
export function usePhotoRestore() {
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      photoUrl: string;
      restoreType: "restore" | "colorize";
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-photo-restore", {
        body: {
          memorial_id: params.memorialId,
          photo_url: params.photoUrl,
          restore_type: params.restoreType,
        },
      });
      if (error) throw error;
      return data as { restored_url: string; before_url: string };
    },
  });
}

/** Auto-compile memorial video from photos */
export function useGenerateMemorialVideo() {
  return useMutation({
    mutationFn: async (params: {
      memorialId: string;
      photoUrls: string[];
      musicUrl?: string;
      title?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-memorial-video", {
        body: {
          memorial_id: params.memorialId,
          photo_urls: params.photoUrls,
          music_url: params.musicUrl,
          title: params.title,
        },
      });
      if (error) throw error;
      return data as { video_url: string; duration_seconds: number; thumbnail_url: string };
    },
  });
}
