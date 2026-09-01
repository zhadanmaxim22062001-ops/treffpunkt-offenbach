"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { LogoLockup } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/verein", label: "Verein" },
  { href: "/mitglieder", label: "Mitglieder" },
  { href: "/veranstaltungen", label: "Veranstaltungen" },
  { href: "/radar", label: "OF-Radar" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-[6px]"
      style={{ borderColor: "var(--c-line)", backgroundColor: "color-mix(in srgb, var(--c-paper) 88%, transparent)" }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-6 py-3">
        {/* No aria-label here — LogoLockup already supplies an accessible
            name (visible "TREFFPUNKT"/"OFFENBACH" text + an sr-only
            expansion). A custom label on this link would override that and
            risk not containing the visible text verbatim, which breaks
            voice-control name matching (WCAG 2.5.3). */}
        <Link href="/">
          <LogoLockup markSize={38} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "link-underline font-display text-[14px] font-medium transition-colors duration-[120ms]",
                  active ? "text-accent" : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/mitglied-werden"
            className="hidden bg-accent px-4 py-2 font-display text-[13px] font-semibold text-on-accent transition-[filter] duration-[120ms] hover:brightness-110 sm:inline-block"
          >
            Mitglied werden
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
              {open ? "Schließen" : "Menü"}
            </span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        hidden={!open}
        aria-label="Hauptnavigation, mobil"
        className="border-t md:hidden"
        style={{ borderColor: "var(--c-line)" }}
      >
        <ul className="mx-auto flex w-full max-w-[1180px] flex-col px-6 py-3">
          {[...NAV, { href: "/mitglied-werden", label: "Mitglied werden" }].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b py-3 font-display text-[15px] font-medium"
                style={{ borderColor: "var(--c-line)" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
