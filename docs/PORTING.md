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
| `public/manifest.webmanifest`, `public/icons/icon.svg`, `index.html` | ported | product name, neutral colour, relative paths, English |
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
