import { MARK_PRIMARY_PATHS } from "@/components/Logo";

/**
 * Decorative-only background texture built from the brand's own geometry —
 * never stock photography of Offenbach (no rights to any). A giant, very
 * faint OF-Siegel bleeding off the right edge, over a soft radial field.
 * Flat CSS only: no images, no blur filters.
 *
 * `inverse` is for the ink-inverted CTA band specifically. That band swaps
 * which of light/dark it visually is depending on the current site theme
 * (light theme: dark band; dark theme: light band — see --c-invert-bg/-fg
 * in globals.css), so this reads var(--c-invert-fg) rather than a fixed
 * "light" or "dark" mark colour — that token already resolves to whatever
 * actually contrasts against that band in either theme.
 *
 * Sits absolutely inside a `relative overflow-hidden` ancestor the caller
 * provides. aria-hidden and pointer-events-none throughout; never affects
 * layout or competes with the LCP text for paint priority (it's a plain
 * CSS gradient plus one small inline SVG, not an image request).
 */
export function BrandBackdrop({ inverse = false }: { inverse?: boolean }) {
  const markColor = inverse ? "var(--c-invert-fg)" : "var(--c-accent)";
  const glow = inverse ? "color-mix(in srgb, var(--c-invert-fg) 12%, transparent)" : "var(--c-accent-soft)";

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none" }}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 90% 70% at 88% 0%, ${glow}, transparent 65%)` }}
      />
      <svg
        viewBox="0 0 240 240"
        className="absolute"
        style={{
          height: "140%",
          width: "140%",
          aspectRatio: "1 / 1",
          top: "50%",
          right: "-30%",
          transform: "translateY(-50%)",
          opacity: 0.05,
          overflow: "visible",
        }}
      >
        <g fill="none" stroke={markColor} strokeWidth="13" strokeLinecap="butt" strokeLinejoin="miter">
          <path d={MARK_PRIMARY_PATHS.ring} />
          <path d={MARK_PRIMARY_PATHS.f} />
          <path d={MARK_PRIMARY_PATHS.bar} />
        </g>
      </svg>
    </div>
  );
}
