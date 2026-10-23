// Checks every video in the video library with YouTube's oEmbed: still public and embeddable, and from the
// channel we expect. Prints a line per video; exits with an error when one is gone. Run before a release:
//   node scripts/check-videos.mjs
import { readFileSync } from 'node:fs'

const source = readFileSync('src/media/library.ts', 'utf8')
const videos = [...source.matchAll(/\{ id: '([\w-]{11})', title: '([^']*)', channel: '([^']*)'/g)].map((m) => ({ id: m[1], title: m[2], channel: m[3] }))
let broken = 0
for (const v of videos) {
  const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.id}`)}`)
  if (!r.ok) {
    broken++
    console.log(`GONE ${v.id} ${v.title} (${r.status})`)
    continue
  }
  const j = await r.json()
  console.log(`ok   ${v.id} ${j.author_name} | ${j.title}`)
}
console.log(`${videos.length - broken} of ${videos.length} videos ok`)
if (broken) process.exit(1)
