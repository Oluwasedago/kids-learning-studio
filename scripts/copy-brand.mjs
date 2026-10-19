#!/usr/bin/env node
// Copies the app icons from brand/ (the one source of the logo) into public/icons/, where Vite serves them.
// Runs by itself before `npm run dev` and `npm run build` (see "predev"/"prebuild" in package.json), so a new
// logo in brand/ reaches the app without copying by hand. public/icons/ is gitignored for that reason.
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'

const FILES = {
  'favicon.ico': 'brand/favicon.ico',
  'icon.svg': 'brand/icon.svg',
  'apple-touch-icon-180.png': 'brand/png/apple-touch-icon-180.png',
  'icon-192.png': 'brand/png/icon-192.png',
  'icon-512.png': 'brand/png/icon-512.png',
  'icon-maskable-192.png': 'brand/png/icon-maskable-192.png',
  'icon-maskable-512.png': 'brand/png/icon-maskable-512.png',
}

rmSync('public/icons', { recursive: true, force: true })
mkdirSync('public/icons', { recursive: true })
for (const [name, from] of Object.entries(FILES)) copyFileSync(from, `public/icons/${name}`)
console.log(`copy-brand: ${Object.keys(FILES).length} icons → public/icons/`)
