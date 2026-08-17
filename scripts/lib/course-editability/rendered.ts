import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { chromium, type Browser, type BrowserContext, type BrowserServer, type Page } from "@playwright/test";

import {
  COURSE_EDITABILITY_MAX_OCCURRENCES_PER_SURFACE,
  COURSE_EDITABILITY_NATIVE_DETAILS_STATE,
  type CandidateKind,
  type CourseEditCandidate,
  type CourseEditCapabilityOpportunity,
  type CourseEditCapabilityOpportunityKind,
  type CourseEditReasonCode,
  type CourseEditRenderedExclusionCode,
  type CourseEditRenderedOccurrence,
  type LearnerSurface
} from "../../../app/shared/course-editability.js";
import type { CourseEditMapAction, CourseEditTarget } from "../../../app/shared/course-editing.js";
import type { PreviewInspectPayload } from "../../../app/shared/preview-bridge.js";
import { startIsolatedPreviewServer, type IsolatedPreviewServer } from "../../../app/server/preview-server.js";
import { getCourseEditStatus, resolveCourseEditTarget } from "../../../app/server/lib/course-editing.js";

const execFileAsync = promisify(execFile);
const NAVIGATION_TIMEOUT_MS = 30_000;
const SETTLEMENT_TIMEOUT_MS = 5_000;
const SURFACE_TIMEOUT_MS = 45_000;
const BROWSER_RSS_SURFACE_DELTA_LIMIT_BYTES = 512 * 1024 * 1024;
const BROWSER_RSS_TOTAL_LIMIT_BYTES = 1_536 * 1024 * 1024;
const VIEWPORT = { width: 1440, height: 1000 } as const;

type BrowserAttemptKind =
  | "storage"
  | "service-worker"
  | "external-network"
  | "form-state"
  | "worker";

type RenderedRawCandidate = {
  kind: CandidateKind;
  structuralPath: string;
  ownedText: string;
  selectionText: string;
  nodeId: string | null;
  tagName: string;
  role: string;
  testId: string;
  geometry: { x: number; y: number; width: number; height: number };
  attributes: { href: string; src: string; alt: string; title: string };
  linkCount: number;
  courseName: boolean;
  mapAction: CourseEditMapAction | null;
};

type RenderedRawExclusion = {
  kind: CandidateKind;
  structuralPath: string;
  code: CourseEditRenderedExclusionCode;
};

type RenderedPageCollection = {
  candidates: RenderedRawCandidate[];
  exclusions: RenderedRawExclusion[];
  observedRoutes: string[];
  observedStateKeys: string[];
  truncated: boolean;
};

export type RenderedSurfaceCollection = {
  surface: LearnerSurface;
  complete: boolean;
  reasonCode: CourseEditReasonCode | null;
  diagnosticReasonCodes?: CourseEditReasonCode[];
  candidates: CourseEditCandidate[];
  opportunities: CourseEditCapabilityOpportunity[];
  occurrences: CourseEditRenderedOccurrence[];
};

