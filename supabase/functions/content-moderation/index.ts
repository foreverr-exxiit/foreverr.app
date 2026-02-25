import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const { content, content_type } = await req.json();
    if (!content) throw new Error("content required");

    const moderationResponse = await fetch(
      "https://api.openai.com/v1/moderations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content }),
      }
    );

    const result = await moderationResponse.json();
    if (!moderationResponse.ok)
      throw new Error(result.error?.message || "Moderation request failed");

    const modResult = result.results[0];
    const flagged = modResult.flagged;
    const categories = modResult.categories as Record<string, boolean>;

    // Determine action based on severity
    const severeCategories = [
      "sexual/minors",
      "hate/threatening",
      "violence/graphic",
      "self-harm/intent",
    ];

    const hasSevere = severeCategories.some((cat) => categories[cat]);
    const action = hasSevere ? "block" : flagged ? "flag" : "allow";

    return new Response(
      JSON.stringify({ flagged, categories, action, content_type }),
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
