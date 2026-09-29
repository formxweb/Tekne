import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/*
 * Base path. Default '/' (domain root: marmara.blue on Vercel/Netlify/
 * Cloudflare). GitHub Pages sets BASE_PATH to '/<repo>/' (project site) or '/'
 * (custom domain), see .github/workflows/pages.yml. A relative, drop-anywhere
 * copy is made by `npm run build:inline`.
 */
const base = process.env.BASE_PATH || '/';

/*
 * Content-Security-Policy as a <meta> tag, for hosts that cannot send HTTP
 * headers (GitHub Pages). Same policy as public/_headers minus frame-ancestors,
 * which browsers ignore in <meta>. Build only: the dev server injects inline code.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "style-src 'self'",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

function securityMeta() {
  return {
    name: 'mb-security-meta',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      let out = html.replace(
        /(<meta name="viewport"[^>]*>)/,
        `$1\n  <meta http-equiv="Content-Security-Policy" content="${CSP}">\n  <meta name="referrer" content="strict-origin-when-cross-origin">`,
      );
      // 404 is served for any missing path (any depth): anchor its relative URLs.
      if (ctx.filename.endsWith('404.html') && base.startsWith('/')) {
        out = out.replace('<head>', `<head>\n  <base href="${base}">`);
      }
      return out;
    },
  };
}

/**
 * <mb-still name="arch" alt="…" sizes="…" class="…" loading="lazy" />
 * expands at build time into a responsive <picture> (AVIF → WebP) with
 * srcset at 240/480/720 w, intrinsic width/height (no layout shift), lazy loading
 * and async decoding, so every frame from the film ships as static markup.
 */
function stills() {
  const attrRe = /([\w-]+)="([^"]*)"/g;
  // Relative base → paths relative to the page; absolute base → prefixed.
  const prefix = base.startsWith('/') ? base : '';
  return {
    name: 'mb-stills',
    transformIndexHtml(html) {
      return html.replace(/<mb-still\s+([\s\S]*?)\/>/g, (_, raw) => {
        const a = {};
        for (const [, k, v] of raw.matchAll(attrRe)) a[k] = v;
        const { name, alt = '', sizes = '(max-width: 760px) 100vw, 40vw' } = a;
        const cls = a.class ? ` class="${a.class}"` : '';
        const loading = a.loading ?? 'lazy';
        const prio = a.fetchpriority ? ` fetchpriority="${a.fetchpriority}"` : '';
        const url = (w, ext) => `${prefix}images/stills/${name}-${w}.${ext}`;
        const set = (ext) => [240, 480, 720].map((w) => `${url(w, ext)} ${w}w`).join(', ');
        return (
          `<picture${cls}>` +
          `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
          `<img src="${url(720, 'webp')}" srcset="${set('webp')}" sizes="${sizes}" ` +
          `width="720" height="1280" alt="${alt}" loading="${loading}" decoding="async"${prio}>` +
          `</picture>`
        );
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [stills(), securityMeta()],
  build: {
    target: 'es2019',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'gizlilik-politikasi.html'),
        kvkk: resolve(import.meta.dirname, 'kvkk-aydinlatma-metni.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  server: { host: true },
  preview: { host: true },
});
