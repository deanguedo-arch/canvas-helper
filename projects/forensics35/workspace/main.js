import { Fragment, jsx, jsxs } from "https://esm.sh/react@19.1.1/jsx-runtime";
import __CanvasHelperReactDomClient from "https://esm.sh/react-dom@19.1.1/client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "https://esm.sh/react@19.1.1";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  FileText,
  ClipboardCheck,
  Library,
  Search,
  PlayCircle,
  FileImage,
  FileQuestion,
  FileBadge,
  Bookmark
} from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";
import d2lCourseMapData from "./d2l-map-data.js";
import courseShellData from "./course-shell-data.js";
const actualHtmlSamples = {
  citeSources: `
    <div class="lesson-html">
      <h1>When asked to provide your sources use the following link to help you cite using APA or MLA formats:</h1>
      <div class="image-banner">Exported image banner preserved here in the real build</div>
      <p><strong>External citation helper:</strong> EasyBib / Chegg citation guidance link</p>
    </div>
  `,
  evidenceOverview: `
    <div class="lesson-html">
      <h3>Module Overview</h3>
      <h2>Types of Evidence &amp; Fingerprint Analysis</h2>
      <p>A person cannot be convicted of a crime simply because the police believe that he or she is guilty. The only way to convict a person successfully of a criminal act is by obtaining evidence that proves the individual committed the crime. This is known as the burden of proof.</p>
      <p>Fingerprint collection and fingerprint pattern analysis have been used to apprehend and convict criminals for over 100 years. Because individual fingerprint patterns are unique, fingerprints distinguish one person from another.</p>
      <ul>
        <li>introduce two categories of physical evidence with examples of each type</li>
        <li>explain the cause of and types of fingerprint patterns</li>
        <li>explain techniques used to enhance hidden fingerprints</li>
        <li>examine historical and fictional criminal investigations</li>
      </ul>
    </div>
  `,
  evidenceTypes: `
    <div class="lesson-html">
      <h2>Identified Evidence and Individualized Evidence</h2>
      <p>Physical evidence from a crime scene comes in many different forms, such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibers.</p>
      <p>Finding and interpreting physical evidence is crucial because it can prove that a crime has been committed, establish the identity of suspects, exonerate the innocent, corroborate testimony, and be more reliable than eyewitness evidence.</p>
      <table>
        <thead>
          <tr><th>Individualized Physical Evidence</th><th>Identified Physical Evidence</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Unique and directly linked to a specific person or source. Examples: fingerprints, DNA, bullet casings, dental impressions.</td>
            <td>Shares a common source or class. Examples: clothing, shoe prints, blood type, paint chips.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
};
const courseSeed = {
  title: "Forensic Studies 35",
  subtitle: "Course content mapped from the Brightspace export",
  stats: { topLevelSections: 12, totalNodes: 172 },
  modules: [
    {
      id: "course-info",
      title: "Course Information",
      lessonCount: 2,
      lessons: [
        {
          id: "outline",
          title: "Course outline (MUST READ)",
          type: "pdf",
          sourceFile: "\u0441ontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf",
          pdfMeta: { pages: 14, size: "652 KB" },
          learn: {
            heading: "Course outline (MUST READ)",
            excerpt: "This source exports as a PDF. In the real player this opens inside an in-app PDF viewer instead of throwing students into a detached file download.",
            bullets: [
              "Preserve PDF inside the lesson shell",
              "Show page navigation and zoom",
              "Keep previous/next navigation around the PDF",
              "Avoid breaking the course flow"
            ],
            callout: "Static source files should stay integrated into the course experience instead of becoming detached downloads."
          },
          resources: ["Original PDF source", "Course shell metadata"]
        },
        {
          id: "cite",
          title: "How to Properly Cite Sources",
          type: "html-reading",
          sourceFile: "\u0441ontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html",
          htmlSample: actualHtmlSamples.citeSources,
          learn: {
            heading: "How to Properly Cite Sources",
            excerpt: "The exported file is a simple HTML page with supporting images and an external citation resource.",
            bullets: [
              "Simple HTML reading page",
              "Uses supporting images",
              "Includes an external citation help link",
              "Needs modern spacing and image treatment"
            ],
            callout: "This is the kind of page builders oversimplify when they should just render it cleanly."
          },
          resources: ["Original HTML page", "External citation help link"]
        }
      ]
    },
    {
      id: "m2-evidence-fingerprints",
      title: "2 Types of Evidence and Fingerprint Analysis",
      lessonCount: 22,
      lessons: [
        {
          id: "overview",
          title: "Types of Evidence and Fingerprint Analysis",
          type: "html-reading",
          sourceFile: "\u0441ontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html",
          htmlSample: actualHtmlSamples.evidenceOverview,
          learn: {
            heading: "Types of Evidence & Fingerprint Analysis",
            excerpt: "This is a text-rich lesson, not just a slide. The player needs to preserve the reading and make it easier to navigate.",
            bullets: [
              "Burden of proof",
              "Physical evidence matters",
              "Fingerprinting has long investigative value",
              "Text-rich lesson that should stay intact"
            ],
            callout: "This is exactly the kind of lesson AI builders butcher when they start summarizing."
          },
          resources: ["Original HTML reading", "Fingerprint analysis sequence"]
        },
        {
          id: "evidence-types",
          title: "Evidence Types",
          type: "html-reading",
          sourceFile: "\u0441ontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html",
          htmlSample: actualHtmlSamples.evidenceTypes,
          learn: {
            heading: "Identified Evidence and Individualized Evidence",
            excerpt: "The lesson lists examples such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibres, and explains why interpreting evidence matters.",
            bullets: [
              "Evidence categories",
              "Examples of physical evidence",
              "Interpretation matters",
              "Strong candidate for glossary support"
            ],
            callout: "This should become easier to compare, not shorter."
          },
          resources: ["Original HTML page", "Evidence sorting practice"]
        },
        {
          id: "assignment",
          title: "Types of Evidence and Fingerprint Analysis Assignment",
          type: "assignment",
          sourceFile: "assignment/i0073cf68-ef89-4190-b368-d429ee0816f0/assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml",
          assignmentMeta: { points: 20, submissionType: "file upload" },
          assignmentXml: {
            intro: "After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.",
            individualized: "Individualized Physical Evidence is unique and can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, dental impressions.",
            identified: "Identified Physical Evidence shares a common source and can be grouped into a class of items having similar properties. Examples: clothing, shoe prints, blood type.",
            task: "Complete the assignment, make your own copy of the linked document, add your name, and submit the file below.",
            reminder: "If you need a refresher on submissions, use the Course Information section."
          },
          resources: ["Assignment XML", "Submission workflow"]
        },
        {
          id: "assessment",
          title: "M2 Types of Evidence and Fingerprint Analysis Assessment",
          type: "quiz",
          sourceFile: "quiz/i0649d126-890d-4d3e-b83f-c563065521db/qti_c38fc56d-87c6-481d-958a-c13ba81b9304.xml",
          quizMeta: { attempts: 1, timeLimitMinutes: 120, profile: "Examination" },
          quizSample: {
            question: "Which of the following is an identified piece of physical evidence?",
            choices: ["Blood type", "Bullet casings", "Nuclear DNA", "Fingerprint impression"],
            answerIndex: 0
          },
          resources: ["QTI XML", "Assessment settings"]
        },
        {
          id: "slide",
          title: "Brief History of Fingerprinting",
          type: "image-slide",
          sourceFile: "\u0441ontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html",
          learn: {
            heading: "Brief History of Fingerprinting",
            excerpt: "This lesson appears in the fingerprint sequence and should flow into pattern types, matching logic, and case studies.",
            bullets: [
              "Belongs in fingerprint learning arc",
              "Would benefit from a timeline treatment",
              "Should connect to later case studies",
              "Media-first presentation"
            ],
            callout: "History content gets lost when builders flatten modules."
          },
          resources: ["Original source file", "Fingerprint sequence map"]
        },
        {
          id: "video",
          title: "Real Life CSI - Crime Scene Cleaners",
          type: "embedded-video",
          sourceFile: "\u0441ontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html",
          learn: {
            heading: "Real Life CSI - Crime Scene Cleaners",
            excerpt: "Video nodes should keep transcript links, surrounding lesson notes, and next-step navigation visible.",
            bullets: [
              "Responsive embed",
              "Keep video in shell",
              "Keep transcript and notes nearby",
              "Do not detach media from module flow"
            ],
            callout: "Video pages should not become awkward dead-end wrappers."
          },
          resources: ["Embedded media page", "Related lesson notes"]
        }
      ]
    }
  ]
};
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function flattenCourseNodes(nodes) {
  const results = [];
  for (const node of nodes || []) {
    if (node.resource?.hrefs?.length) {
      results.push(node);
    }
    if (node.children?.length) {
      results.push(...flattenCourseNodes(node.children));
    }
  }
  return results;
}
function mapKindToLessonType(kind, sourceFile, title) {
  const normalizedTitle = String(title || "");
  if (kind === "assignment" || sourceFile?.includes("/assignment/")) return "assignment";
  if (kind === "quiz" || sourceFile?.includes("/quiz/") || sourceFile?.includes("qti_")) return "quiz";
  if (kind === "pdf" || sourceFile?.toLowerCase().endsWith(".pdf")) return "pdf";
  if (/real life csi|documentary|video|youtube|vimeo/i.test(normalizedTitle)) return "embedded-video";
  if (/slide|photo|image|gallery/i.test(normalizedTitle)) return "image-slide";
  if (kind === "html" || sourceFile?.toLowerCase().endsWith(".html") || sourceFile?.toLowerCase().endsWith(".htm")) return "html-reading";
  return "html-reading";
}
function isHiddenLabel(value) {
  const label = String(value || "").toLowerCase();
  return label.includes("keep hidden") || label.includes("teacher resources") || label.includes("instructor only");
}
function buildCourseFromD2LMap(seed, d2lMap) {
  if (!d2lMap?.modules?.length) {
    return seed;
  }
  const shellActivities = (courseShellData?.modules || []).flatMap((module) => module.activities || []);
  const shellBySource = new Map(
    shellActivities.filter((activity) => activity?.sourceHref).map((activity) => [normalizePath(activity.sourceHref), activity])
  );
  const shellByTitle = new Map(shellActivities.map((activity) => [(activity?.title || "").trim().toLowerCase(), activity]));
  const seededLessons = seed.modules.flatMap((module) => module.lessons);
  const seededBySource = new Map(
    seededLessons.filter((lesson) => lesson.sourceFile).map((lesson) => [lesson.sourceFile, lesson])
  );
  const seededByTitle = new Map(
    seededLessons.map((lesson) => [lesson.title.trim().toLowerCase(), lesson])
  );
  const modules = (d2lMap.modules || []).map((moduleNode) => {
    const moduleHidden = isHiddenLabel(moduleNode.title);
    const leaves = flattenCourseNodes(moduleNode.children);
    const isCourseInfoModule = (moduleNode.title || "").trim().toLowerCase() === "course information";
    const courseInfoExcludedTitles = /* @__PURE__ */ new Set([
      "assignment submission",
      "enabling brightspace notifications"
    ]);
    const filteredLeaves = leaves.filter((node) => {
      if (!isCourseInfoModule) return true;
      const title = (node.title || "").trim().toLowerCase();
      return !courseInfoExcludedTitles.has(title);
    });
    const lessons = filteredLeaves.map((node, index) => {
      const sourceFile = node.resource?.hrefs?.[0] ?? "";
      const shellActivity = shellBySource.get(normalizePath(sourceFile)) ?? shellByTitle.get((node.title || "").trim().toLowerCase());
      const seeded = seededBySource.get(sourceFile) ?? seededByTitle.get((node.title || "").trim().toLowerCase());
      const type = mapKindToLessonType(node.kind, sourceFile, node.title);
      const id = slugify(node.id || `${moduleNode.id}-${index}-${node.title}`);
      const lessonHidden = moduleHidden || isHiddenLabel(node.title);
      const contentPreview = shellActivity?.contentPreview && String(shellActivity.contentPreview).trim() || seeded?.contentPreview && String(seeded.contentPreview).trim() || "";
      if (seeded) {
        return {
          ...seeded,
          id,
          title: node.title || seeded.title,
          type: seeded.type || type,
          sourceFile: sourceFile || seeded.sourceFile,
          resources: seeded.resources?.length ? seeded.resources : sourceFile ? [sourceFile] : [],
          contentPreview,
          isHidden: lessonHidden
        };
      }
      return {
        id,
        title: node.title || `Lesson ${index + 1}`,
        type,
        sourceFile: sourceFile || `manifest:${node.id}`,
        resources: sourceFile ? [sourceFile] : [],
        description: shellActivity?.description || "Course content item",
        contentPreview,
        isHidden: lessonHidden,
        learn: {
          heading: node.title || `Lesson ${index + 1}`,
          excerpt: "Mapped from the D2L manifest hierarchy. This node is included in the shell so navigation follows the real course sequence.",
          bullets: [
            "Manifest-derived lesson title",
            "Source path preserved for traceability",
            "Supports richer renderer mappings when available"
          ],
          callout: "This lesson is mapped from the course manifest with normalized module and lesson labels."
        }
      };
    });
    return {
      id: slugify(moduleNode.id || moduleNode.title || "module"),
      title: moduleNode.title,
      lessonCount: lessons.length,
      isHidden: moduleHidden,
      lessons
    };
  }).filter((module) => module.lessons.length > 0);
  if (!modules.length) {
    return seed;
  }
  return {
    title: "Forensic Studies 35",
    subtitle: `Course content (${d2lMap.courseTitle})`,
    stats: {
      topLevelSections: d2lMap.summary?.moduleCount ?? modules.length,
      totalNodes: d2lMap.summary?.itemCount ?? modules.reduce((sum, module) => sum + module.lessons.length, 0)
    },
    modules
  };
}
const course = buildCourseFromD2LMap(courseSeed, d2lCourseMapData);
const resolvedCourse = course ?? courseSeed;
const resolvedModules = resolvedCourse.modules?.length ? resolvedCourse.modules : courseSeed.modules;
const flatLessons = resolvedModules.flatMap(
  (module) => module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleLessonCount: module.lessonCount
  }))
);
function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/").replace(/^content\//i, "content/");
}
const CYRILLIC_CONTENT_ROOT = "\u0441ontent";
const MOJIBAKE_CONTENT_ROOT = "\xD1\x81ontent";
function buildReferencePathVariants(pathValue) {
  const normalized = normalizePath(pathValue);
  if (!normalized) return [];
  const variants = /* @__PURE__ */ new Set([normalized]);
  const slashIndex = normalized.indexOf("/");
  const root = slashIndex === -1 ? normalized : normalized.slice(0, slashIndex);
  const remainder = slashIndex === -1 ? "" : normalized.slice(slashIndex);
  if (root.toLowerCase() === "content" || root === CYRILLIC_CONTENT_ROOT || root === MOJIBAKE_CONTENT_ROOT) {
    variants.add(`content${remainder}`);
    variants.add(`${CYRILLIC_CONTENT_ROOT}${remainder}`);
    variants.add(`${MOJIBAKE_CONTENT_ROOT}${remainder}`);
  }
  return [...variants];
}
function stripQueryAndHash(pathValue) {
  return String(pathValue || "").split("#")[0].split("?")[0];
}
function decodePathValue(pathValue) {
  const stripped = stripQueryAndHash(pathValue);
  let decoded = stripped;
  try {
    decoded = decodeURIComponent(stripped);
  } catch {
    decoded = stripped;
  }
  return decoded.replace(/\\\\/g, "/").split("/").map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }).join("/");
}
function joinPath(base, next) {
  if (!base) return normalizePath(next);
  if (!next) return normalizePath(base);
  return normalizePath(`${base.replace(/\/+$/, "")}/${next.replace(/^\/+/, "")}`);
}
function dirname(path) {
  const normalized = normalizePath(path);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}
function resolveRelativePath(baseFile, relativeValue) {
  if (!relativeValue) return relativeValue;
  if (/^(https?:|data:|#|mailto:|tel:)/i.test(relativeValue)) return relativeValue;
  const decodedRelative = decodePathValue(relativeValue);
  if (decodedRelative.startsWith("/")) return decodedRelative;
  const baseDir = dirname(baseFile);
  const combined = joinPath(baseDir, decodedRelative);
  const parts = [];
  for (const part of combined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}
function encodePath(path) {
  return normalizePath(path).split("/").map((part) => encodeURIComponent(part)).join("/");
}
function buildReferenceUrl(relativePath) {
  return `/preview/references/raw/forensics35/${encodePath(relativePath)}`;
}
function buildWorkspaceAssetUrl(relativePath) {
  return `/preview/workspace/forensics35/${encodePath(relativePath)}`;
}
const module4RemoteImageFallbacks = {
  "https://lh4.googleusercontent.com/mwvzxUf61aqdm9oG9VyiGdKou-VQ2yHvqtFDv6rJT9lgiNDEOhwvS2rHpeSWwBtmKhimbxnLOPTOjHx7_JBnMDMJBFuozH4mS0chn5BF4uQMRbkyn4j1DGPaWhCdK4DJghQ6TBo-eZKgBPjbBQ": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg",
  "https://lh6.googleusercontent.com/pM26gAa_Xhvbfdoj1ema-YP6WFlsgY2Ucg_CByG1J7coyB-aJXwZD3eu0cS6tGg30N1LVPr-B-Np9xmD3_WYZfNMn7xO-VyfIbdUNsGv8dCDR81Upd7nRCc-YGYmtUfKHHHzpyS2H0cBD_pwOA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/Red Blood Cells.PNG",
  "https://lh3.googleusercontent.com/gj7N2Oif-4X2zfjkub58PbgAWt3XKxxCk-GF_PI9pnLmzig9Sm-eZDKfWtM_CLkbEesr_3iWfQ3qJg1c1REQKy3BkrxOSC0BLI60QrltkcCrT-HwPZUZRQ8ZlsTID5FaxZA3X7SOLscM14fouA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/White Blood Cells.PNG",
  "https://lh6.googleusercontent.com/A0XYWVnt-KsIFRtn-iJ2fyit8XQWxuznFqmFZe0i3FL17baTAZI6OvGjbKvJoYjGB4K0tlWQpY5ERY0LTOSqip1J3luRdNyzy983phkU37RgGpp7vUfqXKBUqtDQOJLohFxZJZwzURYrNLjKLw": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg"
};
const MODULE4_TAMMY_PARROT_COMIC_PATH = "assets/module4/tammy-parrot-comic.png";
const MODULE4_BLOOD_SPILL_PATH = "assets/module4/blood-spill.jpg";
function stripScriptsAndRewriteLinks(html, sourceFile, exportRoot) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const normalizedSource = normalizePath(sourceFile || "");
  const normalizedSourceNoQuery = normalizedSource.split("?")[0].split("#")[0];
  const normalizedSourceLower = normalizedSourceNoQuery.toLowerCase();
  doc.querySelectorAll("script, style, link[rel='stylesheet']").forEach((el) => el.remove());
  doc.querySelectorAll("meta, title, head").forEach((el) => el.remove());
  doc.querySelectorAll("[aria-hidden='true'], .sr-only, .visually-hidden").forEach((el) => el.remove());
  const remapRootPath = (value) => {
    const normalized = decodePathValue(String(value || ""));
    if (!normalized.startsWith("/")) return "";
    const trimmed = normalized.slice(1);
    if (/^(content|assignment|quiz|сontent)\//i.test(trimmed)) {
      return exportRoot ? joinPath(exportRoot, trimmed) : trimmed;
    }
    return "";
  };
  if (normalizedSourceLower.endsWith("chapter_12006.html") || normalizedSourceLower.includes("chapter_12006")) {
    const paragraphs = Array.from(doc.body.querySelectorAll("p")).filter((p) => (p.textContent || "").trim());
    const insertAfter = paragraphs.length ? paragraphs[paragraphs.length - 1] : doc.body.lastElementChild;
    if (insertAfter) {
      const wrapper = doc.createElement("div");
      const img = doc.createElement("img");
      img.setAttribute("src", buildWorkspaceAssetUrl(MODULE4_TAMMY_PARROT_COMIC_PATH));
      img.setAttribute("alt", "Tammy's Parrot case summary");
      img.setAttribute("style", "max-width:100%;display:block;margin:16px auto;");
      wrapper.appendChild(img);
      insertAfter.parentNode?.insertBefore(wrapper, insertAfter.nextSibling);
    }
  }
  const rewriteAttr = (selector, attr) => {
    doc.querySelectorAll(selector).forEach((el) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      if (attr === "src" && /^https?:/i.test(value)) {
        const fallbackPath = module4RemoteImageFallbacks[value];
        if (fallbackPath) {
          const withRoot2 = exportRoot ? joinPath(exportRoot, fallbackPath) : fallbackPath;
          el.setAttribute(attr, buildReferenceUrl(withRoot2));
          return;
        }
      }
      if (attr === "src" && (normalizedSourceLower.endsWith("historical crime case 2.html") || normalizedSourceLower.includes("historical%20crime%20case%202.html") || normalizedSourceLower.includes("historicalcrimecase2") || normalizedSourceLower.includes("historical%20crime%20case%202"))) {
        const normalizedValue = decodePathValue(value);
        if (normalizedValue.toLowerCase().includes("hallway.png")) {
          el.setAttribute(attr, buildWorkspaceAssetUrl(MODULE4_BLOOD_SPILL_PATH));
          return;
        }
      }
      if (/^(https?:|data:|#|mailto:|tel:)/i.test(value)) return;
      const decodedValue = decodePathValue(value);
      const remappedRoot = remapRootPath(decodedValue);
      if (remappedRoot) {
        el.setAttribute(attr, buildReferenceUrl(remappedRoot));
        return;
      }
      const resolved = resolveRelativePath(sourceFile, decodedValue);
      if (!resolved || resolved.startsWith("/")) return;
      const withRoot = exportRoot ? joinPath(exportRoot, resolved) : resolved;
      el.setAttribute(attr, buildReferenceUrl(withRoot));
    });
  };
  rewriteAttr("img[src]", "src");
  rewriteAttr("a[href]", "href");
  rewriteAttr("source[src]", "src");
  rewriteAttr("iframe[src]", "src");
  rewriteAttr("video[src]", "src");
  rewriteAttr("object[data]", "data");
  doc.querySelectorAll("p").forEach((paragraph) => {
    const text = paragraph.textContent?.replace(/\u00a0/g, " ").trim() || "";
    if (!text && !paragraph.querySelector("img, a, iframe, video")) {
      paragraph.remove();
    }
  });
  doc.querySelectorAll("footer").forEach((footer) => {
    const text = footer.textContent?.replace(/\u00a0/g, " ").trim() || "";
    if (!text && !footer.querySelector("img, a")) {
      footer.remove();
    }
  });
  return doc.body.innerHTML || html;
}
function hasMeaningfulHtmlContent(html) {
  if (!html) return false;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const text = (doc.body.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const mediaLike = doc.querySelectorAll("img, table, iframe, video, object, ul li, ol li").length;
  return text.length >= 40 || mediaLike > 0;
}
function normalizeEmbedUrl(urlValue) {
  const trimmed = String(urlValue || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^http:/i.test(trimmed)) return `https${trimmed.slice(4)}`;
  return trimmed;
}
function parseEmbeddedVideoFromSource(htmlText, sourceFile, exportRoot) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const rawIframe = doc.querySelector("iframe[src]")?.getAttribute("src");
  const rawVideo = doc.querySelector("video source[src]")?.getAttribute("src");
  const rawDirectVideo = doc.querySelector("video[src]")?.getAttribute("src");
  const rawSource = rawIframe || rawVideo || rawDirectVideo || "";
  if (!rawSource) {
    return null;
  }
  if (/^\s*javascript:/i.test(rawSource) || /^\s*data:/i.test(rawSource)) {
    return null;
  }
  const normalizedSource = normalizeEmbedUrl(rawSource);
  const isRemote = /^(https?:)?\/\//i.test(normalizedSource);
  if (isRemote) {
    return {
      embedUrl: normalizedSource,
      rawSource
    };
  }
  const resolvedSource = resolveRelativePath(sourceFile, rawSource);
  const withRoot = exportRoot ? joinPath(exportRoot, resolvedSource) : resolvedSource;
  return {
    embedUrl: buildReferenceUrl(withRoot),
    rawSource: withRoot
  };
}
function splitHtmlIntoSections(html) {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild || doc.body;
  const nodes = Array.from(root.childNodes || []);
  const sections = [];
  let current = null;
  let untitledIndex = 1;
  const pushCurrent = () => {
    if (!current) return;
    const content = current.parts.join("").trim();
    if (!content) return;
    sections.push({
      id: `section-${sections.length + 1}`,
      title: current.title,
      html: content
    });
  };
  for (const node of nodes) {
    const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : "";
    const outer = node.nodeType === 1 ? node.outerHTML : node.textContent?.trim() ? `<p>${node.textContent}</p>` : "";
    if (!outer) continue;
    if (/^h[1-3]$/.test(tag)) {
      pushCurrent();
      const headingText = node.textContent?.trim() || `Section ${untitledIndex++}`;
      current = { title: headingText, parts: [outer] };
      continue;
    }
    if (!current) {
      current = { title: `Section ${untitledIndex++}`, parts: [] };
    }
    current.parts.push(outer);
  }
  pushCurrent();
  return sections;
}
function decodeHtmlEntities(value) {
  if (!value) return "";
  const node = document.createElement("textarea");
  node.innerHTML = value;
  return node.value;
}
function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildReadingFallbackHtml(lesson) {
  if (lesson?.htmlSample) return lesson.htmlSample;
  const previewText = String(lesson?.contentPreview || lesson?.description || "").trim();
  if (!previewText) return "";
  const paragraphs = previewText.split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  return `<div class="space-y-4">${paragraphs}</div>`;
}
function getElementsByLocalName(root, localName) {
  return Array.from(root.getElementsByTagName("*")).filter((el) => el.localName === localName);
}
function normalizeAssignmentHtml(html, sourceFile, exportRoot) {
  if (!html) return "";
  return stripScriptsAndRewriteLinks(`<div>${html}</div>`, sourceFile, exportRoot).replace(/^<div>/i, "").replace(/<\/div>\s*$/i, "");
}
const ASSIGNMENT_SUBMISSION_PHRASE = "When you have completed the assignment, upload your generated reports to your respective online classroom";
function dedupeAssignmentSubmissionLine(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  let seen = false;
  doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, div, span, li").forEach((el) => {
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (text !== ASSIGNMENT_SUBMISSION_PHRASE) return;
    if (seen) {
      el.remove();
      return;
    }
    seen = true;
  });
  doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, span, li").forEach((el) => {
    const text = (el.textContent || "").replace(/\u00a0/g, " ").trim();
    if (!text && !el.querySelector("img, a, iframe, video, source, object")) {
      el.remove();
    }
  });
  return doc.body.innerHTML.replace(/^<div>/i, "").replace(/<\/div>\s*$/i, "");
}
function parseAssignmentXml(xmlText, sourceFile, exportRoot) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const title = getElementsByLocalName(xml, "title")[0]?.textContent?.trim() || "Assignment";
  const textNode = getElementsByLocalName(xml, "instructor_text")[0];
  const rawHtml = decodeHtmlEntities(textNode?.textContent || "");
  const textHtml = dedupeAssignmentSubmissionLine(normalizeAssignmentHtml(rawHtml, sourceFile, exportRoot));
  const pointsRaw = getElementsByLocalName(xml, "gradable")[0]?.getAttribute("points_possible");
  const formatNodes = getElementsByLocalName(xml, "format");
  const textOnly = textHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentenceChunks = textOnly.split(/(?<=[.!?])\s+/).map((chunk) => chunk.trim()).filter(Boolean);
  const taskSentence = sentenceChunks.find((chunk) => /\b(complete|submit|upload|click|make a copy)\b/i.test(chunk)) || sentenceChunks[0] || "";
  const reminderSentence = sentenceChunks.find((chunk) => /\b(refresher|remember|if you need)\b/i.test(chunk)) || sentenceChunks[sentenceChunks.length - 1] || "";
  const links = [];
  const linkDoc = new DOMParser().parseFromString(`<div>${textHtml}</div>`, "text/html");
  linkDoc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const label = (anchor.textContent || "").trim() || href;
    if (!href) return;
    links.push({ href, label });
  });
  return {
    title,
    assignmentMeta: {
      points: Number(pointsRaw || 0) || 0,
      submissionType: formatNodes[0]?.getAttribute("type") || "submission",
      submissionFormats: formatNodes.map((node) => node.getAttribute("type") || "").filter(Boolean)
    },
    assignmentXml: {
      intro: textHtml,
      task: taskSentence,
      reminder: reminderSentence,
      links
    }
  };
}
function parseQuizXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const items = getElementsByLocalName(xml, "item");
  if (!items.length) return null;
  const questions = items.map((item, itemIndex) => {
    const matTexts = getElementsByLocalName(item, "mattext").map((el) => decodeHtmlEntities(el.textContent || ""));
    const question = matTexts[0] || `Quiz question ${itemIndex + 1}`;
    const choiceNodes = getElementsByLocalName(item, "response_label");
    const choices = choiceNodes.map((node) => {
      const text = getElementsByLocalName(node, "mattext")[0]?.textContent || "";
      return decodeHtmlEntities(text).replace(/<[^>]+>/g, "").trim();
    });
    const correctId = getElementsByLocalName(item, "respcondition").find((node) => getElementsByLocalName(node, "setvar").length > 0)?.getElementsByTagName("varequal")[0]?.textContent?.trim();
    const choiceIds = choiceNodes.map((node) => node.getAttribute("ident"));
    const answerIndex = correctId ? Math.max(0, choiceIds.indexOf(correctId)) : 0;
    return {
      id: item.getAttribute("ident") || `item-${itemIndex + 1}`,
      question: question.replace(/<[^>]+>/g, "").trim(),
      choices: choices.filter(Boolean),
      answerIndex
    };
  }).filter((question) => question.question && question.choices.length > 0);
  if (!questions.length) return null;
  const metadataFields = getElementsByLocalName(xml, "qtimetadatafield");
  const readMeta = (label) => {
    const field = metadataFields.find(
      (node) => getElementsByLocalName(node, "fieldlabel")[0]?.textContent?.trim() === label
    );
    return getElementsByLocalName(field || xml, "fieldentry")[0]?.textContent?.trim();
  };
  return {
    quizMeta: {
      profile: readMeta("qmd_assessmenttype") || "Assessment",
      attempts: Number(readMeta("cc_maxattempts") || 1),
      timeLimitMinutes: Number(readMeta("qmd_timelimit") || 0),
      questionCount: questions.length
    },
    quizSample: questions[0],
    quizQuestions: questions
  };
}
const FORENSIC_THEME = {
  panel: "rounded-xl border border-[#353331] bg-[#1c1d1f] shadow-[0_12px_28px_rgba(0,0,0,0.3)]",
  panelSoft: "rounded-xl border border-[#2e2b29] bg-[#151617] shadow-[0_10px_22px_rgba(0,0,0,0.24)]",
  buttonPrimary: "rounded-lg border border-[#b07a58]/70 bg-[#8a5a3c] px-4 py-2.5 text-sm font-semibold text-[#f3f1eb] transition duration-200 hover:border-[#c28c69] hover:bg-[#9b6948]",
  buttonSecondary: "rounded-lg border border-[#403c38] bg-[#23211f] px-4 py-2.5 text-sm font-semibold text-[#d1cac0] transition duration-200 hover:border-[#57514b] hover:bg-[#2b2926] hover:text-[#f3f1eb]",
  overline: "text-[11px] font-semibold tracking-[0.08em] text-[#8c857b]"
};
const MODULE1_ASSIGNMENT_EMBED_PATH = "./assets/module1assignment.html";
const MODULE2_ASSIGNMENT_EMBED_PATH = "./assets/module2assignment.html";
const MODULE3_ASSIGNMENT_EMBED_PATH = "./assets/module3assignment.html";
const MODULE4_ASSIGNMENT_EMBED_PATH = "./assets/module4assignment.html";
const MODULE5_ASSIGNMENT_EMBED_PATH = "./assets/module5assignment.html";
const MODULE6_ASSIGNMENT_EMBED_PATH = "./assets/module6assignment.html";
const MODULE7_ASSIGNMENT_EMBED_PATH = "./assets/module7assignment.html";
const MODULE8_ASSIGNMENT_EMBED_PATH = "./assets/module8assignment.html?rev=20260318-5";
const FORENSICS_WORKSPACE_STATE_KEY = "forensics35::workspace-state::v1";
function normalizeSidebarLibraryView(value) {
  if (value === "quizzes" || value === "assignments") return value;
  return "modules";
}
function isQuizLesson(lesson) {
  return lesson?.type === "quiz";
}
function isAssignmentOnlyLesson(lesson) {
  return lesson?.type === "assignment" || lesson?.type === "lab-assignment";
}
function bucketStateKey(moduleId, bucket) {
  return `${moduleId}::${bucket}`;
}
function buildSyntheticLessonsForModule(module) {
  const moduleTitleLower = (module?.title || "").toLowerCase();
  const syntheticLessons = [];
  if (moduleTitleLower.includes("types of evidence and fingerprint analysis")) {
    syntheticLessons.push({
      id: "module2-fingerprint-analysis-description",
      title: "Fingerprint Analysis Lab Assignment",
      type: "assignment"
    });
    syntheticLessons.push({
      id: "module2-fingerprint-analysis-lab",
      title: "Fingerprint Analysis Interactive Assignment",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("introduction to crime scenes")) {
    syntheticLessons.push({
      id: "module1-crime-scene-lab",
      title: "Crime Scene Certification Lab",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("trace evidence")) {
    syntheticLessons.push({
      id: "module3-trace-evidence-lab",
      title: "Trace Evidence Lab Assignment",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("body fluid evidence")) {
    syntheticLessons.push({
      id: "module4-body-fluid-analysis-lab",
      title: "Body Fluid Analysis Lab Assignment",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("forensic detection of impaired driving")) {
    syntheticLessons.push({
      id: "module5-impaired-driving-lab",
      title: "Impaired Driving Assignment Lab",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("polygraphing and document analysis")) {
    syntheticLessons.push({
      id: "module6-polygraph-document-lab",
      title: "Polygraph and Document Analysis Lab",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("forensic genetics")) {
    syntheticLessons.push({
      id: "module7-forensic-genetics-lab",
      title: "Forensic Genetics Lab Assignment",
      type: "lab-assignment"
    });
  }
  if (moduleTitleLower.includes("careers in forensic science")) {
    syntheticLessons.push({
      id: "module8-career-path-simulation",
      title: "Career Path Simulation Lab",
      type: "lab-assignment"
    });
  }
  return syntheticLessons;
}
function readForensicsWorkspaceState() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(FORENSICS_WORKSPACE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
function writeForensicsWorkspaceState(state) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(FORENSICS_WORKSPACE_STATE_KEY, JSON.stringify(state));
  } catch {
  }
}
function buildPersistFieldKey(element, fallbackIndex) {
  const explicitKey = element.getAttribute("data-persist-key") || element.getAttribute("name") || element.getAttribute("id") || element.getAttribute("data-testid");
  if (explicitKey) {
    return `${element.tagName.toLowerCase()}:${explicitKey}`;
  }
  return `${element.tagName.toLowerCase()}:index-${fallbackIndex}`;
}
function captureIframeFormState(iframeNode) {
  try {
    const doc = iframeNode?.contentDocument;
    if (!doc) return null;
    const fields = {};
    const elements = Array.from(doc.querySelectorAll("input, textarea, select"));
    elements.forEach((element, index) => {
      const key = buildPersistFieldKey(element, index);
      const tag = element.tagName.toLowerCase();
      if (tag === "input") {
        const inputType = String(element.type || "text").toLowerCase();
        if (inputType === "checkbox" || inputType === "radio") {
          fields[key] = { type: "checked", value: !!element.checked };
        } else {
          fields[key] = { type: "value", value: String(element.value ?? "") };
        }
        return;
      }
      fields[key] = { type: "value", value: String(element.value ?? "") };
    });
    return {
      schemaVersion: 1,
      fields,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return null;
  }
}
function applyIframeFormState(iframeNode, draft) {
  if (!draft || typeof draft !== "object" || !draft.fields || typeof draft.fields !== "object") {
    return;
  }
  try {
    const doc = iframeNode?.contentDocument;
    if (!doc) return;
    const elements = Array.from(doc.querySelectorAll("input, textarea, select"));
    elements.forEach((element, index) => {
      const key = buildPersistFieldKey(element, index);
      const fieldState = draft.fields[key];
      if (!fieldState || typeof fieldState !== "object") return;
      if (fieldState.type === "checked") {
        element.checked = !!fieldState.value;
      } else {
        element.value = String(fieldState.value ?? "");
      }
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  } catch {
  }
}
function Badge({ children, className = "", ...props }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      ...props,
      className: `rounded-md border border-[#403c38] bg-[#23211f] px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#b8b2a8] ${className}`.trim(),
      children
    }
  );
}
function typeLabel(type) {
  const map = {
    assignment: "ASSIGNMENT",
    "lab-assignment": "ASSIGNMENT",
    quiz: "QUIZ",
    pdf: "PDF",
    "embedded-video": "VIDEO",
    "image-slide": "SLIDE",
    "html-reading": "READING"
  };
  return map[type] || "RESOURCE";
}
function typeIcon(type) {
  const map = {
    assignment: ClipboardCheck,
    "lab-assignment": ClipboardCheck,
    quiz: FileQuestion,
    pdf: FileBadge,
    "embedded-video": PlayCircle,
    "image-slide": FileImage,
    "html-reading": FileText
  };
  return map[type] || FileText;
}
function formatLessonTitleForDisplay(lesson) {
  const rawTitle = String(lesson?.title || "").trim();
  if (!rawTitle) return rawTitle;
  const moduleAssessmentMatch = rawTitle.match(/^M\s*(\d+)\s+(.+?)\s+Assessment$/i);
  if (moduleAssessmentMatch) {
    const moduleNumber = moduleAssessmentMatch[1];
    const topic = moduleAssessmentMatch[2].trim();
    return `Module ${moduleNumber} Assessment: ${topic}`;
  }
  return rawTitle;
}
function formatModuleTitleForDisplay(title) {
  const rawTitle = String(title || "").trim();
  if (!rawTitle) return rawTitle;
  const numberedModuleMatch = rawTitle.match(/^(\d+)\s+(.+)$/);
  if (numberedModuleMatch) {
    const moduleNumber = numberedModuleMatch[1];
    const moduleName = numberedModuleMatch[2].trim();
    return `Module ${moduleNumber}: ${moduleName}`;
  }
  return rawTitle;
}
function SidebarItem({ active, completed, lesson, onClick }) {
  const Icon = typeIcon(lesson.type);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${active ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#f3f4f6] shadow-[0_10px_24px_rgba(185,28,28,0.2)]" : "border-transparent bg-transparent text-[#a1a8b3] hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-[#f3f4f6]"}`,
      "data-testid": "lesson-item",
      "data-lesson-title": lesson.title,
      "data-lesson-type": lesson.type,
      "data-lesson-hidden": lesson.isHidden ? "true" : "false",
      "data-active": active ? "true" : "false",
      children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 shrink-0", children: completed ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-[#dc2626]" }) : /* @__PURE__ */ jsx(Circle, { className: "h-4 w-4 text-white/30" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-white/45" }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: lesson.title })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7280]", children: typeLabel(lesson.type) })
        ] })
      ]
    }
  );
}
function HtmlRenderer({ html }) {
  const sections = useMemo(() => splitHtmlIntoSections(html), [html]);
  const [sectionMode, setSectionMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  useEffect(() => {
    setSectionMode(false);
    setCollapsedSections({});
  }, [html]);
  const collapseAll = () => {
    setCollapsedSections(Object.fromEntries(sections.map((section) => [section.id, true])));
  };
  const expandAll = () => {
    setCollapsedSections({});
  };
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-html", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap justify-end gap-2", children: sections.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSectionMode((prev) => !prev),
          className: FORENSIC_THEME.buttonSecondary,
          "data-testid": "section-mode-toggle",
          children: sectionMode ? "Single flow" : "Section mode"
        }
      ),
      sectionMode && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: expandAll,
            className: FORENSIC_THEME.buttonSecondary,
            "data-testid": "section-expand-all",
            children: "Expand all"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: collapseAll,
            className: FORENSIC_THEME.buttonSecondary,
            "data-testid": "section-collapse-all",
            children: "Collapse all"
          }
        )
      ] })
    ] }) }),
    sectionMode && sections.length > 1 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sections.map((section) => {
      const collapsed = !!collapsedSections[section.id];
      return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/[0.1] bg-white/[0.02]", "data-testid": "section-container", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setCollapsedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] })),
            className: "flex w-full items-center justify-between px-4 py-3 text-left transition duration-200 hover:bg-white/[0.03]",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[#f3f4f6]", children: section.title }),
              /* @__PURE__ */ jsx("span", { className: FORENSIC_THEME.overline, children: collapsed ? "Expand" : "Collapse" })
            ]
          }
        ),
        !collapsed && /* @__PURE__ */ jsx(
          "div",
          {
            className: "max-w-none border-t border-white/[0.08] px-4 py-4 text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",
            dangerouslySetInnerHTML: { __html: section.html }
          }
        )
      ] }, section.id);
    }) }) : /* @__PURE__ */ jsx(
      "div",
      {
        className: "max-w-none text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",
        dangerouslySetInnerHTML: { __html: html }
      }
    )
  ] });
}
function PdfRenderer({ meta, title, sourceUrl }) {
  const pages = meta?.pages || 1;
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-pdf", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Course PDF" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { children: meta?.size || "PDF" }),
        /* @__PURE__ */ jsxs(Badge, { children: [
          pages,
          " pages"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-[180px_1fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panelSoft} p-3`, children: [
        /* @__PURE__ */ jsx("div", { className: `mb-3 ${FORENSIC_THEME.overline}`, children: "Pages" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: Math.min(pages, 6) }).map((_, i) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `rounded-xl border px-3 py-2 text-sm ${i === 0 ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.1] bg-white/[0.02] text-[#a1a8b3]"}`,
            children: [
              "Page ",
              i + 1
            ]
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panelSoft} p-4`, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between text-sm text-[#a1a8b3]", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Page 1 of ",
            pages
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { className: FORENSIC_THEME.buttonSecondary, children: "Fit" }),
            /* @__PURE__ */ jsx("button", { className: FORENSIC_THEME.buttonSecondary, children: "\u2212" }),
            /* @__PURE__ */ jsx("button", { className: FORENSIC_THEME.buttonSecondary, children: "+" })
          ] })
        ] }),
        sourceUrl ? /* @__PURE__ */ jsx(
          "iframe",
          {
            src: sourceUrl,
            title,
            className: "mx-auto min-h-[520px] w-full max-w-[760px] rounded-xl border border-white/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "mx-auto flex min-h-[520px] max-w-[760px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.02] p-8 text-center text-sm leading-7 text-[#a1a8b3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", children: "PDF page canvas would render here with real pagination, zoom, and outline support." })
      ] })
    ] })
  ] });
}
function SlideRenderer({ title }) {
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-slide", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Evidence media" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { children: "responsive media" }),
        /* @__PURE__ */ jsx(Badge, { children: "zoom ready" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950/95", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-[460px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.18),_transparent_36%),linear-gradient(180deg,_#141821,_#090a0d)] p-10 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15", children: /* @__PURE__ */ jsx(FileImage, { className: "h-7 w-7 text-[#fecaca]" }) }),
      /* @__PURE__ */ jsx("h4", { className: "text-2xl font-semibold text-[#f3f4f6]", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-7 text-[#cbd5e1]", children: "Original exported slide/image asset would render here with preserved visuals, zoom support, and optional caption treatment." })
    ] }) }) })
  ] });
}
function AssignmentRenderer({ data, meta, title }) {
  const introHtml = data?.intro || "";
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(Badge, { children: [
          meta?.points || 0,
          " pts"
        ] }),
        /* @__PURE__ */ jsx(Badge, { children: meta?.submissionType || "submission" }),
        meta?.submissionFormats?.length > 1 && /* @__PURE__ */ jsxs(Badge, { children: [
          meta.submissionFormats.length,
          " formats"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm leading-7 text-[#cbd5e1]", children: [
      introHtml ? /* @__PURE__ */ jsx(
        "div",
        {
          className: "max-w-none [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3",
          dangerouslySetInnerHTML: { __html: introHtml }
        }
      ) : /* @__PURE__ */ jsx("p", { children: "No assignment instructions are available yet." }),
      (data?.individualized || data?.identified) && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/[0.12] bg-[#112015] p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86efac]", children: "Individualized evidence" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-[#dcfce7]", children: data?.individualized || "Not specified." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/[0.12] bg-[#111d2a] p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#93c5fd]", children: "Identified evidence" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-[#dbeafe]", children: data?.identified || "Not specified." })
        ] })
      ] })
    ] })
  ] });
}
function EmbeddedAssignmentRenderer({ title, srcPath, introHtml = "", lessonId, draft, onDraftChange }) {
  const frameRef = useRef(null);
  const cleanupRef = useRef(() => {
  });
  const draftRef = useRef(draft);
  const [mobileScale, setMobileScale] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 0.8 : 1
  );
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const persistFormState = useCallback(() => {
    if (!lessonId || typeof onDraftChange !== "function") return;
    const nextDraft = captureIframeFormState(frameRef.current);
    if (!nextDraft) return;
    onDraftChange(lessonId, nextDraft);
  }, [lessonId, onDraftChange]);
  const handleFrameLoad = useCallback(() => {
    const iframeNode = frameRef.current;
    if (!iframeNode) return;
    cleanupRef.current();
    applyIframeFormState(iframeNode, draftRef.current);
    const doc = iframeNode.contentDocument;
    if (!doc) return;
    const onFieldChange = () => {
      persistFormState();
    };
    doc.addEventListener("input", onFieldChange, true);
    doc.addEventListener("change", onFieldChange, true);
    cleanupRef.current = () => {
      doc.removeEventListener("input", onFieldChange, true);
      doc.removeEventListener("change", onFieldChange, true);
    };
  }, [persistFormState]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 640px)");
    const applyScale = () => setMobileScale(query.matches ? 0.8 : 1);
    applyScale();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", applyScale);
      return () => query.removeEventListener("change", applyScale);
    }
    query.addListener(applyScale);
    return () => query.removeListener(applyScale);
  }, []);
  useEffect(() => {
    return () => {
      cleanupRef.current();
      persistFormState();
    };
  }, [persistFormState]);
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ jsx(Badge, { children: "interactive lab" })
    ] }),
    introHtml ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "mb-5 max-w-none text-sm leading-7 text-[#cbd5e1] [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3 [&_strong]:text-[#f3f4f6]",
        dangerouslySetInnerHTML: { __html: introHtml }
      }
    ) : null,
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/[0.12] bg-[#0f172a]", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        ref: frameRef,
        src: srcPath,
        title,
        onLoad: handleFrameLoad,
        className: "h-[1600px] min-h-[1600px] w-full md:h-[1800px] md:min-h-[1800px] xl:h-[2000px] xl:min-h-[2000px]",
        style: mobileScale < 1 ? { zoom: mobileScale, width: `${100 / mobileScale}%` } : void 0
      }
    ) })
  ] });
}
function QuizRenderer({ quiz, questions, meta, lessonId, quizDraft, onQuizDraftChange }) {
  const parsedQuestions = questions?.length ? questions : quiz ? [quiz] : [];
  const [questionIndex, setQuestionIndex] = useState(
    () => Number.isInteger(quizDraft?.questionIndex) ? quizDraft.questionIndex : 0
  );
  const [answersByQuestion, setAnswersByQuestion] = useState(
    () => quizDraft?.answersByQuestion && typeof quizDraft.answersByQuestion === "object" ? quizDraft.answersByQuestion : {}
  );
  const [feedbackByQuestion, setFeedbackByQuestion] = useState(
    () => quizDraft?.feedbackByQuestion && typeof quizDraft.feedbackByQuestion === "object" ? quizDraft.feedbackByQuestion : {}
  );
  const activeQuestion = parsedQuestions[questionIndex] || parsedQuestions[0];
  const activeQuestionId = activeQuestion?.id || `question-${questionIndex}`;
  const currentSelected = answersByQuestion[activeQuestionId];
  const showFeedback = !!feedbackByQuestion[activeQuestionId];
  const correct = currentSelected === activeQuestion?.answerIndex;
  const answeredCount = parsedQuestions.filter((question) => answersByQuestion[question.id] !== void 0).length;
  const correctCount = parsedQuestions.filter((question) => answersByQuestion[question.id] === question.answerIndex).length;
  const questionSignature = parsedQuestions.map((question) => question.id).join("|");
  const resetQuizAttempt = () => {
    setQuestionIndex(0);
    setAnswersByQuestion({});
    setFeedbackByQuestion({});
  };
  const generateQuizReport = () => {
    const safe = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    const rows = parsedQuestions.map((question, idx) => {
      const selectedIndex = answersByQuestion[question.id];
      const selectedLabel = selectedIndex === void 0 ? "Not answered" : question.choices?.[selectedIndex] || "Not answered";
      const result = selectedIndex === void 0 ? "Pending" : selectedIndex === question.answerIndex ? "Correct" : "Incorrect";
      return `
          <tr>
            <td>${idx + 1}</td>
            <td>${safe(question.question || "Untitled question")}</td>
            <td>${safe(selectedLabel)}</td>
            <td>${result}</td>
          </tr>
        `;
    }).join("");
    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Assignments Report</title>
          <style>
            body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 32px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            p { margin: 0 0 6px; color: #334155; }
            .chips { margin: 16px 0 18px; display: flex; gap: 8px; flex-wrap: wrap; }
            .chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; text-align: left; vertical-align: top; padding: 10px; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Assignments Report</h1>
          <p><strong>Score:</strong> ${correctCount}/${parsedQuestions.length}</p>
          <p><strong>Answered:</strong> ${answeredCount}/${parsedQuestions.length}</p>
          <div class="chips">
            <span class="chip">${parsedQuestions.length} questions</span>
            <span class="chip">${meta?.profile || "Module assessment"}</span>
            <span class="chip">Retakes allowed</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;
    const reportBlob = new Blob([reportHtml], { type: "text/html" });
    const reportUrl = URL.createObjectURL(reportBlob);
    const reportWindow = window.open(reportUrl, "_blank");
    if (!reportWindow) {
      URL.revokeObjectURL(reportUrl);
      return;
    }
    window.setTimeout(() => {
      reportWindow.focus();
      reportWindow.print();
      URL.revokeObjectURL(reportUrl);
    }, 350);
  };
  useEffect(() => {
    const validQuestionIds = new Set(parsedQuestions.map((question) => question.id));
    setQuestionIndex((prev) => {
      if (!parsedQuestions.length) return 0;
      return Math.min(Math.max(prev, 0), parsedQuestions.length - 1);
    });
    setAnswersByQuestion(
      (prev) => Object.fromEntries(Object.entries(prev).filter(([questionId]) => validQuestionIds.has(questionId)))
    );
    setFeedbackByQuestion(
      (prev) => Object.fromEntries(Object.entries(prev).filter(([questionId]) => validQuestionIds.has(questionId)))
    );
  }, [questionSignature]);
  useEffect(() => {
    if (!lessonId || typeof onQuizDraftChange !== "function") return;
    onQuizDraftChange(lessonId, {
      questionIndex,
      answersByQuestion,
      feedbackByQuestion,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [lessonId, questionIndex, answersByQuestion, feedbackByQuestion, onQuizDraftChange]);
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-quiz", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Assignments" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: "Module assessment" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Badge, { children: [
          parsedQuestions.length,
          " questions"
        ] }),
        /* @__PURE__ */ jsxs(Badge, { children: [
          correctCount,
          "/",
          parsedQuestions.length,
          " correct"
        ] }),
        /* @__PURE__ */ jsxs(Badge, { "data-testid": "quiz-progress", children: [
          answeredCount,
          "/",
          parsedQuestions.length,
          " answered"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { children: [
      parsedQuestions.length > 1 && /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-2", "data-testid": "quiz-question-nav", children: parsedQuestions.map((question, idx) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setQuestionIndex(idx);
          },
          className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 ${questionIndex === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.12] bg-white/[0.02] text-[#a1a8b3] hover:border-white/[0.24] hover:text-[#f3f4f6]"}`,
          "data-testid": "quiz-question-button",
          "data-current": questionIndex === idx ? "true" : "false",
          children: [
            "Q",
            idx + 1,
            " ",
            answersByQuestion[question.id] !== void 0 ? "\u2022" : ""
          ]
        },
        question.id
      )) }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 h-2 overflow-hidden rounded-full bg-white/[0.08]", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-[#b91c1c]",
          style: { width: `${parsedQuestions.length ? answeredCount / parsedQuestions.length * 100 : 0}%` }
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-7 text-[#d1d5db]", children: activeQuestion?.question || "No quiz question parsed." }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 space-y-3", children: activeQuestion?.choices?.map((choice, idx) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: idx }));
            setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
          },
          className: `w-full rounded-2xl border p-4 text-left text-sm transition ${currentSelected === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#f3f4f6]" : "border-white/[0.12] bg-white/[0.02] text-[#cbd5e1] hover:border-white/[0.24] hover:bg-white/[0.05]"}`,
          "data-testid": "quiz-answer-choice",
          children: choice
        },
        idx
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: true })),
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonPrimary}`,
            "data-testid": "quiz-check-answer",
            children: "Check answer"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: void 0 }));
              setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
            },
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Clear answer"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: resetQuizAttempt,
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Retake quiz"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: generateQuizReport,
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Generate report"
          }
        ),
        parsedQuestions.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (questionIndex < parsedQuestions.length - 1) {
                setQuestionIndex((idx) => idx + 1);
              }
            },
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            "data-testid": "quiz-next-question",
            children: "Next question"
          }
        )
      ] }),
      showFeedback && currentSelected !== void 0 && /* @__PURE__ */ jsxs("div", { className: `mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-400/35 bg-emerald-950/30" : "border-[#dc2626]/45 bg-[#2d0f14]"}`, children: [
        /* @__PURE__ */ jsx("div", { className: `text-sm font-semibold ${correct ? "text-emerald-300" : "text-rose-300"}`, children: correct ? "Correct" : "Wrong" }),
        /* @__PURE__ */ jsxs("p", { className: `mt-2 text-sm leading-7 ${correct ? "text-emerald-100" : "text-rose-100"}`, children: [
          "In the exported quiz, the correct answer is ",
          /* @__PURE__ */ jsx("strong", { children: activeQuestion?.choices?.[activeQuestion?.answerIndex] }),
          "."
        ] })
      ] })
    ] }) })
  ] });
}
function VideoRenderer({ title, video }) {
  const embedUrl = video?.embedUrl;
  return /* @__PURE__ */ jsxs("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-video", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Media sequence" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ jsx(Badge, { children: "responsive embed" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950", children: embedUrl ? /* @__PURE__ */ jsx(
      "iframe",
      {
        src: embedUrl,
        title: `Video for ${title}`,
        loading: "lazy",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        className: "aspect-video w-full border-0"
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.16),transparent_42%),linear-gradient(135deg,#101216,#08090c)]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(PlayCircle, { className: "mx-auto h-14 w-14 text-[#fecaca]" }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 text-lg font-semibold text-[#f3f4f6]", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-lg text-sm text-[#cbd5e1]", children: "Could not detect a supported embedded media source. Use the direct source link if needed." })
    ] }) }) }),
    video?.sourcePath ? /* @__PURE__ */ jsx(
      "a",
      {
        href: video.sourcePath,
        target: "_blank",
        rel: "noreferrer",
        className: `mt-4 inline-flex ${FORENSIC_THEME.buttonSecondary}`,
        children: "Open source in new tab"
      }
    ) : null,
    /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-[#94a3b8]", children: "If this shows a blank frame, open the source in a new tab and allow embedded content from that provider." })
  ] });
}
function SourceFallback({ activeLesson, sourcePreview }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#b91c1c]/45 bg-[#2a1216] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.45)]", "data-testid": "renderer-fallback", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold text-[#fecaca]", children: "Content unavailable in this view" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-7 text-[#fee2e2]", children: "This item is still part of the module, but this content type is not fully rendered yet." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4 text-xs text-[#e2e8f0]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Type:" }),
        " ",
        typeLabel(activeLesson?.type)
      ] }),
      sourcePreview?.error && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Details:" }),
        " ",
        sourcePreview.error,
        sourcePreview.error.includes("401") || sourcePreview.error.includes("403") || sourcePreview.error.includes("Unauthorized") ? " This usually means the current host/domain is not allowed for embedded content." : null
      ] })
    ] })
  ] });
}
function QuickCheckpoints({ activeLesson }) {
  const prompts = useMemo(() => {
    if (activeLesson.type === "assignment") {
      return [
        "What is the exact submission artifact expected from this assignment?",
        "What prerequisite or reminder is easy to miss before submission?",
        "What source link or file should be opened first to complete this task?"
      ];
    }
    if (activeLesson.type === "quiz") {
      return [
        "What concept does this quiz item set emphasize?",
        "Which question type seems easiest to miss on first pass?",
        "What evidence from the preceding lesson supports your answer choices?"
      ];
    }
    return [
      "What is the main claim or idea in this lesson section?",
      "Which example from the source best supports that claim?",
      "What would you write as a one-sentence checkpoint summary?"
    ];
  }, [activeLesson.type]);
  const [revealed, setRevealed] = useState({});
  useEffect(() => {
    setRevealed({});
  }, [activeLesson.id]);
  return /* @__PURE__ */ jsxs("section", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "quick-checkpoints", children: [
    /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Quick checkpoints" }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4", children: prompts.map((prompt, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/[0.12] bg-white/[0.03] p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium text-[#f3f4f6]", children: [
        "Checkpoint ",
        idx + 1
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-[#cbd5e1]", children: prompt }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] })),
          className: `mt-3 ${FORENSIC_THEME.buttonSecondary}`,
          children: revealed[idx] ? "Hide self-check" : "Show self-check"
        }
      ),
      revealed[idx] && /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs leading-6 text-[#a1a8b3]", children: "Self-check against the lesson content before marking complete." })
    ] }, idx)) })
  ] });
}
function renderNodePreview(activeLesson, sourcePreview, persistedState) {
  const isSourceCritical = ["html-reading", "pdf", "assignment", "quiz", "embedded-video"].includes(activeLesson.type);
  if (activeLesson.type === "html-reading") {
    const html = sourcePreview?.kind === "html" ? sourcePreview.html : buildReadingFallbackHtml(activeLesson);
    if (html) return /* @__PURE__ */ jsx(HtmlRenderer, { html });
    if (sourcePreview?.status === "loading") {
      return /* @__PURE__ */ jsx("div", { className: `${FORENSIC_THEME.panelSoft} p-6 text-sm text-[#a1a8b3]`, children: "Loading content..." });
    }
    if (sourcePreview?.status === "error") {
      return /* @__PURE__ */ jsx(SourceFallback, { activeLesson, sourcePreview });
    }
  }
  if (isSourceCritical && sourcePreview?.status === "loading") {
    return /* @__PURE__ */ jsx("div", { className: `${FORENSIC_THEME.panelSoft} p-6 text-sm text-[#a1a8b3]`, children: "Loading content..." });
  }
  if (isSourceCritical && sourcePreview?.status === "error") {
    return /* @__PURE__ */ jsx(SourceFallback, { activeLesson, sourcePreview });
  }
  if (activeLesson.type === "pdf") {
    const sourceUrl = sourcePreview?.kind === "pdf" ? sourcePreview.url : void 0;
    return /* @__PURE__ */ jsx(PdfRenderer, { meta: activeLesson.pdfMeta, title: activeLesson.title, sourceUrl });
  }
  if (activeLesson.type === "image-slide") return /* @__PURE__ */ jsx(SlideRenderer, { title: activeLesson.title });
  if (activeLesson.type === "assignment") {
    const parsedData = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentXml : activeLesson.assignmentXml;
    const parsedMeta = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentMeta : activeLesson.assignmentMeta;
    return /* @__PURE__ */ jsx(AssignmentRenderer, { data: parsedData, meta: parsedMeta, title: activeLesson.title });
  }
  if (activeLesson.type === "lab-assignment") {
    return /* @__PURE__ */ jsx(
      EmbeddedAssignmentRenderer,
      {
        title: activeLesson.title,
        srcPath: activeLesson.embedPath || MODULE4_ASSIGNMENT_EMBED_PATH,
        introHtml: activeLesson.assignmentXml?.intro || activeLesson.introHtml || "",
        lessonId: activeLesson.id,
        draft: persistedState?.labDrafts?.[activeLesson.id],
        onDraftChange: persistedState?.onLabDraftChange
      }
    );
  }
  if (activeLesson.type === "quiz") {
    const quiz = sourcePreview?.kind === "quiz" ? sourcePreview.quizSample : activeLesson.quizSample;
    const questions = sourcePreview?.kind === "quiz" ? sourcePreview.quizQuestions : activeLesson.quizQuestions;
    const meta = sourcePreview?.kind === "quiz" ? sourcePreview.quizMeta : activeLesson.quizMeta;
    return /* @__PURE__ */ jsx(
      QuizRenderer,
      {
        quiz,
        questions,
        meta,
        lessonId: activeLesson.id,
        quizDraft: persistedState?.quizDrafts?.[activeLesson.id],
        onQuizDraftChange: persistedState?.onQuizDraftChange
      }
    );
  }
  if (activeLesson.type === "embedded-video") {
    const video = sourcePreview?.kind === "embedded-video" ? sourcePreview.video : activeLesson.video;
    return /* @__PURE__ */ jsx(VideoRenderer, { title: activeLesson.title, video });
  }
  return /* @__PURE__ */ jsx(SourceFallback, { activeLesson, sourcePreview });
}
function ChapterLessonCard({ lesson, quizDrafts, onQuizDraftChange, labDrafts, onLabDraftChange }) {
  const [sourcePreview, setSourcePreview] = useState({ status: "idle", kind: null });
  useEffect(() => {
    let cancelled = false;
    async function loadSourcePreview() {
      if (!lesson?.sourceFile) {
        if (!cancelled) setSourcePreview({ status: "idle", kind: null });
        return;
      }
      const sourcePath = normalizePath(lesson.sourceFile);
      const exportRoot = normalizePath(d2lCourseMapData.exportRoot || "");
      const sourceVariants = buildReferencePathVariants(sourcePath);
      const candidateSet = /* @__PURE__ */ new Set();
      for (const variant of sourceVariants) {
        candidateSet.add(variant);
        if (exportRoot) {
          candidateSet.add(joinPath(exportRoot, variant));
        }
      }
      const candidates = [...candidateSet].filter(Boolean);
      if (!cancelled) {
        setSourcePreview({ status: "loading", kind: null });
      }
      for (const candidate of candidates) {
        const url = buildReferenceUrl(candidate);
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          if (lesson.type === "pdf") {
            if (!cancelled) setSourcePreview({ status: "ready", kind: "pdf", url });
            return;
          }
          const text = await response.text();
          if (lesson.type === "html-reading") {
            const html = stripScriptsAndRewriteLinks(text, sourcePath, exportRoot);
            if (!hasMeaningfulHtmlContent(html)) continue;
            if (!cancelled) setSourcePreview({ status: "ready", kind: "html", html, sourcePath: candidate });
            return;
          }
          if (lesson.type === "assignment") {
            const parsed = parseAssignmentXml(text, sourcePath, exportRoot);
            if (!cancelled) setSourcePreview({ status: "ready", kind: "assignment", ...parsed, sourcePath: candidate });
            return;
          }
          if (lesson.type === "quiz") {
            const parsed = parseQuizXml(text);
            if (!cancelled) {
              if (parsed) {
                setSourcePreview({ status: "ready", kind: "quiz", ...parsed, sourcePath: candidate });
              } else {
                setSourcePreview({ status: "error", kind: null, error: "Could not parse quiz XML content." });
              }
            }
            return;
          }
          if (lesson.type === "embedded-video") {
            const parsed = parseEmbeddedVideoFromSource(text, sourcePath, exportRoot);
            if (!cancelled) {
              if (parsed?.embedUrl) {
                setSourcePreview({
                  status: "ready",
                  kind: "embedded-video",
                  video: {
                    ...parsed,
                    sourcePath: buildReferenceUrl(candidate)
                  },
                  sourcePath: candidate
                });
              } else {
                setSourcePreview({
                  status: "error",
                  kind: null,
                  error: "Could not extract an embedded video source from this lesson."
                });
              }
            }
            return;
          }
          if (!cancelled) {
            setSourcePreview({ status: "ready", kind: "text", text, sourcePath: candidate });
          }
          return;
        } catch {
        }
      }
      if (lesson.type === "html-reading") {
        const fallbackHtml = buildReadingFallbackHtml(lesson);
        if (fallbackHtml) {
          if (!cancelled) {
            setSourcePreview({
              status: "ready",
              kind: "html",
              html: fallbackHtml,
              sourcePath: sourcePath || ""
            });
          }
          return;
        }
      }
      if (!cancelled) {
        setSourcePreview({
          status: "error",
          kind: null,
          error: "Unable to load content preview."
        });
      }
    }
    loadSourcePreview();
    return () => {
      cancelled = true;
    };
  }, [lesson?.id, lesson?.sourceFile, lesson?.type]);
  return /* @__PURE__ */ jsxs("section", { className: `${FORENSIC_THEME.panel} p-8`, "data-testid": "chapter-lesson-card", "data-lesson-type": lesson.type, children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: lesson.type !== "html-reading" ? /* @__PURE__ */ jsx(Badge, { children: typeLabel(lesson.type) }) : null }),
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold tracking-tight text-[#f3f4f6]", children: formatLessonTitleForDisplay(lesson) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: renderNodePreview(lesson, sourcePreview, {
      quizDrafts,
      onQuizDraftChange,
      labDrafts,
      onLabDraftChange
    }) })
  ] });
}
function ForensicCoursePlayerPreviewRestored() {
  const initialWorkspaceState = useMemo(() => readForensicsWorkspaceState(), []);
  const initialUiState = initialWorkspaceState?.ui && typeof initialWorkspaceState.ui === "object" ? initialWorkspaceState.ui : {};
  const [activeChapterId, setActiveChapterId] = useState(
    typeof initialUiState.activeChapterId === "string" ? initialUiState.activeChapterId : resolvedModules[0]?.id ?? ""
  );
  const [sidebarLibraryView, setSidebarLibraryView] = useState(
    normalizeSidebarLibraryView(
      initialUiState.sidebarLibraryView || (initialUiState.activeModuleView === "assignments" ? "assignments" : "modules")
    )
  );
  const [chapterVisited, setChapterVisited] = useState(
    initialUiState.chapterVisited && typeof initialUiState.chapterVisited === "object" ? initialUiState.chapterVisited : {}
  );
  const [selectedLessonByBucket, setSelectedLessonByBucket] = useState(
    initialUiState.selectedLessonByBucket && typeof initialUiState.selectedLessonByBucket === "object" ? initialUiState.selectedLessonByBucket : {}
  );
  const activeModuleView = sidebarLibraryView === "modules" ? "content" : "assignments";
  const setActiveModuleView = useCallback((view) => {
    setSidebarLibraryView(view === "assignments" ? "assignments" : "modules");
  }, []);
  const [query, setQuery] = useState(typeof initialUiState.query === "string" ? initialUiState.query : "");
  const [isChapterMenuCollapsed, setIsChapterMenuCollapsed] = useState(Boolean(initialUiState.isChapterMenuCollapsed));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quizDrafts, setQuizDrafts] = useState(
    initialWorkspaceState?.quizDrafts && typeof initialWorkspaceState.quizDrafts === "object" ? initialWorkspaceState.quizDrafts : {}
  );
  const [labDrafts, setLabDrafts] = useState(
    initialWorkspaceState?.labDrafts && typeof initialWorkspaceState.labDrafts === "object" ? initialWorkspaceState.labDrafts : {}
  );
  const handleQuizDraftChange = useCallback((lessonId, draft) => {
    if (!lessonId || !draft || typeof draft !== "object") return;
    setQuizDrafts((prev) => {
      const nextValue = { ...prev, [lessonId]: draft };
      return nextValue;
    });
  }, []);
  const handleLabDraftChange = useCallback((lessonId, draft) => {
    if (!lessonId || !draft || typeof draft !== "object") return;
    setLabDrafts((prev) => {
      const nextValue = { ...prev, [lessonId]: draft };
      return nextValue;
    });
  }, []);
  const isExcludedModuleTitle = (title) => {
    const normalizedTitle = (title || "").trim().toLowerCase();
    const compactTitle = normalizedTitle.replace(/\s+/g, " ");
    return normalizedTitle.includes("course information") || normalizedTitle.includes("teacher resources") || normalizedTitle.includes("extra credit") || compactTitle.includes("final exam");
  };
  const filteredModules = resolvedModules.filter((module) => !isExcludedModuleTitle(module.title)).map((module) => ({
    ...module,
    lessons: module.lessons
  })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0);
  const shouldFallbackToSeed = query.length === 0 && filteredModules.length === 0 && resolvedModules.length > 0;
  const effectiveModules = shouldFallbackToSeed ? resolvedModules : filteredModules;
  const fallbackCourse = useMemo(() => buildCourseFromD2LMap(courseSeed, d2lCourseMapData), []);
  const fallbackModules = fallbackCourse?.modules?.length ? fallbackCourse.modules : courseSeed.modules;
  const fallbackFilteredModules = useMemo(
    () => fallbackModules.filter((module) => !isExcludedModuleTitle(module.title)).map((module) => ({
      ...module,
      lessons: module.lessons
    })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0),
    [fallbackModules, query]
  );
  const shouldUseFallbackCourse = query.length === 0 && effectiveModules.length === 0 && fallbackFilteredModules.length > 0;
  const finalModules = shouldUseFallbackCourse ? fallbackFilteredModules : effectiveModules;
  const emergencyModule = {
    id: "e2e-seed",
    title: "E2E Seed Module",
    lessonCount: 1,
    lessons: []
  };
  const safeModules = finalModules.length > 0 ? finalModules : fallbackFilteredModules.length > 0 ? fallbackFilteredModules : [emergencyModule];
  const activeChapter = useMemo(
    () => safeModules.find((module) => module.id === activeChapterId) || safeModules[0],
    [activeChapterId, safeModules]
  );
  const chapterLessonGroups = useMemo(() => {
    const moduleOneExcludedTitles = /* @__PURE__ */ new Set([
      "module 1 assignment (print)",
      "module 1 assignment (online)",
      "module 1: forensic toxicology assessment",
      "module 1 forensic toxicology assessment"
    ]);
    const moduleTwoExcludedTitles = /* @__PURE__ */ new Set([
      "evidence and fingerprints online activity (optional)",
      "types of evidence and fingerprint analysis assignment",
      "fingerprint case studies assignment",
      "module 2 assignment",
      "module 2 assignment (online)",
      "module 2 assessment"
    ]);
    const moduleThreeExcludedTitles = /* @__PURE__ */ new Set([
      "trace evidence assignment",
      "trace evidence case studies assignment",
      "module 3 assignment",
      "module 3 assignment (online)",
      "module 3 assessment"
    ]);
    const moduleFourExcludedTitles = /* @__PURE__ */ new Set([
      "body fluid assignment",
      "body fluid evidence case studies assignment",
      "module 4 assignment (print)",
      "module 4 assignment (online)",
      "module assessment"
    ]);
    const moduleFiveExcludedTitles = /* @__PURE__ */ new Set([
      "impaired driving assignment",
      "module 5 assignment (print)",
      "module 5 assignment (online)",
      "module 5 assessment"
    ]);
    const moduleSixExcludedTitles = /* @__PURE__ */ new Set([
      "polygraphing and forensic writing analysis assignment",
      "polygraphing and forensic writing case studies assignment",
      "module 6 assignment (print)",
      "module 6 assignment (online)",
      "module 6 assessment"
    ]);
    const moduleSevenExcludedTitles = /* @__PURE__ */ new Set([
      "forensic dna evidence assignment"
    ]);
    const moduleEightExcludedTitles = /* @__PURE__ */ new Set([
      "careers in forensic science assignment"
    ]);
    const isUnitAssessmentSection = (title) => (title || "").trim().toLowerCase().includes("unit assessment");
    const activeChapterTitleLower = (activeChapter?.title || "").toLowerCase();
    const isModuleOneForFilter = activeChapterTitleLower.includes("forensic toxicology");
    const isModuleTwoForSynthetic = activeChapterTitleLower.includes("types of evidence and fingerprint analysis");
    const isModuleTwoForFilter = activeChapterTitleLower.includes("types of evidence and fingerprint analysis") || activeChapterTitleLower.includes("law enforcement equipment");
    const isModuleThreeForFilter = activeChapterTitleLower.includes("trace evidence") || activeChapterTitleLower.includes("arson and explosives");
    const isModuleFourForFilter = activeChapterTitleLower.includes("body fluid evidence") || activeChapterTitleLower.includes("forensic ballistics");
    const isModuleFiveForFilter = activeChapterTitleLower.includes("forensic detection of impaired driving") || activeChapterTitleLower.includes("criminal profiling");
    const isModuleSixForFilter = activeChapterTitleLower.includes("polygraphing and document analysis") || activeChapterTitleLower.includes("anthropology and entomology");
    const isModuleSevenForFilter = (activeChapter?.title || "").toLowerCase().includes("forensic genetics");
    const isModuleEightForFilter = (activeChapter?.title || "").toLowerCase().includes("careers in forensic science");
    const normalizedLessons = (activeChapter?.lessons || []).filter((lesson) => !isUnitAssessmentSection(lesson.title)).filter((lesson) => {
      const normalizedTitle = (lesson.title || "").trim().toLowerCase();
      if (normalizedTitle.includes("assignment submission")) return false;
      if (isModuleOneForFilter) return !moduleOneExcludedTitles.has(normalizedTitle);
      if (isModuleTwoForFilter) return !moduleTwoExcludedTitles.has(normalizedTitle);
      if (isModuleThreeForFilter) return !moduleThreeExcludedTitles.has(normalizedTitle);
      if (isModuleFourForFilter) return !moduleFourExcludedTitles.has(normalizedTitle);
      if (isModuleFiveForFilter) return !moduleFiveExcludedTitles.has(normalizedTitle);
      if (isModuleSixForFilter) return !moduleSixExcludedTitles.has(normalizedTitle);
      if (isModuleSevenForFilter) return !moduleSevenExcludedTitles.has(normalizedTitle);
      if (isModuleEightForFilter) return !moduleEightExcludedTitles.has(normalizedTitle);
      return true;
    }).map((lesson) => ({
      ...lesson,
      moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
      moduleLessonCount: activeChapter.lessonCount,
      moduleHidden: activeChapter.isHidden
    }));
    const chapterTitleLower = (activeChapter?.title || "").toLowerCase();
    const isModuleOne = chapterTitleLower.includes("introduction to crime scenes");
    const isModuleThree = chapterTitleLower.includes("trace evidence");
    const isModuleFour = chapterTitleLower.includes("body fluid evidence");
    const isModuleFive = chapterTitleLower.includes("forensic detection of impaired driving");
    const isModuleSix = chapterTitleLower.includes("polygraphing and document analysis");
    const isModuleSeven = chapterTitleLower.includes("forensic genetics");
    const isModuleEight = chapterTitleLower.includes("careers in forensic science");
    const exportRoot = normalizePath(d2lCourseMapData.exportRoot || "");
    const moduleThreeCaseStudiesImage = "https://upload.wikimedia.org/wikipedia/commons/2/2c/CSIRO_ScienceImage_8115_Human_hair_and_Merino_wool_fibre.jpg";
    const moduleThreeTraceImage = buildReferenceUrl(
      joinPath(exportRoot, "assignment/ia4effbb5-11e6-405e-a610-94c25bdcd18e/Content/hair evidence.jpg")
    );
    const moduleFourCaseStudiesImage = buildReferenceUrl(
      joinPath(exportRoot, "assignment/i16176291-5154-45bd-8891-b2c9517b1a3c/Content/170829-F-DB515-0024.JPG")
    );
    const moduleSixPolygraphImage = buildReferenceUrl(
      joinPath(exportRoot, "assignment/i5416ee1b-c173-4bcc-80e8-e3c1fae36848/Content/3034903278_5ef70f6f09_b.jpg")
    );
    const moduleTwoFingerprintLabIntro = [
      '<div class="space-y-5">',
      "<p>After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.</p>",
      "<p>Physical evidence from a crime scene can include fingerprints, hair, blood, saliva, semen, skin, bone, bullets, bullet casings, paint fragments, and fibres.</p>",
      '<h4 style="margin-top:10px;">Individualized Physical Evidence</h4>',
      "<p>Unique evidence that can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, and dental impressions.</p>",
      '<h4 style="margin-top:10px;">Identified Physical Evidence</h4>',
      "<p>Evidence that shares a common source and can be grouped into a class of items with similar properties. Examples: clothing, shoe prints, and blood type.</p>",
      "<p>Fingerprint analysis has been used in many crime scenes as individualized evidence to tie a suspect to a crime scene. You will examine some of these historical cases in the following assignment.</p>",
      "<p>Complete the following assignment about using fingerprint analysis to solve crimes. If you need a refresher on how to cite sources, please check out the <strong>How to Cite Sources</strong> tab in the Course Information section. Click on the image below to make a copy of the Fingerprint Analysis Case Studies Assignment. Remember to double click on the header to open it and add your name to the document.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleThreeTraceLabIntro = [
      "<div>",
      `<p style="text-align: center;"><img src="${moduleThreeCaseStudiesImage}" alt="Image result for hair microscope" width="501" height="401" class="img-responsive atto_image_button_text-bottom"></p>`,
      "<p>Hair and fiber evidence has been used in many cases in the past to connect suspects with a crime. Occasionally, these cases are overturned with DNA evidence in the future. Despite this, trace evidence such as hair and fiber has many valuable uses in solving crimes. The following assignment will have you examine some of these cases.</p>",
      `<p style="text-align: center;"><img src="${moduleThreeTraceImage}" alt="hair evidence" width="500" height="333" class="img-responsive atto_image_button_text-bottom"></p>`,
      "<p>Microscopic evidence at a crime scene is called Trace Evidence. Hair and fiber are examples of this type of evidence and they can be valuable in an investigation. Although most hair and fiber are identified and not individualized, they can still be used in court to support cases.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleFourBodyFluidLabIntro = [
      "<div>",
      "<p>Body fluid evidence is one of the most common pieces of evidence that can be found at a crime scene, especially when a violent crime has occurred. This evidence can be extremely useful in helping investigators piece together the events of a crime. In this assignment you will demonstrate your understanding of body fluid evidence.</p>",
      `<p style="text-align: center;"><img src="${moduleFourCaseStudiesImage}" alt="blood evidence" width="500" height="334" class="img-responsive atto_image_button_text-bottom"></p>`,
      "<p>There are a number of historical case studies where blood stain and/or spatter evidence was used to successfully solve a crime and convict the perpetrator(s). Demonstrate your understanding of forensic serology by completing the following assignment.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleFiveImpairedDrivingLabIntro = [
      "<div>",
      "<p>Impaired driving is a crime that kills and injures too many Canadians each year. The tools and training that police officers use are important in the prevention of more accidents. In this unit you explored many of the useful tools that police use to detect impaired driving. Demonstrate your understanding of these tools in the assignment below.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleSixPolygraphLabIntro = [
      "<div>",
      `<p style="text-align: center;"><img src="${moduleSixPolygraphImage}" alt="polygraph" width="501" height="333" class="img-responsive atto_image_button_text-bottom"></p>`,
      "<p>Polygraphing is a common tool used by investigators. Although it has been controversial, it has undeniable value to investigators when trying to solve crimes. Writing analysis is another common investigative tool that has been used to solve a number of crimes. In the assignment below, you will demonstrate your understanding of these forensic techniques.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleSevenGeneticsLabIntro = [
      "<div>",
      '<p style="text-align: center;"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Agarose_gel_slab_for_DNA_Analysis%2C_after_the_Electrophoresis_run.jpg" alt="Image result for DNA analysis" width="399" height="263" class="img-responsive atto_image_button_text-bottom"></p>',
      "<p>Forensic DNA Analysis has been one of the most powerful and important tools that investigators use today. It can give strong evidence for a suspect's guilt or innocence and is an indispensable tool in the forensic world. The assignment below will allow you to demonstrate your understanding of DNA analysis in the context of forensic investigations.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const moduleEightCareerLabIntro = [
      "<div>",
      "<p>Forensic science includes many different career paths, and each one uses a different mix of skills. In this interactive assignment, you will work through short scenarios, compare your preferences, and see which forensic career best matches your strengths.</p>",
      "<p>Use the result as a starting point for reflection. Think about what kind of evidence, work setting, and pace fit you best, then compare that result with the careers described in the lesson.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
      "</div>"
    ].join("");
    const syntheticLessons = [];
    if (isModuleTwoForSynthetic) {
      syntheticLessons.push({
        id: "module2-fingerprint-analysis-description",
        title: "Fingerprint Analysis Lab Assignment",
        type: "assignment",
        sourceFile: "",
        resources: [],
        assignmentMeta: { points: 35, submissionType: "file", submissionFormats: ["file"] },
        assignmentXml: { intro: moduleTwoFingerprintLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
      syntheticLessons.push({
        id: "module2-fingerprint-analysis-lab",
        title: "Fingerprint Analysis Interactive Assignment",
        type: "lab-assignment",
        embedPath: MODULE2_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE2_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE2_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleOne) {
      syntheticLessons.push({
        id: "module1-crime-scene-lab",
        title: "Crime Scene Certification Lab",
        type: "lab-assignment",
        embedPath: MODULE1_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE1_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE1_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleThree) {
      syntheticLessons.push({
        id: "module3-trace-evidence-lab",
        title: "Trace Evidence Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE3_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE3_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE3_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleThreeTraceLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleFour) {
      syntheticLessons.push({
        id: "module4-body-fluid-analysis-lab",
        title: "Body Fluid Analysis Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE4_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE4_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE4_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleFourBodyFluidLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleFive) {
      syntheticLessons.push({
        id: "module5-impaired-driving-lab",
        title: "Impaired Driving Assignment Lab",
        type: "lab-assignment",
        embedPath: MODULE5_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE5_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE5_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleFiveImpairedDrivingLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleSix) {
      syntheticLessons.push({
        id: "module6-polygraph-document-lab",
        title: "Polygraph and Document Analysis Lab",
        type: "lab-assignment",
        embedPath: MODULE6_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE6_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE6_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleSixPolygraphLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleSeven) {
      syntheticLessons.push({
        id: "module7-forensic-genetics-lab",
        title: "Forensic Genetics Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE7_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE7_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE7_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleSevenGeneticsLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleEight) {
      syntheticLessons.push({
        id: "module8-career-path-simulation",
        title: "Career Path Simulation Lab",
        type: "lab-assignment",
        embedPath: MODULE8_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE8_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE8_ASSIGNMENT_EMBED_PATH],
        assignmentXml: { intro: moduleEightCareerLabIntro },
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    let lessonsWithSynthetic = [...syntheticLessons, ...normalizedLessons];
    if (isModuleOne) {
      const moduleOneLabId = "module1-crime-scene-lab";
      const labIndex = lessonsWithSynthetic.findIndex((lesson) => lesson.id === moduleOneLabId);
      if (labIndex !== -1) {
        const [labLesson] = lessonsWithSynthetic.splice(labIndex, 1);
        const introIndex = lessonsWithSynthetic.findIndex(
          (lesson) => (lesson.title || "").trim().toLowerCase() === "introduction to crime scenes assignment"
        );
        const insertIndex = introIndex === -1 ? lessonsWithSynthetic.length : introIndex + 1;
        lessonsWithSynthetic.splice(insertIndex, 0, labLesson);
      }
    }
    return {
      contentLessons: lessonsWithSynthetic.filter(
        (lesson) => lesson.type !== "quiz" && lesson.type !== "assignment" && lesson.type !== "lab-assignment"
      ),
      assignmentLessons: lessonsWithSynthetic.filter(
        (lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment"
      )
    };
  }, [activeChapter]);
  const chapterLessons = chapterLessonGroups.contentLessons;
  const chapterAssignments = chapterLessonGroups.assignmentLessons;
  const chapterQuizzes = chapterAssignments.filter(isQuizLesson);
  const chapterAssignmentsOnly = chapterAssignments.filter(isAssignmentOnlyLesson);
  const activeBucket = sidebarLibraryView === "quizzes" ? "quizzes" : sidebarLibraryView === "assignments" ? "assignments" : "content";
  const activeBucketLessons = activeBucket === "quizzes" ? chapterQuizzes : activeBucket === "assignments" ? chapterAssignmentsOnly : chapterLessons;
  const selectedBucketKey = activeChapter?.id ? bucketStateKey(activeChapter.id, activeBucket) : "";
  const selectedLessonId = selectedBucketKey ? selectedLessonByBucket[selectedBucketKey] : "";
  const activeLesson = activeBucketLessons.find((lesson) => lesson.id === selectedLessonId) || activeBucketLessons[0] || null;
  const moduleLibraryRows = useMemo(() => {
    return safeModules.map((module) => {
      const moduleLessons = module.lessons || [];
      const syntheticLessons = buildSyntheticLessonsForModule(module).filter(
        (synthetic) => !moduleLessons.some((lesson) => lesson.id === synthetic.id)
      );
      const mergedLessons = [...syntheticLessons, ...moduleLessons];
      const quizzes = mergedLessons.filter(isQuizLesson);
      const assignments = mergedLessons.filter(isAssignmentOnlyLesson);
      return { module, quizzes, assignments };
    }).filter((row) => row.quizzes.length > 0 || row.assignments.length > 0);
  }, [safeModules]);
  const handleSelectLesson = useCallback((moduleId, bucket, lessonId) => {
    if (!moduleId || !lessonId) return;
    setActiveChapterId(moduleId);
    setSidebarLibraryView(bucket === "content" ? "modules" : bucket);
    setSelectedLessonByBucket((prev) => ({ ...prev, [bucketStateKey(moduleId, bucket)]: lessonId }));
  }, []);
  useEffect(() => {
    if (!safeModules.length) {
      return;
    }
    const isVisible = safeModules.some((module) => module.id === activeChapterId);
    if (!isVisible) {
      setActiveChapterId(safeModules[0].id);
    }
  }, [safeModules, activeChapterId]);
  useEffect(() => {
    if (!activeChapter?.id) return;
    setSelectedLessonByBucket((prev) => {
      let changed = false;
      const next = { ...prev };
      const ensureBucketSelection = (bucket, lessons) => {
        const key = bucketStateKey(activeChapter.id, bucket);
        if (!lessons.length) {
          if (next[key]) {
            delete next[key];
            changed = true;
          }
          return;
        }
        if (!lessons.some((lesson) => lesson.id === next[key])) {
          next[key] = lessons[0].id;
          changed = true;
        }
      };
      ensureBucketSelection("content", chapterLessons);
      ensureBucketSelection("quizzes", chapterQuizzes);
      ensureBucketSelection("assignments", chapterAssignmentsOnly);
      return changed ? next : prev;
    });
  }, [activeChapter?.id, chapterLessons, chapterQuizzes, chapterAssignmentsOnly]);
  useEffect(() => {
    if (!activeChapter?.id) return;
    setChapterVisited((prev) => ({ ...prev, [activeChapter.id]: true }));
  }, [activeChapter?.id]);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeChapterId, sidebarLibraryView]);
  useEffect(() => {
    writeForensicsWorkspaceState({
      schemaVersion: 1,
      savedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ui: {
        activeChapterId,
        activeModuleView: sidebarLibraryView === "modules" ? "content" : "assignments",
        sidebarLibraryView,
        chapterVisited,
        selectedLessonByBucket,
        query,
        isChapterMenuCollapsed
      },
      quizDrafts,
      labDrafts,
      reportSnapshot: {
        progressPercent: 0,
        completedSections: Object.values(chapterVisited).filter(Boolean).length,
        totalSections: safeModules.length,
        activeModuleId: activeChapter?.id || "",
        activeModuleTitle: activeChapter?.title || ""
      }
    });
  }, [
    activeChapterId,
    sidebarLibraryView,
    chapterVisited,
    selectedLessonByBucket,
    query,
    isChapterMenuCollapsed,
    quizDrafts,
    labDrafts,
    safeModules.length,
    activeChapter?.id,
    activeChapter?.title
  ]);
  const isMenuCollapsed = isChapterMenuCollapsed && !isMobileMenuOpen;
  if (!activeChapter) {
    return /* @__PURE__ */ jsx("div", { className: "forensic-app min-h-screen bg-[#121314] p-4 text-[#b8b2a8] sm:p-8", children: "No chapters were mapped from the D2L course map yet." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "forensic-app min-h-screen bg-[#121314] text-[#f3f1eb]", children: [
    /* @__PURE__ */ jsx("style", { children: `
        .forensic-app {
          font-family: "Inter", "Avenir Next", sans-serif;
        }
        .forensic-app h1,
        .forensic-app h2,
        .forensic-app h3,
        .forensic-app h4 {
          font-family: "Space Grotesk", "Inter", sans-serif;
          letter-spacing: -0.015em;
        }
        .forensic-app * {
          transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `fixed inset-0 z-30 bg-black/65 transition-opacity duration-200 lg:hidden ${isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`,
          "aria-hidden": isMobileMenuOpen ? "false" : "true",
          onClick: () => setIsMobileMenuOpen(false),
          title: "Close menu overlay"
        }
      ),
      /* @__PURE__ */ jsxs(
        "aside",
        {
          className: `fixed inset-y-0 left-0 z-40 h-screen shrink-0 overflow-hidden border-r border-[#302d2a] bg-[#17181a] transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-0 lg:bg-[#17181a] ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isMenuCollapsed ? "lg:w-16" : "w-[86vw] max-w-[340px] lg:w-[340px]"}
          }`,
          "data-testid": "chapter-menu-panel",
          "data-collapsed": isMenuCollapsed ? "true" : "false",
          children: [
            /* @__PURE__ */ jsxs("div", { className: `border-b border-[#302d2a] ${isMenuCollapsed ? "px-2 py-4" : "px-5 py-5"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: `mb-3 flex ${isMenuCollapsed ? "justify-center" : "items-start justify-between gap-3"}`, children: [
                !isMenuCollapsed ? /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: FORENSIC_THEME.overline, children: "Case file" }),
                  /* @__PURE__ */ jsx("h1", { className: "mt-1 text-xl font-semibold text-[#f3f1eb]", children: resolvedCourse.title })
                ] }) : null,
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setIsMobileMenuOpen(false),
                    className: "flex h-10 w-10 items-center justify-center rounded-lg border border-[#403c38] bg-[#23211f] text-[#d1cac0] transition duration-200 hover:border-[#57514b] hover:bg-[#2b2926] hover:text-[#f3f1eb] lg:hidden",
                    "aria-label": "Close chapter menu",
                    title: "Close chapter menu",
                    children: /* @__PURE__ */ jsx("span", { className: "text-lg leading-none", children: "\xD7" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setIsChapterMenuCollapsed((prev) => !prev),
                    className: `hidden h-10 w-10 items-center justify-center rounded-lg border transition duration-200 lg:flex ${isMenuCollapsed ? "border-[#b07a58]/70 bg-[#8a5a3c] text-[#f3f1eb] hover:bg-[#9b6948]" : "border-[#403c38] bg-[#23211f] text-[#d1cac0] hover:border-[#57514b] hover:bg-[#2b2926] hover:text-[#f3f1eb]"}`,
                    "data-testid": "chapter-menu-toggle",
                    "aria-expanded": isMenuCollapsed ? "false" : "true",
                    "aria-label": isMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",
                    title: isMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",
                    children: /* @__PURE__ */ jsxs("span", { className: "flex flex-col gap-1.5", children: [
                      /* @__PURE__ */ jsx("span", { className: `block h-[2px] w-4 rounded-full ${isMenuCollapsed ? "bg-[#f3f1eb]" : "bg-[#d1cac0]"}` }),
                      /* @__PURE__ */ jsx("span", { className: `block h-[2px] w-4 rounded-full ${isMenuCollapsed ? "bg-[#f3f1eb]" : "bg-[#d1cac0]"}` }),
                      /* @__PURE__ */ jsx("span", { className: `block h-[2px] w-4 rounded-full ${isMenuCollapsed ? "bg-[#f3f1eb]" : "bg-[#d1cac0]"}` })
                    ] })
                  }
                )
              ] }),
              isMenuCollapsed ? null : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c857b]" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: "Search chapter titles",
                    className: "w-full rounded-lg border border-[#403c38] bg-[#23211f] py-2.5 pl-9 pr-3 text-sm text-[#ece7df] outline-none placeholder:text-[#8c857b] focus:border-[#b07a58]/70",
                    "data-testid": "lesson-search"
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `${isMenuCollapsed ? "hidden" : "h-[calc(100vh-245px)] overflow-y-auto px-3 py-4"}`,
                "data-testid": "module-list",
                children: safeModules.map((module) => {
                  const isActive = module.id === activeChapter.id;
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "mb-3 rounded-xl border border-[#353331] bg-[#1c1d1f] p-2 shadow-[0_12px_24px_rgba(0,0,0,0.22)]",
                      "data-testid": "module-panel",
                      "data-module-title": module.title,
                      "data-module-hidden": module.isHidden ? "true" : "false",
                      "data-module-expanded": isActive ? "true" : "false",
                      children: [
                        /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: () => {
                              setActiveChapterId(module.id);
                              const hasAssignments = module.lessons?.some(
                                (lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment"
                              );
                              if (activeModuleView === "assignments" && hasAssignments) {
                                setActiveModuleView("assignments");
                              } else {
                                setActiveModuleView("content");
                              }
                            },
                            className: "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition duration-200 hover:bg-[#262320]",
                            "data-testid": "module-toggle",
                            "data-module-title": module.title,
                            "data-expanded": isActive ? "true" : "false",
                            children: [
                              /* @__PURE__ */ jsxs("div", { children: [
                                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-[#f3f1eb]", children: formatModuleTitleForDisplay(module.title) }),
                                /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#8c857b]", children: [
                                  module.lessonCount,
                                  " items in export"
                                ] })
                              ] }),
                              module.isHidden && /* @__PURE__ */ jsx(Badge, { children: "hidden module" }),
                              isActive ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-[#b8b2a8]" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-[#8c857b]" })
                            ]
                          }
                        ),
                        isActive && module.lessons?.some((lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment") ? /* @__PURE__ */ jsx("div", { className: "mt-1 rounded-lg border border-[#353331] bg-[#23211f] p-1", "data-testid": "module-submenu", children: /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: (event) => {
                              event.stopPropagation();
                              setActiveChapterId(module.id);
                              setActiveModuleView("assignments");
                            },
                            className: `flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold tracking-[0.1em] transition ${activeModuleView === "assignments" ? "bg-[#30241d] text-[#e0c0a8] ring-1 ring-[#b07a58]/35" : "text-[#b8b2a8] hover:bg-[#2d2a27] hover:text-[#f3f1eb]"}`,
                            "data-testid": "module-assignments-tab",
                            "data-module-title": module.title,
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "Assignments" }),
                              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#8c857b]", children: module.lessons.filter((lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment").length })
                            ]
                          }
                        ) }) : null
                      ]
                    },
                    module.id
                  );
                })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs("main", { className: "min-w-0 flex-1 overflow-x-hidden overflow-y-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 border-b border-[#302d2a] bg-[#17181a] shadow-[0_8px_18px_rgba(0,0,0,0.2)]", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 sm:px-6 lg:px-8 lg:py-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2 text-sm text-[#b8b2a8]", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsMobileMenuOpen(true),
                className: "flex h-9 w-9 items-center justify-center rounded-lg border border-[#403c38] bg-[#23211f] text-[#d1cac0] transition duration-200 hover:border-[#57514b] hover:bg-[#2b2926] hover:text-[#f3f1eb] lg:hidden",
                "aria-label": "Open chapter menu",
                title: "Open chapter menu",
                children: /* @__PURE__ */ jsxs("span", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "block h-[2px] w-4 rounded-full bg-[#d1cac0]" }),
                  /* @__PURE__ */ jsx("span", { className: "block h-[2px] w-4 rounded-full bg-[#d1cac0]" }),
                  /* @__PURE__ */ jsx("span", { className: "block h-[2px] w-4 rounded-full bg-[#d1cac0]" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[#f3f1eb]", children: formatModuleTitleForDisplay(activeChapter.title) })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold tracking-tight text-[#f3f1eb]", "data-testid": "lesson-title", children: formatModuleTitleForDisplay(activeChapter.title) }),
          /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(Badge, { children: activeModuleView === "assignments" ? "assignments view" : "content view" }) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10", children: activeModuleView === "assignments" ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", "data-testid": "module-assignments-view", children: [
          /* @__PURE__ */ jsxs("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-[#f3f1eb]", children: "Assignments" }),
              /* @__PURE__ */ jsxs(Badge, { children: [
                chapterAssignments.length,
                " assessments"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#b8b2a8]", children: [
              "Assessment items for ",
              formatModuleTitleForDisplay(activeChapter.title),
              " are grouped in this dedicated view."
            ] })
          ] }),
          chapterAssignments.length === 0 ? /* @__PURE__ */ jsxs("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-[#f3f1eb]", children: "No assignments in this module" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#b8b2a8]", children: "Return to the module content view or choose another module with assessment items." })
          ] }) : chapterAssignments.map((lesson) => /* @__PURE__ */ jsx(
            ChapterLessonCard,
            {
              lesson,
              quizDrafts,
              onQuizDraftChange: handleQuizDraftChange,
              labDrafts,
              onLabDraftChange: handleLabDraftChange
            },
            lesson.id
          ))
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", "data-testid": "module-content-view", children: [
          chapterLessons.length === 0 ? /* @__PURE__ */ jsxs("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-[#f3f1eb]", children: "No learner content in this module" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#b8b2a8]", children: "This module currently contains only assessment items. Use the Assignments tab under the module name." })
          ] }) : null,
          chapterLessons.map((lesson) => /* @__PURE__ */ jsx(
            ChapterLessonCard,
            {
              lesson,
              quizDrafts,
              onQuizDraftChange: handleQuizDraftChange,
              labDrafts,
              onLabDraftChange: handleLabDraftChange
            },
            lesson.id
          ))
        ] }) })
      ] })
    ] })
  ] });
}
const __canvasHelperRootElement = document.getElementById("root");
if (__canvasHelperRootElement) {
  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(/* @__PURE__ */ jsx(ForensicCoursePlayerPreviewRestored, {}));
}
export {
  ForensicCoursePlayerPreviewRestored as default
};
