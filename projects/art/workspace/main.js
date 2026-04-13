const STORAGE_KEY = "art-course-shell-progress-v1";
const lessonCache = new Map();

function cleanText(value) {
  return String(value ?? "")
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã‚", "")
    .trim();
}

function sanitizeLessonDocument(doc) {
  const body = doc.body;
  if (!body) return;

  body.querySelectorAll("script,style,link,meta,noscript").forEach((n) => n.remove());
  for (const el of body.querySelectorAll("*")) {
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("id");
  }
  body.querySelectorAll("font").forEach((fontNode) => {
    const span = doc.createElement("span");
    span.innerHTML = fontNode.innerHTML;
    fontNode.replaceWith(span);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inferKind(title) {
  const t = title.toLowerCase();
  if (t.includes("assignment") || t.includes("rubric") || t.includes("checklist")) return "assignment";
  if (t.includes("quiz") || t.includes("assessment")) return "assessment";
  return "lesson";
}

function flattenNodes(nodes, moduleTitle, parentPath = "") {
  const lessons = [];
  for (const node of nodes) {
    const title = cleanText(node.title || "Untitled");
    const path = parentPath ? `${parentPath} / ${title}` : title;
    const href = node.resource?.hrefs?.[0];
    if (href && /\.html?$/i.test(href)) {
      lessons.push({ id: node.id, title, moduleTitle, path, href, kind: inferKind(title) });
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      lessons.push(...flattenNodes(node.children, moduleTitle, path));
    }
  }
  return lessons;
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      activeLessonId: parsed.activeLessonId || "",
      activeModuleId: parsed.activeModuleId || "",
      completed: new Set(Array.isArray(parsed.completed) ? parsed.completed : []),
      collapsedModules: new Set(Array.isArray(parsed.collapsedModuleIds) ? parsed.collapsedModuleIds : []),
      hasSavedCollapse: Array.isArray(parsed.collapsedModuleIds)
    };
  } catch {
    return { activeLessonId: "", activeModuleId: "", completed: new Set(), collapsedModules: new Set(), hasSavedCollapse: false };
  }
}

function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      activeLessonId: state.activeLessonId,
      activeModuleId: state.activeModuleId,
      completed: [...state.completed],
      collapsedModuleIds: [...state.collapsedModules]
    })
  );
}

function createReport(modules, completedSet) {
  const lines = ["Art Studio Course Shell - Progress Report", `Generated: ${new Date().toLocaleString()}`, ""];
  for (const module of modules) {
    const done = module.lessons.filter((lesson) => completedSet.has(lesson.id)).length;
    lines.push(`${module.title}: ${done}/${module.lessons.length}`);
    for (const lesson of module.lessons) lines.push(`  ${completedSet.has(lesson.id) ? "[x]" : "[ ]"} ${lesson.title}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function loadLessonHtml(href) {
  if (lessonCache.has(href)) return lessonCache.get(href);
  const response = await fetch(`./content/${href}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${href} (${response.status})`);
  const raw = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");
  sanitizeLessonDocument(doc);
  const content = doc.body?.innerHTML?.trim() || "";
  lessonCache.set(href, content);
  return content;
}

function getYouTubeIdFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1]?.split("/")[0];
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/shorts/")[1]?.split("/")[0];
    }
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "").split("/")[0];
    return "";
  } catch {
    return "";
  }
}

function normalizeMediaEmbeds(doc) {
  const body = doc.body;
  if (!body) return;
  const embeddedIds = new Set();

  for (const iframe of body.querySelectorAll("iframe")) {
    const src = iframe.getAttribute("src") || "";
    const ytId = getYouTubeIdFromUrl(src);
    if (ytId) {
      iframe.setAttribute("src", `https://www.youtube.com/embed/${ytId}`);
      embeddedIds.add(ytId);
    }
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "true");
    if (!iframe.getAttribute("title")) iframe.setAttribute("title", "Lesson Video");
  }

  for (const link of body.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href") || "";
    const ytId = getYouTubeIdFromUrl(href);
    if (!ytId) continue;
    if (embeddedIds.has(ytId)) {
      link.remove();
      continue;
    }
    const iframe = doc.createElement("iframe");
    iframe.setAttribute("src", `https://www.youtube.com/embed/${ytId}`);
    iframe.setAttribute("title", "Lesson Video");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "true");
    link.replaceWith(iframe);
    embeddedIds.add(ytId);
  }
}

