"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "tpof-theme";

/**
 * Theme toggle. Three states, not two: by default the site follows the
 * system and stamps nothing on <html>, so only prefers-color-scheme
 * applies in that state.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Mode | null;
      if (saved === "light" || saved === "dark") setMode(saved);
    } catch {
      /* private browsing or blocked storage — stay on system */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    try {
      if (mode === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch {
      /* nothing to do: the theme still applies, it just won't survive a reload */
    }
  }, [mode]);

  const next: Record<Mode, Mode> = { system: "dark", dark: "light", light: "system" };
  const label: Record<Mode, string> = { system: "System", dark: "Dunkel", light: "Hell" };

  return (
    <button
      type="button"
      onClick={() => setMode(next[mode])}
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors duration-[120ms] hover:text-ink"
      aria-label={`Darstellung: ${label[mode]}. Umschalten auf ${label[next[mode]]}`}
    >
      {label[mode]}
    </button>
  );
}
