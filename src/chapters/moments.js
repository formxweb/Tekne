import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The light table. Prints lie where they were dropped (one huge, three tiny,
 * one vertical). Scrolling lines them up into a single cinematic strip, in
 * the order they occur in the film.
 */
export function moments({ desktop, hud, register }) {
  const root = document.querySelector('.moments');
  const stage = root.querySelector('.moments__stage');
  const title = root.querySelector('.moments__title');
  const prints = [...root.querySelectorAll('.print')];
  const end = root.querySelector('[data-moments-end]');

  const rect = () => ({ W: stage.offsetWidth, H: stage.offsetHeight });

  // Aligned composition: desktop = one strip; phone = two rows of three.
  const target = (i) => {
    const { W, H } = rect();
    if (desktop) {
      const gap = W * 0.014;
      const h = Math.min(H * 0.5, ((W * 0.8 - gap * 5) / 6) * (16 / 9));
      const w = h * (9 / 16);
      const total = w * 6 + gap * 5;
      return { x: (W - total) / 2 + W * 0.045 + i * (w + gap), y: H * 0.5 - h / 2 - H * 0.02, w, h };
    }
    const gap = 10;
    const cols = 3;
    const w = (W - 32 - gap * (cols - 1)) / cols;
    const h = w * (16 / 9);
    const rowGap = 78; // room for wrapped captions
    const top = H * 0.5 - (h * 2 + rowGap) / 2 + H * 0.02;
    return { x: 16 + (i % cols) * (w + gap), y: top + Math.floor(i / cols) * (h + rowGap), w, h };
  };

  prints.forEach((p) => gsap.set(p, { rotation: parseFloat(getComputedStyle(p).getPropertyValue('--r')) || 0 }));

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${innerHeight * (desktop ? 2.3 : 2)}`,
      pin: stage,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) { stage.classList.toggle('is-aligned', self.progress > 0.55); },
    },
  });

  // A slight drift first, as if the table were nudged…
  tl.to(prints, { y: (i) => (i % 2 ? -1 : 1) * 14, duration: 0.6 }, 0);

  // …then every print travels to its place in the strip.
  prints.forEach((p, i) => {
    tl.to(p, {
      left: () => target(i).x,
      top: () => target(i).y,
      width: () => target(i).w,
      height: () => target(i).h,
      rotation: 0,
      y: 0,
      duration: 2,
      ease: 'power2.inOut',
    }, 0.6 + i * 0.09);
  });

  tl.to(title, { yPercent: 18, autoAlpha: 0.2, duration: 2.4 }, 0.6)
    .fromTo(end, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 3.1)
    .to({}, { duration: 0.8 });

  // Ivory chapter: the HUD reads in ink while it's on screen.
  ScrollTrigger.create({
    trigger: root,
    start: 'top top+=40',
    end: 'bottom top+=40',
    onToggle(self) { hud.ink('moments', self.isActive); },
  });

  register(root, tl.scrollTrigger);
}
