# Naveen S — Portfolio

Static site: `index.html` + 3 CSS files + 6 small JS files. No build step, no server,
no dependencies. Open `index.html` (or run a local server) and it works.

```bash
# optional local server (avoids file:// quirks)
python3 -m http.server 8000     # → http://localhost:8000
```

---

## ⚠️ One thing to do: activate the contact form

The contact form sends mail through **FormSubmit** (no server needed).

**Two things to know:**

1. **Open the site from a web address, not `file://`.** If you double-click `index.html`
   (or drag it into the browser), the page has no origin and browsers block the post to an
   external service — the form will say so and fall back to opening the visitor's mail app.
   Test with `python3 -m http.server 8000` → `http://localhost:8000`, or just deploy it.
2. **Activate the form once.** After the first real submission, FormSubmit emails an
   activation link to `naveensaravanan2002@gmail.com`. Click it. From then on every message
   lands in your inbox (with the sender's name and email in the table).

- Endpoint lives in `js/app.js` → `const FORM_ENDPOINT`
- If the request ever fails, the form falls back to opening the visitor's mail app
- To switch to Formspree or Web3Forms later, change that one constant

---

## Files

```
portfolio/
├─ index.html            ← all page content
├─ css/
│  ├─ base.css           ← fonts, colour tokens, typography
│  ├─ components.css     ← nav, buttons, chips, modal, palette
│  └─ sections.css       ← hero, work, demos, skills, contact, footer
├─ js/
│  ├─ app.js             ← nav, reveal, cursor, palette, dossiers, contact form, doodle parallax
│  ├─ dossiers.js        ← ✏️ case-study copy for the modals
│  ├─ graph.js           ← FinGraphAI graph demo
│  ├─ pipeline.js        ← LedgerLake pipeline demo
│  ├─ receipt.js         ← Ranger receipt demo
│  ├─ booking.js         ← DriveU role/booking demo
│  └─ game.js            ← Brick Breaker (canvas)
└─ assets/
   ├─ fonts/             ← Fraunces, Manrope, JetBrains Mono (self-hosted)
   ├─ img/               ← portrait.png, portrait-face.png, og-image.png, logo.png
   ├─ favicon.svg        ← cream block, orange N
   └─ NaveenS-Resume.pdf ← what the Resume buttons point to
```

## Editing

| Change | File | Look for |
|---|---|---|
| Hero headline / intro | `index.html` | `hero__title`, `hero__lede` |
| Job, dates, bullets | `index.html` | `xp__role`, `xp__dates`, `xp__list` |
| Skills | `index.html` | `<span class="tech" data-used="…">` |
| Case-study modals | `js/dossiers.js` | `window.DOSSIERS` |
| Email / phone / links | `index.html` | `naveensaravanan2002` |
| Colours | `css/base.css` | `:root` tokens |
| Résumé | replace `assets/NaveenS-Resume.pdf` (same filename) | |
| Social card | replace `assets/img/og-image.png` (1200×630) | |
| Doodles in the hero | `index.html` → `.doodle__orbit` blocks; radii/tempo in `css/sections.css` (`.doodle__orbit--a…g`) | |

**Icons:** the fonts don't include arrow/dot glyphs (they render as broken fallbacks in some
browsers), so icons are inline SVG from the sprite at the top of `index.html`
(`#i-arrow-ne`, `#i-arrow-e`, `#i-arrow-s`, `#i-copy`, `#i-search`, `#i-download`).
Use `<svg class="i"><use href="#i-arrow-ne"/></svg>` instead of typing `↗`.

---

## Deploying

**Vercel** — Framework preset: *Other*, Build command: empty, Output directory: empty.
**Netlify / Cloudflare Pages** — drag the folder in; no build command, publish directory `.`.
**GitHub Pages** — Settings → Pages → Deploy from branch → `main` / root.

---

## Notes

- Keyboard: `Ctrl/⌘ K` (or `/`) opens the command palette; games and demos are keyboard-accessible.
- `prefers-reduced-motion` turns off all animation, the doodles and the custom cursor.
- Self-hosted fonts, no trackers, no cookies.
