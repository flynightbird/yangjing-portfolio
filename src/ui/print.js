export function initPrint() {
  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
}
