import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { memorial_id, text, voice_sample_url } = await req.json();
    if (!memorial_id) throw new Error("memorial_id required");
    if (!text) throw new Error("text required");

    // Fetch memorial for context
    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("first_name, last_name")
      .eq("id", memorial_id)
      .single();
    if (memErr) throw memErr;

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    let audioUrl: string;
    let durationSeconds: number;

    if (elevenLabsApiKey) {
      // --- ElevenLabs voice generation ---
      let voiceId: string;

      if (voice_sample_url) {
        // Clone voice from the provided sample
        const sampleResponse = await fetch(voice_sample_url);
        if (!sampleResponse.ok) throw new Error("Failed to fetch voice sample");
        const sampleBlob = await sampleResponse.blob();

        const formData = new FormData();
        formData.append("name", `${memorial.first_name} ${memorial.last_name} - Memorial Voice`);
        formData.append("description", `AI voice clone for memorial ${memorial_id}`);
        formData.append("files", sampleBlob, "voice_sample.mp3");

        const cloneResponse = await fetch(
          "https://api.elevenlabs.io/v1/voices/add",
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsApiKey,
            },
            body: formData,
          }
        );

        if (!cloneResponse.ok) {
          const cloneError = await cloneResponse.json();
          throw new Error(cloneError.detail?.message || "Voice cloning failed");
        }

        const cloneResult = await cloneResponse.json();
        voiceId = cloneResult.voice_id;
      } else {
        // Use a default warm, comforting voice
        voiceId = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel" default voice
      }

      // Generate speech from text
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const ttsError = await ttsResponse.json();
        throw new Error(ttsError.detail?.message || "Text-to-speech generation failed");
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBytes = new Uint8Array(audioBuffer);

      // Estimate duration: ~16kbps for MP3 at standard quality
      durationSeconds = Math.round(audioBytes.length / (16 * 1024 / 8));

      // Upload to Supabase Storage
      const fileName = `voice/${memorial_id}/${crypto.randomUUID()}.mp3`;
      const { error: uploadErr } = await supabase.storage
        .from("ai-media")
        .upload(fileName, audioBytes, {
          contentType: "audio/mpeg",
          upsert: false,
        });
      if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

      const { data: publicUrl } = supabase.storage
        .from("ai-media")
        .getPublicUrl(fileName);
      audioUrl = publicUrl.publicUrl;
    } else {
      // --- Mock response when no API key is configured ---
      durationSeconds = Math.max(5, Math.round(text.split(/\s+/).length / 2.5));
      audioUrl = `https://storage.example.com/mock/voice/${memorial_id}/${crypto.randomUUID()}.mp3`;
    }

    // Log the AI generation
    const { data: generation, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        memorial_id,
        requested_by: user.id,
        type: "voice",
        provider: elevenLabsApiKey ? "elevenlabs" : "mock",
        model: elevenLabsApiKey ? "eleven_monolingual_v1" : "mock",
        prompt_data: {
          text,
          voice_sample_url: voice_sample_url || null,
        },
        output_text: audioUrl,
        tokens_used: text.length,
        cost_cents: elevenLabsApiKey ? Math.ceil(text.length * 0.03) : 0,
        status: "completed",
      })
      .select()
      .single();
    if (genErr) throw genErr;

    return new Response(
      JSON.stringify({
        audio_url: audioUrl,
        duration_seconds: durationSeconds,
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
