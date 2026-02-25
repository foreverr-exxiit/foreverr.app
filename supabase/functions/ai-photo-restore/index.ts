import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Hugging Face Inference API endpoints for image restoration models */
const HF_MODELS: Record<string, string> = {
  restore: "microsoft/bringing-old-photos-back-to-life",
  colorize: "baldodge/DeOldify",
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

    const { memorial_id, photo_url, restore_type } = await req.json();
    if (!memorial_id) throw new Error("memorial_id required");
    if (!photo_url) throw new Error("photo_url required");
    if (!restore_type || !["restore", "colorize"].includes(restore_type)) {
      throw new Error("restore_type must be 'restore' or 'colorize'");
    }

    // Fetch memorial to verify it exists
    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("id, first_name, last_name")
      .eq("id", memorial_id)
      .single();
    if (memErr) throw memErr;

    const hfToken = Deno.env.get("HUGGING_FACE_TOKEN");
    let restoredUrl: string;

    if (hfToken) {
      // --- Hugging Face Inference API ---
      const model = HF_MODELS[restore_type];

      // Download the original photo
      const photoResponse = await fetch(photo_url);
      if (!photoResponse.ok) throw new Error("Failed to fetch original photo");
      const photoBlob = await photoResponse.blob();

      // Send to Hugging Face for processing
      const hfResponse = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
          },
          body: photoBlob,
        }
      );

      if (!hfResponse.ok) {
        const hfError = await hfResponse.text();
        // Model may still be loading -- surface a clear message
        if (hfResponse.status === 503) {
          throw new Error(
            "The AI model is currently loading. Please try again in 30-60 seconds."
          );
        }
        throw new Error(`Photo ${restore_type} failed: ${hfError}`);
      }

      const restoredBuffer = await hfResponse.arrayBuffer();
      const restoredBytes = new Uint8Array(restoredBuffer);

      // Upload the restored image to Supabase Storage
      const fileName = `photo-restore/${memorial_id}/${restore_type}_${crypto.randomUUID()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("ai-media")
        .upload(fileName, restoredBytes, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

      const { data: publicUrl } = supabase.storage
        .from("ai-media")
        .getPublicUrl(fileName);
      restoredUrl = publicUrl.publicUrl;
    } else {
      // --- Mock response when no API key is configured ---
      restoredUrl = `https://storage.example.com/mock/photo-restore/${memorial_id}/${restore_type}_${crypto.randomUUID()}.jpg`;
    }

    // Log the AI generation
    const { data: generation, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        memorial_id,
        requested_by: user.id,
        type: `photo_${restore_type}`,
        provider: hfToken ? "huggingface" : "mock",
        model: hfToken ? HF_MODELS[restore_type] : "mock",
        prompt_data: {
          photo_url,
          restore_type,
        },
        output_text: restoredUrl,
        tokens_used: 0,
        cost_cents: hfToken ? 5 : 0,
        status: "completed",
      })
      .select()
      .single();
    if (genErr) throw genErr;

    return new Response(
      JSON.stringify({
        restored_url: restoredUrl,
        before_url: photo_url,
        restore_type,
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
