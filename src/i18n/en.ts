// Every text the app shows, in English (v1). To add a language later: copy this file to e.g. de.ts, type it
// as `Strings` (index.ts) so a missing key fails the build, translate, and add it to LANGS in index.ts.

export const en = {
  appName: "Kids' Learning Studio",
  developedBy: 'Developed by Oluwasedago',
  common: {
    back: 'Back',
    close: 'Close',
    save: 'Save',
    soon: 'Soon',
  },
  nav: {
    home: 'Home',
    learn: 'Learn',
    games: 'Games',
    radio: 'Radio',
    parents: 'Parents',
  },
  status: {
    battery: (n: number) => `Battery ${n}%`,
    charging: 'charging',
    online: 'Online',
    offline: 'Offline',
  },
  home: {
    greeting: (part: 'morning' | 'afternoon' | 'evening', name: string) => {
      const who = name ? `, ${name}` : ''
      return part === 'morning' ? `Good morning${who}!` : part === 'afternoon' ? `Hello${who}!` : `Good evening${who}!`
    },
    preview: 'Preview build',
    previewText: 'This is the app shell. Missions, stars, games and the setup wizard arrive in the next steps.',
  },
  storage: {
    title: 'Saved on this device',
    persisted: 'Kept safe: the browser will not clear it on its own.',
    notPersisted: 'The browser may clear it when space runs low. Install the app and make backups.',
    unknown: 'This browser cannot say whether it keeps the data.',
    used: (mb: string) => `${mb} MB used`,
  },
  screens: {
    soon: 'Coming in the next step',
  },
  about: {
    privacy: 'No accounts, no tracking, no server. Everything stays on this device.',
    licence: 'Free and open source (MIT licence).',
  },
}

export type Strings = typeof en
