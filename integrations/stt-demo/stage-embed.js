(() => {
  if (new URLSearchParams(location.search).get('embed') !== 'stage') return;

  const root = document.documentElement;
  root.dataset.sttEmbed = 'stage';
  root.dataset.sttPlayback = 'paused';

  const nativeTimeout = window.setTimeout.bind(window);
  const clearNativeTimeout = window.clearTimeout.bind(window);
  const nativeInterval = window.setInterval.bind(window);
  const clearNativeInterval = window.clearInterval.bind(window);
  const intervals = new Map();
  let paused = true;
  let nextId = -1;

  function updateStageScale() {
    const gutter = innerWidth <= 600 ? 8 : 16;
    const scale = Math.max(
      0,
      Math.min(
        (innerWidth - gutter * 2) / 1000,
        (innerHeight - gutter * 2) / 560,
      ),
    );
    root.style.setProperty('--stt-stage-scale', String(scale));
  }

  updateStageScale();
  window.addEventListener('resize', updateStageScale);

  function schedule(record) {
    record.startedAt = performance.now();
    record.timeoutId = nativeTimeout(() => {
      record.timeoutId = null;
      try {
        Reflect.apply(record.callback, window, record.args);
      } finally {
        record.remaining = record.delay;
        if (!paused && intervals.has(record.id)) schedule(record);
      }
    }, record.remaining);
  }

  window.setInterval = (callback, delay = 0, ...args) => {
    if (typeof callback !== 'function') {
      return nativeInterval(callback, delay, ...args);
    }
    const normalized = Math.max(0, Number(delay) || 0);
    const record = {
      id: nextId--,
      callback,
      args,
      delay: normalized,
      remaining: normalized,
      startedAt: performance.now(),
      timeoutId: null,
    };
    intervals.set(record.id, record);
    if (!paused) schedule(record);
    return record.id;
  };

  function clearSyntheticInterval(id) {
    const record = intervals.get(id);
    if (!record) return false;
    if (record.timeoutId !== null) clearNativeTimeout(record.timeoutId);
    intervals.delete(id);
    return true;
  }

  window.clearTimeout = (id) => {
    if (!clearSyntheticInterval(id)) clearNativeTimeout(id);
  };

  window.clearInterval = (id) => {
    if (!clearSyntheticInterval(id)) clearNativeInterval(id);
  };

  function setPaused(next) {
    if (paused === next) return;
    paused = next;
    root.dataset.sttPlayback = paused ? 'paused' : 'playing';
    const now = performance.now();
    for (const record of intervals.values()) {
      if (paused) {
        if (record.timeoutId === null) continue;
        clearNativeTimeout(record.timeoutId);
        record.timeoutId = null;
        record.remaining = Math.max(
          0,
          record.remaining - (now - record.startedAt),
        );
      } else if (record.timeoutId === null) {
        schedule(record);
      }
    }
  }

  addEventListener('message', (event) => {
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      event.data?.type !== 'stt-stage-playback'
    ) {
      return;
    }
    setPaused(event.data.paused === true);
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.page = 'landing';
    parent.postMessage({ type: 'stt-stage-ready' }, location.origin);
  });
})();
