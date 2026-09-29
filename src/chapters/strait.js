import { gsap } from 'gsap';

/**
 * SOMEWHERE BETWEEN ASIA & EUROPE. A column rises from a slit.
 * "BACKDROP." slides *behind* the photograph; "experience." lands in front.
 */
export function strait({ desktop, register }) {
  const root = document.querySelector('.strait');
  const stage = root.querySelector('.strait__stage');
  const whisper = root.querySelector('[data-whisper]');
  const column = root.querySelector('[data-column]');
  const img = column.querySelector('img');
  const coord = root.querySelector('[data-coord]');
  const l1 = root.querySelector('.strait__l1');
  const l2 = root.querySelector('.strait__l2');
  const l3 = root.querySelector('.strait__l3');
  const l4 = root.querySelector('.strait__l4');
  const l5 = root.querySelector('.strait__l5');
  const note = root.querySelector('[data-note]');

  // The whisper surfaces out of the dark as the chapter arrives.
  gsap.fromTo(whisper.children,
    { autoAlpha: 0, y: 14 },
    {
      autoAlpha: 1, y: 0, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 15%', scrub: true },
    });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${innerHeight * (desktop ? 2.6 : 2.3)}`,
      pin: stage,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(column,
    { clipPath: 'inset(49.4% 46% 49.4% 46%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.1, ease: 'power2.inOut' }, 0.5)
    .fromTo(img, { scale: 1.4 }, { scale: 1, duration: 2.6 }, 0.5)
    .fromTo(coord, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 1.9)
    .to(whisper, { autoAlpha: 0, duration: 0.6 }, 2.2)
    .fromTo(l1, { xPercent: -35, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.5 }, 2.2)
    .fromTo(l2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.9)
    // BACKDROP travels from the right edge and ends up behind the column.
    .fromTo(l3, { x: () => innerWidth }, { x: 0, duration: 2.1, ease: 'power1.out' }, 2.9)
    .fromTo(l4, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 4.6)
    .fromTo(l5, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 4.8)
    .to(l3, { opacity: 0.24, duration: 1 }, 5.2)
    .fromTo(note, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 5.8)
    .to({}, { duration: 0.8 });

  register(root, tl.scrollTrigger);
}
