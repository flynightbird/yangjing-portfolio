export function initNavigation() {
  const links = [...document.querySelectorAll('[data-chapter-link]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.toggleAttribute('aria-current', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-20% 0px -65%', threshold: [0, .2, .6] });
  sections.forEach((section) => observer.observe(section));
}