function hash(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hash24(value: string) {
  return hash(value).slice(0, 24);
}

function normalizedText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  map: (value: T, index: number) => Promise<R>
) {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await map(values[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function shortRenderedFingerprint(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
}

function reasonFromUnsupported(target: CourseEditTarget, raw: RenderedRawCandidate): CourseEditReasonCode {
  const reason = target.reason.toLowerCase();
  if (!raw.nodeId) return "runtime-owned";
  if (reason.includes("intentionally annotation only")) return "intentional-annotation-only";
  if (reason.includes("replaced by course code") || reason.includes("runtime")) return "runtime-owned";
  if (reason.includes("repeated") || reason.includes("durable")) return "ambiguous-identity";
  if (reason.includes("complex") || reason.includes("structure")) return "complex-structure";
  if (reason.includes("canonical") || reason.includes("onboarded")) return "not-canonical";
  if (reason.includes("stale") || reason.includes("changed") || reason.includes("no longer")) return "stale-source";
  if (reason.includes("select the text") || reason.includes("surrounding layout")) return "unsupported-component";
  return "resolve-rejected";
}

function opportunity(
  candidateId: string,
  kind: CourseEditCapabilityOpportunityKind,
  ordinal: number,
  supported: boolean,
  reasonCode: CourseEditReasonCode
): CourseEditCapabilityOpportunity {
  return {
    schemaVersion: 1,
    opportunityId: `co1:${hash24(`${candidateId}\0${kind}\0${ordinal}`)}`,
    candidateId,
    kind,
    supported,
    reasonCode: supported ? "ready" : reasonCode
  };
}

function opportunitiesFor(
  raw: RenderedRawCandidate,
  candidateId: string,
  target: CourseEditTarget | null,
  editable: boolean,
  reasonCode: CourseEditReasonCode
) {
  const result: CourseEditCapabilityOpportunity[] = [];
  if (raw.courseName) {
    result.push(opportunity(candidateId, "rename-synchronization", 1, editable, reasonCode));
    return result;
  }
  if (raw.kind !== "image") {
    result.push(opportunity(candidateId, "rich-text", 1, Boolean(editable && target?.capabilities.richText), reasonCode));
    for (let index = 0; index < raw.linkCount; index += 1) {
      const supported = Boolean(editable && (target?.capabilities.link || target?.capabilities.richText));
      result.push(opportunity(candidateId, "link-destination", index + 1, supported, reasonCode));
    }
  } else {
    result.push(opportunity(candidateId, "image-source", 1, Boolean(editable && target?.capabilities.image), reasonCode));
    result.push(opportunity(candidateId, "image-alt", 1, Boolean(editable && target?.capabilities.image), reasonCode));
    if (raw.attributes.title) {
      result.push(opportunity(candidateId, "image-title", 1, Boolean(editable && target?.capabilities.image), reasonCode));
    }
  }
  result.push(opportunity(candidateId, "curated-style", 1, Boolean(editable && target?.capabilities.styles), reasonCode));
  return result;
}

async function browserTreeRssBytes(rootPid: number) {
  try {
    const { stdout } = await execFileAsync("ps", ["-axo", "pid=,ppid=,rss="]);
    const processes = stdout
      .split("\n")
      .map((line) => line.trim().split(/\s+/).map(Number))
      .filter((entry) => entry.length === 3 && entry.every(Number.isFinite))
      .map(([pid, parentPid, rssKiB]) => ({ pid, parentPid, rssKiB }));
    const descendants = new Set([rootPid]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const process of processes) {
        if (descendants.has(process.parentPid) && !descendants.has(process.pid)) {
          descendants.add(process.pid);
          changed = true;
        }
      }
    }
    return processes
      .filter((process) => descendants.has(process.pid))
      .reduce((total, process) => total + process.rssKiB * 1024, 0);
  } catch {
    return null;
  }
}

async function settlePage(page: Page) {
  await page.evaluate(async ({ quietMs, maximumMs }) => {
    await new Promise<void>((resolve) => {
      let settled = false;
      let quietTimer = window.setTimeout(finish, quietMs);
      const deadline = window.setTimeout(finish, maximumMs);
      const observer = new MutationObserver(() => {
        window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(finish, quietMs);
      });
      function finish() {
        if (settled) return;
        settled = true;
        window.clearTimeout(quietTimer);
        window.clearTimeout(deadline);
        observer.disconnect();
        resolve();
      }
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }, { quietMs: 350, maximumMs: SETTLEMENT_TIMEOUT_MS });
}

async function collectPage(page: Page): Promise<RenderedPageCollection> {
  return await page.evaluate(({ maximum }) => {
    const NODE_ATTRIBUTE = "data-canvas-helper-inspect-node";
    const candidateElements = new Map<Element, CandidateKind>();
    const candidatePriorities = new Map<Element, number>();
    const exclusions: RenderedRawExclusion[] = [];
    const observedRoutes = new Set<string>();
    const observedStateKeys = new Set<string>();

    function studioOwned(element: Element) {
      return Boolean(element.closest(
        "[data-canvas-helper-preview-controls]," +
        "[data-canvas-helper-edit-map-toolbar]," +
        "[data-canvas-helper-edit-map-tooltip]," +
        "script[data-canvas-helper-course-edit-map]"
      ));
    }

    function visible(element: Element) {
      if (studioOwned(element) || element.closest("[hidden], [inert], [aria-hidden='true']")) return false;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0) return false;
      return element.getClientRects().length > 0;
    }

    function structuralPath(element: Element) {
      const segments: string[] = [];
      let current: Element | null = element;
      while (current && current !== document.documentElement && segments.length < 48) {
        const tagName = current.tagName.toLowerCase();
        let ordinal = 1;
        let sibling = current.previousElementSibling;
        while (sibling) {
          if (sibling.tagName === current.tagName) ordinal += 1;
          sibling = sibling.previousElementSibling;
        }
        segments.push(`${tagName}[${ordinal}]`);
        current = current.parentElement;
      }
      return segments.reverse().join("/");
    }

    function addHashRoute(value: string | null) {
      const id = (value ?? "").replace(/^#/, "").trim();
      if (id && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(id)) observedRoutes.add(`#${id}`);
    }

    addHashRoute(location.hash);
    document.querySelectorAll("[data-page-target]")
      .forEach((element) => { if (!studioOwned(element)) addHashRoute(element.getAttribute("data-page-target")); });
    document.querySelectorAll("a[href^='#']").forEach((element) => {
      if (studioOwned(element)) return;
      const route = element.getAttribute("href") ?? "";
      const id = route.slice(1);
      if (!id) return;
      let target: Element | null = null;
      try { target = document.getElementById(decodeURIComponent(id)); } catch {}
      if (target?.matches(".course-page,[data-page],[data-route],[role='tabpanel']")) {
        addHashRoute(route);
      }
    });
    function navigationChrome(element: Element | null) {
      return Boolean(element?.closest(
        "nav,aside,[role='navigation'],[role='menu'],.sidebar,.course-sidebar,.site-sidebar,.navigation,.nav-menu"
      ));
    }

    document.querySelectorAll("[role='tab'][aria-controls],[aria-expanded][aria-controls]").forEach((element) => {
      if (studioOwned(element)) return;
      const target = (element.getAttribute("aria-controls") ?? "").trim();
      const controlled = target ? document.getElementById(target) : null;
      if (element.getAttribute("role") !== "tab" && (navigationChrome(element) || navigationChrome(controlled))) return;
      if (target) observedStateKeys.add(`aria-controls:${target}`);
    });
    document.querySelectorAll("[data-state-target],[data-tab-target]").forEach((element) => {
      if (studioOwned(element)) return;
      const target = (element.getAttribute("data-state-target") ?? element.getAttribute("data-tab-target") ?? "").trim();
      if (target) observedStateKeys.add(`state-target:${target}`);
    });
    document.querySelectorAll("details").forEach((element) => {
      if (!studioOwned(element) && !navigationChrome(element) && visible(element)) {
        observedStateKeys.add("native-details-open");
      }
    });

    function register(element: Element, kind: CandidateKind, priority: number) {
      if (!visible(element)) return;
      const current = candidatePriorities.get(element) ?? -1;
      if (priority >= current) {
        candidateElements.set(element, kind);
        candidatePriorities.set(element, priority);
      }
    }

    document.querySelectorAll("[data-canvas-helper-course-title]").forEach((element) => register(element, "course-name", 100));
    document.querySelectorAll("[data-canvas-helper-callout-title], .callout-title, .callout__title").forEach((element) => register(element, "callout-title", 90));
    document.querySelectorAll("[data-canvas-helper-callout-body], .callout-body, .callout__body").forEach((element) => register(element, "callout-body", 90));
    document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((element) => register(element, "heading", 70));
    document.querySelectorAll("p,blockquote,label").forEach((element) => register(element, "prose", 60));
    document.querySelectorAll("li").forEach((element) => register(element, "list-item", 60));
    document.querySelectorAll("button,[role='button']").forEach((element) => register(element, "button-label", 70));
    document.querySelectorAll("figcaption").forEach((element) => register(element, "caption", 70));
    document.querySelectorAll("th,td").forEach((element) => register(element, "table-cell", 70));
    document.querySelectorAll("img").forEach((element) => register(element, "image", 80));
    document.querySelectorAll("a").forEach((element) => {
      if (!element.closest("p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,th,td,button,label")) {
        register(element, "link-label", 65);
      }
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.replace(/\s+/g, "")) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || !visible(parent) || parent.closest("script,style,template,noscript,svg,math")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes: Text[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    for (const node of textNodes) {
      let owner = node.parentElement;
      while (owner && !candidateElements.has(owner) && owner !== document.body) owner = owner.parentElement;
      if (!owner || owner === document.body) {
        const fallback = node.parentElement;
        if (fallback) register(fallback, "prose", 10);
      }
    }

    const ownedText = new Map<Element, string[]>();
    for (const node of textNodes) {
      let owner = node.parentElement;
      while (owner && !candidateElements.has(owner) && owner !== document.body) owner = owner.parentElement;
      if (!owner || owner === document.body) continue;
      const entries = ownedText.get(owner) ?? [];
      entries.push(node.textContent ?? "");
      ownedText.set(owner, entries);
    }

    const nodeIdCounts = new Map<string, number>();
    document.querySelectorAll(`[${NODE_ATTRIBUTE}]`).forEach((element) => {
      const nodeId = element.getAttribute(NODE_ATTRIBUTE) ?? "";
      nodeIdCounts.set(nodeId, (nodeIdCounts.get(nodeId) ?? 0) + 1);
    });

    const mapActions = new Map<string, CourseEditMapAction>();
    const mapElement = document.querySelector("script[type='application/json'][data-canvas-helper-course-edit-map]");
    if (mapElement) {
      try {
        const parsed = JSON.parse(mapElement.textContent ?? "null") as { entries?: Array<{ nodeId?: string; action?: CourseEditMapAction }> };
        for (const entry of parsed.entries ?? []) {
          if (typeof entry.nodeId === "string" && typeof entry.action === "string") mapActions.set(entry.nodeId, entry.action);
        }
      } catch {
        // Resolve remains the authority; an invalid informational map simply has no action hint.
      }
    }

    const candidates: RenderedRawCandidate[] = [];
    const ordered = [...candidateElements.entries()].sort((left, right) => {
      const position = left[0].compareDocumentPosition(right[0]);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
    });
    for (const [element, kind] of ordered) {
      if (candidates.length + exclusions.length >= maximum) {
        return {
          candidates,
          exclusions,
          observedRoutes: [...observedRoutes].sort(),
          observedStateKeys: [...observedStateKeys].sort(),
          truncated: true
        };
      }
      const text = (ownedText.get(element) ?? []).join(" ").replace(/\s+/g, " ").trim();
      if (kind === "image") {
        const image = element as HTMLImageElement;
        if (!image.alt.trim() && (image.getAttribute("role") === "presentation" || image.getAttribute("aria-hidden") === "true")) {
          exclusions.push({ kind, structuralPath: structuralPath(element), code: "decorative-image" });
          continue;
        }
      } else if (!text) {
        exclusions.push({ kind, structuralPath: structuralPath(element), code: "empty-semantic-unit" });
        continue;
      }
      const rect = element.getBoundingClientRect();
      const rawNodeId = element.getAttribute(NODE_ATTRIBUTE) || "";
      const nodeId = rawNodeId && nodeIdCounts.get(rawNodeId) === 1 ? rawNodeId : null;
      const selectionText = (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24_000);
      candidates.push({
        kind,
        structuralPath: structuralPath(element),
        ownedText: text,
        selectionText,
        nodeId,
        tagName: element.tagName.toLowerCase().slice(0, 24),
        role: (element.getAttribute("role") || "").slice(0, 80),
        testId: (element.getAttribute("data-testid") || "").slice(0, 160),
        geometry: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(Math.max(0, rect.width)),
          height: Math.round(Math.max(0, rect.height))
        },
        attributes: {
          href: (element.getAttribute("href") || "").slice(0, 2_048),
          src: (element.getAttribute("src") || "").slice(0, 2_048),
          alt: (element.getAttribute("alt") || "").slice(0, 2_048),
          title: (element.getAttribute("title") || "").slice(0, 2_048)
        },
        linkCount: element.matches("a") ? 1 : element.querySelectorAll("a[href]").length,
        courseName: kind === "course-name",
        mapAction: nodeId ? mapActions.get(nodeId) ?? null : null
      });
    }
    return {
      candidates,
      exclusions,
      observedRoutes: [...observedRoutes].sort(),
      observedStateKeys: [...observedStateKeys].sort(),
      truncated: false
    };
  }, { maximum: COURSE_EDITABILITY_MAX_OCCURRENCES_PER_SURFACE });
}

function initIsolationScript(fixedTimestamp: number) {
  const attempts: BrowserAttemptKind[] = [];
  Object.defineProperty(globalThis, "__name", {
    configurable: false,
    enumerable: false,
    value: <T>(target: T) => target,
    writable: false
  });
  Object.defineProperty(globalThis, "__canvasHelperCensusAttempts", {
    configurable: false,
    enumerable: false,
    value: attempts,
    writable: false
  });
  const record = (kind: BrowserAttemptKind) => { attempts.push(kind); };
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args: unknown[]) {
      super(fixedTimestamp);
      if (args.length) return Reflect.construct(RealDate, args, new.target);
    }
    static now() { return fixedTimestamp; }
  }
  Object.defineProperty(globalThis, "Date", { configurable: false, value: FixedDate, writable: false });

  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = globalThis[name];
      for (const method of ["setItem", "removeItem", "clear"] as const) {
        Object.defineProperty(storage, method, {
          configurable: false,
          value: (..._args: unknown[]) => {
            record("storage");
            throw new DOMException("Browser storage is disabled during the read-only census.", "SecurityError");
          }
        });
      }
    } catch {
      // Storage residue is checked independently after load.
    }
  }
  try {
    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    if (cookie?.get && cookie.set) {
      Object.defineProperty(Document.prototype, "cookie", {
        configurable: false,
        get: cookie.get,
        set: function blockedCookieWrite(_value: string) {
          record("storage");
          throw new DOMException("Cookies are disabled during the read-only census.", "SecurityError");
        }
      });
    }
  } catch {}
  try {
    const originalOpen = indexedDB.open.bind(indexedDB);
    Object.defineProperty(indexedDB, "open", {
      configurable: false,
      value: (...args: Parameters<IDBFactory["open"]>) => {
        record("storage");
        return originalOpen(...args);
      }
    });
  } catch {}
  try {
    const originalOpen = caches.open.bind(caches);
    Object.defineProperty(caches, "open", {
      configurable: false,
      value: (...args: Parameters<CacheStorage["open"]>) => {
        record("storage");
        return originalOpen(...args);
      }
    });
  } catch {}
  try {
    const serviceWorker = navigator.serviceWorker;
    const originalRegister = serviceWorker.register.bind(serviceWorker);
    Object.defineProperty(serviceWorker, "register", {
      configurable: false,
      value: (...args: Parameters<ServiceWorkerContainer["register"]>) => {
        record("service-worker");
        return originalRegister(...args);
      }
    });
  } catch {}
  for (const name of ["Worker", "SharedWorker"] as const) {
    try {
      const Original = globalThis[name];
      Object.defineProperty(globalThis, name, {
        configurable: false,
        value: function CensusBlockedWorker(..._args: unknown[]) {
          record("worker");
          throw new DOMException("Workers are disabled during the read-only census.", "SecurityError");
        },
        writable: false
      });
      Object.setPrototypeOf(globalThis[name], Original);
    } catch {}
  }
  for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection"] as const) {
    try {
      const Original = globalThis[name as keyof typeof globalThis];
      if (typeof Original !== "function") continue;
      Object.defineProperty(globalThis, name, {
        configurable: false,
        value: function CensusBlockedPeerConnection(..._args: unknown[]) {
          record("external-network");
          throw new DOMException("WebRTC is disabled during the read-only census.", "SecurityError");
        },
        writable: false
      });
    } catch {}
  }
  try {
    const originalFetch = globalThis.fetch.bind(globalThis);
    Object.defineProperty(globalThis, "fetch", {
      configurable: false,
      value: (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = input instanceof Request ? input.url : String(input);
        const target = new URL(raw, location.href);
        if (!["data:", "blob:"].includes(target.protocol) && target.origin !== location.origin) {
          record("external-network");
          return Promise.reject(new DOMException("External network is disabled during the read-only census.", "SecurityError"));
        }
        return originalFetch(input, init);
      },
      writable: false
    });
  } catch {}
  try {
    const originalOpen = XMLHttpRequest.prototype.open;
    Object.defineProperty(XMLHttpRequest.prototype, "open", {
      configurable: false,
      value: function censusOpen(method: string, url: string | URL, ...rest: unknown[]) {
        const target = new URL(String(url), location.href);
        if (!["data:", "blob:"].includes(target.protocol) && target.origin !== location.origin) {
          record("external-network");
          throw new DOMException("External network is disabled during the read-only census.", "SecurityError");
        }
        return Reflect.apply(originalOpen, this, [method, String(url), ...rest]);
      }
    });
  } catch {}
  for (const name of ["WebSocket", "EventSource"] as const) {
    try {
      const Original = globalThis[name];
      Object.defineProperty(globalThis, name, {
        configurable: false,
        value: function CensusNetworkConstructor(url: string | URL, ...rest: unknown[]) {
          const target = new URL(String(url), location.href);
          if (!["data:", "blob:"].includes(target.protocol) && target.origin !== location.origin) {
            record("external-network");
            throw new DOMException("External network is disabled during the read-only census.", "SecurityError");
          }
          return Reflect.construct(Original, [String(url), ...rest], new.target);
        },
        writable: false
      });
      Object.setPrototypeOf(globalThis[name], Original);
    } catch {}
  }
  for (const [constructor, property] of [
    [HTMLInputElement, "value"],
    [HTMLInputElement, "checked"],
    [HTMLTextAreaElement, "value"],
    [HTMLSelectElement, "value"],
    [HTMLSelectElement, "selectedIndex"]
  ] as const) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, property);
      if (!descriptor?.get || !descriptor.set) continue;
      Object.defineProperty(constructor.prototype, property, {
        configurable: false,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set: function observedFormStateWrite(value: unknown) {
          record("form-state");
          return descriptor.set?.call(this, value);
        }
      });
    } catch {}
  }
  for (const method of ["submit", "requestSubmit", "reset"] as const) {
    try {
      Object.defineProperty(HTMLFormElement.prototype, method, {
        configurable: false,
        value: function blockedFormMutation(..._args: unknown[]) {
          record("form-state");
          throw new DOMException("Form submission and reset are disabled during the read-only census.", "SecurityError");
        }
      });
    } catch {}
  }
  try {
    const originalBeacon = navigator.sendBeacon.bind(navigator);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: false,
      value: (..._args: Parameters<Navigator["sendBeacon"]>) => {
        record("external-network");
        void originalBeacon;
        return false;
      }
    });
  } catch {}
}

