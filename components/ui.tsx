import { clsx } from "clsx";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/* ------------------------------------------------------------------
   Shared primitives. Visual language is a printed spec sheet, not a
   dashboard: 1px hairline borders instead of shadows, rounded corners
   only on pills.
   ------------------------------------------------------------------ */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-[1180px] px-6", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  tone = "paper",
  backdrop,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "paper" | "paper-2" | "invert";
  /** Decorative background layer (e.g. <BrandBackdrop />) — makes the section relative/overflow-hidden to contain it and lifts the content above it. */
  backdrop?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx(
        "border-t py-16 md:py-24",
        tone === "paper" && "bg-paper border-line",
        tone === "paper-2" && "bg-paper-2 border-line",
        tone === "invert" && "border-transparent",
        backdrop && "relative overflow-hidden",
        className,
      )}
      style={tone === "invert" ? { backgroundColor: "var(--c-invert-bg)", color: "var(--c-invert-fg)" } : undefined}
    >
      {backdrop}
      <Container className={backdrop ? "relative z-10" : undefined}>{children}</Container>
    </section>
  );
}

export function Eyebrow({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={clsx("eyebrow", className)} style={style}>
      {children}
    </p>
  );
}

export function Heading({
  children,
  level = 2,
  className,
  ariaLabel,
  style,
}: {
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
  /** Set when children is a decorative animated split (e.g. per-line reveal) that shouldn't be read node-by-node. */
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const Tag = (["h1", "h2", "h3"] as const)[level - 1];
  const size =
    level === 1
      ? "text-[clamp(38px,6.2vw,68px)] leading-[0.96] tracking-[-0.035em] font-extrabold"
      : level === 2
        ? "text-[clamp(26px,3.4vw,40px)] leading-[1.05] tracking-[-0.03em] font-extrabold"
        : "text-[19px] leading-snug tracking-[-0.012em] font-semibold";
  // "Gewerbeverein" must never hyphenate — it's the single most important
  // word on the page (h1 only; body text keeps the default `hyphens: auto`
  // in globals.css, which German compounds still need there). If a line
  // overflows on a narrow viewport as a result, the fix is lowering the
  // clamp's max above, not turning hyphenation back on.
  const noHyphens: CSSProperties | undefined = level === 1 ? { hyphens: "manual" } : undefined;
  return (
    <Tag className={clsx(size, className)} aria-label={ariaLabel} style={{ ...noHyphens, ...style }}>
      {ariaLabel ? <span aria-hidden="true">{children}</span> : children}
    </Tag>
  );
}

export function Lead({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      className={clsx("text-[clamp(19px,2.1vw,23px)] font-light leading-[1.45] text-ink-2", className)}
      style={style}
    >
      {children}
    </p>
  );
}

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "solid" | "outline" | "ghost";
  /** Set only when this button renders directly on the hero photo's scrim.
   *  That scrim is theme-invariant (--c-hero-* in globals.css, never
   *  redefined in the dark blocks — a photograph doesn't re-theme itself),
   *  so the outline variant's normal theme-relative --c-ink/--c-line goes
   *  near-invisible in light theme: dark navy text and a pale hairline on a
   *  dark image. onPhoto swaps it for the .btn-outline-onphoto treatment,
   *  built from the same invariant tokens as the scrim and the mark. The
   *  solid variant is untouched by this prop — white-on-accent already
   *  reads fine against the photo in both themes. */
  onPhoto?: boolean;
  className?: string;
};

export function Button({ children, href, variant = "solid", onPhoto = false, className }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 font-display text-[14px] font-semibold tracking-[-0.005em] transition-colors duration-[120ms]";
  if (variant === "outline" && onPhoto) {
    return (
      <Link href={href} className={clsx(base, "btn-outline-onphoto", className)}>
        {children}
      </Link>
    );
  }
  const styles = {
    solid: "bg-accent text-on-accent hover:brightness-110",
    outline: "border text-ink hover:bg-accent-soft btn-underline",
    ghost: "text-ink hover:text-accent",
  }[variant];
  return (
    <Link
      href={href}
      className={clsx(base, styles, variant === "outline" && "border-line", className)}
      style={variant === "outline" ? { borderColor: "var(--c-line)" } : undefined}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx("card-surface bg-paper-2 border p-5", className)}
      style={{ "--card-border": accent ? "var(--c-accent)" : "var(--c-line)" } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = "accent",
  as = "span",
}: {
  children: ReactNode;
  tone?: "accent" | "signal" | "neutral";
  as?: "span" | "li";
}) {
  const Tag = as;
  const styles = {
    accent: { background: "var(--c-accent-soft)", color: "var(--c-accent)" },
    // Signal is reserved for urgency/deadlines — use this tone for that only, never as a generic second tag colour.
    signal: { background: "var(--c-signal-soft)", color: "var(--c-signal)" },
    neutral: { background: "transparent", color: "var(--c-muted)", border: "1px solid var(--c-line)" },
  }[tone];
  return (
    <Tag
      className="inline-block px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={styles}
    >
      {children}
    </Tag>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={clsx("border-0 border-t", className)} style={{ borderColor: "var(--c-line)" }} />;
}
