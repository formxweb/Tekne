import { tc } from '../lib/tc.js';

/**
 * The hero reel. Autoplays muted and inline; if the browser refuses (low-power
 * mode, data saver, reduced motion) the poster stays and PLAY FILM is offered.
 * The first scroll "holds" the frame: hold()/release() pause and resume it.
 */
export function createFilm(root) {
  const video = root.querySelector('#film');
  const toggle = root.querySelector('[data-film-toggle]');
  const tcEl = root.querySelector('[data-tc]');
  const heldTc = root.querySelector('[data-held-tc]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let userPaused = reduce;
  let held = false;
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
    if (video.paused) {
      userPaused = false;
      held = false;
      play();
    } else {
      userPaused = true;
      video.pause();
    }
  });

  if (!reduce) play();
  label();

  return {
    video,
    /** Freeze the current frame (first scroll). */
    hold() {
      if (held) return;
      held = true;
      heldTc.textContent = tc(video.currentTime);
      if (!video.paused) video.pause();
    },
    /** Back at the top: let the reel run again unless the viewer paused it. */
    release() {
      if (!held) return;
      held = false;
      if (!userPaused) play();
    },
    whenPlaying(cb, timeout = 1800) {
      let done = false;
      const go = () => { if (!done) { done = true; cb(); } };
      if (!video.paused && video.currentTime > 0) return go();
      video.addEventListener('playing', go, { once: true });
      setTimeout(go, timeout);
    },
  };
}
