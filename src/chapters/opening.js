import { gsap } from 'gsap';

/**
 * Load sequence, run once. ISTANBUL 41°N first; MARMARA arrives on the
 * film's first cut (≈2.2 s); BLUE crosses in after it.
 */
export function intro(film) {
  const root = document.querySelector('.opening');
  const tl = gsap.timeline({ paused: true });
  // y: 0 clears the px offset GSAP would otherwise parse from the CSS hidden state.
  tl.fromTo(root.querySelectorAll('.opening__city .ln > span'),
    { y: 0, yPercent: 110 },
    { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.14 }, 0.2)
    .fromTo(root.querySelector('.opening__marmara .in'),
      { y: 0, yPercent: 105 },
      { yPercent: 0, duration: 1.8, ease: 'expo.out' }, 1.95)
    .fromTo(root.querySelector('.opening__blue .in'),
      { y: 0, yPercent: 0, xPercent: 26, autoAlpha: 0 },
      { xPercent: 0, autoAlpha: 1, duration: 2.6, ease: 'expo.out' }, 2.45)
    .fromTo(root.querySelectorAll('.opening__foot > *'),
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 3.0);

  document.documentElement.classList.add('booted');
  // Start with the reel so the type lands on the cut; never wait long.
  film.whenPlaying(() => tl.play(), 1400);
}

/**
 * First scroll: the reel is held, the frame contracts and zooms, the word
 * MARMARA travels behind it, and the screen splits on the Strait Line.
 */
export function opening({ desktop, film, register }) {
  const root = document.querySelector('.opening');
  const stage = root.querySelector('.opening__stage');
  const plate = root.querySelector('[data-plate]');
  const zoom = root.querySelector('[data-zoom]');
  const marmara = root.querySelector('.opening__marmara');
  const blue = root.querySelector('.opening__blue');
  const city = root.querySelector('[data-city]');
  const foot = root.querySelector('.opening__foot');
  const bars = root.querySelectorAll('[data-bar]');
  const strait = root.querySelector('[data-strait]');
  const line = strait.querySelector('.strait-line');
  const labels = strait.querySelectorAll('.t-meta');
  const held = root.querySelector('[data-held]');
  const span = root.querySelector('.opening__span');

  const contract = desktop ? 'inset(17% 21% 17% 39%)' : 'inset(19% 8% 23% 8%)';
  const split = desktop ? 'inset(0% 0% 0% 50%)' : 'inset(50% 0% 0% 0%)';
  const exit = desktop ? 'inset(0% 0% 0% 100%)' : 'inset(100% 0% 0% 0%)';
  const lineAxis = desktop ? 'scaleY' : 'scaleX';

  gsap.set(plate, { clipPath: 'inset(0% 0% 0% 0%)' });
  gsap.set(line, { [lineAxis]: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${innerHeight * (desktop ? 3.3 : 2.7)}`,
      pin: stage,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        if (self.progress > 0.03) film.hold();
        else film.release();
      },
    },
  });

  tl
    // Video 1.00 → 1.08 while type drifts at its own speed.
    .to(zoom, { scale: 1.08, duration: 1.3 }, 0)
    .to(marmara, { yPercent: desktop ? -70 : 18, xPercent: desktop ? -5 : 0, duration: 1.5 }, 0)
    .to(blue, { xPercent: 16, yPercent: 8, duration: 1.5 }, 0)
    .to([city, foot], { autoAlpha: 0, duration: 0.45 }, 0)
    .to(held, { autoAlpha: 1, duration: 0.3 }, 0.3)
    // Letterbox: this is now a film still.
    .to(bars, { scaleY: 1, duration: 1 }, 0.9)
    .to([marmara, blue], { autoAlpha: 0, duration: 0.7 }, 1.1)
    // The held frame contracts into a print and keeps zooming.
    .to(plate, { clipPath: contract, duration: 2.3, ease: 'power1.inOut' }, 2)
    .to(zoom, { scale: 1.34, duration: 2.7 }, 2)
    // The name travels behind it.
    .fromTo(span,
      { x: 0, autoAlpha: 1 },
      { x: () => -(innerWidth + span.offsetWidth), duration: 5.6 }, 2.1)
    .to(bars, { scaleY: 0, duration: 1 }, 4.8)
    // The screen splits on the Strait Line.
    .to(plate, { clipPath: split, duration: 1.9, ease: 'power2.inOut' }, 4.7)
    .to(zoom, { scale: 1.12, duration: 1.9, ease: 'power1.inOut' }, 4.7)
    .set(strait, { autoAlpha: 1 }, 5.2)
    .to(line, { [lineAxis]: 1, duration: 1.3, ease: 'power2.out' }, 5.3)
    .fromTo(labels, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.18 }, 6.0)
    .to(held, { autoAlpha: 0, duration: 0.4 }, 6.1)
    // Hold the split, then the photograph is pushed out; navy remains.
    .to(plate, { clipPath: exit, duration: 1.6, ease: 'power2.in' }, 8.1)
    .to([labels, line], { autoAlpha: 0, duration: 0.7 }, 8.5)
    .to(stage, { backgroundColor: '#0a1628', duration: 1.4 }, 8.3)
    .to({}, { duration: 0.5 });

  register(root, tl.scrollTrigger);
}
