import __CanvasHelperReactDomClient from "https://esm.sh/react-dom@19.1.1/client";
import React, { useEffect, useMemo, useState } from "https://esm.sh/react@19.1.1";
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
  Bookmark,
} from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";
import d2lCourseMapData from "./d2l-map-data.js";

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
  `,
};

const courseSeed = {
  title: "Forensic Studies 25",
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
          sourceFile: "сontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf",
          pdfMeta: { pages: 14, size: "652 KB" },
          learn: {
            heading: "Course outline (MUST READ)",
            excerpt: "This source exports as a PDF. In the real player this opens inside an in-app PDF viewer instead of throwing students into a detached file download.",
            bullets: [
              "Preserve PDF inside the lesson shell",
              "Show page navigation and zoom",
              "Keep previous/next navigation around the PDF",
              "Avoid breaking the course flow",
            ],
            callout: "Static source files should stay integrated into the course experience instead of becoming detached downloads.",
          },
          resources: ["Original PDF source", "Course shell metadata"],
        },
        {
          id: "cite",
          title: "How to Properly Cite Sources",
          type: "html-reading",
          sourceFile: "сontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html",
          htmlSample: actualHtmlSamples.citeSources,
          learn: {
            heading: "How to Properly Cite Sources",
            excerpt: "The exported file is a simple HTML page with supporting images and an external citation resource.",
            bullets: [
              "Simple HTML reading page",
              "Uses supporting images",
              "Includes an external citation help link",
              "Needs modern spacing and image treatment",
            ],
            callout: "This is the kind of page builders oversimplify when they should just render it cleanly.",
          },
          resources: ["Original HTML page", "External citation help link"],
        },
      ],
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
          sourceFile: "сontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html",
          htmlSample: actualHtmlSamples.evidenceOverview,
          learn: {
            heading: "Types of Evidence & Fingerprint Analysis",
            excerpt: "This is a text-rich lesson, not just a slide. The player needs to preserve the reading and make it easier to navigate.",
            bullets: [
              "Burden of proof",
              "Physical evidence matters",
              "Fingerprinting has long investigative value",
              "Text-rich lesson that should stay intact",
            ],
            callout: "This is exactly the kind of lesson AI builders butcher when they start summarizing.",
          },
          resources: ["Original HTML reading", "Fingerprint analysis sequence"],
        },
        {
          id: "evidence-types",
          title: "Evidence Types",
          type: "html-reading",
          sourceFile: "сontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html",
          htmlSample: actualHtmlSamples.evidenceTypes,
          learn: {
            heading: "Identified Evidence and Individualized Evidence",
            excerpt: "The lesson lists examples such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibres, and explains why interpreting evidence matters.",
            bullets: [
              "Evidence categories",
              "Examples of physical evidence",
              "Interpretation matters",
              "Strong candidate for glossary support",
            ],
            callout: "This should become easier to compare, not shorter.",
          },
          resources: ["Original HTML page", "Evidence sorting practice"],
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
            reminder: "If you need a refresher on submissions, use the Course Information section.",
          },
          resources: ["Assignment XML", "Submission workflow"],
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
            answerIndex: 0,
          },
          resources: ["QTI XML", "Assessment settings"],
        },
        {
          id: "slide",
          title: "Brief History of Fingerprinting",
          type: "image-slide",
          sourceFile: "сontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html",
          learn: {
            heading: "Brief History of Fingerprinting",
            excerpt: "This lesson appears in the fingerprint sequence and should flow into pattern types, matching logic, and case studies.",
            bullets: [
              "Belongs in fingerprint learning arc",
              "Would benefit from a timeline treatment",
              "Should connect to later case studies",
              "Media-first presentation",
            ],
            callout: "History content gets lost when builders flatten modules.",
          },
          resources: ["Original source file", "Fingerprint sequence map"],
        },
        {
          id: "video",
          title: "Real Life CSI - Crime Scene Cleaners",
          type: "embedded-video",
          sourceFile: "сontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html",
          learn: {
            heading: "Real Life CSI - Crime Scene Cleaners",
            excerpt: "Video nodes should keep transcript links, surrounding lesson notes, and next-step navigation visible.",
            bullets: [
              "Responsive embed",
              "Keep video in shell",
              "Keep transcript and notes nearby",
              "Do not detach media from module flow",
            ],
            callout: "Video pages should not become awkward dead-end wrappers.",
          },
          resources: ["Embedded media page", "Related lesson notes"],
        },
      ],
    },
  ],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
  const seededLessons = seed.modules.flatMap((module) => module.lessons);
  const seededBySource = new Map(
    seededLessons
      .filter((lesson) => lesson.sourceFile)
      .map((lesson) => [lesson.sourceFile, lesson])
  );
  const seededByTitle = new Map(
    seededLessons.map((lesson) => [lesson.title.trim().toLowerCase(), lesson])
  );

  const modules = (d2lMap.modules || [])
    .map((moduleNode) => {
      const moduleHidden = isHiddenLabel(moduleNode.title);
      const leaves = flattenCourseNodes(moduleNode.children);
      const isCourseInfoModule = (moduleNode.title || "").trim().toLowerCase() === "course information";
      const courseInfoExcludedTitles = new Set([
        "assignment submission",
        "enabling brightspace notifications",
      ]);
      const filteredLeaves = leaves.filter((node) => {
        if (!isCourseInfoModule) return true;
        const title = (node.title || "").trim().toLowerCase();
        return !courseInfoExcludedTitles.has(title);
      });

      const lessons = filteredLeaves.map((node, index) => {
        const sourceFile = node.resource?.hrefs?.[0] ?? "";
        const seeded =
          seededBySource.get(sourceFile) ??
          seededByTitle.get((node.title || "").trim().toLowerCase());
        const type = mapKindToLessonType(node.kind, sourceFile, node.title);
        const id = slugify(node.id || `${moduleNode.id}-${index}-${node.title}`);
        const lessonHidden = moduleHidden || isHiddenLabel(node.title);

        if (seeded) {
          return {
            ...seeded,
            id,
            title: node.title || seeded.title,
            type: seeded.type || type,
            sourceFile: sourceFile || seeded.sourceFile,
            resources: seeded.resources?.length ? seeded.resources : sourceFile ? [sourceFile] : [],
            isHidden: lessonHidden,
          };
        }

        return {
          id,
          title: node.title || `Lesson ${index + 1}`,
          type,
          sourceFile: sourceFile || `manifest:${node.id}`,
          resources: sourceFile ? [sourceFile] : [],
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
    })
    .filter((module) => module.lessons.length > 0);

  if (!modules.length) {
    return seed;
  }

  return {
    title: "Forensic Studies 25",
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

const flatLessons = resolvedModules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleLessonCount: module.lessonCount,
  }))
);

function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
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
  return decoded
    .replace(/\\\\/g, "/")
    .split("/")
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .join("/");
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
  return normalizePath(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function buildReferenceUrl(relativePath) {
  return `/preview/references/raw/forensics/${encodePath(relativePath)}`;
}

const module4RemoteImageFallbacks = {
  "https://lh4.googleusercontent.com/mwvzxUf61aqdm9oG9VyiGdKou-VQ2yHvqtFDv6rJT9lgiNDEOhwvS2rHpeSWwBtmKhimbxnLOPTOjHx7_JBnMDMJBFuozH4mS0chn5BF4uQMRbkyn4j1DGPaWhCdK4DJghQ6TBo-eZKgBPjbBQ":
    "сontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg",
  "https://lh6.googleusercontent.com/pM26gAa_Xhvbfdoj1ema-YP6WFlsgY2Ucg_CByG1J7coyB-aJXwZD3eu0cS6tGg30N1LVPr-B-Np9xmD3_WYZfNMn7xO-VyfIbdUNsGv8dCDR81Upd7nRCc-YGYmtUfKHHHzpyS2H0cBD_pwOA":
    "сontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/Red Blood Cells.PNG",
  "https://lh3.googleusercontent.com/gj7N2Oif-4X2zfjkub58PbgAWt3XKxxCk-GF_PI9pnLmzig9Sm-eZDKfWtM_CLkbEesr_3iWfQ3qJg1c1REQKy3BkrxOSC0BLI60QrltkcCrT-HwPZUZRQ8ZlsTID5FaxZA3X7SOLscM14fouA":
    "сontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/White Blood Cells.PNG",
  "https://lh6.googleusercontent.com/A0XYWVnt-KsIFRtn-iJ2fyit8XQWxuznFqmFZe0i3FL17baTAZI6OvGjbKvJoYjGB4K0tlWQpY5ERY0LTOSqip1J3luRdNyzy983phkU37RgGpp7vUfqXKBUqtDQOJLohFxZJZwzURYrNLjKLw":
    "сontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg",
};

function stripScriptsAndRewriteLinks(html, sourceFile, exportRoot) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

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

  const rewriteAttr = (selector, attr) => {
    doc.querySelectorAll(selector).forEach((el) => {
      const value = el.getAttribute(attr);
      if (!value) return;

      // Some exported module 4 image links point to dead external hosts.
      // Remap those known URLs to stable local assets from the same course export.
      if (attr === "src" && /^https?:/i.test(value)) {
        const fallbackPath = module4RemoteImageFallbacks[value];
        if (fallbackPath) {
          const withRoot = exportRoot ? joinPath(exportRoot, fallbackPath) : fallbackPath;
          el.setAttribute(attr, buildReferenceUrl(withRoot));
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
      html: content,
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

function getElementsByLocalName(root, localName) {
  return Array.from(root.getElementsByTagName("*")).filter((el) => el.localName === localName);
}

function normalizeAssignmentHtml(html, sourceFile, exportRoot) {
  if (!html) return "";
  return stripScriptsAndRewriteLinks(`<div>${html}</div>`, sourceFile, exportRoot)
    .replace(/^<div>/i, "")
    .replace(/<\/div>\s*$/i, "");
}

function parseAssignmentXml(xmlText, sourceFile, exportRoot) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const title = getElementsByLocalName(xml, "title")[0]?.textContent?.trim() || "Assignment";
  const textNode = getElementsByLocalName(xml, "instructor_text")[0];
  const rawHtml = decodeHtmlEntities(textNode?.textContent || "");
  const textHtml = normalizeAssignmentHtml(rawHtml, sourceFile, exportRoot);
  const pointsRaw = getElementsByLocalName(xml, "gradable")[0]?.getAttribute("points_possible");
  const formatNodes = getElementsByLocalName(xml, "format");
  const textOnly = textHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const sentenceChunks = textOnly
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const taskSentence =
    sentenceChunks.find((chunk) => /\b(complete|submit|upload|click|make a copy)\b/i.test(chunk)) ||
    sentenceChunks[0] ||
    "";
  const reminderSentence =
    sentenceChunks.find((chunk) => /\b(refresher|remember|if you need)\b/i.test(chunk)) ||
    sentenceChunks[sentenceChunks.length - 1] ||
    "";

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
      submissionFormats: formatNodes
        .map((node) => node.getAttribute("type") || "")
        .filter(Boolean),
    },
    assignmentXml: {
      intro: rawHtml,
      task: taskSentence,
      reminder: reminderSentence,
      links,
    },
  };
}

function parseQuizXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const items = getElementsByLocalName(xml, "item");
  if (!items.length) return null;

  const questions = items
    .map((item, itemIndex) => {
      const matTexts = getElementsByLocalName(item, "mattext").map((el) => decodeHtmlEntities(el.textContent || ""));
      const question = matTexts[0] || `Quiz question ${itemIndex + 1}`;
      const choiceNodes = getElementsByLocalName(item, "response_label");
      const choices = choiceNodes.map((node) => {
        const text = getElementsByLocalName(node, "mattext")[0]?.textContent || "";
        return decodeHtmlEntities(text).replace(/<[^>]+>/g, "").trim();
      });

      const correctId = getElementsByLocalName(item, "respcondition")
        .find((node) => getElementsByLocalName(node, "setvar").length > 0)
        ?.getElementsByTagName("varequal")[0]
        ?.textContent?.trim();
      const choiceIds = choiceNodes.map((node) => node.getAttribute("ident"));
      const answerIndex = correctId ? Math.max(0, choiceIds.indexOf(correctId)) : 0;

      return {
        id: item.getAttribute("ident") || `item-${itemIndex + 1}`,
        question: question.replace(/<[^>]+>/g, "").trim(),
        choices: choices.filter(Boolean),
        answerIndex,
      };
    })
    .filter((question) => question.question && question.choices.length > 0);

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
      questionCount: questions.length,
    },
    quizSample: questions[0],
    quizQuestions: questions,
  };
}

function Badge({ children, className = "", ...props }) {
  return (
    <span
      {...props}
      className={`rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ${className}`.trim()}
    >
      {children}
    </span>
  );
}

function typeLabel(type) {
  const map = {
    assignment: "ASSIGNMENT",
    quiz: "QUIZ",
    pdf: "PDF",
    "embedded-video": "VIDEO",
    "image-slide": "SLIDE",
    "html-reading": "READING",
  };
  return map[type] || "RESOURCE";
}

function typeIcon(type) {
  const map = {
    assignment: ClipboardCheck,
    quiz: FileQuestion,
    pdf: FileBadge,
    "embedded-video": PlayCircle,
    "image-slide": FileImage,
    "html-reading": FileText,
  };
  return map[type] || FileText;
}

function formatLessonTitleForDisplay(lesson) {
  const rawTitle = String(lesson?.title || "").trim();
  if (!rawTitle) return rawTitle;

  // Normalize export-style module assessments:
  // "M4 Body Fluid Evidence Assessment" -> "Module 4 Assessment: Body Fluid Evidence"
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

  // Normalize export-style module titles:
  // "3 Trace Evidence" -> "Module 3: Trace Evidence"
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
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-sky-200 bg-sky-50 text-slate-900 shadow-sm"
          : "border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white"
      }`}
      data-testid="lesson-item"
      data-lesson-title={lesson.title}
      data-lesson-type={lesson.type}
      data-lesson-hidden={lesson.isHidden ? "true" : "false"}
      data-active={active ? "true" : "false"}
    >
      <div className="mt-0.5 shrink-0">
        {completed ? <CheckCircle2 className="h-4 w-4 text-sky-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <div className="truncate text-sm font-medium">{lesson.title}</div>
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{typeLabel(lesson.type)}</div>
      </div>
    </button>
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

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-html">
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {sections.length > 1 && (
          <>
            <button
              onClick={() => setSectionMode((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              data-testid="section-mode-toggle"
            >
              {sectionMode ? "Single flow" : "Section mode"}
            </button>
            {sectionMode && (
              <>
                <button
                  onClick={expandAll}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  data-testid="section-expand-all"
                >
                  Expand all
                </button>
                <button
                  onClick={collapseAll}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  data-testid="section-collapse-all"
                >
                  Collapse all
                </button>
              </>
            )}
          </>
        )}
      </div>
      {sectionMode && sections.length > 1 ? (
        <div className="space-y-3">
          {sections.map((section) => {
            const collapsed = !!collapsedSections[section.id];
            return (
              <div key={section.id} className="rounded-2xl border border-slate-200" data-testid="section-container">
                <button
                  onClick={() => setCollapsedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900">{section.title}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{collapsed ? "Expand" : "Collapse"}</span>
                </button>
                {!collapsed && (
                  <div
                    className="max-w-none border-t border-slate-200 px-4 py-4 text-slate-700 [&_.image-banner]:my-4 [&_.image-banner]:rounded-2xl [&_.image-banner]:border [&_.image-banner]:border-slate-200 [&_.image-banner]:bg-slate-50 [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-3 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="max-w-none text-slate-700 [&_.image-banner]:my-4 [&_.image-banner]:rounded-2xl [&_.image-banner]:border [&_.image-banner]:border-slate-200 [&_.image-banner]:bg-slate-50 [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-3 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}

function PdfRenderer({ meta, title, sourceUrl }) {
  const pages = meta?.pages || 1;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-pdf">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>{meta?.size || "PDF"}</Badge>
          <Badge>{pages} pages</Badge>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pages</div>
          <div className="space-y-2">
            {Array.from({ length: Math.min(pages, 6) }).map((_, i) => (
              <div
                key={i}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  i === 0 ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                Page {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <span>Page 1 of {pages}</span>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">Fit</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">−</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">+</button>
            </div>
          </div>
          {sourceUrl ? (
            <iframe
              src={sourceUrl}
              title={title}
              className="mx-auto min-h-[520px] w-full max-w-[760px] rounded-xl border border-slate-300 bg-white shadow-inner"
            />
          ) : (
            <div className="mx-auto flex min-h-[520px] max-w-[760px] items-center justify-center rounded-xl border border-slate-300 bg-white p-8 text-center text-sm leading-7 text-slate-500 shadow-inner">
              PDF page canvas would render here with real pagination, zoom, and outline support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideRenderer({ title }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-slide">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>responsive media</Badge>
          <Badge>zoom ready</Badge>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/95">
        <div className="flex min-h-[460px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_35%),linear-gradient(180deg,_#1e293b,_#020617)] p-10 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
              <FileImage className="h-7 w-7 text-sky-300" />
            </div>
            <h4 className="text-2xl font-semibold text-white">{title}</h4>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Original exported slide/image asset would render here with preserved visuals, zoom support, and optional caption treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentRenderer({ data, meta, title }) {
  const introHtml = data?.intro || "";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-assignment">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>{meta?.points || 0} pts</Badge>
          <Badge>{meta?.submissionType || "submission"}</Badge>
          {meta?.submissionFormats?.length > 1 && <Badge>{meta.submissionFormats.length} formats</Badge>}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          {introHtml ? (
            <div
              className="max-w-none [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          ) : (
            <p>No assignment instructions are available yet.</p>
          )}
          {(data?.individualized || data?.identified) && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">Individualized evidence</div>
                <p className="mt-2 text-emerald-950">{data?.individualized || "Not specified."}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-800">Identified evidence</div>
                <p className="mt-2 text-sky-950">{data?.identified || "Not specified."}</p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Assignment note</div>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Assignment submissions are managed outside this app flow. This view preserves assignment context only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizRenderer({ quiz, questions, meta }) {
  const parsedQuestions = questions?.length ? questions : quiz ? [quiz] : [];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [feedbackByQuestion, setFeedbackByQuestion] = useState({});
  const activeQuestion = parsedQuestions[questionIndex] || parsedQuestions[0];
  const activeQuestionId = activeQuestion?.id || `question-${questionIndex}`;
  const currentSelected = answersByQuestion[activeQuestionId];
  const showFeedback = !!feedbackByQuestion[activeQuestionId];
  const correct = currentSelected === activeQuestion?.answerIndex;
  const answeredCount = parsedQuestions.filter((question) => answersByQuestion[question.id] !== undefined).length;
  const correctCount = parsedQuestions.filter((question) => answersByQuestion[question.id] === question.answerIndex).length;

  const resetQuizAttempt = () => {
    setQuestionIndex(0);
    setAnswersByQuestion({});
    setFeedbackByQuestion({});
  };

  const generateQuizReport = () => {
    const safe = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
    const rows = parsedQuestions
      .map((question, idx) => {
        const selectedIndex = answersByQuestion[question.id];
        const selectedLabel = selectedIndex === undefined ? "Not answered" : question.choices?.[selectedIndex] || "Not answered";
        const result = selectedIndex === undefined ? "Pending" : selectedIndex === question.answerIndex ? "Correct" : "Incorrect";
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${safe(question.question || "Untitled question")}</td>
            <td>${safe(selectedLabel)}</td>
            <td>${result}</td>
          </tr>
        `;
      })
      .join("");
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
    resetQuizAttempt();
  }, [questions, quiz]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-quiz">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Assignments</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">Module assessment</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{parsedQuestions.length} questions</Badge>
          <Badge>{correctCount}/{parsedQuestions.length} correct</Badge>
          <Badge data-testid="quiz-progress">{answeredCount}/{parsedQuestions.length} answered</Badge>
        </div>
      </div>
      <div>
        <div>
          {parsedQuestions.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2" data-testid="quiz-question-nav">
              {parsedQuestions.map((question, idx) => (
                <button
                  key={question.id}
                  onClick={() => {
                    setQuestionIndex(idx);
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    questionIndex === idx ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"
                  }`}
                  data-testid="quiz-question-button"
                  data-current={questionIndex === idx ? "true" : "false"}
                >
                  Q{idx + 1} {answersByQuestion[question.id] !== undefined ? "•" : ""}
                </button>
              ))}
            </div>
          )}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${parsedQuestions.length ? (answeredCount / parsedQuestions.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm leading-7 text-slate-700">{activeQuestion?.question || "No quiz question parsed."}</p>
          <div className="mt-5 space-y-3">
            {activeQuestion?.choices?.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: idx }));
                  setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
                }}
                className={`w-full rounded-2xl border p-4 text-left text-sm transition ${
                  currentSelected === idx ? "border-sky-300 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
                }`}
                data-testid="quiz-answer-choice"
              >
                {choice}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: true }))}
              className="w-full rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
              data-testid="quiz-check-answer"
            >
              Check answer
            </button>
            <button
              onClick={() => {
                setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: undefined }));
                setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 sm:w-auto"
            >
              Clear answer
            </button>
            <button
              onClick={resetQuizAttempt}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 sm:w-auto"
            >
              Retake quiz
            </button>
            <button
              onClick={generateQuizReport}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 sm:w-auto"
            >
              Generate report
            </button>
            {parsedQuestions.length > 1 && (
              <button
                onClick={() => {
                  if (questionIndex < parsedQuestions.length - 1) {
                    setQuestionIndex((idx) => idx + 1);
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 sm:w-auto"
                data-testid="quiz-next-question"
              >
                Next question
              </button>
            )}
          </div>
          {showFeedback && currentSelected !== undefined && (
            <div className={`mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <div className={`text-sm font-semibold ${correct ? "text-emerald-800" : "text-rose-800"}`}>{correct ? "Correct" : "Wrong"}</div>
              <p className={`mt-2 text-sm leading-7 ${correct ? "text-emerald-950" : "text-rose-950"}`}>
                In the exported quiz, the correct answer is <strong>{activeQuestion?.choices?.[activeQuestion?.answerIndex]}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoRenderer({ title }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="renderer-video">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <Badge>responsive embed</Badge>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,_#0f172a,_#111827)]">
          <div className="text-center">
            <PlayCircle className="mx-auto h-14 w-14 text-sky-300" />
            <div className="mt-3 text-lg font-semibold text-white">{title}</div>
            <p className="mt-2 max-w-lg text-sm text-slate-300">The real build would embed the exported video page cleanly here instead of leaving it as an awkward detached Brightspace wrapper.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceFallback({ activeLesson, sourcePreview }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm" data-testid="renderer-fallback">
      <h4 className="text-lg font-semibold text-amber-950">Content unavailable in this view</h4>
      <p className="mt-3 text-sm leading-7 text-amber-900">
        This item is still part of the module, but this content type is not fully rendered yet.
      </p>
      <div className="mt-4 space-y-2 rounded-2xl border border-amber-200 bg-white p-4 text-xs text-slate-700">
        <div><strong>Type:</strong> {typeLabel(activeLesson?.type)}</div>
        {sourcePreview?.error && <div><strong>Status:</strong> Rendering is still in progress for this item.</div>}
      </div>
    </div>
  );
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

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="quick-checkpoints">
      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Quick checkpoints</div>
      <div className="mt-4 space-y-4">
        {prompts.map((prompt, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Checkpoint {idx + 1}</div>
            <p className="mt-2 text-sm leading-7 text-slate-700">{prompt}</p>
            <button
              onClick={() => setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }))}
              className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {revealed[idx] ? "Hide self-check" : "Show self-check"}
            </button>
            {revealed[idx] && (
              <p className="mt-3 text-xs leading-6 text-slate-600">
                Self-check against the lesson content before marking complete.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function renderNodePreview(activeLesson, sourcePreview) {
  const isSourceCritical = ["html-reading", "pdf", "assignment", "quiz"].includes(activeLesson.type);

  if (isSourceCritical && sourcePreview?.status === "loading") {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">Loading content...</div>;
  }

  if (isSourceCritical && sourcePreview?.status === "error") {
    return <SourceFallback activeLesson={activeLesson} sourcePreview={sourcePreview} />;
  }

  if (activeLesson.type === "html-reading") {
    const html = sourcePreview?.kind === "html" ? sourcePreview.html : activeLesson.htmlSample;
    if (html) return <HtmlRenderer html={html} />;
  }
  if (activeLesson.type === "pdf") {
    const sourceUrl = sourcePreview?.kind === "pdf" ? sourcePreview.url : undefined;
    return <PdfRenderer meta={activeLesson.pdfMeta} title={activeLesson.title} sourceUrl={sourceUrl} />;
  }
  if (activeLesson.type === "image-slide") return <SlideRenderer title={activeLesson.title} />;
  if (activeLesson.type === "assignment") {
    const parsedData = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentXml : activeLesson.assignmentXml;
    const parsedMeta = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentMeta : activeLesson.assignmentMeta;
    return <AssignmentRenderer data={parsedData} meta={parsedMeta} title={activeLesson.title} />;
  }
  if (activeLesson.type === "quiz") {
    const quiz = sourcePreview?.kind === "quiz" ? sourcePreview.quizSample : activeLesson.quizSample;
    const questions = sourcePreview?.kind === "quiz" ? sourcePreview.quizQuestions : activeLesson.quizQuestions;
    const meta = sourcePreview?.kind === "quiz" ? sourcePreview.quizMeta : activeLesson.quizMeta;
    return <QuizRenderer quiz={quiz} questions={questions} meta={meta} />;
  }
  if (activeLesson.type === "embedded-video") return <VideoRenderer title={activeLesson.title} />;
  return <SourceFallback activeLesson={activeLesson} sourcePreview={sourcePreview} />;
}

function ChapterLessonCard({ lesson }) {
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
      const candidates = [joinPath(exportRoot, sourcePath), sourcePath].filter(Boolean);

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

          if (!cancelled) {
            setSourcePreview({ status: "ready", kind: "text", text, sourcePath: candidate });
          }
          return;
        } catch {
          // Keep trying the next candidate path.
        }
      }

      if (!cancelled) {
        setSourcePreview({
          status: "error",
          kind: null,
          error: "Unable to load content preview.",
        });
      }
    }

    loadSourcePreview();
    return () => {
      cancelled = true;
    };
  }, [lesson?.id, lesson?.sourceFile, lesson?.type]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {lesson.type !== "html-reading" ? <Badge>{typeLabel(lesson.type)}</Badge> : null}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{formatLessonTitleForDisplay(lesson)}</h3>
      <div className="mt-6">{renderNodePreview(lesson, sourcePreview)}</div>
    </section>
  );
}

export default function ForensicCoursePlayerPreviewRestored() {
  const [activeChapterId, setActiveChapterId] = useState(resolvedModules[0]?.id ?? "");
  const [chapterVisited, setChapterVisited] = useState({});
  const [query, setQuery] = useState("");
  const [includeHidden, setIncludeHidden] = useState(false);
  const [isChapterMenuCollapsed, setIsChapterMenuCollapsed] = useState(false);

  const filteredModules = resolvedModules
    .filter((module) => includeHidden || !module.isHidden)
    .map((module) => ({
      ...module,
      lessons: module.lessons,
    }))
    .filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0);

  const shouldFallbackToSeed = query.length === 0 && filteredModules.length === 0 && resolvedModules.length > 0;
  const effectiveModules = shouldFallbackToSeed ? resolvedModules : filteredModules;
  const fallbackCourse = useMemo(() => buildCourseFromD2LMap(courseSeed, d2lCourseMapData), []);
  const fallbackModules = fallbackCourse?.modules?.length ? fallbackCourse.modules : courseSeed.modules;
  const fallbackFilteredModules = useMemo(
    () =>
      fallbackModules
        .filter((module) => includeHidden || !module.isHidden)
        .map((module) => ({
          ...module,
          lessons: module.lessons,
        }))
        .filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0),
    [fallbackModules, includeHidden, query]
  );
  const shouldUseFallbackCourse = query.length === 0 && effectiveModules.length === 0 && fallbackFilteredModules.length > 0;
  const finalModules = shouldUseFallbackCourse ? fallbackFilteredModules : effectiveModules;
  const emergencyModule = {
    id: "e2e-seed",
    title: "E2E Seed Module",
    lessonCount: 1,
    lessons: [],
  };
  const safeModules = finalModules.length > 0 ? finalModules : fallbackFilteredModules.length > 0 ? fallbackFilteredModules : [emergencyModule];
  const activeChapter = useMemo(
    () => safeModules.find((module) => module.id === activeChapterId) || safeModules[0],
    [activeChapterId, safeModules]
  );
  const chapterLessonGroups = useMemo(() => {
    const moduleTwoExcludedTitles = new Set([
      "evidence and fingerprints online activity (optional)",
    ]);
    const isUnitAssessmentSection = (title) => (title || "").trim().toLowerCase().includes("unit assessment");
    const isModuleTwo = (activeChapter?.title || "").toLowerCase().includes("types of evidence and fingerprint analysis");
    const normalizedLessons = (activeChapter?.lessons || [])
      .filter((lesson) => !isUnitAssessmentSection(lesson.title))
      .filter((lesson) => {
        if (!isModuleTwo) return true;
        return !moduleTwoExcludedTitles.has((lesson.title || "").trim().toLowerCase());
      })
      .map((lesson) => ({
        ...lesson,
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden,
      }));
    return {
      contentLessons: normalizedLessons.filter((lesson) => lesson.type !== "quiz" && lesson.type !== "assignment"),
      assignmentLessons: normalizedLessons.filter((lesson) => lesson.type === "quiz"),
    };
  }, [activeChapter]);
  const chapterLessons = chapterLessonGroups.contentLessons;
  const chapterAssignments = chapterLessonGroups.assignmentLessons;
  const progress = safeModules.length
    ? Math.round((Object.values(chapterVisited).filter(Boolean).length / safeModules.length) * 100)
    : 0;

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
    setChapterVisited((prev) => ({ ...prev, [activeChapter.id]: true }));
  }, [activeChapter?.id]);

  if (!activeChapter) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 text-slate-700">
        No chapters were mapped from the D2L course map yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_35%,_#eef2ff_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 h-screen shrink-0 overflow-hidden border-r border-slate-200/80 bg-white/80 backdrop-blur transition-[width] duration-200 ${
            isChapterMenuCollapsed ? "w-16" : "w-[340px]"
          }`}
          data-testid="chapter-menu-panel"
          data-collapsed={isChapterMenuCollapsed ? "true" : "false"}
        >
          <div className={`border-b border-slate-200 ${isChapterMenuCollapsed ? "px-2 py-4" : "px-5 py-5"}`}>
            <div className={`mb-3 flex ${isChapterMenuCollapsed ? "justify-center" : "items-start justify-between gap-3"}`}>
              {!isChapterMenuCollapsed ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Course</div>
                  <h1 className="mt-1 text-xl font-semibold">{resolvedCourse.title}</h1>
                </div>
              ) : null}
              <button
                onClick={() => setIsChapterMenuCollapsed((prev) => !prev)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${
                  isChapterMenuCollapsed
                    ? "border-sky-200 bg-sky-600 text-white hover:bg-sky-500"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                data-testid="chapter-menu-toggle"
                aria-expanded={isChapterMenuCollapsed ? "false" : "true"}
                aria-label={isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu"}
                title={isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu"}
              >
                <span className="flex flex-col gap-1.5">
                  <span className={`block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-white" : "bg-slate-700"}`} />
                  <span className={`block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-white" : "bg-slate-700"}`} />
                  <span className={`block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-white" : "bg-slate-700"}`} />
                </span>
              </button>
            </div>
            {isChapterMenuCollapsed ? null : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Preview progress</span>
                <span className="font-semibold text-slate-900">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="rounded-xl bg-slate-50 p-2">{resolvedCourse.stats.topLevelSections} sections</div>
                <div className="rounded-xl bg-slate-50 p-2">{resolvedCourse.stats.totalNodes} nodes</div>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chapter titles"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-300"
                data-testid="lesson-search"
              />
            </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Visibility</div>
                <div className="text-xs text-slate-500" data-testid="mode-indicator">
                  {includeHidden ? "Archive mode" : "Learner mode"}
                </div>
              </div>
              <button
                onClick={() => setIncludeHidden((prev) => !prev)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  includeHidden ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                }`}
                data-testid="mode-toggle"
              >
                {includeHidden ? "Hide admin-only" : "Show archive"}
              </button>
                </div>
              </>
            )}
          </div>

          <div
            className={`${isChapterMenuCollapsed ? "hidden" : "h-[calc(100vh-245px)] overflow-y-auto px-3 py-4"}`}
            data-testid="module-list"
          >
            {safeModules.map((module) => {
              const isActive = module.id === activeChapter.id;
              return (
                <div
                  key={module.id}
                  className="mb-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
                  data-testid="module-panel"
                  data-module-title={module.title}
                  data-module-hidden={module.isHidden ? "true" : "false"}
                  data-module-expanded={isActive ? "true" : "false"}
                >
                  <button
                    onClick={() => setActiveChapterId(module.id)}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                    data-testid="module-toggle"
                    data-module-title={module.title}
                    data-expanded={isActive ? "true" : "false"}
                  >
                    <div>
                      <div className="text-sm font-semibold">{formatModuleTitleForDisplay(module.title)}</div>
                      <div className="text-xs text-slate-500">{module.lessonCount} items in export</div>
                      {module.lessons?.some((lesson) => lesson.type === "quiz") ? (
                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Assignments available</div>
                      ) : null}
                    </div>
                    {module.isHidden && <Badge>hidden module</Badge>}
                    {isActive ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur">
            <div className="px-8 py-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{formatModuleTitleForDisplay(activeChapter.title)}</span>
                {includeHidden && <Badge>archive mode</Badge>}
                {activeChapter.isHidden && <Badge>admin-only</Badge>}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950" data-testid="lesson-title">
                {formatModuleTitleForDisplay(activeChapter.title)}
              </h2>
              {chapterAssignments.length > 0 ? (
                <a
                  href="#module-assignments"
                  className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Jump to assignments
                </a>
              ) : null}
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="space-y-6">
              {chapterLessons.length === 0 ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">No learner content in this chapter yet</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    Assignment-only chapters are intentionally hidden in this app surface. Learning content is preserved and can be added here later.
                  </p>
                </section>
              ) : null}
              {chapterLessons.map((lesson) => (
                <ChapterLessonCard key={lesson.id} lesson={lesson} />
              ))}
              {chapterAssignments.length > 0 ? (
                <section id="module-assignments" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">Assignments</h3>
                    <Badge>{chapterAssignments.length} assessments</Badge>
                  </div>
                  <div className="space-y-6">
                    {chapterAssignments.map((lesson) => (
                      <ChapterLessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const __canvasHelperRootElement = document.getElementById("root");
if (__canvasHelperRootElement) {
  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(<ForensicCoursePlayerPreviewRestored />);
}
