// The video library: a small, curated set of YouTube videos on how things are made and how things work, and
// live animal cams. Every video comes from the official channel of a well-known children's or science
// publisher (Sesame Street, SciShow Kids, Die Maus, C'est pas sorcier …) and was checked with YouTube's oEmbed
// (public and embeddable) on 24 Oct 2026. They play like parents' videos: inside the app, without YouTube's
// search or suggestions, and only with access to "Videos". Parents can hide the library (Parents → media).
// To check again or add videos: node scripts/check-videos.mjs (prints the channel and title of every id).

export type VideoShelf = 'made' | 'works' | 'cams'

export interface LibraryVideo {
  /** YouTube video id. */
  id: string
  title: string
  channel: string
  shelf: VideoShelf
  /** Language of the video: the app shows its own language first on each shelf. */
  lang: 'en' | 'de' | 'fr'
  /** A live stream (a camera); it can be dark at night where the animals live. */
  live?: boolean
}

export const VIDEO_SHELVES: VideoShelf[] = ['made', 'works', 'cams']

export const LIBRARY_VIDEOS: LibraryVideo[] = [
  // How things are made
  { id: 'ZQ_MEFVx5jM', title: 'Making Crayons', channel: 'Sesame Street', shelf: 'made', lang: 'en' },
  { id: 'lmiRjmbnn8Q', title: 'How Crayons are Made', channel: 'Discovery UK', shelf: 'made', lang: 'en' },
  { id: 'C3oiy9eekzk', title: 'LEGO Bricks in the Making', channel: 'The LEGO Group', shelf: 'made', lang: 'en' },
  { id: 'K1VfdXmqjN8', title: 'How It’s Made: Rubber Balls', channel: 'Science Channel', shelf: 'made', lang: 'en' },
  { id: '_asrhvc4dPg', title: 'How Balloons are Made', channel: 'Discovery UK', shelf: 'made', lang: 'en' },
  { id: 'AWp3IwBgeY8', title: 'How are pencils made?', channel: 'Mystery Science', shelf: 'made', lang: 'en' },
  { id: 'qqs3fxfmWr4', title: 'How Pencils Are Made', channel: 'Insider', shelf: 'made', lang: 'en' },
  { id: 'MhA6IYyj5Qo', title: 'How is a Book Made?', channel: 'Owlkids', shelf: 'made', lang: 'en' },
  { id: 'UOwk2QIfDqY', title: 'How is glass made?', channel: 'Mystery Science', shelf: 'made', lang: 'en' },
  { id: '0VEJCWvfhQg', title: 'How do they turn wood into paper?', channel: 'Mystery Science', shelf: 'made', lang: 'en' },
  { id: 'i2plIal6HmU', title: 'How Toothbrushes Are Made', channel: 'Insider', shelf: 'made', lang: 'en' },
  { id: 'Fp3qE360MXA', title: 'Wie wird Schokolade hergestellt?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: '3BpCtPL6D7M', title: 'Wie wird eine Fensterscheibe hergestellt?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'sXzeOjTx2cw', title: 'Wie kommt das Muster in die Murmel?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: '_CKck0D1cTw', title: 'Wie kommt die Füllung ins Bonbon?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'dMtraHXQRrg', title: 'Wie wird ein Gartenschlauch hergestellt?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'kn7nlFccjAk', title: 'Von der Haselnuss zur Nussnougatcreme', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'NaojZ8CBZ3M', title: 'Wie kommen die Streifen auf die Autobahn?', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'WLPy8TTaXo0', title: 'Das Geheimnis der Zauberstifte', channel: 'Die Maus (WDR)', shelf: 'made', lang: 'de' },
  { id: 'oe-WJhxgBqk', title: 'Les secrets du chocolat !', channel: 'C’est pas sorcier', shelf: 'made', lang: 'fr' },
  // How things work
  { id: 'VLpSxHwfU04', title: 'How Airplanes Fly!', channel: 'SciShow Kids', shelf: 'works', lang: 'en' },
  { id: 's236Q1nuWXg', title: 'Fun with Magnets!', channel: 'SciShow Kids', shelf: 'works', lang: 'en' },
  { id: 'Cm9ZkYTnCNE', title: 'How to Make a Rainbow', channel: 'SciShow Kids', shelf: 'works', lang: 'en' },
  { id: 'K7Oq9_DU1Mc', title: 'All About Volcanoes', channel: 'SciShow Kids', shelf: 'works', lang: 'en' },
  { id: 'tkFPyue5X3Q', title: 'How Does a Seed Become a Plant?', channel: 'SciShow Kids', shelf: 'works', lang: 'en' },
  { id: 'Q0LBegPWzrg', title: 'Energy', channel: 'Peekaboo Kidz (Dr. Binocs)', shelf: 'works', lang: 'en' },
  { id: 'ruM4Xxhx32U', title: 'How the heart actually pumps blood', channel: 'TED-Ed', shelf: 'works', lang: 'en' },
  { id: 'DgzxhDHjzms', title: 'What happens when you hit the gas', channel: 'TED-Ed', shelf: 'works', lang: 'en' },
  { id: 'pTd5nPFpjJY', title: 'Comment les avions volent-ils ?', channel: 'C’est pas sorcier', shelf: 'works', lang: 'fr' },
  { id: '0C-Gw-F7zkA', title: 'Les volcans', channel: 'C’est pas sorcier', shelf: 'works', lang: 'fr' },
  { id: 'JtulDX0nwQI', title: 'Comment ont disparu les dinosaures ?', channel: 'C’est pas sorcier', shelf: 'works', lang: 'fr' },
  // Live animal cams
  { id: 'abbR-Ttd-cA', title: 'Sea otters', channel: 'Monterey Bay Aquarium', shelf: 'cams', lang: 'en', live: true },
  { id: 'eQ_foBERmzA', title: 'Jellyfish', channel: 'Monterey Bay Aquarium', shelf: 'cams', lang: 'en', live: true },
  { id: 'w3LjpFhySTg', title: 'Kelp forest', channel: 'Monterey Bay Aquarium', shelf: 'cams', lang: 'en', live: true },
  { id: 'tEtg5Kg3voQ', title: 'Sharks', channel: 'Monterey Bay Aquarium', shelf: 'cams', lang: 'en', live: true },
  { id: 'qpukdDslCjk', title: 'African safari: lions, elephants and more', channel: 'Africam', shelf: 'cams', lang: 'en', live: true },
  { id: 'JMMoRwYo5kE', title: 'Waterhole in Etosha National Park, Namibia', channel: 'Namibia Wildlife Resorts', shelf: 'cams', lang: 'en', live: true },
  { id: '0xFARCdZ3vA', title: 'Hummingbirds in Panama', channel: 'Cornell Lab Bird Cams', shelf: 'cams', lang: 'en', live: true },
  { id: 'Mm_zVDDUeNA', title: 'Royal albatross nest, New Zealand', channel: 'Cornell Lab Bird Cams', shelf: 'cams', lang: 'en', live: true },
]

/** A shelf's videos with the ones in the app language first. */
export const shelfVideos = (shelf: VideoShelf, lang: string) =>
  LIBRARY_VIDEOS.filter((v) => v.shelf === shelf).sort((a, b) => Number(b.lang === lang) - Number(a.lang === lang))
