import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * <mb-still name="arch" alt="…" sizes="…" class="…" loading="lazy" />
 * expands at build time into a responsive <picture> (AVIF → WebP) with
 * srcset at 240/480/720 w, intrinsic width/height (no layout shift), lazy loading
 * and async decoding, so every frame from the film ships as static markup.
 */
function stills() {
  const attrRe = /([\w-]+)="([^"]*)"/g;
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
        const set = (ext) =>
          [240, 480, 720].map((w) => `/images/stills/${name}-${w}.${ext} ${w}w`).join(', ');
        return (
          `<picture${cls}>` +
          `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
          `<img src="/images/stills/${name}-720.webp" srcset="${set('webp')}" sizes="${sizes}" ` +
          `width="720" height="1280" alt="${alt}" loading="${loading}" decoding="async"${prio}>` +
          `</picture>`
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [stills()],
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
