import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Vertical scroll becomes horizontal travel along the shore, scene by scene. */
export function experiences({ desktop, hud, register }) {
  const root = document.querySelector('.xp');
  const stage = root.querySelector('.xp__stage');
  const track = root.querySelector('[data-track]');
  const bar = root.querySelector('[data-xp-bar]');
  const sceneNow = root.querySelector('[data-scene-now]');
  const xpHud = root.querySelector('.xp__hud');
  const scenes = [...root.querySelectorAll('.scene')];

  const distance = () => track.scrollWidth - innerWidth;

  const travel = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: stage,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) { bar.style.transform = `scaleX(${self.progress})`; },
    },
  });

  // The intro word drifts slower than the track: text displacement.
  gsap.to(root.querySelector('.xp__title'), {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { trigger: root.querySelector('.xp__intro'), containerAnimation: travel, start: 'left left', end: 'right left', scrub: true },
  });

  scenes.forEach((scene) => {
    ScrollTrigger.create({
      trigger: scene,
      containerAnimation: travel,
      start: 'left 55%',
      end: 'right 55%',
      onToggle(self) { if (self.isActive) sceneNow.textContent = scene.dataset.scene; },
    });

    // Photographs slide inside their frames; words move at another speed.
    scene.querySelectorAll('.col img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.16, xPercent: -5 }, {
        xPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: scene, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true },
      });
    });
    const word = scene.querySelector('.scene__word');
    const vertical = getComputedStyle(word).writingMode.startsWith('vertical');
    gsap.fromTo(word, vertical ? { yPercent: 8 } : { x: () => innerWidth * 0.1 }, {
      ...(vertical ? { yPercent: -8 } : { x: () => -innerWidth * 0.06 }),
      ease: 'none',
      scrollTrigger: { trigger: scene, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true },
    });
  });

  // PRIVATE: the print expands from a slit as the scene arrives.
  const privateScene = root.querySelector('.scene--private');
  gsap.fromTo(privateScene.querySelector('[data-expand]'),
    { clipPath: 'inset(47% 34% 47% 34%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'power2.out',
      scrollTrigger: { trigger: privateScene, containerAnimation: travel, start: 'left 88%', end: 'left 12%', scrub: true },
    });

  // BRUNCH is morning: ivory. HUD switches to ink while it fills the screen.
  const brunch = root.querySelector('.scene--brunch');
  ScrollTrigger.create({
    trigger: brunch,
    containerAnimation: travel,
    start: desktop ? 'left 35%' : 'left 50%',
    end: desktop ? 'right 65%' : 'right 50%',
    onToggle(self) {
      hud.ink('brunch', self.isActive);
      xpHud.classList.toggle('is-ink', self.isActive);
    },
  });

  register(root, travel.scrollTrigger, (el) => {
    // Keyboard: bring the focused scene into view along the track.
    const scene = el.closest('.scene, .xp__intro, .xp__outro');
    if (!scene) return null;
    const st = travel.scrollTrigger;
    const max = distance();
    const left = Math.min(max, Math.max(0, scene.offsetLeft));
    return st.start + (left / max) * (st.end - st.start);
  });
}
