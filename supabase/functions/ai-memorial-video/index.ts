// ============================================================
// Edge Function: ai-memorial-video
// Purpose: Generate memorial tribute videos from photos
// Provider: Creatomate (creatomate.com) — set CREATOMATE_API_KEY in secrets
// Fallback: Returns mock video URL if API key not configured
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CREATOMATE_API_KEY = Deno.env.get("CREATOMATE_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Default duration per photo in the slideshow (seconds) */
const SECONDS_PER_PHOTO = 5;
/** Default transition overlap between photos (seconds) */
const TRANSITION_OVERLAP = 1;

/**
 * Build a Creatomate render request for a memorial video.
 * Creates a slideshow with Ken Burns effect, title card, and outro.
 */
function buildCreatomatePayload(
  photos: string[],
  title: string,
  memorialDates: string,
  musicUrl: string | null
) {
  // Build slideshow elements from photos
  const photoElements = photos.map((url, i) => ({
    type: "image",
    source: url,
    duration: SECONDS_PER_PHOTO,
    animations: [
      {
        type: "scale",
        start_scale: "100%",
        end_scale: "110%",
        easing: "linear",
      },
    ],
    transition: i > 0 ? { type: "crossfade", duration: TRANSITION_OVERLAP } : undefined,
  }));

  return {
    output_format: "mp4",
    width: 1080,
    height: 1920,
    frame_rate: 30,
    elements: [
      // Background
      {
        type: "shape",
        shape_type: "rectangle",
        fill_color: "#111111",
        width: "100%",
        height: "100%",
      },
      // Title card (3 seconds)
      {
        type: "composition",
        duration: 3,
        elements: [
          {
            type: "text",
            text: title,
            font_family: "Georgia",
            font_size: 48,
            fill_color: "#FFFFFF",
            x: "50%",
            y: "40%",
            text_align: "center",
            animations: [{ type: "fade", fade_duration: 1 }],
          },
          {
            type: "text",
            text: memorialDates,
            font_family: "Inter",
            font_size: 24,
            fill_color: "#B8A9D4",
            x: "50%",
            y: "55%",
            text_align: "center",
            animations: [{ type: "fade", fade_duration: 1 }],
          },
        ],
      },
      // Photo slideshow
      ...photoElements,
      // Outro card (4 seconds)
      {
        type: "composition",
        duration: 4,
        elements: [
          {
            type: "text",
            text: "Forever in our hearts",
            font_family: "Georgia",
            font_size: 36,
            fill_color: "#FFFFFF",
            x: "50%",
            y: "40%",
            text_align: "center",
            animations: [{ type: "fade", fade_duration: 1.5 }],
          },
          {
            type: "text",
            text: "Created with ǝterrn",
            font_family: "Inter",
            font_size: 16,
            fill_color: "#7C3AED",
            x: "50%",
            y: "90%",
            text_align: "center",
          },
        ],
      },
      // Background music (if provided)
      ...(musicUrl
        ? [
            {
              type: "audio" as const,
              source: musicUrl,
              volume: 50,
              audio_fade_out: 3,
            },
          ]
        : []),
    ],
  };
}

/**
 * Submit a render job to Creatomate and poll for completion.
 * Returns the rendered video URL.
 */
async function renderWithCreatomate(
  photos: string[],
  title: string,
  memorialDates: string,
  musicUrl: string | null
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const payload = buildCreatomatePayload(photos, title, memorialDates, musicUrl);

  // Start render
  const renderRes = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CREATOMATE_API_KEY}`,
    },
    body: JSON.stringify([payload]),
  });

  if (!renderRes.ok) {
    const err = await renderRes.text();
    throw new Error(`Creatomate render failed: ${err}`);
  }

  const renders = await renderRes.json();
  const renderId = renders[0]?.id;
  if (!renderId) throw new Error("No render ID returned from Creatomate");

  // Poll for completion (max 5 minutes)
  const maxAttempts = 60;
  const pollInterval = 5000; // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const statusRes = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
      headers: { Authorization: `Bearer ${CREATOMATE_API_KEY}` },
    });

    if (!statusRes.ok) continue;

    const status = await statusRes.json();

    if (status.status === "succeeded") {
      return {
        videoUrl: status.url,
        thumbnailUrl: status.snapshot_url ?? photos[0],
      };
    }

    if (status.status === "failed") {
      throw new Error(`Video render failed: ${status.error_message ?? "Unknown error"}`);
    }

    // Still processing — continue polling
  }

  throw new Error("Video render timed out after 5 minutes");
}

// ── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get("Authorization")!;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { memorial_id, photo_urls, music_url, title } = await req.json();
    if (!memorial_id) throw new Error("memorial_id required");
    if (!photo_urls || !Array.isArray(photo_urls) || photo_urls.length === 0) {
      throw new Error("photo_urls must be a non-empty array of image URLs");
    }
    if (photo_urls.length > 50) {
      throw new Error("Maximum of 50 photos allowed per memorial video");
    }

    // Fetch memorial for metadata
    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("id, first_name, last_name, date_of_birth, date_of_death")
      .eq("id", memorial_id)
      .single();
    if (memErr) throw memErr;

    const photoCount = photo_urls.length;
    const slideshowDuration =
      photoCount * SECONDS_PER_PHOTO - (photoCount - 1) * TRANSITION_OVERLAP;
    const totalDuration = slideshowDuration + 3 + 4; // intro + slideshow + outro

    const videoTitle =
      title ||
      `In Loving Memory of ${memorial.first_name} ${memorial.last_name}`;

    const memorialDates = [
      memorial.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : "",
      memorial.date_of_death ? new Date(memorial.date_of_death).getFullYear() : "",
    ]
      .filter(Boolean)
      .join(" — ");

    let videoUrl: string;
    let thumbnailUrl: string;
    let provider: string;

    if (CREATOMATE_API_KEY) {
      // ── Real Implementation: Creatomate ──
      const result = await renderWithCreatomate(
        photo_urls,
        videoTitle,
        memorialDates,
        music_url || null
      );
      videoUrl = result.videoUrl;
      thumbnailUrl = result.thumbnailUrl;
      provider = "creatomate";
    } else {
      // ── Fallback: Mock implementation ──
      console.warn("CREATOMATE_API_KEY not set — using mock video generation");
      const jobId = crypto.randomUUID();
      videoUrl = `https://storage.example.com/mock/memorial-video/${memorial_id}/${jobId}.mp4`;
      thumbnailUrl = photo_urls[0];
      provider = "mock";
    }

    // Log the AI generation
    const { data: generation, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        memorial_id,
        requested_by: user.id,
        type: "memorial_video",
        provider,
        model: provider === "creatomate" ? "creatomate-v1" : "mock",
        prompt_data: {
          photo_urls,
          music_url: music_url || null,
          title: videoTitle,
          photo_count: photoCount,
        },
        output_text: videoUrl,
        tokens_used: 0,
        cost_cents: provider === "creatomate" ? Math.ceil(photoCount * 5) : 0,
        status: "completed",
      })
      .select()
      .single();
    if (genErr) throw genErr;

    return new Response(
      JSON.stringify({
        video_url: videoUrl,
        duration_seconds: Math.round(totalDuration),
        thumbnail_url: thumbnailUrl,
        title: videoTitle,
        photo_count: photoCount,
        generation_id: generation.id,
        provider,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
