export function initNavigation() {
  const links = [...document.querySelectorAll('[data-chapter-link]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const toggle = document.querySelector('.chapter-toggle');
  const nav = document.querySelector('#chapter-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭章节目录' : '打开章节目录');
    nav?.classList.toggle('is-open', open);
  });
  links.forEach((link) => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '打开章节目录');
    nav?.classList.remove('is-open');
  }));
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.toggleAttribute('aria-current', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-20% 0px -65%', threshold: [0, .2, .6] });
  sections.forEach((section) => observer.observe(section));
}
