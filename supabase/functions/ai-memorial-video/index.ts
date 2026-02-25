import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Default duration per photo in the slideshow (seconds) */
const SECONDS_PER_PHOTO = 5;
/** Default transition overlap between photos (seconds) */
const TRANSITION_OVERLAP = 1;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    // Calculate estimated video duration
    const photoCount = photo_urls.length;
    const slideshowDuration =
      photoCount * SECONDS_PER_PHOTO - (photoCount - 1) * TRANSITION_OVERLAP;
    // Add intro (3s) and outro (4s) segments
    const totalDuration = slideshowDuration + 3 + 4;

    const videoTitle =
      title ||
      `In Loving Memory of ${memorial.first_name} ${memorial.last_name}`;

    // --- Mock implementation ---
    // In production this would:
    // 1. Download all photos and optional music track
    // 2. Send to a video rendering service (e.g., Shotstack, Creatomate, or a custom FFmpeg pipeline)
    // 3. Poll for completion and retrieve the rendered video
    // 4. Upload the final video + thumbnail to Supabase Storage

    const jobId = crypto.randomUUID();
    const videoUrl = `https://storage.example.com/mock/memorial-video/${memorial_id}/${jobId}.mp4`;
    const thumbnailUrl = photo_urls[0]; // Use the first photo as a thumbnail placeholder

    // Log the AI generation
    const { data: generation, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        memorial_id,
        requested_by: user.id,
        type: "memorial_video",
        provider: "mock",
        model: "mock",
        prompt_data: {
          photo_urls,
          music_url: music_url || null,
          title: videoTitle,
          photo_count: photoCount,
        },
        output_text: videoUrl,
        tokens_used: 0,
        cost_cents: 0,
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
