import {
  renderEnglishActivityProfile,
  type EnglishActivityQuestion,
  type EnglishActivityQuestionSet,
  type EnglishActivityRenderContext,
  type EnglishFilmStudyProfile,
  type EnglishMaterialHook,
  type EnglishModernDramaProfile,
  type EnglishModernDramaScene,
  type EnglishNovelStudyProfile,
  type EnglishRenderedActivityNavGroup,
  type EnglishRenderedActivityProfile,
  type EnglishWritingTool,
} from "./activity-profile-renderers.js";
import {
  buildEla20CrucibleActivityProfile,
  buildEla20FilmStudyActivityProfile,
  buildEla20NovelStudyActivityProfile,
} from "./ela20-activity-profiles.js";
import {
  buildDraculaActQuestionSets,
  buildQuestionSetsFromResources,
  type EnglishPreparedResource,
} from "./factory-resources.js";
import { safeId } from "./source.js";
import type {
  EnglishFilmStudyActivityProfile,
  EnglishModernDramaActivityProfile,
  EnglishNovelStudyActivityProfile,
  EnglishUnitRecipeV3,
} from "./types.js";
import {
  renderEnglishWritingSequences,
  type EnglishWritingWork,
} from "./writing-sequence-renderer.js";

/** Prepared learner resource accepted by the V3 medium-profile adapter. */
export type EnglishResource = EnglishPreparedResource;

export type EnglishV3MediumProfileKind = "modern-drama" | "novel-study" | "film-study";

export type EnglishV3MediumProfileRenderInput = {
  recipe: EnglishUnitRecipeV3;
  resources: readonly EnglishResource[];
  context?: EnglishActivityRenderContext;
};

const ELA30_FEATURE_FILM_DONOR_CONTEXT: EnglishActivityRenderContext = {
  videos: [
    {
      id: "BXAr2yiYCV4",
      lessonTitle: "Elements of Film: Visual Storytelling",
      embedSrc: "https://www.youtube.com/embed/BXAr2yiYCV4?rel=0&wmode=opaque",
    },
    {
      id: "3Sr-vxVaY_M",
      lessonTitle: "Elements of Film: Editing",
      embedSrc: "https://www.youtube.com/embed/3Sr-vxVaY_M?rel=0&wmode=opaque",
    },
    {
      id: "G45X6fSk1do",
      lessonTitle: "Elements of Film: Continuity",
      embedSrc: "https://www.youtube.com/embed/G45X6fSk1do?wmode=opaque&rel=0",
    },
    {
      id: "sgiZb8jJgF8",
      lessonTitle: "Elements of Film: Sound",
      embedSrc: "https://www.youtube.com/embed/sgiZb8jJgF8?wmode=opaque&rel=0",
    },
  ],
  filmStudy: {
    routes: { resources: "materials" },
    resourcePage: {
      includeVideos: false,
      label: "Materials",
      title: "Materials",
      description: "Useful source links and files collected from the feature-film unit. Choose a lesson group to keep the material list focused.",
    },
    resources: [
      {
        id: "cabinet-of-dr-caligari",
        title: "The Cabinet of Dr. Caligari",
        description: "Background and production context for an influential work of visual storytelling.",
        group: "Elements of Film",
        kind: "link",
        href: "https://en.wikipedia.org/wiki/The_Cabinet_of_Dr._Caligari",
        actionLabel: "Open Resource",
      },
      {
        id: "five-formal-elements-of-film",
        title: "The Five Formal Elements of Film",
        description: "A concise reference for applying formal film elements during close viewing.",
        group: "Elements of Film",
        kind: "link",
        href: "http://collinsvillelibrary.blogspot.ca/2013/03/the-five-formal-elements-of-film-how-to.html",
        actionLabel: "Open Resource",
      },
      {
        id: "continuity-editing",
        title: "Continuity Editing",
        description: "Background on continuity editing and how it creates coherent screen action.",
        group: "Elements of Film - Continued",
        kind: "link",
        href: "https://en.wikipedia.org/wiki/Continuity_editing",
        actionLabel: "Open Resource",
      },
    ],
  },
};

const WRITING_ROUTE_PREFIXES = [
  "critical-essay",
  "literary-exploration",
  "personal-response",
  "visual-response",
] as const;

