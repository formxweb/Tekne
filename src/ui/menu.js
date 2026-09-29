import { STILL_TC, still } from '../data/film.js';
import { EXPO_IN_OUT, EXPO_OUT, reducedMotion, lockScroll } from '../lib/motion.js';

/**
 * Fullscreen index on a native modal <dialog>: focus is trapped, the page
 * behind is inert, Esc closes, and focus returns to the button that opened it.
 */
export function createMenu({ onGo }) {
  const dialog = document.getElementById('menu');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = dialog.querySelector('[data-menu-close]');
  const words = dialog.querySelectorAll('.menu__w');
  const img = dialog.querySelector('[data-menu-img]');
  const tcEl = dialog.querySelector('[data-menu-tc]');
  let busy = false;

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollLeft = 0;
    lockScroll(true);
    openBtn.setAttribute('aria-expanded', 'true');
    if (reducedMotion()) return;
    dialog.animate(
      [{ clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
      { duration: 900, easing: EXPO_IN_OUT },
    );
    words.forEach((w, i) => w.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 1200, delay: 300 + i * 60, easing: EXPO_OUT, fill: 'backwards' },
    ));
  }

  function close(then) {
    if (!dialog.open || busy) return;
    const done = () => {
      busy = false;
      dialog.close();
      lockScroll(false);
      openBtn.setAttribute('aria-expanded', 'false');
      if (then) then();
      else openBtn.focus();
    };
    if (reducedMotion()) return done();
    busy = true;
    const anim = dialog.animate(
      [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)' }],
      { duration: 750, easing: EXPO_IN_OUT, fill: 'forwards' },
    );
    anim.onfinish = () => { done(); anim.cancel(); };
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

  dialog.querySelectorAll('[data-go]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = a.getAttribute('href');
      close(() => onGo(hash));
    });
  });

  dialog.querySelectorAll('[data-preview]').forEach((a) => {
    const show = () => {
      const name = a.dataset.preview;
      img.src = still(name, 480);
      tcEl.textContent = `TC ${STILL_TC[name] ?? ''}`;
    };
    a.addEventListener('pointerenter', show);
    a.addEventListener('focus', show);
  });
}
