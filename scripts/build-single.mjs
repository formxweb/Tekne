/**
 * Single-file build: one HTML that opens with a double-click (file://).
 *
 *   npm run build:single   →   dist-single/marmara-blue.html
 *
 * CSS, fonts, JS, poster, stills and the film itself are embedded. The film is
 * decoded into a Blob URL at load, so large data: URIs never hit URL limits.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-single');
const pub = path.join(root, 'public');
const b64 = (p) => fs.readFileSync(p).toString('base64');
const MIME = { woff2: 'font/woff2', woff: 'font/woff', jpg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };
const dataUri = (p) => `data:${MIME[p.split('.').pop()]};base64,${b64(p)}`;
const STILLS = ['wake', 'davul', 'arch', 'couple', 'silk', 'festoon', 'night', 'night-2', 'aerial', 'aerial-far'];

let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const must = (re, label) => { if (!re.test(html)) throw new Error(`single build: ${label} not found`); };

// CSS → <style>, keeping only the font subsets a Turkish/English page uses.
must(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"[^>]*>/, 'stylesheet');
html = html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_, href) => {
  let css = fs.readFileSync(path.join(out, href), 'utf8');
  css = css.replace(/@font-face\{[^}]*\}/g, (rule) => (/(vietnamese|math|symbols)/.test(rule) ? '' : rule));
  css = css.replace(/,url\([^)]+\.woff\) format\("woff"\)/g, '');
  css = css.replace(/url\((\/assets\/[^)]+)\)/g, (_, u) => `url(${dataUri(path.join(out, u))})`);
  return `<style>${css}</style>`;
});

// JS → inline module (runs after parsing, like the external one).
must(/<script type="module"[^>]*src="\/assets\/[^"]+\.js"><\/script>/, 'entry script');
html = html.replace(/<script type="module"[^>]*src="(\/assets\/[^"]+\.js)"><\/script>/, (_, src) => {
  const js = fs.readFileSync(path.join(out, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

// Head links that only make sense on a server.
html = html
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<link rel="manifest"[^>]*>/g, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '')
  .replace(/\s*<link rel="icon" href="\/icons\/[^>]*>/g, '')
  .replace('href="/favicon.svg"', `href="${dataUri(path.join(pub, 'favicon.svg'))}"`);

// Film: poster embedded, <source> removed (the Blob URL is set below).
must(/<source src="\/videos\/marmara-blue-hero\.mp4"[^>]*>/, 'film source');
html = html
  .replace(/\s*<source src="\/videos\/marmara-blue-hero\.mp4"[^>]*>/, '')
  .replace('poster="/images/marmara-blue-poster.jpg"', `poster="${dataUri(path.join(pub, 'images/marmara-blue-poster.jpg'))}"`);

// Any remaining still reference becomes data-still (filled in below).
html = html.replace(/src="\/images\/stills\/([\w-]+)-\d+\.jpg"/g, 'data-still="$1"');
if (/(src|href|poster)="\/(images|videos|assets|icons)\//.test(html)) {
  throw new Error('single build: an asset path was left un-embedded');
}

const stills = Object.fromEntries(STILLS.map((n) => [n, dataUri(path.join(pub, `images/stills/${n}-720.webp`))]));
const tail = [
  `<script>window.__MB_STILLS__=${JSON.stringify(stills)};` +
    `document.querySelectorAll('img[data-still]').forEach(function(i){i.src=window.__MB_STILLS__[i.getAttribute('data-still')];});</script>`,
  `<script id="mb-film-data" type="application/octet-stream">${b64(path.join(pub, 'videos/marmara-blue-hero.mp4'))}</script>`,
  `<script>(function(){var d=document.getElementById('mb-film-data'),s=atob(d.textContent.trim()),n=s.length,b=new Uint8Array(n);` +
    `for(var i=0;i<n;i++)b[i]=s.charCodeAt(i);d.remove();` +
    `var u=URL.createObjectURL(new Blob([b],{type:'video/mp4'}));window.__MB_FILM__=u;document.getElementById('film').src=u;})();</script>`,
].join('\n');
html = html.replace('</body>', `${tail}\n</body>`);

const file = path.join(out, 'marmara-blue.html');
fs.writeFileSync(file, html);
console.log(`${path.relative(root, file)}  ${(fs.statSync(file).size / 1048576).toFixed(1)} MB`);
