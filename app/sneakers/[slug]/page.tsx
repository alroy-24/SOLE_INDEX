import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSneakers, getSneakerBySlug } from "@/lib/data";
import { getRetailer } from "@/lib/retailers";
import { SneakerGraphic } from "@/components/SneakerGraphic";
import { PriceTable } from "@/components/PriceTable";
import { SneakerCard } from "@/components/SneakerCard";
import { formatINR, lowestOffer, maxSaving } from "@/lib/utils";

export function generateStaticParams() {
  return getAllSneakers().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSneakerBySlug(slug);
  if (!s) return { title: "Not found — SOLEINDEX" };
  const low = lowestOffer(s);
  return {
    title: `${s.brand} ${s.model} — ${s.colorway} | SOLEINDEX`,
    description: `Compare prices for the ${s.brand} ${s.model} (${s.colorway}) across ${s.offers.length} stores. From ${
      low ? formatINR(low.price) : "—"
    }.`,
  };
}

export default async function SneakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sneaker = getSneakerBySlug(slug);
  if (!sneaker) notFound();

  const low = lowestOffer(sneaker);
  const lowStore = low ? getRetailer(low.retailerId) : undefined;
  const saving = maxSaving(sneaker);
  const inStockCount = sneaker.offers.filter((o) => o.inStock).length;

  const related = getAllSneakers()
    .filter((s) => s.slug !== sneaker.slug && (s.brand === sneaker.brand || s.category === sneaker.category))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 px-5 py-4 text-[12px] uppercase tracking-wide text-ash sm:px-8">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-ink">Browse</Link>
        <span>/</span>
        <span className="text-ink">{sneaker.model}</span>
      </div>

      {/* header */}
      <section className="grid grid-cols-1 border-y rule lg:grid-cols-[0.95fr_1.05fr]">
        {/* graphic */}
        <div className="relative border-b rule lg:border-b-0 lg:border-r">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(80% 70% at 40% 30%, ${sneaker.palette[0]} 0%, transparent 65%)`,
            }}
          />
          <SneakerGraphic sneaker={sneaker} className="relative w-full px-8 py-12" />
          <div className="absolute bottom-4 left-5 flex gap-1.5 sm:left-8">
            {sneaker.palette.map((c, i) => (
              <span
                key={i}
                className="h-5 w-5 rounded-full border border-paper shadow-sm"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* info */}
        <div className="flex flex-col justify-between px-5 py-8 sm:px-8">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ash">
              <span>{sneaker.brand}</span>
              <span className="h-1 w-1 rounded-full bg-ash" />
              <span>{sneaker.category}</span>
              {sneaker.releaseYear && (
                <>
                  <span className="h-1 w-1 rounded-full bg-ash" />
                  <span className="numerals">{sneaker.releaseYear}</span>
                </>
              )}
            </div>
            <h1 className="display mt-3 text-5xl leading-[0.9] sm:text-6xl">
              {sneaker.model}
            </h1>
            <p className="mt-2 text-base text-ink-soft">{sneaker.colorway}</p>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-soft">
              {sneaker.description}
            </p>
            {sneaker.sku && (
              <p className="numerals mt-4 text-xs text-ash">SKU · {sneaker.sku}</p>
            )}
          </div>

          {/* price summary */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t rule pt-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ash">
                Lowest of {inStockCount} in-stock · {lowStore?.name}
              </p>
              <p className="numerals text-5xl font-semibold leading-none">
                {low ? formatINR(low.price) : "—"}
              </p>
              {saving > 0 && (
                <p className="mt-2 inline-block bg-volt px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink">
                  Save up to {formatINR(saving)} vs. priciest store
                </p>
              )}
            </div>
            {low && (
              <a
                href={low.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-volt transition-transform hover:-translate-y-0.5"
              >
                Buy at lowest ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* price ladder */}
      <section className="px-5 py-10 sm:px-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="display text-3xl sm:text-4xl">Price ladder</h2>
          <p className="text-[12px] uppercase tracking-wide text-ash">
            Cheapest first · {sneaker.offers.length} listings
          </p>
        </div>
        <PriceTable sneaker={sneaker} />
        <p className="mt-4 text-xs text-ash">
          Prices are indicative demo data and refresh on each visit. “Buy” opens
          the retailer in a new tab — we may earn a commission on outbound links.
        </p>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="px-5 pb-6 sm:px-8">
          <h2 className="display text-3xl sm:text-4xl">More like this</h2>
          <div className="mt-5 grid grid-cols-1 border-t border-l rule sm:grid-cols-2 lg:grid-cols-4">
            {related.map((s, i) => (
              <SneakerCard key={s.id} sneaker={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
