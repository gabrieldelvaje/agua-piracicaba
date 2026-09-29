(() => {
  document.querySelectorAll('[data-newspaper-media]').forEach(media => {
    const img = media.querySelector('img');
    if (!img) return;

    const loaded = () => media.classList.add('is-loaded');
    if (img.complete && img.naturalWidth > 0) loaded();
    else img.addEventListener('load', loaded, { once:true });
  });

  const dialog = document.querySelector('#newspaper-lightbox');
  const full = dialog?.querySelector('[data-newspaper-lightbox-image]');
  const close = dialog?.querySelector('[data-close-newspaper-lightbox]');
  if (!dialog || !full) return;

  document.querySelectorAll('[data-newspaper-image]').forEach(button => {
    button.addEventListener('click', () => {
      const src = button.getAttribute('data-newspaper-image');
      const thumb = button.querySelector('img');
      if (!src) return;
      full.src = src;
      full.alt = thumb?.alt || '';
      dialog.showModal();
    });
  });

  close?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    full.removeAttribute('src');
    full.alt = '';
  });
})();