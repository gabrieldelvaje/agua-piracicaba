(() => {
  let opener;
  const show = (dialog, button) => {
    if (!dialog) return;
    opener = button;
    dialog.showModal();
    document.body.classList.add('ep4-modal-open');
  };
  document.querySelectorAll('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => show(document.getElementById(button.dataset.dialog), button));
  });
  document.querySelectorAll('.ep4-dialog').forEach(dialog => {
    const close = dialog.querySelector('[data-close]');
    close?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('ep4-modal-open');
      opener?.focus({preventScroll:true});
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });

  const top = document.querySelector('.ep4-top');
  if (top) {
    const update = () => top.classList.toggle('is-visible', window.scrollY > 700);
    window.addEventListener('scroll', update, {passive:true});
    update();
    top.addEventListener('click', () => window.scrollTo({
      top:0,
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    }));
  }
})();