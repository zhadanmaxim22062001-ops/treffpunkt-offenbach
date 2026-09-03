"use client";

import { useState, type FormEvent } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A form with no backend: on submit it assembles a subject/body and opens
 * the visitor's own mail client via a mailto: URL, then stops — nothing is
 * sent to us or anyone else over the network, no cookie, no processor. That
 * keeps /datenschutz accurate as written. Same field set (Name, E-Mail,
 * Nachricht) and validation styling as the parked components/ContactForm.tsx
 * so swapping this for a real backend later is a drop-in, not a redesign.
 */
export function MailtoContactForm({ toEmail }: { toEmail: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const nachricht = String(form.get("nachricht") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Bitte geben Sie Ihren Namen an.";
    if (!email) nextErrors.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Das sieht nicht nach einer gültigen E-Mail-Adresse aus.";
    if (!nachricht) nextErrors.nachricht = "Bitte schreiben Sie uns ein paar Worte.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const subject = `Kontaktanfrage von ${name}`;
    const body = `${nachricht}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" name="name" required error={errors.name} />
      <Field label="E-Mail" name="email" type="email" required error={errors.email} />

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

      <p className="font-mono text-[12px] text-muted">
        Öffnet Ihr eigenes E-Mail-Programm mit einem vorausgefüllten Entwurf. Die Nachricht geht direkt von dort an
        uns — diese Website selbst verarbeitet oder speichert nichts davon.
      </p>

      <button
        type="submit"
        className="self-start bg-accent px-5 py-3 font-display text-[14px] font-semibold text-on-accent transition-[filter] duration-[120ms] hover:brightness-110"
      >
        E-Mail öffnen
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
