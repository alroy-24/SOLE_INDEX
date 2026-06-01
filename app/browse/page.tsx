import type { Metadata } from "next";
import { getAllSneakers, getBrands, getCategories } from "@/lib/data";
import { BrowseClient } from "@/components/BrowseClient";

export const metadata: Metadata = {
  title: "Browse — SOLEINDEX",
  description:
    "Search and compare sneaker prices across India's trusted stores. Sort by lowest price or biggest saving.",
};

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="border-b rule px-5 pb-2 pt-10 sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ash">
          The index
        </p>
        <h1 className="display mt-3 text-5xl sm:text-7xl">Browse</h1>
        <p className="mt-3 max-w-xl pb-6 text-sm text-ink-soft sm:text-base">
          One catalogue, every store. Filter by brand or category, then open any
          pair to see the full price ladder and buy at the lowest.
        </p>
      </div>
      <BrowseClient
        sneakers={getAllSneakers()}
        brands={getBrands()}
        categories={getCategories()}
      />
    </div>
  );
}
