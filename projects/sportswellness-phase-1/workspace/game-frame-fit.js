(() => {
  const expectedOrigin = location.protocol === 'file:' ? 'null' : location.origin;
  window.addEventListener('message', event => {
    if (event.origin !== expectedOrigin || event.data?.type !== 'sportswellness-game-height') return;
    const frame = [...document.querySelectorAll('#performance-game iframe')].find(node => node.contentWindow === event.source);
    const height = event.data.height;
    if (!frame || !Number.isFinite(height) || height < 100 || height > 10000) return;
    // Include the iframe border without hiding any of the arena or controls.
    frame.style.height = `${Math.ceil(height) + 2}px`;
    frame.style.display = 'block';
  });
})();
