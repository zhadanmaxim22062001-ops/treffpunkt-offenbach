# Parked for v2

Everything here was built and working in v1 development, then cut from the
v1 release when the project scope was deliberately narrowed to "no external
services" for the first deploy. Nothing here was deleted — it was moved out
of `app/`, `components/`, and `lib/` so it stops being live code (Next.js
only routes what's under `app/`; TypeScript is told to skip this directory
in `tsconfig.json`'s `exclude`), while staying fully intact and git-tracked
for when v2 brings the database back.

One piece of parked-but-unused code did **not** move here and stays exactly
where it is, untouched — it type-checks cleanly on its own with no broken
cross-references, unlike the files below, which do reference each other and
had to move together:

- `lib/db/`, `drizzle/`, `drizzle.config.ts` — the OF-Radar Postgres schema

`lib/mail.ts`, `lib/forms.ts`, `components/ContactForm.tsx` and
`components/IcsDownloadButton.tsx` are no longer part of this list — the
first three are live now (the real /kontakt form, added directly to v1
rather than waiting for v2 — see the repo's main README for
SMTP_HOST/PORT/USER/PASS/MAIL_TO), and IcsDownloadButton always was (event
`.ics` downloads need no external service). `lib/mail.ts` sends via the
association's own SMTP mailbox (nodemailer), not Resend — the `resend`
package and `RESEND_API_KEY` were removed when that landed.

## What's here and where it goes back

| Parked at | Restore to |
|---|---|
| `app-admin/layout.tsx` | `app/admin/layout.tsx` |
| `app-admin/radar/` | `app/admin/radar/` |
| `app-api/mitglied-werden/route.ts` | `app/api/mitglied-werden/route.ts` |
| `components-admin/` | `components/admin/` |
| `lib-radar/queries.ts` | `lib/radar/queries.ts` |
| `lib-radar/validation.ts` | `lib/radar/validation.ts` |

Restoring `app-api/mitglied-werden/route.ts` also means wiring
`ContactForm` into `/mitglied-werden` the same way it's already wired into
`/kontakt` — see that page for the pattern (`endpoint`, `extraFields`,
`consentText`, `fallbackContact`).

## Restoring for v2

1. Move each path above back to its original location.
2. Remove `_v2-parked` from `tsconfig.json`'s `exclude` array.
3. Restore `proxy.ts`'s real matcher (`matcher: ["/admin/:path*"]`) — see the
   comment in that file.
4. Everything else (Neon setup, `DATABASE_URL`, `ADMIN_PASSWORD`) is
   unchanged from what v1's README already documented for OF-Radar.
