/**
 * Real data pipeline.
 *
 * Pulls live footwear from SuperKicks' public Shopify catalogue (real prices,
 * images, sizes and stock), normalizes it to the app's `Sneaker[]` shape, adds
 * honest "check price" deep-links for the other retailers, and writes
 * `data/catalog.json`. The Next.js app imports that file directly (no runtime
 * scraping), so it builds and deploys statically.
 *
 *   node scripts/fetch-data.mjs
 *
 * To add another live source, write a fetcher that returns the same normalized
 * objects and merge it below. To enable live prices for Amazon/Flipkart/AJIO,
 * swap their `linkOnly` reference offers for affiliate-API responses.
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { searchAmazon, isAmazonConfigured } from "./sources/amazon.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const UA = "Mozilla/5.0 (compatible; SoleindexBot/1.0; +price-index)";
const MAX_SNEAKERS = 96;
const PAGES = 3; // 250 products/page

// Retailers shown as deep-link rows when we don't index their live price.
const REFERENCE_STORES = ["amazon", "flipkart", "ajio", "vnv"];

const SEARCH_URL = {
  nike: (q) => `https://www.nike.com/in/w?q=${q}`,
  adidas: (q) => `https://www.adidas.co.in/search?q=${q}`,
  ajio: (q) => `https://www.ajio.com/search/?text=${q}`,
  flipkart: (q) => `https://www.flipkart.com/search?q=${q}`,
  amazon: (q) => `https://www.amazon.in/s?k=${q}`,
  vnv: (q) => `https://www.vegnonveg.com/search?q=${q}`,
};

const COLOR_HEX = [
  [/black|onyx|anthracite/, "#161616"],
  [/white|sail|ivory|summit|chalk/, "#f4f1e9"],
  [/cream|oatmeal|sand|linen|beige|bone|tan|khaki|gum|wheat/, "#e7dfcd"],
  [/grey|gray|ash|pewter|silver|wolf|smoke|cement/, "#9b9b94"],
  [/red|crimson|ruby|infrared|university red|varsity/, "#c2362f"],
  [/green|mint|sage|olive|pine|aurora|ivy|chlorophyll/, "#2f6f4e"],
  [/blue|navy|royal|powder|aqua|cyan|teal|denim/, "#2f5fa6"],
  [/pink|rose|magenta|fuchsia/, "#e093a6"],
  [/orange|rust|amber|copper|clay/, "#d8702f"],
  [/brown|chocolate|coffee|mocha|earth/, "#6b4a2f"],
  [/yellow|gold|lemon|citron/, "#d9b441"],
  [/purple|violet|grape|plum/, "#6b4a8a"],
];

function paletteFromColorway(text) {
  const t = text.toLowerCase();
  const hits = [];
  for (const [re, hex] of COLOR_HEX) {
    if (re.test(t) && !hits.includes(hex)) hits.push(hex);
    if (hits.length >= 3) break;
  }
  if (hits.length === 0) return ["#161616", "#f4f1e9"];
  if (hits.length === 1) hits.push(hits[0] === "#f4f1e9" ? "#161616" : "#f4f1e9");
  return hits;
}

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bii\b/i, "II")
    .replace(/\bog\b/i, "OG");
}

function normalizeBrand(vendor) {
  const v = (vendor || "").trim();
  if (/^adidas/i.test(v)) return "adidas";
  if (/^new balance/i.test(v)) return "New Balance";
  if (/^jordan|air jordan/i.test(v)) return "Jordan";
  return v || "Sneaker";
}

function officialRetailerFor(brand) {
  if (brand === "Nike" || brand === "Jordan") return "nike";
  if (brand === "adidas") return "adidas";
  return null;
}

function parseTitle(raw, vendor) {
  // Format: "BRAND | MODEL NAME { COLORWAY"
  let model = raw;
  let colorway = "";
  const brace = raw.indexOf("{");
  if (brace !== -1) {
    model = raw.slice(0, brace);
    colorway = raw.slice(brace + 1);
  }
  const pipe = model.indexOf("|");
  if (pipe !== -1) model = model.slice(pipe + 1);
  model = titleCase(model.replace(/["”“]/g, ""));
  colorway = colorway
    .replace(/[{}"”“]/g, "")
    .split(/[/-]/)
    .map((p) => titleCase(p))
    .filter(Boolean)
    .join(" / ");
  return { model: model || titleCase(vendor), colorway };
}

async function fetchSuperKicks() {
  const out = [];
  for (let page = 1; page <= PAGES; page++) {
    const url = `https://www.superkicks.in/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) break;
    const { products } = await res.json();
    if (!products || products.length === 0) break;
    for (const p of products) {
      if (!/sneaker/i.test(p.product_type || "")) continue;
      const variants = p.variants || [];
      if (variants.length === 0) continue;

      const priced = variants
        .map((v) => ({
          size: String(v.option1 || v.title || "").trim(),
          price: parseFloat(v.price),
          mrp: v.compare_at_price ? parseFloat(v.compare_at_price) : undefined,
          available: !!v.available,
        }))
        .filter((v) => Number.isFinite(v.price) && v.price > 0);
      if (priced.length === 0) continue;

      const cheapest = priced.reduce((m, v) => (v.price < m.price ? v : m), priced[0]);
      const sizes = priced.filter((v) => v.available).map((v) => v.size);
      const inStock = sizes.length > 0;

      const brand = normalizeBrand(p.vendor);
      const { model, colorway } = parseTitle(p.title, p.vendor);
      const category = /basketball/i.test(p.product_type)
        ? "Basketball"
        : /running/i.test(p.product_type)
        ? "Running"
        : "Lifestyle";

      const images = (p.images || [])
        .map((im) => im.src)
        .filter(Boolean)
        .slice(0, 3);

      out.push({
        id: `sk-${p.handle}`,
        slug: p.handle,
        brand,
        model,
        colorway,
        category,
        palette: paletteFromColorway(`${model} ${colorway}`),
        images,
        description: stripHtml(p.body_html).slice(0, 240),
        _super: {
          url: `https://www.superkicks.in/products/${p.handle}`,
          price: Math.round(cheapest.price),
          mrp: cheapest.mrp && cheapest.mrp > cheapest.price ? Math.round(cheapest.mrp) : undefined,
          inStock,
          sizes: sizes.slice(0, 10),
        },
      });
    }
  }
  return out;
}

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Offers are built without `fetchedAt`; the stamp is applied in `stampOffers`
// once enrichment has finished, so it can be compared against the last run.
function buildOffers(s) {
  const query = encodeURIComponent(`${s.brand} ${s.model} ${s.colorway.split(" / ")[0]}`.trim());
  const offers = [
    {
      retailerId: "superkicks",
      price: s._super.price,
      mrp: s._super.mrp,
      url: s._super.url,
      inStock: s._super.inStock,
      sizes: s._super.sizes,
    },
  ];

  const refs = [...REFERENCE_STORES];
  const official = officialRetailerFor(s.brand);
  if (official) refs.unshift(official);

  for (const id of refs) {
    const make = SEARCH_URL[id];
    if (!make) continue;
    offers.push({
      retailerId: id,
      url: make(query),
      inStock: true,
      linkOnly: true,
    });
  }
  return offers;
}

/** Everything about an offer except when we looked at it, key-order independent. */
function fingerprint(offer) {
  const { fetchedAt, ...rest } = offer;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

/** Previous run's offers, keyed `sneakerId::retailerId`. Empty on first run. */
async function loadPreviousOffers(path) {
  const map = new Map();
  if (!existsSync(path)) return map;
  try {
    for (const s of JSON.parse(await readFile(path, "utf8"))) {
      for (const o of s.offers || []) map.set(`${s.id}::${o.retailerId}`, o);
    }
  } catch {
    // Corrupt or hand-edited catalogue — fall back to stamping everything.
  }
  return map;
}

/**
 * Carry the old timestamp forward when an offer is unchanged since the last
 * run. Two consequences, both wanted:
 *   - A re-fetch that finds identical prices writes an identical file, so CI
 *     has nothing to commit. Commits then track real price moves, not cron.
 *   - `fetchedAt` means "this price last changed" rather than "the job last
 *     ran", which is what the "updated X ago" label in PriceTable implies.
 */
function stampOffers(catalog, previous, now) {
  for (const s of catalog) {
    s.offers = s.offers.map((offer) => {
      const before = previous.get(`${s.id}::${offer.retailerId}`);
      const unchanged = before?.fetchedAt && fingerprint(before) === fingerprint(offer);
      return { ...offer, fetchedAt: unchanged ? before.fetchedAt : now };
    });
  }
}

async function main() {
  console.log("Fetching live footwear from SuperKicks…");
  let raw = await fetchSuperKicks();

  // de-dupe by model+colorway, keep variety, cap the catalogue
  const seen = new Set();
  const deduped = [];
  for (const s of raw) {
    const key = `${s.brand}|${s.model}|${s.colorway}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }
  const catalog = deduped.slice(0, MAX_SNEAKERS).map((s) => {
    const offers = buildOffers(s);
    delete s._super;
    return { ...s, offers };
  });

  const outPath = join(ROOT, "data", "catalog.json");
  const previous = await loadPreviousOffers(outPath);

  // Optional: enrich with live Amazon prices via PA-API (only if configured).
  if (isAmazonConfigured()) {
    console.log("Enriching with live Amazon prices (PA-API, ~1 req/sec)…");
    let enriched = 0;
    for (const s of catalog) {
      const query = `${s.brand} ${s.model} ${s.colorway.split(" / ")[0]}`.trim();
      const hit = await searchAmazon(query, {
        brand: s.brand,
        modelTokens: s.model.split(/\s+/),
      });
      if (hit) {
        const offer = s.offers.find((o) => o.retailerId === "amazon");
        if (offer) {
          offer.price = hit.price;
          offer.url = hit.url;
          offer.inStock = hit.inStock;
          delete offer.linkOnly;
          enriched++;
        }
      }
      await sleep(1100); // respect the default 1 request/sec TPS limit
    }
    console.log(`  ✓ Live Amazon prices added to ${enriched}/${catalog.length}`);
  } else {
    console.log("Amazon PA-API not configured — Amazon rows stay as deep-links.");
  }

  stampOffers(catalog, previous, new Date().toISOString());

  // Safety: never overwrite a good catalogue with an empty one (e.g. if the
  // source blocked us). Keep the last known-good data instead.
  if (catalog.length === 0) {
    console.warn("⚠ Fetched 0 sneakers — keeping existing catalog.json untouched.");
    if (!existsSync(outPath)) process.exit(1);
    return;
  }

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(outPath, JSON.stringify(catalog, null, 2), "utf8");

  const brands = [...new Set(catalog.map((s) => s.brand))];
  console.log(`✓ Wrote ${catalog.length} sneakers to data/catalog.json`);
  console.log(`  Brands: ${brands.join(", ")}`);
  console.log(`  With images: ${catalog.filter((s) => s.images?.length).length}`);
}

main().catch((e) => {
  console.error("Fetch failed:", e.message);
  // Don't fail a build/CI run if we still have a usable catalogue to ship.
  const outPath = join(ROOT, "data", "catalog.json");
  process.exit(existsSync(outPath) ? 0 : 1);
});
