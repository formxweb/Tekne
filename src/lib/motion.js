/** Shared motion constants (Web Animations API, no animation library). */
export const EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EXPO_IN_OUT = 'cubic-bezier(0.87, 0, 0.13, 1)';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Background scroll lock while a modal dialog is open. */
export function lockScroll(on) {
  document.documentElement.classList.toggle('is-locked', on);
}
