"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BRANCHEN } from "@/lib/members";

type ExtraField = "betrieb" | "branche" | "adresse" | "telefon" | "unternehmen";

const FIELD_LABELS: Record<ExtraField, string> = {
  betrieb: "Betrieb",
  branche: "Branche",
  adresse: "Adresse",
  telefon: "Telefon",
  unternehmen: "Unternehmen",
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Shared by /mitglied-werden (all fields) and /kontakt (name, email, phone,
 * company, message). Posts via fetch as JSON so the success/error state can
 * render in place — but the <form> also carries a real action/method, and
 * the honeypot + timing fields are real form fields rather than JS-injected
 * ones, so a visitor with JavaScript disabled still gets a working submit:
 * the browser POSTs application/x-www-form-urlencoded straight to
 * `endpoint`, which detects the content type and responds with a redirect
 * instead of JSON — see app/api/kontakt/route.ts.
 *
 * `noValidate` is only ever true AFTER hydration (see `hydrated` below): a
 * no-JS visitor gets the browser's own native required/type/length
 * validation for free (it can't lose typed values — the browser just
 * refuses to submit), while a JS-enabled visitor gets this component's own
 * richer, inline error messages instead of native validation bubbles.
 */
export function ContactForm({
  endpoint,
  extraFields = [],
  consentText,
  submitLabel = "Absenden",
  fallbackContact,
}: {
  endpoint: string;
  extraFields?: ExtraField[];
  consentText: ReactNode;
  submitLabel?: string;
  /** Shown next to a failed send — a way to reach the association that doesn't depend on this form working. */
  fallbackContact?: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const firstErrorFieldRef = useRef<string | null>(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status !== "error" || !firstErrorFieldRef.current || !formRef.current) return;
    const el = formRef.current.elements.namedItem(firstErrorFieldRef.current);
    if (el instanceof HTMLElement) el.focus();
  }, [status, errors]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

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
        const nextErrors: Record<string, string> = data.errors ?? {};
        setErrors(nextErrors);
        setMessage(data.message ?? null);
        firstErrorFieldRef.current = Object.keys(nextErrors)[0] ?? null;
        setStatus("error");
      }
    } catch {
      setMessage("Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
      firstErrorFieldRef.current = null;
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="border p-6 outline-none"
        style={{ borderColor: "var(--c-accent)", backgroundColor: "var(--c-accent-soft)" }}
      >
        <p className="font-display text-[16px] font-semibold" style={{ color: "var(--c-accent)" }}>
          Danke, Ihre Nachricht ist angekommen.
        </p>
        <p className="mt-2 text-[14px] text-ink-2">Wir melden uns so bald wie möglich bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      action={endpoint}
      method="post"
      noValidate={hydrated}
      className="flex flex-col gap-5"
    >
      {/* Honeypot: hidden with CSS, not type="hidden" — some bots skip
          type="hidden" fields on purpose, and this needs to look like a
          normal field to a script filling the form programmatically while
          staying invisible and unreachable (tabIndex -1) to a real
          visitor. Bots that fill every field in a form often fill this
          one too. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {/* Real data, not camouflage — computed at render (server-render for
          a no-JS visitor, same effect), read server-side to reject
          anything submitted implausibly fast. */}
      <input type="hidden" name="startedAt" value={startedAt} />

      <Field label="Name" name="name" required maxLength={100} error={errors.name} />
      {extraFields.includes("betrieb") && <Field label="Betrieb" name="betrieb" required error={errors.betrieb} />}
      {extraFields.includes("unternehmen") && <Field label="Unternehmen" name="unternehmen" error={errors.unternehmen} />}
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
      {extraFields.includes("adresse") && (
        <Field label="Adresse (Straße, Hausnummer, PLZ, Ort)" name="adresse" required error={errors.adresse} />
      )}
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
          required
          minLength={10}
          maxLength={3000}
          aria-invalid={errors.nachricht ? true : undefined}
          aria-describedby={errors.nachricht ? "nachricht-error" : undefined}
          className="border bg-paper px-3 py-2 font-body text-[15px]"
          style={{ borderColor: errors.nachricht ? "var(--c-accent)" : "var(--c-line)" }}
        />
        {errors.nachricht && (
          <p id="nachricht-error" className="font-mono text-[11px] text-accent">
            {errors.nachricht}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-2">
        <input
          type="checkbox"
          name="consent"
          required
          value="true"
          className="mt-1"
          aria-describedby={errors.consent ? "consent-error" : undefined}
        />
        <span>{consentText}</span>
      </label>
      {errors.consent && (
        <p id="consent-error" className="font-mono text-[11px] text-accent">
          {errors.consent}
        </p>
      )}

      {status === "error" && (
        // role="alert" already carries an implicit assertive live region —
        // an explicit aria-live here would just conflict with it.
        <div
          role="alert"
          className="border p-4"
          style={{ borderColor: "var(--c-signal)", backgroundColor: "var(--c-signal-soft)" }}
        >
          {message && (
            <p className="font-mono text-[12px]" style={{ color: "var(--c-signal)" }}>
              {message}
            </p>
          )}
          {fallbackContact && <p className="mt-1 text-[13px] text-ink-2">{fallbackContact}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="self-start bg-accent px-5 py-3 font-display text-[14px] font-semibold text-on-accent transition-[filter] duration-[120ms] hover:brightness-110 disabled:opacity-60"
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
  maxLength,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;
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
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className="border bg-paper px-3 py-2 font-display text-[14px]"
        style={{ borderColor: error ? "var(--c-accent)" : "var(--c-line)" }}
      />
      {error && (
        <p id={errorId} className="font-mono text-[11px] text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
