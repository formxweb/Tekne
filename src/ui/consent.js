import { analyticsEnabled, getConsent, setConsent } from '../lib/analytics.js';

/**
 * Cookie consent for analytics (KVKK / GDPR): nothing loads before "Kabul et".
 * The bar only exists when an analytics ID is configured.
 */
export function createConsent() {
  const bar = document.getElementById('consent');
  const reopen = document.querySelectorAll('[data-consent-open]');
  if (!bar || !analyticsEnabled) return;

  const show = () => { bar.hidden = false; };
  const hide = () => { bar.hidden = true; };

  bar.querySelectorAll('[data-consent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setConsent(btn.dataset.consent);
      hide();
    });
  });
  reopen.forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener('click', show);
  });

  if (!getConsent()) show();
}
