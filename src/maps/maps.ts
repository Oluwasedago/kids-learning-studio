import type { Lang } from '@/i18n'

// The world map: countries coloured by continent. Explore (tap a country: what it is like) or quiz
// ("Where is …?", three tries, then the map shows it). Map data: src/maps/data (SOURCES.md).
// Pure logic here, tested in maps.test.ts.

/** A country on the map: ISO 3166-1 alpha-2 code, the map data's names, and its continent. */
export interface Region {
  id: string
  names: Record<Lang, string>
  /** Natural Earth's English continent name (a key of CONTINENTS). */
  continent: string
}

/** The continents as children learn them (Natural Earth's names → ours). */
export const CONTINENTS: Record<string, Record<Lang, string>> = {
  Africa: { de: 'Afrika', en: 'Africa', fr: 'Afrique' },
  Asia: { de: 'Asien', en: 'Asia', fr: 'Asie' },
  Europe: { de: 'Europa', en: 'Europe', fr: 'Europe' },
  'North America': { de: 'Nordamerika', en: 'North America', fr: 'Amérique du Nord' },
  'South America': { de: 'Südamerika', en: 'South America', fr: 'Amérique du Sud' },
  Oceania: { de: 'Australien und Ozeanien', en: 'Australia and Oceania', fr: 'Océanie' },
}

/** Continent colours (soft, so borders stay visible; the same in light and dark mode, like a printed atlas). */
export const CONTINENT_COLORS: Record<string, string> = {
  Africa: '#ffcf8a',
  Asia: '#f6a5b8',
  Europe: '#9cc8f2',
  'North America': '#a8dfb9',
  'South America': '#c9b4f5',
  Oceania: '#ffe08a',
}

/** A country's name in the app's language: the browser's own name ("China", not "People's Republic of China"),
 * else the map data's. */
export function countryName(region: Region, lang: Lang): string {
  try {
    const name = new Intl.DisplayNames([lang], { type: 'region', fallback: 'none' }).of(region.id)
    if (name) return name
  } catch {
    // Old browser or unknown code: the map data's name.
  }
  return region.names[lang] || region.names.en
}

// ---- Zoom ----

export type Zoom = 'world' | keyof typeof ZOOM_AREAS
/** What a continent button shows (west, south, east, north in degrees). Boxes, not the continents' own outlines:
 * Natural Earth counts all of Russia as Europe, which would leave Europe as small as on the world map. */
export const ZOOM_AREAS = {
  Europe: [-25, 34, 45, 71],
  Africa: [-19, -36, 52, 38],
  Asia: [25, -11, 150, 56],
  'North America': [-168, 7, -15, 78],
  'South America': [-82, -56, -34, 13],
  Oceania: [110, -48, 180, 0],
} as const satisfies Record<string, readonly [number, number, number, number]>
export const ZOOMS: Zoom[] = ['world', ...(Object.keys(ZOOM_AREAS) as (keyof typeof ZOOM_AREAS)[])]

/** Points around a box in degrees (corners and edges), to project and measure. */
export function boxPoints([w, s, e, n]: readonly [number, number, number, number], steps = 8): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const lon = w + ((e - w) * i) / steps
    const lat = s + ((n - s) * i) / steps
    out.push([lon, s], [lon, n], [w, lat], [e, lat])
  }
  return out
}

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

/** A view box around `bounds` (SVG units) with some margin, widened or heightened to the map's own shape so the
 * map fills its frame. Pure (tested). */
export function fitBox([[x0, y0], [x1, y1]]: [[number, number], [number, number]], aspect: number, margin = 0.04): ViewBox {
  let w = (x1 - x0) * (1 + 2 * margin)
  let h = (y1 - y0) * (1 + 2 * margin)
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }
}

/** Is a country smaller than a fingertip (the 64 px tap size) at this scale (screen px per SVG unit)? */
export const tooSmallToTap = ([[x0, y0], [x1, y1]]: [[number, number], [number, number]], scale: number, tap = 64) => Math.max(x1 - x0, y1 - y0) * scale < tap

// ---- Quiz ----

export interface Quiz {
  /** A country code, or a continent (Natural Earth's name) in the continent quiz. */
  target: string
  /** Wrong taps so far (after MAX_MISSES the map shows the answer). */
  misses: number
}

export const MAX_MISSES = 3

/** The next thing to find: random, never the same as the last one. */
export function nextTarget(pool: string[], last: string | null, rnd: () => number = Math.random): string {
  const options = pool.length > 1 ? pool.filter((x) => x !== last) : pool
  return options[Math.floor(rnd() * options.length)]
}

export type TapResult = 'right' | 'wrong' | 'shown'

/** A tap in the quiz: right, wrong, or wrong for the third time (then the map shows the answer). */
export function answer(quiz: Quiz, tapped: string): { result: TapResult; quiz: Quiz } {
  if (tapped === quiz.target) return { result: 'right', quiz }
  const misses = quiz.misses + 1
  return { result: misses >= MAX_MISSES ? 'shown' : 'wrong', quiz: { ...quiz, misses } }
}

/** Younger children find continents; from stage 3 (about Year 2 / Klasse 2) countries. */
export const quizKind = (stage: number): 'continents' | 'countries' => (stage < 3 ? 'continents' : 'countries')

/** Countries in the quiz: the ones from the flag lessons that are on the map and big enough to tap. */
export function quizCountries(lessonCountries: string[], onMap: { id: string; area: number }[], minArea: number): string[] {
  const big = new Set(onMap.filter((c) => c.area >= minArea).map((c) => c.id))
  return lessonCountries.filter((id) => big.has(id))
}
