import type { MapMeta } from "@/lib/maps";

const GRID = 3;

/**
 * A flat map image, never an interactive embed — see house rule 7 (no map
 * iframes). Built from OpenStreetMap raster tiles fetched ONCE at import
 * time and cached under public/maps/<slug>/. This component only ever reads
 * those local files — a visitor's browser makes no third-party request and
 * hands nobody an IP address. Same reasoning as keeping fonts local (see
 * lib/fonts.ts).
 *
 * Used for exactly one map on the whole site: the association's own address
 * on /kontakt, fetched by scripts/fetch-verein-map.mjs. Member pages link
 * out to OpenStreetMap instead of rendering a map — see
 * scripts/geocode-members.mjs for why a rendered map per member doesn't
 * scale to the real member list.
 *
 * When there's no cached data yet, this renders a bordered placeholder
 * instead of failing.
 */
export function StaticMap({ slug, meta, label }: { slug: string; meta: MapMeta | null; label: string }) {
  if (!meta) {
    return (
      <div
        className="flex aspect-square items-center justify-center border font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
        style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}
      >
        Karte folgt
      </div>
    );
  }

  const tiles = Array.from({ length: GRID }, (_, row) => row).flatMap((row) =>
    Array.from({ length: GRID }, (_, col) => ({ row, col })),
  );

  return (
    <figure className="m-0">
      <div className="relative aspect-square overflow-hidden border" style={{ borderColor: "var(--c-line)" }}>
        <div className="map-tiles absolute inset-0 grid grid-cols-3 grid-rows-3">
          {tiles.map(({ row, col }) => (
            // eslint-disable-next-line @next/next/no-img-element -- locally cached tile, not an optimizable next/image candidate (already a fixed 256px raster)
            <img key={`${row}-${col}`} src={`/maps/${slug}/${row}-${col}.png`} alt="" width={256} height={256} loading="lazy" className="block h-full w-full" />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="map-tint pointer-events-none absolute inset-0"
          style={{ backgroundColor: "var(--c-accent)", mixBlendMode: "multiply" }}
        />
        <span
          aria-hidden
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ left: `${meta.xPct}%`, top: `${meta.yPct}%`, borderColor: "var(--c-accent)", backgroundColor: "var(--c-paper)" }}
        />
        <span className="sr-only">Lageplan: {label}</span>
      </div>
      <figcaption className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        Kartendaten:{" "}
        <a className="link-underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          © OpenStreetMap-Mitwirkende
        </a>
      </figcaption>
    </figure>
  );
}
