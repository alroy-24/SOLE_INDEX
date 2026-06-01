/**
 * Affiliate link wrapping.
 *
 * Every outbound "Buy" / "Check price" link is passed through here so it can be
 * monetized. It's entirely env-driven: with no variables set it returns the raw
 * URL unchanged, so the app works the same with or without monetization.
 *
 * Configure in `.env.local` (server-side — these are baked into the statically
 * rendered links at build time, so they are NOT exposed as separate secrets):
 *
 *   AMAZON_ASSOCIATE_TAG=yourtag-21    # Amazon Associates tracking id (India: -21)
 *   CUELINKS_CID=123456                # Cuelinks channel id (wraps everyone else)
 *
 * Amazon tagging works the moment you have an Associates account — it does not
 * require PA-API approval. Cuelinks wraps any supported merchant URL through one
 * redirect, so a single CID monetizes Flipkart, AJIO, Nike, Myntra, etc.
 */

const AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG?.trim();
const CUELINKS_CID = process.env.CUELINKS_CID?.trim();

// Merchants Cuelinks can monetize by wrapping the destination URL.
const CUELINKS_MERCHANTS = new Set([
  "flipkart",
  "ajio",
  "nike",
  "adidas",
  "vnv",
  "superkicks",
  "myntra",
]);

function wrapCuelinks(rawUrl: string): string {
  return `https://linksredirect.com/?cid=${CUELINKS_CID}&source=linkkit&url=${encodeURIComponent(
    rawUrl
  )}`;
}

export function affiliateUrl(retailerId: string, rawUrl: string): string {
  try {
    if (retailerId === "amazon" && AMAZON_TAG) {
      const u = new URL(rawUrl);
      u.searchParams.set("tag", AMAZON_TAG);
      // ascsubtag lets you attribute clicks back to this page later if wanted.
      return u.toString();
    }
    if (CUELINKS_CID && CUELINKS_MERCHANTS.has(retailerId)) {
      return wrapCuelinks(rawUrl);
    }
  } catch {
    // Malformed URL — fall through to returning it untouched.
  }
  return rawUrl;
}

/** True when at least one affiliate channel is configured. */
export function affiliateEnabled(): boolean {
  return Boolean(AMAZON_TAG || CUELINKS_CID);
}
