import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

import { load } from "cheerio";

import d2lCourseMapData from "../projects/forensics/workspace/d2l-map-data.js";

const PROJECT_SLUG = "forensicstudiesoption2";
const REPO_ROOT = process.cwd();
const WORKSPACE_DIR = path.join(REPO_ROOT, "projects", PROJECT_SLUG, "workspace");
const COURSE_DATA_PATH = path.join(WORKSPACE_DIR, "course-data.js");
const MODULE_CONTENT_DIR = path.join(WORKSPACE_DIR, "content");
const WORKSPACE_REFERENCE_DIR = path.join(WORKSPACE_DIR, "references", "forensics");
const EXPORT_ROOT_DIR = path.join(
  REPO_ROOT,
  "projects",
  "resources",
  "forensics",
  String(d2lCourseMapData.exportRoot || "")
);
const EXPORT_ROOT_RELATIVE = normalizePath(String(d2lCourseMapData.exportRoot || ""));
const mirroredReferencePaths = new Set<string>();

type ModuleNode = {
  id?: string;
  title?: string;
  kind?: string;
  depth?: number;
  resource?: { hrefs?: string[] };
  children?: ModuleNode[];
};

type CourseData = {
  course?: Record<string, unknown>;
  chapters?: Array<Record<string, any>>;
  quizzes?: Array<Record<string, any>>;
  assignments?: Array<Record<string, any>>;
  library?: Array<Record<string, any>>;
};

type AssignmentBrief = {
  title: string;
  summary: string;
  instructionHtml?: string;
  individualized?: string;
  identified?: string;
  sourcePath?: string;
};

type LessonCard = {
  componentId: string;
  title: string;
  kindLabel: string;
  sourceRelativePath?: string;
  sourceUrl?: string;
  bodyHtml?: string;
  excerpt?: string;
};

const ASSIGNMENT_BRIEF_TEMPLATES: Record<
  string,
  Partial<AssignmentBrief> & { points?: number }
> = {
  "introduction to crime scenes assignment": {
    summary:
      "Review Locard's Exchange Principle and apply it to the introductory crime scene case.",
    instructionHtml: [
      "<p>Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>",
      "<p>Use your assignment template or workbook instructions, add your name, and complete each required response section.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "types of evidence and fingerprint analysis assignment": {
    summary:
      "After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.",
    instructionHtml: [
      "<p>After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.</p>",
      "<p>Complete the assignment, make your own copy of the linked document, add your name, and submit the file below.</p>"
    ].join(""),
    individualized:
      "Individualized Physical Evidence is unique and can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, dental impressions.",
    identified:
      "Identified Physical Evidence shares a common source and can be grouped into a class of items having similar properties. Examples: clothing, shoe prints, blood type."
  },
  "fingerprint case studies assignment": {
    summary:
      "Fingerprint analysis has been used in many crime scenes as individualized evidence to tie a suspect to a crime scene. You will examine some of these historical cases in the following assignment.",
    instructionHtml: [
      "<p>Fingerprint analysis has been used in many crime scenes as individualized evidence to tie a suspect to a crime scene. You will examine some of these historical cases in the following assignment.</p>",
      "<p>Complete the following assignment about using fingerprint analysis to solve crimes. If you need a refresher on how to cite sources, please check out the <strong>How to Cite Sources</strong> tab in the Course Information section. Add your name before submitting.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "trace evidence assignment": {
    summary:
      "Hair and fiber evidence has been used in many cases to connect suspects with a crime, even though some of those cases were later revisited with DNA evidence.",
    instructionHtml: [
      "<p>Hair and fiber evidence has been used in many cases in the past to connect suspects with a crime. Occasionally, these cases are overturned with DNA evidence in the future.</p>",
      "<p>Despite this, trace evidence such as hair and fiber has many valuable uses in solving crimes. Examine the trace evidence examples and complete the assignment response.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "trace evidence case studies assignment": {
    summary:
      "Microscopic evidence at a crime scene is called trace evidence. Hair and fiber are examples of this type of evidence and they can be valuable in an investigation.",
    instructionHtml: [
      "<p>Microscopic evidence at a crime scene is called Trace Evidence. Hair and fiber are examples of this type of evidence and they can be valuable in an investigation.</p>",
      "<p>Although most hair and fiber are identified and not individualized, they can still be used in court to support cases. Use the case studies to explain how trace evidence supports or limits each conclusion.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "body fluid assignment": {
    summary:
      "Body fluid evidence is one of the most common pieces of evidence that can be found at a crime scene, especially when a violent crime has occurred.",
    instructionHtml: [
      "<p>Body fluid evidence is one of the most common pieces of evidence that can be found at a crime scene, especially when a violent crime has occurred.</p>",
      "<p>This evidence can be extremely useful in helping investigators piece together the events of a crime. In this assignment you will demonstrate your understanding of body fluid evidence.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "body fluid evidence case studies assignment": {
    summary:
      "There are a number of historical case studies where blood stain and/or spatter evidence was used to successfully solve a crime and convict the perpetrator.",
    instructionHtml: [
      "<p>There are a number of historical case studies where blood stain and/or spatter evidence was used to successfully solve a crime and convict the perpetrator.</p>",
      "<p>Demonstrate your understanding of forensic serology by completing the following assignment and case study work.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "impaired driving assignment": {
    summary:
      "Impaired driving is a crime that kills and injures too many Canadians each year.",
    instructionHtml: [
      "<p>Impaired driving is a crime that kills and injures too many Canadians each year. The tools and training that police officers use are important in the prevention of more accidents.</p>",
      "<p>In this unit you explored many of the useful tools that police use to detect impaired driving. Demonstrate your understanding of these tools in the assignment below.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "polygraphing and forensic writing analysis assignment": {
    summary:
      "Polygraphing is a common tool used by investigators. Although controversial, it still has value when investigators are trying to solve crimes.",
    instructionHtml: [
      "<p>Polygraphing is a common tool used by investigators. Although it has been controversial, it has undeniable value to investigators when trying to solve crimes.</p>",
      "<p>Writing analysis is another common investigative tool that has been used to solve a number of crimes. In the assignment below, you will demonstrate your understanding of these forensic techniques.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "polygraphing and forensic writing case studies assignment": {
    summary:
      "Writing analysis is another investigative tool that has been used to solve a number of crimes.",
    instructionHtml: [
      "<p>Use the case studies to explain how polygraphing and writing analysis can support or complicate an investigation.</p>",
      "<p>Revisit the evidence sets and document details from the lesson sequence before you complete the assignment response.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "forensic dna evidence assignment": {
    summary:
      "Forensic DNA Analysis has been one of the most powerful and important tools that investigators use today.",
    instructionHtml: [
      "<p>Forensic DNA Analysis has been one of the most powerful and important tools that investigators use today.</p>",
      "<p>It can give strong evidence for a suspect's guilt or innocence and is an indispensable tool in the forensic world. The assignment below will allow you to demonstrate your understanding of DNA analysis in the context of forensic investigations.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  },
  "careers in forensic science assignment": {
    summary:
      "Forensic science includes many different career paths, and each one uses a different mix of skills.",
    instructionHtml: [
      "<p>Forensic science includes many different career paths, and each one uses a different mix of skills. In this interactive assignment, you will work through short scenarios, compare your preferences, and see which forensic career best matches your strengths.</p>",
      "<p>Use the result as a starting point for reflection. Think about what kind of evidence, work setting, and pace fit you best, then compare that result with the careers described in the lesson.</p>",
      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>"
    ].join("")
  }
};

const COURSE_SUBTITLE = "Forensic Studies 25 content, assignments, and quizzes.";
const EXCLUDED_VISIBLE_MODULE_TITLES = new Set([
  "Course Information",
  "Extra Credits",
  "Teacher Resources (KEEP HIDDEN)"
]);

const CHAPTER_SUMMARY_OVERRIDES: Record<string, string> = {
  "chapter-1": "Study how investigators secure, scan, sketch, search, and document crime scenes.",
  "chapter-2": "Learn how evidence is classified, analyzed, and connected through fingerprint work and case studies.",
  "chapter-3": "Examine hair, fibre, glass, and other trace evidence and how investigators compare them in real cases.",
  "chapter-4": "Review body-fluid evidence, serology methods, and how investigators interpret blood evidence at crime scenes.",
  "chapter-5": "Follow the tools, procedures, and evidence used to detect impaired driving.",
  "chapter-6": "Explore polygraphing, questioned documents, and how investigators use writing analysis in case work.",
  "chapter-7": "Learn how DNA profiling, genetics, and population data support forensic investigations.",
  "chapter-8": "Compare forensic career paths and reflect on which roles fit your strengths and interests.",
  "chapter-9": "Complete the final assessment covering the major forensic concepts from the course.",
  "chapter-10": "Work through the optional extra-credit assessment tied to the course review material."
};

const MODULE_ONE_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "introduction to crime scenes assignment"
]);

const MODULE_TWO_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "evidence and fingerprints online activity (optional)",
  "types of evidence and fingerprint analysis assignment",
  "fingerprint case studies assignment"
]);

const MODULE_THREE_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "trace evidence assignment",
  "trace evidence case studies assignment"
]);

const MODULE_FOUR_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "body fluid assignment",
  "body fluid evidence case studies assignment"
]);

const MODULE_FIVE_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "impaired driving assignment"
]);

const MODULE_SIX_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "polygraphing and forensic writing analysis assignment",
  "polygraphing and forensic writing case studies assignment"
]);

