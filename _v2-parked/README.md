# Parked for v2

Everything here was built and working in v1 development, then cut from the
v1 release when the project scope was deliberately narrowed to "no external
services" for the first deploy. Nothing here was deleted — it was moved out
of `app/`, `components/`, and `lib/` so it stops being live code (Next.js
only routes what's under `app/`; TypeScript is told to skip this directory
in `tsconfig.json`'s `exclude`), while staying fully intact and git-tracked
for when v2 brings the database back.

Several other pieces of parked-but-unused code did **not** move here and
stay exactly where they are, untouched — they type-check cleanly on their
own with no broken cross-references, unlike the files below, which do
reference each other and had to move together:

- `lib/db/`, `drizzle/`, `drizzle.config.ts` — the OF-Radar Postgres schema
- `lib/mail.ts`, `lib/forms.ts` — the Resend wrapper and zod form schemas
- `components/ContactForm.tsx`, `components/IcsDownloadButton.tsx` — the
  latter is still active (event `.ics` downloads need no external service)

## What's here and where it goes back

| Parked at | Restore to |
|---|---|
| `app-admin/layout.tsx` | `app/admin/layout.tsx` |
| `app-admin/radar/` | `app/admin/radar/` |
| `app-api/kontakt/route.ts` | `app/api/kontakt/route.ts` |
| `app-api/mitglied-werden/route.ts` | `app/api/mitglied-werden/route.ts` |
| `components-admin/` | `components/admin/` |
| `lib-radar/queries.ts` | `lib/radar/queries.ts` |
| `lib-radar/validation.ts` | `lib/radar/validation.ts` |

Restoring the API routes also means wiring `ContactForm` back into
`/mitglied-werden` and `/kontakt` and reinstating `RESEND_API_KEY` — see the
git history around the "CUT FROM v1" commit for exactly what those two pages
looked like with the form in place.

## Restoring for v2

1. Move each path above back to its original location.
2. Remove `_v2-parked` from `tsconfig.json`'s `exclude` array.
3. Restore `proxy.ts`'s real matcher (`matcher: ["/admin/:path*"]`) — see the
   comment in that file.
4. Everything else (Neon setup, `DATABASE_URL`, `ADMIN_PASSWORD`) is
   unchanged from what v1's README already documented for OF-Radar.
