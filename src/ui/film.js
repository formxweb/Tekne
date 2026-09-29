import { tc } from '../lib/tc.js';

/**
 * The film behind the page. Autoplays muted and inline and keeps playing
 * while you scroll. If the browser refuses (low-power mode, data saver,
 * reduced motion) the poster stays and PLAY FILM is offered.
 */
export function createFilm(root) {
  const video = document.getElementById('film');
  const toggle = root.querySelector('[data-film-toggle]');
  const tcEl = root.querySelector('[data-tc]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const label = () => {
    const playing = !video.paused;
    toggle.textContent = playing ? 'Pause film' : 'Play film';
    toggle.setAttribute('aria-pressed', String(!playing));
    root.classList.toggle('is-still', !playing);
  };

  const draw = () => {
    tcEl.textContent = tc(video.currentTime);
    if (!video.paused) raf = requestAnimationFrame(draw);
  };

  const play = () => {
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        root.classList.add('is-blocked');
        label();
      });
    }
  };

  video.addEventListener('play', () => {
    root.classList.remove('is-blocked');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
    label();
  });
  video.addEventListener('pause', () => {
    cancelAnimationFrame(raf);
    tcEl.textContent = tc(video.currentTime);
    label();
  });

  // If the film can't load at all, the poster stays and the film controls step aside.
  const fail = () => {
    root.classList.add('is-failed', 'is-still');
    toggle.hidden = true;
  };
  video.addEventListener('error', fail);
  video.querySelectorAll('source').forEach((s) => s.addEventListener('error', fail));
  // The source may already have failed before this module ran.
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();

  toggle.addEventListener('click', () => {
    if (video.paused) play();
    else video.pause();
  });

  if (!reduce) play();
  label();

  return {
    video,
    whenPlaying(cb, timeout = 1800) {
      let done = false;
      const go = () => { if (!done) { done = true; cb(); } };
      if (!video.paused && video.currentTime > 0) return go();
      video.addEventListener('playing', go, { once: true });
      setTimeout(go, timeout);
    },
  };
}
