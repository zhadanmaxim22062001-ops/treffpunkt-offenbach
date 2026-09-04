import nodemailer from "nodemailer";

/**
 * SMTP via the association's own mailbox (nodemailer), not a third-party
 * transactional-email service — this introduces no new processor under
 * DSGVO, since the mail simply goes to the provider info@treffpunkt-
 * offenbach.com already sits with. SMTP_HOST/PORT were determined from the
 * domain's own public MX and SPF records (mx00/mx01.ionos.de,
 * "v=spf1 include:_spf-eu.ionos.com") — IONOS's standard submission host
 * for hosted mailboxes is smtp.ionos.de:465. SMTP_USER, SMTP_PASS and
 * MAIL_TO are real secrets/board decisions and are never guessed — they
 * come from Vercel's environment only; sendFormEmail throws a clear error
 * if any of them is missing rather than silently no-op'ing.
 */
function transporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }
  return { transport: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), user };
}

export async function sendFormEmail(params: { subject: string; replyTo: string; text: string }): Promise<void> {
  const { transport, user } = transporter();
  const to = process.env.MAIL_TO ?? user;
  await transport.sendMail({
    // Always the association's own authenticated mailbox, never the
    // visitor's address — sending "from" a domain we don't control fails
    // SPF/DKIM checks at the receiving end and lands in spam. The visitor's
    // address goes in Reply-To instead, so the board can just hit reply.
    from: user,
    to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
  });
}