const MODULE_SEVEN_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "forensic dna evidence assignment"
]);

const MODULE_EIGHT_EXCLUDED_ASSIGNMENT_TITLES = new Set([
  "careers in forensic science assignment"
]);

function normalizePath(value: string): string {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/Ñontent/g, "сontent")
    .replace(/^content\//, "сontent/")
    .replace(/\/content\//g, "/сontent/");
}

function dirname(value: string): string {
  const normalized = normalizePath(value);
  const lastSlash = normalized.lastIndexOf("/");
  return lastSlash >= 0 ? normalized.slice(0, lastSlash) : "";
}

function joinPath(base: string, next: string): string {
  if (!base) return normalizePath(next);
  if (!next) return normalizePath(base);
  return normalizePath(`${base.replace(/\/+$/, "")}/${next.replace(/^\/+/, "")}`);
}

function decodePathValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function stripModuleNumber(value: string): string {
  return String(value || "")
    .replace(/^\d+\s+/, "")
    .trim();
}

function buildQuizSummary(chapter: Record<string, any>, quiz: Record<string, any>) {
  const quizTitle = String(quiz?.title || "");
  if (/final exam/i.test(quizTitle)) {
    return "Comprehensive course assessment covering the major forensic concepts from the full course.";
  }
  if (/extra credits?/i.test(quizTitle)) {
    return "Optional extra-credit assessment tied to the course review material.";
  }

  const topic = stripModuleNumber(String(chapter?.title || quizTitle));
  return topic
    ? `Assessment covering the ${topic.toLowerCase()} module.`
    : "Assessment covering the module content.";
}

function summarizeAssignmentTemplate(template: Partial<AssignmentBrief>, fallback: string) {
  if (template.summary) return template.summary;
  if (template.instructionHtml) return excerptText(template.instructionHtml, 180);
  return fallback;
}

function resolveRelativePath(baseFile: string, relativeValue: string): string {
  if (!relativeValue) return relativeValue;
  if (/^(https?:|data:|#|mailto:|tel:)/i.test(relativeValue)) return relativeValue;
  const decodedRelative = decodePathValue(relativeValue);
  if (decodedRelative.startsWith("/")) return decodedRelative;

  const [pathPart, suffix = ""] = decodedRelative.split(/([?#].*)/, 2);
  const baseDir = dirname(baseFile);
  const combined = joinPath(baseDir, pathPart);
  const parts: string[] = [];

  combined.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      parts.pop();
      return;
    }
    parts.push(part);
  });

  return `${parts.join("/")}${suffix}`;
}

function encodeReferencePath(relativePath: string): string {
  return normalizePath(relativePath)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function registerMirroredReference(relativePath: string): string | null {
  const existingRelative = findExistingRelativeFile(relativePath);
  if (!existingRelative) return null;
  mirroredReferencePaths.add(existingRelative);
  return existingRelative;
}

function buildReferenceUrl(relativePath: string, context: "root" | "chapter" = "root"): string {
  const mirroredRelative = registerMirroredReference(relativePath);
  if (!mirroredRelative) return "";
  const prefix = context === "chapter" ? "../../references/forensics" : "./references/forensics";
  return `${prefix}/${encodeReferencePath(mirroredRelative)}`;
}

function buildSyntheticAssignmentDefinition(moduleTitle: string) {
  const titleLower = String(moduleTitle || "").toLowerCase();
  const moduleOneLocardImage = buildReferenceUrl(
    "assignment/i85281f98-0aa9-4147-93a9-d14de5638519/Content/Locard Research.jpeg"
  );
  const moduleThreeTraceImage = buildReferenceUrl(
    "assignment/ia4effbb5-11e6-405e-a610-94c25bdcd18e/Content/hair evidence.jpg"
  );
  const moduleFourCaseStudiesImage = buildReferenceUrl(
    "assignment/i16176291-5154-45bd-8891-b2c9517b1a3c/Content/170829-F-DB515-0024.JPG"
  );
  const moduleSixPolygraphImage = buildReferenceUrl(
    "assignment/i5416ee1b-c173-4bcc-80e8-e3c1fae36848/Content/3034903278_5ef70f6f09_b.jpg"
  );
  const moduleThreeCaseStudiesImage =
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/CSIRO_ScienceImage_8115_Human_hair_and_Merino_wool_fibre.jpg";

  if (titleLower.includes("introduction to crime scenes")) {
    return {
      title: "Crime Scene Certification Lab",
      introHtml: [
        '<div class="space-y-5">',
        "<p>Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>",
        moduleOneLocardImage
          ? `<p style="text-align:center;"><img src="${moduleOneLocardImage}" alt="Locard Research reference image" width="520" class="img-responsive atto_image_button_text-bottom"></p>`
          : "",
        "<p>Use your assignment template or workbook instructions, add your name, and complete each required response section.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("types of evidence and fingerprint analysis")) {
    return {
      title: "Fingerprint Analysis Interactive Assignment",
      introHtml: [
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
      ].join("")
    };
  }

  if (titleLower.includes("trace evidence")) {
    return {
      title: "Trace Evidence Lab Assignment",
      introHtml: [
        "<div>",
        `<p style="text-align: center;"><img src="${moduleThreeCaseStudiesImage}" alt="Image result for hair microscope" width="501" height="401" class="img-responsive atto_image_button_text-bottom"></p>`,
        "<p>Hair and fiber evidence has been used in many cases in the past to connect suspects with a crime. Occasionally, these cases are overturned with DNA evidence in the future. Despite this, trace evidence such as hair and fiber has many valuable uses in solving crimes. The following assignment will have you examine some of these cases.</p>",
        moduleThreeTraceImage
          ? `<p style="text-align: center;"><img src="${moduleThreeTraceImage}" alt="hair evidence" width="500" height="333" class="img-responsive atto_image_button_text-bottom"></p>`
          : "",
        "<p>Microscopic evidence at a crime scene is called Trace Evidence. Hair and fiber are examples of this type of evidence and they can be valuable in an investigation. Although most hair and fiber are identified and not individualized, they can still be used in court to support cases.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("body fluid evidence")) {
    return {
      title: "Body Fluid Analysis Lab Assignment",
      introHtml: [
        "<div>",
        "<p>Body fluid evidence is one of the most common pieces of evidence that can be found at a crime scene, especially when a violent crime has occurred. This evidence can be extremely useful in helping investigators piece together the events of a crime. In this assignment you will demonstrate your understanding of body fluid evidence.</p>",
        moduleFourCaseStudiesImage
          ? `<p style="text-align: center;"><img src="${moduleFourCaseStudiesImage}" alt="blood evidence" width="500" height="334" class="img-responsive atto_image_button_text-bottom"></p>`
          : "",
        "<p>There are a number of historical case studies where blood stain and/or spatter evidence was used to successfully solve a crime and convict the perpetrator(s). Demonstrate your understanding of forensic serology by completing the following assignment.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("forensic detection of impaired driving")) {
    return {
      title: "Impaired Driving Assignment Lab",
      introHtml: [
        "<div>",
        "<p>Impaired driving is a crime that kills and injures too many Canadians each year. The tools and training that police officers use are important in the prevention of more accidents. In this unit you explored many of the useful tools that police use to detect impaired driving. Demonstrate your understanding of these tools in the assignment below.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("polygraphing and document analysis")) {
    return {
      title: "Polygraph and Document Analysis Lab",
      introHtml: [
        "<div>",
        moduleSixPolygraphImage
          ? `<p style="text-align: center;"><img src="${moduleSixPolygraphImage}" alt="polygraph" width="501" height="333" class="img-responsive atto_image_button_text-bottom"></p>`
          : "",
        "<p>Polygraphing is a common tool used by investigators. Although it has been controversial, it has undeniable value to investigators when trying to solve crimes. Writing analysis is another common investigative tool that has been used to solve a number of crimes. In the assignment below, you will demonstrate your understanding of these forensic techniques.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("forensic genetics")) {
    return {
      title: "Forensic Genetics Lab Assignment",
      introHtml: [
        "<div>",
        '<p style="text-align: center;"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Agarose_gel_slab_for_DNA_Analysis%2C_after_the_Electrophoresis_run.jpg" alt="Image result for DNA analysis" width="399" height="263" class="img-responsive atto_image_button_text-bottom"></p>',
        "<p>Forensic DNA Analysis has been one of the most powerful and important tools that investigators use today. It can give strong evidence for a suspect's guilt or innocence and is an indispensable tool in the forensic world. The assignment below will allow you to demonstrate your understanding of DNA analysis in the context of forensic investigations.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  if (titleLower.includes("careers in forensic science")) {
    return {
      title: "Career Path Simulation Lab",
      introHtml: [
        "<div>",
        "<p>Forensic science includes many different career paths, and each one uses a different mix of skills. In this interactive assignment, you will work through short scenarios, compare your preferences, and see which forensic career best matches your strengths.</p>",
        "<p>Use the result as a starting point for reflection. Think about what kind of evidence, work setting, and pace fit you best, then compare that result with the careers described in the lesson.</p>",
        "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",
        "</div>"
      ].join("")
    };
  }

  return null;
}

function buildRelativeCandidates(relativePath: string): string[] {
  const normalized = normalizePath(relativePath);
  const withContent = normalized.replace(/^сontent\//, "content/");
  const withLegacy = normalized.replace(/^сontent\//, "Ñontent/");
  return Array.from(new Set([normalized, withContent, withLegacy]));
}

function findExistingRelativeFile(relativePath: string): string | null {
  for (const candidate of buildRelativeCandidates(relativePath)) {
    const absolute = path.join(EXPORT_ROOT_DIR, ...candidate.split("/"));
    if (existsSync(absolute)) {
      return candidate;
    }
  }
  return null;
}

function flattenNodes(nodes: ModuleNode[] = []): ModuleNode[] {
  const results: ModuleNode[] = [];
  for (const node of nodes) {
    results.push(node);
    if (node.children?.length) {
      results.push(...flattenNodes(node.children));
    }
  }
  return results;
}

function filterModuleNodesForWorkspace(moduleTitle: string, nodes: ModuleNode[] = []): ModuleNode[] {
  const titleLower = String(moduleTitle || "").toLowerCase();
  const isModuleOne = titleLower.includes("introduction to crime scenes");
  const isModuleTwo = titleLower.includes("types of evidence and fingerprint analysis");
  const isModuleThree = titleLower.includes("trace evidence");
  const isModuleFour = titleLower.includes("body fluid evidence");
  const isModuleFive = titleLower.includes("forensic detection of impaired driving");
  const isModuleSix = titleLower.includes("polygraphing and document analysis");
  const isModuleSeven = titleLower.includes("forensic genetics");
  const isModuleEight = titleLower.includes("careers in forensic science");

  return nodes
    .filter((node) => !String(node?.title || "").trim().toLowerCase().includes("unit assessment"))
    .filter((node) => {
      const normalizedTitle = String(node?.title || "").trim().toLowerCase();
      if (isModuleOne) return !MODULE_ONE_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleTwo) return !MODULE_TWO_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleThree) return !MODULE_THREE_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleFour) return !MODULE_FOUR_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleFive) return !MODULE_FIVE_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleSix) return !MODULE_SIX_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleSeven) return !MODULE_SEVEN_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      if (isModuleEight) return !MODULE_EIGHT_EXCLUDED_ASSIGNMENT_TITLES.has(normalizedTitle);
      return true;
    });
}

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toComponentId(value: string, index: number): string {
  const base = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return `component-${index + 1}${base ? `-${base}` : ""}`;
}

function normalizeSourceText(value: string): string {
  const raw = String(value || "");
  const repairCandidate = /[ÃâÂ]/.test(raw)
    ? Buffer.from(raw, "latin1").toString("utf8")
    : raw;
  const score = (input: string) => (input.match(/[ÃâÂ�]/g) || []).length;
  const repaired = score(repairCandidate) < score(raw) ? repairCandidate : raw;

  return repaired
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/…/g, "...")
    .replace(/Â/g, "");
}

function stripTagsToText(value: string): string {
  const $ = load(`<div>${normalizeSourceText(value || "")}</div>`);
  return $.text().replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function excerptText(value: string, maxLength = 180): string {
  const plain = stripTagsToText(value);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).replace(/\s+\S*$/, "").trim()}...`;
}

function buildMissingImageFallback(label?: string): string {
  const text = (label || "").trim() || "Source image unavailable";
  return `<span class="lesson-media-missing" role="img" aria-label="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
}

function rewriteHtmlAssetLinks(rawHtml: string, sourceRelativePath: string): string {
  const $ = load(rawHtml, { decodeEntities: false });
  const root = $("body").length ? $("body") : $.root();

  root.find("script, style, link[rel='stylesheet'], meta, title, head, noscript").remove();
  root.find("[aria-hidden='true'], .sr-only, .visually-hidden").remove();

  root.find("*").each((_index, element) => {
    const attributes = Object.keys(element.attribs || {});
    attributes.forEach((name) => {
      if (/^on/i.test(name)) {
        $(element).removeAttr(name);
      }
    });
  });

  const rewriteAttribute = (selector: string, attribute: string) => {
    root.find(selector).each((_index, element) => {
      const rawValue = $(element).attr(attribute);
      if (!rawValue) return;
      if (/^(https?:|data:|#|mailto:|tel:)/i.test(rawValue)) return;

      const resolved = resolveRelativePath(sourceRelativePath, rawValue);
      if (!resolved || resolved.startsWith("/")) return;
      const existingRelative = findExistingRelativeFile(resolved);
      if (!existingRelative) return;
      const localUrl = buildReferenceUrl(existingRelative, "chapter");
      if (!localUrl) return;
      $(element).attr(attribute, localUrl);
    });
  };

  root.find("img[src]").each((_index, element) => {
    const rawValue = $(element).attr("src");
    if (!rawValue) return;

    const altText = stripTagsToText($(element).attr("alt") || $(element).attr("title") || "");
    if (/^https?:/i.test(rawValue)) {
      $(element).attr("referrerpolicy", "no-referrer");
      $(element).attr("data-fallback-label", altText || "Source image unavailable");
      $(element).attr("loading", "lazy");
      $(element).attr("decoding", "async");
      return;
    }

    if (/^(data:|#|mailto:|tel:)/i.test(rawValue)) {
      return;
    }

    const resolved = resolveRelativePath(sourceRelativePath, rawValue);
    if (!resolved || resolved.startsWith("/")) {
      $(element).attr("loading", "lazy");
      $(element).attr("decoding", "async");
      return;
    }

    const existingRelative = findExistingRelativeFile(resolved);
    if (!existingRelative) {
      $(element).replaceWith(buildMissingImageFallback(altText));
      return;
    }

    const localUrl = buildReferenceUrl(existingRelative, "chapter");
    if (!localUrl) {
      $(element).replaceWith(buildMissingImageFallback(altText));
      return;
    }

    $(element).attr("src", localUrl);
    $(element).attr("data-fallback-label", altText || "Source image unavailable");
    $(element).attr("loading", "lazy");
    $(element).attr("decoding", "async");
  });

  rewriteAttribute("a[href]", "href");
  rewriteAttribute("source[src]", "src");
  rewriteAttribute("iframe[src]", "src");
  rewriteAttribute("video[src]", "src");
  rewriteAttribute("object[data]", "data");

  root.find("table").each((_index, element) => {
    const parent = $(element).parent();
    if (!parent.hasClass("lesson-table-wrap")) {
      $(element).wrap('<div class="lesson-table-wrap"></div>');
    }
  });

  root.find("p, div, section, article, span, li").each((_index, element) => {
    const text = $(element).text().replace(/\u00a0/g, " ").trim();
    if (!text && !$(element).find("img, iframe, video, object, table, ul, ol").length) {
      $(element).remove();
    }
  });

  const html = $("body").length ? $("body").html() || "" : root.html() || "";
  return html.trim();
}

async function expandLesson(resourceRelativePath: string, title: string): Promise<LessonCard> {
  const existingRelative = findExistingRelativeFile(resourceRelativePath);
  const sourceRelativePath = existingRelative || normalizePath(resourceRelativePath);

  if (!existingRelative) {
    return {
      componentId: "",
      title,
      kindLabel: "Reading",
      sourceRelativePath,
      excerpt: "The export map references this lesson, but the source file was not retained in the resource bundle."
    };
  }

  const absolute = path.join(EXPORT_ROOT_DIR, ...existingRelative.split("/"));
  const rawHtml = normalizeSourceText(await readFile(absolute, "utf8"));
  const bodyHtml = rewriteHtmlAssetLinks(rawHtml, existingRelative);

  return {
    componentId: "",
    title,
    kindLabel: /\.pdf$/i.test(existingRelative) ? "Document" : "Reading",
    sourceRelativePath: existingRelative,
    sourceUrl: buildReferenceUrl(existingRelative),
    bodyHtml,
    excerpt: excerptText(bodyHtml)
  };
}

function findMetadataValue(node: ReturnType<typeof load>, label: string): string {
  let result = "";
  node("qtimetadatafield").each((_index, field) => {
    const fieldLabel = node(field).find("fieldlabel").first().text().trim();
    if (fieldLabel === label) {
      result = node(field).find("fieldentry").first().text().trim();
    }
  });
  return result;
}

async function parseQuizFile(relativePath: string) {
  const existingRelative = findExistingRelativeFile(relativePath);
  if (!existingRelative) {
    return {
      multipleChoice: [],
      trueFalse: [],
      writtenResponse: [],
      questionCount: 0,
      attempts: 1,
      timeLimitMinutes: 0,
      profile: "Assessment"
    };
  }

  const absolute = path.join(EXPORT_ROOT_DIR, ...existingRelative.split("/"));
  const xmlText = normalizeSourceText(await readFile(absolute, "utf8"));
  const $ = load(xmlText, { xmlMode: true, decodeEntities: true });
  const multipleChoice: Array<Record<string, any>> = [];
  const trueFalse: Array<Record<string, any>> = [];
  const writtenResponse: Array<Record<string, any>> = [];

  $("item").each((index, item) => {
    const promptHtml = $(item).find("presentation > material > mattext").first().text().trim();
    const prompt = stripTagsToText(promptHtml) || `Question ${index + 1}`;
    const choiceNodes = $(item).find("response_label").toArray();

    if (!choiceNodes.length) {
      writtenResponse.push({
        number: index + 1,
        prompt
      });
      return;
    }

    const options = choiceNodes
      .map((choiceNode, optionIndex) => {
        const text = stripTagsToText($(choiceNode).find("mattext").first().text());
        return {
          id: $(choiceNode).attr("ident") || `choice-${optionIndex + 1}`,
          label: String.fromCharCode(65 + optionIndex),
          text
        };
      })
      .filter((option) => option.text);

    const correctId =
      $(item)
        .find("respcondition")
        .toArray()
        .map((condition) => {
          if (!$(condition).find("setvar").length) return "";
          return $(condition).find("varequal").first().text().trim();
        })
        .find(Boolean) || "";
    const correctOption = options.find((option) => option.id === correctId) || options[0];

    if (
      options.length === 2 &&
      options.every((option) => ["true", "false"].includes(option.text.toLowerCase()))
    ) {
      trueFalse.push({
        number: index + 1,
        prompt,
        answer: correctOption?.text.toLowerCase() === "true" ? "T" : "F"
      });
      return;
    }

    multipleChoice.push({
      number: index + 1,
      prompt,
      options: options.map(({ label, text }) => ({ label, text })),
      answer: correctOption?.label || "A"
    });
  });

  return {
    multipleChoice,
    trueFalse,
    writtenResponse,
    questionCount: multipleChoice.length + trueFalse.length + writtenResponse.length,
    attempts: Number(findMetadataValue($, "cc_maxattempts") || 1),
    timeLimitMinutes: Number(findMetadataValue($, "qmd_timelimit") || 0),
    profile: findMetadataValue($, "qmd_assessmenttype") || "Assessment"
  };
}

function deriveAssignmentBrief(
  moduleTitle: string,
  laneSummary: string,
  itemTitle: string,
  sourceRelativePath?: string
): AssignmentBrief {
  const template = ASSIGNMENT_BRIEF_TEMPLATES[itemTitle.toLowerCase()] || {};
  const hasSource = !!sourceRelativePath && !!findExistingRelativeFile(sourceRelativePath);
  const sourcePath = hasSource && sourceRelativePath ? buildReferenceUrl(sourceRelativePath) : "";
  const caseStudy = /case stud/i.test(itemTitle);
  const genericSummary = caseStudy
    ? `This case-study brief belongs to ${moduleTitle}. Use the embedded workspace to apply the module concepts to a concrete investigation scenario.`
    : `${itemTitle} is the main assignment lane for ${moduleTitle}. The embedded workspace below is the active surface for completing the module task.`;

  return {
    title: itemTitle,
    summary: summarizeAssignmentTemplate(template, genericSummary || laneSummary),
    instructionHtml: template.instructionHtml || `<p>${escapeHtml(laneSummary || genericSummary)}</p>`,
    individualized: template.individualized,
    identified: template.identified,
    sourcePath: sourcePath || undefined
  };
}

async function buildRetainedAssignmentBriefs(
  moduleTitle: string,
  laneSummary: string,
  assignmentNodes: ModuleNode[]
): Promise<AssignmentBrief[]> {
  const briefs = await Promise.all(
    assignmentNodes.map(async (node) => {
      const sourceRelativePath = node.resource?.hrefs?.[0];
      const existingRelative = sourceRelativePath ? findExistingRelativeFile(sourceRelativePath) : null;

      if (existingRelative) {
        const absolute = path.join(EXPORT_ROOT_DIR, ...existingRelative.split("/"));
        const xmlText = normalizeSourceText(await readFile(absolute, "utf8"));
        const parsed = parseAssignmentXml(xmlText, existingRelative, EXPORT_ROOT_RELATIVE);
        const introHtml = parsed.assignmentXml?.intro || "";
        const summary = excerptText(introHtml || laneSummary || parsed.title);

        return {
          title: parsed.title || String(node.title || "Assignment"),
          summary,
          instructionHtml: introHtml || `<p>${escapeHtml(laneSummary || summary)}</p>`,
          sourcePath: buildReferenceUrl(existingRelative) || undefined
        };
      }

      return deriveAssignmentBrief(
        moduleTitle,
        laneSummary,
        String(node.title || "Assignment"),
        sourceRelativePath
      );
    })
  );

  return briefs.filter(Boolean);
}

function renderLessonCards(chapterId: string, lessons: LessonCard[]): string {
  if (!lessons.length) {
    return `<div class="empty-state">This module did not retain any expanded lesson pages in the export bundle.</div>`;
  }

  return `
    <div class="sequence-list">
      ${lessons
        .map(
          (lesson, index) => `
            <article class="sequence-card lesson-card" data-module-component-id="${escapeHtml(lesson.componentId)}" data-progress-state="${index === 0 ? "active" : "locked"}">
              <div class="sequence-top">
                <span class="sequence-number">${index + 1}</span>
                <div>
                  <span class="sequence-kind">${escapeHtml(lesson.kindLabel)}</span>
                  <h3 class="sequence-title">${escapeHtml(lesson.title)}</h3>
                </div>
              </div>
              ${
                lesson.bodyHtml
                  ? `<div class="lesson-body">${lesson.bodyHtml}</div>`
                  : `<p class="lesson-source-note">The original export references this lesson, but the source HTML was not retained in the resource bundle.</p>`
              }
              <div class="lesson-progress-footer" data-progress-footer>
                <div class="lesson-progress-copy" data-progress-copy>
                  <span class="lesson-progress-label">Module progression</span>
                  <p class="lesson-progress-note">Complete this component to unlock the next lesson card and move toward the module quiz and assignment.</p>
                </div>
                <div class="lesson-progress-actions" data-progress-actions>
                  <button class="action-link secondary" type="button" data-mark-complete="${escapeHtml(lesson.componentId)}">Mark Complete</button>
                  <button class="action-link" type="button" data-mark-complete-next="${escapeHtml(lesson.componentId)}">Mark Complete + Next</button>
                </div>
                <span class="lesson-progress-complete" data-progress-complete hidden>Complete</span>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderChapterPage(params: {
  chapter: Record<string, any>;
  lessons: LessonCard[];
  assignmentBriefs: AssignmentBrief[];
  notes: string[];
  quiz?: Record<string, any>;
}) {
  const { chapter, lessons } = params;
  const componentIds = lessons.map((lesson) => lesson.componentId).filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(chapter.title)} | Forensic Studies 25</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Noto+Serif:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../module-index.css" />
</head>
<body data-project-slug="${escapeHtml(PROJECT_SLUG)}" data-chapter-id="${escapeHtml(String(chapter.id || ""))}">
  <main class="module-page" style="--gold:${escapeHtml(chapter.accent || "#22d3ee")}; --line-strong:${escapeHtml(chapter.accent || "#22d3ee")};">
    <section class="module-hero">
      <span class="eyebrow">${escapeHtml(chapter.code || `Chapter ${chapter.number || ""}`)}</span>
      <h1 class="module-title">${escapeHtml(chapter.title || "Module")}</h1>
      <p class="module-summary">${escapeHtml(chapter.summary || "Module lessons for Forensic Studies 25.")}</p>
    </section>

    <section class="module-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Module Content</span>
          <h2 class="section-title">Lesson sequence</h2>
        </div>
        <p class="section-copy">Retained lesson content from the original Forensics module.</p>
      </div>
      ${renderLessonCards(String(chapter.id || ""), lessons)}
    </section>
  </main>
  <script>
    const chapterId = document.body.dataset.chapterId || "";
    const componentIds = ${JSON.stringify(componentIds)};
    let completionState = Object.create(null);

    function getLessonCards() {
      return Array.from(document.querySelectorAll("[data-module-component-id]"));
    }

    function getComponentId(card) {
      return card?.dataset?.moduleComponentId || "";
    }

    function getNextIncompleteComponentId() {
      return componentIds.find((componentId) => !completionState[componentId]) || "";
    }

    function isComponentReachable(componentId) {
      const nextIncomplete = getNextIncompleteComponentId();
      return !nextIncomplete || completionState[componentId] || nextIncomplete === componentId;
    }

    function scrollToComponent(componentId) {
      if (!componentId) return;
      const card = document.querySelector('[data-module-component-id="' + componentId.replace(/"/g, '\\"') + '"]');
      if (!card) return;
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      const button = card.querySelector("[data-mark-complete-next], [data-mark-complete]");
      button?.focus({ preventScroll: true });
    }

    function syncCardState() {
      const nextIncomplete = getNextIncompleteComponentId();
      getLessonCards().forEach((card) => {
        const componentId = getComponentId(card);
        const complete = !!completionState[componentId];
        const reachable = isComponentReachable(componentId);
        const isLast = componentIds[componentIds.length - 1] === componentId;
        const state = complete ? "complete" : reachable ? "active" : "locked";
        const footer = card.querySelector("[data-progress-footer]");
        const progressCopy = card.querySelector("[data-progress-copy]");
        const actions = card.querySelector("[data-progress-actions]");
        const completeBadge = card.querySelector("[data-progress-complete]");
        card.dataset.progressState = state;
        card.classList.toggle("is-complete", complete);
        card.classList.toggle("is-active", state === "active");
        card.classList.toggle("is-locked", state === "locked");

        const buttons = Array.from(card.querySelectorAll("[data-mark-complete], [data-mark-complete-next]"));
        buttons.forEach((button) => {
          button.disabled = state === "locked" || complete;
        });

        if (footer) {
          footer.hidden = complete && !isLast;
        }
        if (progressCopy) {
          progressCopy.hidden = complete && isLast;
        }
        if (actions) {
          actions.hidden = state !== "active";
        }
        if (completeBadge) {
          completeBadge.hidden = !(complete && isLast);
        }
      });

      document.body.dataset.nextIncompleteComponentId = nextIncomplete || "";
    }

    function postProgressReady() {
      window.parent?.postMessage({
        type: "forensicstudiesoption2-module-progress-ready",
        chapterId,
        componentIds
      }, "*");
    }

    function postProgressUpdate(componentId, focusNext) {
      window.parent?.postMessage({
        type: "forensicstudiesoption2-module-progress-update",
        chapterId,
        componentId,
        complete: true,
        focusNext: !!focusNext
      }, "*");
    }

    window.addEventListener("message", (event) => {
      const payload = event.data;
      if (!payload || payload.type !== "forensicstudiesoption2-module-progress-sync" || payload.chapterId !== chapterId) return;
      completionState = payload.completion && typeof payload.completion === "object" ? payload.completion : Object.create(null);
      syncCardState();
      if (payload.focusComponentId) {
        scrollToComponent(payload.focusComponentId);
      }
    });

    document.addEventListener("click", (event) => {
      const completeButton = event.target.closest("[data-mark-complete]");
      const completeNextButton = event.target.closest("[data-mark-complete-next]");
      const trigger = completeNextButton || completeButton;
      if (!trigger) return;

      const componentId = trigger.dataset.markCompleteNext || trigger.dataset.markComplete || "";
      if (!componentId || !isComponentReachable(componentId) || completionState[componentId]) return;

      completionState[componentId] = true;
      syncCardState();

      if (completeNextButton) {
        scrollToComponent(getNextIncompleteComponentId());
      }

      postProgressUpdate(componentId, !!completeNextButton);
    });

    syncCardState();
    postProgressReady();

    document.addEventListener("error", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      const label = target.dataset.fallbackLabel || target.getAttribute("alt") || "Source image unavailable";
      const fallback = document.createElement("span");
      fallback.className = "lesson-media-missing";
      fallback.setAttribute("role", "img");
      fallback.setAttribute("aria-label", label);
      fallback.textContent = label;
      target.replaceWith(fallback);
    }, true);
  </script>
</body>
</html>
`;
}

async function loadCourseData(): Promise<CourseData> {
  const source = await readFile(COURSE_DATA_PATH, "utf8");
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.FORENSIC_STUDIES_OPTION2_DATA as CourseData;
}

async function main() {
  mirroredReferencePaths.clear();
  const courseData = await loadCourseData();
  const visibleModules = (d2lCourseMapData.modules as ModuleNode[]).filter(
    (module) => module.kind === "module" && !EXCLUDED_VISIBLE_MODULE_TITLES.has(String(module.title || ""))
  );
  const moduleByTitle = new Map(visibleModules.map((module) => [module.title, module]));
  const normalizedChapters = (courseData.chapters || [])
    .filter((chapter) => moduleByTitle.has(String(chapter?.title || "")))
    .map((chapter) => ({
      ...chapter,
      summary: CHAPTER_SUMMARY_OVERRIDES[String(chapter.id)] || chapter.summary
    }));
  const normalizedChapterIds = new Set(normalizedChapters.map((chapter) => String(chapter.id)));
  const quizzesByChapterId = new Map<string, Record<string, any>>();
  const assignmentsByChapterId = new Map<string, Record<string, any>>();
  const componentIdsByChapterId = new Map<string, string[]>();

  for (const chapter of normalizedChapters) {
    const moduleNode = moduleByTitle.get(chapter.title);
    const flatNodes = flattenNodes(moduleNode?.children || []);
    const filteredNodes = filterModuleNodesForWorkspace(String(chapter.title || ""), flatNodes);
    const contentNodes = filteredNodes.filter(
      (node) =>
        !!node.resource?.hrefs?.length &&
        node.kind !== "assignment" &&
        node.kind !== "quiz"
    );
    const lessonNotes = filteredNodes
      .filter((node) => !node.resource?.hrefs?.length && node.kind && node.kind !== "folder" && node.kind !== "module")
      .map((node) => String(node.title || "").trim())
      .filter(Boolean);

    const lessons: LessonCard[] = [];
    for (const node of contentNodes) {
      const href = node.resource?.hrefs?.[0];
      if (!href) continue;
      const expandedLesson = await expandLesson(href, String(node.title || "Lesson"));
      lessons.push({
        ...expandedLesson,
        componentId: toComponentId(String(node.title || "Lesson"), lessons.length)
      });
    }
    componentIdsByChapterId.set(String(chapter.id), lessons.map((lesson) => lesson.componentId).filter(Boolean));

    const existingQuiz = (courseData.quizzes || []).find((quiz) => quiz.chapterId === chapter.id);
    const quizNode = filteredNodes.find((node) => node.kind === "quiz" && node.resource?.hrefs?.length);
    let enrichedQuiz = existingQuiz ? { ...existingQuiz } : undefined;
    if (existingQuiz && quizNode?.resource?.hrefs?.[0]) {
      const parsedQuiz = await parseQuizFile(quizNode.resource.hrefs[0]);
      enrichedQuiz = {
        ...existingQuiz,
        summary: buildQuizSummary(chapter, existingQuiz),
        sourcePath: buildReferenceUrl(quizNode.resource.hrefs[0]) || undefined,
        multipleChoice: parsedQuiz.multipleChoice,
        trueFalse: parsedQuiz.trueFalse,
        writtenResponse: parsedQuiz.writtenResponse,
        attempts: parsedQuiz.attempts,
        timeLimitMinutes: parsedQuiz.timeLimitMinutes,
        profile: parsedQuiz.profile,
        questionCount: parsedQuiz.questionCount
      };
      quizzesByChapterId.set(chapter.id, enrichedQuiz);
    }

    const existingAssignment = (courseData.assignments || []).find((assignment) => assignment.chapterId === chapter.id);
    const assignmentNodes = filteredNodes.filter((node) => node.kind === "assignment" && node.resource?.hrefs?.length);
    if (existingAssignment) {
      const syntheticAssignment = buildSyntheticAssignmentDefinition(String(chapter.title || ""));
      const briefs = syntheticAssignment
        ? [
            {
              title: syntheticAssignment.title,
              summary: excerptText(syntheticAssignment.introHtml),
              instructionHtml: syntheticAssignment.introHtml
            }
          ]
        : await buildRetainedAssignmentBriefs(
            String(chapter.title || "Module"),
            String(existingAssignment.summary || ""),
            assignmentNodes
          );

      const leadBrief = briefs[0];

      assignmentsByChapterId.set(chapter.id, {
        ...existingAssignment,
        title: syntheticAssignment?.title || leadBrief?.title || existingAssignment.title,
        summary: leadBrief?.summary || existingAssignment.summary,
        briefs
      });
    }

    const chapterDir = path.join(MODULE_CONTENT_DIR, String(chapter.id));
    await mkdir(chapterDir, { recursive: true });
    const chapterHtml = renderChapterPage({
      chapter,
      lessons,
      assignmentBriefs: assignmentsByChapterId.get(chapter.id)?.briefs || [],
      notes: lessonNotes,
      quiz: enrichedQuiz
    });
    await writeFile(path.join(chapterDir, "index.html"), chapterHtml, "utf8");
  }

  const contentEntries = await readdir(MODULE_CONTENT_DIR, { withFileTypes: true });
  await Promise.all(
    contentEntries
      .filter((entry) => entry.isDirectory() && /^chapter-\d+$/.test(entry.name) && !normalizedChapterIds.has(entry.name))
      .map((entry) => rm(path.join(MODULE_CONTENT_DIR, entry.name), { recursive: true, force: true }))
  );

  await rm(WORKSPACE_REFERENCE_DIR, { recursive: true, force: true });
  for (const relativePath of mirroredReferencePaths) {
    const sourceAbsolute = path.join(EXPORT_ROOT_DIR, ...relativePath.split("/"));
    const destinationAbsolute = path.join(WORKSPACE_REFERENCE_DIR, ...relativePath.split("/"));
    await mkdir(path.dirname(destinationAbsolute), { recursive: true });
    await copyFile(sourceAbsolute, destinationAbsolute);
  }

  const nextCourseData = {
    ...courseData,
    course: {
      ...(courseData.course || {}),
      subtitle: COURSE_SUBTITLE
    },
    chapters: normalizedChapters.map((chapter) => {
      const componentIds = componentIdsByChapterId.get(String(chapter.id)) || [];
      return {
        ...chapter,
        componentIds,
        componentCount: componentIds.length
      };
    }),
    quizzes: (courseData.quizzes || []).filter((quiz) => normalizedChapterIds.has(String(quiz?.chapterId || ""))).map((quiz) => {
      const chapter = normalizedChapters.find((entry) => entry.id === quiz.chapterId) || {};
      const enrichedQuiz = quizzesByChapterId.get(quiz.chapterId);
      return enrichedQuiz || {
        ...quiz,
        summary: buildQuizSummary(chapter, quiz)
      };
    }),
    assignments: normalizedChapters
      .map((chapter) => assignmentsByChapterId.get(chapter.id))
      .filter(Boolean),
    library: []
  };

  const serialized = `window.FORENSIC_STUDIES_OPTION2_DATA = ${JSON.stringify(nextCourseData, null, 2)};\n`;
  await writeFile(COURSE_DATA_PATH, serialized, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
