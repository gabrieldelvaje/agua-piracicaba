(() => {
  let opener;
  const show = (dialog, button) => {
    opener = button;
    dialog.showModal();
    document.body.classList.add('ep3-modal-open');
  };
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => show(document.getElementById(button.dataset.dialog), button)));
  document.querySelectorAll('.ep3-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.classList.remove('ep3-modal-open'); opener?.focus({preventScroll:true}); });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if(event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  const top = document.querySelector('.ep3-top');
  const update = () => top.classList.toggle('is-visible', window.scrollY > 700);
  window.addEventListener('scroll', update, {passive:true}); update();
  top.addEventListener('click', () => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
})();
