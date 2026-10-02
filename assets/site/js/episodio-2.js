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



// episode-two-timeline-lightbox
(() => {
  const dialog = document.querySelector('#ep2-timeline-lightbox');
  const image = dialog?.querySelector('[data-ep2-timeline-lightbox-image]');
  const close = dialog?.querySelector('[data-close-ep2-timeline-lightbox]');
  const caption = dialog?.querySelector('[data-ep2-timeline-lightbox-caption]');
  const captionText = dialog?.querySelector('[data-ep2-timeline-lightbox-caption-text]');
  const credit = dialog?.querySelector('[data-ep2-timeline-lightbox-credit]');
  const captionToggle = dialog?.querySelector('[data-ep2-timeline-lightbox-caption-toggle]');
  if (!dialog || !image) return;

  document.querySelectorAll('[data-ep2-timeline-image]').forEach(button => {
    button.addEventListener('click', () => {
      const src = button.getAttribute('data-ep2-timeline-image');
      const thumb = button.querySelector('img');
      const description = button.getAttribute('data-ep2-timeline-caption') || '';
      const creditLabel = button.getAttribute('data-ep2-timeline-credit') || '';
      const creditUrl = button.getAttribute('data-ep2-timeline-credit-url') || '';
      const textOnly = button.getAttribute('data-ep2-timeline-caption-text-only') === 'true';
      if (!src) return;

      image.src = src;
      image.alt = thumb?.alt || '';

      if (caption && captionText && credit && (description || (creditLabel && creditUrl))) {
        captionText.textContent = description;
        captionText.hidden = !description;

        if (creditLabel && creditUrl) {
          credit.textContent = creditLabel;
          credit.href = creditUrl;
          credit.hidden = false;
        } else {
          credit.textContent = '';
          credit.removeAttribute('href');
          credit.hidden = true;
        }

        caption.classList.remove('is-expanded');
        caption.classList.toggle('is-text-only', textOnly);
        if (captionToggle) {
          captionToggle.setAttribute('aria-expanded', 'false');
          captionToggle.setAttribute('aria-label', 'Expandir legenda');
        }
        caption.hidden = false;
      } else if (caption) {
        caption.hidden = true;
      }

      dialog.showModal();
    });
  });

  captionToggle?.addEventListener('click', () => {
    if (!caption) return;
    const expanded = caption.classList.toggle('is-expanded');
    captionToggle.setAttribute('aria-expanded', String(expanded));
    captionToggle.setAttribute('aria-label', expanded ? 'Recolher legenda' : 'Expandir legenda');
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    image.alt = '';
    if (caption) {
      caption.hidden = true;
      caption.classList.remove('is-expanded');
      caption.classList.remove('is-text-only');
    }
    if (captionToggle) {
      captionToggle.setAttribute('aria-expanded', 'false');
      captionToggle.setAttribute('aria-label', 'Expandir legenda');
    }
    if (captionText) {
      captionText.textContent = '';
      captionText.hidden = false;
    }
    if (credit) {
      credit.textContent = '';
      credit.removeAttribute('href');
      credit.hidden = false;
    }
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



// episode-two-cantareira-photo-lightbox
(() => {
  const dialog = document.querySelector('#cantareira-photo-lightbox');
  const open = document.querySelector('[data-open-cantareira-photo]');
  const close = dialog?.querySelector('[data-close-cantareira-photo]');
  const caption = dialog?.querySelector('[data-cantareira-photo-caption]');
  const toggle = dialog?.querySelector('[data-cantareira-photo-caption-toggle]');
  if (!dialog || !open) return;

  const resetCaption = () => {
    caption?.classList.remove('is-expanded');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Expandir legenda');
    }
  };

  open.addEventListener('click', () => {
    resetCaption();
    dialog.showModal();
  });

  toggle?.addEventListener('click', () => {
    if (!caption) return;
    const expanded = caption.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Recolher legenda' : 'Expandir legenda');
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', resetCaption);
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



// episode-two-info-dialogs
(() => {
  const triggers = document.querySelectorAll('[data-open-info-dialog]');
  const dialogs = document.querySelectorAll('.info-dialog');
  if (!triggers.length || !dialogs.length) return;

  const lock = () => {
    document.documentElement.classList.add('info-dialog-open');
    document.body.classList.add('info-dialog-open');
  };
  const unlock = () => {
    document.documentElement.classList.remove('info-dialog-open');
    document.body.classList.remove('info-dialog-open');
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-open-info-dialog');
      const dialog = document.getElementById(id);
      if (!dialog) return;
      lock();
      dialog.showModal();
    });
  });

  dialogs.forEach(dialog => {
    dialog.querySelector('[data-close-info-dialog]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', unlock);
  });
})();


// episode-two-legacy-photo-height
(() => {
  const section = document.querySelector('.ep2-legacy');
  const copy = section?.querySelector('.legacy-copy');
  const photo = section?.querySelector('.legacy-photo');
  if (!section || !copy || !photo) return;

  const syncHeight = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      photo.style.height = '';
      return;
    }
    const height = Math.round(copy.getBoundingClientRect().height);
    if (height > 0) photo.style.height = height + 'px';
  };

  const observer = 'ResizeObserver' in window ? new ResizeObserver(syncHeight) : null;
  observer?.observe(copy);
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
  requestAnimationFrame(syncHeight);
})();