async function browserResidue(context: BrowserContext, page: Page) {
  const storageState = await context.storageState();
  const pageState = await page.evaluate(async () => {
    const attempts = ((globalThis as typeof globalThis & { __canvasHelperCensusAttempts?: BrowserAttemptKind[] })
      .__canvasHelperCensusAttempts ?? []).slice();
    const cacheNames = typeof caches === "undefined" ? [] : await caches.keys().catch(() => []);
    const databaseCount = typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function"
      ? 0
      : (await indexedDB.databases().catch(() => [])).length;
    return {
      attempts,
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
      cacheCount: cacheNames.length,
      databaseCount
    };
  });
  return {
    attempts: pageState.attempts,
    hasStorage: Boolean(
      storageState.cookies.length ||
      storageState.origins.some((origin) => origin.localStorage.length) ||
      pageState.localStorage ||
      pageState.sessionStorage ||
      pageState.cacheCount ||
      pageState.databaseCount
    )
  };
}

export class RenderedCourseEditabilityCollector {
  private constructor(
    private readonly repoRoot: string,
    private readonly commitTimestampMs: number,
    private readonly preview: IsolatedPreviewServer,
    private readonly browserServer: BrowserServer,
    private readonly browser: Browser
  ) {}

  static async create(repoRoot: string, commitTimestamp: string) {
    const commitTimestampMs = Date.parse(commitTimestamp);
    if (!Number.isFinite(commitTimestampMs)) throw new Error("The census requires a valid exact-commit timestamp.");
    const studioOrigin = "http://127.0.0.1:4173";
    const preview = await startIsolatedPreviewServer({ studioOrigin, repoRoot });
    let browserServer: BrowserServer | null = null;
    let browser: Browser | null = null;
    try {
      browserServer = await chromium.launchServer({ headless: true });
      browser = await chromium.connect(browserServer.wsEndpoint());
      return new RenderedCourseEditabilityCollector(repoRoot, commitTimestampMs, preview, browserServer, browser);
    } catch (error) {
      await browser?.close().catch(() => undefined);
      await browserServer?.close().catch(() => undefined);
      await preview.close();
      throw error;
    }
  }

