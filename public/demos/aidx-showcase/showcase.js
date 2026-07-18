(() => {
  const video = document.querySelector('video');
  const root = document.documentElement;
  if (!video) return;

  const loopStart = 2.4;
  let parentPaused = true;

  const setPaused = (paused) => {
    parentPaused = paused;
    if (paused) video.pause();
    else void video.play();
  };

  window.addEventListener('message', (event) => {
    if (
      event.origin !== location.origin ||
      !event.data ||
      event.data.type !== 'aidx-showcase-playback'
    ) return;
    setPaused(Boolean(event.data.paused));
  });

  video.addEventListener('canplay', () => {
    if (video.currentTime < loopStart) video.currentTime = loopStart;
    parent.postMessage({ type: 'aidx-showcase-ready' }, location.origin);
    if (!parentPaused) void video.play();
  }, { once: true });

  video.addEventListener('ended', () => {
    root.dataset.resetting = 'true';
    window.setTimeout(() => {
      video.currentTime = loopStart;
      root.removeAttribute('data-resetting');
      if (!parentPaused) void video.play();
    }, 520);
  });

  video.load();
})();
