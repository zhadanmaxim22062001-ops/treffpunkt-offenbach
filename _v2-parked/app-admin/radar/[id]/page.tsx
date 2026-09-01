import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/radar/queries";
import { publishItemAction, rejectItemAction, saveItemAction } from "@/app/admin/radar/actions";
import { EditForm } from "@/components/admin/EditForm";

export const dynamic = "force-dynamic";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const item = await getItemById(id);
  if (!item) notFound();

  const boundSave = saveItemAction.bind(null, id);
  const boundPublish = publishItemAction.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8">
      <Link href="/admin/radar" className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
        ← Zurück
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em]">Meldung prüfen</h1>
        <span
          className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]"
          style={{ background: "var(--c-paper-2)", color: "var(--c-muted)", border: "1px solid var(--c-line)" }}
        >
          {item.origin === "feed" ? "Aus Feed" : "Manuell"} · {item.status}
        </span>
      </div>

      <div className="mt-8">
        <EditForm
          saveAction={boundSave}
          publishAction={boundPublish}
          defaultValues={{
            category: item.category,
            headlineDe: item.headlineDe,
            summaryDe: item.summaryDe,
            actionDe: item.actionDe,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            urgency: item.urgency,
            deadline: item.deadline,
            audience: item.audience,
            streets: item.streets,
          }}
        />
      </div>

      {item.status === "draft" && (
        <form action={rejectItemAction} className="mt-6">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="w-full border px-6 py-5 font-display text-[16px] font-semibold text-accent sm:w-auto"
            style={{ borderColor: "var(--c-accent)" }}
          >
            Verwerfen
          </button>
        </form>
      )}
    </div>
  );
}
