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

    const { memorial_id, style } = await req.json();
    if (!memorial_id || !style) throw new Error("memorial_id and style required");

    // Fetch memorial data
    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("*")
      .eq("id", memorial_id)
      .single();
    if (memErr) throw memErr;

    // Fetch host data for additional context
    const { data: hosts } = await supabase
      .from("memorial_hosts")
      .select("relationship, relationship_detail")
      .eq("memorial_id", memorial_id);

    const structureInstructions: Record<string, string> = {
      chronological:
        "Organize the biography chronologically from birth through life milestones to death. Use time-based sections.",
      thematic:
        "Organize the biography thematically around the person's roles, passions, relationships, and legacy. Use themed sections.",
    };

    const prompt = `Write a biography for ${memorial.first_name} ${memorial.last_name}.

Key facts:
- Born: ${memorial.date_of_birth || "unknown"}
- Died: ${memorial.date_of_death || "unknown"}
- Place of birth: ${memorial.place_of_birth || "unknown"}
- Place of death: ${memorial.place_of_death || "unknown"}
${memorial.nickname ? `- Known as: ${memorial.nickname}` : ""}
${memorial.obituary ? `\nExisting obituary for reference:\n${memorial.obituary}` : ""}
${hosts?.length ? `\nRelationships: ${hosts.map((h) => `${h.relationship}${h.relationship_detail ? ` (${h.relationship_detail})` : ""}`).join(", ")}` : ""}

Structure: ${structureInstructions[style] || structureInstructions.chronological}

Write 400-800 words. Be respectful and celebratory of their life. Do not fabricate specific details not provided — use graceful language to fill gaps.`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a compassionate biographer specializing in memorial tributes. Write beautiful, respectful biographies that celebrate the person's life. Never fabricate details.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }
    );

    const aiResult = await openaiResponse.json();
    if (!openaiResponse.ok)
      throw new Error(aiResult.error?.message || "OpenAI request failed");

    const outputText = aiResult.choices[0].message.content;
    const tokensUsed = aiResult.usage.total_tokens;

    // Log generation
    const { data: generation, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        memorial_id,
        requested_by: user.id,
        type: "biography",
        provider: "openai",
        model: "gpt-4o",
        prompt_data: { style, prompt_length: prompt.length },
        output_text: outputText,
        tokens_used: tokensUsed,
        cost_cents: Math.ceil(tokensUsed * 0.003),
        status: "completed",
        style,
      })
      .select()
      .single();
    if (genErr) throw genErr;

    // Update memorial with generated biography
    await supabase
      .from("memorials")
      .update({ biography: outputText, biography_is_ai_generated: true })
      .eq("id", memorial_id);

    return new Response(JSON.stringify({ generation, text: outputText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
