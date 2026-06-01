import type { Sneaker } from "@/lib/types";
import { getRetailer } from "@/lib/retailers";
import { discountPct, formatINR, sortedOffers, timeAgo } from "@/lib/utils";

export function PriceTable({ sneaker }: { sneaker: Sneaker }) {
  const offers = sortedOffers(sneaker);
  const lowestInStock = offers.find((o) => o.inStock);

  return (
    <div className="border-t border-l rule">
      {/* header row */}
      <div className="hidden grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 border-b border-r rule bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-paper md:grid">
        <span>#</span>
        <span>Retailer</span>
        <span className="text-right">Price</span>
        <span className="text-right">Go</span>
      </div>

      {offers.map((offer, i) => {
        const r = getRetailer(offer.retailerId);
        const isLowest = offer === lowestInStock;
        const off = discountPct(offer);
        return (
          <div
            key={offer.retailerId}
            className={`grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 border-b border-r rule px-4 py-4 md:grid-cols-[2.5rem_1fr_auto_auto] md:items-center ${
              isLowest ? "bg-volt/25" : offer.inStock ? "bg-paper" : "bg-paper-dim/60"
            }`}
          >
            {/* rank */}
            <div className="numerals self-start pt-1 text-sm text-ash md:self-center md:pt-0">
              {offer.inStock ? String(i + 1).padStart(2, "0") : "—"}
            </div>

            {/* retailer */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="display text-lg leading-none">{r.name}</span>
                {r.official && (
                  <span className="border rule px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                    Official
                  </span>
                )}
                {isLowest && (
                  <span className="bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-volt">
                    Lowest
                  </span>
                )}
                {!offer.inStock && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-drop">
                    Out of stock
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-ash">
                {r.note} · {r.domain} · updated {timeAgo(offer.fetchedAt)}
              </p>
              {offer.inStock && offer.sizes && offer.sizes.length > 0 && (
                <p className="mt-1 text-[11px] text-ink-soft">
                  UK sizes: {offer.sizes.join(" · ")}
                </p>
              )}
            </div>

            {/* price */}
            <div className="md:text-right">
              <div className="flex items-baseline gap-2 md:justify-end">
                <span
                  className={`numerals text-2xl font-semibold leading-none ${
                    offer.inStock ? "text-ink" : "text-ash line-through"
                  }`}
                >
                  {formatINR(offer.price)}
                </span>
                {off && (
                  <span className="numerals text-xs text-drop">−{off}%</span>
                )}
              </div>
              {offer.mrp && (
                <p className="numerals mt-0.5 text-xs text-ash line-through md:text-right">
                  {formatINR(offer.mrp)}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="md:pl-4 md:text-right">
              {offer.inStock ? (
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-transform hover:-translate-y-0.5 md:w-auto ${
                    isLowest
                      ? "bg-ink text-volt"
                      : "border border-ink text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  Buy ↗
                </a>
              ) : (
                <span className="inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-ash md:w-auto">
                  Notify
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
