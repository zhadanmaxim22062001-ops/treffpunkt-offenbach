# treffpunkt-offenbach

Сайт Gewerbeverein Treffpunkt Offenbach e. V. Next.js 16 (App Router), TypeScript,
Tailwind v4, motion, lenis. Деплой — Vercel, регион fra1.

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # прод-сборка, проходит без ошибок
```

## Что уже сделано

- дизайн-система в токенах: `app/globals.css`, три темы (system / light / dark);
- шрифты Archivo, Newsreader, IBM Plex Mono — **локально**, через `next/font/local`;
  обращений к серверам Google нет вообще, это принципиально для DSGVO;
- знак OF-Siegel: `components/Logo.tsx`, порог переключения версий 64 px зашит внутрь;
- шапка с навигацией и переключателем темы, подвал, скип-линк, JSON-LD Organization;
- главная целиком: герой с прочерчиванием знака, Kennzahlen со счётчиком, три карточки,
  тизер OF-Radar, бегущая строка членов, ближайшее событие, инвертированная полоса CTA;
- `/styleguide` — все компоненты на одной странице для сверки;
- страницы `/impressum` и `/datenschutz` с настоящими данными союза;
- заглушки для `/verein`, `/mitglieder`, `/veranstaltungen`, `/radar`, `/kontakt`,
  `/mitglied-werden` — следующие этапы;
- 301-редиректы со старых `.php`-адресов в `next.config.ts`.

## Что осталось

1. `/mitglieder` — каталог с фильтром по отрасли и улице, страницы участников, LocalBusiness JSON-LD.
2. `/mitglied-werden` — выгоды, таблица взносов, форма через Route Handler + Resend.
3. `/veranstaltungen` — полноценные страницы событий.
4. **OF-Radar**: схема в Postgres (Neon + Drizzle) → `/api/radar/ingest` по Vercel Cron →
   классификация через Anthropic API → редакторский шлюз `/admin/radar` → публичный UI
   с фильтрами, счётчиками дедлайнов и календарём частоты. Сейчас работает на seed-данных
   из `data/content.ts`.
5. Проход по доступности и производительности, OG-картинки через `next/og`.

## Переменные окружения

Понадобятся только на этапе OF-Radar:

```
DATABASE_URL=          # Neon
ANTHROPIC_API_KEY=     # классификация новостей
RESEND_API_KEY=        # письма формы и дайджест
CRON_SECRET=           # защита /api/radar/ingest
ADMIN_PASSWORD=        # вход в /admin/radar
NEXT_PUBLIC_SITE_URL=
```

## Что нужно от правления

- точное число членов и список участников с согласием на публикацию
  (сейчас в `data/members.json` лежат платцхалтеры, помеченные TODO-COPY);
- номер в Vereinsregister и год основания — для Impressum;
- размер взносов для открытой таблицы;
- вычитка немецких текстов: они написаны как рабочие черновики.

## Замеченное при сборке

- `useReducedMotion` в motion v13 не всегда успевает отработать до первой отрисовки,
  поэтому блоки с `data-reveal` дополнительно подстрахованы правилом в `<noscript>`:
  без JS контент виден всегда, а не остаётся на `opacity: 0`.
- lenis перехватывает `window.scrollTo`, поэтому якорные ссылки и программный скролл
  нужно будет пускать через `lenis.scrollTo` — учесть при вёрстке `/radar`.
