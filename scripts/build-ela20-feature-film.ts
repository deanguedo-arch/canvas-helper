import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import * as cheerio from "cheerio";
import JSZip from "jszip";

import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { renderNextStepCourseShell } from "./lib/next-step-course-shell.js";

const ROOT = process.cwd();
const DEFAULT_SLUG = "ela20-1-feature-film";
const COURSE_TITLE = "Feature Film";
const COURSE_CODE = "ELA 20-1";
const SOURCE_ZIP =
  "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip";
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

type Args = {
  zipPath: string;
  slug: string;
};

type LessonSource = {
  id: string;
  entry: string;
  title: string;
  summary: string;
  group: "Film Study";
};

type ImportedLink = {
  text: string;
  href: string;
  lessonTitle: string;
};

type ImportedVideo = {
  id: string;
  title: string;
  src: string;
  lessonTitle: string;
};

type ImportedResource = {
  title: string;
  href: string;
  sourcePath: string;
  lessonTitle: string;
};

type Lesson = {
  id: string;
  entry: string;
  title: string;
  summary: string;
  group: LessonSource["group"];
  html: string;
  excerpt: string;
  links: ImportedLink[];
  videos: ImportedVideo[];
  resources: ImportedResource[];
};

type FilmQuestion = {
  id: string;
  text: string;
  hint?: string;
};

type FilmQuestionSection = {
  title: string;
  questions: FilmQuestion[];
};

type FilmQuestionSet = {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  sections: FilmQuestionSection[];
};

