"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Logo, logoMinHeight } from "./Logo";
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
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // Not a modal overlay — it's an in-flow disclosure that pushes the rest of
  // the page down, so Tab is deliberately never hard-trapped inside it (that
  // would itself be an accessibility bug here: everything after it in
  // reading order is still visible, just scrolled below, and a keyboard
  // user should be able to reach it). What IS expected of any disclosure
  // like this: Escape closes it and returns focus to the button that opened
  // it, and opening it moves focus to the first item inside.
  useEffect(() => {
    if (!open) return;
    const firstLink = mobileNavRef.current?.querySelector("a");
    (firstLink as HTMLElement | null)?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-[6px]"
      style={{ borderColor: "var(--c-line)", backgroundColor: "color-mix(in srgb, var(--c-paper) 88%, transparent)" }}
    >
      {/* Row height comes from --header-h (globals.css): the logo sets it, not
          the other way round — 45px compact below 640px, 72px full from 640px
          (each is the smallest height at which that lockup still meets its
          minimum rendered width: 120px / 170px), plus 24px of padding and the
          1px border. The homepage hero subtracts the same variable. */}
      <div
        className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-6"
        style={{ height: "calc(var(--header-h) - 1px)" }}
      >
        {/* First focusable element after the skip link. No aria-label: the
            <img> alt already names the link, and a custom label would
            override the visible artwork's own name. Exactly one of the two
            breakpoint wrappers below is displayed, and within it exactly one
            of the light/dark files — the rest are display:none, i.e. out of
            the accessibility tree. */}
        <Link href="/" className="flex shrink-0 items-center">
          <span className="block sm:hidden">
            <Logo variant="compact" height={logoMinHeight("compact")} />
          </span>
          <span className="hidden sm:block">
            <Logo variant="full" height={logoMinHeight("full")} />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Hauptnavigation">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "link-underline relative font-display text-[14px] font-medium transition-colors duration-[120ms]",
                  active ? "text-accent" : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
                {active &&
                  (reduce ? (
                    <span className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-accent" />
                  ) : (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ))}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <ThemeToggle />
          <Link
            href="/mitglied-werden"
            className="hidden bg-accent px-4 py-2 font-display text-[13px] font-semibold text-on-accent transition-[filter] duration-[120ms] hover:brightness-110 sm:inline-block"
          >
            Mitglied werden
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="lg:hidden"
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
        ref={mobileNavRef}
        id="mobile-nav"
        hidden={!open}
        aria-label="Hauptnavigation, mobil"
        className="border-t lg:hidden"
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