function isWritingRoute(route: string) {
  return WRITING_ROUTE_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}-`));
}

function humanizeId(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

function assertV3MediumRecipe(recipe: EnglishUnitRecipeV3): asserts recipe is EnglishUnitRecipeV3 & {
  activityProfile: EnglishModernDramaActivityProfile | EnglishNovelStudyActivityProfile | EnglishFilmStudyActivityProfile;
} {
  if (recipe.schemaVersion !== 3) throw new Error("The V3 medium-profile renderer requires an EnglishUnitRecipeV3 recipe.");
  if (!recipe.projectSlug.trim() || !recipe.courseCode.trim() || !recipe.unitTitle.trim()) {
    throw new Error("The V3 medium-profile renderer requires projectSlug, courseCode, and unitTitle.");
  }
  if (!(["modern-drama", "novel-study", "film-study"] as string[]).includes(recipe.activityProfile.kind)) {
    throw new Error(`Unsupported V3 medium activity profile: ${recipe.activityProfile.kind}`);
  }
  const forms = recipe.writingForms.map((form) => form.kind);
  if (forms.includes("critical-essay")) throw new Error("ELA -2 medium profiles cannot render Critical Essay.");
  if (new Set(forms).size !== forms.length) throw new Error("ELA -2 medium profiles cannot contain duplicate writing forms.");
  if (forms.includes("visual-response") && !/^ELA\s*30-2$/i.test(recipe.courseCode.trim())) {
    throw new Error("Visual Response is available only in ELA 30-2 medium profiles.");
  }
}

function resourceKind(resource: EnglishResource): EnglishMaterialHook["kind"] {
  if (resource.role === "media" || /\.(?:mp4|mov|m4v|webm)$/i.test(resource.href ?? resource.source)) return "video";
  if (/\.(?:png|jpe?g|gif|webp|svg)$/i.test(resource.href ?? resource.source)) return "image";
  if (/^https?:\/\//i.test(resource.href ?? "")) return "link";
  return "document";
}

function materialsFromResources(resources: readonly EnglishResource[]): EnglishMaterialHook[] {
  return resources
    .filter((resource) => resource.role !== "lesson" && resource.role !== "excluded-assessment" && Boolean(resource.href) && !resource.reviewRequired)
    .map((resource) => {
      const kind = resourceKind(resource);
      return {
        id: safeId(resource.id || resource.title),
        title: resource.title,
        kind,
        description: resource.role === "question-set"
          ? "Question and activity material for this unit."
          : resource.role === "reading"
            ? "Assigned text for this unit."
            : kind === "video"
              ? "Course video for this unit."
              : "Course material for this unit.",
        href: resource.href,
        actionLabel: kind === "video" ? "Open Video" : "Open",
        downloadable: !/^https?:\/\//i.test(resource.href ?? ""),
        embeddable: kind !== "link",
        status: "available",
      } satisfies EnglishMaterialHook;
    });
}

function questionSetsFromResources(resources: readonly EnglishResource[], unitTitle: string): EnglishActivityQuestionSet[] {
  const draculaAssignments = resources.find((resource) => resource.id === "dracula-assignments");
  if (draculaAssignments) return buildDraculaActQuestionSets(draculaAssignments);
  return resources
    .filter((resource) => resource.role === "question-set" && resource.text?.trim())
    .flatMap((resource, index) => {
      try {
        return buildQuestionSetsFromResources([resource], {
          idPrefix: `${safeId(unitTitle)}-${safeId(resource.id || String(index + 1))}`,
          titlePrefix: `${unitTitle} Questions`,
          hint: "Return to the assigned work and support your response with precise evidence.",
          preserveNumberedItems: true,
          normalizeSharedQuotationDirections: true,
        });
      } catch {
        // A prepared file can be a useful downloadable question sheet without
        // having sufficiently structured text for safe interactive extraction.
        return [];
      }
    });
}

function isGenericNovelQuestionLabel(value: string | undefined) {
  return !value || /^novel unit\b.*\bquestion\s+\d+$/i.test(value.trim()) || /^your response$/i.test(value.trim());
}

function novelQuestionText(question: EnglishActivityQuestion) {
  return [question.label, question.prompt, question.hint].filter(Boolean).join(" ");
}

function novelTrackQuestionSets(
  questionSets: readonly EnglishActivityQuestionSet[],
  tracks: ReadonlyArray<{ id: string; title: string; author?: string }>,
) {
  const allTrackTerms = tracks.map((track) => ({
    track,
    terms: [track.title, track.author].filter(Boolean).map((value) => value!.toLowerCase()),
  }));

  return tracks.flatMap((track) => questionSets.flatMap((set, setIndex) => {
    const sourceSetId = set.id?.trim() || `${safeId(set.title || "novel-questions")}-${setIndex + 1}`;
    const questions = set.questions.flatMap((question, questionIndex) => {
      const searchable = novelQuestionText(question).toLowerCase();
      const matchingTracks = allTrackTerms.filter(({ terms }) => terms.some((term) => searchable.includes(term)));
      if (matchingTracks.length && !matchingTracks.some((match) => match.track.id === track.id)) return [];

      const promotedPrompt = [question.prompt, question.hint, question.label]
        .find((value) => value?.trim() && !isGenericNovelQuestionLabel(value));
      const label = promotedPrompt?.trim() || question.label?.replace(/^novel unit\b.*\bquestion\s+/i, "Question ") || "Reading response";
      return [{
        ...question,
        id: question.id?.trim() || `${sourceSetId}-${track.id}-question-${questionIndex + 1}`,
        label,
        prompt: question.prompt === promotedPrompt ? undefined : question.prompt,
        hint: question.hint === promotedPrompt
          ? "Develop your response with precise evidence from the novel."
          : question.hint,
      }];
    });
    if (!questions.length) return [];
    return [{
      ...set,
      id: `${sourceSetId}-${track.id}`,
      title: `${track.title} Questions`,
      subtitle: "Assigned reading questions",
      trackIds: [track.id],
      questions,
    }];
  }));
}

function requiredPageText(resource: EnglishResource, start: number, end: number) {
  const pages = (resource.pages ?? []).filter((page) => page.page >= start && page.page <= end);
  const expectedCount = end - start + 1;
  if (pages.length !== expectedCount) {
    throw new Error(`Dracula script requires source PDF pages ${start}-${end}; found ${pages.length} of ${expectedCount}.`);
  }
  return pages.map((page) => page.text).join("\n\n").trim();
}

function stripThroughHeading(value: string, heading: RegExp) {
  const match = value.match(heading);
  return match?.index === undefined ? value.trim() : value.slice(match.index + match[0].length).trim();
}

/** Maps the inventoried Dracula anthology pages onto the play's actual act/scene structure. */
export function buildDraculaScriptScenes(resource: EnglishResource): EnglishModernDramaScene[] {
  const actOne = stripThroughHeading(
    requiredPageText(resource, 3, 12),
    /The\s+library\s+on\s+the\s+ground\s+floor\s+of\s+Dr\.\s*Seward['’]s\s+Sanitarium\s+at\s+Purley\.?/i,
  );
  const actTwo = requiredPageText(resource, 14, 18);
  const actThree = requiredPageText(resource, 20, 26);
  const sceneTwoHeading = /(?:^|\n)\s*SCENE\s+II:\s*/im;
  const sceneTwoMatch = sceneTwoHeading.exec(actThree);
  if (!sceneTwoMatch || sceneTwoMatch.index <= 0) {
    throw new Error("Dracula Act III source pages 20-26 did not contain the expected Scene II heading.");
  }
  const actThreeSceneOne = stripThroughHeading(
    actThree.slice(0, sceneTwoMatch.index),
    /ACT\s*THREE\s*\n\s*SCENE\s+I:\s*/i,
  );
  const actThreeSceneTwo = actThree.slice(sceneTwoMatch.index + sceneTwoMatch[0].length).trim();
  return [
    { id: "act-1-scene-1", act: 1, scene: 1, title: "Act 1 — The Library", text: actOne },
    { id: "act-2-scene-1", act: 2, scene: 1, title: "Act 2 — Lucy's Bedroom", text: actTwo },
    { id: "act-3-scene-1", act: 3, scene: 1, title: "Act 3, Scene 1 — The Library", text: actThreeSceneOne },
    { id: "act-3-scene-2", act: 3, scene: 2, title: "Act 3, Scene 2 — The Vault", text: actThreeSceneTwo },
  ];
}

function ordinalNumber(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  const words: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10 };
  if (words[normalized]) return words[normalized];
  if (/^\d+$/.test(normalized)) return Number(normalized);
  const romans: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
  return romans[normalized];
}

function scriptScenesFromResources(resources: readonly EnglishResource[]): EnglishModernDramaScene[] {
  const script = resources.find((resource) => resource.role === "reading" && resource.text?.trim());
  if (!script?.text) return [];
  if (script.id === "dracula-script" && script.pages?.length) return buildDraculaScriptScenes(script);
  const lines = script.text.replace(/\r\n?/g, "\n").split("\n");
  const scenes: EnglishModernDramaScene[] = [];
  let act = 1;
  let scene = 0;
  let title = "";
  let body: string[] = [];
  const flush = () => {
    const text = body.join("\n").trim();
    if (scene > 0 && text) scenes.push({ id: `act-${act}-scene-${scene}`, act, scene, title: title || `Act ${act}, Scene ${scene}`, text });
    body = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const actOnly = line.match(/^ACT\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVX]+|\d+)\s*$/i);
    const combined = line.match(/^ACT\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVX]+|\d+)[\s,.:–—-]+SCENE\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVX]+|\d+)\b\s*(.*)$/i);
    const sceneOnly = line.match(/^SCENE\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVX]+|\d+)\b\s*(.*)$/i);
    if (combined) {
      flush();
      act = ordinalNumber(combined[1]) ?? act;
      scene = ordinalNumber(combined[2]) ?? 1;
      title = `Act ${act}, Scene ${scene}${combined[3]?.trim() ? ` — ${combined[3].trim()}` : ""}`;
    } else if (actOnly) {
      flush();
      act = ordinalNumber(actOnly[1]) ?? act;
      scene = 0;
      title = "";
    } else if (sceneOnly) {
      flush();
      scene = ordinalNumber(sceneOnly[1]) ?? scene + 1;
      title = `Act ${act}, Scene ${scene}${sceneOnly[2]?.trim() ? ` — ${sceneOnly[2].trim()}` : ""}`;
    } else if (scene > 0) {
      body.push(rawLine);
    }
  }
  flush();
  return scenes;
}

function scriptSpeakers(scenes: readonly EnglishModernDramaScene[]) {
  const speakers = new Set<string>();
  for (const scene of scenes) {
    for (const line of scene.text.split(/\n/)) {
      const colonName = line.match(/^\s*([A-Z][A-Z .'-]{1,40}):/);
      const standaloneName = line.match(/^\s*([A-Z][A-Z .'-]{1,40})\s*$/);
      const value = (colonName?.[1] ?? standaloneName?.[1])?.replace(/\s+/g, " ").trim();
      if (value && !/^(?:ACT|SCENE|SETTING|LIGHTS?|CURTAIN)$/i.test(value)) speakers.add(value);
    }
  }
  return [...speakers].slice(0, 24);
}

function playTitle(unitTitle: string) {
  return unitTitle
    .replace(/^Modern\s+(?:Play|Drama)\s*[-:–—]\s*/i, "")
    .replace(/^Stage\s+and\s+Screen\s*[-:–—]\s*/i, "")
    .trim() || unitTitle;
}

function streetcarWritingTools(play: string): EnglishWritingTool[] {
  const playOptions = [play];
  return [
    {
      id: "text-knowledge",
      title: "Text Knowledge",
      description: "Review character, conflict, motif, symbol, and dramatic construction before drafting.",
      evidenceMode: "collection",
      evidenceLabel: "Save Text Knowledge to Evidence Bank",
      fields: [
        { id: "focus", label: "Choose a text-knowledge focus", type: "select", options: ["Character motivation", "Central conflict", "Motif or symbol", "Dramatic structure", "Theme development"], hint: "Choose the area that most needs review before you draft." },
        { id: "text", label: "Play", type: "select", options: playOptions },
        { id: "precise-moment", label: "Precise scene, line, or stage direction", placeholder: "Identify the exact moment and its scene location.", evidenceRole: "detail", hint: "Use a precise moment rather than a broad plot event." },
        { id: "knowledge", label: "What does this moment establish or reveal?", placeholder: "Explain the character, conflict, motif, structure, or idea this moment helps you understand.", evidenceRole: "connection" },
      ],
    },
    {
      id: "thesis-workshop",
      title: "Thesis Workshop",
      description: "Build a defensible thesis by connecting topic, character or conflict, analytical action, and universal significance.",
      evidenceMode: "collection",
      evidenceLabel: "Save Thesis Workshop to Evidence Bank",
      fields: [
        { id: "topic", label: "Assigned topic or central idea", placeholder: "Restate the topic in your own words.", hint: "Name the idea the response must explore." },
        { id: "focus", label: "Character or conflict focus", type: "select", options: ["Blanche DuBois", "Stanley Kowalski", "Stella Kowalski", "Harold “Mitch” Mitchell", "Old South versus New South", "Illusion versus reality", "Desire, power, and self-preservation"] },
        { id: "analytical-action", label: "Analytical action", placeholder: "Explain what the character does psychologically or what the conflict reveals.", hint: "Elevate the idea beyond plot summary." },
        { id: "universal-significance", label: "Universal significance", placeholder: "State the larger insight about people, society, or human experience." },
        { id: "thesis", label: "Complete thesis", placeholder: "Combine the topic, focus, analytical action, and significance into one controlled thesis.", evidenceRole: "connection" },
      ],
    },
    {
      id: "evidence-collector",
      title: "Evidence Collector",
      description: "Build a precise analytical evidence record by connecting dramatic technique, textual evidence, analytical language, and thematic function.",
      evidenceMode: "individual",
      evidenceLabel: "Save Evidence Entry to Evidence Bank",
      fields: [
        { id: "source", label: "Act, scene, and speaker", placeholder: "Record where the evidence occurs.", evidenceRole: "source" },
        { id: "technique", label: "Dramatic or literary technique", type: "select", options: ["Imagery", "Symbolism", "Motif", "Tone", "Diction", "Irony", "Stage direction", "Dramatic contrast", "Characterization", "Conflict", "Setting", "Music or sound"] , evidenceRole: "concept" },
        { id: "evidence", label: "Exact quotation, action, or stage direction", placeholder: "Record the precise evidence.", evidenceRole: "detail" },
        { id: "analysis", label: "Analytical explanation", placeholder: "Explain how Williams uses the technique and what the evidence reveals.", evidenceRole: "connection" },
        { id: "thematic-function", label: "Thematic function", placeholder: "Connect the evidence to the play’s larger idea.", evidenceRole: "counterpoint" },
      ],
    },
    {
      id: "paragraph-architect",
      title: "Paragraph Architect",
      description: "Build a PETAL body paragraph with a point, evidence, technique, analysis, and link that remain controlled by the thesis.",
      evidenceMode: "collection",
      evidenceLabel: "Save Paragraph to Evidence Bank",
      fields: [
        { id: "point", label: "P — Point", placeholder: "Write an arguable topic sentence connected to the thesis.", hint: "Make an analytical claim rather than summarizing the scene." },
        { id: "evidence", label: "E — Evidence", placeholder: "Integrate a precise quotation, action, or stage direction.", evidenceRole: "detail" },
        { id: "technique", label: "T — Technique", placeholder: "Name the dramatic or literary choice Williams uses.", evidenceRole: "concept" },
        { id: "analysis", label: "A — Analysis", placeholder: "Explain how the evidence and technique prove the point.", evidenceRole: "connection" },
        { id: "link", label: "L — Link", placeholder: "Connect the analysis back to the thesis and larger human idea." },
        { id: "paragraph", label: "Assembled analytical paragraph", placeholder: "Combine and revise the PETAL parts into one fluent paragraph.", rows: 8 },
      ],
    },
  ];
}

function renderModernDramaNative(recipe: EnglishUnitRecipeV3, resources: readonly EnglishResource[]) {
  const configuration = recipe.activityProfile as EnglishModernDramaActivityProfile;
  const donor = buildEla20CrucibleActivityProfile({ projectSlug: recipe.projectSlug });
  const title = playTitle(recipe.unitTitle);
  const materials = materialsFromResources(resources);
  const questionSets = questionSetsFromResources(resources, title);
  const scenes = scriptScenesFromResources(resources);
  const speakers = scriptSpeakers(scenes);
  const characters = configuration.characterIds.length
    ? configuration.characterIds.map((id) => ({ id: safeId(id), name: humanizeId(id) }))
    : speakers.slice(0, 8).map((name) => ({ id: safeId(name), name }));
  const fallbackSets = configuration.actIds.map((id, index) => ({
    id: safeId(id),
    title: humanizeId(id) || `Act ${index + 1} Questions`,
    subtitle: "Interactive questions pending source mapping",
    questions: [],
  } satisfies EnglishActivityQuestionSet));
  const profile: EnglishModernDramaProfile = {
    ...donor,
    namespace: recipe.projectSlug,
    courseCode: recipe.courseCode,
    unitTitle: recipe.unitTitle,
    recipeProfile: undefined,
    playTitle: title,
    scriptScenes: scenes,
    scriptSpeakers: speakers,
    questionNavigation: questionSets.some((set) => set.questions.some((question) => /scene/i.test(question.section ?? ""))) ? "scene" : "act",
    materials: materials.length ? materials : [{ id: `${safeId(title)}-access`, title, description: "Use the teacher-provided or school-licensed edition of the play.", status: "access-required" }],
    actQuestionSets: questionSets.length ? questionSets : fallbackSets,
    characters: characters.length ? characters : [{ id: "central-character", name: "Central Character" }],
    writingTools: configuration.activities.some((activity) => activity.enabled && activity.route === "writing-studio")
      ? streetcarWritingTools(title)
      : undefined,
    essay: undefined,
  };
  return renderEnglishActivityProfile(profile);
}

function renderNovelNative(recipe: EnglishUnitRecipeV3, resources: readonly EnglishResource[]) {
  const configuration = recipe.activityProfile as EnglishNovelStudyActivityProfile;
  const donor = buildEla20NovelStudyActivityProfile({ projectSlug: recipe.projectSlug, courseCode: recipe.courseCode, unitTitle: recipe.unitTitle });
  const tracks = configuration.novels.length
    ? configuration.novels.map((track) => ({ ...track, id: safeId(track.id) }))
    : [{ id: safeId(recipe.unitTitle), title: recipe.unitTitle }];
  const materials = materialsFromResources(resources);
  const questionSets = questionSetsFromResources(resources, recipe.unitTitle);
  const trackQuestionSets = novelTrackQuestionSets(questionSets, tracks);
  const profile: EnglishNovelStudyProfile = {
    ...donor,
    namespace: recipe.projectSlug,
    courseCode: recipe.courseCode,
    unitTitle: recipe.unitTitle,
    recipeProfile: undefined,
    tracks,
    materials: [
      ...tracks.filter((track) => !materials.some((material) => material.title.toLowerCase().includes(track.title.toLowerCase())))
        .map((track) => ({ id: `${safeId(track.id)}-access`, title: track.title, description: "Use the teacher-provided or school-licensed edition.", status: "access-required" as const })),
      ...materials,
    ],
    questionSets: trackQuestionSets.length ? trackQuestionSets : donor.questionSets,
  };
  return renderEnglishActivityProfile(profile);
}

function renderFilmNative(recipe: EnglishUnitRecipeV3, resources: readonly EnglishResource[], context?: EnglishActivityRenderContext) {
  const configuration = recipe.activityProfile as EnglishFilmStudyActivityProfile;
  const selectedTitle = configuration.filmSelection.mode === "selected" ? configuration.filmSelection.title : undefined;
  const donor = buildEla20FilmStudyActivityProfile({
    projectSlug: recipe.projectSlug,
    courseCode: recipe.courseCode,
    unitTitle: recipe.unitTitle,
    ...(selectedTitle ? { filmTitle: selectedTitle } : {}),
  });
  const questionSets = questionSetsFromResources(resources, recipe.unitTitle);
  const profile: EnglishFilmStudyProfile = {
    ...donor,
    namespace: recipe.projectSlug,
    courseCode: recipe.courseCode,
    unitTitle: recipe.unitTitle,
    recipeProfile: undefined,
    filmSelection: configuration.filmSelection.mode === "selected"
      ? { mode: "selected", title: configuration.filmSelection.title }
      : { mode: "pending" },
    personalResponse: undefined,
    questionSets: questionSets.length ? [...questionSets, ...donor.questionSets] : donor.questionSets,
    materials: materialsFromResources(resources),
  };
  const renderContext = recipe.derivesFromProject === "ela30-1-feature-film-legacy"
    ? {
        ...context,
        ...ELA30_FEATURE_FILM_DONOR_CONTEXT,
        filmStudy: {
          ...context?.filmStudy,
          ...ELA30_FEATURE_FILM_DONOR_CONTEXT.filmStudy,
        },
      }
    : recipe.projectSlug === "ela10-2-film-study"
      ? {
          ...context,
          videos: ELA30_FEATURE_FILM_DONOR_CONTEXT.videos,
        }
    : context;
  return renderEnglishActivityProfile(profile, renderContext);
}

function writingWorks(recipe: EnglishUnitRecipeV3): EnglishWritingWork[] {
  switch (recipe.activityProfile.kind) {
    case "modern-drama": {
      const title = playTitle(recipe.unitTitle);
      return [{ id: safeId(title), title, kind: "play" }];
    }
    case "novel-study":
      return recipe.activityProfile.novels.length
        ? recipe.activityProfile.novels.map((track) => ({ id: safeId(track.id), title: track.title, author: track.author, kind: "novel" }))
        : [{ id: safeId(recipe.unitTitle), title: recipe.unitTitle, kind: "novel" }];
    case "film-study": {
      const title = recipe.activityProfile.filmSelection.mode === "selected" ? recipe.activityProfile.filmSelection.title : "Current Film";
      return [{ id: safeId(title), title, kind: "film" }];
    }
    default:
      throw new Error(`Unsupported V3 medium activity profile: ${recipe.activityProfile.kind}`);
  }
}

function withoutNativeWriting(rendered: EnglishRenderedActivityProfile): EnglishRenderedActivityProfile {
  const pages = rendered.pages
    .filter((page) => !isWritingRoute(page.id))
    .map((page) => page.id === "play-materials"
      ? {
          ...page,
          id: "materials",
          label: "Materials",
          html: page.html
            .replace(/id="play-materials"/g, 'id="materials"')
            .replace(/#play-materials/g, "#materials"),
        }
      : page);
  const pageIds = new Set(pages.map((page) => page.id));
  const navGroups = (rendered.navGroups ?? [])
    .filter((group) => !isWritingRoute(group.id) && pageIds.has(group.id))
    .map((group): EnglishRenderedActivityNavGroup => ({ ...group, itemPageIds: group.itemPageIds.filter((id) => pageIds.has(id) && !isWritingRoute(id)) }));
  return { ...rendered, pages, navGroups };
}

function configuredNativeActivities(
  recipe: EnglishUnitRecipeV3,
  rendered: EnglishRenderedActivityProfile,
): EnglishRenderedActivityProfile {
  const enabledRoutes = new Set(
    recipe.activityProfile.activities
      .filter((activity) => activity.enabled)
      .map((activity) => activity.route),
  );
  const pages = rendered.pages.filter((page) => enabledRoutes.has(page.id));
  const pageIds = new Set(pages.map((page) => page.id));
  const navGroups = (rendered.navGroups ?? [])
    .filter((group) => pageIds.has(group.id))
    .map((group): EnglishRenderedActivityNavGroup => ({
      ...group,
      itemPageIds: group.itemPageIds.filter((pageId) => pageIds.has(pageId)),
    }));
  return { ...rendered, pages, navGroups };
}

/**
 * Renders one Recipe V3 medium activity system. The native medium pages are
 * donated by the approved -1 profile builders; writing routes are always
 * generated afresh from the ordered V3 `writingForms` contract.
 */
export function renderV3MediumProfile(input: EnglishV3MediumProfileRenderInput): EnglishRenderedActivityProfile {
  assertV3MediumRecipe(input.recipe);
  const native = configuredNativeActivities(
    input.recipe,
    withoutNativeWriting(
      input.recipe.activityProfile.kind === "modern-drama"
        ? renderModernDramaNative(input.recipe, input.resources)
        : input.recipe.activityProfile.kind === "novel-study"
          ? renderNovelNative(input.recipe, input.resources)
          : renderFilmNative(input.recipe, input.resources, input.context),
    ),
  );
  const writing = input.recipe.writingForms.length
    ? renderEnglishWritingSequences({
        namespace: input.recipe.projectSlug,
        courseCode: input.recipe.courseCode,
        unitTitle: input.recipe.unitTitle,
        profileKind: input.recipe.activityProfile.kind,
        works: writingWorks(input.recipe),
        visualProfile: "ela20-workbook",
        writingForms: input.recipe.writingForms,
      })
    : { pages: [], navGroups: [], css: "", runtime: "" };
  return {
    ...native,
    pages: [...writing.pages, ...native.pages],
    navGroups: [...writing.navGroups, ...(native.navGroups ?? [])],
    css: [native.css, writing.css].filter(Boolean).join("\n"),
    runtime: [native.runtime, writing.runtime].filter(Boolean).join("\n"),
  };
}