const FILM_QUESTION_SETS: FilmQuestionSet[] = [
  {
    id: "technique-questions",
    title: "Film Technique Questions",
    subtitle: "Unit 7 Film Study",
    intro:
      "Use the film-study clips to check your understanding of shots, composition, camera movement, lighting, sound, and mise-en-scene.",
    sections: [
      {
        title: "Types of Cinematography Shots",
        questions: [
          {
            id: "panning",
            text: "Describe what panning is and why it is used in films.",
            hint: "Name the movement first, then explain what it helps the viewer follow."
          },
          {
            id: "extreme-long-close-up",
            text: "Explain the difference between an extreme long shot and a close up.",
            hint: "Compare how much of the subject and setting the viewer can see."
          },
          {
            id: "close-up-effect",
            text: "What effect is achieved in a close up?",
            hint: "Think about emotion, detail, and what the director wants the audience to notice."
          },
          {
            id: "dutch-tilt",
            text: "What effect is the director trying to achieve through the use of Dutch tilt? Why might this shot be used?",
            hint: "Connect the tilted frame to unease, confusion, threat, or instability."
          },
          {
            id: "high-angle-shot",
            text: "What is a high-angle shot and what is its purpose?",
            hint: "Explain where the camera is placed and how that position changes power or vulnerability."
          }
        ]
      },
      {
        title: "Shot Composition",
        questions: [
          {
            id: "leading-lines",
            text: "What is the function of leading lines? Name four different types of leading lines.",
            hint: "Focus on how lines guide attention through the frame."
          },
          {
            id: "rack-focus",
            text: "When is rack focus used? What is rack focus?",
            hint: "Describe the shift in focus and why a director would redirect the viewer's eye."
          },
          {
            id: "natural-frames",
            text: "Give four examples of natural frames.",
            hint: "Look for objects or spaces inside the shot that can frame a subject."
          }
        ]
      },
      {
        title: "Camera Movement",
        questions: [
          {
            id: "common-follow-movement",
            text: "Name one common type of camera movement used to follow movement in a scene.",
            hint: "Think about techniques that let the camera travel with a person or object."
          },
          {
            id: "dolly-movement",
            text: "Describe what is meant by a dolly movement.",
            hint: "Explain how the camera physically moves through space."
          },
          {
            id: "sled-vest",
            text: "How do camera operators minimize vibration when using a sled and vest?",
            hint: "Describe how the equipment absorbs or stabilizes movement."
          },
          {
            id: "boom-angles",
            text: "True or false: a boom is used for both low and high angle shots. Explain your answer.",
            hint: "Do not stop at true or false; explain what the boom allows the camera to do."
          }
        ]
      },
      {
        title: "Lighting",
        questions: [
          {
            id: "three-point-lighting",
            text: "How is three-point lighting achieved?",
            hint: "Name the three lights and describe how they work together."
          },
          {
            id: "key-light",
            text: "What is the key light?",
            hint: "Identify the main light source in the setup."
          },
          {
            id: "fill-light",
            text: "What does the fill light do?",
            hint: "Focus on shadows and contrast."
          },
          {
            id: "hair-light",
            text: "What is the purpose of the hair light?",
            hint: "Explain how it separates the subject from the background."
          },
          {
            id: "noir-lighting",
            text: "Describe the lighting arrangement when making a noir movie.",
            hint: "Use terms like contrast, shadows, low-key lighting, and mood."
          }
        ]
      },
      {
        title: "Sound Effects",
        questions: [
          {
            id: "diegetic-nondiegetic",
            text: "Explain the difference between diegetic sound and non-diegetic sound.",
            hint: "Ask whether the characters in the scene can hear the sound."
          },
          {
            id: "diegetic-examples",
            text: "Give three examples of diegetic sound.",
            hint: "Choose sounds that belong inside the world of the film."
          },
          {
            id: "nondiegetic-examples",
            text: "Give three examples of non-diegetic sound.",
            hint: "Choose sounds added for the audience rather than the characters."
          }
        ]
      },
      {
        title: "Mise-en-scene",
        questions: [
          {
            id: "mise-en-scene-function",
            text: "Explain the term mise-en-scene. What is the function of mise-en-scene?",
            hint: "Think about everything placed in the frame and how it shapes meaning."
          },
          {
            id: "walle-emotional-state",
            text: "Describe some special features the director uses to emphasize Wall-E's emotional state, such as symbols or visual elements.",
            hint: "Connect the visual choices to what the audience understands about Wall-E."
          }
        ]
      }
    ]
  },
  {
    id: "full-film-response",
    title: "Full Film Response",
    subtitle: "After Viewing",
    intro:
      "After carefully watching one feature film, use these prompts to analyze character, conflict, motivation, and theme.",
    sections: [
      {
        title: "Film Selection",
        questions: [
          {
            id: "film-choice",
            text: "Which film did you watch?",
            hint: "Name the film and director if you know them before moving into analysis."
          }
        ]
      },
      {
        title: "Character And Motivation",
        questions: [
          {
            id: "character-introduction",
            text: "How are the major characters introduced? What does this tell us about what will happen in the story?",
            hint: "Look at first impressions, setting, dialogue, and early conflicts."
          },
          {
            id: "character-action-theme",
            text: "Select an action performed by one character. Explain why that character took the action, what motivated them, and what this motivation has to do with the theme of the film.",
            hint: "Use a specific action rather than a general personality trait."
          },
          {
            id: "character-credibility",
            text: "The characters must be credible; how they act and what they say must make sense. What aspects of the personalities of the major characters affect their credibility?",
            hint: "Explain what makes their choices believable or unbelievable."
          },
          {
            id: "character-consistency",
            text: "Is there consistency in the characters throughout the story? Do their actions follow their natures and ring true?",
            hint: "Track whether choices match what the film has already shown about them."
          },
          {
            id: "major-character-motives",
            text: "What motivates the major characters? Are their motivations or wants explained outright or revealed over time?",
            hint: "Separate stated goals from motives the viewer has to infer."
          },
          {
            id: "unconscious-motives",
            text: "Are there any major characters who act on motives of which they are not aware? Describe any unconscious motives and explain how these motives affect their actions.",
            hint: "Look for fear, guilt, pride, shame, grief, desire, or denial beneath the surface."
          }
        ]
      },
      {
        title: "Relationships And Conflict",
        questions: [
          {
            id: "important-relationships",
            text: "Are there important relationships between characters, such as friends, lovers, co-workers, or family members? Describe relationships that contribute to the story and how they advance the action.",
            hint: "Explain what the relationship causes, reveals, or changes."
          },
          {
            id: "protagonist-motivation",
            text: "What motivates the protagonist in their struggle against the antagonist?",
            hint: "Identify the protagonist's goal and what is at stake."
          },
          {
            id: "protagonist-struggle",
            text: "How does the protagonist work against the antagonist? Recount one specific event in this struggle.",
            hint: "Use one scene as evidence."
          },
          {
            id: "antagonist-motivation",
            text: "What motivates the antagonist to resist or struggle against the protagonist?",
            hint: "Avoid saying only that the antagonist is evil; explain what they want."
          },
          {
            id: "antagonist-struggle",
            text: "How does the antagonist resist or struggle against the protagonist? Recount one specific event in this struggle.",
            hint: "Choose an action that directly creates pressure for the protagonist."
          }
        ]
      },
      {
        title: "Theme And Resolution",
        questions: [
          {
            id: "values-and-ideas",
            text: "In what ways are the characters' actions driven by the values endorsed or criticized in the story, or by ideas presented by the story?",
            hint: "Connect choices to what the film seems to value, question, or criticize."
          },
          {
            id: "backstory",
            text: "What role does the back-story play in explaining the actions of the major characters? Explain your reasoning.",
            hint: "Explain how past events shape present choices."
          },
          {
            id: "withheld-information",
            text: "Is there information known to the audience that is being held back from any characters? If so, describe it and explain how things change once this information becomes known.",
            hint: "Think about suspense, irony, secrets, and delayed revelation."
          },
          {
            id: "character-transformation",
            text: "Explore transformations or changes that occur over the course of the story in any major character. For each change, describe how it comes about and how it relates to the film's themes or ideas.",
            hint: "Track a clear before-and-after change."
          },
          {
            id: "personality-resolution",
            text: "Which aspects of the protagonist's personality lead to the resolution of the conflict? Describe them and their effect on the resolution.",
            hint: "Connect personality traits to the ending, not just to the middle of the story."
          },
          {
            id: "internal-external-conflict",
            text: "As the story moves toward a conclusion, internal and external conflicts are resolved. Select one major character and describe their internal and external conflicts. Explain how the character's choices lead to a resolution of these conflicts.",
            hint: "Separate the character's inner struggle from the outside problem they face."
          }
        ]
      }
    ]
  }
];

