import type { GeoPoint } from "@/lib/members";

/**
 * A flat map image, never an interactive embed — see house rule 7 (no map
 * iframes). Backed by Wikimedia's keyless static map renderer, which serves
 * a plain PNG with no cookies and no client-side script. When a member has
 * no cached geocode result yet, this renders a bordered placeholder instead
 * of failing — most members won't have coordinates until `npm run geocode`
 * has run against their real address.
 */
export function StaticMap({
  point,
  label,
  zoom = 16,
  width = 480,
  height = 280,
}: {
  point: GeoPoint | null;
  label: string;
  zoom?: number;
  width?: number;
  height?: number;
}) {
  if (!point) {
    return (
      <div
        className="flex items-center justify-center border font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
        style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)", aspectRatio: `${width} / ${height}` }}
      >
        Karte folgt
      </div>
    );
  }

  const src = `https://maps.wikimedia.org/img/osm-intl,${zoom},${point.lat},${point.lon},${width}x${height}.png`;

  return (
    <div className="relative border" style={{ borderColor: "var(--c-line)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- external static image, not an optimizable local asset */}
      <img src={src} alt={`Lageplan: ${label}`} width={width} height={height} loading="lazy" className="block w-full" style={{ aspectRatio: `${width} / ${height}` }} />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{ borderColor: "var(--c-accent)", backgroundColor: "var(--c-paper)" }}
      />
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted" style={{ position: "absolute", right: 4, bottom: 2 }}>
        © OpenStreetMap
      </p>
    </div>
  );
}
