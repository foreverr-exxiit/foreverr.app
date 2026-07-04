/**
 * Deep Link / Universal Link Handler for ǝterrn
 *
 * Handles incoming URLs from:
 * - Universal links: https://eterrn.app/lifecycle/abc123
 * - Custom scheme: eterrn://lifecycle/abc123
 * - Invite links: https://eterrn.app/invite/CODE
 * - Legacy links: https://eterrn.app/johnsmith
 *
 * Usage in _layout.tsx:
 *   import { handleDeepLink } from "@foreverr/core";
 *   useEffect(() => {
 *     const sub = Linking.addEventListener("url", ({ url }) => {
 *       const route = handleDeepLink(url);
 *       if (route) router.push(route);
 *     });
 *     return () => sub.remove();
 *   }, []);
 */

// ── Route patterns ──────────────────────────────────────────

interface DeepLinkRoute {
  path: string;
  params?: Record<string, string>;
}

const ROUTE_PATTERNS: Array<{
  pattern: RegExp;
  transform: (matches: RegExpMatchArray) => DeepLinkRoute;
}> = [
  // Memorial sub-pages (must come before the generic memorial detail pattern)
  {
    pattern: /\/memorial\/([a-f0-9-]+)\/wall/,
    transform: (m) => ({ path: `/lifecycle/${m[1]}/wall` }),
  },
  {
    pattern: /\/memorial\/([a-f0-9-]+)\/timeline/,
    transform: (m) => ({ path: `/timeline`, params: { memorialId: m[1] } }),
  },
  {
    pattern: /\/memorial\/([a-f0-9-]+)\/milestones/,
    transform: (m) => ({ path: `/milestones`, params: { memorialId: m[1] } }),
  },
  // Memorial detail (generic — after sub-page patterns)
  {
    pattern: /\/memorial\/([a-f0-9-]+)/,
    transform: (m) => ({ path: `/lifecycle/${m[1]}` }),
  },
  // User profile
  {
    pattern: /\/user\/([a-f0-9-]+)/,
    transform: (m) => ({ path: `/user/${m[1]}` }),
  },
  // Invite link
  {
    pattern: /\/invite\/([a-zA-Z0-9]+)/,
    transform: (m) => ({ path: `/invite`, params: { code: m[1] } }),
  },
  // Event detail
  {
    pattern: /\/events\/([a-f0-9-]+)/,
    transform: (m) => ({ path: `/events/${m[1]}` }),
  },
  // Billing
  {
    pattern: /\/billing/,
    transform: () => ({ path: "/billing" }),
  },
  // Directory listing
  {
    pattern: /\/directory\/([a-f0-9-]+)/,
    transform: (m) => ({ path: `/directory/${m[1]}` }),
  },
  // Settings / notifications
  {
    pattern: /\/settings\/notifications/,
    transform: () => ({ path: "/(tabs)/notifications" }),
  },
  // Legacy link (username-based) — must be last
  {
    pattern: /\/([a-zA-Z0-9_-]+)$/,
    transform: (m) => ({ path: `/legacy-link`, params: { slug: m[1] } }),
  },
];

// ── Public API ──────────────────────────────────────────────

/**
 * Parse a deep link URL into an app route.
 * Returns null if the URL doesn't match any known pattern.
 */
export function handleDeepLink(url: string): string | null {
  if (!url) return null;

  try {
    // Normalize URL — strip scheme and domain
    let path = url;

    // Handle custom scheme: eterrn://path
    if (path.startsWith("eterrn://")) {
      path = "/" + path.replace("eterrn://", "");
    }

    // Handle web URLs: https://eterrn.app/path
    if (path.includes("eterrn.app")) {
      const urlObj = new URL(path);
      path = urlObj.pathname + urlObj.search;
    }

    // Try each pattern
    for (const { pattern, transform } of ROUTE_PATTERNS) {
      const match = path.match(pattern);
      if (match) {
        const route = transform(match);
        if (route.params) {
          const queryString = Object.entries(route.params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&");
          return `${route.path}?${queryString}`;
        }
        return route.path;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a shareable deep link URL for a given app route.
 */
export function generateDeepLink(type: string, id: string): string {
  // eterrn.app is not yet pointed at the deployment, so generated links
  // use the live Vercel domain. parseDeepLink() still accepts eterrn.app
  // for native universal links once DNS + associatedDomains go live.
  const BASE_URL = "https://foreverr-app.vercel.app";

  switch (type) {
    case "memorial":
      // /s/:id serves rich Open Graph previews then redirects into the app.
      return `${BASE_URL}/s/${id}`;
    case "user":
      return `${BASE_URL}/user/${id}`;
    case "invite":
      return `${BASE_URL}/invite/${id}`;
    case "event":
      return `${BASE_URL}/events/${id}`;
    case "directory":
      return `${BASE_URL}/directory/${id}`;
    case "legacy":
      return `${BASE_URL}/${id}`;
    default:
      return `${BASE_URL}/${type}/${id}`;
  }
}
