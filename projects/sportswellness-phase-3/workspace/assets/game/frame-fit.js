(() => {
  let queued = false;
  function report() {
    queued = false;
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    parent.postMessage({type: 'sportswellness-game-height', height}, location.protocol === 'file:' ? '*' : location.origin);
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(report); }
  }
  new ResizeObserver(schedule).observe(document.body);
  window.addEventListener('load', schedule);
  window.addEventListener('resize', schedule);
  schedule();
})();
