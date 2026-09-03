"use client";

import { clsx } from "clsx";
import { motion, useInView, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Section reveal: 16px up + fade, once, ~60ms stagger.
 * `as="li"` when this wraps a list row directly inside a <ul>/<ol> — a plain
 * `motion.div` there breaks list semantics (Lighthouse's "list"/"listitem"
 * audits: a <ul> must contain only <li>, and every <li> needs a <ul>/<ol>
 * parent, neither true if a <div> sits in between).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? "li" : "div";
  if (reduce) return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      data-reveal
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.15, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Hero headline reveal: each line masks in via translateY (never opacity),
 * so the h1 stays LCP-eligible from first paint — only its clip position
 * animates, nothing about "is this element rendered" changes. `lines` is a
 * fixed, hand-chosen split (this wraps fixed brand copy, not dynamic data),
 * each its own overflow-hidden mask. Pair with Heading's `ariaLabel` prop
 * and mark this aria-hidden, since screen readers should get the sentence
 * once, not line-by-line.
 */
export function LineReveal({
  lines,
  delay = 0,
  stagger = 0.09,
  className,
}: {
  lines: string[];
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <>
        {lines.map((line, i) => (
          <span key={i} className={clsx("block", className)}>
            {line}
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            data-reveal
            className={clsx("block", className)}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.4, 0, 0.15, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/** Fade+rise on mount rather than on scroll-into-view — for above-the-fold content (hero lead/buttons) that's visible immediately, so a scroll-triggered Reveal would never fire. */
export function MountReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.15, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** 2px accent line at the top of the viewport tracking scroll position — the one ambient effect in the system. Bound directly to scroll, not a spring, so it never moves on its own. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-accent"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/** Kennzahlen counter: counts up once it enters the viewport, respects reduced motion. */
export function CountUp({
  to,
  suffix = "",
  duration = 1100,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic — the number eases into its final value instead of snapping
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className="inline-block">
      <span className="tnum">
        {value}
        {suffix}
      </span>
      {/* Thin rule draws left-to-right under the number in the same window it counts in — one motion value, one ref, so the two can't drift out of sync. */}
      <motion.span
        aria-hidden="true"
        className="mt-2 block h-[2px] origin-left bg-accent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : duration / 1000, ease: [0.4, 0, 0.15, 1] }}
      />
    </span>
  );
}

/** Smooth scroll. Disabled under prefers-reduced-motion. */
export function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [reduce]);
  return null;
}
