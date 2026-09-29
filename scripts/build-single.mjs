/**
 * Single-file build: the whole site in ONE html file — CSS, JS, fonts, stills,
 * poster and the film are all inside. Opens by double-click (file://) and can
 * be uploaded anywhere as-is.
 *
 *   npm run build:single   →   dist-single/marmara-blue.html
 *
 * Built from dist-inline/ (run by the npm script). Every still is embedded
 * once (WebP 720 w) and the film once; a small script turns them into Blob
 * URLs that the page, the index menu and the viewer share. The KVKK and
 * privacy drafts are included as dialogs. The <meta> CSP is regenerated with
 * the hashes of the new inline blocks.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'dist-inline');
const out = path.join(root, 'dist-single');
if (!fs.existsSync(path.join(src, 'index.html'))) throw new Error('Run `node scripts/build-inline.mjs` first.');

const b64 = (file) => fs.readFileSync(path.join(src, file)).toString('base64');
const dataUri = (file, type) => `data:${type};base64,${b64(file)}`;
const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const must = (html, re, what) => {
  if (!re.test(html)) throw new Error(`build-single: ${what} not found`);
  return html;
};

let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');

/* 1 · Head: no separate files to preload or link. */
html = html
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<link rel="manifest"[^>]*>/g, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '')
  .replace(/\s*<link rel="icon" href="[^"]*favicon-32\.png"[^>]*>/g, '')
  .replace(/(<link rel="icon" href=")[^"]*favicon\.svg(")/, `$1${dataUri('favicon.svg', 'image/svg+xml')}$2`);

/* 2 · CSS: fonts and the film layer's poster background as data: URIs. */
const poster = dataUri('images/marmara-blue-poster.webp', 'image/webp');
html = must(html, /<style>/, '<style>').replace(/<style>([\s\S]*?)<\/style>/, (_, css) => {
  css = css
    // One font file per face (the variable font needs no separate format hint).
    .replace(/src:url\((?:\.\.\/|\.\/)?(fonts\/[^)]+\.woff2)\)format\("woff2-variations"\),url\([^)]+\)format\("woff2"\)/g, 'src:url($1)format("woff2")')
    .replace(/url\((?:\.\.\/|\.\/)?(fonts\/[^)]+\.woff2)\)/g, (m, f) => `url(${dataUri(f, 'font/woff2')})`)
    .replace(/url\((?:\.\.\/|\.\/)?images\/marmara-blue-poster\.webp\)/g, `url(${poster})`);
  return `<style>${css}\n${legalCss()}</style>`;
});
if (/url\((?!data:)[^)]*\.(woff2|webp)\)/.test(html)) throw new Error('build-single: CSS still references a file');

