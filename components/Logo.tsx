import { clsx } from "clsx";

/**
 * The association's own logo — vectorised from its original artwork, never
 * redrawn here. This component only picks the right file and sizes it; it
 * must never recolour, filter, re-letterspace or "tidy" anything about it.
 *
 * Two lockups, each with a light-ground and a dark-ground file (the ONLY
 * difference between the pair is the text colour, #3B3B3B -> #F2F6F9):
 *   full     three lines, GEWERBEVEREIN / TREFF ● PUNKT / Offenbach e.V.
 *   compact  one line, TREFF ● PUNKT — for narrow headers
 *
 * Both files of a pair are always rendered and CSS shows one (.logo-light /
 * .logo-dark in globals.css) — no JavaScript swap, no filter. Each carries
 * the accessible name; the hidden one is display:none, which already takes
 * it out of the accessibility tree, so it is announced once, not twice.
 */

const TITLE = "Gewerbeverein Treffpunkt Offenbach e. V.";

const LOCKUPS = {
  full: { light: "/brand/logo.svg", dark: "/brand/logo-inverse.svg", w: 1051, h: 440, minWidth: 170 },
  compact: { light: "/brand/logo-compact.svg", dark: "/brand/logo-compact-inverse.svg", w: 1051, h: 390, minWidth: 120 },
} as const;

export type LogoVariant = keyof typeof LOCKUPS;

/** Rendered width for a given height — the SVG viewBoxes are fixed. */
export function logoWidth(variant: LogoVariant, height: number): number {
  const l = LOCKUPS[variant];
  return Math.round((height * l.w) / l.h);
}

/** Smallest height at which a lockup still meets its minimum rendered width. */
export function logoMinHeight(variant: LogoVariant): number {
  const l = LOCKUPS[variant];
  return Math.ceil((l.minWidth * l.h) / l.w);
}

export function Logo({
  variant = "full",
  height,
  className,
}: {
  variant?: LogoVariant;
  /** CSS pixels. Below logoMinHeight(variant) the artwork turns to mush — see /styleguide. */
  height: number;
  className?: string;
}) {
  const l = LOCKUPS[variant];
  const width = logoWidth(variant, height);
  if (process.env.NODE_ENV !== "production" && width < l.minWidth) {
    console.warn(`Logo "${variant}" rendered at ${width}px wide — below its ${l.minWidth}px minimum.`);
  }
  const common = {
    alt: TITLE,
    width,
    height,
    decoding: "async" as const,
    style: { width, height },
  };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no optimisation wanted */}
      <img src={l.light} className={clsx("logo-light max-w-none shrink-0", className)} {...common} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={l.dark} className={clsx("logo-dark max-w-none shrink-0", className)} {...common} />
    </>
  );
}

/**
 * The dot alone, with its shadow — large decorative use (the hero). Purely
 * decorative: the lockup in the header already names the association.
 */
export function HeroDot({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG, no optimisation wanted
    <img
      src="/brand/circle-shadow.svg"
      alt=""
      aria-hidden="true"
      width={402}
      height={402}
      decoding="async"
      className={clsx("max-w-none", className)}
      style={style}
    />
  );
}
