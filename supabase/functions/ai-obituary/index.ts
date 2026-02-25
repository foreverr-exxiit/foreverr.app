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

    // Fetch host relationship context
    const { data: hostData } = await supabase
      .from("memorial_hosts")
      .select("relationship, relationship_detail")
      .eq("memorial_id", memorial_id)
      .eq("user_id", user.id)
      .maybeSingle();

    const styleInstructions: Record<string, string> = {
      formal:
        "Write in a formal, traditional obituary style with dignified language.",
      warm: "Write in a warm, heartfelt style that celebrates the person's life and relationships.",
      celebratory:
        "Write in an uplifting, celebratory tone focusing on the joy this person brought to others.",
    };

    const prompt = `Write an obituary for ${memorial.first_name} ${memorial.last_name}.
Born: ${memorial.date_of_birth || "unknown"}
Died: ${memorial.date_of_death || "unknown"}
Place of birth: ${memorial.place_of_birth || "unknown"}
Place of death: ${memorial.place_of_death || "unknown"}
${memorial.biography ? `Biography notes: ${memorial.biography}` : ""}
${hostData?.relationship ? `Relationship to requestor: ${hostData.relationship}` : ""}
${hostData?.relationship_detail ? `Detail: ${hostData.relationship_detail}` : ""}

Style: ${styleInstructions[style] || styleInstructions.warm}

Write 200-400 words. Be respectful and compassionate. Do not make up specific details not provided.`;

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
                "You are a compassionate obituary writer. Write respectful, dignified obituaries based on the information provided. Never fabricate details.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
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
        type: "obituary",
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

    // Update memorial with generated obituary
    await supabase
      .from("memorials")
      .update({ obituary: outputText, obituary_is_ai_generated: true })
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
