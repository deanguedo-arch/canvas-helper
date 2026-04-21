(function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function useArenaScale(baseSize, options = {}) {
    const { useEffect, useRef, useState } = React;
    const stageRef = useRef(null);
    const [stageSize, setStageSize] = useState({ width: baseSize.w, height: baseSize.h });

    useEffect(() => {
      const node = stageRef.current;
      if (!node) return undefined;

      const updateStageSize = (rect) => {
        const width = rect?.width || node.clientWidth || baseSize.w;
        const height = rect?.height || node.clientHeight || baseSize.h;
        if (!width || !height) return;

        setStageSize((current) => {
          if (current.width === width && current.height === height) {
            return current;
          }
          return { width, height };
        });
      };

      updateStageSize(node.getBoundingClientRect());

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            updateStageSize(entry.contentRect);
          }
        });

        observer.observe(node);
        return () => observer.disconnect();
      }

      const handleResize = () => updateStageSize(node.getBoundingClientRect());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [baseSize.h, baseSize.w]);

    const width = stageSize.width || baseSize.w;
    const height = stageSize.height || baseSize.h;
    const rawScale = Math.min(width / baseSize.w, height / baseSize.h);
    const scale = clamp(
      Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1,
      options.minScale ?? 0.85,
      options.maxScale ?? 1.75
    );

    return {
      stageRef,
      stageSize: { width, height },
      scale
    };
  }

  function scaleValue(value, scale, options = {}) {
    return clamp(
      Math.round(value * scale),
      options.min ?? 0,
      options.max ?? Number.POSITIVE_INFINITY
    );
  }

  window.PerformanceGameScale = {
    useArenaScale,
    scaleValue
  };
})();
