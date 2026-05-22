// ============================================================
// Edge Function: ai-life-story
// Purpose: Generate a narrative life story from timeline events,
//          milestones, tributes, and memorial data using AI.
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth check — require a valid user ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { memorial_id, style = "narrative", tone = "warm" } = await req.json();
    if (!memorial_id) {
      return new Response(
        JSON.stringify({ error: "memorial_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gather all data about this person
    const [memorialRes, milestonesRes, timelineRes, tributesRes] = await Promise.all([
      supabase.from("memorials").select("*").eq("id", memorial_id).single(),
      supabase.from("life_milestones").select("*").eq("memorial_id", memorial_id).order("milestone_date", { ascending: true }),
      supabase.from("life_timeline_events").select("*").eq("memorial_id", memorial_id).order("sort_date", { ascending: true }),
      supabase.from("tributes").select("content, author_id").eq("memorial_id", memorial_id).limit(10),
    ]);

    const memorial = memorialRes.data;
    if (!memorial) {
      return new Response(
        JSON.stringify({ error: "Memorial not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const milestones = milestonesRes.data ?? [];
    const timeline = timelineRes.data ?? [];
    const tributes = tributesRes.data ?? [];

    // Build context
    const name = `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim();
    const born = memorial.date_of_birth ? new Date(memorial.date_of_birth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
    const passed = memorial.date_of_death ? new Date(memorial.date_of_death).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

    const milestoneSummary = milestones.map((m: any) =>
      `- ${m.title}${m.milestone_date ? ` (${new Date(m.milestone_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })})` : ""}${m.description ? `: ${m.description}` : ""}`
    ).join("\n");

    const timelineSummary = timeline.filter((t: any) => t.source_type !== "auto_milestone").map((t: any) =>
      `- ${t.title}${t.event_date ? ` (${new Date(t.event_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })})` : ""}${t.description ? `: ${t.description.slice(0, 100)}` : ""}`
    ).join("\n");

    const tributeExcerpts = tributes.map((t: any) => `"${(t.content ?? "").slice(0, 150)}"`).join("\n");

    const styleInstructions: Record<string, string> = {
      narrative: "Write a flowing narrative biography that reads like a heartfelt story. Use past tense for those who have passed, present tense for the living.",
      timeline: "Write a chronological life story organized by time periods (childhood, youth, adulthood, etc.).",
      celebration: "Write a celebratory tribute that highlights achievements, relationships, and joyful moments.",
      legacy: "Write about the lasting impact and legacy this person leaves behind, focusing on how they touched others' lives.",
    };

    const prompt = `You are a compassionate biographer for ǝterrn, a memorial and life celebration platform.

${styleInstructions[style] ?? styleInstructions.narrative}

Tone: ${tone} (warm, dignified, and respectful)

Person: ${name}
${born ? `Born: ${born}` : ""}
${passed ? `Passed: ${passed}` : ""}
${memorial.place_of_birth ? `Place of birth: ${memorial.place_of_birth}` : ""}
${memorial.biography ? `Existing biography: ${memorial.biography}` : ""}

${milestones.length > 0 ? `Life's Turning Points:\n${milestoneSummary}` : ""}
${timeline.length > 0 ? `Life Events:\n${timelineSummary}` : ""}
${tributes.length > 0 ? `What others said about ${name}:\n${tributeExcerpts}` : ""}

Write a ${passed ? "memorial" : "celebratory"} life story of 300-500 words. Be specific about the turning points and events provided.
Do not fabricate details that weren't provided. If information is sparse, focus on the emotional narrative and what is known.
End with a meaningful reflection on ${name}'s life and impact.`;

    // Call OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a compassionate and skilled biographer." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const aiData = await aiResponse.json();
    const story = aiData.choices?.[0]?.message?.content ?? "";

    return new Response(
      JSON.stringify({
        success: true,
        story,
        metadata: {
          name,
          milestones_used: milestones.length,
          events_used: timeline.length,
          tributes_used: tributes.length,
          style,
          tone,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Life Story error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
