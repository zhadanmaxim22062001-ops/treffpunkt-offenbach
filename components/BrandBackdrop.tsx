/**
 * Decorative-only background for the photo-less hero fallback and the
 * ink-inverted CTA band: a soft radial glow, nothing else. It used to carry
 * a giant, very faint copy of the former mark bleeding off the right
 * edge; the association's own logo is not used as wallpaper, so that is gone
 * rather than replaced. Flat CSS only: no images, no blur filters.
 *
 * `inverse` is for the ink-inverted CTA band specifically. That band swaps
 * which of light/dark it visually is depending on the current site theme
 * (light theme: dark band; dark theme: light band — see --c-invert-bg/-fg
 * in globals.css), so this reads var(--c-invert-fg) rather than a fixed
 * "light" or "dark" colour — that token already resolves to whatever
 * actually contrasts against that band in either theme.
 *
 * Sits absolutely inside a `relative overflow-hidden` ancestor the caller
 * provides. aria-hidden and pointer-events-none throughout; never affects
 * layout or competes with the LCP text for paint priority.
 */
export function BrandBackdrop({ inverse = false }: { inverse?: boolean }) {
  const glow = inverse ? "color-mix(in srgb, var(--c-invert-fg) 12%, transparent)" : "var(--c-accent-soft)";

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none" }}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 90% 70% at 88% 0%, ${glow}, transparent 65%)` }}
      />
    </div>
  );
}
