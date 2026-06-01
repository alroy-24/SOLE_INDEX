# SOLEINDEX

India's sneaker **price index**. One search lines up live prices for the same pair
across Nike, AJIO, Flipkart, Amazon, VegNonVeg, Crepdog Crew, Extra Butter,
SuperKicks and adidas — sorted cheapest-first, with a **Buy** button that sends
you straight to that retailer.

Editorial monochrome design with a volt accent. Built with Next.js 16 (App
Router), React 19, TypeScript and Tailwind v4.

> **Status:** Phase 2 — **live data**. The catalogue (96 sneakers, real images,
> prices, sizes and stock) is pulled from SuperKicks' public Shopify feed by
> `scripts/fetch-data.mjs` into `data/catalog.json`, which the app imports at
> build time. Other retailers (Nike, Amazon, Flipkart, AJIO, VegNonVeg) appear
> as honest "Check price" deep-links until their live prices are wired in.

### Refresh prices

```bash
node scripts/fetch-data.mjs   # rewrites data/catalog.json from live sources
npm run build                 # (or redeploy) to publish the new prices
```

On Vercel, run this on a schedule (Cron Job → rebuild hook) so prices stay
fresh, or move the catalogue into a database read at request time with ISR.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (prerenders every sneaker page)
npm start        # serve the production build
```

## Deploy

Easiest path is **Vercel** (made by Next.js's authors, free tier):

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework auto-detects as Next.js. No env vars needed yet. **Deploy.**

You get a live `https://<project>.vercel.app` URL in ~1 minute. Every push to
`main` redeploys automatically. (Netlify and Cloudflare Pages also work.)

---

## Project map

```
app/
  layout.tsx              fonts, <Nav>, <Footer>, global shell
  page.tsx                home — hero, stats, marquee, shortlist, how-it-works
  browse/page.tsx         catalogue (server) → renders <BrowseClient>
  sneakers/[slug]/page.tsx  THE CORE — price ladder for one pair (SSG)
components/
  PriceTable.tsx          cheapest-first ladder, lowest flagged, Buy buttons
  SneakerCard.tsx         grid card with lowest price + max saving
  SneakerGraphic.tsx      dependency-free SVG sneaker, tinted per colorway
  BrowseClient.tsx        client-side search / brand+category filters / sort
  Nav.tsx · Footer.tsx · Marquee.tsx
lib/
  types.ts                Sneaker / Retailer / Offer shapes
  data.ts                 ← MOCK SOURCE. Swap this to go live.
  retailers.ts            store metadata (name, domain, "official" flag)
  search-urls.ts          builds the outbound Buy link per retailer
  utils.ts                INR formatting, sorting, savings, "x ago"
```

---

## Going live with real prices

Everything funnels through two files. The UI never needs to change.

### 1. `lib/data.ts` — where prices come from
`getAllSneakers()` returns `Sneaker[]`, each with an `offers[]` array. Replace
the hand-authored `RAW` list with a fetch from your database / scrapers /
affiliate feeds that returns the **same shape**. Make the page components
`async` and `await getAllSneakers()` if your source is async.

### 2. `lib/search-urls.ts` — where Buy sends people
Today these resolve to each store's on-site search (robust, never 404s). For
production, return **affiliate-wrapped deep links** to the exact product page so
outbound clicks earn commission.

### Realistic data strategy for India
Most sneaker boutiques have **no public API**, so plan for a mix:

| Source | How |
|---|---|
| **Amazon** | Product Advertising API (needs an Associates account + sales). |
| **Flipkart** | Affiliate API (approval required). |
| **Affiliate networks** | Cuelinks / INRDeals / vCommission aggregate many Indian merchants *and* give you the paid Buy links — usually the most practical path. |
| **Boutiques** (VNV, Crepdog Crew, Extra Butter, SuperKicks) | Periodic scraping into your DB. Fragile + ToS-sensitive — cache results, run on a schedule (cron), and respect `robots.txt`. Never scrape on the user's request path. |

Recommended architecture: a background job writes normalized offers into a
database (Postgres / Supabase / Planetscale); `lib/data.ts` reads from it;
pages use ISR (`export const revalidate = 1800`) so prices refresh without a
rebuild.

---

## Affiliate monetization & live Amazon prices

The plumbing is built and **env-driven** — with nothing set, the app behaves
exactly as it does now. Copy `.env.example` → `.env.local` (and add the same
vars to your Vercel project) to switch features on.

| Variable | What it unlocks | Requirement |
|---|---|---|
| `AMAZON_ASSOCIATE_TAG` | Amazon "Buy" links earn commission (`?tag=`) | Amazon Associates account (no PA-API needed) |
| `CUELINKS_CID` | Flipkart / AJIO / Nike / Myntra links earn commission via one wrapper | Cuelinks account |
| `AMAZON_ACCESS_KEY` + `AMAZON_SECRET_KEY` + `AMAZON_PARTNER_TAG` | **Live Amazon prices** added to the catalogue | Approved PA-API access (~3 qualifying sales) |

- **Link wrapping** lives in `lib/affiliate.ts`; every offer URL passes through
  `affiliateUrl()` in `lib/data.ts`. Works the moment IDs are set.
- **Live Amazon pricing** lives in `scripts/sources/amazon.mjs` (full PA-API 5.0
  SigV4 client). When keys are present, `node scripts/fetch-data.mjs` queries
  Amazon per pair (throttled to 1 req/sec), and matching results replace the
  Amazon deep-link row with a real priced offer.
- Add more live sources by writing another `scripts/sources/*.mjs` adapter that
  returns `{ price, url, inStock }` and merging it the same way.

```bash
cp .env.example .env.local   # fill in what you have
node scripts/fetch-data.mjs  # refreshes data/catalog.json (live Amazon if keyed)
npm run build
```

---

## Roadmap ideas
- Real product imagery once licensing/affiliate feeds are in place
- Price-drop alerts (email/push) per pair + size
- Size-level availability and price (not just per-store)
- Historical price charts ("is this actually a deal?")
- User accounts + wishlists

---

*Indicative demo data. Not affiliated with any listed retailer.*
