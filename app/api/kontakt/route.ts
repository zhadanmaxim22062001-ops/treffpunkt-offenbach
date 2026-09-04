import { NextResponse } from "next/server";
import { contactSchema, looksLikeSpam } from "@/lib/forms";
import { sendFormEmail } from "@/lib/mail";
import { isRateLimited } from "@/lib/rate-limit";

// nodemailer needs real Node APIs (net/tls) — not Edge-compatible. Region
// is already pinned to fra1 project-wide in vercel.json; the route-level
// `preferredRegion` export is deprecated in this Next version (see the
// build's own deprecation warning) — don't re-add it here.
export const runtime = "nodejs";

/**
 * Nothing here is persisted: this handler validates, sends, and forgets.
 * No database write, and deliberately no log line that contains the
 * message body or the sender's address — only enough to see, from the
 * Vercel function logs, that a send failed and roughly why.
 *
 * Accepts two request shapes so the form works with and without
 * JavaScript: a JSON body (the fetch-based submit in components/
 * ContactForm.tsx) or a native application/x-www-form-urlencoded POST (a
 * browser submitting the plain <form action="/api/kontakt" method="post">
 * with no JS to intercept it). The response shape follows the request:
 * JSON in, JSON back; a plain form POST in, a 303 redirect to a
 * server-rendered state on /kontakt back — see respondSuccess/respondError.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let raw: Record<string, unknown>;
  if (isJson) {
    const body = await request.json().catch(() => null);
    if (!body) return respondError(isJson, request, { message: "Ungültige Anfrage." }, 400);
    raw = body;
  } else {
    const form = await request.formData().catch(() => null);
    if (!form) return respondError(isJson, request, { message: "Ungültige Anfrage." }, 400);
    raw = Object.fromEntries(form.entries());
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
    }
    return respondError(isJson, request, { errors }, 400);
  }

  const data = parsed.data;

  // Honeypot filled, or submitted faster than a human plausibly could —
  // both get a normal-looking success so a bot learns nothing from a retry.
  if (looksLikeSpam(data)) {
    return respondSuccess(isJson, request);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return respondError(
      isJson,
      request,
      { message: "Zu viele Anfragen von Ihrer Adresse. Bitte versuchen Sie es in einigen Minuten erneut." },
      429,
    );
  }

  try {
    await sendFormEmail({
      subject: `Kontaktanfrage über treffpunkt-offenbach.com — ${data.name}`,
      replyTo: data.email,
      text: buildMailBody(data),
    });
  } catch (err) {
    console.error("kontakt: SMTP send failed —", err instanceof Error ? err.name : "unknown error");
    return respondError(
      isJson,
      request,
      {
        message:
          "Die Nachricht konnte nicht gesendet werden. Bitte schreiben Sie uns direkt an info@treffpunkt-offenbach.com.",
      },
      502,
    );
  }

  return respondSuccess(isJson, request);
}

function buildMailBody(data: { name: string; email: string; telefon?: string; unternehmen?: string; nachricht: string }): string {
  const lines = [`Name: ${data.name}`, `E-Mail: ${data.email}`];
  if (data.telefon) lines.push(`Telefon: ${data.telefon}`);
  if (data.unternehmen) lines.push(`Unternehmen: ${data.unternehmen}`);
  lines.push("", data.nachricht);
  return lines.join("\n");
}

function respondSuccess(isJson: boolean, request: Request) {
  if (isJson) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL("/kontakt?gesendet=1", request.url), 303);
}

/**
 * The no-JS redirect path is deliberately generic (a status flag, never the
 * submitted values) — echoing name/email/message back through a URL query
 * string would put them in Vercel's own request logs and the visitor's
 * browser history, which is exactly the "no log line with the message
 * body" guarantee this route is supposed to hold everywhere else. The
 * honest cost: a no-JS visitor whose submission fails validation has to
 * retype it. The JS path doesn't have this problem — the form component
 * keeps the typed values in place and shows the real per-field errors.
 */
function respondError(
  isJson: boolean,
  request: Request,
  payload: { message?: string; errors?: Record<string, string> },
  status: number,
) {
  if (isJson) return NextResponse.json({ ok: false, ...payload }, { status });
  return NextResponse.redirect(new URL("/kontakt?fehler=1", request.url), 303);
}
