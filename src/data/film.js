/**
 * The seven shots of the film (cuts detected with ffmpeg's scene filter).
 * "View moment" plays the film between `start` and `end`, starting at `at`.
 */
export const SHOTS = {
  wake:    { start: 0,      end: 2.233,  at: 0.9,  title: 'The wake' },
  davul:   { start: 2.233,  end: 4.3,    at: 2.3,  title: 'The davul arrives' },
  arch:    { start: 4.3,    end: 6.433,  at: 4.3,  title: 'Under the arch' },
  silk:    { start: 6.433,  end: 8.533,  at: 6.45, title: 'Pink silk, sunset' },
  festoon: { start: 8.533,  end: 10.6,   at: 8.55, title: 'Festoon light' },
  night:   { start: 10.6,   end: 13.767, at: 10.6, title: 'Night, applause' },
  aerial:  { start: 13.767, end: 16.85,  at: 13.8, title: 'Under the bridge' },
};

/** Timecode of each still, for the index preview. */
export const STILL_TC = {
  wake: '00:00:00:27',
  arch: '00:00:05:03',
  silk: '00:00:07:03',
  aerial: '00:00:15:15',
  night: '00:00:11:21',
};

export const FILM_SRC = '/videos/marmara-blue-hero.mp4';

export const still = (name, w = 720) => `/images/stills/${name}-${w}.webp`;
