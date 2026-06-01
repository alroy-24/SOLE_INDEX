import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="display text-xl tracking-tight">SOLEINDEX</span>
          <span className="hidden h-2 w-2 rounded-full bg-volt sm:block" />
        </Link>

        <nav className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-wide">
          <Link
            href="/browse"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper"
          >
            Browse
          </Link>
          <Link
            href="/#how"
            className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper sm:block"
          >
            How it works
          </Link>
          <Link
            href="/browse"
            className="ml-1 rounded-full bg-ink px-4 py-1.5 text-paper transition-colors hover:bg-volt hover:text-ink"
          >
            Compare ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}
