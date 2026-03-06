import type { CaptureResult, PreviewScrollPosition } from "./types";

const MAX_TRACKED_SCROLL_CONTAINERS = 8;
const MAX_SCAN_NODES = 12000;

function escapeSelectorToken(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function getElementSelector(element: HTMLElement) {
  if (element.id) {
    return `#${escapeSelectorToken(element.id)}`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;
  let depth = 0;

  while (current && depth < 8) {
    const tagName = current.tagName.toLowerCase();
    const currentTagName = current.tagName;
    let selector = tagName;

    if (current.id) {
      selector += `#${escapeSelectorToken(current.id)}`;
      parts.unshift(selector);
      break;
    }

    const parentElement: HTMLElement | null = current.parentElement;
    if (parentElement) {
      const siblings = Array.from(parentElement.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === currentTagName
      );
      if (siblings.length > 1) {
        selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }

    parts.unshift(selector);
    current = parentElement;
    depth += 1;
  }

  return parts.join(" > ");
}

function isScrollableElement(element: HTMLElement) {
  const owningWindow = element.ownerDocument.defaultView;
  if (!owningWindow) {
    return false;
  }

  const style = owningWindow.getComputedStyle(element);
  const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight - element.clientHeight > 24;
  const canScrollX = /(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth - element.clientWidth > 24;

  return canScrollX || canScrollY;
}

export function capturePreviewScrollPosition(iframe: HTMLIFrameElement, cachedSelectors?: string[]): CaptureResult | null {
  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    return null;
  }

  if (cachedSelectors && cachedSelectors.length) {
    const containers = cachedSelectors
      .map((selector) => {
        const element = contentDocument.querySelector<HTMLElement>(selector);
        if (!element || !isScrollableElement(element)) {
          return null;
        }

        return { selector, top: element.scrollTop, left: element.scrollLeft };
      })
      .filter(Boolean) as PreviewScrollPosition["containers"];

    if (containers.length) {
      return {
        position: {
          windowTop: contentWindow.scrollY,
          windowLeft: contentWindow.scrollX,
          containers
        },
        selectors: cachedSelectors
      };
    }
  }

  const seenSelectors = new Set<string>();
  const nodes = Array.from(contentDocument.querySelectorAll<HTMLElement>("body *")).slice(0, MAX_SCAN_NODES);

  const candidates = nodes
    .filter((element) => isScrollableElement(element))
    .map((element) => ({
      element,
      selector: getElementSelector(element),
      score: Math.max(element.scrollHeight - element.clientHeight, element.scrollWidth - element.clientWidth)
    }))
    .sort((left, right) => right.score - left.score)
    .filter(({ selector }) => {
      if (!selector || seenSelectors.has(selector)) {
        return false;
      }

      seenSelectors.add(selector);
      return true;
    })
    .slice(0, MAX_TRACKED_SCROLL_CONTAINERS);

  const selectors = candidates.map((candidate) => candidate.selector);
  const containers = candidates.map(({ element, selector }) => ({
    selector,
    top: element.scrollTop,
    left: element.scrollLeft
  }));

  return {
    position: {
      windowTop: contentWindow.scrollY,
      windowLeft: contentWindow.scrollX,
      containers
    },
    selectors
  };
}

export function restorePreviewScrollPosition(iframe: HTMLIFrameElement, scrollPosition: PreviewScrollPosition) {
  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    return;
  }

  const applyScrollPosition = () => {
    contentWindow.scrollTo(scrollPosition.windowLeft, scrollPosition.windowTop);
    scrollPosition.containers.forEach((container) => {
      const element = contentDocument.querySelector<HTMLElement>(container.selector);
      if (!element) {
        return;
      }

      element.scrollTop = container.top;
      element.scrollLeft = container.left;
    });
  };

  contentWindow.requestAnimationFrame(() => {
    applyScrollPosition();
    contentWindow.setTimeout(applyScrollPosition, 80);
    contentWindow.setTimeout(applyScrollPosition, 260);
  });
}
