import { EXPO_OUT, reducedMotion } from '../lib/motion.js';
import { track } from '../lib/analytics.js';

/**
 * Event request form. It stays hidden until asked for. There is no server:
 * a valid request is composed into a WhatsApp message to the reservation
 * number (data-wa on the form). User input only ever reaches the DOM via
 * textContent / attributes, and the URL via encodeURIComponent.
 */

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// Each rule returns an error message, or '' when the value is fine.
const RULES = {
  name(v) {
    const s = v.trim();
    if (!s) return 'Lütfen adınızı ve soyadınızı yazın.';
    if (s.length < 2) return 'Ad soyad en az 2 karakter olmalı.';
    return '';
  },
  phone(v) {
    const s = v.trim();
    if (!s) return 'Size dönebilmemiz için telefon numaranızı yazın.';
    if (/[^\d\s()+\-.]/.test(s)) return 'Telefon numarasında yalnızca rakam, boşluk ve + ( ) - kullanın.';
    const digits = s.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return 'Geçerli bir telefon numarası yazın (ör. 0532 123 45 67).';
    return '';
  },
  date(v) {
    if (!v) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Geçerli bir tarih seçin.';
    if (v < today()) return 'Geçmiş bir tarih seçilemez.';
    return '';
  },
  guests(v) {
    if (!v.trim()) return '';
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1) return 'Misafir sayısı 1 veya daha büyük bir tam sayı olmalı.';
    if (n > 10000) return 'Lütfen gerçekçi bir misafir sayısı yazın.';
    return '';
  },
  note(v) {
    return v.length > 500 ? 'Not en fazla 500 karakter olabilir.' : '';
  },
};

export function createRequest({ onGo }) {
  const form = document.getElementById('request');
  const toggle = document.querySelector('[data-open-request]');
  if (!form || !toggle) return;
  const summary = form.querySelector('[data-request-error]');
  const done = form.querySelector('[data-request-done]');
  const fallback = form.querySelector('[data-wa-fallback]');
  const f = form.elements;
  let attempted = false;

  f.date.min = today();

  function reveal(focus = true) {
    if (form.hidden) {
      form.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      track('request_form_open');
      if (!reducedMotion()) {
        form.animate(
          [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
          { duration: 1000, easing: EXPO_OUT },
        );
      }
    }
    if (focus) f.name.focus({ preventScroll: true });
  }

  function hide() {
    form.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => (form.hidden ? reveal() : hide()));

  document.querySelectorAll('[data-request]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (a.dataset.request) f.type.value = a.dataset.request;
      onGo('#contact', () => reveal());
    });
  });

  // Field-level errors, wired with aria-invalid + aria-describedby.
  function check(name) {
    const el = f[name];
    const msg = RULES[name](el.value);
    const out = form.querySelector(`[data-error-for="${name}"]`);
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (out) out.textContent = msg;
    return !msg;
  }

  Object.keys(RULES).forEach((name) => {
    f[name].addEventListener('blur', () => { if (attempted) check(name); });
    f[name].addEventListener('input', () => {
      if (attempted && f[name].getAttribute('aria-invalid') === 'true') check(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    attempted = true;
    done.hidden = true;
    const invalid = Object.keys(RULES).filter((name) => !check(name));
    if (invalid.length) {
      summary.textContent = invalid.length === 1
        ? 'Lütfen işaretli alanı kontrol edin.'
        : `Lütfen işaretli ${invalid.length} alanı kontrol edin.`;
      f[invalid[0]].focus();
      return;
    }
    summary.textContent = '';

    const clean = (s) => s.trim().replace(/\s+/g, ' ');
    const lines = [
      'Merhaba Marmara Blue, etkinlik talebim:',
      `Ad soyad: ${clean(f.name.value)}`,
      `Telefon: ${clean(f.phone.value)}`,
      `Etkinlik: ${f.type.value || 'Belirtilmedi'}`,
      `Tarih: ${f.date.value ? f.date.value.split('-').reverse().join('.') : 'Belirtilmedi'}`,
      `Misafir sayısı: ${f.guests.value.trim() || 'Belirtilmedi'}`,
      `Not: ${f.note.value.trim() || '-'}`,
    ];
    const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;

    track('request_form_submit', { event_type: f.type.value || 'unspecified' });
    track('whatsapp_redirect', { source: 'request_form' });

    // If a popup blocker swallows the new tab, the visible link still works.
    fallback.setAttribute('href', url);
    done.hidden = false;
    window.open(url, '_blank', 'noopener');
  });
}