function pickHeroImage(html) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : "";
}

function getModuleLabel(moduleTitle) {
  const m = moduleTitle.match(/art\s*(\d+)/i);
  return m ? `ART ${m[1]}` : moduleTitle.toUpperCase();
}

function getModuleNumber(title) {
  const m = title.match(/art\s*(\d+)/i);
  return m ? Number(m[1]) : 999;
}

function renderCurriculum(modules, state, onSelect, onToggleModule) {
  const list = document.getElementById("curriculum-list");
  list.innerHTML = modules
    .map((module) => {
      const collapsed = state.collapsedModules.has(module.id);
      const doneCount = module.lessons.filter((lesson) => state.completed.has(lesson.id)).length;
      const lessons = module.lessons
        .map((lesson) => {
          const active = lesson.id === state.activeLessonId;
          const done = state.completed.has(lesson.id);
          const icon = lesson.kind === "lesson" ? "draw" : lesson.kind === "assignment" ? "brush" : "task_alt";
          return `<button class="w-full text-left px-4 py-3 ${active ? "bg-[#ffaca0]/20 text-[#c0281f] border-l-4 border-[#925600]" : "text-[#373831] opacity-80 hover:bg-[#fffcf7] transition-all rounded-xl"} flex items-center gap-3 mb-2" data-lesson-id="${escapeHtml(lesson.id)}"><span class="material-symbols-outlined">${icon}</span><span class="font-['Newsreader'] italic text-lg">${escapeHtml(lesson.title)}${done ? " completed" : ""}</span></button>`;
        })
        .join("");
      return `<section class="mb-3">
        <button class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#ece6da] hover:bg-[#e5decf] transition-colors" data-module-id="${escapeHtml(module.id)}">
          <span class="font-['Epilogue'] font-bold text-xs tracking-widest uppercase text-[#925600]">${escapeHtml(getModuleLabel(module.title))} (${doneCount}/${module.lessons.length})</span>
          <span class="material-symbols-outlined text-[#7b776d]">${collapsed ? "expand_more" : "expand_less"}</span>
        </button>
        <div class="mt-2 ${collapsed ? "hidden" : ""}" data-module-lessons="${escapeHtml(module.id)}">${lessons}</div>
      </section>`;
    })
    .join("");

  list.querySelectorAll("button[data-module-id]").forEach((b) =>
    b.addEventListener("click", () => onToggleModule(b.getAttribute("data-module-id")))
  );
  list.querySelectorAll("button[data-lesson-id]").forEach((b) =>
    b.addEventListener("click", () => onSelect(b.getAttribute("data-lesson-id")))
  );
}

