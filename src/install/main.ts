import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/fredoka/latin-600.css'
import qrcode from 'qrcode-generator'
import { en as t } from '@/i18n/en'
import { DEVICES, type Device, detectDevice } from './device'
import './install.css'

// The install page (install.html): steps for the device that opened it, the other devices one tap away,
// a QR code for opening this page on a tablet, and links to the app and the demo. No React: it is small.

const appUrl = new URL('./', location.href).href
const here = location.href.split('#')[0].split('?')[0]
const device = detectDevice(navigator.userAgent, navigator.maxTouchPoints)

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function steps(d: Device): string {
  const lock = t.install.lock[d]
  return `<ol class="steps">${t.install.steps[d].map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${lock ? `<p class="note">${esc(lock)}</p>` : ''}`
}

function qr(text: string): string {
  const code = qrcode(0, 'M')
  code.addData(text)
  code.make()
  return code.createSvgTag({ cellSize: 5, margin: 2, scalable: true })
}

const root = document.getElementById('install')!
root.innerHTML = `
  <header>
    <img src="./icons/icon.svg" alt="" width="96" height="96" />
    <div>
      <h1>${esc(t.install.title)}</h1>
      <p>${esc(t.install.intro)}</p>
    </div>
  </header>
  <section class="card">
    <h2>${esc(t.install.forDevice)}: ${esc(t.install.devices[device])}</h2>
    ${steps(device)}
    <div class="actions">
      <a class="button" href="${esc(appUrl)}">${esc(t.install.open)}</a>
      <a class="button secondary" href="${esc(appUrl)}?demo">${esc(t.install.demo)}</a>
    </div>
    <p class="note">${esc(t.install.demoNote)}</p>
  </section>
  <div class="two">
    <section class="card qr">
      <h2>${esc(t.install.qrTitle)}</h2>
      <div class="qr-code" role="img" aria-label="${esc(t.install.qrTitle)}">${qr(here)}</div>
      <p class="note">${esc(t.install.qrText)}</p>
      <p class="url">${esc(here)}</p>
    </section>
    <section class="card">
      <h2>${esc(t.install.restoreTitle)}</h2>
      <p>${esc(t.install.restoreText)}</p>
      <h2>${esc(t.install.privacyTitle)}</h2>
      <p>${esc(t.install.privacy)}</p>
    </section>
  </div>
  <section class="card">
    <h2>${esc(t.install.otherDevices)}</h2>
    ${DEVICES.filter((d) => d !== device)
      .map((d) => `<details><summary>${esc(t.install.devices[d])}</summary>${steps(d)}</details>`)
      .join('')}
  </section>
  <footer>
    <p>${esc(t.appName)} · ${esc(t.developedBy)} · ${esc(t.about.licence)}</p>
    <p><a href="https://github.com/Oluwasedago/kids-learning-studio">${esc(t.install.source)}</a></p>
  </footer>
`
