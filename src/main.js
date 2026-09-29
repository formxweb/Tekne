import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource/dm-mono/400.css';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/chapters.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { createFilm } from './ui/film.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { createViewer } from './ui/viewer.js';
import { createCursor } from './ui/cursor.js';
import { createRequest } from './ui/request.js';
import { createSheet } from './ui/sheet.js';
import { intro, opening } from './chapters/opening.js';
import { strait } from './chapters/strait.js';
import { experiences } from './chapters/experiences.js';
import { fleet } from './chapters/fleet.js';
import { moments } from './chapters/moments.js';
import { gram, finale } from './chapters/finale.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const MQ = {
  desktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
};
const html = document.documentElement;
const reduceAtLoad = matchMedia(MQ.reduce).matches;

/* ---------- smooth scroll (never with reduced motion) ---------- */
let lenis = null;
if (!reduceAtLoad) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- navigation ---------- */
function focusSection(el) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function go(hash, after) {
  const el = document.querySelector(hash);
  if (!el) return;
  const y = hash === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY;
  const done = () => { focusSection(el); after?.(); };
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.9, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: done, force: true });
  } else {
    window.scrollTo(0, y);
    done();
  }
}

/* ---------- global UI ---------- */
const film = createFilm(document.querySelector('.opening'));
const hud = createHud(document.querySelector('[data-hud]'));
createMenu({ onGo: (hash) => go(hash), lenis });
createViewer({ film, lenis });
createCursor();
createRequest({ onGo: go });
createSheet();

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  if (a.closest('#menu') || a.hasAttribute('data-request')) return;
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    go(hash);
  });
});

/* ---------- keyboard focus inside pinned chapters ---------- */
const pins = [];
const register = (root, st, resolve) => pins.push({ root, st, resolve });

const isFaded = (el, stop) => {
  for (let n = el; n && n !== stop; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (parseFloat(cs.opacity) < 0.3 || cs.visibility === 'hidden') return true;
  }
  return false;
};

document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (!(el instanceof HTMLElement) || !el.matches(':focus-visible')) return;
  const pin = pins.find((p) => p.root.contains(el));
  if (!pin) return;
  let y = pin.resolve ? pin.resolve(el) : null;
  if (y == null && isFaded(el, pin.root)) y = pin.st.end - 2;
  if (y == null) return;
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
});

/* ---------- chapter index: 01 / 07 ---------- */
function indexChapters() {
  document.querySelectorAll('[data-chapter]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle(self) { if (self.isActive) hud.set(sec.dataset.chapter, sec.dataset.label); },
    });
  });
}

/* ---------- build, once type has loaded (sizes depend on it) ---------- */
const fontsReady = Promise.race([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 1600)),
]);

fontsReady.then(() => {
  if (!reduceAtLoad) intro(film);

  let first = true;
  gsap.matchMedia().add(MQ, (ctx) => {
    const { desktop, mobile, reduce } = ctx.conditions;
    html.classList.toggle('motion', !reduce);
    html.classList.toggle('reduce', !!reduce);
    pins.length = 0;

    const cleanups = [];
    if (!reduce) {
      const env = { desktop, mobile, film, hud, register };
      opening(env);
      strait(env);
      experiences(env);
      cleanups.push(fleet(env));
      moments(env);
      gram();
      finale();
    }
    indexChapters();

    if (first) {
      first = false;
      if (location.hash.length > 1) {
        requestAnimationFrame(() => {
          const el = document.querySelector(location.hash);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY;
            if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
            else window.scrollTo(0, y);
          }
        });
      }
    }

    return () => {
      cleanups.forEach((fn) => fn?.());
      hud.ink('moments', false);
      hud.ink('brunch', false);
    };
  });
});
