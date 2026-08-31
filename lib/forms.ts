import { z } from "zod";
import { BRANCHEN } from "@/lib/members";

/**
 * Anti-spam without a third-party service: a honeypot field real visitors
 * never see or fill, plus a minimum time between when the form rendered and
 * when it was submitted. Both checks fail "successfully" from the caller's
 * point of view (see the route handlers) — a bot that trips either one gets
 * a normal-looking success response, not a signal to try harder.
 */
export const MIN_SUBMIT_MS = 4000;

// Deliberately NOT constrained to an empty string here: a bot that fills
// this field must still pass schema validation so looksLikeSpam() below can
// hand it a normal-looking success response instead of a validation error
// that would tell it exactly which field gave it away.
const honeypot = z.string().optional().or(z.literal(""));
const startedAt = z.coerce.number();

export const membershipSchema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(200),
  betrieb: z.string().trim().min(2, "Bitte geben Sie den Namen des Betriebs an.").max(200),
  branche: z.enum(BRANCHEN as [string, ...string[]], { message: "Bitte wählen Sie eine Branche." }),
  adresse: z.string().trim().min(5, "Bitte geben Sie die Adresse des Betriebs an.").max(300),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  telefon: z.string().trim().max(50).optional().or(z.literal("")),
  nachricht: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Bitte bestätigen Sie die Einwilligung zur Verarbeitung." }),
  website: honeypot,
  startedAt,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(200),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  nachricht: z.string().trim().min(5, "Bitte geben Sie eine Nachricht ein.").max(2000),
  consent: z.literal(true, { message: "Bitte bestätigen Sie die Einwilligung zur Verarbeitung." }),
  website: honeypot,
  startedAt,
});

export type MembershipInput = z.infer<typeof membershipSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

/**
 * True if the submission is spam: honeypot filled in, or submitted faster
 * than a human plausibly could. Genuine validation errors (bad email, empty
 * required field) still surface to the user — only this check gets the
 * silent fake-success treatment, so a bot has nothing to learn from a retry.
 */
export function looksLikeSpam(data: { website?: string; startedAt: number }): boolean {
  if (data.website) return true;
  if (Date.now() - data.startedAt < MIN_SUBMIT_MS) return true;
  return false;
}
