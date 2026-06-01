import Link from "next/link";
import { getAllSneakers } from "@/lib/data";
import { RETAILERS } from "@/lib/retailers";
import { SneakerCard } from "@/components/SneakerCard";
import { SneakerImage } from "@/components/SneakerImage";
import { Marquee } from "@/components/Marquee";
import { formatINR, lowestOffer, maxSaving } from "@/lib/utils";

export default function Home() {
  const sneakers = getAllSneakers();
  const storeCount = Object.keys(RETAILERS).length;
  const hero = sneakers[0];
  const heroLow = lowestOffer(hero);
  const featured = sneakers.slice(0, 8);
  const biggestSaver = [...sneakers].sort((a, b) => maxSaving(b) - maxSaving(a))[0];

  return (
    <>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="border-b rule">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          {/* left: editorial headline */}
          <div className="flex flex-col justify-between border-b rule px-5 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:py-16">
            <div className="rise">
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-ash">
                <span className="h-2 w-2 rounded-full bg-volt" />
                India&apos;s sneaker price index
              </p>
              <h1 className="display mt-6 text-[15vw] leading-[0.85] sm:text-7xl lg:text-[5.6rem]">
                One search.
                <br />
                Every price.
                <br />
                <span className="bg-ink px-2 text-volt">Lowest wins.</span>
              </h1>
              <p className="mt-7 max-w-md text-base text-ink-soft sm:text-lg">
                We line up live prices for the same pair across Nike, AJIO,
                Flipkart, Amazon, VegNonVeg, Crepdog Crew, Extra Butter and more
                — then point you straight to the cheapest legit checkout.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-volt hover:text-ink"
              >
                Browse all sneakers ↗
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* right: featured pair */}
          <Link
            href={`/sneakers/${hero.slug}`}
            className="group relative flex flex-col justify-between px-5 py-10 sm:px-8 lg:py-16"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(90% 80% at 70% 20%, ${hero.palette[0]} 0%, transparent 65%)`,
              }}
            />
            <div className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ash">
              <span>Most compared today</span>
              <span className="numerals">№ 01</span>
            </div>
            <div className="relative my-6 aspect-[5/4] w-full">
              <SneakerImage
                sneaker={hero}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="relative flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ash">
                  {hero.brand}
                </p>
                <p className="display text-2xl leading-none">{hero.model}</p>
                <p className="mt-1 text-xs text-ink-soft">{hero.colorway}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-ash">from</p>
                <p className="numerals text-3xl font-semibold leading-none">
                  {heroLow?.price != null ? formatINR(heroLow.price) : "—"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* stat strip */}
        <div className="grid grid-cols-2 border-t rule sm:grid-cols-4">
          {[
            ["Stores indexed", String(storeCount)],
            ["Models tracked", String(sneakers.length)],
            ["Biggest saving", formatINR(maxSaving(biggestSaver))],
            ["Price freshness", "Live"],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={`px-5 py-5 sm:px-8 ${i < 3 ? "border-r rule" : ""} ${
                i < 2 ? "border-b sm:border-b-0 rule" : ""
              }`}
            >
              <p className="numerals text-2xl font-semibold sm:text-3xl">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-ash">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Marquee />

      {/* ─────────────────────── FEATURED GRID ─────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex items-end justify-between py-8">
          <div>
            <h2 className="display text-3xl sm:text-4xl">The shortlist</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Hand-picked pairs people are comparing right now.
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden text-sm font-semibold uppercase tracking-wide underline-offset-4 hover:underline sm:block"
          >
            See all {sneakers.length} →
          </Link>
        </div>

        <div className="grid grid-cols-1 border-t border-l rule sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s, i) => (
            <SneakerCard key={s.id} sneaker={s} index={i} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/browse"
            className="block w-full rounded-full border border-ink py-3 text-center text-sm font-semibold uppercase tracking-wide"
          >
            See all {sneakers.length} →
          </Link>
        </div>
      </section>

      {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
      <section id="how" className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
        <h2 className="display text-3xl sm:text-4xl">How it works</h2>
        <div className="mt-6 grid grid-cols-1 border-t border-l rule md:grid-cols-3">
          {[
            [
              "01",
              "Search the pair",
              "Pick any model and colorway. We already track it across the country's trusted sneaker stores.",
            ],
            [
              "02",
              "See every price",
              "Live listings stack up cheapest-first, with stock status, sizes, discounts and how fresh each price is.",
            ],
            [
              "03",
              "Buy at the lowest",
              "Tap Buy and we send you straight to that retailer's checkout — the lowest legit price, no detours.",
            ],
          ].map(([n, title, body]) => (
            <div key={n} className="border-b border-r rule p-6">
              <p className="numerals text-sm text-ash">{n}</p>
              <h3 className="display mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
