import { Resend } from "resend";
import { VEREIN } from "@/data/verein";

/**
 * Until the sending domain is verified in Resend (SPF/DKIM/DMARC — see
 * README), Resend only accepts mail FROM its own onboarding@resend.dev
 * address and only delivers TO the email of the Resend account owner. That
 * default lets development and a first real test run happen before DNS is
 * set up; once the domain is verified, set RESEND_FROM_EMAIL to a real
 * @treffpunkt-offenbach.com address via the environment.
 */
const FROM = process.env.RESEND_FROM_EMAIL ?? "Treffpunkt Offenbach <onboarding@resend.dev>";
const TO = process.env.RESEND_TO_EMAIL ?? VEREIN.email;

function client(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

export async function sendFormEmail(params: { subject: string; replyTo: string; text: string }): Promise<void> {
  const resend = client();
  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
  });
  if (error) throw new Error(error.message);
}
