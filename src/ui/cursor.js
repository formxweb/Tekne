/** A small label that trails the pointer over media: VIEW MOMENT, EXPLORE, DISCOVER. */
export function createCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const tag = document.querySelector('[data-cursor-tag]');
  if (!tag) return;
  const label = tag.firstElementChild;
  let x = 0;
  let y = 0;
  let queued = false;

  // One style write per frame; the CSS transition provides the trailing ease.
  window.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      tag.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, { passive: true });

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
