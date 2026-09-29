export const FPS = 30;

const pad = (n) => String(n).padStart(2, '0');

/** Seconds → SMPTE-style timecode HH:MM:SS:FF at the film's 30 fps. */
export function tc(seconds) {
  const frames = Math.max(0, Math.floor(seconds * FPS + 1e-4));
  const ff = frames % FPS;
  const s = Math.floor(frames / FPS) % 60;
  const m = Math.floor(frames / (FPS * 60)) % 60;
  const h = Math.floor(frames / (FPS * 3600));
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(ff)}`;
}
