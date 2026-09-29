import { gsap } from 'gsap';

/** 06 — the handle drifts apart; 07 — end credits, LET'S / GO. */
export function gram() {
  const root = document.querySelector('.gram');
  const a = root.querySelector('[data-gram-a]');
  const b = root.querySelector('[data-gram-b]');
  const st = { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true };
  // Small, opposite drifts: the handle must stay legible.
  gsap.fromTo(a, { xPercent: 2.5 }, { xPercent: -2.5, ease: 'none', scrollTrigger: st });
  gsap.fromTo(b, { xPercent: -6 }, { xPercent: 4, ease: 'none', scrollTrigger: { ...st } });
}

export function finale() {
  const root = document.querySelector('.finale');
  const whisper = root.querySelector('[data-finale-whisper]');
  const lets = root.querySelector('[data-lets]');
  const go = root.querySelector('[data-gow]');
  const acts = root.querySelectorAll('[data-acts] > li');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 62%', toggleActions: 'play none none reverse' },
  });
  tl.fromTo(whisper.children, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'expo.out' })
    .fromTo(lets, { xPercent: -14, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.6, ease: 'expo.out' }, 0.5)
    .fromTo(go, { xPercent: 10, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.8, ease: 'expo.out' }, 0.8)
    .fromTo(acts, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, 1.2);

  // The last word keeps settling as the page runs out, like a final frame.
  gsap.fromTo(go, { scale: 0.94 }, {
    scale: 1,
    transformOrigin: '0% 100%',
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}
