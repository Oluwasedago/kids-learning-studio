// What the child can listen to. Everything is streamed when played and never stored in the app.
//
// Radio — public HTTPS streams, MP3 128 kbit/s, checked 19 Oct 2026. Neither station publishes terms about
//   other players: TO VERIFY with each station before v1 (ROADMAP.md). Parents can add other stations themselves.
//   - Die Maus (WDR, German public broadcaster): in German, no adverts. The address forwards to a fresh signed
//     stream link each time (allowed for web players: Access-Control-Allow-Origin *).
//   - Fun Kids and Fun Kids Junior (UK, funkidslive.com): in English, with short adverts.
//   A US station (Kids Public Radio, ad-free) was checked but only streams over http://, which browsers block
//   inside an https:// app.
// Stories — LibriVox recordings of public-domain children's books, hosted by the Internet Archive.
//   LibriVox: "all our recordings are public domain (definitely in the USA, and maybe in your country as well)"
//   and "you may do whatever you like with our recordings – you don't need permission" (librivox.org,
//   checked 19 Oct 2026). Each item is marked Public Domain on archive.org. Stories were chosen by hand; some
//   classic stories were left out because of outdated or offensive language.

export interface Station {
  id: string
  name: string
  url: string
  /** Who it is for and where it comes from. */
  about: string
  emoji: string
  /** Built in (true) or added by a parent. */
  builtIn: boolean
}

export const STATIONS: Station[] = [
  { id: 'maus', name: 'Die Maus', url: 'https://wdr-diemaus-live.icecastssl.wdr.de/wdr/diemaus/live/mp3/128/stream.mp3', about: 'German children’s radio from WDR (in German, no adverts)', emoji: 'mouse', builtIn: true },
  { id: 'funkids', name: 'Fun Kids', url: 'https://listen-funkids.sharp-stream.com/funkids.mp3', about: 'UK children’s radio, ages 6–12 (with short adverts)', emoji: 'radio', builtIn: true },
  { id: 'funkids-junior', name: 'Fun Kids Junior', url: 'https://listen-funkids.sharp-stream.com/funkidsjunior.mp3', about: 'Songs and stories for younger children (with short adverts)', emoji: 'teddy', builtIn: true },
]

export interface Track {
  id: string
  title: string
  url: string
  /** Seconds. */
  length: number
}

export interface Collection {
  id: string
  title: string
  author: string
  emoji: string
  /** The page on archive.org (credit and source). */
  source: string
  tracks: Track[]
}

const IA = 'https://archive.org/download/'
const potter = (n: number, title: string, length: number): Track => ({
  id: `potter-${n}`,
  title,
  url: `${IA}thetaleofpeterrabbitandothers_2008_librivox/peterrabbitandothertales_${String(n).padStart(2, '0')}_potter_64kb.mp3`,
  length,
})
const kipling = (n: number, title: string, length: number): Track => ({
  id: `kipling-${n}`,
  title,
  url: `${IA}just_so_stories_1004_librivox/justsostories_${String(n).padStart(2, '0')}_kipling_64kb.mp3`,
  length,
})

export const COLLECTIONS: Collection[] = [
  {
    id: 'potter',
    title: 'The Tale of Peter Rabbit and others',
    author: 'Beatrix Potter',
    emoji: 'animal-rabbit',
    source: 'https://archive.org/details/thetaleofpeterrabbitandothers_2008_librivox',
    tracks: [
      potter(1, 'The Tale of Peter Rabbit', 322),
      potter(2, 'The Tale of Tom Kitten', 259),
      potter(3, 'The Tale of Squirrel Nutkin', 406),
      potter(4, 'The Tale of Benjamin Bunny', 475),
      potter(5, 'The Tale of Jemima Puddle-Duck', 584),
      potter(6, 'The Tale of the Flopsy Bunnies', 566),
      potter(7, 'The Tale of Mrs. Tiggy-Winkle', 654),
      potter(8, 'The Tale of Two Bad Mice', 387),
      potter(9, 'The Tale of Johnny Town-Mouse', 551),
      potter(10, 'The Tale of Mr. Jeremy Fisher', 354),
      potter(11, 'The Tale of Mrs. Tittlemouse', 504),
      potter(12, 'The Story of Miss Moppet', 101),
      potter(15, 'The Tale of Timmy Tiptoes', 630),
      potter(16, 'The Story of a Fierce Bad Rabbit', 96),
      potter(18, 'The Tailor of Gloucester', 1382),
    ],
  },
  {
    id: 'velveteen',
    title: 'The Velveteen Rabbit',
    author: 'Margery Williams',
    emoji: 'teddy',
    source: 'https://archive.org/details/velveteen_rabbit_librivox',
    tracks: [{ id: 'velveteen', title: 'The Velveteen Rabbit, or How Toys Become Real', url: `${IA}velveteen_rabbit_librivox/the_velveteen_rabbit_williams_64kb.mp3`, length: 1730 }],
  },
  {
    id: 'just-so',
    title: 'Just So Stories',
    author: 'Rudyard Kipling',
    emoji: 'animal-elephant',
    source: 'https://archive.org/details/just_so_stories_1004_librivox',
    tracks: [
      kipling(1, 'How the Whale got his Throat', 578),
      kipling(2, 'How the Camel got his Hump', 555),
      kipling(3, 'How the Rhinoceros got his Skin', 485),
      kipling(5, "The Elephant's Child", 1071),
      kipling(6, 'The Sing-song of Old Man Kangaroo', 611),
      kipling(7, 'The Beginning of the Armadillos', 1134),
      kipling(8, 'How the First Letter was Written', 1272),
      kipling(9, 'How the Alphabet was Made', 1565),
      kipling(11, 'The Cat who Walked by Himself', 1537),
    ],
  },
]

/** A YouTube link (video or playlist) as {kind, id}; null when it is not a YouTube link. Pure (tested). */
export function parseYouTube(link: string): { kind: 'video' | 'playlist'; id: string } | null {
  const s = link.trim()
  const list = s.match(/[?&]list=([A-Za-z0-9_-]{10,})/)
  if (list && !/[?&]v=/.test(s)) return { kind: 'playlist', id: list[1] }
  const m =
    s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ??
    s.match(/[?&]v=([A-Za-z0-9_-]{11})/) ??
    s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/) ??
    s.match(/^([A-Za-z0-9_-]{11})$/)
  return m ? { kind: 'video', id: m[1] } : null
}

/**
 * The embedded player address. youtube-nocookie.com sets no tracking cookies before a video is played; related
 * videos at the end stay within the same channel (rel=0). YouTube itself is contacted when the child presses play.
 */
export function embedUrl(v: { kind: 'video' | 'playlist'; id: string }): string {
  const params = 'autoplay=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3'
  return v.kind === 'playlist' ? `https://www.youtube-nocookie.com/embed/videoseries?list=${v.id}&${params}` : `https://www.youtube-nocookie.com/embed/${v.id}?${params}`
}

/** A still picture for a video card (playlists have none without YouTube's API). */
export const thumbnail = (v: { kind: 'video' | 'playlist'; id: string }) => (v.kind === 'video' ? `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg` : null)

/** Is a call link safe to open: a phone number, FaceTime, or a WhatsApp/Signal/Skype/Teams/Zoom link? Pure (tested). */
export function callLinkOk(link: string): boolean {
  return /^(tel:\+?[\d\s()-]{5,}|facetime(-audio)?:|https:\/\/(wa\.me|api\.whatsapp\.com|signal\.me|join\.skype\.com|teams\.microsoft\.com|([\w-]+\.)?zoom\.us)\/)/i.test(link.trim())
}
