import Link from "next/link";
import { getDraftItems, getRecentPublishedItems } from "@/lib/radar/queries";
import { rejectItemAction } from "@/app/admin/radar/actions";
import { CATEGORY_LABELS, URGENCY_LABELS } from "@/lib/radar/validation";

// Never static: this reads live draft/published items straight from the DB
// on every request, and must never be cached or prerendered at build time
// (when DATABASE_URL may not even be set).
export const dynamic = "force-dynamic";

export default async function AdminRadarPage() {
  const [drafts, published] = await Promise.all([getDraftItems(), getRecentPublishedItems(10)]);

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em]">OF-Radar Redaktion</h1>
      </div>

      <Link
        href="/admin/radar/neu"
        className="mt-6 block w-full bg-accent px-6 py-5 text-center font-display text-[16px] font-semibold text-white"
      >
        + Neue Meldung
      </Link>

      <h2 className="mt-10 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
        {drafts.length} {drafts.length === 1 ? "Entwurf" : "Entwürfe"} zur Prüfung
      </h2>

      {drafts.length === 0 ? (
        <p className="mt-4 text-[15px] text-ink-2">Keine offenen Entwürfe.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {drafts.map((item) => (
            <li key={item.id} className="border p-5" style={{ borderColor: "var(--c-line)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
                >
                  {CATEGORY_LABELS[item.category]}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  {item.origin === "feed" ? "Aus Feed" : "Manuell"} · Dringlichkeit {URGENCY_LABELS[item.urgency]}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[18px] font-semibold leading-snug">{item.headlineDe}</h3>
              <p className="mt-2 text-[14px] text-ink-2">{item.summaryDe}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/admin/radar/${item.id}`}
                  className="w-full border px-5 py-4 text-center font-display text-[15px] font-semibold sm:w-auto"
                  style={{ borderColor: "var(--c-line)" }}
                >
                  Prüfen & veröffentlichen
                </Link>
                <form action={rejectItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="w-full px-5 py-4 text-center font-display text-[15px] font-semibold text-accent sm:w-auto"
                  >
                    Verwerfen
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {published.length > 0 && (
        <>
          <h2 className="mt-12 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">Zuletzt veröffentlicht</h2>
          <ul className="mt-4 flex flex-col">
            {published.map((item) => (
              <li key={item.id} className="border-t py-3" style={{ borderColor: "var(--c-line)" }}>
                <p className="text-[14px] text-ink-2">{item.headlineDe}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  {CATEGORY_LABELS[item.category]} · {item.origin === "feed" ? "Aus Feed" : "Manuell"}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
