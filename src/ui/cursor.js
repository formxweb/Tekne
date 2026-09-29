import { gsap } from 'gsap';

/** A small label that trails the pointer over media: VIEW MOMENT, EXPLORE, DISCOVER. */
export function createCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const tag = document.querySelector('[data-cursor-tag]');
  const label = tag.firstElementChild;
  const xTo = gsap.quickTo(tag, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(tag, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (t) {
      label.textContent = t.dataset.cursor;
      tag.classList.add('is-on');
    } else {
      tag.classList.remove('is-on');
    }
  });
  document.documentElement.addEventListener('pointerleave', () => tag.classList.remove('is-on'));
}
