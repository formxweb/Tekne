/** Contact sheet: duplicate the frames once so the strip loops seamlessly. */
export function createSheet() {
  const track = document.querySelector('.sheet__track');
  if (!track || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [...track.children].forEach((li) => {
    const copy = li.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    track.appendChild(copy);
  });
  track.classList.add('is-looping');
}
