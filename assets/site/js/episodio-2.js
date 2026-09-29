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


// episode-two-horizontal-timeline
(() => {
  const viewport = document.querySelector('[data-ep2-timeline-viewport]');
  const prev = document.querySelector('[data-ep2-timeline-prev]');
  const next = document.querySelector('[data-ep2-timeline-next]');
  if (!viewport || !prev || !next) return;

  let activeFrame = null;
  let sliding = false;

  const maxScroll = () =>
    Math.max(0, viewport.scrollWidth - viewport.clientWidth);

  const getBaseStep = () => {
    const items = [...viewport.querySelectorAll('.ep2-timeline-item')];
    if (items.length > 1) {
      const delta = items[1].offsetLeft - items[0].offsetLeft;
      if (delta > 0) return delta;
    }
    return Math.min(viewport.clientWidth * 0.45, 300);
  };

  const getStep = () => {
    const base = getBaseStep();
    const visualStep = viewport.clientWidth * 0.34;
    return Math.min(Math.max(base * 1.25, visualStep), 430);
  };

  const updateArrows = () => {
    const max = maxScroll();
    prev.hidden = viewport.scrollLeft <= 5;
    next.hidden = viewport.scrollLeft >= max - 5 || max <= 5;
  };

  const animateTo = target => {
    if (activeFrame) cancelAnimationFrame(activeFrame);

    const startLeft = viewport.scrollLeft;
    const endLeft = Math.max(0, Math.min(maxScroll(), target));
    const distance = endLeft - startLeft;

    if (Math.abs(distance) < 2) {
      viewport.scrollLeft = endLeft;
      updateArrows();
      return;
    }

    const previousBehavior = viewport.style.scrollBehavior;
    viewport.style.scrollBehavior = 'auto';
    viewport.classList.add('is-sliding');
    sliding = true;

    const duration = 560;
    let startedAt = null;

    const easeInOutCubic = t =>
      t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    const frame = now => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = easeInOutCubic(progress);

      viewport.scrollLeft = startLeft + distance * eased;
      updateArrows();

      if (progress < 1) {
        activeFrame = requestAnimationFrame(frame);
      } else {
        viewport.scrollLeft = endLeft;
        viewport.style.scrollBehavior = previousBehavior;
        viewport.classList.remove('is-sliding');
        sliding = false;
        activeFrame = null;
        updateArrows();
      }
    };

    activeFrame = requestAnimationFrame(frame);
  };

  prev.addEventListener('click', () => {
    if (!sliding) animateTo(viewport.scrollLeft - getStep());
  });

  next.addEventListener('click', () => {
    if (!sliding) animateTo(viewport.scrollLeft + getStep());
  });

  viewport.addEventListener('scroll', updateArrows, { passive:true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
})();
