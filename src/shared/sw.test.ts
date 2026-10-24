import { describe, expect, it } from 'vitest'
import workerCode from '../../public/sw.js?raw'

// Runs the real public/sw.js with stand-ins for the browser's parts: a saved copy of the start page in the
// cache, and a network that answers with a newer one. Checks who answers which request.

const SCOPE = 'https://example.org/kids-learning-studio/'
const OLD = '<script src="./assets/app-OLD.js">'
const NEW = '<script src="./assets/app-NEW.js">'

function loadWorker() {
  const handlers: Record<string, (event: unknown) => void> = {}
  const saved = new Map<string, Response>([[SCOPE, new Response(OLD)]])
  const self = { registration: { scope: SCOPE }, addEventListener: (type: string, fn: (event: unknown) => void) => (handlers[type] = fn) }
  const caches = {
    match: async (req: string | { url: string }) => saved.get(typeof req === 'string' ? req : req.url)?.clone(),
    open: async () => ({ put: async (key: string | { url: string }, res: Response) => saved.set(typeof key === 'string' ? key : key.url, res) }),
  }
  const network = async () => new Response(NEW)
  new Function('self', 'caches', 'fetch', 'location', workerCode)(self, caches, network, new URL(SCOPE))

  /** What the worker answers: the page's text, or null when it lets the browser go to the network itself. */
  return async (request: { url: string; mode: string; cache: string }) => {
    const answer: { response?: Promise<Response> } = {}
    handlers.fetch({ request: { method: 'GET', ...request }, respondWith: (p: Promise<Response>) => (answer.response = p) })
    return answer.response ? (await answer.response).text() : null
  }
}

describe('service worker', () => {
  it("leaves the app's update check to the network, so a new version can be seen", async () => {
    const ask = loadWorker()
    // As in src/shared/autoUpdate.ts: fetch('./', { cache: 'no-store' }).
    expect(await ask({ url: SCOPE, mode: 'cors', cache: 'no-store' })).toBeNull()
  })

  it('loads pages from the network first', async () => {
    const ask = loadWorker()
    expect(await ask({ url: SCOPE, mode: 'navigate', cache: 'default' })).toBe(NEW)
  })

  it('answers other files of its own from the saved copy', async () => {
    const ask = loadWorker()
    expect(await ask({ url: SCOPE, mode: 'cors', cache: 'default' })).toBe(OLD)
  })
})
