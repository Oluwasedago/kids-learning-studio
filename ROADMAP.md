# Roadmap

Legend: **done** · **to verify** (built, needs checking on a device or with a source) · **planned**

## v1 (now)

| Area | Status |
|---|---|
| App shell, offline start, GitHub Pages deploy, brand icons | done |
| Setup wizard (birth month + year only), demo, restore on first start | done |
| Two-layer access control (on/off → earn/open, unlock for today with PIN) | done |
| Missions: one try per question, no hints, pass mark 5 of 8, stars, earned time | done |
| Skills ladder by age, adaptive level (maths, English, world, patterns) | done |
| Skill-to-stage placement and US / Berlin equivalents | to verify against each curriculum framework |
| Animal facts, "Did you know?" facts, capitals, flag colours | to verify (second check of every fact) |
| Games: memory, word builder, puzzle, snake | done |
| Media: Fun Kids radio | to verify: the station's terms for other players (no terms published) |
| Media: LibriVox stories (public domain) | done; recordings are public domain in the USA, to verify per country |
| Media: parent-approved YouTube videos (youtube-nocookie) | done |
| Family calls (tel:, WhatsApp, FaceTime links) | to verify which links open on Fire, Android, iPad |
| Reports (day/week/month, needs help, mistakes) + email via the parent's mail app | done; mailto on Fire to verify |
| Backup / restore + reminder; persistent storage | done; share sheet on iPad and storage on Fire to verify |
| Reading aloud: best voice on the device, parent voice picker | done; voices on Fire to verify |
| Install page (device steps, QR code) | done; Fire and Amazon Kids steps to verify |

## v1.1 (plugins, each optional and off by default)

- Recorded voice clips for the fixed words (letters, numbers, animals, fruit) made with an open-source neural
  voice, so reading aloud sounds natural on every device and offline (licence of each voice to check).
- Backup to the parent's own Google Drive (needs a sign-in; to verify).
- Calendar links (needs a small proxy because calendars do not allow browser access).
- Automatic email reports through the parent's own email service.
- AI-made lessons with the parent's own API key.
- School-notices plugin.
- More languages (the strings are in one file: `src/i18n/en.ts`).
- More stories (other public-domain recordings) and stations, after checking their terms.

## v2 (native)

- Native app with alarms and bedtime lock, a toddler mode, and app-store releases.
