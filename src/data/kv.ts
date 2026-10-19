// A tiny key-value store on the device (IndexedDB), so the Studio keeps its data without Wi-Fi.
// (New concept: IndexedDB is a database built into every browser. Each website gets its own, on the device;
// nothing is sent anywhere.) If IndexedDB fails (some private-browsing modes), values live in memory until the
// page reloads, so the app still works.

const DB_NAME = 'kids-learning-studio'
const STORE = 'kv'
const memory = new Map<string, unknown>()
let dbPromise: Promise<IDBDatabase> | null = null

function db(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1)
    open.onupgradeneeded = () => open.result.createObjectStore(STORE)
    open.onsuccess = () => resolve(open.result)
    open.onerror = () => reject(open.error)
  })
  return dbPromise
}

function request<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const req = run(d.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
      }),
  )
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  try {
    return await request<T | undefined>('readonly', (s) => s.get(key))
  } catch {
    return memory.get(key) as T | undefined
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  memory.set(key, value)
  try {
    await request('readwrite', (s) => s.put(value, key))
  } catch {
    // Kept in memory only.
  }
}

/** Every stored key (used by Backup to save everything in one file). */
export async function kvKeys(): Promise<string[]> {
  try {
    return (await request<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String)
  } catch {
    return [...memory.keys()]
  }
}

/** Deletes every stored value (Restore replaces everything; "Delete all data" and leaving the demo start afresh). */
export async function kvClear(): Promise<void> {
  memory.clear()
  try {
    await request('readwrite', (s) => s.clear())
  } catch {
    // Nothing stored on the device.
  }
}
