import Image from "next/image";
import type { Sneaker } from "@/lib/types";
import { SneakerGraphic } from "./SneakerGraphic";

/**
 * Real product photography when we have it (Shopify CDN), with the
 * dependency-free SVG graphic as a graceful fallback. Always render inside a
 * `relative` sized container — it fills it.
 *
 * Product shots ship on white; `mix-blend-multiply` drops that white onto the
 * paper background so the photo doesn't sit in a hard rectangle.
 */
export function SneakerImage({
  sneaker,
  className = "",
  sizes = "(max-width: 768px) 100vw, 350px",
  priority = false,
}: {
  sneaker: Sneaker;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = sneaker.images?.[0];
  if (!src) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center p-6 ${className}`}>
        <SneakerGraphic sneaker={sneaker} className="w-full" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={`${sneaker.brand} ${sneaker.model} — ${sneaker.colorway}`}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}
