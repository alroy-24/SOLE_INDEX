import type { Offer, Sneaker } from "./types";
import { buildSearchUrl } from "./search-urls";

/**
 * MOCK DATA SOURCE
 * ----------------
 * This module is the single seam between the UI and "where prices come from".
 * Today it returns hand-authored listings. To go live, replace `RAW` (or the
 * `getAllSneakers` body) with a fetch from your database / scrapers / affiliate
 * APIs that returns the same `Sneaker[]` shape. The rest of the app is agnostic.
 */

// [retailerId, price, mrp (0 = no discount shown), inStock]
type RawOffer = [string, number, number, boolean];

type RawSneaker = Omit<Sneaker, "offers"> & { rawOffers: RawOffer[] };

// Deterministic "freshness" so the UI shows believable "x ago" timestamps.
const mins = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
const STAMPS = [7, 12, 19, 26, 34, 41, 55, 68];

const RAW: RawSneaker[] = [
  {
    id: "dunk-low-panda",
    slug: "nike-dunk-low-panda",
    brand: "Nike",
    model: "Dunk Low",
    colorway: "Black / White — 'Panda'",
    sku: "DD1391-100",
    releaseYear: 2021,
    category: "Lifestyle",
    palette: ["#161616", "#f4f1e9"],
    description:
      "The two-tone Dunk that refuses to die. Crisp leather overlays, a tidy black-and-white split, and the most-searched colorway in the country.",
    rawOffers: [
      ["ajio", 7499, 8295, true],
      ["flipkart", 7999, 8295, true],
      ["superkicks", 7999, 0, true],
      ["amazon", 8195, 0, true],
      ["nike", 8295, 0, true],
      ["vnv", 8295, 0, true],
      ["cdc", 9500, 0, false],
    ],
  },
  {
    id: "af1-triple-white",
    slug: "nike-air-force-1-07-triple-white",
    brand: "Nike",
    model: "Air Force 1 '07",
    colorway: "Triple White",
    sku: "CW2288-111",
    releaseYear: 1982,
    category: "Lifestyle",
    palette: ["#f7f4ec", "#e2ddcf"],
    description:
      "The uniform. All-white tumbled leather, the Air sole that started it all, and the safest yes in any rotation.",
    rawOffers: [
      ["ajio", 6299, 7495, true],
      ["flipkart", 6799, 7495, true],
      ["amazon", 6999, 0, true],
      ["nike", 7495, 0, true],
      ["superkicks", 7495, 0, true],
    ],
  },
  {
    id: "aj1-low-bred-toe",
    slug: "air-jordan-1-low-bred-toe",
    brand: "Jordan",
    model: "Air Jordan 1 Low",
    colorway: "Bred Toe",
    sku: "553558-612",
    releaseYear: 2022,
    category: "Basketball",
    palette: ["#b11226", "#161616", "#f4f1e9"],
    description:
      "Black, red and white in the order that matters. The low-top Bred Toe carries the heritage without the resell tax of its high-top cousin.",
    rawOffers: [
      ["nike", 9995, 0, true],
      ["vnv", 10995, 0, true],
      ["cdc", 12500, 0, true],
      ["extrabutter", 13200, 0, true],
      ["flipkart", 11499, 0, false],
    ],
  },
  {
    id: "am90-infrared",
    slug: "nike-air-max-90-infrared",
    brand: "Nike",
    model: "Air Max 90",
    colorway: "Infrared",
    sku: "CT1685-100",
    releaseYear: 1990,
    category: "Running",
    palette: ["#d9d6cd", "#d8412f", "#161616"],
    description:
      "The OG that put visible Air on the map. Infrared on the heel, waffle outsole underfoot, zero apologies.",
    rawOffers: [
      ["ajio", 9499, 10995, true],
      ["amazon", 9999, 0, true],
      ["superkicks", 10495, 0, true],
      ["nike", 10995, 0, true],
    ],
  },
  {
    id: "nb-550-white-green",
    slug: "new-balance-550-white-green",
    brand: "New Balance",
    model: "550",
    colorway: "White / Green",
    sku: "BB550WT1",
    releaseYear: 2021,
    category: "Lifestyle",
    palette: ["#f2efe6", "#2f6f4e"],
    description:
      "A 1989 hoops silhouette pulled out of the vault and turned into the decade's quiet flex. Clean leather, retro 'N', team-green accents.",
    rawOffers: [
      ["ajio", 9999, 11999, true],
      ["amazon", 10499, 0, true],
      ["vnv", 11999, 0, true],
      ["superkicks", 11999, 0, true],
      ["cdc", 13000, 0, false],
    ],
  },
  {
    id: "nb-990v6-grey",
    slug: "new-balance-990v6-grey",
    brand: "New Balance",
    model: "990v6",
    colorway: "Grey",
    sku: "M990GL6",
    releaseYear: 2022,
    category: "Running",
    palette: ["#9b9b94", "#6e6e68"],
    description:
      "Made in USA, the grey-day standard. ENCAP cushioning, pigskin-and-mesh upper, and the dad-shoe pedigree that never actually left.",
    rawOffers: [
      ["vnv", 19999, 0, true],
      ["superkicks", 19999, 0, true],
      ["extrabutter", 21000, 0, true],
    ],
  },
  {
    id: "adidas-samba-og",
    slug: "adidas-samba-og-black-gum",
    brand: "adidas",
    model: "Samba OG",
    colorway: "Core Black / Gum",
    sku: "B75807",
    releaseYear: 1950,
    category: "Lifestyle",
    palette: ["#161616", "#f4f1e9", "#c9a26b"],
    description:
      "Indoor-football heritage turned everyday default. Low profile, gold foil, gum sole — the shoe everyone's wearing and no one regrets.",
    rawOffers: [
      ["ajio", 8499, 9999, true],
      ["amazon", 8799, 0, true],
      ["flipkart", 8999, 0, true],
      ["adidas", 9999, 0, true],
      ["vnv", 9999, 0, true],
      ["superkicks", 9999, 0, true],
    ],
  },
  {
    id: "adidas-campus-00s",
    slug: "adidas-campus-00s-core-black",
    brand: "adidas",
    model: "Campus 00s",
    colorway: "Core Black / White",
    sku: "HQ8708",
    releaseYear: 2023,
    category: "Skate",
    palette: ["#161616", "#f4f1e9"],
    description:
      "Chunky suede, fat laces, Y2K energy. The Campus 00s does the skate-adjacent thing with a thicker sole and a louder stance.",
    rawOffers: [
      ["ajio", 7499, 8999, true],
      ["amazon", 7899, 0, true],
      ["flipkart", 7999, 0, true],
      ["adidas", 8999, 0, true],
    ],
  },
  {
    id: "asics-kayano-14-cream",
    slug: "asics-gel-kayano-14-cream-black",
    brand: "ASICS",
    model: "Gel-Kayano 14",
    colorway: "Cream / Black",
    sku: "1201A019-100",
    releaseYear: 2007,
    category: "Running",
    palette: ["#ece6da", "#161616", "#bfbfbf"],
    description:
      "The metallic dad-runner that the internet revived. GEL cushioning, mesh-and-mtg upper, full chrome-trim future-nostalgia.",
    rawOffers: [
      ["ajio", 12999, 14999, true],
      ["amazon", 13499, 0, true],
      ["vnv", 14999, 0, true],
      ["superkicks", 14999, 0, true],
    ],
  },
  {
    id: "puma-palermo-vapor-gray",
    slug: "puma-palermo-vapor-gray",
    brand: "Puma",
    model: "Palermo",
    colorway: "Vapor Gray / Gum",
    sku: "396463-09",
    releaseYear: 2024,
    category: "Lifestyle",
    palette: ["#cfd2c4", "#161616"],
    description:
      "A terrace classic back from 1980s obscurity. Suede T-toe, gum sole, and a Samba-alternative price that's hard to argue with.",
    rawOffers: [
      ["ajio", 5499, 6999, true],
      ["amazon", 5799, 0, true],
      ["flipkart", 5999, 0, true],
      ["superkicks", 6999, 0, true],
    ],
  },
  {
    id: "converse-chuck-70-hi",
    slug: "converse-chuck-70-hi-parchment",
    brand: "Converse",
    model: "Chuck 70 Hi",
    colorway: "Parchment",
    sku: "162053C",
    releaseYear: 2013,
    category: "Skate",
    palette: ["#efe8d6", "#161616"],
    description:
      "The 1970s reissue done right — higher rubber foxing, glossier toe, plush footbed. Off-white canvas that goes with everything.",
    rawOffers: [
      ["ajio", 5499, 6999, true],
      ["amazon", 5699, 0, true],
      ["flipkart", 5999, 0, true],
      ["vnv", 6999, 0, true],
    ],
  },
  {
    id: "vans-old-skool-black",
    slug: "vans-old-skool-black-white",
    brand: "Vans",
    model: "Old Skool",
    colorway: "Black / White",
    sku: "VN000D3HY28",
    releaseYear: 1977,
    category: "Skate",
    palette: ["#161616", "#f4f1e9"],
    description:
      "The first Vans with the Sidestripe, and still the blueprint. Suede-and-canvas, waffle grip, the skate shoe your whole city owns.",
    rawOffers: [
      ["amazon", 5299, 0, true],
      ["ajio", 5499, 0, true],
      ["flipkart", 5499, 0, true],
      ["superkicks", 6499, 0, true],
    ],
  },
];

function build(raw: RawSneaker): Sneaker {
  const query = `${raw.brand} ${raw.model} ${raw.colorway.split("—")[0]}`.trim();
  const offers: Offer[] = raw.rawOffers.map(([retailerId, price, mrp, inStock], i) => ({
    retailerId,
    price,
    mrp: mrp > 0 ? mrp : undefined,
    inStock,
    url: buildSearchUrl(retailerId, query),
    sizes: inStock ? UK_SIZES.filter((_, idx) => (idx + i) % 3 !== 0) : [],
    fetchedAt: mins(STAMPS[i % STAMPS.length]),
  }));
  const { rawOffers, ...rest } = raw;
  void rawOffers;
  return { ...rest, offers };
}

const UK_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];

const SNEAKERS: Sneaker[] = RAW.map(build);

export function getAllSneakers(): Sneaker[] {
  return SNEAKERS;
}

export function getSneakerBySlug(slug: string): Sneaker | undefined {
  return SNEAKERS.find((s) => s.slug === slug);
}

export function getBrands(): string[] {
  return [...new Set(SNEAKERS.map((s) => s.brand))].sort();
}

export function getCategories(): string[] {
  return [...new Set(SNEAKERS.map((s) => s.category))].sort();
}
