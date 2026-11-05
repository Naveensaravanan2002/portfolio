# Naveen S — Portfolio

Static site: `index.html` + 3 CSS files + 6 small JS files. No build step, no server,
no dependencies. Open `index.html` (or run a local server) and it works.

```bash
# optional local server (avoids file:// quirks)
python3 -m http.server 8000     # → http://localhost:8000
```

---

## ✉️ How the contact form delivers mail

The form needs **no server**. It picks a provider automatically:

| Where the site is hosted | What happens |
|---|---|
| **Netlify** (recommended) | Netlify's own form handling posts to `/` and emails you. Free, no third party, no activation step. |
| Anywhere else (Vercel, GitHub Pages, localhost) | Falls back to **FormSubmit**. The very first submission triggers a one-time activation email to `naveensaravanan2002@gmail.com` — click the link once and it's done forever. |
| Opened as a file (`file://`) | Browsers block the request outright. The form says so and opens the visitor's mail app instead. Always test from a web address. |

**Setup on Netlify, once:** deploy, then *Site configuration → Forms → Form notifications →
Add notification → Email notification* → `naveensaravanan2002@gmail.com`.
That's the only step — sending already works before it.

- Netlify path: `NETLIFY_FORM_NAME` in `js/app.js` must match `name="contact"` on the form
- FormSubmit path: `const FORM_ENDPOINT` in `js/app.js`
- Host detection is the `x-nf-request-id` response header — nothing to configure
- If everything fails, the form falls back to opening the visitor's mail app

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
