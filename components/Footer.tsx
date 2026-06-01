import Link from "next/link";
import { RETAILERS } from "@/lib/retailers";

export function Footer() {
  const stores = Object.values(RETAILERS);
  return (
    <footer className="mt-24 border-t rule bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-5xl sm:text-7xl">Every price.<br />One search.</p>
            <Link
              href="/browse"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-volt px-5 py-2 text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
            >
              Start comparing ↗
            </Link>
          </div>
          <div className="text-sm text-paper/70">
            <p className="mb-3 font-semibold uppercase tracking-wide text-paper">
              Indexed stores
            </p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {stores.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SOLEINDEX — independent price index.
            Prices shown are indicative demo data.
          </p>
          <p>
            Not affiliated with any listed retailer. We may earn a commission on
            outbound links.
          </p>
        </div>
      </div>
    </footer>
  );
}
