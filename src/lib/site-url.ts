// The canonical origin, for metadata, the sitemap and JSON-LD. Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL on every build; NEXT_PUBLIC_SITE_URL overrides it
// once a custom domain is attached.
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
