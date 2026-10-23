// Downloads the library photos (places and animals) from Wikimedia Commons, once, for the repo.
// For each entry in src/library/photo-sources.json it takes the lead photo of the Wikipedia article (or the
// Commons file named in `file`), keeps it only when its licence is free (public domain, CC0, CC BY, CC BY-SA),
// saves a 500 px wide copy to public/photos/<kind>/<id>.jpg, and writes the credit (author, licence, source)
// to src/library/photo-credits.json, which the app shows under every photo.
// Run: node scripts/fetch-photos.mjs [id …]   (only the given ids, or all that are missing)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const UA = 'KidsLearningStudio/1.0 (https://github.com/Oluwasedago/kids-learning-studio; photo credits)'
const sources = JSON.parse(readFileSync('src/library/photo-sources.json', 'utf8'))
const creditsFile = 'src/library/photo-credits.json'
const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {}
const only = process.argv.slice(2)
const FREE = /^(public domain|pd|cc0|cc by(-sa)? \d(\.\d)?|cc by(-sa)?-\d(\.\d)?|attribution|cc-by-sa-\d)/i

const api = async (host, params) => {
  const url = `https://${host}/w/api.php?format=json&formatversion=2&${new URLSearchParams(params)}`
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (r.ok) return r.json()
    await new Promise((ok) => setTimeout(ok, 1500 * (attempt + 1)))
  }
  throw new Error(`${host} answered with an error`)
}
const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

for (const s of sources) {
  if (only.length ? !only.includes(s.id) : credits[s.id] && existsSync(`public/photos/${s.kind}/${s.id}.jpg`)) continue
  try {
    let file = s.file
    if (!file) {
      const page = await api('en.wikipedia.org', { action: 'query', prop: 'pageimages', piprop: 'name', titles: s.title, redirects: 1 })
      file = page.query.pages[0]?.pageimage
    }
    if (!file) throw new Error('no lead photo')
    const info = await api('commons.wikimedia.org', { action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: 500, titles: `File:${file}` })
    const ii = info.query.pages[0]?.imageinfo?.[0]
    if (!ii) throw new Error(`not on Commons (maybe a non-free local file): ${file}`)
    const m = ii.extmetadata ?? {}
    const licence = strip(m.LicenseShortName?.value)
    if (!FREE.test(licence)) throw new Error(`licence not free enough: ${licence} (${file})`)
    const thumb = ii.thumburl.split('?')[0]
    if (!/\.(jpe?g)$/i.test(thumb)) throw new Error(`not a JPEG photo: ${thumb}`)
    const img = await fetch(thumb, { headers: { 'User-Agent': UA } })
    if (!img.ok) throw new Error(`download failed ${img.status}`)
    mkdirSync(`public/photos/${s.kind}`, { recursive: true })
    writeFileSync(`public/photos/${s.kind}/${s.id}.jpg`, Buffer.from(await img.arrayBuffer()))
    credits[s.id] = {
      author: strip(m.Artist?.value).slice(0, 120) || 'Unknown',
      licence,
      licenceUrl: m.LicenseUrl?.value ?? '',
      source: ii.descriptionurl,
    }
    console.log(`ok   ${s.id}: ${file} (${licence})`)
  } catch (e) {
    console.log(`FAIL ${s.id}: ${e.message}`)
  }
  await new Promise((ok) => setTimeout(ok, 300))
}
writeFileSync(creditsFile, `${JSON.stringify(credits, null, 2)}\n`)
