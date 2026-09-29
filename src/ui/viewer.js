import { SHOTS, FILM_SRC, still } from '../data/film.js';
import { tc } from '../lib/tc.js';
import { EXPO_OUT, reducedMotion, lockScroll } from '../lib/motion.js';

/**
 * "VIEW MOMENT": every still is a frame of the film, so opening one plays the
 * film from that shot and loops inside it. Native modal <dialog>: Esc closes
 * and focus returns to the frame that opened it.
 */
export function createViewer() {
  const dialog = document.getElementById('viewer');
  const v = dialog.querySelector('[data-viewer-film]');
  const titleEl = dialog.querySelector('[data-viewer-title]');
  const tcEl = dialog.querySelector('[data-viewer-tc]');
  const closeBtn = dialog.querySelector('[data-viewer-close]');
  const frame = dialog.querySelector('.viewer__frame');
  let shot = null;
  let raf = 0;
  let opener = null;

  const loop = () => {
    if (shot && (v.currentTime >= shot.end - 0.05 || v.currentTime < shot.start - 0.1)) {
      v.currentTime = shot.start;
    }
    tcEl.textContent = tc(v.currentTime);
    raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (!shot || !dialog.open) return;
    v.currentTime = shot.at;
    const p = v.play();
    if (p && p.catch) p.catch(() => { /* the poster frame stays; nothing to recover */ });
  };

  function open(key) {
    const next = SHOTS[key];
    if (!next || dialog.open) return;
    shot = next;
    opener = document.activeElement;
    titleEl.textContent = shot.title;
    v.setAttribute('aria-label', `Film: ${shot.title}`);
    v.poster = still(key);
    if (!v.getAttribute('src')) {
      v.preload = 'auto';
      v.src = FILM_SRC;
      v.addEventListener('loadedmetadata', start);
    }
    dialog.showModal();
    lockScroll(true);
    if (v.readyState >= 1) start();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
    if (!reducedMotion()) {
      frame.animate(
        [{ clipPath: 'inset(46% 40% 46% 40%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
        { duration: 900, easing: EXPO_OUT },
      );
    }
  }

  function close() {
    if (!dialog.open) return;
    v.pause();
    cancelAnimationFrame(raf);
    raf = 0;
    dialog.close();
    lockScroll(false);
    if (opener && opener.isConnected) opener.focus();
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
}
