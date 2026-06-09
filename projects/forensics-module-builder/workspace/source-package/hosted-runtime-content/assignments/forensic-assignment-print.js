(function () {
  if (window.__forensicAssignmentPrintHelperInstalled) return;
  window.__forensicAssignmentPrintHelperInstalled = true;

  const nativePrint = window.print.bind(window);
  let printInFlight = false;

  function rememberInlineStyles(node, properties) {
    const previous = {};
    properties.forEach((property) => {
      previous[property] = node.style[property];
    });
    return () => {
      properties.forEach((property) => {
        node.style[property] = previous[property];
      });
    };
  }

  function isLikelyScrollable(node) {
    const computed = window.getComputedStyle(node);
    const overflowValue = `${computed.overflow} ${computed.overflowX} ${computed.overflowY}`;
    return /(auto|scroll|hidden)/i.test(overflowValue) || node.scrollHeight > node.clientHeight + 4;
  }

  function collectPrintTargets() {
    const selector = [
      "textarea",
      "main",
      '[class*="overflow-y-auto"]',
      '[class*="overflow-auto"]',
      '[class*="overflow-hidden"]',
      '[class*="h-screen"]',
      '[class*="min-h-screen"]',
      '[class*="max-h-"]'
    ].join(", ");

    return Array.from(new Set(Array.from(document.querySelectorAll(selector))));
  }

  function prepareForPrint() {
    const cleanups = [];
    document.documentElement.classList.add("forensic-printing");
    document.body.classList.add("forensic-printing");
    cleanups.push(() => {
      document.documentElement.classList.remove("forensic-printing");
      document.body.classList.remove("forensic-printing");
    });

    collectPrintTargets().forEach((node) => {
      if (!(node instanceof HTMLElement)) return;

      if (node instanceof HTMLTextAreaElement) {
        const restore = rememberInlineStyles(node, ["height", "maxHeight", "overflow", "overflowY", "resize"]);
        cleanups.push(restore);
        node.style.height = "auto";
        node.style.maxHeight = "none";
        node.style.overflow = "hidden";
        node.style.overflowY = "hidden";
        node.style.resize = "none";
        const targetHeight = Math.max(node.scrollHeight + 4, node.clientHeight, 96);
        node.style.height = `${targetHeight}px`;
        return;
      }

      if (!isLikelyScrollable(node)) return;

      const restore = rememberInlineStyles(node, ["height", "minHeight", "maxHeight", "overflow", "overflowX", "overflowY"]);
      cleanups.push(restore);
      node.style.height = "auto";
      node.style.minHeight = "0";
      node.style.maxHeight = "none";
      node.style.overflow = "visible";
      node.style.overflowX = "visible";
      node.style.overflowY = "visible";
    });

    return () => {
      for (let index = cleanups.length - 1; index >= 0; index -= 1) {
        cleanups[index]();
      }
    };
  }

  function runForensicAssignmentPrint() {
    if (printInFlight) {
      nativePrint();
      return;
    }

    printInFlight = true;
    const restore = prepareForPrint();
    let finished = false;

    const finalize = () => {
      if (finished) return;
      finished = true;
      restore();
      printInFlight = false;
    };

    window.addEventListener("afterprint", finalize, { once: true });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        nativePrint();
        window.setTimeout(finalize, 1600);
      });
    });
  }

  window.prepareForensicAssignmentPrint = prepareForPrint;
  window.runForensicAssignmentPrint = runForensicAssignmentPrint;
  window.print = function forensicAssignmentPrintOverride() {
    void runForensicAssignmentPrint();
  };
})();
