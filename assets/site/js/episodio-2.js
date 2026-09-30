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


// episode-two-mobile-header-menu
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.mobile-menu-toggle');
  const nav = header?.querySelector('nav');
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Abrir menu do episódio');
  };

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('is-menu-open');
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu do episódio' : 'Abrir menu do episódio');
  });

  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event => {
    if (!header.classList.contains('is-menu-open')) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('scroll', () => {
    if (header.classList.contains('is-menu-open')) closeMenu();
  }, { passive:true });

  window.matchMedia('(min-width:851px)').addEventListener?.('change', event => {
    if (event.matches) closeMenu();
  });
})();


// episode-two-back-to-top
(() => {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  const media = window.matchMedia('(max-width:1024px)');

  const updateVisibility = () => {
    const visible = media.matches && window.scrollY > Math.max(520, window.innerHeight * 0.7);
    button.classList.toggle('is-visible', visible);
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive:true });
  window.addEventListener('resize', updateVisibility);
  media.addEventListener?.('change', updateVisibility);
  updateVisibility();
})();
