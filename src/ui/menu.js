import { gsap } from 'gsap';
import { STILL_TC } from '../data/film.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fullscreen index built on <dialog>: native focus trap, Esc, inert page. */
export function createMenu({ onGo, lenis }) {
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
    lenis?.stop();
    if (reduced()) return;
    gsap.fromTo(dialog,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' });
    gsap.fromTo(words,
      { yPercent: 105 },
      { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.3 });
  }

  function close(then) {
    if (!dialog.open || busy) return;
    const done = () => {
      busy = false;
      dialog.close();
      gsap.set(dialog, { clearProps: 'clipPath' });
      lenis?.start();
      then?.();
    };
    if (reduced()) return done();
    busy = true;
    gsap.to(dialog, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut', onComplete: done });
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
      img.src = `/images/stills/${name}-480.jpg`;
      tcEl.textContent = `TC ${STILL_TC[name] ?? ''}`;
    };
    a.addEventListener('pointerenter', show);
    a.addEventListener('focus', show);
  });

  return { open, close };
}
