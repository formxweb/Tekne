import './styles/fonts.css';
import './styles/base.css';
import './styles/chapters.css';

import { createFilm } from './ui/film.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { createViewer } from './ui/viewer.js';
import { createCursor } from './ui/cursor.js';
import { createRequest } from './ui/request.js';
import { createConsent } from './ui/consent.js';
import { initAnalytics, track } from './lib/analytics.js';
import { reducedMotion } from './lib/motion.js';

/*
 * A calm page: the film plays behind everything and nothing transforms on
 * scroll. The load reveal is pure CSS; this script only wires interactions.
 */

/* ---------- in-page navigation ---------- */
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
  if (Math.abs(window.scrollY - y) < 2) {
    done();
    return;
  }
  window.addEventListener('scrollend', done, { once: true });
  setTimeout(done, reducedMotion() ? 50 : 1400);
  window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/* ---------- interactions ---------- */
const hud = createHud(document.querySelector('[data-hud]'));
createFilm(document.querySelector('.opening'));
createMenu({ onGo: (hash) => go(hash) });
createViewer();
createCursor();
createRequest({ onGo: go });
initAnalytics();
createConsent();

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  if (a.closest('#menu') || a.hasAttribute('data-request')) return;
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (hash.length < 2 || !document.querySelector(hash)) return;
    e.preventDefault();
    go(hash);
  });
});

/* ---------- conversion clicks (no-op without analytics) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  const where = a.closest('[id]')?.id || 'page';
  if (href.startsWith('https://wa.me/')) track('whatsapp_click', { location: where });
  else if (href.startsWith('tel:')) track('phone_click', { location: where });
  else if (href.includes('instagram.com/')) track('instagram_click', { location: where });
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
  entries.forEach((e) => hud.ink(e.target.id, e.isIntersecting));
}, { rootMargin: '0px 0px -94% 0px' });
document.querySelectorAll('.moments, .scene--brunch').forEach((sec) => ivory.observe(sec));
