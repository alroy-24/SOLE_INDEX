import type { Offer, Sneaker } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(value);
}

/** In-stock offers sorted cheapest first, out-of-stock pushed to the end. */
export function sortedOffers(sneaker: Sneaker): Offer[] {
  return [...sneaker.offers].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return a.price - b.price;
  });
}

export function lowestOffer(sneaker: Sneaker): Offer | undefined {
  return sortedOffers(sneaker).find((o) => o.inStock) ?? sneaker.offers[0];
}

export function highestOffer(sneaker: Sneaker): Offer | undefined {
  const inStock = sneaker.offers.filter((o) => o.inStock);
  if (inStock.length === 0) return undefined;
  return inStock.reduce((max, o) => (o.price > max.price ? o : max));
}

/** Max possible saving vs. the priciest in-stock listing. */
export function maxSaving(sneaker: Sneaker): number {
  const low = lowestOffer(sneaker);
  const high = highestOffer(sneaker);
  if (!low || !high) return 0;
  return Math.max(0, high.price - low.price);
}

export function discountPct(offer: Offer): number | null {
  if (!offer.mrp || offer.mrp <= offer.price) return null;
  return Math.round((1 - offer.price / offer.mrp) * 100);
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
