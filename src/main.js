import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource/dm-mono/400.css';
import './styles/base.css';
import './styles/chapters.css';

import { createFilm } from './ui/film.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { createViewer } from './ui/viewer.js';
import { createCursor } from './ui/cursor.js';
import { createRequest } from './ui/request.js';
import { intro } from './ui/intro.js';

/*
 * A calm page: the film plays behind everything and nothing transforms on
 * scroll. Scrolling only moves the page; motion happens once, on load.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- navigation ---------- */
function go(hash, after) {
  const el = document.querySelector(hash);
  if (!el) return;
  const y = hash === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY;
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    after?.();
  };
  if (Math.abs(window.scrollY - y) < 2) return done();
  window.addEventListener('scrollend', done, { once: true });
  setTimeout(done, reduce ? 50 : 1400);
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}

/* ---------- global UI ---------- */
const film = createFilm(document.querySelector('.opening'));
const hud = createHud(document.querySelector('[data-hud]'));
createMenu({ onGo: (hash) => go(hash) });
createViewer();
createCursor();
createRequest({ onGo: go });

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  if (a.closest('#menu') || a.hasAttribute('data-request')) return;
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    go(hash);
  });
});

/* ---------- index "01 / 07": the chapter crossing the middle of the screen ---------- */
const chapters = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) hud.set(e.target.dataset.chapter, e.target.dataset.label);
  });
}, { rootMargin: '-50% 0px -50% 0px' });
document.querySelectorAll('[data-chapter]').forEach((sec) => chapters.observe(sec));

/* ---------- ink HUD over the ivory pages ---------- */
const ivory = new IntersectionObserver((entries) => {
  entries.forEach((e) => hud.ink(e.target.id || e.target.className, e.isIntersecting));
}, { rootMargin: '0px 0px -94% 0px' });
document.querySelectorAll('.moments, .scene--brunch').forEach((sec) => ivory.observe(sec));

/* ---------- once, on load ---------- */
if (!reduce) {
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  fontsReady.then(() => intro(film));
}
