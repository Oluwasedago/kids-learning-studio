# Porting record

This repo is built from an **allow-list**: each file below was copied from the private family app on purpose,
then cleaned (personal comments, names, places and server code removed). Nothing else was copied, and the
private app's history is not part of this repo.

## Step 1 · App shell, local storage, GitHub Pages

| Public file | Origin | What changed |
|---|---|---|
| `public/emoji/*.png`, `LICENSE.txt` | copied unchanged | Microsoft Fluent Emoji, MIT |
| `public/emoji/CREDITS.md` | rewritten | source and licence only |
| `public/sw.js` | ported | relative paths (works under `/kids-learning-studio/`); no login or `/api` handling |
| `public/manifest.webmanifest`, `index.html` | ported | product name, brand icons from `brand/` (copied to `public/icons/` at build), relative paths, English |
| `package.json`, `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json` | ported | no server proxy, no photo script, no calendar or image libraries; `base: './'` |
| `src/styles/global.css`, `src/app/Shell.css` | ported | `--pink` → `--accent`, Wi-Fi strength removed, comments neutral |
| `src/app/Shell.tsx`, `App.tsx`, `studio.ts`, `StudioData.tsx` | ported | no weather, school plan, calendar, radio or kiosk app; data from the device only |
| `src/app/Home.tsx` | new | placeholder home for Step 1 |
| `src/data/kv.ts` | ported | own database name; `kvKeys()` added for backups |
| `src/data/localDoc.ts` | new | replaces the server-synced document |
| `src/data/persist.ts` | new | `navigator.storage.persist()` and space used |
| `src/i18n/en.ts`, `index.ts` | ported | English only, one strings file per language |
| `src/shared/*` | ported | Fully Kiosk interface removed (battery: browser API only; network: online/offline only) |

## Not ported (by decision)

Fully Kiosk interface, Cloudflare Worker and Access login, family-dashboard link, school-plan scraping,
calendar feeds, Android apps shelf, device test page, the private app's photos and logos.

## Step 2 · Wizard, access control, missions, reports, backup

| Public file | Origin | What changed |
|---|---|---|
| `src/missions/MissionScreen.tsx`, `Flag.tsx`, `Missions.css` | ported | English only; questions come from the skills ladder; result moves the adaptive level |
| `src/lessons/*` | new (ideas from the private `missions/questions.ts`) | four subject ladders tagged by Cambridge stage, adaptive level, more flags, continents, capitals, English grammar steps |
| `src/lessons/data.ts` | ported from `learn/animals.ts`, `games/snake/snake.ts`, `missions/flags.ts` | English names only; animal facts rewritten so each fits one animal |
| `src/games/memory`, `builder`, `puzzle`, `snake` | ported | English only; the puzzle uses bundled animal pictures (no family photos); snake reads fruit names in English or stays silent |
| `src/games/GamesScreen.tsx`, `LearnScreen.tsx` | ported, much simplified | no web games in frames, no Android apps shelf; access control and earned time decide what opens |
| `src/progress/progress.ts`, `StarTrack.tsx` | ported | missions from enabled subjects; no school holidays; adaptive levels |
| `src/progress/usage.ts` | ported from `activity/activity.ts` | on the device only (no upload); counts earned time used |
| `src/parent/pin.ts`, `PinPad.tsx`, `ParentGate.tsx` | ported | PBKDF2 instead of one SHA-256 round; a pause after 5 wrong tries |
| `src/access/*`, `src/parent/editors.tsx`, `ParentScreen.tsx` | new | two-layer access control, parent screen |
| `src/setup/*`, `src/reports/*`, `src/data/backup.ts` | new | setup wizard, demo, reports with mailto, backup/restore |
| `src/audio/say.ts` | ported | browser voices only (no kiosk-app speech engine) |
