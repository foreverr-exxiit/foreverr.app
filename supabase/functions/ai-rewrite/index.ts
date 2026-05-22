import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  tribute:
    "You write heartfelt, personal tributes for memorial and celebration pages. Keep them genuine and warm. Write in first person as if the author knew the person.",
  appreciation_letter:
    "You write sincere, heartfelt letters of appreciation. Express genuine gratitude and describe the impact someone has had. Write in first person.",
  legacy_letter:
    "You write meaningful legacy letters intended to be read in the future. These are deeply personal messages filled with love, advice, and memories. Write in first person.",
  living_tribute:
    "You write warm, celebratory descriptions for living tribute pages that honor someone still with us. Focus on celebration, gratitude, and love. Write in second or third person.",
  wall_message:
    "You write short, heartfelt messages for memorial or celebration walls. Keep them concise (1-3 sentences) but meaningful and personal.",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  warm: "Use a warm, conversational tone that feels like talking to a close friend.",
  formal: "Use a respectful, dignified tone appropriate for formal remembrance.",
  celebratory: "Use an uplifting, joyful tone that celebrates life and achievements.",
  poetic: "Use lyrical, poetic language with beautiful imagery and metaphor.",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Input ───────────────────────────────────────────────────────
    const {
      content,
      context_type = "tribute",
      tone = "warm",
      mode = "suggest", // "suggest" | "rewrite"
      hint,
      memorial_id,
      recipient_name,
    } = await req.json();

    // Validate context_type
    const validContextTypes = [
      "tribute",
      "appreciation_letter",
      "legacy_letter",
      "living_tribute",
      "wall_message",
    ];
    if (!validContextTypes.includes(context_type)) {
      throw new Error(`Invalid context_type: ${context_type}`);
    }

    // ── Fetch memorial context if available ─────────────────────────
    let memorialContext = "";
    if (memorial_id) {
      const { data: memorial } = await supabase
        .from("memorials")
        .select("first_name, last_name, nickname, date_of_birth, date_of_death")
        .eq("id", memorial_id)
        .single();
      if (memorial) {
        const name = memorial.nickname || memorial.first_name;
        memorialContext = `\nAbout the person: ${memorial.first_name} ${memorial.last_name}${memorial.nickname ? ` (${memorial.nickname})` : ""}`;
        if (memorial.date_of_birth)
          memorialContext += `, born ${memorial.date_of_birth}`;
        if (memorial.date_of_death)
          memorialContext += `, passed ${memorial.date_of_death}`;
        memorialContext += ".";
      }
    }

    // ── Build prompt ────────────────────────────────────────────────
    const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.warm;
    const systemPrompt = SYSTEM_PROMPTS[context_type] ?? SYSTEM_PROMPTS.tribute;

    let userPrompt: string;

    if (mode === "rewrite" && content) {
      userPrompt = `Please improve and polish the following ${context_type.replace(/_/g, " ")}. Keep the original meaning and sentiment, but make it more eloquent and impactful. ${toneInstruction}
${memorialContext}
${hint ? `\nAdditional guidance: ${hint}` : ""}
${recipient_name ? `\nRecipient: ${recipient_name}` : ""}

Original text:
"""
${content}
"""

Provide only the improved text, no explanations or preambles.`;
    } else {
      // Suggest mode — generate from scratch
      const lengthGuide =
        context_type === "wall_message"
          ? "Write 1-3 sentences."
          : context_type === "tribute"
          ? "Write 50-150 words."
          : "Write 100-250 words.";

      userPrompt = `Write a ${context_type.replace(/_/g, " ")} from scratch. ${toneInstruction} ${lengthGuide}
${memorialContext}
${hint ? `\nContext/guidance: ${hint}` : ""}
${recipient_name ? `\nRecipient: ${recipient_name}` : ""}
${content ? `\nThe user has started writing: "${content.slice(0, 200)}"` : ""}

Provide only the text, no explanations or preambles.`;
    }

    // ── Call OpenAI ─────────────────────────────────────────────────
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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: context_type === "wall_message" ? 150 : 500,
          temperature: 0.8,
        }),
      }
    );

    const aiResult = await openaiResponse.json();
    if (!openaiResponse.ok)
      throw new Error(aiResult.error?.message || "OpenAI request failed");

    const outputText = aiResult.choices[0].message.content;
    const tokensUsed = aiResult.usage?.total_tokens ?? 0;

    // ── Log generation ──────────────────────────────────────────────
    await supabase.from("ai_generations").insert({
      memorial_id: memorial_id || null,
      requested_by: user.id,
      type: context_type,
      provider: "openai",
      model: "gpt-4o",
      prompt_data: { context_type, tone, mode, hint, content_length: content?.length ?? 0 },
      output_text: outputText,
      tokens_used: tokensUsed,
      cost_cents: Math.ceil(tokensUsed * 0.003),
      status: "completed",
    });

    return new Response(
      JSON.stringify({ text: outputText, mode, context_type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
