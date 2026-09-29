import { gsap } from 'gsap';
import { SHOTS, FILM_SRC, still } from '../data/film.js';
import { tc } from '../lib/tc.js';

/**
 * "VIEW MOMENT": every still is a frame of the film, so opening one plays the
 * film from that shot and loops inside it.
 */
export function createViewer({ film, lenis }) {
  const dialog = document.getElementById('viewer');
  const v = dialog.querySelector('[data-viewer-film]');
  const titleEl = dialog.querySelector('[data-viewer-title]');
  const tcEl = dialog.querySelector('[data-viewer-tc]');
  const soundBtn = dialog.querySelector('[data-viewer-sound]');
  const closeBtn = dialog.querySelector('[data-viewer-close]');
  let shot = null;
  let raf = 0;
  let sound = false;

  const loop = () => {
    if (shot && (v.currentTime >= shot.end - 0.05 || v.currentTime < shot.start - 0.1)) {
      v.currentTime = shot.start;
    }
    tcEl.textContent = tc(v.currentTime);
    raf = requestAnimationFrame(loop);
  };

  function open(key) {
    shot = SHOTS[key];
    if (!shot) return;
    titleEl.textContent = shot.title;
    v.poster = still(key);
    v.muted = !sound;
    if (!v.getAttribute('src')) {
      v.preload = 'auto';
      v.src = FILM_SRC;
    }
    dialog.showModal();
    lenis?.stop();
    const start = () => {
      v.currentTime = shot.at;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (v.readyState >= 1) start();
    else v.addEventListener('loadedmetadata', start, { once: true });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(dialog.querySelector('.viewer__frame'),
        { clipPath: 'inset(46% 40% 46% 40%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' });
    }
  }

  function close() {
    v.pause();
    cancelAnimationFrame(raf);
    dialog.close();
    lenis?.start();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-moment]');
    if (!btn) return;
    e.preventDefault();
    open(btn.dataset.moment);
  });

  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  soundBtn.addEventListener('click', () => {
    sound = !sound;
    v.muted = !sound;
    soundBtn.textContent = sound ? 'Sound on' : 'Sound off';
    soundBtn.setAttribute('aria-pressed', String(sound));
  });

  return { open, close };
}
