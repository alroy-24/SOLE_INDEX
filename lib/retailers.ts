import type { Retailer } from "./types";

export const RETAILERS: Record<string, Retailer> = {
  nike: {
    id: "nike",
    name: "Nike",
    domain: "nike.com",
    official: true,
    note: "First-party · guaranteed authentic",
  },
  adidas: {
    id: "adidas",
    name: "adidas",
    domain: "adidas.co.in",
    official: true,
    note: "First-party · guaranteed authentic",
  },
  ajio: {
    id: "ajio",
    name: "AJIO",
    domain: "ajio.com",
    note: "Reliance · frequent coupon stacks",
  },
  flipkart: {
    id: "flipkart",
    name: "Flipkart",
    domain: "flipkart.com",
    note: "Fast pan-India delivery",
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    domain: "amazon.in",
    note: "Prime delivery · easy returns",
  },
  vnv: {
    id: "vnv",
    name: "VegNonVeg",
    domain: "vegnonveg.com",
    note: "Curated boutique · India exclusives",
  },
  cdc: {
    id: "cdc",
    name: "Crepdog Crew",
    domain: "crepdogcrew.com",
    note: "Legit-checked resell marketplace",
  },
  extrabutter: {
    id: "extrabutter",
    name: "Extra Butter",
    domain: "extrabutterny.com",
    note: "NYC boutique · ships to India",
  },
  superkicks: {
    id: "superkicks",
    name: "SuperKicks",
    domain: "superkicks.in",
    note: "Multi-brand · in-store pickup",
  },
};

export function getRetailer(id: string): Retailer {
  const r = RETAILERS[id];
  if (!r) {
    return { id, name: id, domain: `${id}.com` };
  }
  return r;
}
