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
  /** Selling price in INR. Absent on `linkOnly` reference listings. */
  price?: number;
  /** Pre-discount MRP in INR, if on sale */
  mrp?: number;
  /** Outbound link to the product (or store search), affiliate-wrapped in prod */
  url: string;
  inStock: boolean;
  /**
   * True when we don't yet index a live price for this store, so the row is a
   * "check price" deep-link rather than a real comparison entry.
   */
  linkOnly?: boolean;
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
  /** Free-form category label, e.g. "Lifestyle", "Basketball", "Running" */
  category: string;
  /** Real product images (CDN URLs). Falls back to the SVG graphic when empty. */
  images?: string[];
  /** Two or three colors used to render swatches / the fallback graphic */
  palette: string[];
  description: string;
  offers: Offer[];
};
