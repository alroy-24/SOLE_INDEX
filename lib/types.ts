export type Retailer = {
  id: string;
  /** Display name, e.g. "VegNonVeg" */
  name: string;
  /** Bare domain, e.g. "vegnonveg.com" — used for the redirect host label */
  domain: string;
  /** True for first-party brand stores (Nike.com) vs. multi-brand resellers */
  official?: boolean;
  /** Short note shown in the UI, e.g. "Authenticity guaranteed" */
  note?: string;
};

export type Offer = {
  retailerId: string;
  /** Selling price in INR */
  price: number;
  /** Pre-discount MRP in INR, if on sale */
  mrp?: number;
  /** Outbound link to the product page (affiliate-wrapped in production) */
  url: string;
  inStock: boolean;
  /** Sizes (UK) currently available at this retailer */
  sizes?: string[];
  /** ISO timestamp of when this price was last fetched */
  fetchedAt: string;
};

export type Sneaker = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  colorway: string;
  sku?: string;
  releaseYear?: number;
  category: "Lifestyle" | "Running" | "Basketball" | "Skate" | "Trail";
  /** Two or three colors used to render the editorial product graphic */
  palette: string[];
  description: string;
  offers: Offer[];
};