  async close() {
    await this.browser.close().catch(() => undefined);
    await this.browserServer.close().catch(() => undefined);
    await this.preview.close();
  }

  async collect(
    surface: LearnerSurface,
    declaredSurfaces: readonly LearnerSurface[] = [surface]
  ): Promise<RenderedSurfaceCollection> {
    let context: BrowserContext | null = null;
    const externalAttempts: Array<{ critical: boolean; resourceType: string }> = [];
    const run = async (): Promise<RenderedSurfaceCollection> => {
      if (surface.stateKey !== null && surface.stateKey !== COURSE_EDITABILITY_NATIVE_DETAILS_STATE) {
        return { surface, complete: false, reasonCode: "uninspectable-page", candidates: [], opportunities: [], occurrences: [] };
      }
      const rssBefore = await browserTreeRssBytes(this.browserServer.process().pid ?? -1);
      context = await this.browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
        locale: "en-CA",
        timezoneId: "America/Edmonton",
        colorScheme: "light",
        reducedMotion: "reduce",
        serviceWorkers: "block"
      });
      await context.addInitScript("Object.defineProperty(globalThis, '__name', { configurable: false, value: function(target) { return target; } });");
      await context.addInitScript(initIsolationScript, this.commitTimestampMs);
      await context.routeWebSocket(/.*/, async (socket) => {
        externalAttempts.push({ critical: true, resourceType: "websocket" });
        await socket.close({ code: 1008, reason: "Network disabled during read-only census" });
      });
      await context.route("**/*", async (route) => {
        let url: URL;
        try {
          url = new URL(route.request().url());
        } catch {
          externalAttempts.push({ critical: true, resourceType: "invalid-url" });
          await route.abort();
          return;
        }
        if (url.origin === this.preview.origin || ["data:", "blob:", "about:"].includes(url.protocol)) {
          await route.continue();
        } else {
          const resourceType = route.request().resourceType();
          const externalSubdocument = resourceType === "document" && route.request().frame().parentFrame() !== null;
          const knownFontStylesheet = resourceType === "stylesheet" && [
            "fonts.googleapis.com",
            "fonts.gstatic.com"
          ].includes(url.hostname.toLowerCase());
          const critical = ([
            "document",
            "script",
            "xhr",
            "fetch",
            "eventsource",
            "websocket",
            "manifest"
          ].includes(resourceType) && !externalSubdocument) || (resourceType === "stylesheet" && !knownFontStylesheet);
          externalAttempts.push({ critical, resourceType });
          await route.abort();
        }
      });
      const token = randomUUID();
      const encodedPath = surface.htmlPath.split("/").map(encodeURIComponent).join("/");
      const baseUrl = `${this.preview.origin}/_canvas-helper/p/${token}/preview/workspace/${encodeURIComponent(surface.projectSlug)}/${encodedPath}`;
      const targetUrl = `${baseUrl}${surface.route}`;
      const page = await context.newPage();
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS,
        referer: this.preview.studioOrigin
      });
      await settlePage(page);
      if (surface.stateKey === COURSE_EDITABILITY_NATIVE_DETAILS_STATE) {
        const opened = await page.evaluate(() => {
          let count = 0;
          document.querySelectorAll("details").forEach((element) => {
            if (element.closest("[hidden],[inert],[aria-hidden='true'],nav,aside,[role='navigation'],[role='menu']")) return;
            const style = getComputedStyle(element);
            if (style.display === "none" || style.visibility === "hidden" || element.getClientRects().length === 0) return;
            element.open = true;
            count += 1;
          });
          return count;
        });
        if (!opened) {
          return { surface, complete: false, reasonCode: "surface-inventory-incomplete", candidates: [], opportunities: [], occurrences: [] };
        }
        await settlePage(page);
      }
      const raw = await collectPage(page);
      const samePageDeclarations = declaredSurfaces.filter((entry) => (
        entry.projectSlug === surface.projectSlug && entry.htmlPath === surface.htmlPath
      ));
      const declaredRoutes = new Set(samePageDeclarations.map((entry) => entry.route));
      const declaredStateKeys = new Set(samePageDeclarations
        .filter((entry) => entry.route === surface.route)
        .flatMap((entry) => entry.stateKey ? [entry.stateKey] : []));
      if (
        raw.observedRoutes.some((route) => !declaredRoutes.has(route)) ||
        raw.observedStateKeys.some((stateKey) => !declaredStateKeys.has(stateKey))
      ) {
        if (process.env.COURSE_EDITABILITY_DEBUG === "1") {
          console.error(`[course-editability:${surface.projectSlug}:${surface.route || "base"}] undeclared surfaces`, JSON.stringify({
            routes: raw.observedRoutes.filter((route) => !declaredRoutes.has(route)),
            states: raw.observedStateKeys.filter((stateKey) => !declaredStateKeys.has(stateKey))
          }));
        }
        return {
          surface,
          complete: false,
          reasonCode: "surface-inventory-incomplete",
          candidates: [],
          opportunities: [],
          occurrences: []
        };
      }
      const residue = await browserResidue(context, page);
      const rss = await browserTreeRssBytes(this.browserServer.process().pid ?? -1);
      if (raw.truncated) {
        return { surface, complete: false, reasonCode: "candidate-truncated", candidates: [], opportunities: [], occurrences: [] };
      }
      if (
        rss !== null && (
          rss > BROWSER_RSS_TOTAL_LIMIT_BYTES ||
          (rssBefore !== null && rss - rssBefore > BROWSER_RSS_SURFACE_DELTA_LIMIT_BYTES)
        )
      ) {
        return { surface, complete: false, reasonCode: "surface-memory-limit", candidates: [], opportunities: [], occurrences: [] };
      }
      if (externalAttempts.some((attempt) => attempt.critical) || residue.attempts.includes("external-network")) {
        if (process.env.COURSE_EDITABILITY_DEBUG === "1") {
          console.error(`[course-editability:${surface.projectSlug}:${surface.route || "base"}] blocked executable network`, JSON.stringify({
            resourceTypes: [...new Set(externalAttempts.filter((attempt) => attempt.critical).map((attempt) => attempt.resourceType))].sort(),
            runtimeAttempt: residue.attempts.includes("external-network")
          }));
        }
        return { surface, complete: false, reasonCode: "external-network-attempt", candidates: [], opportunities: [], occurrences: [] };
      }
      if (residue.attempts.includes("service-worker")) {
        return { surface, complete: false, reasonCode: "service-worker-attempt", candidates: [], opportunities: [], occurrences: [] };
      }
      if (residue.hasStorage || residue.attempts.includes("storage")) {
        return { surface, complete: false, reasonCode: "storage-write-attempt", candidates: [], opportunities: [], occurrences: [] };
      }
      if (residue.attempts.includes("form-state")) {
        return { surface, complete: false, reasonCode: "form-state-attempt", candidates: [], opportunities: [], occurrences: [] };
      }
      if (residue.attempts.includes("worker")) {
        return { surface, complete: false, reasonCode: "uninspectable-page", candidates: [], opportunities: [], occurrences: [] };
      }

      const status = raw.candidates.some((candidate) => candidate.courseName)
        ? await getCourseEditStatus(surface.projectSlug, this.repoRoot)
        : null;
      const provisional = await mapWithConcurrency(raw.candidates, 8, async (candidate, index): Promise<{
        raw: RenderedRawCandidate;
        candidate: CourseEditCandidate;
        target: CourseEditTarget | null;
        ownerKey: string;
      }> => {
        let target: CourseEditTarget | null = null;
        let editable = false;
        let reasonCode: CourseEditReasonCode = "runtime-owned";
        let ownerKey = `runtime:${candidate.structuralPath}`;
        if (candidate.courseName && candidate.mapAction === "rename-course") {
          editable = Boolean(status?.canRenameCourse);
          reasonCode = editable ? "ready" : "resolve-rejected";
          ownerKey = `course-name:${surface.projectSlug}`;
        } else if (candidate.nodeId) {
          const selection: PreviewInspectPayload = {
            nodeId: candidate.nodeId,
            selectionKind: "element",
            visibleText: candidate.selectionText.slice(0, 500),
            tagName: candidate.tagName,
            role: candidate.role,
            testId: candidate.testId,
            geometry: candidate.geometry,
            viewport: VIEWPORT,
            scroll: { windowTop: 0, windowLeft: 0, containers: [] },
            pageHref: targetUrl,
            rendered: {
              textFingerprint: shortRenderedFingerprint(candidate.selectionText),
              textLength: candidate.selectionText.length,
              attributes: candidate.attributes
            }
          };
          target = await resolveCourseEditTarget({
            projectSlug: surface.projectSlug,
            root: "workspace",
            htmlPath: surface.htmlPath,
            selection
          }, this.repoRoot);
          editable = target.eligibility === "editable";
          reasonCode = editable ? "ready" : reasonFromUnsupported(target, candidate);
          if (target.identity) ownerKey = `source:${target.identity.editId ?? target.identity.targetId}`;
          else ownerKey = `source-node:${candidate.nodeId}`;
        }
        const canonicalOwnerDigest = ownerKey.startsWith("runtime:") ? null : hash(ownerKey);
        const renderedFingerprint = hash([
          candidate.tagName,
          candidate.structuralPath,
          candidate.selectionText,
          candidate.attributes.href,
          candidate.attributes.src,
          candidate.attributes.alt,
          candidate.attributes.title
        ].join("\0"));
        const candidateId = `cc1:${hash24([
          surface.surfaceId,
          candidate.kind,
          canonicalOwnerDigest ?? candidate.structuralPath,
          String(index + 1)
        ].join("\0"))}`;
        return {
          raw: candidate,
          target,
          ownerKey,
          candidate: {
            schemaVersion: 1,
            candidateId,
            surfaceId: surface.surfaceId,
            kind: candidate.kind,
            classification: editable ? "editable" : "annotation-only",
            ownership: candidate.nodeId ? "source-backed" : "runtime-owned",
            reasonCode,
            sourceNodeId: candidate.nodeId,
            canonicalOwnerDigest,
            renderedFingerprint,
            normalizedTextCodeUnits: normalizedText(candidate.ownedText).length,
            resolveChecked: Boolean(candidate.nodeId || candidate.courseName),
            resolveEligible: editable
          }
        };
      });

      const candidates: CourseEditCandidate[] = [];
      const opportunities: CourseEditCapabilityOpportunity[] = [];
      const occurrences: CourseEditRenderedOccurrence[] = [];
      const owners = new Map<string, CourseEditCandidate>();
      for (const entry of provisional) {
        const duplicate = entry.candidate.canonicalOwnerDigest
          ? owners.get(`${entry.candidate.kind}\0${entry.candidate.canonicalOwnerDigest}`)
          : undefined;
        const occurrenceId = `ro1:${hash24(`${surface.surfaceId}\0${entry.candidate.kind}\0${entry.raw.structuralPath}`)}`;
        if (duplicate) {
          occurrences.push({
            schemaVersion: 1,
            occurrenceId,
            surfaceId: surface.surfaceId,
            semanticKind: entry.candidate.kind,
            disposition: { kind: "duplicate-presentation", candidateId: duplicate.candidateId }
          });
          continue;
        }
        candidates.push(entry.candidate);
        if (entry.candidate.canonicalOwnerDigest) {
          owners.set(`${entry.candidate.kind}\0${entry.candidate.canonicalOwnerDigest}`, entry.candidate);
        }
        opportunities.push(...opportunitiesFor(
          entry.raw,
          entry.candidate.candidateId,
          entry.target,
          entry.candidate.resolveEligible,
          entry.candidate.reasonCode
        ));
        occurrences.push({
          schemaVersion: 1,
          occurrenceId,
          surfaceId: surface.surfaceId,
          semanticKind: entry.candidate.kind,
          disposition: { kind: "primary-candidate", candidateId: entry.candidate.candidateId }
        });
      }
      for (const exclusion of raw.exclusions) {
        occurrences.push({
          schemaVersion: 1,
          occurrenceId: `ro1:${hash24(`${surface.surfaceId}\0${exclusion.kind}\0${exclusion.structuralPath}`)}`,
          surfaceId: surface.surfaceId,
          semanticKind: exclusion.kind,
          disposition: { kind: "excluded", exclusionCode: exclusion.code }
        });
      }
      return {
        surface,
        complete: true,
        reasonCode: null,
        ...(externalAttempts.length ? { diagnosticReasonCodes: ["external-network-attempt" as const] } : {}),
        candidates,
        opportunities,
        occurrences
      };
    };

    try {
      return await Promise.race([
        run(),
        new Promise<RenderedSurfaceCollection>((resolve) => {
          const timer = setTimeout(() => resolve({
            surface,
            complete: false,
            reasonCode: "surface-timeout",
            candidates: [],
            opportunities: [],
            occurrences: []
          }), SURFACE_TIMEOUT_MS);
          timer.unref();
        })
      ]);
    } catch (error) {
      if (process.env.COURSE_EDITABILITY_DEBUG === "1") {
        console.error(`[course-editability:${surface.projectSlug}:${surface.route || "base"}]`, error);
      }
      return { surface, complete: false, reasonCode: "uninspectable-page", candidates: [], opportunities: [], occurrences: [] };
    } finally {
      const activeContext = context as BrowserContext | null;
      if (activeContext) await activeContext.close().catch(() => undefined);
    }
  }
}

export const COURSE_EDITABILITY_RENDER_LIMITS = {
  navigationTimeoutMs: NAVIGATION_TIMEOUT_MS,
  settlementTimeoutMs: SETTLEMENT_TIMEOUT_MS,
  surfaceTimeoutMs: SURFACE_TIMEOUT_MS,
  browserRssSurfaceDeltaBytes: BROWSER_RSS_SURFACE_DELTA_LIMIT_BYTES,
  browserRssTotalBytes: BROWSER_RSS_TOTAL_LIMIT_BYTES,
  viewportWidth: VIEWPORT.width,
  viewportHeight: VIEWPORT.height,
  maximumOccurrencesPerSurface: COURSE_EDITABILITY_MAX_OCCURRENCES_PER_SURFACE,
  maximumWorkers: 2
} as const;
