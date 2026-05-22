// ============================================================
// Edge Function: duplicate-detection
// Purpose: Detect potential duplicate memorials using name/date similarity
// Called by: Admin dashboard or automated checks on memorial creation
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DuplicateCheckRequest {
  // Check a specific memorial against all others
  memorial_id?: string;
  // Or check by name/dates directly (e.g. during creation)
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  date_of_death?: string;
  // Scan all recent memorials for duplicates (admin)
  scan_all?: boolean;
  // Minimum similarity threshold (0-1, default 0.7)
  threshold?: number;
}

interface DuplicateMatch {
  memorial_id_a: string;
  memorial_id_b: string;
  name_a: string;
  name_b: string;
  similarity_score: number;
  reasons: string[];
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate name similarity score (0-1)
 */
function nameSimilarity(name1: string, name2: string): number {
  const a = name1.toLowerCase().trim();
  const b = name2.toLowerCase().trim();
  if (a === b) return 1.0;
  if (!a || !b) return 0;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

/**
 * Check if two dates match (allowing for format differences)
 */
function datesMatch(date1: string | null, date2: string | null): boolean {
  if (!date1 || !date2) return false;
  // Normalize to YYYY-MM-DD format
  const d1 = new Date(date1).toISOString().slice(0, 10);
  const d2 = new Date(date2).toISOString().slice(0, 10);
  return d1 === d2;
}

/**
 * Calculate overall duplicate similarity score
 */
function calculateSimilarity(
  memorial1: Record<string, unknown>,
  memorial2: Record<string, unknown>
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const fullName1 = `${memorial1.first_name ?? ""} ${memorial1.last_name ?? ""}`.trim();
  const fullName2 = `${memorial2.first_name ?? ""} ${memorial2.last_name ?? ""}`.trim();

  // Name similarity (weight: 50%)
  const nameScore = nameSimilarity(fullName1, fullName2);
  score += nameScore * 0.5;
  if (nameScore > 0.8) reasons.push(`Similar names: "${fullName1}" ↔ "${fullName2}"`);
  if (nameScore === 1.0) reasons.push("Exact name match");

  // Last name exact match bonus (weight: 10%)
  const ln1 = (memorial1.last_name as string ?? "").toLowerCase().trim();
  const ln2 = (memorial2.last_name as string ?? "").toLowerCase().trim();
  if (ln1 && ln2 && ln1 === ln2) {
    score += 0.1;
    reasons.push("Same last name");
  }

  // Date of birth match (weight: 20%)
  if (datesMatch(memorial1.date_of_birth as string, memorial2.date_of_birth as string)) {
    score += 0.2;
    reasons.push("Same date of birth");
  }

  // Date of death match (weight: 15%)
  if (datesMatch(memorial1.date_of_death as string, memorial2.date_of_death as string)) {
    score += 0.15;
    reasons.push("Same date of death");
  }

  // Place similarity (weight: 5%)
  const place1 = (memorial1.place_of_birth as string ?? "").toLowerCase();
  const place2 = (memorial2.place_of_birth as string ?? "").toLowerCase();
  if (place1 && place2 && (place1.includes(place2) || place2.includes(place1))) {
    score += 0.05;
    reasons.push("Similar birthplace");
  }

  return { score: Math.min(score, 1.0), reasons };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Auth check — always required
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

    const body: DuplicateCheckRequest = await req.json();
    const threshold = body.threshold ?? 0.7;
    const matches: DuplicateMatch[] = [];

    // scan_all mode requires admin role
    if (body.scan_all) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || (profile as any).role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Admin access required for scan_all" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Mode 1: Check a specific memorial ──
    if (body.memorial_id) {
      const { data: target, error } = await supabase
        .from("memorials")
        .select("id, first_name, last_name, date_of_birth, date_of_death, place_of_birth")
        .eq("id", body.memorial_id)
        .single();

      if (error || !target) throw new Error("Memorial not found");

      // Find candidates with similar last name first (for performance)
      const lastName = (target.last_name ?? "").trim();
      let query = supabase
        .from("memorials")
        .select("id, first_name, last_name, date_of_birth, date_of_death, place_of_birth")
        .neq("id", body.memorial_id)
        .limit(200);

      if (lastName) {
        query = query.ilike("last_name", `%${lastName}%`);
      }

      const { data: candidates } = await query;

      for (const candidate of candidates ?? []) {
        const { score, reasons } = calculateSimilarity(target, candidate);
        if (score >= threshold) {
          matches.push({
            memorial_id_a: target.id,
            memorial_id_b: candidate.id,
            name_a: `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim(),
            name_b: `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim(),
            similarity_score: Math.round(score * 100) / 100,
            reasons,
          });
        }
      }
    }
    // ── Mode 2: Check by name/dates (pre-creation check) ──
    else if (body.first_name || body.last_name) {
      const searchTarget = {
        first_name: body.first_name ?? "",
        last_name: body.last_name ?? "",
        date_of_birth: body.date_of_birth ?? null,
        date_of_death: body.date_of_death ?? null,
        place_of_birth: null,
      };

      let query = supabase
        .from("memorials")
        .select("id, first_name, last_name, date_of_birth, date_of_death, place_of_birth")
        .limit(200);

      if (body.last_name) {
        query = query.ilike("last_name", `%${body.last_name}%`);
      }

      const { data: candidates } = await query;

      for (const candidate of candidates ?? []) {
        const { score, reasons } = calculateSimilarity(searchTarget, candidate);
        if (score >= threshold) {
          matches.push({
            memorial_id_a: "new",
            memorial_id_b: candidate.id,
            name_a: `${body.first_name ?? ""} ${body.last_name ?? ""}`.trim(),
            name_b: `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim(),
            similarity_score: Math.round(score * 100) / 100,
            reasons,
          });
        }
      }
    }
    // ── Mode 3: Scan all recent memorials (admin) ──
    else if (body.scan_all) {
      const { data: recent } = await supabase
        .from("memorials")
        .select("id, first_name, last_name, date_of_birth, date_of_death, place_of_birth")
        .order("created_at", { ascending: false })
        .limit(500);

      const memorials = recent ?? [];
      const seen = new Set<string>();

      for (let i = 0; i < memorials.length; i++) {
        for (let j = i + 1; j < memorials.length; j++) {
          const pairKey = [memorials[i].id, memorials[j].id].sort().join("-");
          if (seen.has(pairKey)) continue;
          seen.add(pairKey);

          const { score, reasons } = calculateSimilarity(memorials[i], memorials[j]);
          if (score >= threshold) {
            matches.push({
              memorial_id_a: memorials[i].id,
              memorial_id_b: memorials[j].id,
              name_a: `${memorials[i].first_name ?? ""} ${memorials[i].last_name ?? ""}`.trim(),
              name_b: `${memorials[j].first_name ?? ""} ${memorials[j].last_name ?? ""}`.trim(),
              similarity_score: Math.round(score * 100) / 100,
              reasons,
            });
          }
        }
      }
    }

    // Sort by similarity score descending
    matches.sort((a, b) => b.similarity_score - a.similarity_score);

    return new Response(
      JSON.stringify({
        matches,
        count: matches.length,
        threshold,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Duplicate detection error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
