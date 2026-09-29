import { gsap } from 'gsap';

/**
 * The request form stays hidden until asked for. Submitting composes a
 * WhatsApp message (there is no server to post to), so nothing is lost.
 */
export function createRequest({ onGo }) {
  const form = document.getElementById('request');
  const toggle = document.querySelector('[data-open-request]');
  const err = form.querySelector('[data-request-error]');
  const f = form.elements;

  function reveal(focus = true) {
    if (form.hidden) {
      form.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Opacity only: a visibility:hidden form could not take focus.
        gsap.fromTo(form, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
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

  const invalid = (el, msg) => {
    el.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    el.focus();
    return false;
  };

  function validate() {
    [f.name, f.phone].forEach((el) => el.removeAttribute('aria-invalid'));
    err.textContent = '';
    if (!f.name.value.trim()) return invalid(f.name, 'Lütfen adınızı yazın.');
    if (f.phone.value.replace(/\D/g, '').length < 10) return invalid(f.phone, 'Lütfen geçerli bir telefon numarası yazın.');
    return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const lines = [
      'Merhaba Marmara Blue, etkinlik talebi:',
      `Ad soyad: ${f.name.value.trim()}`,
      `Telefon: ${f.phone.value.trim()}`,
      f.type.value && `Etkinlik: ${f.type.value}`,
      f.date.value && `Tarih: ${f.date.value.split('-').reverse().join('.')}`,
      f.guests.value && `Misafir sayısı: ${f.guests.value}`,
      f.note.value.trim() && `Not: ${f.note.value.trim()}`,
    ].filter(Boolean);
    const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });

  return { reveal };
}
