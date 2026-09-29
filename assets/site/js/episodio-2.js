// Episódio 2 — carregamento e lightbox da foto do protesto
(() => {
  const media = document.querySelector('[data-protest-media]');
  const thumb = media?.querySelector('img');

  if (media && thumb) {
    const loaded = () => {
      media.classList.remove('is-error');
      media.classList.add('is-loaded');
    };

    const failed = () => {
      media.classList.remove('is-loaded');
      media.classList.add('is-error');
    };

    if (thumb.complete) {
      if (thumb.naturalWidth > 0) loaded();
      else failed();
    } else {
      thumb.addEventListener('load', loaded, { once:true });
      thumb.addEventListener('error', failed, { once:true });
    }
  }

  const dialog = document.querySelector('#protest-lightbox');
  const full = dialog?.querySelector('[data-protest-lightbox-image]');
  const close = dialog?.querySelector('[data-close-protest-lightbox]');
  const trigger = document.querySelector('[data-protest-image]');

  if (!dialog || !full || !trigger) return;

  trigger.addEventListener('click', () => {
    const src = trigger.getAttribute('data-protest-image');
    const image = trigger.querySelector('img');
    if (!src) return;

    full.src = src;
    full.alt = image?.alt || '';
    dialog.showModal();
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
