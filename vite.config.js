import { defineConfig } from 'vite';

/**
 * <mb-still name="arch" alt="…" sizes="…" class="…" loading="lazy" />
 * expands at build time into a responsive <picture> (AVIF → WebP → JPEG),
 * so every frame from the film ships as static, crawlable markup.
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
          `/images/stills/${name}-480.${ext} 480w, /images/stills/${name}-720.${ext} 720w`;
        return (
          `<picture${cls}>` +
          `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
          `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
          `<img src="/images/stills/${name}-720.jpg" srcset="${set('jpg')}" sizes="${sizes}" ` +
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
    cssCodeSplit: false,
  },
  server: { host: true },
  preview: { host: true },
});
