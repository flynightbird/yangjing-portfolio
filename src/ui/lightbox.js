export function initLightbox() {
  const dialog = document.querySelector('#image-dialog');
  const output = dialog?.querySelector('img');
  if (!dialog || !output) return;
  document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    const source = button.querySelector('img');
    output.src = source.currentSrc || source.src;
    output.alt = source.alt;
    dialog.showModal();
  }));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
}
