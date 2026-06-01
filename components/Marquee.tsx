import { RETAILERS } from "@/lib/retailers";

export function Marquee() {
  const names = Object.values(RETAILERS).map((r) => r.name);
  const items = [...names, ...names];
  return (
    <div className="overflow-hidden border-y rule bg-ink py-3 text-paper">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {items.map((name, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="display text-sm tracking-tight">{name}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-volt" />
          </span>
        ))}
      </div>
    </div>
  );
}
