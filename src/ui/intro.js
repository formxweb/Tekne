import { gsap } from 'gsap';

/**
 * Runs once on load, never on scroll: ISTANBUL 41°N, then MARMARA / BLUE,
 * then the line of copy. Everything then stays still over the film.
 */
export function intro(film) {
  const root = document.querySelector('.opening');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  // y: 0 clears the px offset GSAP would otherwise parse from the CSS hidden state.
  tl.fromTo(root.querySelectorAll('.opening__city .ln > span'),
    { y: 0, yPercent: 110 },
    { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.1)
    .fromTo(root.querySelector('.opening__marmara .in'),
      { y: 0, yPercent: 105 },
      { yPercent: 0, duration: 1.5 }, 0.45)
    .fromTo(root.querySelector('.opening__blue .in'),
      { y: 0, yPercent: 0, xPercent: 18, autoAlpha: 0 },
      { xPercent: 0, autoAlpha: 1, duration: 1.8 }, 0.75)
    .fromTo(root.querySelector('[data-intro]'),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 1.1 }, 1.25)
    .fromTo(root.querySelectorAll('.opening__foot > *'),
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 1.4);

  document.documentElement.classList.add('booted');
  film.whenPlaying(() => tl.play(), 700);
}
