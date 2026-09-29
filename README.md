# Marmara Blue — digital experience

A campaign microsite for Marmara Blue (Bosphorus, Istanbul), built around the
brand's own film. Read the art direction before touching anything:
[`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md).

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # static build → dist/
npm run preview   # serve the build
npm run build:inline   # copy-paste variant → dist-inline/ (see below)
```

`build:inline` writes each page as a single HTML file with its CSS and JS
inside. Media, fonts and icons stay as separate files next to it, with no
Base64. All paths are relative, and `_headers`/`vercel.json` are regenerated
with the SHA-256 hashes of the inline blocks, so the strict CSP still holds.
Rerun it after any code change. Opened by double-click (`file://`), browsers
block the web fonts; on any web server everything works.

`dist/` is a static site. Deploy it with Vercel (`vercel.json`), Netlify or
Cloudflare Pages (`netlify.toml` + `public/_headers`), or any static host.
Security headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy,
frame-ancestors) and cache headers are defined in both files and are kept in
sync. The canonical URL is `https://marmara.blue/`.

**Before launch, read [`docs/YAYIN-ONCESI.md`](docs/YAYIN-ONCESI.md)**
(which facts to confirm, what legal text is still missing, and how to enable
analytics).

## The film

- `public/videos/marmara-blue-hero.mp4` is the supplied film, with its video stream
  unchanged (720×1280, H.264, faststart). The audio track was removed
  losslessly: the page never plays sound, and the reel's music is not licensed
  for the website.
- The poster `public/images/marmara-blue-poster.webp` is the film's first frame.
  It is also the film layer's CSS background, so a failed video still leaves a
  still backdrop.
- The MP4 is attached right after the `load` event, so the poster, CSS and
  fonts are never queued behind it. It then autoplays muted, inline and
  looping, and keeps playing while the page scrolls. It is not downloaded with
  `prefers-reduced-motion` or data saver (PLAY FILM loads it on demand).
- Every still comes from the film (`scripts/extract-stills.py`): AVIF + WebP
  at 240/480/720 w, each with its real timecode. **VIEW MOMENT** plays the
  film from that shot.

## Structure

```
index.html                  the page: static & crawlable (SEO, OG, JSON-LD)
gizlilik-politikasi.html    privacy policy (DRAFT, noindex)
kvkk-aydinlatma-metni.html  KVKK notice (DRAFT, noindex)
404.html
src/main.js                 wires interactions; nothing reacts to scroll
src/ui/                     film, HUD, index menu, viewer, cursor, request form, consent
src/lib/                    analytics (no-op without ID + consent), motion, timecode
src/styles/                 fonts · base (system) · chapters (compositions) · page (legal)
src/data/film.js            shot boundaries of the film
public/                     video, poster, stills, fonts, icons, OG image, robots, sitemap, _headers
docs/                       art direction · verified facts · launch checklist (TR)
```

`<mb-still name="…" />` in `index.html` is expanded at build time (see
`vite.config.js`) into a responsive `<picture>` element.

## Analytics

Analytics is off unless `VITE_GA4_ID` is set at build time. Even then, GA4
only loads after the visitor accepts the consent bar. Conversion events:
`whatsapp_click`, `phone_click`, `instagram_click`, `request_form_open`,
`request_form_submit`, `whatsapp_redirect`.

## Content rules

Only verified information is used. The list of facts and their sources is in
[`docs/FACTS.md`](docs/FACTS.md). **Before launch, confirm the phone/WhatsApp
number and that KAPTAN-I DERYA 3 belongs to the fleet.** No boat specifications,
dates or testimonials were invented. Where a fact isn't known, the page says
*On request*.

The request form has no backend. It validates every field, then composes a
URL-encoded WhatsApp message to the reservation number. User input only ever
reaches the DOM through `textContent`/attributes.
