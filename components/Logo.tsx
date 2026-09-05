import { clsx } from "clsx";

/**
 * The OF-Siegel mark. Three distinct drawings, not one drawing scaled:
 *   size >= 64        -> primary, ring has a gap, the bar runs through it
 *   28 <= size < 64    -> header, same gapped-ring idea but tuned to survive
 *                         small rendering: thicker stroke, wider gap, a
 *                         shorter overhanging arm. Brand recognition (the F
 *                         breaking the ring) beats the optical case for a
 *                         closed ring at this size — see the commit that
 *                         added this tier for why.
 *   size < 28          -> compact, ring is closed, heavier stroke — reserved
 *                         for genuinely tiny uses where even the widened gap
 *                         would fill in.
 * The thresholds live here so nobody has to remember them on every page.
 */

const HEADER_MIN = 28;
const PRIMARY_MIN = 64;

/** Primary (size >= 64) geometry, exported so decorative reuses (e.g. components/BrandBackdrop.tsx) draw the exact same mark instead of a hand-copied approximation. */
export const MARK_PRIMARY_PATHS = {
  ring: "M189.88 88.53a84 84 0 1 1-26.16-34.72",
  f: "M80 170V72h138",
  bar: "M80 116h72",
};

/** Header tier (28–63px) — same 84px-radius ring, widened to a 40° gap (was
 *  30°) so it doesn't visually close at 1x, and the F's top arm shortened so
 *  it doesn't overhang past the ring's edge far enough to read as a stray
 *  mark next to it. */
export const MARK_HEADER_PATHS = {
  ring: "M192.33 95.44a84 84 0 1 1-34.58-45.89",
  f: "M80 170V72h125",
  bar: "M80 116h72",
};

export function LogoMark({
  size = 96,
  animated = false,
  className,
  title = "Treffpunkt Offenbach",
  /** Overrides both ring and F/bar to a single colour (e.g. "var(--c-paper)"
   *  for the hero photo) instead of the default two-tone ink/accent. */
  color,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  title?: string;
  color?: string;
}) {
  const tier = size >= PRIMARY_MIN ? "primary" : size >= HEADER_MIN ? "header" : "compact";
  // An empty title (LogoLockup's case) means this mark is decorative — the
  // accessible name comes from an adjacent sr-only span instead. role="img"
  // with an empty aria-label would tell assistive tech this is a meaningful
  // image with no alternative text, which is worse than not being an "img"
  // at all: mark it aria-hidden and skip <title> rather than announce
  // nothing where something was expected.
  const decorative = !title;
  const a11yProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": title };
  const ringColor = color ?? "var(--c-ink)";
  const accentColor = color ?? "var(--c-accent)";
  const paths = tier === "header" ? MARK_HEADER_PATHS : MARK_PRIMARY_PATHS;
  const strokeWidth = tier === "compact" ? 19 : tier === "header" ? 16 : 13;
  return (
    <svg
      viewBox="0 0 240 240"
      {...a11yProps}
      width={size}
      height={size}
      className={clsx(animated && tier !== "compact" && "logo-draw", className)}
      style={{ overflow: "visible" }}
    >
      {!decorative && <title>{title}</title>}
      <g fill="none" strokeWidth={strokeWidth} strokeLinecap="butt" strokeLinejoin="miter">
        {tier === "compact" ? (
          <circle className="tpof-ring" cx="112" cy="120" r="84" stroke={ringColor} />
        ) : (
          <path className="tpof-ring" d={paths.ring} stroke={ringColor} />
        )}
        <path
          className="tpof-f"
          d={tier === "compact" ? "M80 168V74h126" : paths.f}
          stroke={accentColor}
        />
        <path
          className="tpof-bar"
          d={tier === "compact" ? "M80 118h70" : paths.bar}
          stroke={accentColor}
        />
      </g>
    </svg>
  );
}

/** Same 84px-radius ring as MARK_PRIMARY_PATHS.ring, gap widened from 30°
 *  to 38° (4° each side, same centre/radius so it overlays exactly) — for
 *  HeroMark's halo only, whose extra stroke width would otherwise close up
 *  the gap the F's arm passes through. Computed by hand: the primary ring's
 *  circle is centred at (112, 120) r=84; the visible ring's two open ends
 *  sit at -22° and -52°, so the halo's move to -18° and -56°. */
const MARK_HALO_RING_PATH = "M191.89 94.04a84 84 0 1 1-32.92-43.68";

/**
 * The large mark drawn over the homepage hero photo. Two things a plain
 * `<LogoMark color=".../>` can't do: the ring and the F need DIFFERENT
 * theme-invariant colours (paper ring, blue F — the mark's own construction,
 * just inverted for a dark ground), and the stroke needs a halo so it holds
 * up against a busy, now-brighter skyline instead of fraying into it.
 *
 * The halo is a second, wider, dimmer copy of the same three paths, drawn
 * first (underneath). It's deliberately static — no draw-on, no CSS
 * animation classes at all — rather than trying to keep a second
 * stroke-dasharray in lockstep with the visible group's: the halo's ring
 * path isn't even the same length as the visible one (wider gap, see
 * MARK_HALO_RING_PATH), so sharing a dasharray number would drift. A static
 * halo sidesteps that entirely — there's nothing to desynchronise from.
 */
export function HeroMark({
  size = 480,
  animated = false,
  className,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const { ring, f, bar } = MARK_PRIMARY_PATHS;
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" width={size} height={size} className={className} style={{ overflow: "visible" }}>
      <g
        fill="none"
        strokeWidth={23}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        stroke="color-mix(in srgb, var(--c-hero-scrim) 45%, transparent)"
      >
        <path d={MARK_HALO_RING_PATH} />
        <path d={f} />
        <path d={bar} />
      </g>
      <g className={clsx(animated && "logo-draw")} fill="none" strokeWidth={13} strokeLinecap="butt" strokeLinejoin="miter">
        <path className="tpof-ring" d={ring} stroke="var(--c-hero-ink)" />
        <path className="tpof-f" d={f} stroke="var(--c-hero-accent)" />
        <path className="tpof-bar" d={bar} stroke="var(--c-hero-accent)" />
      </g>
    </svg>
  );
}

/** Horizontal lockup: mark + two lines, optically equal in width. */
export function LogoLockup({
  markSize = 44,
  animated = false,
  className,
}: {
  markSize?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <LogoMark size={markSize} animated={animated} title="" />
      <span className="leading-[0.9]">
        <span
          className="block font-display font-extrabold tracking-[-0.045em]"
          style={{ fontSize: markSize * 0.47 }}
        >
          TREFFPUNKT
        </span>
        <span
          className="mt-[0.28em] block font-display font-medium text-ink-2"
          style={{ fontSize: markSize * 0.2, letterSpacing: "0.37em" }}
        >
          OFFENBACH
        </span>
      </span>
      <span className="sr-only">Gewerbeverein Treffpunkt Offenbach e. V.</span>
    </span>
  );
}
