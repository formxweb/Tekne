import { tc } from '../lib/tc.js';

/**
 * The film behind the page. It keeps playing while you scroll.
 *
 * Loading: the MP4 is attached right after the page's `load` event, so the
 * poster, CSS and fonts (the first paint) never wait behind the video. It
 * then autoplays muted, inline and looping.
 *
 * Not downloaded at all with reduced motion or data saver: the poster stays
 * and PLAY FILM loads it on demand. If autoplay is refused, PLAY FILM is
 * offered. If the file fails, the poster remains as a still backdrop.
 */
export function createFilm(root) {
  const video = document.getElementById('film');
  const layer = video.closest('.film-layer');
  const toggle = root.querySelector('[data-film-toggle]');
  const tcEl = root.querySelector('[data-tc]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  const auto = !reduce && !saveData;
  let heroVisible = true;
  let raf = 0;
  let attached = false;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  if (!auto) {
    video.autoplay = false;
    video.removeAttribute('autoplay');
  }

  const label = () => {
    const playing = !video.paused;
    toggle.textContent = playing ? 'Pause film' : 'Play film';
    toggle.setAttribute('aria-pressed', String(!playing));
    root.classList.toggle('is-still', !playing);
  };

  // The timecode only ticks while the hero is on screen.
  const tick = () => {
    raf = 0;
    if (video.paused || !heroVisible) return;
    tcEl.textContent = tc(video.currentTime);
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && heroVisible && !video.paused) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; kick(); }).observe(root);

  const fail = () => {
    root.classList.add('is-failed', 'is-still');
    layer.classList.add('is-failed');
    toggle.hidden = true;
  };

  const attach = () => {
    if (attached || !video.dataset.src) return;
    attached = true;
    const source = document.createElement('source');
    source.type = 'video/mp4';
    source.src = video.dataset.src;
    source.addEventListener('error', fail);
    video.appendChild(source);
    video.load();
  };

  const play = () => {
    attach();
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        if (layer.classList.contains('is-failed')) return;
        root.classList.add('is-blocked');
        label();
      });
    }
  };

  video.addEventListener('play', () => {
    root.classList.remove('is-blocked');
    label();
    kick();
  });
  video.addEventListener('pause', () => {
    if (attached) tcEl.textContent = tc(video.currentTime);
    label();
  });
  video.addEventListener('error', fail);

  toggle.addEventListener('click', () => {
    if (video.paused) play();
    else video.pause();
  });

  if (auto) {
    const start = () => play();
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }
  label();
}
