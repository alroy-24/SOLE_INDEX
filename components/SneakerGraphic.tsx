import type { Sneaker } from "@/lib/types";

/**
 * Editorial, dependency-free product graphic. Renders a stylised side-profile
 * sneaker tinted with the colorway palette over a paper panel. Used in place of
 * licensed product photography during the mock-data phase.
 */
export function SneakerGraphic({
  sneaker,
  className = "",
}: {
  sneaker: Sneaker;
  className?: string;
}) {
  const [c0, c1 = "#161616", c2] = sneaker.palette;
  const upper = c0;
  const sole = c1;
  const accent = c2 ?? "#ccff00";
  const isDarkUpper = luminance(upper) < 0.5;
  const stitch = isDarkUpper ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)";

  return (
    <svg
      viewBox="0 0 400 250"
      className={className}
      role="img"
      aria-label={`${sneaker.brand} ${sneaker.model}, ${sneaker.colorway}`}
    >
      {/* upper body */}
      <path
        d="M18 168 C18 138 36 120 74 110 C104 102 128 98 156 90 C182 82 200 68 226 56 C252 44 284 44 306 60 C326 74 336 100 340 126 L342 150 C343 162 338 168 326 168 Z"
        fill={upper}
      />
      {/* toe cap */}
      <path
        d="M18 168 C18 142 32 124 64 113 C70 132 72 152 70 168 Z"
        fill={accent}
        opacity={isDarkUpper ? 0.9 : 0.85}
      />
      {/* heel counter */}
      <path
        d="M300 62 C322 76 333 100 338 126 L340 150 C341 162 336 168 326 168 L300 168 Z"
        fill={sole}
        opacity="0.92"
      />
      {/* swoosh-style accent stroke (generic, unbranded) */}
      <path
        d="M96 158 C150 120 214 104 300 104"
        fill="none"
        stroke={accent}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* laces */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={196 + i * 22}
          y1={84 - i * 8}
          x2={214 + i * 22}
          y2={104 - i * 8}
          stroke={stitch}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      {/* perforation row */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={120 + i * 18} cy={132} r="2.4" fill={stitch} />
      ))}
      {/* midsole */}
      <path
        d="M14 168 L356 168 C374 168 384 178 384 188 C384 202 372 210 352 210 L48 210 C26 210 12 202 12 188 C12 176 12 168 14 168 Z"
        fill={sole}
      />
      {/* midsole highlight line */}
      <path
        d="M22 184 L350 184"
        stroke={stitch}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* outsole tread ticks */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={56 + i * 26}
          y1={200}
          x2={56 + i * 26}
          y2={208}
          stroke={stitch}
          strokeWidth="2.5"
          opacity="0.45"
        />
      ))}
    </svg>
  );
}

function luminance(hex: string): number {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
