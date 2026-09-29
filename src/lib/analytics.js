/**
 * Conversion tracking. A safe no-op until BOTH are true:
 *   1. a GA4 measurement ID is configured at build time (VITE_GA4_ID=G-XXXXXXX),
 *   2. the visitor has accepted analytics cookies (see ui/consent.js).
 * No ID is invented here: add the real one in the hosting environment.
 * Analytics must never break the page, so every call is guarded.
 */
const GA4_ID = String(import.meta.env.VITE_GA4_ID || '').trim();
const KEY = 'mb-analytics-consent';

export const analyticsEnabled = /^G-[A-Z0-9]{4,}$/.test(GA4_ID);

let loaded = false;

function gtag() {
  // gtag.js expects the arguments object itself.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function load() {
  if (loaded || !analyticsEnabled) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
  document.head.appendChild(s);
}

export function getConsent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value); } catch { /* private mode: ask again next visit */ }
  if (value === 'granted') load();
}

export function initAnalytics() {
  if (analyticsEnabled && getConsent() === 'granted') load();
}

/** Record a conversion event. Silently ignored when analytics is off. */
export function track(name, params = {}) {
  try {
    if (loaded) gtag('event', name, params);
    window.dispatchEvent(new CustomEvent('mb:track', { detail: { name, params } }));
  } catch { /* never let tracking throw */ }
}
