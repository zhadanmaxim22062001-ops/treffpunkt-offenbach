import { clsx } from "clsx";

/**
 * The OF-Siegel mark. Two distinct drawings, not one drawing scaled:
 *   size >= 64  -> primary, ring has a gap, the bar runs through it
 *   size <  64  -> compact, ring is closed, heavier stroke
 * The threshold lives here so nobody has to remember it on every page.
 */

const COMPACT_BELOW = 64;

export function LogoMark({
  size = 96,
  animated = false,
  className,
  title = "Treffpunkt Offenbach",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  title?: string;
}) {
  const compact = size < COMPACT_BELOW;
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
  return (
    <svg
      viewBox="0 0 240 240"
      {...a11yProps}
      width={size}
      height={size}
      className={clsx(animated && !compact && "logo-draw", className)}
      style={{ overflow: "visible" }}
    >
      {!decorative && <title>{title}</title>}
      <g fill="none" strokeWidth={compact ? 19 : 13} strokeLinecap="butt" strokeLinejoin="miter">
        {compact ? (
          <circle className="tpof-ring" cx="112" cy="120" r="84" stroke="var(--c-ink)" />
        ) : (
          <path className="tpof-ring" d="M189.88 88.53a84 84 0 1 1-26.16-34.72" stroke="var(--c-ink)" />
        )}
        <path
          className="tpof-f"
          d={compact ? "M80 168V74h126" : "M80 170V72h138"}
          stroke="var(--c-accent)"
        />
        <path
          className="tpof-bar"
          d={compact ? "M80 118h70" : "M80 116h72"}
          stroke="var(--c-accent)"
        />
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
