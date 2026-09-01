import Link from "next/link";
import { ComposeForm } from "@/components/admin/ComposeForm";

export default function ComposePage() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8">
      <Link href="/admin/radar" className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
        ← Zurück
      </Link>
      <h1 className="mt-4 font-display text-[26px] font-extrabold tracking-[-0.02em]">Neue Meldung</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        Wird als Entwurf gespeichert. Auf der nächsten Seite können Sie sie noch einmal prüfen, bevor sie
        veröffentlicht wird.
      </p>
      <div className="mt-8">
        <ComposeForm />
      </div>
    </div>
  );
}
