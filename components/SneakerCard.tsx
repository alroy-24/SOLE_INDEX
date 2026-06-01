import Link from "next/link";
import type { Sneaker } from "@/lib/types";
import { SneakerGraphic } from "./SneakerGraphic";
import { getRetailer } from "@/lib/retailers";
import { formatINR, lowestOffer, maxSaving } from "@/lib/utils";

export function SneakerCard({ sneaker, index = 0 }: { sneaker: Sneaker; index?: number }) {
  const low = lowestOffer(sneaker);
  const saving = maxSaving(sneaker);
  const storeCount = sneaker.offers.filter((o) => o.inStock).length;
  const lowStore = low ? getRetailer(low.retailerId) : undefined;

  return (
    <Link
      href={`/sneakers/${sneaker.slug}`}
      className="group relative flex flex-col border-r border-b rule transition-colors hover:bg-paper-dim"
    >
      {/* graphic panel */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background: `radial-gradient(120% 120% at 20% 0%, ${sneaker.palette[0]} 0%, transparent 60%)`,
          }}
        />
        <SneakerGraphic
          sneaker={sneaker}
          className="relative w-full px-6 py-8 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 numerals text-[11px] text-ash">
          {String(index + 1).padStart(2, "0")}
        </span>
        {saving > 0 && (
          <span className="absolute right-3 top-3 bg-volt px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
            Save {formatINR(saving)}
          </span>
        )}
      </div>

      {/* meta */}
      <div className="flex flex-1 flex-col gap-3 border-t rule px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ash">
              {sneaker.brand}
            </p>
            <h3 className="display mt-1 text-lg leading-[0.95]">
              {sneaker.model}
            </h3>
            <p className="mt-0.5 text-xs text-ink-soft">{sneaker.colorway}</p>
          </div>
          <div className="flex shrink-0 -space-x-1">
            {sneaker.palette.map((c, i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full border border-paper"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between border-t rule pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ash">
              Lowest · {lowStore?.name}
            </p>
            <p className="numerals text-2xl font-semibold leading-none">
              {low ? formatINR(low.price) : "—"}
            </p>
          </div>
          <p className="text-right text-[11px] text-ink-soft">
            {storeCount} {storeCount === 1 ? "store" : "stores"}
            <span className="block text-ash">compare →</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
