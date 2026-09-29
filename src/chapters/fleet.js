import { gsap } from 'gsap';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * THE FLEET — the screen becomes the boat. It moves off slowly as you
 * scroll; verified facts appear as survey annotations pinned to the frame.
 */
export function fleet({ desktop, register }) {
  const root = document.querySelector('.fleet');
  const stage = root.querySelector('.fleet__stage');
  const title = root.querySelector('[data-fleet-title]');
  const kicker = root.querySelector('[data-fleet-kicker]');
  const photo = root.querySelector('[data-fleet-photo]');
  const move = root.querySelector('[data-fleet-move]');
  const img = move.querySelector('img');
  const marks = [...root.querySelectorAll('.mark')];
  const name = root.querySelector('[data-fleet-name]');
  const rows = [...root.querySelectorAll('.fleet__survey > div')];
  const range = root.querySelector('[data-range]');

  // Place each crosshair on its feature, whatever the crop (object-fit: cover).
  const placeMarks = () => {
    const W = move.offsetWidth;
    const H = move.offsetHeight;
    const s = Math.max(W / 720, H / 1280);
    const w = 720 * s;
    const h = 1280 * s;
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const ox = (W - w) * px;
    const oy = (H - h) * py;
    marks.forEach((m) => {
      m.style.left = `${ox + parseFloat(m.dataset.x) * w}px`;
      m.style.top = `${oy + parseFloat(m.dataset.y) * h}px`;
    });
  };

  // Hairline leaders from each crosshair to its survey row (desktop only).
  const svg = document.createElementNS(SVG, 'svg');
  svg.classList.add('fleet__leaders');
  svg.setAttribute('aria-hidden', 'true');
  const lines = marks.map(() => svg.appendChild(document.createElementNS(SVG, 'line')));
  stage.appendChild(svg);

  const drawLeaders = () => {
    if (!desktop) return;
    const box = stage.getBoundingClientRect();
    marks.forEach((m, i) => {
      const row = rows.find((r) => r.dataset.for === m.dataset.mark);
      const line = lines[i];
      if (!row) return;
      const a = m.getBoundingClientRect();
      const b = row.getBoundingClientRect();
      const x1 = a.left - box.left + 16;
      const y1 = a.top - box.top;
      const x2 = b.left - box.left - 10;
      const y2 = b.top - box.top + 6;
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', Math.max(x1, x2));
      line.setAttribute('y2', y2);
      line.style.opacity = Math.min(Number(gsap.getProperty(row, 'opacity')), Number(gsap.getProperty(m, 'opacity'))) * 0.75;
    });
  };

  placeMarks();
  gsap.set(photo, { clipPath: 'inset(50% 0% 50% 0%)' });
  gsap.set(move, { x: 0, y: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${innerHeight * (desktop ? 3.4 : 3)}`,
      pin: stage,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: () => { placeMarks(); drawLeaders(); },
    },
    onUpdate: drawLeaders,
  });

  tl.fromTo(title, { yPercent: 12 }, { yPercent: -6, duration: 1.8 }, 0)
    .to(kicker, { autoAlpha: 0, duration: 0.5 }, 0.9)
    // The whole screen becomes the boat.
    .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power2.inOut' }, 0.5)
    // …and the boat keeps sailing away, subtly.
    .fromTo(move, { scale: 1.2, yPercent: 5 }, { scale: 1.03, yPercent: -3, duration: 6.4 }, 0.5)
    .fromTo(name, { yPercent: desktop ? 100 : 0, xPercent: desktop ? 0 : 100, autoAlpha: 0 },
      { yPercent: 0, xPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'power2.out' }, 2.0)
    .fromTo(marks, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.5 }, 2.5)
    .fromTo(rows, { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.45 }, 2.6)
    // The photograph steps aside; the fleet's range takes the other half.
    .to(photo, { clipPath: desktop ? 'inset(0% 0% 0% 46%)' : 'inset(44% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut' }, 6.3)
    .to(move, { x: () => (desktop ? innerWidth * 0.23 : 0), y: () => (desktop ? 0 : innerHeight * 0.22), duration: 1.6, ease: 'power2.inOut' }, 6.3)
    .to([name, title], { autoAlpha: 0, duration: 0.6 }, 6.3)
    .fromTo(range, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' }, 7.1)
    .to({}, { duration: 0.7 });

  // On a phone the survey sits where the range will appear: clear it first.
  if (!desktop) tl.to(rows, { autoAlpha: 0, duration: 0.5 }, 6.3);

  const onResize = () => { placeMarks(); drawLeaders(); };
  window.addEventListener('resize', onResize);

  register(root, tl.scrollTrigger);
  return () => {
    window.removeEventListener('resize', onResize);
    svg.remove();
  };
}
