import { NextResponse } from "next/server";
import { contactSchema, looksLikeSpam } from "@/lib/forms";
import { sendFormEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, message: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const data = parsed.data;

  if (looksLikeSpam(data)) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendFormEmail({
      subject: `Neue Nachricht von ${data.name}`,
      replyTo: data.email,
      text: `Name: ${data.name}\nE-Mail: ${data.email}\n\n${data.nachricht}`,
    });
  } catch (err) {
    console.error("kontakt: failed to send email", err);
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
