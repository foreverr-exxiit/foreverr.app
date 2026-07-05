// ============================================================
// Edge Function: /s/:id  (rewritten from /api/s/:id via vercel.json)
// Purpose: rich link previews for shared memorial/lifecycle pages.
//
// A shared eterrn link used to point at eterrn.app (which doesn't
// resolve) or at the SPA (generic OG tags), so previews were dead or
// blank. This route fetches the memorial and returns a tiny HTML page
// with per-memorial Open Graph / Twitter tags — the honoree's photo,
// name, and years — then redirects a human visitor into the app.
//
// Crawlers (iMessage, WhatsApp, Facebook, X, Slack) read the meta tags;
// humans get bounced to /lifecycle/:id which the SPA renders.
//
// No image generation: og:image is the memorial's own photo (a real
// hosted URL), which is universally supported and can't break.
// ============================================================

export const config = { runtime: "edge" };

// These are public values — already shipped in the client bundle and
// committed to eas.json. Reading them here is not a secret exposure.
const SUPABASE_URL = "https://icwinmkpsmfejuucpmdo.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljd2lubWtwc21mZWp1dWNwbWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDA4MjEsImV4cCI6MjA4NzU3NjgyMX0.3IhoiPzDSBGtYCi90FUCzbJujLPK4eEucjEwbbDuZ1c";
const SITE = "https://foreverr-app.vercel.app";
const DEFAULT_IMAGE = `${SITE}/favicon.png`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function year(d?: string | null): string | null {
  if (!d) return null;
  const y = new Date(d).getFullYear();
  return Number.isFinite(y) ? String(y) : null;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const param = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "");

  // Resolve by id (uuid) or slug.
  const filter = UUID_RE.test(param)
    ? `id=eq.${param}`
    : `slug=eq.${encodeURIComponent(param)}`;

  let m: Record<string, any> | null = null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/memorials?${filter}&select=id,first_name,last_name,date_of_birth,date_of_death,profile_photo_url,cover_photo_url,slug&limit=1`,
      { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } },
    );
    if (res.ok) {
      const rows = await res.json();
      m = Array.isArray(rows) && rows.length ? rows[0] : null;
    }
  } catch {
    m = null;
  }

  // Compose preview content (graceful fallback if the lookup failed).
  const name = m
    ? `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "A life remembered"
    : "A life remembered";
  const by = year(m?.date_of_birth);
  const dy = year(m?.date_of_death);
  const years = by && dy ? `${by} – ${dy}` : by ? `Born ${by}` : "";
  const title = dy ? `Remembering ${name}` : name;
  const description = years
    ? `${years} · Honor their memory on ǝterrn`
    : "Honor their memory on ǝterrn";
  const image = m?.profile_photo_url || m?.cover_photo_url || DEFAULT_IMAGE;
  const appPath = m?.id ? `/lifecycle/${m.id}` : "/";
  const canonical = `${SITE}${appPath}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="ǝterrn" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta http-equiv="refresh" content="0; url=${esc(appPath)}" />
</head>
<body>
<p>Opening ${esc(name)} on ǝterrn… <a href="${esc(appPath)}">Continue</a></p>
<script>window.location.replace(${JSON.stringify(appPath)});</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Cache at the edge; memorial preview data changes rarely.
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
