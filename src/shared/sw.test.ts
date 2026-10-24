import { describe, expect, it } from 'vitest'
import workerCode from '../../public/sw.js?raw'

// Runs the real public/sw.js with stand-ins for the browser's parts: a saved copy of the start page in the
// cache, and a network that answers with a newer one. Checks who answers which request, and what gets saved.

const SCOPE = 'https://example.org/kids-learning-studio/'
const OLD = '<script src="./assets/app-OLD.js">'
const NEW = '<script src="./assets/app-NEW.js">'

function loadWorker() {
  const handlers: Record<string, (event: unknown) => void> = {}
  const saved = new Map<string, Response>([[SCOPE, new Response(OLD)]])
  const self = { registration: { scope: SCOPE }, addEventListener: (type: string, fn: (event: unknown) => void) => (handlers[type] = fn) }
  const caches = {
    match: async (req: string | { url: string }) => saved.get(typeof req === 'string' ? req : req.url)?.clone(),
    // Opening the cache takes a moment, as in a browser: by then the page is already reading the response.
    open: () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ put: async (key: string | { url: string }, res: Response) => saved.set(typeof key === 'string' ? key : key.url, res) }), 5),
      ),
  }
  const network = async (req: { url: string }) => new Response(req.url === SCOPE ? NEW : `file ${req.url}`)
  new Function('self', 'caches', 'fetch', 'location', workerCode)(self, caches, network, new URL(SCOPE))

  /** What the worker answers: the page's text (read at once, as a browser does), or null when it lets the
   * browser go to the network itself. Waits for what the worker still saves (waitUntil). */
  const ask = async (request: { url: string; mode: string; cache: string }) => {
    const answer: { response?: Promise<Response> } = {}
    const saving: Promise<unknown>[] = []
    handlers.fetch({
      request: { method: 'GET', ...request },
      respondWith: (p: Promise<Response>) => (answer.response = p),
      waitUntil: (p: Promise<unknown>) => saving.push(p),
    })
    const text = answer.response ? await (await answer.response).text() : null
    await Promise.all(saving)
    return text
  }
  const savedText = async (url: string) => (await saved.get(url)?.clone().text()) ?? null
  return { ask, savedText }
}

describe('service worker', () => {
  it("leaves the app's update check to the network, so a new version can be seen", async () => {
    const { ask } = loadWorker()
    // As in src/shared/autoUpdate.ts: fetch('./', { cache: 'no-store' }).
    expect(await ask({ url: SCOPE, mode: 'cors', cache: 'no-store' })).toBeNull()
  })

  it('loads pages from the network first, and saves them for offline starts', async () => {
    const { ask, savedText } = loadWorker()
    expect(await ask({ url: SCOPE, mode: 'navigate', cache: 'default' })).toBe(NEW)
    expect(await savedText(SCOPE)).toBe(NEW)
  })

  it('answers other files of its own from the saved copy', async () => {
    const { ask } = loadWorker()
    expect(await ask({ url: SCOPE, mode: 'cors', cache: 'default' })).toBe(OLD)
  })

  it('saves a new file even though the page reads it at once (e.g. the world map chunk)', async () => {
    const { ask, savedText } = loadWorker()
    const file = `${SCOPE}assets/MapScreen-abc.js`
    expect(await ask({ url: file, mode: 'cors', cache: 'default' })).toBe(`file ${file}`)
    expect(await savedText(file)).toBe(`file ${file}`)
  })
})
