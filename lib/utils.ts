import type { Offer, Sneaker } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(value);
}

/** Offers that carry a real, indexed price (not "check price" deep-links). */
export function pricedOffers(sneaker: Sneaker): Offer[] {
  return sneaker.offers.filter((o) => !o.linkOnly && typeof o.price === "number");
}

/**
 * Display order for the price ladder:
 *   1. in-stock, priced — cheapest first
 *   2. "check price" deep-links
 *   3. out-of-stock, priced
 */
export function sortedOffers(sneaker: Sneaker): Offer[] {
  const rank = (o: Offer) => {
    if (o.linkOnly) return 1;
    if (!o.inStock) return 2;
    return 0;
  };
  return [...sneaker.offers].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });
}

export function lowestOffer(sneaker: Sneaker): Offer | undefined {
  const priced = pricedOffers(sneaker);
  const inStock = priced.filter((o) => o.inStock);
  const pool = inStock.length > 0 ? inStock : priced;
  if (pool.length === 0) return undefined;
  return pool.reduce((min, o) => (o.price! < min.price! ? o : min));
}

export function highestOffer(sneaker: Sneaker): Offer | undefined {
  const inStock = pricedOffers(sneaker).filter((o) => o.inStock);
  if (inStock.length === 0) return undefined;
  return inStock.reduce((max, o) => (o.price! > max.price! ? o : max));
}

/**
 * Best saving we can evidence: the spread across stores when more than one
 * carries a live price, otherwise the discount off MRP at the cheapest store.
 */
export function maxSaving(sneaker: Sneaker): number {
  const low = lowestOffer(sneaker);
  const high = highestOffer(sneaker);
  if (low && high && high !== low) return Math.max(0, high.price! - low.price!);
  if (low?.mrp && low.mrp > (low.price ?? 0)) return low.mrp - low.price!;
  return 0;
}

export function discountPct(offer: Offer): number | null {
  if (typeof offer.price !== "number" || !offer.mrp || offer.mrp <= offer.price) {
    return null;
  }
  return Math.round((1 - offer.price / offer.mrp) * 100);
}

/** How many stores carry a real live price for this pair. */
export function liveStoreCount(sneaker: Sneaker): number {
  return pricedOffers(sneaker).filter((o) => o.inStock).length;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
