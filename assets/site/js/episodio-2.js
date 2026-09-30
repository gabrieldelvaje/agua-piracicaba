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


// episode-two-smooth-section-navigation
(() => {
  const triggers = [
    ...document.querySelectorAll('.episode-scroll-cue[href^="#"]'),
    ...document.querySelectorAll('.site-header nav a[href^="#"]')
  ];
  if (!triggers.length) return;

  const easeInOutCubic = t =>
    t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const animateToTarget = (target, hash) => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const start = window.scrollY;
    const rawEnd = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    const maxEnd = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const end = Math.max(0, Math.min(rawEnd, maxEnd));
    const distance = end - start;
    const duration = 950;
    let startedAt = null;

    const step = now => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, end);
        root.style.scrollBehavior = previousRootBehavior;
        body.style.scrollBehavior = previousBodyBehavior;
        history.replaceState(null, '', hash);
      }
    };

    requestAnimationFrame(step);
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', event => {
      const hash = trigger.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      animateToTarget(target, hash);
    });
  });
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
  const forceTopKey = 'episode-2-force-top-after-refresh';

  const updateVisibility = () => {
    const visible = media.matches && window.scrollY > Math.max(520, window.innerHeight * 0.7);
    button.classList.toggle('is-visible', visible);
  };

  const keepTopAfterRefresh = () => {
    if (sessionStorage.getItem(forceTopKey) !== '1') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const forceTop = () => window.scrollTo({ top:0, left:0, behavior:'auto' });
    forceTop();
    requestAnimationFrame(forceTop);
    window.setTimeout(forceTop, 80);
    window.setTimeout(() => sessionStorage.removeItem(forceTopKey), 300);
  };

  button.addEventListener('click', () => {
    sessionStorage.setItem(forceTopKey, '1');

    // Remove a âncora da seção atual para que o navegador não volte a ela ao atualizar.
    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, '', cleanUrl);

    window.scrollTo({ top:0, behavior:'smooth' });
  });

  window.addEventListener('pageshow', keepTopAfterRefresh);
  window.addEventListener('load', keepTopAfterRefresh);
  window.addEventListener('scroll', updateVisibility, { passive:true });
  window.addEventListener('resize', updateVisibility);
  media.addEventListener?.('change', updateVisibility);
  updateVisibility();
})();


// episode-two-newspaper-lightbox
(() => {
  const trigger = document.querySelector('[data-newspaper-image]');
  const dialog = document.querySelector('#newspaper-lightbox');
  const full = dialog?.querySelector('[data-newspaper-lightbox-image]');
  const placeholder = dialog?.querySelector('[data-newspaper-lightbox-placeholder]');
  const close = dialog?.querySelector('[data-close-newspaper-lightbox]');
  if (!trigger || !dialog || !full) return;

  const thumb = trigger.querySelector('img');
  let imageAvailable = false;

  const markLoaded = () => {
    imageAvailable = true;
    trigger.classList.add('is-loaded');
  };

  const markMissing = () => {
    imageAvailable = false;
    trigger.classList.remove('is-loaded');
  };

  if (thumb) {
    if (thumb.complete) {
      if (thumb.naturalWidth > 0) markLoaded();
      else markMissing();
    } else {
      thumb.addEventListener('load', markLoaded);
      thumb.addEventListener('error', markMissing);
    }
  }

  trigger.addEventListener('click', () => {
    const src = trigger.getAttribute('data-newspaper-image');
    const alt = thumb?.alt || 'Recorte da reportagem Piracicaba pede água';

    dialog.classList.toggle('has-image', imageAvailable);

    if (imageAvailable && src) {
      full.src = src;
      full.alt = alt;
    } else {
      full.removeAttribute('src');
      full.alt = '';
    }

    dialog.showModal();
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    full.removeAttribute('src');
    full.alt = '';
    dialog.classList.remove('has-image');
  });
})();
