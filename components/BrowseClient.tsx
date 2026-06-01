"use client";

import { useMemo, useState } from "react";
import type { Sneaker } from "@/lib/types";
import { SneakerCard } from "./SneakerCard";
import { lowestOffer, maxSaving } from "@/lib/utils";

type Sort = "price" | "saving" | "az";

const SORTS: { id: Sort; label: string }[] = [
  { id: "price", label: "Lowest price" },
  { id: "saving", label: "Biggest saving" },
  { id: "az", label: "A–Z" },
];

export function BrowseClient({
  sneakers,
  brands,
  categories,
}: {
  sneakers: Sneaker[];
  brands: string[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("price");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = sneakers.filter((s) => {
      if (brand && s.brand !== brand) return false;
      if (category && s.category !== category) return false;
      if (!q) return true;
      return [s.brand, s.model, s.colorway, s.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "az") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      if (sort === "saving") return maxSaving(b) - maxSaving(a);
      return (lowestOffer(a)?.price ?? 0) - (lowestOffer(b)?.price ?? 0);
    });
    return list;
  }, [sneakers, query, brand, category, sort]);

  return (
    <div>
      {/* search bar */}
      <div className="relative border-b rule">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a model, brand or colorway — try “Samba”, “Dunk”, “New Balance”…"
          className="w-full bg-transparent px-5 py-6 text-lg outline-none placeholder:text-ash sm:px-8 sm:text-2xl"
        />
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 numerals text-sm text-ash sm:right-8">
          {results.length} result{results.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* filter rail */}
      <div className="flex flex-col gap-4 border-b rule px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <Chip active={!brand && !category} onClick={() => { setBrand(null); setCategory(null); }}>
            All
          </Chip>
          {brands.map((b) => (
            <Chip key={b} active={brand === b} onClick={() => setBrand(brand === b ? null : b)}>
              {b}
            </Chip>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c}
            </Chip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-ash">Sort</span>
          <div className="flex overflow-hidden rounded-full border border-ink">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                  sort === s.id ? "bg-ink text-paper" : "text-ink hover:bg-paper-dim"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 border-l rule sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((s, i) => (
            <SneakerCard key={s.id} sneaker={s} index={i} />
          ))}
        </div>
      ) : (
        <div className="px-5 py-24 text-center sm:px-8">
          <p className="display text-4xl text-ash">No pairs found</p>
          <p className="mt-3 text-sm text-ink-soft">
            Try a different model or clear the filters.
          </p>
          <button
            onClick={() => { setQuery(""); setBrand(null); setCategory(null); }}
            className="mt-6 rounded-full border border-ink px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
