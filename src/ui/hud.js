/** Floating index: "01 / 07 — OPENING". Ink colour on ivory chapters. */
export function createHud(el) {
  const now = el.querySelector('[data-hud-now]');
  const label = el.querySelector('[data-hud-label]');
  const inkers = new Set();
  let current = '';

  return {
    set(num, text) {
      if (num === current) return;
      current = num;
      now.textContent = num;
      label.textContent = text;
    },
    ink(key, on) {
      if (on) inkers.add(key);
      else inkers.delete(key);
      el.classList.toggle('is-ink', inkers.size > 0);
    },
  };
}
