(() => {
  let opener;

  const showDialog = (dialog, button) => {
    if (!dialog) return;
    opener = button;
    dialog.showModal();
    document.body.classList.add('ep3-modal-open');
  };

  document.querySelectorAll('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => showDialog(document.getElementById(button.dataset.dialog), button));
  });

  document.querySelectorAll('.ep3-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('ep3-modal-open');
      opener?.focus({preventScroll:true});
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });

  const viewport = document.querySelector('[data-ep3-timeline-viewport]');
  const prev = document.querySelector('[data-ep3-timeline-prev]');
  const next = document.querySelector('[data-ep3-timeline-next]');
  if (viewport && prev && next) {
    let activeFrame = null;
    let sliding = false;
    const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const step = () => {
      const items = [...viewport.querySelectorAll('.ep3-timeline-item')];
      if (items.length > 1) {
        const base = items[1].offsetLeft - items[0].offsetLeft;
        return Math.min(Math.max(base * 1.35, viewport.clientWidth * .34), 430);
      }
      return Math.min(viewport.clientWidth * .45, 300);
    };
    const updateArrows = () => {
      const max = maxScroll();
      prev.hidden = viewport.scrollLeft <= 5;
      next.hidden = viewport.scrollLeft >= max - 5 || max <= 5;
    };
    const animateTo = target => {
      if (activeFrame) cancelAnimationFrame(activeFrame);
      const start = viewport.scrollLeft;
      const end = Math.max(0, Math.min(maxScroll(), target));
      const distance = end - start;
      if (Math.abs(distance) < 2) {
        viewport.scrollLeft = end;
        updateArrows();
        return;
      }
      sliding = true;
      viewport.style.scrollBehavior = 'auto';
      const duration = 560;
      let startedAt = null;
      const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
      const frame = now => {
        if (startedAt === null) startedAt = now;
        const p = Math.min((now-startedAt)/duration,1);
        viewport.scrollLeft = start + distance * ease(p);
        updateArrows();
        if (p < 1) activeFrame = requestAnimationFrame(frame);
        else {
          viewport.scrollLeft = end;
          viewport.style.scrollBehavior = '';
          activeFrame = null;
          sliding = false;
          updateArrows();
        }
      };
      activeFrame = requestAnimationFrame(frame);
    };
    prev.addEventListener('click',()=>{if(!sliding) animateTo(viewport.scrollLeft-step())});
    next.addEventListener('click',()=>{if(!sliding) animateTo(viewport.scrollLeft+step())});
    viewport.addEventListener('scroll',updateArrows,{passive:true});
    window.addEventListener('resize',updateArrows);
    updateArrows();
  }

  const lightbox = document.getElementById('ep3-lightbox');
  const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
  const lightboxCaption = lightbox?.querySelector('[data-lightbox-caption]');
  document.querySelectorAll('[data-ep3-image]').forEach(button => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.ep3Image;
      lightboxImage.alt = button.dataset.ep3Alt || '';
      if (lightboxCaption) lightboxCaption.textContent = button.dataset.ep3Caption || '';
      lightbox.showModal();
    });
  });
  lightbox?.querySelector('[data-close]')?.addEventListener('click', () => lightbox.close());

  const top = document.querySelector('.ep3-top');
  if (top) {
    const update = () => top.classList.toggle('is-visible', window.scrollY > 700);
    window.addEventListener('scroll', update, {passive:true});
    update();
    top.addEventListener('click', () => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  }
})();