/* 3 · Film: poster inline; the MP4 comes from the embedded block (Blob URL). */
html = html
  .replace(/(<video[^>]*id="film"[^>]*poster=")[^"]*(")/, `$1${poster}$2`)
  .replace(/(<video[^>]*id="film"[^>]*?)\s*data-src="[^"]*"/, '$1');

/* 4 · Stills: one embedded copy per still; <picture> → <img data-mb-still>. */
const stills = {};
html = html.replace(/<picture>[\s\S]*?(<img [^>]*>)<\/picture>/g, (_, img) => {
  const name = /src="(?:\.\/)?images\/stills\/(.+?)-\d+\.webp"/.exec(img)[1];
  stills[name] = true;
  const attrs = img
    .replace(/\s(src|srcset|sizes)="[^"]*"/g, '')
    .replace(/^<img /, `<img data-mb-still="${name}" `);
  return `<picture>${attrs}</picture>`;
});
// Plain <img> of a still (the index menu preview).
html = html.replace(/<img src="(?:\.\/)?images\/stills\/(.+?)-\d+\.webp"/g, (_, name) => {
  stills[name] = true;
  return `<img data-mb-still="${name}"`;
});
// The menu previews and the viewer may ask for stills that are not on the page.
for (const f of fs.readdirSync(path.join(src, 'images/stills'))) {
  const m = /^(.+)-720\.webp$/.exec(f);
  if (m && html.includes(`"${m[1]}"`)) stills[m[1]] = true;
}
for (const name of Object.keys(stills)) stills[name] = b64(`images/stills/${name}-720.webp`);

/* 5 · Legal drafts → dialogs; links → #gizlilik-politikasi / #kvkk-aydinlatma-metni. */
const LEGAL = ['gizlilik-politikasi', 'kvkk-aydinlatma-metni'];
const legalDialog = (slug) => {
  const page = fs.readFileSync(path.join(src, `${slug}.html`), 'utf8');
  const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(page)[1]
    .replace(/<h1 class="page__title">/, `<h2 class="page__title" id="legal-${slug}-title">`)
    .replace(/<\/h1>/, '</h2>')
    .replace(/<h2 id="/g, `<h3 id="${slug}-`)
    .replace(/<\/h2>/g, (m, i, s) => (s.lastIndexOf('<h3', i) > s.lastIndexOf('<h2', i) ? '</h3>' : m))
    .replace(/aria-labelledby="/g, `aria-labelledby="${slug}-`);
  return `
  <dialog class="legal page" id="legal-${slug}" aria-labelledby="legal-${slug}-title">
    <form method="dialog" class="page__head">
      <span class="hud__mark"><span>Marmara</span> <span>Blue</span></span>
      <button class="page__back scene__cta t-meta" type="submit">Kapat ×</button>
    </form>
    <div class="page__main">${main}</div>
  </dialog>`;
};

/* 6 · Runtime: Blob URLs for the media, the MB_ASSETS hook, the legal dialogs. */
const boot = `(function () {
  var byId = function (id) { return document.getElementById(id); };
  var blobUrl = function (data, type) {
    var bin = atob(data), n = bin.length, bytes = new Uint8Array(n);
    for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: type }));
  };
  var stills = JSON.parse(byId('mb-stills').textContent);
  var urls = {};
  Object.keys(stills).forEach(function (k) { urls[k] = blobUrl(stills[k], 'image/webp'); });
  document.querySelectorAll('img[data-mb-still]').forEach(function (img) {
    img.src = urls[img.getAttribute('data-mb-still')];
  });
  var film = blobUrl(byId('mb-film').textContent, 'video/mp4');
  byId('film').setAttribute('data-src', film);
  window.MB_ASSETS = function (p) {
    if (p === 'videos/marmara-blue-hero.mp4') return film;
    var m = /^images\\/stills\\/(.+)-\\d+\\.webp$/.exec(p);
    return m ? urls[m[1]] : undefined;
  };

  var lock = function (on) { document.documentElement.classList.toggle('is-locked', on); };
  var openLegal = function (slug) {
    var d = byId('legal-' + slug);
    if (!d) return false;
    document.querySelectorAll('dialog.legal[open]').forEach(function (o) { o.close(); });
    d.showModal();
    d.scrollTop = 0;
    lock(true);
    return true;
  };
  document.querySelectorAll('dialog.legal').forEach(function (d) {
    d.addEventListener('close', function () { if (!document.querySelector('dialog[open]')) lock(false); });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && openLegal(a.getAttribute('href').slice(1))) e.preventDefault();
  }, true);
  if (location.hash) openLegal(location.hash.slice(1));
})();`;

const tail = `${LEGAL.map(legalDialog).join('')}
  <script type="application/json" id="mb-stills">${JSON.stringify(stills)}</script>
  <script type="application/octet-stream" id="mb-film">${b64('videos/marmara-blue-hero.mp4')}</script>
  <script>${boot}</script>
</body>`;
html = must(html, /<\/body>/, '</body>').replace(/<\/body>/, () => tail);
for (const slug of LEGAL) html = html.replaceAll(`href="${slug}.html"`, `href="#${slug}"`);

/* 7 · CSP: hashes of the inline blocks; media and fonts come from data:/blob:. */
const scripts = [...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)].map((m) => sha(m[1]));
const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => sha(m[1]));
html = must(html, /http-equiv="Content-Security-Policy"/, 'meta CSP').replace(
  /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/,
  (m, a, csp, z) => a + csp
    .replace(/script-src [^;]*/, `script-src 'self' ${scripts.join(' ')} https://www.googletagmanager.com`)
    .replace(/style-src [^;]*/, `style-src 'self' ${styles.join(' ')}`)
    .replace(/font-src [^;]*/, "font-src 'self' data:")
    .replace(/img-src 'self'/, "img-src 'self' blob:")
    .replace(/media-src [^;]*/, "media-src 'self' blob:") + z,
);

// Nothing may point at a local file any more.
const local = [...html.matchAll(/\s(?:src|href|poster|data-src|srcset)="(?!data:|https?:|tel:|mailto:|#)([^"]+)"/g)].map((m) => m[1]);
if (local.length) throw new Error(`build-single: still references files: ${local.join(', ')}`);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
fs.writeFileSync(path.join(out, 'marmara-blue.html'), html);
console.log(`dist-single/marmara-blue.html  ${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB  (everything inside)`);

function legalCss() {
  // page.css without its @imports (fonts/base are already in the page), plus the dialog frame.
  const page = fs.readFileSync(path.join(root, 'src/styles/page.css'), 'utf8').replace(/@import[^;]*;\s*/g, '');
  return `${page}
.legal{position:fixed;inset:0;width:100%;max-width:none;height:100%;max-height:none;margin:0;padding:0;border:0;overflow-y:auto;overscroll-behavior:contain;color:var(--ivory)}
.legal::backdrop{background:var(--midnight)}
.legal .page__head{position:sticky;top:0;z-index:1;padding-bottom:16px;background:var(--midnight)}
.legal .page__back{border:0;background:none;color:inherit;font:inherit;cursor:pointer}
.legal .page__main{padding-top:6vh}
.legal .page__title{margin:14px 0 36px;font-weight:800;font-size:clamp(38px,7.4vw,96px);line-height:.9;letter-spacing:-.03em}
.legal h3{margin:44px 0 14px;font-weight:720;font-stretch:112%;font-size:21px;line-height:1.2;letter-spacing:-.01em;text-transform:uppercase}`;
}
