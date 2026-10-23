# Kids' Learning Studio

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/png/wordmark-dark.png">
    <img src="brand/png/wordmark-light.png" alt="Kids' Learning Studio" width="360">
  </picture>
</p>

A free learning home screen for children (about 4–10 years) that parents install from a browser link on an
Amazon Fire, Android tablet or iPad. Missions earn stars, stars earn screen time, and everything stays on the
family's own device: no accounts, no tracking, no server.

Developed by Oluwasedago.

> **Status: v1 in development.** Usable for testing. Some items are still being checked on real devices
> (see [ROADMAP.md](ROADMAP.md)).

- **Install:** https://oluwasedago.github.io/kids-learning-studio/install.html (steps for your device, QR code)
- **Open the app:** https://oluwasedago.github.io/kids-learning-studio/
- **Try the demo** (made-up data, parent PIN 1234): https://oluwasedago.github.io/kids-learning-studio/?demo

## What it does

- **Missions every day.** Rounds of 10, 25 or 50 questions (the parent chooses) in maths, English, the world and
  patterns. One try per question: a right answer turns green, a wrong one red, and the right answer is never given
  away; 70 % right passes and earns a star per 10 questions (10 → 1, 25 → 3, 50 → 5). Lessons follow the child's school class (set by the
  parent: Cambridge, England, US, Germany or Nigeria) on a skills ladder aligned to
  Cambridge Primary stages (with approximate US grade and Berlin Klasse equivalents) and adapt: two strong
  rounds move a step up, a weak round a step down.
- **Learning streak.** Days in a row with a passed mission, like Duolingo: every 7 days earn a streak freeze
  that saves a missed day, and milestones (3, 7, 14, 30 … days) are celebrated.
- **Stars earn time.** Each star unlocks minutes for games and videos, up to a daily limit the parent sets.
- **Two layers of parent control.** Every item can be switched off (hidden), and every item that is on is either
  *open* or *earned* (locked until missions are done). A parent can also unlock an item for today with the PIN.
- **Games:** memory, word builder, picture puzzle, snake.
- **Media:** children's radio, classic stories read aloud (public domain), and only the YouTube videos a parent
  adds. **Family calls:** one tap to call someone the parent added.
- **Did you know?** A random fact about space, science, nature, the world or history.
- **Reports for parents:** day, week or month; skills that need help and recent wrong answers; sent by email from
  the parent's own mail app.
- **English, Deutsch, Français.** The app follows the device language; parents can change it. Maths, the world,
  patterns and the facts are in the chosen language; the English lessons and the word games stay in English.
- **Backup and restore** in one file, with a reminder; data is kept on the device (persistent storage).

## Privacy

Everything the child does is saved only on the device (in the browser's own storage). There are no accounts,
no analytics and no adverts in the app. The app contacts other services only when the child plays something
from them: the radio station's stream, the Internet Archive for stories, and YouTube for videos a parent added.
Reports leave the device only when a parent sends them from their own mail app.

## Credits and licences

- Code: [MIT](LICENSE).
- Pictures: [Microsoft Fluent Emoji](public/emoji/CREDITS.md) (MIT). Fonts: Andika and Fredoka (SIL Open Font
  License). Logo: [brand/](brand/README.md) (MIT, with the code).
- Stories: LibriVox recordings (public domain), hosted by the Internet Archive. Radio: Die Maus (WDR), Fun Kids, Mon Petit France Inter (Radio France), Radio Pomme d’Api.
  Details and the status of each source: [docs/CONTENT.md](docs/CONTENT.md).
- QR codes on the install page: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT).

## For contributors

You need [Node.js](https://nodejs.org) 24 or newer.

```sh
npm install        # once
npm run dev        # the app at http://localhost:5173 (install page: /install.html)
npm test           # unit tests
npm run lint       # code checks
npm run build      # the finished site in dist/
```

Every push to `main` is checked, built and published to GitHub Pages by `.github/workflows/deploy.yml`.

Before your first commit, turn on the privacy check (it blocks private words and secrets):

```sh
git config core.hooksPath .githooks
cp .private-words.example.txt .private-words.txt   # then list your own family's names, school, etc.
```

Where things are: `src/access` (two-layer access control), `src/lessons` (skills ladders, facts),
`src/missions`, `src/games`, `src/media`, `src/parent`, `src/setup` (wizard, demo), `src/reports`,
`src/data` (storage, backup), `src/i18n/en.ts` (every text the app shows). How it fits together:
[docs/product-map.html](docs/product-map.html).
