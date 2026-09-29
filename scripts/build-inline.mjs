/**
 * "Copy-paste" build: every page as ONE html file with its CSS and JS inside.
 * Media (video, poster, stills, fonts, icons) stay as separate files next to
 * it — nothing is Base64-embedded — and all paths are relative, so the folder
 * works wherever it is uploaded.
 *
 *   npm run build:inline   →   dist-inline/   (does its own Vite build)
 *
 * The security headers are regenerated with the SHA-256 hashes of the inline
 * <script>/<style> blocks, so the strict CSP (no 'unsafe-inline') still holds.
 * If you edit the inline code by hand, rerun this build to refresh the hashes.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-inline');

// A separate build with a relative base ('./'), so the JS, the stills and the
// CSS point at their files relative to the page, not at the domain root.
process.env.BASE_PATH = './';
await build({ root, logLevel: 'warn', build: { outDir: out, emptyOutDir: true } });

// Safety net: any root-absolute site path left → relative (https:// untouched).
const relAttr = (html) => html
  .replace(/(href|src|poster|data-src|content)="\/(?!\/)([^"]*)"/g, (m, attr, rest) => {
    if (attr === 'content') return m;
    return `${attr}="${rest === '' ? 'index.html' : rest}"`;
  })
  .replace(/srcset="([^"]*)"/g, (m, set) => `srcset="${set.replace(/(^|,\s*)\//g, '$1')}"`);
// CSS moved from assets/ into the page: "../fonts/x" and "/fonts/x" → "fonts/x".
const relCss = (css) => css.replace(/url\((['"]?)(?:\.\.\/|\/(?!\/))/g, 'url($1');
const relJs = (js) => js
  .replaceAll('"/videos/', '"videos/').replaceAll('`/videos/', '`videos/')
  .replaceAll('"/images/', '"images/').replaceAll('`/images/', '`images/');

const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const scriptHashes = new Set();
const styleHashes = new Set();

for (const file of fs.readdirSync(out).filter((f) => f.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(out, file), 'utf8');

  html = html.replace(/<link rel="stylesheet"[^>]*href="(?:\.?\/)?(assets\/[^"]+\.css)"[^>]*>/g, (_, href) => {
    const css = relCss(fs.readFileSync(path.join(out, href), 'utf8'));
    styleHashes.add(sha(css));
    return `<style>${css}</style>`;
  });
  html = html.replace(/<script type="module"[^>]*src="(?:\.?\/)?(assets\/[^"]+\.js)"><\/script>/g, (_, s) => {
    const js = relJs(fs.readFileSync(path.join(out, s), 'utf8')).replace(/<\/script/gi, '<\\/script');
    scriptHashes.add(sha(js));
    return `<script type="module">${js}</script>`;
  });
  html = relAttr(html)
    .replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
    // An absolute <base> (404.html) would break the relative paths; "./" does
    // not open the start page from a double-clicked file.
    .replace(/\s*<base href="[^"]*">/g, '')
    .replaceAll('href="./"', 'href="index.html"');

  fs.writeFileSync(path.join(out, file), html);
}
// Every page must now be self-contained before the bundle folder goes away.
for (const file of fs.readdirSync(out).filter((f) => f.endsWith('.html'))) {
  if (/assets\/[^"]+\.(css|js)"/.test(fs.readFileSync(path.join(out, file), 'utf8'))) {
    throw new Error(`build-inline: ${file} still references assets/ — not inlined`);
  }
}
fs.rmSync(path.join(out, 'assets'), { recursive: true, force: true });

const withHashes = (policy) => policy
  .replace("script-src 'self'", `script-src 'self' ${[...scriptHashes].join(' ')}`)
  .replace("style-src 'self'", `style-src 'self' ${[...styleHashes].join(' ')}`);

// The <meta> CSP (for hosts without headers, e.g. GitHub Pages) gets the hashes too.
for (const file of fs.readdirSync(out).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(out, file), 'utf8')
    .replace(/(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/, (m, a, c, z) => a + withHashes(c) + z);
  fs.writeFileSync(path.join(out, file), html);
}

// Security headers with the inline hashes (Netlify / Cloudflare: _headers; Vercel: vercel.json).
const headersFile = fs.readFileSync(path.join(out, '_headers'), 'utf8');
const cspLine = headersFile.match(/Content-Security-Policy: (.*)/)[1];
const csp = withHashes(cspLine);
fs.writeFileSync(path.join(out, '_headers'), headersFile.replace(cspLine, csp).replace(/^\/assets\/\*\n.*\n\n/m, ''));

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
delete vercel.framework;
delete vercel.buildCommand;
delete vercel.outputDirectory;
vercel.headers = vercel.headers.filter((h) => h.source !== '/assets/(.*)');
vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value = csp;
fs.writeFileSync(path.join(out, 'vercel.json'), `${JSON.stringify(vercel, null, 2)}\n`);

const size = (f) => `${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`;
console.log(`dist-inline/index.html  ${size('index.html')}  (CSS + JS inside, media as files)`);
