/**
 * Amazon Product Advertising API 5.0 — live price source.
 *
 * Turns the "check price" Amazon rows into real, priced, affiliate-tagged offers
 * during a catalogue refresh. Activates only when these env vars are present
 * (otherwise `isAmazonConfigured()` is false and the pipeline skips it):
 *
 *   AMAZON_ACCESS_KEY=...
 *   AMAZON_SECRET_KEY=...
 *   AMAZON_PARTNER_TAG=yourtag-21
 *   # optional overrides (defaults shown are for the India marketplace):
 *   AMAZON_HOST=webservices.amazon.in
 *   AMAZON_REGION=eu-west-1
 *   AMAZON_MARKETPLACE=www.amazon.in
 *   AMAZON_SEARCH_INDEX=Fashion
 *
 * Getting keys: join Amazon Associates, then request PA-API access (Amazon
 * grants it after ~3 qualifying sales). Respect the 1 request/sec default TPS —
 * the caller throttles between lookups.
 */
import crypto from "node:crypto";

const SERVICE = "ProductAdvertisingAPI";
const ALGO = "AWS4-HMAC-SHA256";

const cfg = () => ({
  accessKey: process.env.AMAZON_ACCESS_KEY?.trim(),
  secretKey: process.env.AMAZON_SECRET_KEY?.trim(),
  partnerTag: process.env.AMAZON_PARTNER_TAG?.trim(),
  host: (process.env.AMAZON_HOST || "webservices.amazon.in").trim(),
  region: (process.env.AMAZON_REGION || "eu-west-1").trim(),
  marketplace: (process.env.AMAZON_MARKETPLACE || "www.amazon.in").trim(),
  searchIndex: (process.env.AMAZON_SEARCH_INDEX || "Fashion").trim(),
});

export function isAmazonConfigured() {
  const c = cfg();
  return Boolean(c.accessKey && c.secretKey && c.partnerTag);
}

const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const hmac = (key, s) => crypto.createHmac("sha256", key).update(s, "utf8").digest();

function signingKey(secret, date, region, service) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function signedHeaders(c, target, payload) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const date = amzDate.slice(0, 8);
  const path = "/paapi5/searchitems";

  const headers = {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    host: c.host,
    "x-amz-date": amzDate,
    "x-amz-target": target,
  };

  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((n) => `${n}:${headers[n]}\n`).join("");
  const signedHeaderList = names.join(";");

  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeaders,
    signedHeaderList,
    sha256(payload),
  ].join("\n");

  const scope = `${date}/${c.region}/${SERVICE}/aws4_request`;
  const stringToSign = [ALGO, amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signature = crypto
    .createHmac("sha256", signingKey(c.secretKey, date, c.region, SERVICE))
    .update(stringToSign, "utf8")
    .digest("hex");

  return {
    ...headers,
    Authorization: `${ALGO} Credential=${c.accessKey}/${scope}, SignedHeaders=${signedHeaderList}, Signature=${signature}`,
  };
}

/**
 * @returns {Promise<{price:number,url:string,inStock:boolean,title:string}|null>}
 */
export async function searchAmazon(keywords, { brand = "", modelTokens = [] } = {}) {
  const c = cfg();
  if (!isAmazonConfigured()) return null;

  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
  const payload = JSON.stringify({
    Keywords: keywords,
    SearchIndex: c.searchIndex,
    ItemCount: 5,
    PartnerTag: c.partnerTag,
    PartnerType: "Associates",
    Marketplace: c.marketplace,
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "Offers.Listings.Price",
      "Offers.Listings.Availability.Type",
    ],
  });

  let json;
  try {
    const res = await fetch(`https://${c.host}/paapi5/searchitems`, {
      method: "POST",
      headers: signedHeaders(c, target, payload),
      body: payload,
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`  [amazon] ${res.status} ${body.slice(0, 140)}`);
      return null;
    }
    json = await res.json();
  } catch (e) {
    console.warn(`  [amazon] request failed: ${e.message}`);
    return null;
  }

  const items = json?.SearchResult?.Items || [];
  const wantBrand = brand.toLowerCase();
  const tokens = modelTokens.map((t) => t.toLowerCase()).filter((t) => t.length > 2);

  for (const item of items) {
    const title = (item?.ItemInfo?.Title?.DisplayValue || "").toLowerCase();
    if (!title) continue;
    const brandOk = !wantBrand || title.includes(wantBrand);
    const hits = tokens.filter((t) => title.includes(t)).length;
    const tokenOk = tokens.length === 0 || hits >= Math.ceil(tokens.length / 2);
    if (!brandOk || !tokenOk) continue;

    const listing = item?.Offers?.Listings?.[0];
    const amount = listing?.Price?.Amount;
    if (typeof amount !== "number") continue;

    return {
      price: Math.round(amount),
      url: item.DetailPageURL,
      inStock: (listing?.Availability?.Type || "Now") === "Now",
      title: item.ItemInfo.Title.DisplayValue,
    };
  }
  return null;
}
