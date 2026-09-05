"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/motion";
import { RadarItemBody } from "@/components/RadarItemBody";
import type { RadarItem } from "@/lib/radar-content";
import {
  BRANCHE_OPTIONS,
  clearProfile,
  readProfile,
  scoreRelevance,
  writeProfile,
  type RadarProfile,
} from "@/lib/radar-relevance";

/**
 * The category-filtered items (already resolved server-side from
 * searchParams, so the base order stays shareable/indexable) plus the
 * "Für mich relevant" layer, which is entirely client-side: it reads a
 * Branche+Straße profile from localStorage, never a server round-trip, and
 * only ever reorders/dims — it never removes an item from the list.
 */
export function RadarList({ items }: { items: RadarItem[] }) {
  const [profile, setProfile] = useState<RadarProfile | null>(null);
  const [relevanceOn, setRelevanceOn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftBranche, setDraftBranche] = useState<RadarProfile["branche"]>(BRANCHE_OPTIONS[0]);
  const [draftStrasse, setDraftStrasse] = useState("");

  useEffect(() => {
    const stored = readProfile();
    if (stored) {
      setProfile(stored);
      setDraftBranche(stored.branche);
      setDraftStrasse(stored.strasse);
    }
  }, []);

  const ranked = useMemo(() => {
    if (!relevanceOn || !profile) return items.map((item) => ({ item, dim: false }));
    return items
      .map((item, i) => ({ item, i, score: scoreRelevance(item, profile) }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map(({ item, score }) => ({ item, dim: score === 0 }));
  }, [items, relevanceOn, profile]);

  function handleToggleClick() {
    if (!profile) {
      setEditing(true);
      return;
    }
    setRelevanceOn((v) => !v);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!draftStrasse.trim()) return;
    const next: RadarProfile = { branche: draftBranche, strasse: draftStrasse.trim() };
    writeProfile(next);
    setProfile(next);
    setRelevanceOn(true);
    setEditing(false);
  }

  function handleForgetProfile() {
    clearProfile();
    setProfile(null);
    setRelevanceOn(false);
    setEditing(false);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggleClick}
          aria-pressed={relevanceOn}
          className="border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms]"
          style={
            relevanceOn
              ? { borderColor: "var(--c-accent)", background: "var(--c-accent-soft)", color: "var(--c-accent)" }
              : { borderColor: "var(--c-line)", color: "var(--c-muted)" }
          }
        >
          Für mich relevant
        </button>
        {profile && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="link-underline font-mono text-[11px] uppercase tracking-[0.1em] text-muted"
          >
            Profil ändern
          </button>
        )}
      </div>

      {editing && (
        <form
          onSubmit={handleSaveProfile}
          className="mt-4 flex flex-wrap items-end gap-4 border bg-paper-2 p-4"
          style={{ borderColor: "var(--c-line)" }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="radar-branche" className="eyebrow">
              Branche
            </label>
            <select
              id="radar-branche"
              value={draftBranche}
              onChange={(e) => setDraftBranche(e.target.value as RadarProfile["branche"])}
              className="border bg-paper px-3 py-2 font-display text-[14px]"
              style={{ borderColor: "var(--c-line)" }}
            >
              {BRANCHE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="radar-strasse" className="eyebrow">
              Straße
            </label>
            <input
              id="radar-strasse"
              type="text"
              required
              value={draftStrasse}
              onChange={(e) => setDraftStrasse(e.target.value)}
              placeholder="z. B. Frankfurter Straße"
              className="border bg-paper px-3 py-2 font-display text-[14px]"
              style={{ borderColor: "var(--c-line)" }}
            />
          </div>
          <button
            type="submit"
            className="bg-accent px-4 py-2 font-display text-[13px] font-semibold text-on-accent transition-[filter] duration-[120ms] hover:brightness-110"
          >
            Speichern
          </button>
          {profile && (
            <button
              type="button"
              onClick={handleForgetProfile}
              className="link-underline font-display text-[13px] font-medium text-ink-2"
            >
              Profil löschen
            </button>
          )}
          <p className="prose-body basis-full text-[13px] text-muted">
            Bleibt nur in diesem Browser gespeichert — kein Konto, kein Cookie, keine Übertragung an uns.
          </p>
        </form>
      )}

      <ul className="mt-8 flex flex-col">
        {ranked.map(({ item, dim }, i) => (
          <Reveal
            as="li"
            key={item.slug}
            delay={i * 0.05}
            className="block border-t py-6 transition-opacity duration-300"
            style={{
              borderColor: "var(--c-line)",
              borderLeft: item.urgency === "high" ? "3px solid var(--c-signal)" : undefined,
              paddingLeft: item.urgency === "high" ? "18px" : undefined,
              opacity: dim ? 0.45 : 1,
            }}
          >
            <RadarItemBody item={item} chipFadeDelay={i * 0.05 + 0.15} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
