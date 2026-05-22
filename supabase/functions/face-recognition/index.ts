// ============================================================
// Edge Function: face-recognition
// Purpose: Detect faces in photos and match against known people
// Provider: Google Cloud Vision API (set GOOGLE_VISION_API_KEY)
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FaceDetection {
  boundingPoly: { vertices: Array<{ x: number; y: number }> };
  fdBoundingPoly: { vertices: Array<{ x: number; y: number }> };
  detectionConfidence: number;
  joyLikelihood: string;
  sorrowLikelihood: string;
}

interface DetectRequest {
  photo_url: string;
  memorial_id: string;
  auto_tag?: boolean; // If true, attempt to match faces to known people
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_VISION_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "GOOGLE_VISION_API_KEY not configured. Set it in Supabase secrets.",
          hint: "Get an API key at https://console.cloud.google.com/apis/library/vision.googleapis.com",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: DetectRequest = await req.json();
    const { photo_url, memorial_id, auto_tag = true } = body;

    if (!photo_url) {
      return new Response(
        JSON.stringify({ error: "photo_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Call Google Cloud Vision API for face detection
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

    const visionResponse = await fetch(visionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: photo_url } },
            features: [
              { type: "FACE_DETECTION", maxResults: 20 },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      const err = await visionResponse.text();
      throw new Error(`Google Vision API error: ${err}`);
    }

    const visionData = await visionResponse.json();
    const faces: FaceDetection[] = visionData.responses?.[0]?.faceAnnotations ?? [];

    if (faces.length === 0) {
      return new Response(
        JSON.stringify({ success: true, faces_detected: 0, tags_created: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get image dimensions (approximate from bounding polys)
    let maxX = 1;
    let maxY = 1;
    for (const face of faces) {
      for (const v of face.boundingPoly.vertices) {
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      }
    }
    // Add padding
    maxX *= 1.1;
    maxY *= 1.1;

    // 3. Create face tags for each detected face
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    let tagsCreated = 0;

    for (const face of faces) {
      const vertices = face.fdBoundingPoly?.vertices ?? face.boundingPoly.vertices;
      const minX = Math.min(...vertices.map((v: any) => v.x ?? 0));
      const minY = Math.min(...vertices.map((v: any) => v.y ?? 0));
      const faceMaxX = Math.max(...vertices.map((v: any) => v.x ?? 0));
      const faceMaxY = Math.max(...vertices.map((v: any) => v.y ?? 0));

      // Normalize to 0-1 coordinates
      const faceX = ((minX + faceMaxX) / 2) / maxX;
      const faceY = ((minY + faceMaxY) / 2) / maxY;
      const faceWidth = (faceMaxX - minX) / maxX;
      const faceHeight = (faceMaxY - minY) / maxY;

      const { error: tagError } = await supabase
        .from("photo_face_tags")
        .insert({
          photo_url,
          memorial_id: memorial_id || null,
          face_x: Math.round(faceX * 10000) / 10000,
          face_y: Math.round(faceY * 10000) / 10000,
          face_width: Math.round(faceWidth * 10000) / 10000,
          face_height: Math.round(faceHeight * 10000) / 10000,
          confidence: face.detectionConfidence,
          is_auto_detected: true,
          is_verified: false,
          tagged_by: user?.id ?? null,
          tagged_name: null, // Will be filled by user or auto-matching
        });

      if (!tagError) tagsCreated++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        faces_detected: faces.length,
        tags_created: tagsCreated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Face recognition error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