async function bootstrap() {
  const XL_BREAKPOINT_QUERY = "(min-width: 1280px)";
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const menuButton = document.getElementById("btn-menu");
  const mainShell = document.getElementById("main-shell");

  function isDesktop() {
    return window.matchMedia(XL_BREAKPOINT_QUERY).matches;
  }

  function syncMainOffset() {
    const open = !sidebar?.classList.contains("-translate-x-full");
    if (isDesktop() && open) {
      mainShell?.classList.add("main-with-sidebar");
      return;
    }
    mainShell?.classList.remove("main-with-sidebar");
  }

  function openSidebar() {
    sidebar?.classList.remove("-translate-x-full");
    if (!isDesktop()) backdrop?.classList.remove("hidden");
    else backdrop?.classList.add("hidden");
    syncMainOffset();
  }

  function closeSidebar() {
    sidebar?.classList.add("-translate-x-full");
    backdrop?.classList.add("hidden");
    syncMainOffset();
  }

  function syncSidebarForViewport() {
    if (isDesktop()) {
      backdrop?.classList.add("hidden");
      openSidebar();
      return;
    }
    closeSidebar();
  }

  menuButton?.addEventListener("click", () => {
    if (sidebar?.classList.contains("-translate-x-full")) {
      openSidebar();
      return;
    }
    closeSidebar();
  });
  backdrop?.addEventListener("click", closeSidebar);
  window.addEventListener("resize", syncSidebarForViewport);
  syncSidebarForViewport();

  let mapData = null;
  for (const candidate of ["./d2l-course-map.json", "../meta/d2l-course-map.json"]) {
    const r = await fetch(candidate, { cache: "no-store" });
    if (r.ok) {
      mapData = await r.json();
      break;
    }
  }
  if (!mapData) throw new Error("Could not load d2l-course-map.json");

  const modules = (mapData.modules || [])
    .map((m) => ({ id: m.id, title: cleanText(m.title || "Module"), lessons: flattenNodes(m.children || [], cleanText(m.title || "Module")) }))
    .filter((m) => ["art 10", "art 20", "art 30"].includes(m.title.toLowerCase()))
    .sort((a, b) => getModuleNumber(a.title) - getModuleNumber(b.title));

  const allLessons = modules.flatMap((m) => m.lessons);
  const lessonById = new Map(allLessons.map((l) => [l.id, l]));
  const moduleByLesson = new Map();
  modules.forEach((m) => m.lessons.forEach((l) => moduleByLesson.set(l.id, m)));

  const state = loadState();
  if (!state.activeLessonId || !lessonById.has(state.activeLessonId)) state.activeLessonId = allLessons[0]?.id || "";
  state.activeModuleId = moduleByLesson.get(state.activeLessonId)?.id || modules[0]?.id || "";
  if (!state.hasSavedCollapse) {
    state.collapsedModules = new Set(modules.map((m) => m.id).filter((id) => id !== state.activeModuleId));
  }

  async function render() {
    const activeLesson = lessonById.get(state.activeLessonId);
    const activeModule = moduleByLesson.get(state.activeLessonId) || modules[0];
    if (!activeLesson || !activeModule) return;

    renderCurriculum(
      modules,
      state,
      async (lessonId) => {
        state.activeLessonId = lessonId;
        state.activeModuleId = moduleByLesson.get(lessonId)?.id || state.activeModuleId;
        state.collapsedModules.delete(state.activeModuleId);
        saveState(state);
        if (!window.matchMedia(XL_BREAKPOINT_QUERY).matches) closeSidebar();
        await render();
      },
      async (moduleId) => {
        if (state.collapsedModules.has(moduleId)) state.collapsedModules.delete(moduleId);
        else state.collapsedModules.add(moduleId);
        saveState(state);
        await render();
      }
    );

    const completedCount = allLessons.filter((l) => state.completed.has(l.id)).length;
    document.getElementById("progress-pill").textContent = `Overall progress: ${completedCount}/${allLessons.length} completed`;
    document.getElementById("module-crumb").innerHTML = `<span>${getModuleLabel(activeModule.title)}</span><span>/</span><span>LESSON</span>`;
    document.getElementById("lesson-heading").innerHTML = `${escapeHtml(activeLesson.title)}`;

    const lessonContent = document.getElementById("lesson-content");
    const heroMedia = document.getElementById("hero-media");
    lessonContent.innerHTML = "<p>Loading lesson...</p>";
    const html = await loadLessonHtml(activeLesson.href);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    normalizeMediaEmbeds(doc);
    const normalizedHtml = doc.body?.innerHTML?.trim() || "";
    const image = pickHeroImage(normalizedHtml);
    heroMedia.innerHTML = image
      ? `<div class="aspect-video overflow-hidden shadow-2xl rounded-xl border-[12px] border-surface_container_highest hand-drawn-border bg-surface_container"><img src="./content/${image}" class="w-full h-full object-cover" alt="${escapeHtml(activeLesson.title)}" /></div>`
      : "";
    lessonContent.innerHTML = normalizedHtml || "<p>No lesson content found.</p>";
    saveState(state);
  }

  document.getElementById("btn-reset-progress").addEventListener("click", async () => {
    state.completed.clear();
    saveState(state);
    await render();
  });

  document.getElementById("btn-print-report").addEventListener("click", () => {
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!popup) return;
    popup.document.write(`<html><head><title>Art Studio Course Report</title></head><body style="font-family:Newsreader,serif;padding:20px;background:#fffcf7;color:#373831;"><pre style="font-size:14px;line-height:1.5;">${escapeHtml(createReport(modules, state.completed))}</pre></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  });

  await render();
}

bootstrap().catch((error) => {
  document.body.innerHTML = `<div style="padding:16px;font-family:Epilogue,sans-serif;color:#7f1d1d;">${escapeHtml(error instanceof Error ? error.message : "Failed to load studio shell.")}</div>`;
});
