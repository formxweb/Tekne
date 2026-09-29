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
npm run build:single   # one self-contained HTML → dist-single/marmara-blue.html
```

`build:single` embeds the film, the stills, the fonts and the code into a single
HTML file of about 9 MB. It opens with a double-click (`file://`), with no
server needed, which makes it handy for sharing a preview.

`dist/` is a static site, so it can be deployed to any static host. The canonical URL is
set to `https://marmara.blue/`.

## The film

- `public/videos/marmara-blue-hero.mp4` is the supplied MP4, byte-for-byte
  (720×1280, 17 s, H.264; the moov atom is already at the front, so it streams).
- The poster `public/images/marmara-blue-poster.jpg` is the film's first frame.
- Every still on the site comes from the film (`scripts/extract-stills.py`),
  and each one carries its real timecode. **VIEW MOMENT** plays the film from that shot.
- The hero video is `autoplay muted loop playsinline preload="metadata"`,
  `object-fit: cover`. If autoplay is refused or the file fails to load, the
  poster stays in place and a **PLAY FILM** control appears; the layout doesn't break.
  With `prefers-reduced-motion` the film never autoplays.

## Structure

```
index.html            all seven chapters, static & crawlable (SEO, OG, JSON-LD)
src/main.js           smooth scroll, motion variants, chapter index, focus handling
src/chapters/         one choreography per chapter
src/ui/               film, HUD, index menu, viewer, cursor, request form, contact sheet
src/styles/           base.css (system) · chapters.css (compositions + mobile direction)
src/data/film.js      shot boundaries of the film
public/               video, poster, stills, icons, OG image, robots, sitemap
docs/                 art direction · verified facts
```

`<mb-still name="…" />` in `index.html` is expanded at build time (see
`vite.config.js`) into a responsive `<picture>` element with AVIF, WebP and JPEG sources.

## Content rules

Only verified information is used. The list of facts and their sources is in
[`docs/FACTS.md`](docs/FACTS.md). **Before launch, confirm the phone/WhatsApp
number and that KAPTAN-I DERYA 3 belongs to the fleet.** No boat specifications,
dates or testimonials were invented. Where a fact isn't known, the page says
*On request*.

The request form has no backend. It composes a WhatsApp message to the
reservation number.
