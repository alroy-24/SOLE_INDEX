/**
 * Builds an outbound link for a given retailer + query.
 *
 * For the mock data phase these resolve to each store's on-site search results
 * (robust — they rarely 404). In production, replace the body of this function
 * with affiliate-wrapped deep links to the exact product page. Nothing in the
 * UI needs to change.
 */
const PATTERNS: Record<string, (q: string) => string> = {
  nike: (q) => `https://www.nike.com/in/w?q=${q}`,
  adidas: (q) => `https://www.adidas.co.in/search?q=${q}`,
  ajio: (q) => `https://www.ajio.com/search/?text=${q}`,
  flipkart: (q) => `https://www.flipkart.com/search?q=${q}`,
  amazon: (q) => `https://www.amazon.in/s?k=${q}`,
  vnv: (q) => `https://www.vegnonveg.com/search?q=${q}`,
  cdc: (q) => `https://www.crepdogcrew.com/search?q=${q}`,
  extrabutter: (q) => `https://shop.extrabutterny.com/search?q=${q}`,
  superkicks: (q) => `https://www.superkicks.in/search?q=${q}`,
};

export function buildSearchUrl(retailerId: string, query: string): string {
  const q = encodeURIComponent(query);
  const make = PATTERNS[retailerId];
  return make ? make(q) : `https://www.google.com/search?q=${q}`;
}
