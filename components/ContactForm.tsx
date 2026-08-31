"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { BRANCHEN } from "@/lib/members";

type ExtraField = "betrieb" | "branche" | "adresse" | "telefon";

const FIELD_LABELS: Record<ExtraField, string> = {
  betrieb: "Betrieb",
  branche: "Branche",
  adresse: "Adresse",
  telefon: "Telefon",
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Shared by /mitglied-werden (all fields) and /kontakt (name, email,
 * message only). Posts via fetch rather than a native form submit so the
 * success state can render in place, with no redirect.
 */
export function ContactForm({
  endpoint,
  extraFields = [],
  consentText,
  submitLabel = "Absenden",
}: {
  endpoint: string;
  extraFields?: ExtraField[];
  consentText: ReactNode;
  submitLabel?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.startedAt = String(startedAt);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrors(data.errors ?? {});
        setMessage(data.message ?? null);
      }
    } catch {
      setStatus("error");
      setMessage("Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    }
  }

  if (status === "success") {
    return (
      <div className="border p-6" style={{ borderColor: "var(--c-river)", backgroundColor: "var(--c-river-soft)" }}>
        <p className="font-display text-[16px] font-semibold" style={{ color: "var(--c-river)" }}>
          Danke, Ihre Nachricht ist angekommen.
        </p>
        <p className="mt-2 text-[14px] text-ink-2">Wir melden uns so bald wie möglich bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot: real visitors never see this field. Bots that fill every field in a form often fill this too. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Name" name="name" required error={errors.name} />
      {extraFields.includes("betrieb") && <Field label="Betrieb" name="betrieb" required error={errors.betrieb} />}
      {extraFields.includes("branche") && (
        <div className="flex flex-col gap-1">
          <label htmlFor="branche" className="eyebrow">
            Branche
          </label>
          <select
            id="branche"
            name="branche"
            required
            defaultValue=""
            className="border bg-paper px-3 py-2 font-display text-[14px]"
            style={{ borderColor: errors.branche ? "var(--c-accent)" : "var(--c-line)" }}
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {BRANCHEN.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errors.branche && <p className="font-mono text-[11px] text-accent">{errors.branche}</p>}
        </div>
      )}
      {extraFields.includes("adresse") && <Field label="Adresse (Straße, Hausnummer, PLZ, Ort)" name="adresse" required error={errors.adresse} />}
      <Field label="E-Mail" name="email" type="email" required error={errors.email} />
      {extraFields.includes("telefon") && <Field label="Telefon" name="telefon" type="tel" error={errors.telefon} />}

      <div className="flex flex-col gap-1">
        <label htmlFor="nachricht" className="eyebrow">
          Nachricht
        </label>
        <textarea
          id="nachricht"
          name="nachricht"
          rows={5}
          className="border bg-paper px-3 py-2 font-body text-[15px]"
          style={{ borderColor: errors.nachricht ? "var(--c-accent)" : "var(--c-line)" }}
        />
        {errors.nachricht && <p className="font-mono text-[11px] text-accent">{errors.nachricht}</p>}
      </div>

      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-2">
        <input type="checkbox" name="consent" required value="true" className="mt-1" />
        <span>{consentText}</span>
      </label>
      {errors.consent && <p className="font-mono text-[11px] text-accent">{errors.consent}</p>}

      {message && <p className="font-mono text-[12px] text-accent">{message}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="self-start bg-accent px-5 py-3 font-display text-[14px] font-semibold text-white transition-[filter] duration-[120ms] hover:brightness-110 disabled:opacity-60"
      >
        {status === "submitting" ? "Wird gesendet …" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="eyebrow">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="border bg-paper px-3 py-2 font-display text-[14px]"
        style={{ borderColor: error ? "var(--c-accent)" : "var(--c-line)" }}
      />
      {error && <p className="font-mono text-[11px] text-accent">{error}</p>}
    </div>
  );
}
