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

    const { memorial_id, attributes, impact, memories } = await req.json();
    if (!memorial_id) throw new Error("memorial_id required");

    // Fetch memorial data for context
    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("first_name, last_name, nickname, date_of_birth, date_of_death")
      .eq("id", memorial_id)
      .single();
    if (memErr) throw memErr;

    const name = memorial.nickname || memorial.first_name;

    const prompt = `Write a heartfelt tribute for ${memorial.first_name} ${memorial.last_name}${memorial.nickname ? ` (${memorial.nickname})` : ""}.

${attributes ? `Their qualities and attributes: ${attributes}` : ""}
${impact ? `Their impact on others: ${impact}` : ""}
${memories ? `Cherished memories: ${memories}` : ""}

Write a 50-150 word tribute that feels personal and genuine. Use first person perspective as if from someone who knew ${name}. Be warm but not overly sentimental.`;

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
                "You write heartfelt, personal tributes for memorial pages. Keep them genuine and warm without being generic. Write in first person.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.8,
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
        type: "tribute",
        provider: "openai",
        model: "gpt-4o",
        prompt_data: { attributes, impact, memories },
        output_text: outputText,
        tokens_used: tokensUsed,
        cost_cents: Math.ceil(tokensUsed * 0.003),
        status: "completed",
      })
      .select()
      .single();
    if (genErr) throw genErr;

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