const LESSON_SOURCES: LessonSource[] = [
  {
    id: "lesson-4-film-study-introduction",
    entry: "film_study/film study unit introduction.html",
    title: "Film Study Introduction",
    summary: "Frame film study as active reading of images, sound, editing, and meaning.",
    group: "Film Study"
  },
  {
    id: "lesson-5-a-brief-history-of-film",
    entry: "film_study/A Brief History of Film.html",
    title: "A Brief History of Film",
    summary: "Trace key eras in film history and notice how technology changed storytelling.",
    group: "Film Study"
  },
  {
    id: "lesson-6-elements-of-film",
    entry: "film_study/Elements of Film.html",
    title: "Elements of Film",
    summary: "Study narrative, cinematography, mise-en-scene, and performance as formal elements.",
    group: "Film Study"
  },
  {
    id: "lesson-7-elements-of-film-continued",
    entry: "film_study/Elements of Film 2.html",
    title: "Elements of Film - Continued",
    summary: "Extend film analysis through editing, sound, and how meaning is assembled.",
    group: "Film Study"
  },
  {
    id: "lesson-8-editing-and-transitions",
    entry: "film_study/editing_and_transitions.html",
    title: "Editing and Transitions",
    summary: "Identify cuts, transitions, pacing, and continuity choices in film construction.",
    group: "Film Study"
  },
  {
    id: "lesson-9-film-shots-and-angles",
    entry: "film_study/film_shots_and_angles.html",
    title: "Film Shots and Angles",
    summary: "Read camera distance, framing, and angle as choices that shape viewer response.",
    group: "Film Study"
  },
  {
    id: "lesson-10-examining-mise-en-scene",
    entry: "film_study/mise_en_scene.html",
    title: "Examining Mise-En-Scene",
    summary: "Analyze setting, lighting, costume, placement, and composition inside the frame.",
    group: "Film Study"
  },
  {
    id: "lesson-11-camera-movement-in-film-and-video",
    entry: "film_study/camera_movement_in_film_and_video.html",
    title: "Camera Movement in Film and Video",
    summary: "Notice how camera movement controls attention, emotion, and interpretation.",
    group: "Film Study"
  },
  {
    id: "lesson-12-sound-in-film",
    entry: "film_study/sound_in_film.html",
    title: "Sound in Film",
    summary: "Distinguish diegetic and non-diegetic sound and explain how sound builds meaning.",
    group: "Film Study"
  }
];

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Args = { zipPath: SOURCE_ZIP, slug: DEFAULT_SLUG };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--zip" && next) {
      parsed.zipPath = next;
      i += 1;
    } else if (arg === "--slug" && next) {
      parsed.slug = next;
      i += 1;
    }
  }
  return parsed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function normalizeWhitespace(value: string): string {
  return decodeEntities(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVideoTitle(source: LessonSource, index: number): string {
  if (source.id === "lesson-6-elements-of-film") return "Elements of Film: Visual Storytelling";
  if (source.id === "lesson-7-elements-of-film-continued") {
    const titles = [
      "Elements of Film: Editing",
      "Elements of Film: Continuity",
      "Elements of Film: Sound"
    ];
    return titles[index] ?? `${source.title}: Clip ${index + 1}`;
  }
  return index === 0 ? source.title : `${source.title}: Clip ${index + 1}`;
}

function getResourceTitle(label: string, href: string): string {
  const cleanLabel = normalizeWhitespace(label);
  const lowerHref = href.toLowerCase();
  if (/filmsite\.org\/filmterms/.test(lowerHref)) return "Film Terms Glossary";
  if (/cabinet_of_dr\._caligari/.test(lowerHref)) return "The Cabinet of Dr. Caligari";
  if (/five-formal-elements-of-film/.test(lowerHref)) return "The Five Formal Elements of Film";
  if (/continuity_editing/.test(lowerHref)) return "Continuity Editing";
  if (cleanLabel && !/^here$/i.test(cleanLabel) && !/^https?:\/\//i.test(cleanLabel)) return cleanLabel;
  const withoutProtocol = href.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split(/[?#]/)[0];
  const segments = withoutProtocol.split("/").filter(Boolean);
  const fallback = segments.length ? segments[segments.length - 1] : withoutProtocol;
  return fallback
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanStudentText(value: string): string {
  return normalizeWhitespace(value)
    .replace(/(?:©|@)2019 CBe-learn\s*-?\s*Calgary Board of Education/gi, "")
    .replace(/Please (?:click|continue) to the next page\.?/gi, "")
    .trim();
}

function decodeUrlPath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveZipPath(entryName: string, rawSrc: string): string | null {
  const withoutQuery = rawSrc.split(/[?#]/)[0].replace(/\\/g, "/").replace(/^\.\//, "");
  if (!withoutQuery || /^(?:https?:|mailto:|data:|#)/i.test(withoutQuery)) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(entryName), decodeUrlPath(withoutQuery)));
}

function findZipFile(zip: JSZip, resolvedPath: string) {
  return (
    zip.file(resolvedPath) ||
    zip.file(resolvedPath.replace(/^\.\//, "")) ||
    zip.file(resolvedPath.replace(/ /g, "%20")) ||
    zip.file(decodeUrlPath(resolvedPath))
  );
}

async function copyZipAsset(
  zip: JSZip,
  entryName: string,
  rawSrc: string,
  assetsDir: string,
  workspacePrefix: string
): Promise<{ href: string; sourcePath: string } | null> {
  const resolved = resolveZipPath(entryName, rawSrc);
  if (!resolved) return null;
  const file = findZipFile(zip, resolved);
  if (!file) return null;
  const ext = path.posix.extname(resolved) || ".bin";
  const base = path.posix.basename(resolved, ext);
  const outName = `${slugify(path.posix.dirname(resolved))}-${slugify(base)}${ext.toLowerCase()}`;
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.writeFile(path.join(assetsDir, outName), await file.async("nodebuffer"));
  return {
    href: `${workspacePrefix}/${outName}`,
    sourcePath: resolved
  };
}

function sourceRoot($: cheerio.CheerioAPI) {
  return $("#content").first().length ? $("#content").first() : $("body").first();
}

async function sanitizeContent(
  zip: JSZip,
  source: LessonSource,
  rawHtml: string,
  assetsDir: string,
  resourceDir: string
): Promise<Lesson> {
  const $ = cheerio.load(rawHtml);
  $("script, style, link, meta, title, head, noscript").remove();
  $(".d2l-navigation, .d2l-page-header, .navbar, .nav, .breadcrumbs, .breadcrumb, .skip-link").remove();

  const root = sourceRoot($);
  const links: ImportedLink[] = [];
  const videos: ImportedVideo[] = [];
  const resources: ImportedResource[] = [];

  await Promise.all(
    root
      .find("img")
      .map(async (_index, element) => {
        const img = $(element);
        const src = img.attr("src") || "";
        const copied = await copyZipAsset(zip, source.entry, src, assetsDir, "assets/imported");
        if (copied) {
          img.attr("src", copied.href);
          img.attr("alt", img.attr("alt") || `${source.title} image`);
          img.addClass("source-image");
        } else if (!/^(?:https?:|data:)/i.test(src)) {
          img.remove();
        }
      })
      .get()
  );

  root.find("iframe").each((index, element) => {
    const iframe = $(element);
    const src = iframe.attr("src") || "";
    if (!/^https?:\/\//i.test(src)) {
      iframe.remove();
      return;
    }
    const videoId = `${source.id}-video-${index + 1}`;
    const title = getVideoTitle(source, index);
    videos.push({
      id: videoId,
      title,
      src,
      lessonTitle: source.title
    });
    iframe
      .addClass("film-embed")
      .attr("title", title)
      .attr("loading", "lazy")
      .attr("allowfullscreen", "allowfullscreen");
  });

  await Promise.all(
    root
      .find("a")
      .map(async (_index, element) => {
        const link = $(element);
        const href = (link.attr("href") || "").trim();
        const label = normalizeWhitespace(link.text()) || href;
        if (!href) {
          link.replaceWith(`<span>${escapeHtml(label)}</span>`);
          return;
        }
        if (/^(?:https?:|mailto:|#)/i.test(href)) {
          if (/^https?:/i.test(href)) {
            links.push({ text: getResourceTitle(label, href), href, lessonTitle: source.title });
            link.attr("target", "_blank");
            link.attr("rel", "noopener");
          }
          return;
        }
        if (/\.html?(?:$|[#?])/i.test(href)) {
          link.replaceWith(`<strong class="source-note">${escapeHtml(label)}</strong>`);
          return;
        }
        const copied = await copyZipAsset(zip, source.entry, href, resourceDir, "assets/resources");
        if (copied) {
          resources.push({
            title: getResourceTitle(label, copied.href),
            href: copied.href,
            sourcePath: copied.sourcePath,
            lessonTitle: source.title
          });
          link.attr("href", copied.href);
        } else {
          link.replaceWith(`<strong class="source-note">${escapeHtml(label)}</strong>`);
        }
      })
      .get()
  );

  root.find("font, center").each((_index, element) => {
    const el = $(element);
    el.replaceWith(el.html() || "");
  });

  root.find("*").each((_index, element: any) => {
    const el = $(element);
    for (const attr of Object.keys(element.attribs || {})) {
      if (!["href", "src", "alt", "title", "target", "rel", "class", "loading", "allowfullscreen"].includes(attr)) {
        el.removeAttr(attr);
      }
    }
  });

  root.find("h1, h2").each((index, element) => {
    const heading = $(element);
    const text = normalizeWhitespace(heading.text());
    if (index < 2 && text.toLowerCase() === source.title.toLowerCase()) heading.remove();
  });

  root.find("p, div, span, li").each((_index, element) => {
    const el = $(element);
    const text = normalizeWhitespace(el.text());
    if (
      /^please continue to the next page/i.test(text) ||
      /^please click next/i.test(text) ||
      /^content$/i.test(text) ||
      /^(?:©|@)2019 CBe-learn/i.test(text)
    ) {
      el.remove();
    }
  });

  root.find("table").each((_index, element) => {
    $(element).addClass("source-table");
  });

  let html = root.html()?.trim() || `<p>${escapeHtml(cleanStudentText($.text()))}</p>`;
  html = html.replace(
    /<div>\s*(?:©|@)2019\s*CBe-learn\s*-?\s*Calgary Board of Education\s*<\/div>/gi,
    ""
  );
  const text = cleanStudentText(cheerio.load(html).text());
  return {
    id: source.id,
    entry: source.entry,
    title: source.title,
    summary: source.summary,
    group: source.group,
    html,
    excerpt: text.slice(0, 170),
    links,
    videos,
    resources
  };
}

async function loadLessons(zip: JSZip, assetsDir: string, resourceDir: string): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  for (const source of LESSON_SOURCES) {
    const file = zip.file(source.entry);
    if (!file) throw new Error(`Missing Feature Film source file: ${source.entry}`);
    const raw = decodeBrightspaceHtml(await file.async("nodebuffer"));
    lessons.push(await sanitizeContent(zip, source, raw, assetsDir, resourceDir));
  }
  return lessons;
}

function renderViewingGuide() {
  return `<section id="viewing-guide" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Film Study</p>
    <h2>Viewing Guide</h2>
    <p class="page-intro">Use this guide while watching or rewatching a feature film. Focus on choices that a director controls, not just what happens in the plot.</p>
    <div class="guide-grid">
      <article class="work-card">
        <h3>First viewing</h3>
        <label>What stands out first?
          <textarea data-response-id="viewing-first-impression" placeholder="Describe one image, sound, character, or scene that immediately shapes your reaction."></textarea>
        </label>
      </article>
      <article class="work-card">
        <h3>Film language</h3>
        <label>Which technique seems most important?
          <select data-response-id="viewing-technique">
            <option value="">Choose a film technique...</option>
            <option>Cinematography</option>
            <option>Editing</option>
            <option>Sound</option>
            <option>Mise-en-scene</option>
            <option>Camera movement</option>
            <option>Performance</option>
          </select>
        </label>
        <label>Explain the effect.
          <textarea data-response-id="viewing-technique-effect" placeholder="How does this technique guide what the viewer feels, notices, or believes?"></textarea>
        </label>
      </article>
      <article class="work-card">
        <h3>Theme tracker</h3>
        <label>What larger idea is developing?
          <textarea data-response-id="viewing-theme" placeholder="Connect a repeated image, conflict, or character choice to a possible theme."></textarea>
        </label>
      </article>
      <article class="work-card">
        <h3>Evidence note</h3>
        <label>Record one usable moment.
          <textarea data-response-id="viewing-evidence" placeholder="Name the scene, describe the film choice, and explain why it matters."></textarea>
        </label>
      </article>
    </div>
    <div class="lesson-bottom-bar">
      <button class="lesson-jump primary" type="button" data-print-writing>Print / PDF</button>
      <span class="save-status" data-save-status>Saved locally</span>
    </div>
  </section>`;
}

function filmQuestionTotal(set: FilmQuestionSet) {
  return set.sections.reduce((total, section) => total + section.questions.length, 0);
}

function renderFilmQuestion(question: FilmQuestion, index: number, setId: string) {
  const responseId = `film-study-questions-${setId}-${question.id}`;
  return `<div class="worksheet-question">
    <div class="worksheet-question-prompt">
      <strong>${index + 1}.</strong>
      <span>${escapeHtml(question.text)}</span>
    </div>
    ${
      question.hint
        ? `<div class="worksheet-hint" data-film-question-hint hidden><strong>Hint:</strong> ${escapeHtml(question.hint)}</div>`
        : ""
    }
    <label class="worksheet-answer-field">
      <textarea rows="5" data-response-id="${escapeHtml(responseId)}" data-film-question-answer="${escapeHtml(setId)}" placeholder="Type your analytical response here..."></textarea>
      <span class="worksheet-word-count" data-film-question-word-count="${escapeHtml(responseId)}">0 words</span>
    </label>
  </div>`;
}

function renderFilmQuestionSet(set: FilmQuestionSet, index: number) {
  const total = filmQuestionTotal(set);
  return `<article class="worksheet-document film-question-document" data-film-question-panel="${escapeHtml(set.id)}"${index === 0 ? "" : " hidden"}>
    <header class="worksheet-document-header">
      <p>${COURSE_CODE} Critical Analysis</p>
      <h3>${escapeHtml(set.title)}</h3>
      <span>${escapeHtml(set.subtitle)}</span>
      <div class="worksheet-progress">
        <div><span>Formative Progress</span><strong data-film-question-progress="${escapeHtml(set.id)}">0 of ${total} answered</strong></div>
        <div class="worksheet-progress-track"><div data-film-question-progress-fill="${escapeHtml(set.id)}"></div></div>
      </div>
    </header>
    <div class="film-question-intro">${escapeHtml(set.intro)}</div>
    <div class="worksheet-questions">
      ${set.sections
        .map(
          (section) => `<section class="worksheet-section">
        <h4>${escapeHtml(section.title)}</h4>
        ${section.questions.map((question, questionIndex) => renderFilmQuestion(question, questionIndex, set.id)).join("\n")}
      </section>`
        )
        .join("\n")}
    </div>
  </article>`;
}

function renderFilmStudyQuestions() {
  const defaultSet = FILM_QUESTION_SETS[0]?.id ?? "";
  return `<section id="film-study-questions" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Film Study</p>
    <h2>Film Study Questions</h2>
    <p class="page-intro">Answer the film-technique questions as you move through the clips, then use the full-film response prompts after watching one selected feature film.</p>
    <div class="film-question-studio" data-film-question-studio data-default-film-question-set="${escapeHtml(defaultSet)}">
      <section class="story-question-selector">
        <label for="film-question-select">Choose a question set
          <select id="film-question-select" data-film-question-select>
            ${FILM_QUESTION_SETS.map((set, index) => `<option value="${escapeHtml(set.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(set.title)}</option>`).join("\n")}
          </select>
        </label>
      </section>
      <section class="worksheet-panel">
        <div class="worksheet-toolbar">
          <div></div>
          <div class="worksheet-toolbar-actions">
            <span class="worksheet-save-status" data-save-status>Saved locally</span>
            <button type="button" data-film-question-toggle-hints><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
            <button type="button" data-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
          </div>
        </div>
        ${FILM_QUESTION_SETS.map((set, index) => renderFilmQuestionSet(set, index)).join("\n")}
      </section>
    </div>
    <script>
(() => {
  function wordCount(value) {
    return String(value || "").trim().split(/\\s+/).filter(Boolean).length;
  }
  function updateFilmQuestionCounts(root) {
    root.querySelectorAll("[data-film-question-answer]").forEach((field) => {
      const key = field.getAttribute("data-response-id");
      const counter = key ? root.querySelector('[data-film-question-word-count="' + CSS.escape(key) + '"]') : null;
      if (counter) counter.textContent = wordCount(field.value) + " words";
    });
    root.querySelectorAll("[data-film-question-panel]").forEach((panel) => {
      const setId = panel.getAttribute("data-film-question-panel");
      const answers = Array.from(panel.querySelectorAll("[data-film-question-answer]"));
      const answered = answers.filter((field) => String(field.value || "").trim().length > 0).length;
      const total = answers.length;
      const label = root.querySelector('[data-film-question-progress="' + CSS.escape(setId || "") + '"]');
      const fill = root.querySelector('[data-film-question-progress-fill="' + CSS.escape(setId || "") + '"]');
      if (label) label.textContent = answered + " of " + total + " answered";
      if (fill) fill.style.width = total ? Math.round((answered / total) * 100) + "%" : "0%";
    });
  }
  function setFilmQuestionPanel(root, id) {
    root.querySelectorAll("[data-film-question-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-film-question-panel") !== id;
    });
    updateFilmQuestionCounts(root);
  }
  function initFilmQuestions() {
    document.querySelectorAll("[data-film-question-studio]").forEach((root) => {
      const select = root.querySelector("[data-film-question-select]");
      const defaultSet = root.getAttribute("data-default-film-question-set");
      if (select) setFilmQuestionPanel(root, select.value || defaultSet);
      root.addEventListener("change", (event) => {
        const target = event.target.closest("[data-film-question-select]");
        if (target) setFilmQuestionPanel(root, target.value);
      });
      root.addEventListener("input", () => updateFilmQuestionCounts(root));
      root.querySelector("[data-film-question-toggle-hints]")?.addEventListener("click", (event) => {
        const button = event.currentTarget;
        const show = !root.classList.contains("is-showing-hints");
        root.classList.toggle("is-showing-hints", show);
        root.querySelectorAll("[data-film-question-hint]").forEach((hint) => {
          hint.hidden = !show;
        });
        button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (show ? "Hide Hints" : "Show Hints");
      });
      updateFilmQuestionCounts(root);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFilmQuestions);
  else initFilmQuestions();
})();
    </script>
  </section>`;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function renderFilmRoom(videos: ImportedVideo[]) {
  const uniqueVideos = uniqueBy(videos, (video) => video.src);
  if (uniqueVideos.length === 0) {
    return `<section id="film-room" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Film Room</p>
    <h2>Film Room</h2>
    <p class="page-intro">Embedded film-study clips will appear here when they are available in the source package.</p>
    <article class="resource-card"><h3>No embedded clips found</h3><p>The source package did not include playable film clips for this module.</p></article>
  </section>`;
  }
  return `<section id="film-room" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Film Room</p>
    <h2>Film Room</h2>
    <p class="page-intro">Review the film-study clips in one organized playlist.</p>
    <div class="film-room-shell">
      <div class="film-room-stage">
        ${uniqueVideos
          .map(
            (video, index) => `<section class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
          <div class="film-room-header">
            <div>
              <h3>${escapeHtml(video.title)}</h3>
              <p>${escapeHtml(video.lessonTitle)}</p>
            </div>
          </div>
          <iframe class="film-room-frame" src="${escapeHtml(video.src)}" title="${escapeHtml(video.title)}" loading="lazy" allowfullscreen></iframe>
        </section>`
          )
          .join("\n")}
      </div>
      <aside class="film-room-sidebar">
        <div class="film-room-control-panel">
          <h3>Media Playlist</h3>
          <p>Choose a clip from the film-study lessons.</p>
          <label class="film-room-label" for="film-select">Choose a video</label>
          <select id="film-select" class="film-room-select" data-film-select>
            ${uniqueVideos.map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(video.title)}</option>`).join("")}
          </select>
        </div>
        <div class="film-now-panel">
          <h3>Playlist Order</h3>
          <ol class="film-playlist-list">
            ${uniqueVideos.map((video) => `<li><strong>${escapeHtml(video.title)}</strong><span>${escapeHtml(video.lessonTitle)}</span></li>`).join("")}
          </ol>
        </div>
      </aside>
    </div>
  </section>`;
}

function renderResources(links: ImportedLink[], resources: ImportedResource[]) {
  const uniqueLinks = uniqueBy(links, (link) => link.href);
  const uniqueResources = uniqueBy(resources, (resource) => resource.href);
  const externalGroups = Array.from(
    uniqueLinks
      .reduce((groups, link) => {
        const id = `resources-${slugify(link.lessonTitle)}`;
        const existing = groups.get(id) ?? { id, title: link.lessonTitle, items: [] as ImportedLink[] };
        existing.items.push(link);
        groups.set(id, existing);
        return groups;
      }, new Map<string, { id: string; title: string; items: ImportedLink[] }>())
      .values()
  );
  const localSection = uniqueResources.length
    ? `<section class="resource-lesson-group">
        <div class="resource-group-heading">
          <h3>Recovered Unit Documents</h3>
          <p>Local files recovered from the Brightspace export.</p>
        </div>
        <div class="resource-lesson-items">
          ${uniqueResources
            .map(
              (resource) => `<article class="external-resource-card">
                <span class="resource-kicker">Local Source</span>
                <h3>${escapeHtml(resource.title)}</h3>
                <p>${escapeHtml(resource.href)}</p>
                <a class="external-resource-action" href="${escapeHtml(resource.href)}" target="_blank" rel="noopener">Open File</a>
              </article>`
            )
            .join("\n")}
        </div>
      </section>`
    : "";
  const externalSection = externalGroups.length
    ? `<div class="resource-group-control">
        <label class="film-room-label" for="resource-select">Choose a lesson group</label>
        <select id="resource-select" class="film-room-select" data-resource-select>
          ${externalGroups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
        </select>
      </div>
      ${externalGroups
        .map(
          (group, index) => `<section class="resource-lesson-group" data-resource-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
        <div class="resource-group-heading">
          <h3>${escapeHtml(group.title)}</h3>
          <p>${group.items.length} source${group.items.length === 1 ? "" : "s"} collected from this lesson.</p>
        </div>
        <div class="resource-lesson-items">
          ${group.items
            .map(
              (link) => `<article class="external-resource-card">
                <span class="resource-kicker">External Source</span>
                <h3>${escapeHtml(link.text)}</h3>
                <p>${escapeHtml(link.href)}</p>
                <a class="external-resource-action" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">Open Resource</a>
              </article>`
            )
            .join("\n")}
        </div>
      </section>`
        )
        .join("\n")}`
    : "";
  const emptySection =
    !localSection && !externalSection
      ? `<article class="resource-card"><h3>No separate resources found</h3><p>The lesson pages carry the source material directly.</p></article>`
      : "";
  return `<section id="resources" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Resources</p>
    <h2>Resources</h2>
    <p class="page-intro">Useful source links and files collected from the feature-film module.</p>
    <div class="resource-browser">
      ${localSection}
      ${externalSection}
      ${emptySection}
    </div>
  </section>`;
}

function renderExtraCss() {
  return `
.source-content blockquote {
  margin: 1.2rem 0;
  padding: 1rem 1.2rem;
  border-left: 4px solid var(--primary);
  background: #f7f8f4;
}
.source-content .film-embed,
.film-embed {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 280px;
  border: 0;
  border-radius: 8px;
  background: #0f1414;
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.resource-browser {
  display: grid;
  gap: 24px;
  margin-top: 24px;
}
.resource-group-control,
.resource-browser .resource-lesson-group {
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #fff;
}
.resource-group-control {
  max-width: 520px;
  padding: 18px;
}
.resource-browser .resource-lesson-group[hidden] {
  display: none !important;
}
.resource-group-heading {
  padding: 18px 18px 0;
}
.resource-group-heading h3 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  color: #191c1d;
}
.resource-group-heading p {
  margin: 0;
  color: #42493e;
  font-size: 14px;
  line-height: 1.5;
}
.resource-browser .resource-lesson-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  padding: 18px;
}
.story-question-selector {
  max-width: 560px;
  margin-top: 28px;
  padding: 18px;
  border: 1px solid #d9dadb;
  border-radius: 8px;
  background: #fbfcfa;
}
.worksheet-panel {
  margin-top: 28px;
}
.worksheet-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.worksheet-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.worksheet-toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #fff;
  color: #154212;
  padding: 8px 12px;
  font-family: "IBM Plex Sans";
  font-weight: 700;
  cursor: pointer;
}
.worksheet-save-status {
  color: #5d6359;
  font-size: 14px;
}
.worksheet-document {
  overflow: hidden;
  border: 1px solid #d9dadb;
  border-radius: 10px;
  background: #fff;
}
.worksheet-document[hidden] {
  display: none !important;
}
.worksheet-document-header {
  padding: 28px;
  background: #161a17;
  color: #fff;
}
.worksheet-document-header p {
  margin: 0 0 10px;
  color: #b9c3b2;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
.worksheet-document-header h3 {
  margin: 0;
  font-family: "Hanken Grotesk";
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
  font-weight: 800;
}
.worksheet-document-header > span {
  display: block;
  margin-top: 8px;
  color: #d7ddd4;
  font-size: 18px;
}
.worksheet-progress {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,0.16);
}
.worksheet-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #d7ddd4;
  font-size: 14px;
}
.worksheet-progress-track {
  height: 8px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #293029;
}
.worksheet-progress-track div {
  height: 100%;
  width: 0;
  background: #9fcf93;
}
.film-question-intro {
  padding: 22px 28px 0;
  color: #42493e;
  font-size: 17px;
}
.worksheet-questions {
  padding: 26px 28px 0;
}
.worksheet-section {
  margin-bottom: 34px;
}
.worksheet-section h4 {
  margin: 0 0 18px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6e8e5;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  font-weight: 800;
}
.worksheet-question {
  margin-bottom: 26px;
}
.worksheet-question-prompt {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  font-size: 17px;
  line-height: 1.55;
}
.worksheet-question-prompt strong {
  color: #154212;
}
.worksheet-hint {
  margin: 0 0 12px 44px;
  padding: 12px;
  border: 1px solid #d5d8cc;
  border-radius: 8px;
  background: #fbfaf0;
  color: #514d33;
  font-size: 14px;
}
.worksheet-answer-field {
  display: grid;
  gap: 8px;
  margin-left: 44px;
}
.worksheet-answer-field textarea {
  width: 100%;
  min-height: 118px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #f8f9fa;
  padding: 12px;
  font-family: "Work Sans";
  font-size: 15px;
  line-height: 1.55;
  resize: vertical;
}
.worksheet-answer-field textarea:focus {
  border-color: #154212;
  outline: 2px solid rgba(21, 66, 18, 0.18);
  background: #fff;
}
.worksheet-word-count {
  justify-self: end;
  color: #747a70;
  font-size: 12px;
}
.external-resource-card {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  color: #191c1d;
}
.resource-kicker {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.external-resource-card h3 {
  margin: 0;
  font-family: "Hanken Grotesk";
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  color: #191c1d;
}
.external-resource-card p {
  margin: 0;
  color: #42493e;
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.external-resource-card .external-resource-action {
  margin-top: auto;
}
.film-room-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
  margin-top: 24px;
}
.film-room-stage,
.film-room-control-panel,
.film-now-panel {
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #fff;
}
.film-room-stage {
  padding: 18px;
  background: #f8f9fa;
}
.film-panel[hidden] {
  display: none !important;
}
.film-room-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.film-room-header h3,
.film-room-control-panel h3,
.film-now-panel h3 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  color: #191c1d;
}
.film-room-header p,
.film-room-control-panel p {
  margin: 0;
  color: #42493e;
  font-size: 14px;
  line-height: 1.5;
}
.film-room-frame {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 360px;
  border: 1px solid #191c1d;
  border-radius: 8px;
  background: #000;
}
.film-room-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.film-room-control-panel,
.film-now-panel {
  padding: 18px;
}
.film-room-label {
  display: block;
  margin: 18px 0 8px;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  line-height: 1.4;
  font-weight: 600;
  color: #154212;
}
.film-room-select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #c2c9bb;
  border-radius: 8px;
  background: #fff;
  color: #191c1d;
  padding: 9px 12px;
  font-family: "Work Sans";
  font-size: 15px;
  line-height: 1.4;
}
.film-room-select:focus {
  border-color: #154212;
  outline: 2px solid rgba(21, 66, 18, 0.22);
  outline-offset: 2px;
}
.film-playlist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0 0;
  padding-left: 20px;
}
.film-playlist-list li {
  color: #154212;
}
.film-playlist-list strong,
.film-playlist-list span {
  display: block;
}
.film-playlist-list strong {
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 15px;
  line-height: 1.25;
}
.film-playlist-list span {
  margin-top: 3px;
  color: #42493e;
  font-size: 13px;
  line-height: 1.35;
}
@media (max-width: 820px) {
  .resource-grid,
  .film-room-shell { grid-template-columns: 1fr; }
  .film-room-frame { min-height: 220px; }
  .worksheet-toolbar { align-items: stretch; flex-direction: column; }
  .worksheet-toolbar-actions { align-items: stretch; flex-direction: column; }
  .worksheet-question-prompt { grid-template-columns: 1fr; }
  .worksheet-answer-field,
  .worksheet-hint { margin-left: 0; }
}
`;
}

async function writeProjectMetadata(args: Args, projectDir: string) {
  const now = new Date().toISOString();
  const zipBaseName = path.basename(args.zipPath);
  const projectJsonPath = path.join(projectDir, "meta", "project.json");
  let existingProjectJson:
    | {
        createdAt?: string;
        importedFirstPassOrigin?: {
          importedAt?: string;
        };
      }
    | undefined;
  try {
    existingProjectJson = JSON.parse(await fs.readFile(projectJsonPath, "utf8"));
  } catch {
    existingProjectJson = undefined;
  }
  const metadata = {
    id: args.slug,
    slug: args.slug,
    sourcePath: args.zipPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(projectDir, "workspace", "index.html"),
    rawEntrypoint: path.join(projectDir, "raw", zipBaseName),
    createdAt: existingProjectJson?.createdAt ?? now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(projectDir, "workspace", "index.html"),
    canonicalSources: [
      path.join(projectDir, "workspace", "index.html"),
      path.join(ROOT, "scripts", "build-ela20-feature-film.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela20-feature-film.ts --zip "${args.zipPath}" --slug ${args.slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: args.zipPath,
      importedAt: existingProjectJson?.importedFirstPassOrigin?.importedAt ?? now,
      notes: "Feature Film clean build from the supplied ELA 20-1 Brightspace export."
    },
    exportTargets: [
      {
        target: "scorm",
        enabled: true,
        notes: "SCORM 2004 package for Brightspace upload."
      },
      {
        target: "html",
        enabled: true,
        notes: "Standalone workspace preview."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [path.join(projectDir, "raw", zipBaseName)],
    sourceOfTruthNotes:
      "Regenerate from scripts/build-ela20-feature-film.ts; shared shell behavior lives in scripts/lib/next-step-course-shell.ts."
  };
  await fs.writeFile(projectJsonPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

async function writeConversionNotes(args: Args, projectDir: string, lessons: Lesson[]) {
  const activeGroups = Array.from(new Set(lessons.map((lesson) => lesson.group)));
  const note = `# ELA 20-1 Feature Film Conversion Notes

- Source ZIP: \`${args.zipPath}\`
- Workspace entry: \`${path.join(projectDir, "workspace", "index.html")}\`
- Builder: \`scripts/build-ela20-feature-film.ts\`
- Shared shell: \`scripts/lib/next-step-course-shell.ts\`

## Included lesson groups

${activeGroups.map((group) => `- ${group}`).join("\n")}

## Lesson count

${lessons.map((lesson, index) => `${index + 1}. ${lesson.title} (${lesson.entry})`).join("\n")}

## Notes

- Source images are copied into \`workspace/assets/imported/\`.
- Embedded YouTube clips are preserved in lesson pages and collected in Film Room.
- The source ZIP remains reference-only in \`raw/\`; regenerate the workspace from the builder instead of editing generated export bundles.
`;
  await fs.writeFile(path.join(projectDir, "meta", "conversion-notes.md"), note, "utf8");
}

async function build() {
  const args = parseArgs();
  const zipBuffer = await fs.readFile(args.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const projectDir = path.join(ROOT, "projects", args.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const rawDir = path.join(projectDir, "raw");
  const metaDir = path.join(projectDir, "meta");
  const importedAssetsDir = path.join(workspaceDir, "assets", "imported");
  const resourceDir = path.join(workspaceDir, "assets", "resources");
  const brandDir = path.join(workspaceDir, "assets", "brand");

  await fs.rm(workspaceDir, { recursive: true, force: true });
  await fs.mkdir(importedAssetsDir, { recursive: true });
  await fs.mkdir(resourceDir, { recursive: true });
  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  await fs.copyFile(NEXT_STEP_LOGO_SOURCE_PATH, path.join(brandDir, "nxt-ce-logo-white-with-ce.png"));
  await fs.copyFile(args.zipPath, path.join(rawDir, path.basename(args.zipPath)));

  const lessons = await loadLessons(zip, importedAssetsDir, resourceDir);
  const videos = lessons.flatMap((lesson) => lesson.videos);
  const links = lessons.flatMap((lesson) => lesson.links);
  const resources = lessons.flatMap((lesson) => lesson.resources);
  const html = renderNextStepCourseShell({
    slug: args.slug,
    courseTitle: COURSE_TITLE,
    courseCode: COURSE_CODE,
    overviewIntro:
      "Build a practical film-reading routine: notice how images, editing, sound, movement, and performance shape meaning.",
    outcomes: [
      "I can identify major elements of feature film and explain how they affect viewers.",
      "I can use film vocabulary to describe camera, editing, sound, and mise-en-scene choices.",
      "I can connect film techniques to character, conflict, theme, and audience response."
    ],
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      group: lesson.group,
      html: lesson.html,
      entry: lesson.entry,
      excerpt: lesson.excerpt
    })),
    navItems: [
      {
        id: "viewing-guide",
        label: "Viewing Guide",
        icon: "auto_stories",
        html: renderViewingGuide()
      },
      {
        id: "film-study-questions",
        label: "Film Study Questions",
        icon: "quiz",
        html: renderFilmStudyQuestions()
      },
      {
        id: "film-room",
        label: "Film Room",
        icon: "slideshow",
        html: renderFilmRoom(videos)
      },
      {
        id: "resources",
        label: "Resources",
        icon: "folder_open",
        html: renderResources(links, resources)
      }
    ],
    lessonGroupTitle: "Feature Film + Film Study",
    lessonSequenceTitle: "Feature Film Lesson Sequence",
    sourceLessonLabel: "source lessons",
    nextAfterLastLesson: { id: "viewing-guide", label: "Open Viewing Guide" },
    extraCss: renderExtraCss()
  });

  await fs.writeFile(path.join(workspaceDir, "index.html"), html, "utf8");
  await writeProjectMetadata(args, projectDir);
  await writeConversionNotes(args, projectDir, lessons);
  console.log(`Built ${args.slug} with ${lessons.length} lessons at ${path.join(workspaceDir, "index.html")}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
