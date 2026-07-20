const DESIGN_WIDTH = 1470;
const COMPACT_BREAKPOINT = 520;
const CYCLE_DURATION = 22000;

const viewport = document.querySelector('.viewport');
const consoleNode = document.querySelector('.console');
const rightViewport = document.querySelector('[data-studio-right-viewport]');
const scrollPanel = document.querySelector('[data-studio-scroll-panel]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let scrollAnimation = null;
let resizeFrame = 0;

function isCompactViewport() {
  return window.innerWidth < COMPACT_BREAKPOINT;
}

function stopScroll() {
  scrollAnimation?.cancel();
  scrollAnimation = null;

  if (scrollPanel) {
    scrollPanel.style.opacity = '1';
    scrollPanel.style.transform = 'translate3d(0, 0, 0)';
  }
}

function startScroll() {
  stopScroll();
  if (!rightViewport || !scrollPanel || reducedMotion.matches || isCompactViewport()) return;

  const overflow = Math.max(0, scrollPanel.scrollHeight + 24 - rightViewport.clientHeight);
  if (overflow < 24) return;

  scrollAnimation = scrollPanel.animate(
    [
      { transform: 'translate3d(0, 0, 0)', opacity: 1, offset: 0 },
      { transform: 'translate3d(0, 0, 0)', opacity: 1, offset: 0.06 },
      { transform: `translate3d(0, -${overflow}px, 0)`, opacity: 1, offset: 0.9 },
      { transform: `translate3d(0, -${overflow}px, 0)`, opacity: 1, offset: 0.94 },
      { transform: `translate3d(0, -${overflow}px, 0)`, opacity: 0, offset: 0.98 },
      { transform: 'translate3d(0, 0, 0)', opacity: 0, offset: 0.981 },
      { transform: 'translate3d(0, 0, 0)', opacity: 1, offset: 1 },
    ],
    {
      duration: CYCLE_DURATION,
      easing: 'linear',
      iterations: Infinity,
    },
  );

  if (document.hidden) scrollAnimation.pause();
}

function layoutConsole() {
  if (!viewport || !consoleNode) return;

  const widthScale = window.innerWidth / DESIGN_WIDTH;
  const scale = isCompactViewport() ? widthScale * 1.85 : widthScale;
  const designHeight = Math.max(640, window.innerHeight / scale);

  consoleNode.style.setProperty('--studio-scale', String(scale));
  consoleNode.style.setProperty('--studio-height', `${designHeight}px`);

  requestAnimationFrame(startScroll);
}

function scheduleLayout() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(layoutConsole);
}

function handleVisibilityChange() {
  if (!scrollAnimation) return;
  if (document.hidden) scrollAnimation.pause();
  else scrollAnimation.play();
}

async function initialize() {
  if (document.fonts?.ready) await document.fonts.ready;

  const images = Array.from(document.images);
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }),
  );

  layoutConsole();
}

window.addEventListener('resize', scheduleLayout, { passive: true });
document.addEventListener('visibilitychange', handleVisibilityChange);
reducedMotion.addEventListener('change', scheduleLayout);

initialize();
