#!/usr/bin/env node
// Forbidden-words check: stops a commit that contains your family's private details or a secret.
//
// How it works (new concept: a "git hook" is a script git runs by itself at a certain moment;
// this one runs just before each commit is saved):
//   1. It reads YOUR list of private words from .private-words.txt (gitignored, so the list itself
//      never reaches GitHub). One word or regular expression per line, # starts a comment.
//   2. It also always looks for common secret formats (GitHub tokens, Google API keys, private keys).
//   3. It scans every staged file (name and content) and, with --message <file>, the commit message.
// Any hit stops the commit and shows file, line and the matched word.
// Usage: node scripts/check-private.mjs            (staged files, used by .githooks/pre-commit)
//        node scripts/check-private.mjs --all      (every tracked file, e.g. before a release)
//        node scripts/check-private.mjs --message .git/COMMIT_EDITMSG
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const SECRETS = [
  ['GitHub token', /\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['OpenAI/Anthropic key', /\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/],
]
// Files that may contain the author's own name (copyright line).
const SKIP_NAMES_IN = new Set(['LICENSE'])

function privateWords() {
  if (!existsSync('.private-words.txt')) return []
  return readFileSync('.private-words.txt', 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((w) => [w, new RegExp(w, 'i')])
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const args = process.argv.slice(2)
const words = privateWords()
const hits = []

function scan(label, text, checkWords = true) {
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const [name, re] of SECRETS) if (re.test(line)) hits.push(`${label}:${i + 1}  secret (${name})`)
    if (checkWords) for (const [w, re] of words) if (re.test(line)) hits.push(`${label}:${i + 1}  private word "${w}"`)
  })
}

if (args[0] === '--message') {
  scan('commit message', readFileSync(args[1], 'utf8'))
} else {
  const files = (args[0] === '--all'
    ? git('ls-files')
    : git('diff', '--cached', '--name-only', '--diff-filter=ACMR')
  ).split('\n').filter(Boolean)
  for (const f of files) {
    scan(`file name ${f}`, f)
    const buf = execFileSync('git', ['show', args[0] === '--all' ? `HEAD:${f}` : `:${f}`], { maxBuffer: 64 * 1024 * 1024 })
    if (buf.includes(0)) continue // binary (pictures, fonts): names checked only
    scan(f, buf.toString('utf8'), !SKIP_NAMES_IN.has(f))
  }
}

if (!existsSync('.private-words.txt')) {
  console.warn('check-private: no .private-words.txt found, so only secrets were checked. Copy .private-words.example.txt to start one.')
}
if (hits.length) {
  console.error('\nStopped: private data or a secret would be committed.\n')
  for (const h of hits) console.error('  ' + h)
  console.error('\nRemove it (or move it to private/, which is gitignored), then commit again.\n')
  process.exit(1)
}
