import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { BRANCHEN, filterMembers, getAllMembers, getDistinctStreets } from "@/lib/members";

export const metadata: Metadata = {
  title: "Mitgliederverzeichnis",
  description: "Über hundert Betriebe im Gewerbeverein Treffpunkt Offenbach — nach Branche und Straße filterbar.",
};

type SearchParams = { branche?: string; strasse?: string; q?: string };

function buildHref(current: SearchParams, overrides: SearchParams): string {
  const merged = { ...current, ...overrides };
  const params = new URLSearchParams();
  if (merged.branche) params.set("branche", merged.branche);
  if (merged.strasse) params.set("strasse", merged.strasse);
  if (merged.q) params.set("q", merged.q);
  const qs = params.toString();
  return qs ? `/mitglieder?${qs}` : "/mitglieder";
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const streets = getDistinctStreets();
  const results = filterMembers(getAllMembers(), sp);
  const hasFilter = Boolean(sp.branche || sp.strasse || sp.q);

  return (
    <Section>
      <Eyebrow className="mb-4">Mitglieder</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Über hundert Betriebe, nach Branche und Straße filterbar.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Das Verzeichnis der Mitgliedsbetriebe des Gewerbevereins Treffpunkt Offenbach — Einzelhandel, Gastronomie,
        Handwerk, Dienstleistung, Gesundheit und Bildung mitten in der Innenstadt.
      </Lead>

      <div className="mt-12 flex flex-wrap items-center gap-2" role="group" aria-label="Nach Branche filtern">
        <Link
          href={buildHref(sp, { branche: undefined })}
          aria-current={!sp.branche ? "true" : undefined}
          className="border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms]"
          style={
            !sp.branche
              ? { borderColor: "var(--c-accent)", background: "var(--c-accent-soft)", color: "var(--c-accent)" }
              : { borderColor: "var(--c-line)", color: "var(--c-muted)" }
          }
        >
          Alle
        </Link>
        {BRANCHEN.map((branche) => {
          const active = sp.branche === branche;
          return (
            <Link
              key={branche}
              href={buildHref(sp, { branche: active ? undefined : branche })}
              aria-current={active ? "true" : undefined}
              className="border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-[120ms]"
              style={
                active
                  ? { borderColor: "var(--c-accent)", background: "var(--c-accent-soft)", color: "var(--c-accent)" }
                  : { borderColor: "var(--c-line)", color: "var(--c-muted)" }
              }
            >
              {branche}
            </Link>
          );
        })}
      </div>

      <form className="mt-5 flex flex-wrap items-end gap-4" method="get">
        {sp.branche && <input type="hidden" name="branche" value={sp.branche} />}

        <div className="flex flex-col gap-1">
          <label htmlFor="strasse" className="eyebrow">
            Straße
          </label>
          <select
            id="strasse"
            name="strasse"
            defaultValue={sp.strasse ?? ""}
            className="border bg-paper px-3 py-2 font-display text-[14px]"
            style={{ borderColor: "var(--c-line)" }}
          >
            <option value="">Alle Straßen</option>
            {streets.map((street) => (
              <option key={street} value={street}>
                {street}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="eyebrow">
            Suche
          </label>
          <input
            id="q"
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name oder Stichwort"
            className="border bg-paper px-3 py-2 font-display text-[14px]"
            style={{ borderColor: "var(--c-line)" }}
          />
        </div>

        <button
          type="submit"
          className="bg-accent px-4 py-2 font-display text-[13px] font-semibold text-white transition-[filter] duration-[120ms] hover:brightness-110"
        >
          Filtern
        </button>
        {hasFilter && (
          <Link href="/mitglieder" className="link-underline font-display text-[13px] font-medium text-ink-2">
            Zurücksetzen
          </Link>
        )}
      </form>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted tnum">
        {results.length} {results.length === 1 ? "Betrieb" : "Betriebe"}
      </p>

      {results.length === 0 ? (
        <p className="prose-body mt-6">Keine Treffer für diese Auswahl. Filter zurücksetzen und erneut versuchen.</p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((member) => (
            <li key={member.slug} className="border bg-paper-2 p-5" style={{ borderColor: "var(--c-line)" }}>
              <Link href={`/mitglieder/${member.slug}`} className="link-underline">
                <h2 className="font-display text-[17px] font-semibold">{member.name}</h2>
              </Link>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                {member.branche} · {member.street}
              </p>
              {member.teaser && <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{member.teaser}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
