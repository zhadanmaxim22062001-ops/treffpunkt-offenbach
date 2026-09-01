import { NextResponse } from "next/server";
import { membershipSchema, looksLikeSpam } from "@/lib/forms";
import { sendFormEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, message: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = membershipSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const data = parsed.data;

  // Bots that trip the honeypot or submit too fast get a normal-looking
  // success response — no email is sent, and nothing tells them what failed.
  if (looksLikeSpam(data)) {
    return NextResponse.json({ ok: true });
  }

  const lines = [
    `Name: ${data.name}`,
    `Betrieb: ${data.betrieb}`,
    `Branche: ${data.branche}`,
    `Adresse: ${data.adresse}`,
    `E-Mail: ${data.email}`,
    data.telefon ? `Telefon: ${data.telefon}` : null,
    "",
    data.nachricht || "(keine Nachricht)",
  ].filter((line): line is string => line !== null);

  try {
    await sendFormEmail({
      subject: `Neue Mitgliedsanfrage: ${data.betrieb}`,
      replyTo: data.email,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("mitglied-werden: failed to send email", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Die Nachricht konnte nicht gesendet werden. Bitte schreiben Sie uns direkt per E-Mail oder Telefon.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
