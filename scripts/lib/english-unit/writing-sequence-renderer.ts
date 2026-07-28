import { safeId } from "./source.js";
import type {
  EnglishActivityField,
  EnglishCriticalEssayProfile,
  EnglishEssayStage,
  EnglishRenderedActivityNavGroup,
  EnglishRenderedActivityPage,
} from "./activity-profile-renderers.js";
import type {
  EnglishActivityEvidencePolicy,
  EnglishActivityProfileV1,
  EnglishWritingFormConfigV1,
  EnglishWritingFormKind,
} from "./types.js";

export type EnglishWritingWorkKind = "text" | "play" | "novel" | "film" | "visual";

export type EnglishWritingWork = {
  id: string;
  title: string;
  author?: string;
  kind: EnglishWritingWorkKind;
};

export type EnglishWritingTrackMode = "unit" | "per-work";
export type EnglishWritingVisualProfile = "standard" | "ela20-workbook";

export type EnglishWritingSequenceInput = {
  namespace: string;
  courseCode: string;
  unitTitle: string;
  profileKind: string;
  works: EnglishWritingWork[];
  visualProfile?: EnglishWritingVisualProfile;
  /**
   * Recipe V3 writing forms. When present this ordered list is authoritative:
   * legacy include flags are ignored and no unlisted route is rendered.
   */
  writingForms?: EnglishWritingFormConfigV1[];
  criticalEssayTrackMode?: EnglishWritingTrackMode;
  personalResponseTrackMode?: EnglishWritingTrackMode;
  includeCriticalEssay?: boolean;
  includePersonalResponse?: boolean;
  criticalEssay?: EnglishCriticalEssayProfile;
  literaryExploration?: EnglishCriticalEssayProfile;
  personalResponse?: EnglishCriticalEssayProfile;
  visualResponse?: EnglishCriticalEssayProfile;
};

export type EnglishWritingSequenceRenderResult = {
  pages: EnglishRenderedActivityPage[];
  navGroups: EnglishRenderedActivityNavGroup[];
  css: string;
  runtime: string;
};

type SequenceKind = EnglishWritingFormKind;

function sequenceTrackMode(input: EnglishWritingSequenceInput, kind: SequenceKind): EnglishWritingTrackMode {
  const configured = input.writingForms?.find((form) => form.kind === kind);
  if (configured) return configured.trackMode;
  if (kind === "critical-essay") return input.criticalEssayTrackMode ?? "unit";
  if (kind === "personal-response") return input.personalResponseTrackMode ?? "unit";
  return "unit";
}

export function ensureStandardEnglishWritingProfile(profile: EnglishActivityProfileV1): EnglishActivityProfileV1 {
  const activities = profile.activities.map((activity) => ({ ...activity, evidencePolicyIds: [...activity.evidencePolicyIds] }));
  const evidencePolicies: EnglishActivityEvidencePolicy[] = profile.evidencePolicies.map((policy) => ({
    ...policy,
    ...(policy.responseIds ? { responseIds: [...policy.responseIds] } : {}),
    ...(policy.tags ? { tags: [...policy.tags] } : {}),
  }));
  const ensure = (route: SequenceKind, title: string) => {
    const policyId = `${route}-writing-stage`;
    const existing = activities.find((activity) => activity.route === route);
    if (existing) {
      existing.enabled = true;
      const nativePolicyIds = existing.evidencePolicyIds.filter((id) => id !== policyId);
      if (nativePolicyIds.length > 0) {
        existing.evidencePolicyIds = nativePolicyIds;
        const orphanedPolicyIndex = evidencePolicies.findIndex((policy) => policy.id === policyId);
        if (orphanedPolicyIndex >= 0) evidencePolicies.splice(orphanedPolicyIndex, 1);
      }
      return;
    } else {
      activities.push({ id: route, title, route, enabled: true, evidencePolicyIds: [policyId], componentSlot: "writing-studio" });
    }
    if (!evidencePolicies.some((policy) => policy.id === policyId)) {
      evidencePolicies.push({
        id: policyId,
        activityId: route,
        saveMode: "collection",
        requiresExplicitSave: true,
        collectionScope: "activity",
        contributionIdTemplate: `{projectSlug}:${route}:unit:{entryId}`,
        tags: [route, "writing-stage"],
      });
    }
  };
  ensure("critical-essay", "Critical Essay");
  ensure("personal-response", "Personal Response");
  return { ...profile, activities, evidencePolicies } as EnglishActivityProfileV1;
}

const proseForms = [
  "Short essay",
  "Editorial",
  "Letter",
  "Screenplay",
  "Diary entry",
  "Interior monologue",
  "Eulogy",
  "Speech",
  "Reminiscence",
  "Short story",
  "Interview",
  "Anecdote",
  "Newspaper article",
  "Personal observation",
  "Rebuttal",
  "Commentary",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function field(id: string, label: string, placeholder: string, hint: string, rows = 5): EnglishActivityField {
  return { id, label, placeholder, hint, rows };
}

function selectedWorkField(works: EnglishWritingWork[], profileKind?: string): EnglishActivityField | undefined {
  if (works.length <= 1) return undefined;
  const kinds = new Set(works.map((work) => work.kind));
  const kind = kinds.size === 1 ? works[0]?.kind : undefined;
  const subject = profileKind === "short-fiction"
    ? { label: "Short story", hint: "Choose the short story that will anchor this response." }
    : kind === "novel"
      ? { label: "Novel", hint: "Choose the novel that will anchor this response." }
      : kind === "play"
        ? { label: "Play", hint: "Choose the play that will anchor this response." }
        : kind === "film"
          ? { label: "Film", hint: "Choose the film that will anchor this response." }
          : { label: "Text or work", hint: "Choose the text or work that will anchor this response." };
  return {
    id: "selected-work",
    label: subject.label,
    type: "select",
    options: works.map((work) => ({ value: work.id, label: work.title })),
    hint: subject.hint,
  };
}

function indefiniteArticle(value: string) {
  return /^[aeiou]/i.test(value.trim()) ? "an" : "a";
}

function mediumTerms(works: EnglishWritingWork[]) {
  const kinds = new Set(works.map((work) => work.kind));
  if (kinds.size > 1) return { noun: "text", creator: "creator", evidence: "quotation, image, scene, action, or precise detail" };
  switch (works[0]?.kind) {
    case "visual":
      return { noun: "visual", creator: "creator", evidence: "subject, composition, angle, colour, contrast, light, symbol, or precise visual detail" };
    case "film":
      return { noun: "film", creator: "filmmaker", evidence: "scene, timestamp, line, image, sound, performance, or film technique" };
    case "play":
      return { noun: "play", creator: "playwright", evidence: "act, scene, line, stage direction, action, or dramatic choice" };
    case "novel":
      return { noun: "novel", creator: "author", evidence: "chapter, page, quotation, image, event, or narrative choice" };
    default:
      return { noun: "text", creator: "author", evidence: "quotation, image, scene, action, or precise detail" };
  }
}

export function buildStandardCriticalEssayProfile(input: Pick<EnglishWritingSequenceInput, "works" | "criticalEssayTrackMode" | "profileKind" | "writingForms">): EnglishCriticalEssayProfile {
  const terms = mediumTerms(input.works);
  const trackMode = input.writingForms?.find((form) => form.kind === "critical-essay")?.trackMode ?? input.criticalEssayTrackMode ?? "unit";
  const workField = trackMode === "per-work" ? undefined : selectedWorkField(input.works, input.profileKind);
  const stages: EnglishEssayStage[] = [
    {
      id: "topic-interpretation",
      title: "Topic and Interpretation",
      focus: "Turn the assigned topic into a defensible controlling interpretation.",
      instruction: `Identify the topic, choose the ${terms.noun} evidence that best reveals it, and state what the ${terms.creator} suggests.`,
      checkpoints: ["I can answer the assigned topic directly.", `I can identify the ${terms.noun} and ${terms.creator} accurately.`, "I can make the interpretation arguable."],
      fields: [
        ...(workField ? [workField] : []),
        field("assigned-topic", "Assigned topic", "Restate the topic in your own words.", "Underline the key idea and the task word before restating it."),
        field("text-insight", `${terms.noun.charAt(0).toUpperCase()}${terms.noun.slice(1)} insight`, `What does the ${terms.noun} suggest about this topic?`, "Name an idea, not only an event or character trait."),
        field("working-thesis", "Working thesis", `Name the ${terms.creator}'s larger idea and the development your essay will trace.`, "Make the claim specific enough that reasonable readers could debate it."),
      ],
    },
    {
      id: "introduction",
      title: "Introduction",
      focus: `Move from the broader human topic to the ${terms.noun}, central conflict, and thesis.`,
      instruction: "Build a purposeful opening, concise context, and a final controlling sentence.",
      checkpoints: ["I can establish the larger human issue.", `I can introduce the ${terms.noun} without plot summary.`, "I can end with a controlling thesis."],
      fields: [
        field("opening", "General topic opening", "Draft two or three sentences that introduce the topic in human terms.", "Begin with the idea, not a dictionary definition or a sweeping claim about all people."),
        field("context", `${terms.noun.charAt(0).toUpperCase()}${terms.noun.slice(1)} and conflict bridge`, `Introduce the ${terms.noun}, ${terms.creator}, character focus, and relevant conflict.`, "Include only context needed to understand the interpretation."),
        field("thesis-revision", "Final thesis sentence", "Write the controlling sentence that will close the introduction and guide the essay.", "Name the idea and how the work develops it."),
      ],
    },
    {
      id: "body-one",
      title: "Body Paragraph 1 - Beginning",
      focus: `Establish the character, conflict, or idea at the beginning of the ${terms.noun}.`,
      instruction: "Build the paragraph from a focused claim, to precise evidence, to analysis of the starting point.",
      checkpoints: ["I can make a focused beginning claim.", "I can identify the evidence precisely.", "I can explain how the evidence supports the thesis."],
      fields: [
        field("claim", "Beginning claim", "Draft the topic sentence and explain the character or conflict at the beginning.", "Make a claim rather than announcing what the paragraph will discuss."),
        field("evidence", "Beginning evidence", `Record the ${terms.evidence} you will use as proof.`, "Include a locator and enough context to make the evidence understandable."),
        field("analysis", "Beginning analysis", "Explain how the evidence establishes the starting point and supports the controlling idea.", `Focus on the ${terms.creator}'s choice and its meaning, not plot summary.`),
      ],
    },
    {
      id: "body-two",
      title: "Body Paragraph 2 - Middle",
      focus: `Analyze the turning point, rising pressure, or change in the middle of the ${terms.noun}.`,
      instruction: "Show how a crisis, choice, discovery, or growing pressure develops the argument.",
      checkpoints: ["I can identify a meaningful turning point.", "I can use precise middle evidence.", "I can explain change or complication in the interpretation."],
      fields: [
        field("claim", "Middle claim or turning point", "State the pressure, crisis, discovery, or choice that drives development.", "Make the paragraph the hinge of the argument."),
        field("evidence", "Middle evidence", `Record the ${terms.evidence} you will use as proof.`, "Choose the strongest evidence of change, not merely the next event."),
        field("analysis", "Middle analysis", "Explain how this moment changes or complicates the character, conflict, and thesis.", "Connect the evidence to both the paragraph claim and the essay's controlling idea."),
      ],
    },
    {
      id: "body-three",
      title: "Body Paragraph 3 - End",
      focus: `Explain the final change, resolution, or unresolved tension in the ${terms.noun}.`,
      instruction: "Use the ending to complete or complicate the interpretation developed through the essay.",
      checkpoints: ["I can make a focused ending claim.", "I can choose precise final evidence.", "I can connect the ending to the beginning, middle, and thesis."],
      fields: [
        field("claim", "Ending claim", "Explain the final change, resolution, or unresolved tension.", "State what the ending asks the reader or viewer to understand."),
        field("evidence", "Ending evidence", `Record the final ${terms.evidence} you will use as proof.`, "Choose a detail that reveals final meaning, not just the last event."),
        field("analysis", "Ending analysis", "Explain how the ending completes or complicates the controlling interpretation.", "Compare the ending with the starting point and turning point."),
      ],
    },
    {
      id: "conclusion-revision",
      title: "Conclusion and Revision",
      focus: "Complete the interpretation and revise the full essay for control and correctness.",
      instruction: "Synthesize the development, explain broader significance, and revise the complete response.",
      checkpoints: ["I can restate the interpretation in fresh language.", "I can explain broader human significance.", "I can revise structure, language, and correctness."],
      fields: [
        field("synthesis", "Restated interpretation", "Restate the thesis in fresh language without repeating it word for word.", "Preserve the central insight while changing the wording."),
        field("significance", "Beginning-middle-end synthesis", "Connect the starting point, turning point, and ending into one clear insight.", "Show development rather than listing three separate moments."),
        field("human-connection", "Broader significance", `Explain what the ${terms.noun}'s idea suggests about people or human experience.`, "Return to the assigned topic without making a universal claim you cannot defend."),
        field("complete-conclusion", "Complete conclusion draft", "Combine the restated interpretation, synthesis, and broader significance into a polished conclusion.", "Revise transitions, sentence control, diction, grammar, punctuation, and spelling."),
      ],
    },
  ];
  return { title: "Critical Analytical Essay", description: `Use this six-stage sequence to turn precise ${terms.noun} evidence into a controlled critical/analytical essay.`, stages };
}

export function buildStandardPersonalResponseProfile(input: Pick<EnglishWritingSequenceInput, "works" | "personalResponseTrackMode" | "profileKind" | "writingForms">): EnglishCriticalEssayProfile {
  const terms = mediumTerms(input.works);
  const trackMode = input.writingForms?.find((form) => form.kind === "personal-response")?.trackMode ?? input.personalResponseTrackMode ?? "unit";
  const workField = trackMode === "per-work" ? undefined : selectedWorkField(input.works, input.profileKind);
  return {
    title: "Personal Response to Text",
    description: `Use this six-stage studio to connect a meaningful ${terms.noun} idea to precise evidence and your own knowledge or experience in a purposeful prose form.`,
    stages: [
      {
        id: "prompt-impression",
        title: "Prompt and Initial Impression",
        focus: "Understand the prompt and decide what idea, feeling, or impression you want to explore.",
        instruction: "Separate the prompt from your first response, then turn that reaction into a focused controlling idea.",
        checkpoints: ["I can identify what the prompt asks me to explore.", `I can name a genuine reaction to the ${terms.noun}.`, "I can turn that reaction into a focused idea."],
        fields: [
          ...(workField ? [workField] : []),
          field("prompt", "Course prompt", "Record or restate the assigned personal-response prompt in your own words.", "Identify the idea or experience the prompt asks you to explore."),
          field("initial-impression", "Initial impression", `What idea, feeling, question, or image from the ${terms.noun} stays with you?`, "Start with an honest reaction that gives you something meaningful to explore."),
          field("controlling-idea", "Controlling idea", "What will your response suggest about the prompt or larger human experience?", "Shape the impression into one direction that can guide the response."),
        ],
      },
      {
        id: "text-evidence",
        title: `${terms.noun.charAt(0).toUpperCase()}${terms.noun.slice(1)} Evidence`,
        focus: `Choose a precise ${terms.noun} moment and explain how it develops your controlling idea.`,
        instruction: `Use ${indefiniteArticle(terms.evidence)} ${terms.evidence} as meaningful support.`,
        checkpoints: [`I can identify a precise ${terms.noun} moment.`, `I can explain the ${terms.creator}'s choice.`, "I can connect the evidence to my controlling idea."],
        fields: [
          field("moment", `${terms.noun.charAt(0).toUpperCase()}${terms.noun.slice(1)} moment`, `Record the ${terms.evidence} you will use.`, "Include a locator and only the context your reader needs."),
          field("creator-choice", `${terms.creator.charAt(0).toUpperCase()}${terms.creator.slice(1)}'s choice`, `What did the ${terms.creator} deliberately do, and what effect does that choice create?`, "Name a deliberate choice rather than only describing what happened."),
          field("meaning", "Connection to your idea", "Explain how this moment develops the idea, feeling, or impression at the centre of your response.", "Return to the controlling idea and explain why this moment matters."),
        ],
      },
      {
        id: "knowledge-experience",
        title: "Knowledge and Experience",
        focus: `Connect the ${terms.noun}'s idea to relevant personal knowledge, observation, or experience.`,
        instruction: `Choose a connection that deepens the response rather than replacing discussion of the ${terms.noun}.`,
        checkpoints: ["I can choose a relevant connection.", "I can explain why the connection matters.", `I can link the connection back to the ${terms.noun} and prompt.`],
        fields: [
          field("connection", "Knowledge or experience", `Describe the memory, observation, learning, or experience that connects meaningfully to the ${terms.noun}.`, "The connection can be ordinary; it needs to be honest and relevant."),
          field("significance", "Why it matters", "What did this connection help you understand, question, or reconsider?", "Explain the insight rather than assuming the connection speaks for itself."),
          field("link-back", `Link back to the ${terms.noun}`, `Explain how the connection strengthens or complicates your interpretation of the ${terms.noun} moment.`, "Bring the response back to the assigned work and prompt."),
        ],
      },
      {
        id: "form-perspective",
        title: "Prose Form and Perspective",
        focus: "Choose the form and perspective that best communicate your idea.",
        instruction: `The response may be personal, critical, creative, or blended, but every choice must remain grounded in the ${terms.noun} and prompt.`,
        checkpoints: ["I can choose a prose form that suits my purpose.", "I can choose a clear perspective and voice.", "I can identify the audience and effect I want."],
        fields: [
          { id: "prose-form", label: "Prose form", type: "select", options: proseForms, hint: "Choose the form that gives your idea and voice the strongest effect." },
          { id: "perspective", label: "Perspective", type: "select", options: ["Personal", "Critical", "Creative", "Blended"], hint: "Choose the perspective that best fits your purpose." },
          field("audience-purpose", "Audience, purpose, and voice", "Who are you addressing, what should the response accomplish, and what voice will fit?", "Make the audience and purpose specific enough to guide your language choices."),
        ],
      },
      {
        id: "response-plan",
        title: "Shape the Response",
        focus: "Plan an opening, development, and ending that suit your chosen prose form.",
        instruction: `Arrange the ${terms.noun} evidence and personal connection so the response develops rather than becoming a list of separate ideas.`,
        checkpoints: ["I can open in a way that suits my form and voice.", `I can develop the ${terms.noun} and personal connection coherently.`, "I can end with a meaningful final insight."],
        fields: [
          field("opening", "Opening move", "Draft the opening that establishes your voice, situation, or controlling idea.", "Open in a way that belongs to the prose form you selected."),
          field("development", "Development sequence", `Plan how the ${terms.noun} evidence, analysis, and personal connection will build on one another.`, "Order the ideas so each one prepares for the next."),
          field("ending", "Ending insight", "Draft the final realization, image, action, or statement that completes the response.", "Leave the reader with the significance of the response, not a summary."),
        ],
      },
      {
        id: "draft-revise",
        title: "Draft and Revise",
        focus: "Write the complete response and revise it for support, form, voice, and correctness.",
        instruction: "Use the plan as a foundation, then make the final response sound intentional and complete in its chosen form.",
        checkpoints: ["I can sustain my controlling idea through the full response.", `I can integrate ${terms.noun} support and personal knowledge purposefully.`, "I can revise for form, voice, clarity, and correctness."],
        fields: [
          field("complete-draft", "Complete response draft", "Write the complete personal response in your chosen prose form.", "Draft for meaning first; revise after the complete response exists.", 14),
          field("support-check", "Evidence and connection check", `Identify where the ${terms.noun} evidence and personal connection are strongest and where more explanation is needed.`, "Check that both sources of support deepen the same controlling idea."),
          field("voice-form-check", "Form, voice, and correctness check", "Record the revisions needed to make the prose form, voice, sentences, and conventions deliberate and clear.", "Revise for form and voice before proofreading individual errors."),
        ],
      },
    ],
  };
}

export function buildStandardLiteraryExplorationProfile(input: Pick<EnglishWritingSequenceInput, "works" | "profileKind" | "writingForms">): EnglishCriticalEssayProfile {
  const terms = mediumTerms(input.works);
  const trackMode = input.writingForms?.find((form) => form.kind === "literary-exploration")?.trackMode ?? "unit";
  const workField = trackMode === "per-work" ? undefined : selectedWorkField(input.works, input.profileKind);
  return {
    title: "Literary Exploration",
    description: `Use this six-stage sequence to explore an assigned idea through a provided text, a studied work, and a meaningful personal connection.`,
    stages: [
      {
        id: "prompt-controlling-idea",
        title: "Prompt and Controlling Idea",
        focus: "Understand the prompt and establish one controlling idea for the complete response.",
        instruction: "Identify the prompt's central idea, connect it to the assigned work, and state a direction that all three body sections can develop.",
        checkpoints: ["I can restate the prompt accurately.", "I can identify an arguable controlling idea.", "I can plan one connected response rather than three separate answers."],
        fields: [
          ...(workField ? [workField] : []),
          field("assigned-prompt", "Assigned prompt", "Restate the Literary Exploration prompt in your own words.", "Underline the central idea and task before restating the prompt."),
          field("prompt-keywords", "Keywords and tensions", "Identify the important words, tensions, or choices in the prompt.", "Choose words that will help you connect all three sources of support."),
          field("controlling-idea", "Controlling idea", "State the idea about human experience that your response will explore.", "Make the idea specific, arguable, and broad enough to connect the assigned text, studied work, and personal experience."),
        ],
      },
      {
        id: "introduction-thesis",
        title: "Introduction and Thesis",
        focus: "Move from the prompt's larger idea to a clear thesis and response plan.",
        instruction: "Build a purposeful opening, establish the central idea, and preview how the response will explore it.",
        checkpoints: ["I can introduce the larger human idea.", "I can state a focused thesis.", "I can prepare the reader for the response's three sources of support."],
        fields: [
          field("opening", "Opening move", "Draft an opening that introduces the larger idea without using a dictionary definition.", "Begin with the human issue or tension at the centre of the prompt."),
          field("context", "Prompt and text context", `Introduce the assigned or provided ${terms.noun} and the context needed for your thesis.`, "Include only the context a reader needs to understand the response."),
          field("thesis", "Thesis", "State the controlling idea and the direction the response will take.", "Your thesis should connect the prompt to a larger insight, not list three body sections."),
        ],
      },
      {
        id: "body-assigned-text",
        title: "Body 1 — Assigned or Provided Text",
        focus: "Use precise evidence from the assigned or provided text to develop the controlling idea.",
        instruction: "Move from a focused claim, to exact evidence, to an explanation of how the creator's choice develops meaning.",
        checkpoints: ["I can make a focused claim about the assigned text.", "I can select and locate precise evidence.", "I can explain how the evidence supports the controlling idea."],
        fields: [
          field("claim", "Assigned-text claim", "State what the assigned or provided text suggests about the prompt.", "Make an analytical claim rather than retelling the text."),
          field("evidence", "Assigned-text evidence", `Record the ${terms.evidence} that best supports the claim.`, "Include a locator and enough context to make the evidence understandable."),
          field("analysis", "Analysis", `Explain the ${terms.creator}'s choice, its effect, and how it develops the controlling idea.`, "Connect the precise detail to the prompt instead of leaving it to speak for itself."),
        ],
      },
      {
        id: "body-studied-work",
        title: "Body 2 — Studied Work",
        focus: "Develop the controlling idea through a second work studied in the course.",
        instruction: "Choose a meaningful moment from the studied work and explain how it extends, contrasts with, or complicates the first text.",
        checkpoints: ["I can identify the studied work accurately.", "I can choose relevant evidence rather than repeat the first body section.", "I can connect the work to the same controlling idea."],
        fields: [
          field("studied-work", "Studied work", "Name the studied work, creator, and relevant context.", "Choose the work that gives you the strongest connection to the prompt."),
          field("evidence", "Studied-work evidence", "Record a precise quotation, scene, image, action, or detail with its locator.", "Choose evidence that extends or complicates the response."),
          field("analysis", "Connection and analysis", "Explain what the studied work suggests and how it deepens the controlling idea.", "Make the relationship between the two works explicit without forcing them to be identical."),
        ],
      },
      {
        id: "body-personal-connection",
        title: "Body 3 — Personal Connection",
        focus: "Use relevant knowledge, observation, or experience to deepen the Literary Exploration.",
        instruction: "Choose a specific connection, explain its significance, and return it to the prompt and controlling idea.",
        checkpoints: ["I can choose a relevant personal connection.", "I can explain what the connection helped me understand.", "I can connect the experience to the texts and prompt."],
        fields: [
          field("connection", "Knowledge, observation, or experience", "Describe the specific connection you will use.", "The connection may be ordinary; it needs to be honest, precise, and relevant."),
          field("significance", "Meaning of the connection", "Explain what this experience helped you understand, question, or reconsider.", "Analyze the connection instead of assuming it speaks for itself."),
          field("link-back", "Link to the controlling idea", "Explain how the connection extends or complicates the insight developed through the texts.", "Return explicitly to the prompt and controlling idea."),
        ],
      },
      {
        id: "conclusion-revision",
        title: "Conclusion and Revision",
        focus: "Synthesize the three sources of support and revise the complete Literary Exploration.",
        instruction: "Restate the controlling idea in fresh language, connect the evidence and experience, and revise for clarity, organization, and correctness.",
        checkpoints: ["I can synthesize rather than list my body sections.", "I can explain the larger significance of the response.", "I can revise for ideas, support, presentation, and correctness."],
        fields: [
          field("synthesis", "Synthesis", "Connect the assigned text, studied work, and personal connection into one final insight.", "Show what becomes clearer when the three sources of support are considered together."),
          field("significance", "Broader significance", "Explain what the controlling idea suggests about people or human experience.", "Avoid unsupported claims about all people or all situations."),
          field("conclusion", "Complete conclusion", "Draft the conclusion in polished prose.", "Restate the thesis in fresh language and end with significance rather than summary."),
          field("revision", "Revision check", "Record the changes needed to improve ideas, evidence, organization, sentences, and correctness.", "Revise meaning and structure before proofreading individual errors."),
        ],
      },
    ],
  };
}

export function buildStandardVisualResponseProfile(input: Pick<EnglishWritingSequenceInput, "works" | "profileKind" | "writingForms">): EnglishCriticalEssayProfile {
  const trackMode = input.writingForms?.find((form) => form.kind === "visual-response")?.trackMode ?? "unit";
  const visualField = trackMode === "per-work" ? undefined : selectedWorkField(input.works, input.profileKind);
  return {
    title: "Visual Response",
    description: "Use this six-stage sequence to move from careful observation, through PACES analysis, to a purposeful critical, creative, or personal response.",
    stages: [
      {
        id: "observe",
        title: "Observe and Inventory",
        focus: "Record what is visibly present before deciding what the visual means.",
        instruction: "Identify the visual and its context, record your first impression, and build a literal inventory without turning inference into fact.",
        checkpoints: ["I can identify the visual and source when known.", "I can separate literal observation from interpretation.", "I can record precise details that may become evidence."],
        fields: [
          ...(visualField ? [visualField] : []),
          field("visual-title", "Visual title or identifier", "Name or briefly identify the visual you are studying.", "Use the supplied title when known; otherwise create a neutral identifier."),
          field("creator-source-context", "Creator, source, and context", "Record the creator, source, date, or context if known. Mark unknown information honestly.", "Do not invent source information."),
          field("first-impression", "First impression", "What feeling, idea, or question first comes to mind?", "Treat this as an initial response that later evidence may confirm or change."),
          field("literal-description", "Literal description", "Describe only what can be directly seen.", "Name people, objects, setting, actions, placement, and visible text before interpreting them."),
          field("observed-details", "Observed-detail inventory", "List precise visual details that may matter.", "Use separate lines for details so you can compare patterns."),
        ],
      },
      {
        id: "paces",
        title: "Analyze Visual Choices using PACES",
        focus: "Analyze how the creator's visual choices guide attention and shape meaning.",
        instruction: "Use PACES to move from observable choices to supported effects and interpretations.",
        checkpoints: ["I can analyze people or subjects and composition.", "I can explain the effect of colour, contrast, and light.", "I can support interpretations of symbols and suggestions with visual evidence."],
        fields: [
          field("paces-people-subjects", "People or Subjects", "Who or what is shown, and what details shape how the subject is presented?", "Notice posture, expression, gesture, clothing, objects, scale, and relationships."),
          field("paces-angle-composition", "Angle and Composition", "How do viewpoint, framing, placement, focus, and space guide attention?", "Describe the choice first, then explain its effect."),
          field("paces-colour-light", "Colour, Contrast, and Light", "How do colour, contrast, shadow, brightness, or texture affect mood and emphasis?", "Avoid treating a colour as a fixed symbol without evidence from the visual."),
          field("paces-effect", "Effect", "What response do these choices create for the viewer, and how?", "Connect the effect to the specific choices already identified."),
          field("paces-symbols", "Symbols and Suggestion", "What details may suggest ideas beyond their literal function?", "Label interpretation as inference and support it with visible patterns."),
        ],
      },
      {
        id: "central-idea",
        title: "Central Idea and Unifying Effect",
        focus: "Select the strongest details and form a defensible controlling idea.",
        instruction: "Test more than one possible interpretation before choosing the idea and intended unifying effect for your response.",
        checkpoints: ["I can select my strongest three details.", "I can state a supported controlling idea.", "I can acknowledge a reasonable alternative interpretation."],
        fields: [
          field("strongest-details", "Strongest three details", "Record the three details that best support your interpretation and explain why each matters.", "Choose details that work together rather than three unrelated observations."),
          field("keyword", "Keyword", "Choose one precise word that captures the central tension or idea.", "Use the keyword to sharpen the controlling idea, not replace it."),
          field("controlling-idea", "Controlling idea", "What does the visual suggest about people, experience, or the assigned prompt?", "Make the interpretation specific and defensible from visible evidence."),
          field("alternative-interpretation", "Alternative interpretation", "What else could a careful viewer reasonably conclude, and why?", "Acknowledge ambiguity instead of presenting inference as certainty."),
          field("unifying-effect", "Intended unifying effect", "What overall response should your finished prose create for the reader?", "Connect content, form, voice, and ending to one intended effect."),
        ],
      },
      {
        id: "prose-form",
        title: "Choose a Prose Form and Plan",
        focus: "Choose a critical, creative, or personal form and preserve a separate plan for each possible branch.",
        instruction: "Select the branch that best serves the controlling idea. Clearly identify invented material when using a creative approach.",
        checkpoints: ["I can choose a form that suits my purpose.", "I can keep critical, creative, and personal planning separate.", "I can distinguish observation from creative invention."],
        fields: [
          { id: "prose-form", label: "Response branch", type: "select", options: ["Critical", "Creative", "Personal"], hint: "Choose the branch that gives the controlling idea the clearest and strongest effect." },
          field("critical-plan", "Critical plan", "Plan a claim, visual evidence, analysis, and progression for a critical response.", "Use visible details as proof and explain how the choices create meaning."),
          field("creative-plan", "Creative plan", "Plan speaker, situation, conflict, imagery, development, and clearly identified invention.", "Creative additions must be presented as invention, not as facts about the visual."),
          field("personal-plan", "Personal plan", "Plan the visual evidence, knowledge or experience, voice, and insight for a personal response.", "Keep the visual central while using experience to deepen the response."),
          field("audience-voice", "Audience, purpose, and voice", "Who is the response for, what should it accomplish, and what voice fits?", "Let purpose guide tone, diction, structure, and perspective."),
        ],
      },
      {
        id: "draft",
        title: "Develop the Response",
        focus: "Draft the opening and development for the selected response branch.",
        instruction: "Use precise visual evidence and a deliberate prose form to create progression toward the intended unifying effect.",
        checkpoints: ["I can create an opening suited to the selected form.", "I can develop the controlling idea using precise visual details.", "I can sustain the intended voice and unifying effect."],
        fields: [
          field("opening", "Opening", "Draft the opening in the selected critical, creative, or personal form.", "Establish the idea, voice, and situation without explaining everything immediately."),
          field("development-one", "Development — first movement", "Develop the first important detail, moment, claim, or image.", "Make the relationship between the detail and controlling idea clear."),
          field("development-two", "Development — second movement", "Extend, contrast, or complicate the response with another precise detail.", "Create progression instead of repeating the first point."),
          field("development-three", "Development — final movement", "Move the response toward its final realization, decision, or synthesis.", "Prepare the ending so it feels earned by the development."),
        ],
      },
      {
        id: "conclusion-revision",
        title: "Conclusion and Revision",
        focus: "Complete the response and revise it for meaning, form, support, presentation, and correctness.",
        instruction: "Draft an ending that completes the unifying effect, assemble the response, and revise without erasing intentional voice.",
        checkpoints: ["I can complete the controlling idea in a form-appropriate ending.", "I can assemble a coherent complete response.", "I can revise for Ideas and Impressions and Presentation."],
        fields: [
          field("conclusion", "Conclusion or final movement", "Draft the ending that completes the response's idea and effect.", "End in a way that belongs to the chosen critical, creative, or personal form."),
          field("complete-response", "Complete response draft", "Assemble and revise the full Visual Response.", "Suggested length for the ELA 30-2 Diploma written response is 300–700 words.", 14),
          field("ideas-impressions-check", "Ideas and Impressions check", "Record revisions needed to strengthen insight, support, and the unifying effect.", "Check that interpretations grow from precise observations and visual evidence."),
          field("presentation-check", "Presentation check", "Record revisions needed to organization, voice, diction, sentences, and correctness.", "Revise the larger form and flow before proofreading individual errors."),
        ],
      },
    ],
  };
}

function renderOptions(field: EnglishActivityField) {
  return (field.options ?? []).map((option) => {
    const value = typeof option === "string" ? option : option.value;
    const label = typeof option === "string" ? option : option.label;
    return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
  }).join("");
}

function renderField(field: EnglishActivityField, responseId: string, number: number) {
  const id = safeId(responseId);
  const hint = field.hint ? `<div class="english-writing-hint" data-english-writing-hint hidden><strong>Hint:</strong> ${escapeHtml(field.hint)}</div>` : "";
  const control = field.type === "select"
    ? `<select id="${id}" data-response-id="${escapeHtml(responseId)}"><option value="">Choose...</option>${renderOptions(field)}</select>`
    : field.type === "text"
      ? `<input id="${id}" type="text" data-response-id="${escapeHtml(responseId)}" placeholder="${escapeHtml(field.placeholder ?? "")}">`
      : `<textarea id="${id}" rows="${field.rows ?? 5}" data-response-id="${escapeHtml(responseId)}" placeholder="${escapeHtml(field.placeholder ?? "")}"></textarea>`;
  return `<div class="english-writing-field" data-activity-response data-evidence-question-number="${number}" data-evidence-question-prompt="${escapeHtml(field.label)}">
    <label for="${id}">${escapeHtml(field.label)}</label>
    ${hint}
    ${control}
    ${field.type === "select" ? "" : `<span class="english-writing-word-count" data-activity-word-count>0 words</span>`}
  </div>`;
}

function renderPacesEvidencePanel(input: {
  namespace: string;
  work: EnglishWritingWork;
  workId: string;
}) {
  const responsePrefix = `${input.namespace}:visual-paces-evidence:${input.workId}`;
  const contributionPrefix = `${input.namespace}:visual-response:${input.workId}:paces-evidence`;
  const sourceId = safeId(`${responsePrefix}:source`);
  const conceptId = safeId(`${responsePrefix}:concept`);
  const detailId = safeId(`${responsePrefix}:detail`);
  const connectionId = safeId(`${responsePrefix}:connection`);
  return `<section class="english-writing-panel english-writing-paces-evidence" data-repeatable-evidence-panel
    data-repeatable-evidence-prefix="${escapeHtml(contributionPrefix)}"
    data-repeatable-evidence-activity-id="visual-response-paces"
    data-repeatable-evidence-activity-title="PACES Visual Evidence"
    data-repeatable-evidence-work-id="${escapeHtml(input.workId)}"
    data-repeatable-evidence-work-title="${escapeHtml(input.work.title)}"
    data-repeatable-evidence-item-label="PACES Evidence">
    <div class="english-writing-paces-evidence-heading"><div><h3>Save PACES evidence individually</h3><p>Keep one especially useful observed detail and its supported effect. Saving it does not remove it from your working Visual Response.</p></div></div>
    <div class="english-writing-paces-evidence-grid">
      <label for="${sourceId}">Visual title or identifier<input id="${sourceId}" type="text" data-response-id="${escapeHtml(`${responsePrefix}:source`)}" data-evidence-draft="source" value="${escapeHtml(input.work.title)}" placeholder="Name the visual or record a short identifier."></label>
      <label for="${conceptId}">PACES category<select id="${conceptId}" data-response-id="${escapeHtml(`${responsePrefix}:concept`)}" data-evidence-draft="concept"><option value="">Choose...</option><option>People or Subjects</option><option>Angle and Composition</option><option>Colour, Contrast, and Light</option><option>Effect</option><option>Symbols and Suggestion</option></select></label>
      <label for="${detailId}">Observed detail<textarea id="${detailId}" rows="4" data-response-id="${escapeHtml(`${responsePrefix}:detail`)}" data-evidence-draft="detail" placeholder="Describe exactly what can be seen before interpreting it."></textarea></label>
      <label for="${connectionId}">Effect and supported interpretation<textarea id="${connectionId}" rows="4" data-response-id="${escapeHtml(`${responsePrefix}:connection`)}" data-evidence-draft="connection" placeholder="Explain the effect of the visual choice and what it may suggest."></textarea></label>
    </div>
    <input type="hidden" data-response-id="${escapeHtml(`${responsePrefix}:active-entry-id`)}" data-repeatable-evidence-active-id>
    <input type="hidden" data-response-id="${escapeHtml(`${responsePrefix}:entry-snapshots`)}" data-repeatable-evidence-snapshots value="{}">
    <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save PACES Evidence to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div>
    <div class="repeatable-evidence-toolbar"><button type="button" data-repeatable-evidence-new><span class="material-symbols-outlined" aria-hidden="true">add</span> New PACES Evidence</button><span data-repeatable-evidence-active-status aria-live="polite">Ready to save new PACES evidence.</span></div>
    <section class="repeatable-evidence-saved" aria-label="Saved PACES Evidence entries"><div><h4>Saved PACES Evidence entries</h4><p>Edit or remove an Evidence Bank copy without deleting the working response.</p></div><div data-repeatable-evidence-list><p>No PACES evidence saved from this activity yet.</p></div></section>
  </section>`;
}

function sequenceTitle(kind: SequenceKind) {
  switch (kind) {
    case "critical-essay": return "Critical Essay";
    case "literary-exploration": return "Literary Exploration";
    case "personal-response": return "Personal Response";
    case "visual-response": return "Visual Response";
  }
}

function routeLabel(kind: SequenceKind) {
  switch (kind) {
    case "critical-essay": return "Critical Analytical Essay Guide";
    case "literary-exploration": return "Literary Exploration Guide";
    case "personal-response": return "Personal Response to Text Guide";
    case "visual-response": return "Visual Response Guide";
  }
}

function writingKicker(kind: SequenceKind) {
  switch (kind) {
    case "critical-essay": return "Critical Analytical Writing";
    case "literary-exploration": return "Literary Exploration Writing";
    case "personal-response": return "Personal Response Writing";
    case "visual-response": return "Visual Response Writing";
  }
}

function trackPickerLabel(kind: SequenceKind) {
  switch (kind) {
    case "critical-essay": return "Choose a text track";
    case "literary-exploration": return "Choose a Literary Exploration track";
    case "personal-response": return "Choose a response text";
    case "visual-response": return "Choose a visual track";
  }
}

function writingGuideContent(input: EnglishWritingSequenceInput, kind: SequenceKind) {
  const terms = mediumTerms(input.works);
  switch (kind) {
    case "critical-essay":
      return {
        criteria: [`I can develop and support a defensible interpretation of the ${terms.noun}.`, "I can organize ideas into a controlled critical/analytical essay.", "I can use precise evidence and explain its analytical value.", "I can revise for structure, language, clarity, and correctness."],
        categories: [["Thought and Understanding", "A defensible interpretation connected to the assigned topic."], ["Supporting Evidence", `Precise ${terms.noun} details selected and explained as proof.`], ["Form and Structure", "Controlled organization, paragraphs, transitions, and unity."], ["Matters of Choice", "Purposeful diction, syntax, voice, tone, and rhetorical control."], ["Matters of Correctness", "Accurate grammar, usage, punctuation, spelling, and sentence control."]],
        focusTitle: `Alberta ${input.courseCode.replace(/^ELA\s*/i, "")} assignment focus`,
        focusCopy: `A critical/analytical response asks you to choose relevant ${terms.noun} evidence, develop an interpretation, and connect that interpretation to the assigned topic. The writing lessons use the Alberta reporting categories for this style of response.`,
      };
    case "literary-exploration":
      return {
        criteria: ["I can develop one controlling idea from an assigned prompt.", "I can use an assigned text, a studied work, and a meaningful personal connection.", "I can explain how each source of support develops the same idea.", "I can revise for ideas, support, organization, language, and correctness."],
        categories: [["Controlling Idea", "A focused interpretation of the prompt that can guide the complete response."], ["Assigned or Provided Text", "Precise evidence selected and explained from the text supplied with the prompt."], ["Studied Work", "Relevant evidence from another work studied in the course."], ["Personal Connection", "Knowledge, observation, or experience that deepens the exploration."], ["Presentation", "Coherent organization, purposeful language, sentence control, and correctness."]],
        focusTitle: "Literary Exploration focus",
        focusCopy: "A Literary Exploration develops one idea through three connected sources of support: the assigned or provided text, a studied work, and relevant personal knowledge or experience. Each section should deepen the same controlling idea.",
      };
    case "personal-response":
      return {
        criteria: [`I can explore an idea, feeling, or impression prompted by the ${terms.noun}.`, `I can use precise ${terms.noun} evidence and relevant knowledge or experience.`, "I can choose a prose form and perspective that suit my purpose.", "I can revise for development, voice, clarity, and correctness."],
        categories: [["Idea or Impression", "A focused response to the prompt that is worth exploring."], [`${terms.noun.charAt(0).toUpperCase()}${terms.noun.slice(1)} Support`, `Precise ${terms.evidence}.`], ["Knowledge or Experience", "A relevant connection that deepens the meaning of the response."], ["Prose Form", "A purposeful structure suited to the idea, audience, and effect."], ["Perspective and Voice", "A personal, critical, creative, or blended approach."]],
        focusTitle: "Personal response focus",
        focusCopy: `A personal response asks you to explore an idea or impression from the ${terms.noun}, support it with precise evidence, and connect it meaningfully to your own knowledge or experience in a purposeful prose form.`,
      };
    case "visual-response":
      return {
        criteria: ["I can separate literal observation from supported inference.", "I can analyze visual choices using PACES.", "I can develop a controlling idea and intended unifying effect.", "I can create and revise a purposeful critical, creative, or personal response."],
        categories: [["People or Subjects", "Precise details about subjects, relationships, actions, expression, and gesture."], ["Angle and Composition", "Viewpoint, framing, placement, focus, scale, and space."], ["Colour, Contrast, and Light", "Visual choices that shape mood, emphasis, pattern, and attention."], ["Effect", "The viewer response created by the combined visual choices."], ["Symbols and Suggestion", "Supported interpretations that remain distinct from literal observation."]],
        focusTitle: "Diploma connection",
        focusCopy: "The ELA 30-2 Diploma Visual Response asks students to develop Ideas and Impressions and communicate them through effective Presentation. Current guidance suggests approximately 300–700 words; this written response is worth 10% of the Diploma Examination mark.",
      };
  }
}

function renderNavigation(previous: { id: string; label: string } | undefined, next: { id: string; label: string } | undefined) {
  return `<nav class="lesson-bottom-bar english-writing-bottom-nav" aria-label="Writing lesson navigation">
    ${previous ? `<a class="lesson-jump" href="#${escapeHtml(previous.id)}" data-page-target="${escapeHtml(previous.id)}">Previous: ${escapeHtml(previous.label)}</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Course Lessons</a>`}
    ${next ? `<a class="lesson-jump primary" href="#${escapeHtml(next.id)}" data-page-target="${escapeHtml(next.id)}">Next: ${escapeHtml(next.label)}</a>` : `<a class="lesson-jump" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>`}
  </nav>`;
}

function sequenceWorks(input: EnglishWritingSequenceInput, kind: SequenceKind): EnglishWritingWork[] {
  if (sequenceTrackMode(input, kind) === "per-work") return input.works;
  if (input.works.length === 1) return input.works;
  return [{ id: "unit", title: input.unitTitle, kind: input.works[0]?.kind ?? "text" }];
}

function renderTrackPicker(input: EnglishWritingSequenceInput, kind: SequenceKind, label: string) {
  if (sequenceTrackMode(input, kind) !== "per-work") return "";
  const namespace = safeId(input.namespace, "english-unit");
  const responseId = `${namespace}:${kind}:selection:track`;
  return `<section class="english-writing-track-picker" data-english-writing-track-picker>
    <label><span>${escapeHtml(label)}</span>
      <select data-response-id="${escapeHtml(responseId)}" data-english-writing-track-select="${escapeHtml(`${namespace}:${kind}`)}">
        ${input.works.map((work) => `<option value="${escapeHtml(safeId(work.id))}">${escapeHtml(work.title)}${work.author ? ` — ${escapeHtml(work.author)}` : ""}</option>`).join("")}
      </select>
    </label>
  </section>`;
}

function stageGuidance(kind: SequenceKind, stage: EnglishEssayStage, work: EnglishWritingWork) {
  const workLabel = work.title;
  const workTerms = mediumTerms([work]);
  const creatorChoice = `${workTerms.creator}'s choice`;
  const critical: Record<string, { model: string; example: string; tip: string; steps: string[] }> = {
    "topic-interpretation": {
      model: `A controlling interpretation names ${workLabel}, identifies the central pressure or choice, and states the larger idea the work develops.`,
      example: `Focus on a conflict in ${workLabel} that changes what a character understands, chooses, or is willing to risk. Turn that pattern into an arguable idea.`,
      tip: "Build one arguable interpretation. Avoid plot summary and lists of literary devices.",
      steps: ["Restate the assigned topic in precise language.", "Choose the conflict, character, or pattern that best reveals it.", "Name what the work suggests about the topic.", "Test whether your claim can control the whole essay."],
    },
    introduction: {
      model: `Move from the broader human issue to ${workLabel}, the relevant conflict, and a focused controlling interpretation.`,
      example: `Introduce only the context from ${workLabel} that a reader needs before the thesis. End with the essay's controlling claim.`,
      tip: "Begin with the idea, not a dictionary definition or a sweeping claim about all people.",
      steps: ["Establish the larger issue named by the topic.", `Introduce the work, its ${workTerms.creator}, and the relevant conflict.`, "Narrow the discussion toward the central interpretation.", "Place the controlling thesis at the end of the introduction."],
    },
    "body-one": {
      model: `Establish the starting point in ${workLabel} with a focused claim, precise evidence, and analysis of what that evidence reveals.`,
      example: `Choose an early moment that establishes the character's original belief, relationship, pressure, or limitation. Explain the ${creatorChoice} and its meaning.`,
      tip: `Keep the paragraph analytical: claim, evidence, ${creatorChoice}, effect, and connection to the thesis.`,
      steps: ["State the focused beginning claim.", "Locate the strongest early evidence.", "Explain the deliberate choice that shapes the moment.", "Connect the analysis to the controlling interpretation."],
    },
    "body-two": {
      model: `Use the middle of ${workLabel} as the hinge of the argument: identify the crisis, pressure, discovery, or choice that forces development.`,
      example: `Choose a middle moment where an earlier belief stops working. Explain the pressure, the creator's construction, and what begins to change.`,
      tip: "The middle paragraph should analyze the turning point, not simply the next event.",
      steps: ["State the focused middle claim.", "Identify the crisis, turning point, or growing pressure.", "Use a precise middle detail as evidence.", "Explain how the moment advances or complicates the thesis."],
    },
    "body-three": {
      model: `Use the ending of ${workLabel} to show what has changed, what remains unresolved, and what the final outcome proves about the larger idea.`,
      example: `Choose a final moment that can be compared with the starting point. Explain how the ending completes or complicates the interpretation.`,
      tip: "Do more than report the resolution. Explain what the ending asks the reader or viewer to understand.",
      steps: ["State the focused ending claim.", "Record the strongest final evidence.", "Compare the ending with the starting point or turning point.", "Explain how the ending proves or complicates the thesis."],
    },
    "conclusion-revision": {
      model: `Synthesize the development across ${workLabel}, restate the interpretation in fresh language, and explain why the idea matters beyond the work.`,
      example: "Return to the starting point, turning point, and ending as one connected development. Finish with the broader significance of the interpretation.",
      tip: "Revise the full essay for paragraph control, transitions, evidence balance, sentence clarity, and correctness.",
      steps: ["Synthesize the work's development and final insight.", "Restate the thesis without repeating it word for word.", "Explain the broader human significance.", "Revise organization, diction, sentences, grammar, punctuation, and spelling."],
    },
  };
  const personal: Record<string, { model: string; example: string; tip: string; steps: string[] }> = {
    "prompt-impression": {
      model: `Begin with a genuine idea, feeling, question, or image from ${workLabel}, then shape that reaction into a focused direction.`,
      example: `Identify one moment from ${workLabel} that stayed with you and explain the human question it raises for you.`,
      tip: "Choose an impression that you can explore, not merely a like-or-dislike reaction.",
      steps: ["Restate the prompt in your own words.", "Name the moment or impression that stays with you.", "Explain why it matters to you.", "Shape the reaction into one controlling idea."],
    },
    "text-evidence": {
      model: `Use one precise moment from ${workLabel}, identify the ${creatorChoice}, and explain how it deepens your controlling idea.`,
      example: "Record a quotation, image, action, scene, or exact detail and explain the effect it creates rather than leaving the evidence to speak for itself.",
      tip: "Include a locator and only the context your reader needs.",
      steps: ["Choose the strongest moment for your idea.", "Record the evidence and its locator.", `Name the ${workTerms.creator}'s deliberate choice.`, "Explain how the moment develops your response."],
    },
    "knowledge-experience": {
      model: `Connect ${workLabel} to relevant knowledge, observation, or experience, then return to the work with a deeper understanding.`,
      example: "Use a specific memory, observation, or piece of learning that genuinely changes how you understand the selected moment.",
      tip: "The connection supports the response; it should not replace discussion of the work.",
      steps: ["Choose one relevant connection.", "Describe it precisely enough to be understood.", "Explain the insight it creates.", "Link that insight back to the work and prompt."],
    },
    "form-perspective": {
      model: "Choose the prose form, perspective, audience, and voice that make the controlling idea most effective.",
      example: "A letter, editorial, monologue, short essay, or blended response should sound and move differently because each form creates a different relationship with the reader.",
      tip: "Let purpose determine the form. Do not choose a creative form unless its structure strengthens the idea.",
      steps: ["Clarify your audience and purpose.", "Choose a prose form suited to that purpose.", "Select a perspective and voice.", "Plan how the form will shape the opening, development, and ending."],
    },
    "response-plan": {
      model: `Arrange the ${workLabel} evidence and personal connection so each part develops the same controlling idea.`,
      example: "Plan an opening that establishes voice, a development that connects evidence and experience, and an ending that leaves a meaningful final insight.",
      tip: "Build progression. Avoid placing text evidence and personal experience in disconnected blocks.",
      steps: ["Draft an opening suited to the chosen form.", "Order the work evidence, analysis, and connection.", "Plan transitions that show development.", "Draft an ending that completes the response."],
    },
    "draft-revise": {
      model: "Use the plan as a foundation, draft the complete response, then revise for meaning, form, voice, clarity, and correctness.",
      example: "Read the complete draft once for the controlling idea, once for support and development, and once for sentence-level correctness.",
      tip: "Revise the larger meaning and structure before proofreading individual errors.",
      steps: ["Draft the complete response in the chosen form.", "Check that every section develops the controlling idea.", "Strengthen evidence, explanation, and connection.", "Revise voice, sentences, grammar, punctuation, and spelling."],
    },
  };
  const literary: Record<string, { model: string; example: string; tip: string; steps: string[] }> = {
    "prompt-controlling-idea": {
      model: "Turn the prompt into one controlling idea that can connect the assigned text, a studied work, and a personal connection.",
      example: "Name the human tension in the prompt, then state an insight specific enough to guide all three sources of support.",
      tip: "Plan one exploration, not three unrelated mini-responses.",
      steps: ["Restate the prompt accurately.", "Identify its key tension or idea.", "Draft an arguable controlling idea.", "Test the idea against all three sources of support."],
    },
    "introduction-thesis": {
      model: "Move from the larger human idea to the assigned text and a thesis that controls the complete exploration.",
      example: "Introduce only the context a reader needs, then end with the insight the response will develop.",
      tip: "Use the thesis to establish direction rather than list the body sections.",
      steps: ["Establish the larger idea.", "Introduce the assigned text and relevant context.", "Narrow toward the controlling insight.", "Place the thesis at the end of the introduction."],
    },
    "body-assigned-text": {
      model: `Use a precise detail from ${workLabel} to establish the response's first analytical connection to the prompt.`,
      example: `Choose the strongest quotation, image, action, or scene from ${workLabel}; explain the ${creatorChoice} and its meaning.`,
      tip: "Evidence needs a locator, context, and explanation.",
      steps: ["State the assigned-text claim.", "Locate precise evidence.", "Explain the creator's choice and effect.", "Connect the analysis to the controlling idea."],
    },
    "body-studied-work": {
      model: "Use a second studied work to extend, contrast with, or complicate the controlling idea.",
      example: "Choose a moment that adds a genuinely new dimension rather than repeating the assigned-text analysis.",
      tip: "Make the relationship between the two works explicit without forcing them to be identical.",
      steps: ["Name the studied work and creator.", "State a focused connection to the prompt.", "Use precise evidence.", "Explain how the work deepens the controlling idea."],
    },
    "body-personal-connection": {
      model: "Use relevant knowledge, observation, or experience as evidence, explain its significance, and return it to the texts and prompt.",
      example: "Describe one specific connection that changed or clarified how you understand the controlling idea.",
      tip: "The personal connection deepens the exploration; it does not replace textual analysis.",
      steps: ["Choose one relevant connection.", "Describe it precisely.", "Explain what it helped you understand.", "Link the insight to the texts and controlling idea."],
    },
    "conclusion-revision": {
      model: "Synthesize the assigned text, studied work, and personal connection into one final insight, then revise the complete response.",
      example: "Show what the three sources reveal together and why the idea matters beyond the immediate texts.",
      tip: "Synthesize rather than list the three body sections again.",
      steps: ["Restate the controlling idea in fresh language.", "Synthesize the three sources of support.", "Explain broader significance.", "Revise ideas, evidence, organization, language, and correctness."],
    },
  };
  const visual: Record<string, { model: string; example: string; tip: string; steps: string[] }> = {
    observe: {
      model: "Record what can be directly seen before deciding what those details might mean.",
      example: "Describe subjects, objects, setting, placement, gesture, visible text, colour, and light without presenting inference as fact.",
      tip: "Use language such as 'may suggest' when moving from observation to interpretation.",
      steps: ["Identify the visual and known source information.", "Record the first impression.", "Describe literal details.", "Build an evidence inventory."],
    },
    paces: {
      model: "Use PACES to connect specific visual choices to supported effects and possible meanings.",
      example: "Explain how a low angle and strong contrast work together to make a subject appear powerful or threatening.",
      tip: "Describe the choice, explain the effect, and support the interpretation.",
      steps: ["Analyze people or subjects.", "Analyze angle and composition.", "Analyze colour, contrast, and light.", "Explain effects, symbols, and suggestions."],
    },
    "central-idea": {
      model: "Select the strongest three details, test an alternative interpretation, and state one defensible controlling idea.",
      example: "Build the idea from a pattern across several details rather than from one isolated symbol.",
      tip: "Acknowledge ambiguity; a strong visual can support more than one reasonable interpretation.",
      steps: ["Rank the strongest details.", "Choose a precise keyword.", "Draft the controlling idea.", "Test an alternative interpretation and intended effect."],
    },
    "prose-form": {
      model: "Choose the critical, creative, or personal branch that best serves the controlling idea and intended effect.",
      example: "A critical response proves an interpretation; a creative response invents a clearly identified situation; a personal response connects visual evidence to experience.",
      tip: "Keep separate plans so changing branches does not overwrite earlier thinking.",
      steps: ["Choose the response branch.", "Plan the branch-specific structure.", "Identify audience, purpose, and voice.", "Mark creative invention clearly."],
    },
    draft: {
      model: "Build an opening and a sequence of movements that use precise visual details to develop the controlling idea.",
      example: "Move from one dominant detail to a contrasting or complicating detail before the final synthesis.",
      tip: "Create progression; do not repeat the same observation in different words.",
      steps: ["Draft the opening.", "Develop the first key detail.", "Extend or complicate the idea.", "Prepare the final movement."],
    },
    "conclusion-revision": {
      model: "Complete the response's unifying effect, assemble the full prose, and revise for Ideas and Impressions and Presentation.",
      example: "End with a realization, image, action, or synthesis that belongs to the selected form and follows from the visual evidence.",
      tip: "Revise meaning, support, form, and flow before proofreading correctness.",
      steps: ["Draft the final movement.", "Assemble the complete response.", "Revise ideas and visual support.", "Revise presentation and correctness."],
    },
  };
  const guidance = kind === "critical-essay"
    ? critical
    : kind === "literary-exploration"
      ? literary
      : kind === "visual-response"
        ? visual
        : personal;
  return guidance[stage.id] ?? {
    model: stage.model ?? stage.focus,
    example: stage.instruction ?? stage.focus,
    tip: "Keep each writing choice connected to the controlling idea.",
    steps: ["Review the lesson focus.", "Choose precise support.", "Draft the section.", "Revise before moving on."],
  };
}

function renderWorkbookGuide(input: EnglishWritingSequenceInput, kind: SequenceKind, profile: EnglishCriticalEssayProfile, first: { id: string; label: string }) {
  const content = writingGuideContent(input, kind);
  return `<section id="${kind}" class="course-page english-activity-page english-writing-sequence-page english-writing-guide english-writing-workbook-page" hidden data-english-writing-sequence="${kind}">
    <header class="english-writing-page-header"><p class="route-kicker course-kicker">${escapeHtml(input.courseCode)} | ${escapeHtml(writingKicker(kind))}</p><h2 class="route-title">${escapeHtml(routeLabel(kind))}</h2><p class="route-description page-intro">${escapeHtml(profile.description)}</p></header>
    ${renderTrackPicker(input, kind, trackPickerLabel(kind))}
    <section class="unit-outcomes english-writing-outcomes"><h3>I can...</h3><ul>${content.criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join("")}</ul></section>
    <section class="english-writing-panel critical-writing-panel english-writing-guide-focus"><h3>${escapeHtml(content.focusTitle)}</h3><p>${escapeHtml(content.focusCopy)}</p><div class="english-writing-category-grid critical-category-grid">${content.categories.map(([title, copy]) => `<article><strong>${escapeHtml(title!)}</strong><p>${escapeHtml(copy!)}</p></article>`).join("")}</div></section>
    <section class="english-writing-panel critical-writing-panel english-writing-path"><h3>Your writing path</h3><p>Complete the six lessons in order. The final Preview combines the work saved in the active track exactly as entered.</p><ol>${profile.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>${escapeHtml(sequenceTitle(kind))} Preview</li></ol></section>
    ${renderNavigation(undefined, first)}
  </section>`;
}

function renderWorkbookStage(input: EnglishWritingSequenceInput, kind: SequenceKind, stage: EnglishEssayStage, routeId: string, previous: { id: string; label: string }, next: { id: string; label: string }) {
  const namespace = safeId(input.namespace, "english-unit");
  const stageId = safeId(stage.id);
  const title = sequenceTitle(kind);
  const tracks = sequenceWorks(input, kind);
  const perWork = sequenceTrackMode(input, kind) === "per-work";
  const articles = tracks.map((work, trackIndex) => {
    const workId = perWork ? safeId(work.id) : "unit";
    const prefix = `${namespace}:${kind}:${workId}:${stageId}`;
    const guidance = stageGuidance(kind, stage, work);
    const byline = [work.author, stage.title].filter(Boolean).join(" | ");
    return `<article class="english-activity-worksheet english-writing-stage english-writing-workbook-stage" data-activity-progress data-english-writing-stage="${kind}" data-english-writing-stage-id="${stageId}" data-english-writing-track-panel="${escapeHtml(`${namespace}:${kind}`)}" data-english-writing-track-id="${escapeHtml(workId)}"${trackIndex ? " hidden" : ""}
      data-response-collection data-evidence-collection-id="${prefix}:collection" data-evidence-response-prefix="${prefix}:" data-evidence-source="${escapeHtml(work.title)} | ${escapeHtml(title)}" data-evidence-concept="${escapeHtml(stage.title)} Writing Stage" data-evidence-activity-id="${kind}" data-evidence-activity-title="${escapeHtml(title)}" data-evidence-work-id="${escapeHtml(workId)}" data-evidence-work-kind="${escapeHtml(work.kind)}" data-evidence-work-title="${escapeHtml(work.title)}" data-evidence-entry-type="collection" data-evidence-prompt-label="Writing stage" data-evidence-detail-label="Saved responses" data-evidence-saved-message="${escapeHtml(stage.title)} saved to Evidence Bank" data-evidence-updated-message="${escapeHtml(stage.title)} updated in Evidence Bank">
      <div class="english-writing-toolbar"><span data-response-collection-status aria-live="polite">Responses save automatically</span><div><button type="button" data-english-writing-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-english-writing-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Stage to Evidence Bank</button></div></div>
      <header class="english-dark-worksheet-header english-writing-stage-header"><div><p>${escapeHtml(input.courseCode)} | ${escapeHtml(title)} Writing</p><h2>${escapeHtml(work.title)}</h2><span>${escapeHtml(byline || stage.title)}</span></div><div class="english-writing-progress"><div><span>Stage progress</span><strong data-activity-progress-label>0 of ${stage.fields.length} answered</strong></div><div><span data-activity-progress-fill></span></div></div></header>
      ${(stage.checkpoints ?? []).length ? `<section class="unit-outcomes english-writing-outcomes"><h3>I can...</h3><ul>${stage.checkpoints!.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}
      <section class="english-writing-panel english-writing-lesson"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p><div class="english-writing-model"><strong>Model move</strong><p>${escapeHtml(stage.model ?? guidance.model)}</p></div></section>
      <div class="english-writing-support-grid"><section class="english-writing-panel english-writing-example"><h3>Example</h3><p>${escapeHtml(guidance.example)}</p></section><section class="english-writing-panel english-writing-tip"><h3>Writing tip</h3><p>${escapeHtml(guidance.tip)}</p></section></div>
      <section class="english-writing-panel english-writing-steps"><h3>How to apply it</h3><ol>${guidance.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>
      <section class="english-writing-panel english-writing-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Draft the actual response section taught above. Your work saves automatically in this ${perWork ? "text track" : "unit plan"} and stays available for the final Preview.</p><div class="english-writing-field-stack">${stage.fields.map((item, index) => renderField(item, `${prefix}:${safeId(item.id)}`, index + 1)).join("")}</div></section>
      ${kind === "visual-response" && stageId === "paces" ? renderPacesEvidencePanel({ namespace, work, workId }) : ""}
    </article>`;
  }).join("");
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page english-writing-sequence-page english-writing-stage-page english-writing-workbook-page" hidden data-english-writing-sequence="${kind}" data-english-writing-print-scope>
    <header class="english-writing-page-header"><p class="route-kicker course-kicker">${escapeHtml(input.courseCode)} | ${escapeHtml(title)} Writing</p><h2 class="route-title">${escapeHtml(stage.title)}</h2><p class="route-description">${escapeHtml(stage.focus)}</p></header>
    ${renderTrackPicker(input, kind, trackPickerLabel(kind))}
    <div class="english-writing-track-panels">${articles}</div>
    ${renderNavigation(previous, next)}
  </section>`;
}

function renderWorkbookPreview(input: EnglishWritingSequenceInput, kind: SequenceKind, profile: EnglishCriticalEssayProfile, previous: { id: string; label: string }) {
  const namespace = safeId(input.namespace, "english-unit");
  const title = sequenceTitle(kind);
  const tracks = sequenceWorks(input, kind);
  const perWork = sequenceTrackMode(input, kind) === "per-work";
  const previews = tracks.map((work, trackIndex) => {
    const workId = perWork ? safeId(work.id) : "unit";
    return `<article class="english-writing-preview-scope" data-english-writing-preview data-english-writing-preview-kind="${kind}" data-english-writing-preview-title="${escapeHtml(title)}" data-english-writing-preview-namespace="${namespace}" data-english-writing-profile-kind="${escapeHtml(input.profileKind)}" data-english-writing-work-id="${escapeHtml(workId)}" data-english-writing-work-title="${escapeHtml(work.title)}" data-english-writing-work-kind="${escapeHtml(work.kind)}" data-english-writing-track-panel="${escapeHtml(`${namespace}:${kind}`)}" data-english-writing-track-id="${escapeHtml(workId)}" data-english-writing-print-scope${trackIndex ? " hidden" : ""}>
      <div class="english-writing-toolbar english-writing-preview-toolbar"><span data-english-writing-preview-status aria-live="polite">Your preview will appear here as you complete the writing lessons.</span><div><button type="button" data-english-writing-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-english-writing-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full ${escapeHtml(title)} Plan</button></div></div>
      <div class="english-writing-preview-document"><header class="english-dark-worksheet-header"><p>${escapeHtml(input.courseCode)} | ${escapeHtml(title)} Writing</p><h3>${escapeHtml(work.title)}</h3><span>${escapeHtml([work.author, `${title} Preview`].filter(Boolean).join(" | "))}</span><strong data-english-writing-preview-word-count>0 words</strong></header>${profile.stages.map((stage) => `<section><h4>${escapeHtml(stage.title)}</h4><div data-english-writing-preview-stage="${escapeHtml(safeId(stage.id))}" data-english-writing-preview-empty="Complete ${escapeHtml(stage.title)} to build this section."><p class="english-writing-preview-empty">Complete ${escapeHtml(stage.title)} to build this section.</p></div></section>`).join("")}</div>
      <p class="english-writing-preview-save-status" data-english-writing-preview-save-status aria-live="polite"></p>
    </article>`;
  }).join("");
  return `<section id="${kind}-preview" class="course-page english-activity-page english-writing-sequence-page english-writing-preview-page english-writing-workbook-page" hidden data-english-writing-sequence="${kind}">
    <header class="english-writing-page-header"><p class="route-kicker">${escapeHtml(input.courseCode)} | ${escapeHtml(input.unitTitle)}</p><h2 class="route-title">${escapeHtml(title)} Preview</h2><p class="route-description">Read the complete plan built from the active writing track. The preview combines your saved boxes exactly as written; it does not invent transitions or rewrite your ideas.</p></header>
    ${renderTrackPicker(input, kind, trackPickerLabel(kind))}
    <div class="english-writing-track-panels">${previews}</div>
    ${renderNavigation(previous, undefined)}
  </section>`;
}

function renderGuide(input: EnglishWritingSequenceInput, kind: SequenceKind, profile: EnglishCriticalEssayProfile, first: { id: string; label: string }) {
  if (input.visualProfile === "ela20-workbook") return renderWorkbookGuide(input, kind, profile, first);
  const content = writingGuideContent(input, kind);
  return `<section id="${kind}" class="course-page english-activity-page english-writing-sequence-page english-writing-guide" hidden data-english-writing-sequence="${kind}">
    <p class="route-kicker course-kicker">${escapeHtml(input.courseCode)} | ${escapeHtml(writingKicker(kind))}</p>
    <h2 class="route-title">${escapeHtml(routeLabel(kind))}</h2>
    <p class="route-description page-intro">${escapeHtml(profile.description)}</p>
    <section class="unit-outcomes english-writing-outcomes"><h3>I can...</h3><ul>${content.criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join("")}</ul></section>
    <section class="english-writing-panel critical-writing-panel english-writing-guide-focus"><h3>${escapeHtml(content.focusTitle)}</h3><p>${escapeHtml(content.focusCopy)}</p><div class="english-writing-category-grid critical-category-grid">${content.categories.map(([title, copy]) => `<article><strong>${escapeHtml(title!)}</strong><p>${escapeHtml(copy!)}</p></article>`).join("")}</div></section>
    <section class="english-writing-panel critical-writing-panel english-writing-path"><h3>Your writing path</h3><p>Complete the six lessons in order. The final Preview combines your saved writing exactly as entered so you can read, print, and deliberately save the complete plan.</p><ol>${profile.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>${escapeHtml(sequenceTitle(kind))} Preview</li></ol></section>
    ${renderNavigation(undefined, first)}
  </section>`;
}

function renderStage(input: EnglishWritingSequenceInput, kind: SequenceKind, stage: EnglishEssayStage, routeId: string, previous: { id: string; label: string }, next: { id: string; label: string }) {
  if (input.visualProfile === "ela20-workbook") return renderWorkbookStage(input, kind, stage, routeId, previous, next);
  const namespace = safeId(input.namespace, "english-unit");
  const stageId = safeId(stage.id);
  const prefix = `${namespace}:${kind}:unit:${stageId}`;
  const title = sequenceTitle(kind);
  const workTitle = input.works.length === 1 ? input.works[0]!.title : input.unitTitle;
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page english-writing-sequence-page english-writing-stage-page" hidden data-english-writing-sequence="${kind}" data-english-writing-print-scope>
    <article class="english-activity-worksheet english-writing-stage" data-activity-progress data-english-writing-stage="${kind}" data-english-writing-stage-id="${stageId}"
      data-response-collection data-evidence-collection-id="${prefix}:collection" data-evidence-response-prefix="${prefix}:" data-evidence-source="${escapeHtml(workTitle)} | ${escapeHtml(title)}" data-evidence-concept="${escapeHtml(stage.title)} Writing Stage" data-evidence-activity-id="${kind}" data-evidence-activity-title="${escapeHtml(title)}" data-evidence-work-title="${escapeHtml(workTitle)}" data-evidence-entry-type="collection" data-evidence-prompt-label="Writing stage" data-evidence-detail-label="Saved responses" data-evidence-saved-message="${escapeHtml(stage.title)} saved to Evidence Bank" data-evidence-updated-message="${escapeHtml(stage.title)} updated in Evidence Bank">
      <div class="english-writing-toolbar"><span data-response-collection-status aria-live="polite">Responses save automatically</span><div><button type="button" data-english-writing-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-english-writing-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Stage to Evidence Bank</button></div></div>
      <header class="english-dark-worksheet-header english-writing-stage-header"><p>${escapeHtml(input.courseCode)} | ${escapeHtml(title)} Writing</p><h2>${escapeHtml(stage.title)}</h2><span>${escapeHtml(stage.focus)}</span><div class="english-writing-progress"><div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${stage.fields.length} answered</strong></div><div><span data-activity-progress-fill></span></div></div></header>
      ${(stage.checkpoints ?? []).length ? `<section class="unit-outcomes english-writing-outcomes"><h3>I can...</h3><ul>${stage.checkpoints!.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}
      <section class="english-writing-panel"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p><div class="english-writing-model"><strong>Model move</strong><p>${escapeHtml(stage.model ?? stage.focus)}</p></div></section>
      <section class="english-writing-panel english-writing-steps"><h3>How to apply it</h3><ol><li>Identify the precise writing decision this lesson asks you to make.</li><li>Use the assigned work and prompt to make that decision specific.</li><li>Draft the actual section in the working boxes below.</li><li>Revise the section before moving to the next lesson.</li></ol></section>
      <section class="english-writing-panel english-writing-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Draft the actual response section taught above. Your work saves automatically and stays available for the final Preview.</p><div class="english-writing-field-stack">${stage.fields.map((item, index) => renderField(item, `${prefix}:${safeId(item.id)}`, index + 1)).join("")}</div></section>
      ${kind === "visual-response" && stageId === "paces" ? renderPacesEvidencePanel({ namespace, work: input.works[0]!, workId: "unit" }) : ""}
    </article>
    ${renderNavigation(previous, next)}
  </section>`;
}

function renderPreview(input: EnglishWritingSequenceInput, kind: SequenceKind, profile: EnglishCriticalEssayProfile, previous: { id: string; label: string }) {
  if (input.visualProfile === "ela20-workbook") return renderWorkbookPreview(input, kind, profile, previous);
  const namespace = safeId(input.namespace, "english-unit");
  const title = sequenceTitle(kind);
  const work = input.works.length === 1 ? input.works[0]! : { id: safeId(input.unitTitle), title: input.unitTitle, kind: "text" as const };
  return `<section id="${kind}-preview" class="course-page english-activity-page english-writing-sequence-page english-writing-preview-page" hidden data-english-writing-sequence="${kind}" data-english-writing-preview data-english-writing-preview-kind="${kind}" data-english-writing-preview-title="${escapeHtml(title)}" data-english-writing-preview-namespace="${namespace}" data-english-writing-profile-kind="${escapeHtml(input.profileKind)}" data-english-writing-work-id="${escapeHtml(work.id)}" data-english-writing-work-title="${escapeHtml(work.title)}" data-english-writing-work-kind="${escapeHtml(work.kind)}" data-english-writing-print-scope>
    <p class="route-kicker">${escapeHtml(input.courseCode)} | ${escapeHtml(input.unitTitle)}</p><h2 class="route-title">${escapeHtml(title)} Preview</h2><p class="route-description">Read the complete plan built from your writing lessons. This preview combines your saved boxes exactly as written; it does not invent transitions or rewrite your ideas.</p>
    <div class="english-writing-toolbar english-writing-preview-toolbar"><span data-english-writing-preview-status aria-live="polite">Your preview will appear here as you complete the writing lessons.</span><div><button type="button" data-english-writing-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-english-writing-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full ${escapeHtml(title)} Plan</button></div></div>
    <article class="english-writing-preview-document"><header class="english-dark-worksheet-header"><p>${escapeHtml(input.courseCode)} | ${escapeHtml(title)} Writing</p><h3>${escapeHtml(title)} Draft</h3><span data-english-writing-preview-word-count>0 words</span></header>${profile.stages.map((stage) => `<section><h4>${escapeHtml(stage.title)}</h4><div data-english-writing-preview-stage="${escapeHtml(safeId(stage.id))}" data-english-writing-preview-empty="Complete ${escapeHtml(stage.title)} to build this section."><p class="english-writing-preview-empty">Complete ${escapeHtml(stage.title)} to build this section.</p></div></section>`).join("")}</article>
    <p class="english-writing-preview-save-status" data-english-writing-preview-save-status aria-live="polite"></p>
    ${renderNavigation(previous, undefined)}
  </section>`;
}

function renderSequence(input: EnglishWritingSequenceInput, kind: SequenceKind, profile: EnglishCriticalEssayProfile) {
  const stagePages = profile.stages.map((stage) => ({ id: `${kind}-${safeId(stage.id)}`, label: stage.title, icon: "edit_note", html: "" }));
  const preview = { id: `${kind}-preview`, label: `${sequenceTitle(kind)} Preview`, icon: "preview", html: "" };
  const guide = { id: kind, label: sequenceTitle(kind), icon: "edit_note", html: renderGuide(input, kind, profile, stagePages[0] ?? preview) };
  const stages = stagePages.map((page, index) => ({ ...page, html: renderStage(input, kind, profile.stages[index]!, page.id, index === 0 ? { id: guide.id, label: routeLabel(kind) } : stagePages[index - 1]!, stagePages[index + 1] ?? preview) }));
  preview.html = renderPreview(input, kind, profile, stages.at(-1) ?? guide);
  return {
    pages: [guide, ...stages, preview],
    navGroup: { id: guide.id, label: guide.label, icon: guide.icon, landingItemLabel: routeLabel(kind), itemPageIds: [...stages.map((page) => page.id), preview.id] },
  };
}

function writingProfile(input: EnglishWritingSequenceInput, kind: SequenceKind) {
  switch (kind) {
    case "critical-essay": return input.criticalEssay ?? buildStandardCriticalEssayProfile(input);
    case "literary-exploration": return input.literaryExploration ?? buildStandardLiteraryExplorationProfile(input);
    case "personal-response": return input.personalResponse ?? buildStandardPersonalResponseProfile(input);
    case "visual-response": return input.visualResponse ?? buildStandardVisualResponseProfile(input);
  }
}

export function renderEnglishWritingSequences(input: EnglishWritingSequenceInput): EnglishWritingSequenceRenderResult {
  if (!input.namespace.trim() || !input.courseCode.trim() || !input.unitTitle.trim()) throw new Error("English writing sequences require namespace, course code, and unit title.");
  if (!input.works.length) throw new Error("English writing sequences require at least one work context.");
  const forms: EnglishWritingFormConfigV1[] = input.writingForms ?? [
    ...(input.includeCriticalEssay ? [{ kind: "critical-essay" as const, trackMode: input.criticalEssayTrackMode ?? "unit" as const }] : []),
    ...(input.includePersonalResponse ? [{ kind: "personal-response" as const, trackMode: input.personalResponseTrackMode ?? "unit" as const }] : []),
  ];
  const results = forms.map((form) => renderSequence(input, form.kind, writingProfile(input, form.kind)));
  return { pages: results.flatMap((result) => result.pages), navGroups: results.map((result) => result.navGroup), css: ENGLISH_WRITING_SEQUENCE_CSS, runtime: ENGLISH_WRITING_SEQUENCE_RUNTIME };
}

export const ENGLISH_WRITING_SEQUENCE_CSS = String.raw`
.english-writing-sequence-page { display: grid; gap: 20px; }
.english-writing-sequence-page[hidden] { display: none !important; }
.english-writing-guide {
  display: block;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}
.english-writing-guide > .course-kicker {
  margin: 0 0 8px;
  color: #596157;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.55;
}
.english-writing-guide > .route-title,
.english-writing-preview-page > .route-title {
  margin: 0;
  color: #191c1d;
  font-size: clamp(42px, 4.6vw, 58px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.035em;
}
.english-writing-guide > .page-intro,
.english-writing-preview-page > .route-description {
  max-width: 940px;
  margin: 14px 0 0;
  color: #3f473f;
  font-size: 19px;
  line-height: 1.55;
}
.english-writing-guide > .english-writing-panel,
.english-writing-guide > .english-writing-outcomes {
  margin-top: 22px;
  padding: 20px 22px;
}
.english-writing-guide > .english-writing-panel h3,
.english-writing-guide > .english-writing-outcomes h3 {
  margin: 0 0 12px;
  color: #202520;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.15;
}
.english-writing-panel, .english-writing-outcomes { border: 1px solid #d8ded4; border-radius: 8px; background: #fff; padding: 20px; }
.english-writing-outcomes { border-left: 4px solid #154212; background: #f7f8f5; }
.english-writing-outcomes h3, .english-writing-panel h3 { margin: 0 0 10px; }
.english-writing-outcomes ul, .english-writing-path ol, .english-writing-steps ol { margin: 0; padding-left: 22px; }
.english-writing-category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.english-writing-category-grid article { border: 1px solid #d8dfd1; border-radius: 8px; background: #f8f9f6; padding: 15px 16px; }
.english-writing-category-grid article strong { color: #154212; }
.english-writing-category-grid p { margin: 8px 0 0; color: #4d554a; line-height: 1.6; }
.english-writing-stage { overflow: hidden; border: 1px solid #d7dcd4; border-radius: 8px; background: #fff; }
.english-writing-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid #d7dcd4; border-radius: 8px; background: #fff; padding: 12px 14px; }
.english-writing-stage > .english-writing-toolbar { border: 0; border-bottom: 1px solid #d7dcd4; border-radius: 0; }
.english-writing-toolbar > span { color: #61695f; font-size: 13px; }
.english-writing-toolbar > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.english-writing-stage-header { padding: 26px; }
.english-writing-stage-header h2 { margin: 5px 0 7px; }
.english-writing-progress { margin-top: 18px; }
.english-writing-progress > div:first-child { display: flex; justify-content: space-between; gap: 12px; }
.english-writing-progress > div:last-child { height: 8px; margin-top: 8px; overflow: hidden; border-radius: 999px; background: #293029; }
.english-writing-progress > div:last-child span { display: block; width: 0; height: 100%; background: #9fcf93; }
.english-writing-stage .english-writing-panel, .english-writing-stage .english-writing-outcomes { margin: 18px 22px 0; }
.english-writing-model { margin-top: 14px; border-left: 3px solid #527348; background: #f4f7f1; padding: 12px 14px; }
.english-writing-model p { margin: 5px 0 0; }
.english-writing-field-stack { display: grid; gap: 18px; margin-top: 18px; }
.english-writing-field { display: grid; gap: 8px; padding-bottom: 18px; border-bottom: 1px solid #e1e5df; }
.english-writing-field:last-child { border-bottom: 0; padding-bottom: 0; }
.english-writing-field label { font-weight: 750; }
.english-writing-paces-evidence { display: grid; gap: 16px; }
.english-writing-paces-evidence-heading h3 { margin: 0 0 6px; }
.english-writing-paces-evidence-heading p { margin: 0; color: #4d554a; line-height: 1.55; }
.english-writing-paces-evidence-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.english-writing-paces-evidence-grid label { display: grid; align-content: start; gap: 7px; font-weight: 750; }
.english-writing-paces-evidence-grid input,
.english-writing-paces-evidence-grid select,
.english-writing-paces-evidence-grid textarea { width: 100%; }
.english-writing-hint { border-left: 3px solid #6c8962; background: #f3f6ef; padding: 10px 12px; color: #3f4b3b; }
.english-writing-word-count { justify-self: end; color: #667064; font-size: 13px; }
.english-writing-bottom-nav { margin-top: 0; }
.english-writing-preview-document { overflow: hidden; border: 1px solid #d7dcd4; border-radius: 8px; background: #fff; }
.english-writing-preview-document > header { padding: 24px; }
.english-writing-preview-document > section { padding: 20px 24px; border-top: 1px solid #e2e5e0; }
.english-writing-preview-document h4 { margin: 0 0 10px; }
.english-writing-preview-document p { white-space: pre-wrap; }
.english-writing-preview-empty { color: #697067; font-style: italic; }
.english-writing-preview-save-status { min-height: 20px; margin: 0; color: #154212; font-weight: 700; }
.english-writing-workbook-page {
  max-width: 1120px;
  margin: 0 auto;
  color: #202420;
  font-family: "Work Sans", "Aptos", "Helvetica Neue", sans-serif;
  padding: 34px;
}
.english-writing-workbook-page > .english-writing-page-header {
  border-top: 4px solid #175314;
  padding: 20px 0 12px;
}
.english-writing-workbook-page .english-writing-page-header > .route-kicker {
  margin: 0 0 6px;
  color: #3f6a3d;
  font-size: .76rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.english-writing-workbook-page .english-writing-page-header > .route-title {
  margin: 0 0 8px;
  color: #202420;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: normal;
}
.english-writing-workbook-page .english-writing-page-header > .route-description {
  max-width: 760px;
  margin: 0;
  color: #555f56;
  font-size: 1rem;
  line-height: 1.55;
}
.english-writing-workbook-page .english-writing-track-picker {
  display: block;
  max-width: 560px;
  margin: 20px 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
}
.english-writing-workbook-page .english-writing-track-picker label {
  display: grid;
  gap: 6px;
  color: #202420;
  font-weight: 750;
}
.english-writing-workbook-page .english-writing-track-picker select,
.english-writing-workbook-page .english-writing-field input,
.english-writing-workbook-page .english-writing-field select,
.english-writing-workbook-page .english-writing-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #aeb9ad;
  border-radius: 5px;
  background: #fff;
  color: #202420;
  font: inherit;
}
.english-writing-workbook-page .english-writing-track-picker select,
.english-writing-workbook-page .english-writing-field input,
.english-writing-workbook-page .english-writing-field select {
  min-height: 42px;
  padding: 9px 11px;
}
.english-writing-workbook-page .english-writing-field textarea {
  min-height: 112px;
  padding: 11px;
  resize: vertical;
  line-height: 1.5;
}
.english-writing-workbook-page > .english-writing-outcomes,
.english-writing-workbook-page > .english-writing-panel,
.english-writing-workbook-stage > .english-writing-outcomes,
.english-writing-workbook-stage > .english-writing-panel {
  border: 1px solid #d6ddd3;
  border-radius: 6px;
  background: #fff;
  padding: 18px;
}
.english-writing-workbook-page > .english-writing-outcomes {
  margin-top: 16px;
  border-left: 4px solid #477445;
  background: #f7f9f5;
}
.english-writing-workbook-page > .english-writing-panel { margin-top: 16px; }
.english-writing-workbook-page .english-writing-outcomes h3,
.english-writing-workbook-page .english-writing-panel h3 { margin: 0 0 8px; }
.english-writing-workbook-page .english-writing-outcomes ul,
.english-writing-workbook-page .english-writing-path ol,
.english-writing-workbook-page .english-writing-steps ol { margin: 0; padding-left: 20px; }
.english-writing-workbook-page .english-writing-outcomes li,
.english-writing-workbook-page .english-writing-path li,
.english-writing-workbook-page .english-writing-steps li { margin: 5px 0; line-height: 1.48; }
.english-writing-workbook-page .english-writing-category-grid {
  gap: 12px;
  margin-top: 15px;
}
.english-writing-workbook-page .english-writing-category-grid article {
  border: 1px solid #d8dfd5;
  border-radius: 5px;
  background: #f7f9f5;
  padding: 14px;
}
.english-writing-workbook-page .english-writing-category-grid article:last-child { grid-column: 1 / -1; }
.english-writing-workbook-page .english-writing-category-grid p,
.english-writing-workbook-page .english-writing-panel > p { margin: 5px 0 0; line-height: 1.5; }
.english-writing-track-panels { display: grid; }
.english-writing-track-panels > [hidden] { display: none !important; }
.english-writing-workbook-stage {
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.english-writing-workbook-stage > .english-writing-toolbar {
  min-height: auto;
  margin-bottom: 18px;
  border: 1px solid #d8dfd1;
  border-radius: 6px;
  background: #fff;
  padding: 16px 20px;
}
.english-writing-workbook-stage > .english-writing-toolbar button,
.english-writing-preview-scope > .english-writing-toolbar button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-sizing: border-box;
  border: 1px solid #7f967d;
  border-radius: 5px;
  background: #fff;
  color: #174b15;
  padding: 8px 13px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.english-writing-workbook-stage > .english-writing-toolbar button:hover,
.english-writing-preview-scope > .english-writing-toolbar button:hover { background: #f1f5ef; }
.english-writing-workbook-stage > .english-writing-toolbar button:focus-visible,
.english-writing-preview-scope > .english-writing-toolbar button:focus-visible { outline: 3px solid #8db789; outline-offset: 2px; }
.english-writing-workbook-stage > .english-writing-toolbar .evidence-bank-save-action,
.english-writing-preview-scope > .english-writing-toolbar .evidence-bank-save-action {
  border-color: #175314;
  background: #175314;
  color: #fff;
}
.english-writing-workbook-stage > .english-writing-toolbar .evidence-bank-save-action:hover,
.english-writing-preview-scope > .english-writing-toolbar .evidence-bank-save-action:hover { background: #0f3d0d; }
.english-writing-workbook-stage > .english-writing-stage-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
  border: 0;
  border-radius: 6px;
  background: #161a17;
  padding: 22px;
}
.english-writing-workbook-stage > .english-writing-stage-header h2 {
  margin: 7px 0 0;
  color: #fff;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.08;
}
.english-writing-workbook-stage > .english-writing-stage-header p {
  margin: 0 0 6px;
  color: #b9c3b2;
  font-size: .76rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.english-writing-workbook-stage > .english-writing-stage-header span:not([data-activity-progress-fill]) {
  display: block;
  margin-top: 8px;
  color: #d7ddd4;
  line-height: 1.45;
}
.english-writing-workbook-stage .english-writing-progress {
  min-width: 260px;
  margin-top: 0;
}
.english-writing-workbook-stage .english-writing-progress > div:first-child { color: #d7ddd4; font-size: .8rem; }
.english-writing-workbook-stage .english-writing-progress > div:last-child {
  height: 7px;
  margin-top: 7px;
  border-radius: 4px;
  background: #293029;
}
.english-writing-workbook-stage .english-writing-progress > div:last-child span { background: #9fcf93; }
.english-writing-workbook-stage > .english-writing-outcomes,
.english-writing-workbook-stage > .english-writing-panel { margin: 16px 0 0; }
.english-writing-workbook-stage > .english-writing-outcomes {
  border-left: 4px solid #477445;
  background: #f7f9f5;
}
.english-writing-workbook-stage .english-writing-lesson {
  border-left: 3px solid #175314;
}
.english-writing-workbook-stage .english-writing-model {
  margin-top: 14px;
  border-left: 4px solid #477445;
  background: #f2f5f0;
  padding: 13px;
}
.english-writing-support-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 15px;
}
.english-writing-support-grid > .english-writing-panel {
  margin-top: 0;
  border: 1px solid #d6ddd3;
  border-radius: 6px;
  background: #fff;
  padding: 18px;
}
.english-writing-support-grid > .english-writing-panel h3 { margin: 0 0 8px; }
.english-writing-support-grid > .english-writing-panel p { margin: 5px 0 0; line-height: 1.5; }
.english-writing-support-grid > .english-writing-tip {
  border-color: #e4d4b1;
  background: #fffaf0;
}
.english-writing-workbook-stage > .english-writing-steps { margin-top: 16px; }
.english-writing-workbook-stage > .english-writing-planner {
  margin-top: 16px;
  border-color: #d8dfd1;
  background: #f8f9f6;
}
.english-writing-workbook-stage .english-writing-field-stack {
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 18px;
  padding-bottom: 2px;
}
.english-writing-workbook-page .english-writing-field {
  align-content: start;
  gap: 6px;
  border-bottom: 0;
  padding-bottom: 0;
  font-weight: 750;
}
.english-writing-workbook-page .english-writing-hint {
  margin: 0;
  border-left: 3px solid #61835f;
  background: #f2f5f0;
  color: #3e493e;
  padding: 9px 11px;
  font-size: .86rem;
  font-weight: 500;
  line-height: 1.4;
}
.english-writing-workbook-page .english-writing-word-count {
  color: #707970;
  font-size: .78rem;
  font-weight: 600;
}
.english-writing-preview-scope { display: grid; gap: 18px; }
.english-writing-preview-scope[hidden] { display: none !important; }
.english-writing-preview-scope > .english-writing-preview-document { border-radius: 6px; }
.english-writing-preview-scope .english-writing-preview-document > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 20px;
  background: #161a17;
}
.english-writing-preview-scope .english-writing-preview-document > header p,
.english-writing-preview-scope .english-writing-preview-document > header h3,
.english-writing-preview-scope .english-writing-preview-document > header span { grid-column: 1; }
.english-writing-preview-scope .english-writing-preview-document > header strong { grid-column: 2; grid-row: 1 / span 3; align-self: center; color: #eef3ec; }
@media (max-width: 760px) {
  .english-writing-guide > .route-title,
  .english-writing-preview-page > .route-title { font-size: 38px; line-height: 1.05; }
  .english-writing-guide > .page-intro,
  .english-writing-preview-page > .route-description { font-size: 17px; }
  .english-writing-category-grid { grid-template-columns: 1fr; }
  .english-writing-paces-evidence-grid { grid-template-columns: 1fr; }
  .english-writing-toolbar, .english-writing-progress > div:first-child { align-items: flex-start; flex-direction: column; }
  .english-writing-toolbar > div { justify-content: flex-start; }
  .english-writing-stage .english-writing-panel, .english-writing-stage .english-writing-outcomes { margin-inline: 14px; }
  .english-writing-workbook-stage > .english-writing-stage-header,
  .english-writing-preview-scope .english-writing-preview-document > header,
  .english-writing-support-grid { grid-template-columns: 1fr; }
  .english-writing-workbook-page { padding: 20px 14px; }
  .english-writing-workbook-page .english-writing-page-header > .route-title { font-size: 1.65rem; }
  .english-writing-workbook-stage > .english-writing-stage-header { align-items: stretch; flex-direction: column; }
  .english-writing-workbook-stage .english-writing-progress { min-width: 0; width: 100%; }
  .english-writing-workbook-stage > .english-writing-panel,
  .english-writing-workbook-stage > .english-writing-outcomes { margin-inline: 0; }
  .english-writing-preview-scope .english-writing-preview-document > header strong { grid-column: 1; grid-row: auto; }
}
@media print {
  body.english-writing-printing .course-sidebar, body.english-writing-printing .course-topbar, body.english-writing-printing .english-writing-toolbar, body.english-writing-printing .english-writing-bottom-nav { display: none !important; }
  body.english-writing-printing .course-page { display: none !important; }
  body.english-writing-printing .course-page.english-writing-print-target { display: block !important; border: 0; padding: 0; }
}
`;

function installEnglishWritingSequenceRuntime(rootDocument: Document) {
  const windowCandidate = rootDocument.defaultView;
  if (!windowCandidate) return;
  const browserWindow = windowCandidate;
  const body = rootDocument.body;

  function countWords(value: string) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function responseValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    if (field instanceof browserWindow.HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) return field.checked ? field.value || "Yes" : "";
    return String(field.value || "").trim();
  }

  function applyTrackSelection(group: string, value: string) {
    if (!group || !value) return;
    rootDocument.querySelectorAll<HTMLSelectElement>("[data-english-writing-track-select]").forEach((select) => {
      if (select.getAttribute("data-english-writing-track-select") === group && select.value !== value) select.value = value;
    });
    rootDocument.querySelectorAll<HTMLElement>("[data-english-writing-track-panel]").forEach((panel) => {
      if (panel.getAttribute("data-english-writing-track-panel") !== group) return;
      panel.hidden = panel.getAttribute("data-english-writing-track-id") !== value;
      if (!panel.hidden && panel.hasAttribute("data-english-writing-stage")) updateStage(panel);
      if (!panel.hidden && panel.hasAttribute("data-english-writing-preview")) updatePreview(panel);
    });
  }

  function initializeTrackGroups() {
    const initialized = new Set<string>();
    rootDocument.querySelectorAll<HTMLSelectElement>("[data-english-writing-track-select]").forEach((select) => {
      const group = select.getAttribute("data-english-writing-track-select") || "";
      if (!group || initialized.has(group)) return;
      initialized.add(group);
      const value = select.value || select.options.item(0)?.value || "";
      applyTrackSelection(group, value);
    });
  }

  function updateStage(root: HTMLElement) {
    const fields = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"))
      .filter((field) => !field.closest("[data-repeatable-evidence-panel]"));
    const answered = fields.filter((field) => Boolean(responseValue(field))).length;
    const label = root.querySelector<HTMLElement>("[data-activity-progress-label]");
    const fill = root.querySelector<HTMLElement>("[data-activity-progress-fill]");
    if (label) label.textContent = `${answered} of ${fields.length} answered`;
    if (fill) fill.style.width = `${fields.length ? Math.round(answered / fields.length * 100) : 0}%`;
    fields.forEach((field) => {
      const count = field.closest("[data-activity-response]")?.querySelector<HTMLElement>("[data-activity-word-count]");
      if (count) count.textContent = `${countWords(responseValue(field))} words`;
    });
  }

  function previewPayload(root: HTMLElement) {
    const namespace = root.getAttribute("data-english-writing-preview-namespace") || "english-unit";
    const kind = root.getAttribute("data-english-writing-preview-kind") || "personal-response";
    const workId = root.getAttribute("data-english-writing-work-id") || "unit";
    const prefix = `${namespace}:${kind}:${workId}:`;
    const controls = Array.from(rootDocument.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"))
      .filter((field) => String(field.getAttribute("data-response-id") || "").startsWith(prefix));
    const responseIds = controls.map((field) => field.getAttribute("data-response-id") || "").filter(Boolean);
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-english-writing-preview-stage]")).map((target) => {
      const stageId = target.getAttribute("data-english-writing-preview-stage") || "";
      const values = controls
        .filter((field) => String(field.getAttribute("data-response-id") || "").startsWith(`${prefix}${stageId}:`))
        .map(responseValue)
        .filter(Boolean);
      return { target, stageId, title: target.previousElementSibling?.textContent?.trim() || stageId, values };
    });
    const compiledText = sections.filter((section) => section.values.length).map((section) => `${section.title}\n\n${section.values.join("\n\n")}`).join("\n\n");
    return { responseIds, sections, started: sections.filter((section) => section.values.length).length, wordCount: countWords(compiledText), compiledText };
  }

  function updatePreview(root: HTMLElement) {
    const payload = previewPayload(root);
    payload.sections.forEach((section) => {
      section.target.replaceChildren();
      if (!section.values.length) {
        const empty = rootDocument.createElement("p");
        empty.className = "english-writing-preview-empty";
        empty.textContent = section.target.getAttribute("data-english-writing-preview-empty") || "Complete the matching lesson to build this section.";
        section.target.appendChild(empty);
      } else {
        section.values.forEach((value) => { const paragraph = rootDocument.createElement("p"); paragraph.textContent = value; section.target.appendChild(paragraph); });
      }
    });
    const count = root.querySelector<HTMLElement>("[data-english-writing-preview-word-count]");
    const status = root.querySelector<HTMLElement>("[data-english-writing-preview-status]");
    if (count) count.textContent = `${payload.wordCount} ${payload.wordCount === 1 ? "word" : "words"}`;
    if (status) status.textContent = payload.started ? `${payload.started} of ${payload.sections.length} writing lessons started | ${payload.wordCount} words` : "Your preview will appear here as you complete the writing lessons.";
    return payload;
  }

  function evidenceApi() {
    const candidate = (browserWindow as Window & { nextStepEvidenceBank?: { upsert(entry: Record<string, unknown>): unknown; list(filters?: Record<string, unknown>): Array<Record<string, unknown>> } }).nextStepEvidenceBank;
    return candidate && typeof candidate.upsert === "function" && typeof candidate.list === "function" ? candidate : undefined;
  }

  function savePreview(root: HTMLElement) {
    const payload = updatePreview(root);
    const status = root.querySelector<HTMLElement>("[data-english-writing-preview-save-status]");
    if (!payload.started) { if (status) status.textContent = "Complete at least one writing lesson before saving the full plan."; return; }
    const api = evidenceApi();
    if (!api) { if (status) status.textContent = "The Evidence Bank is not available in this preview."; return; }
    const projectSlug = root.getAttribute("data-english-writing-preview-namespace") || "english-unit";
    const kind = root.getAttribute("data-english-writing-preview-kind") || "personal-response";
    const title = root.getAttribute("data-english-writing-preview-title")
      || kind.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
    const workId = root.getAttribute("data-english-writing-work-id") || "unit";
    const contributionId = workId === "unit" ? `${projectSlug}:${kind}:full-plan` : `${projectSlug}:${kind}:${workId}:full-plan`;
    const existing = api.list({ contributionId })[0];
    const workTitle = root.getAttribute("data-english-writing-work-title") || "Selected Text";
    const now = new Date().toISOString();
    api.upsert({ schemaVersion: 2, contributionId, responseId: contributionId, projectSlug, entryKind: "collection", source: `${workTitle} | ${title}`, concept: `${title} Preview`, activity: { id: kind, profile: root.getAttribute("data-english-writing-profile-kind") || "english", title }, work: { id: workId === "unit" ? (root.getAttribute("data-english-writing-work-id") || workTitle) : workId, title: workTitle, kind: root.getAttribute("data-english-writing-work-kind") || "text" }, prompt: `${payload.started} of ${payload.sections.length} writing lessons saved.`, answer: payload.compiledText, connection: "", responseIds: payload.responseIds, tags: [kind, "writing-plan"], createdAt: existing?.createdAt || now, updatedAt: now, metadata: { startedSections: payload.started, wordCount: payload.wordCount } });
    if (status) status.textContent = existing ? `Full ${title} plan updated in Evidence Bank.` : `Full ${title} plan saved to Evidence Bank.`;
  }

  function saveStage(root: HTMLElement) {
    const api = evidenceApi();
    const status = root.querySelector<HTMLElement>("[data-response-collection-status]");
    if (!api) { if (status) status.textContent = "The Evidence Bank is not available in this preview."; return; }
    const fields = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"))
      .filter((field) => !field.closest("[data-repeatable-evidence-panel]"));
    const completed = fields.map((control) => ({ responseId: control.getAttribute("data-response-id") || "", prompt: control.closest<HTMLElement>("[data-activity-response]")?.getAttribute("data-evidence-question-prompt") || "Response", answer: responseValue(control) })).filter((entry) => entry.answer);
    if (!completed.length) { if (status) status.textContent = "Complete at least one response before saving this stage."; return; }
    const contributionId = root.getAttribute("data-evidence-collection-id") || "writing-stage";
    const existing = api.list({ contributionId })[0];
    const activityId = root.getAttribute("data-evidence-activity-id") || "writing";
    const activityTitle = root.getAttribute("data-evidence-activity-title") || "Writing";
    const workTitle = root.getAttribute("data-evidence-work-title") || "Selected Text";
    const workId = root.getAttribute("data-evidence-work-id") || workTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const workKind = root.getAttribute("data-evidence-work-kind") || "text";
    const now = new Date().toISOString();
    api.upsert({ schemaVersion: 2, contributionId, responseId: contributionId, entryKind: "collection", source: root.getAttribute("data-evidence-source") || `${workTitle} | ${activityTitle}`, concept: root.getAttribute("data-evidence-concept") || activityTitle, activity: { id: activityId, title: activityTitle }, work: { id: workId, title: workTitle, kind: workKind }, prompt: `${completed.length} completed writing response${completed.length === 1 ? "" : "s"}.`, answer: completed.map((entry, index) => `${index + 1}. ${entry.prompt}\n${entry.answer}`).join("\n\n"), responseIds: completed.map((entry) => entry.responseId), tags: [activityId, "writing-stage"], createdAt: existing?.createdAt || now, updatedAt: now });
    if (status) status.textContent = existing ? "Writing stage updated in Evidence Bank." : "Writing stage saved to Evidence Bank.";
  }

  function printScope(button: HTMLElement) {
    const scope = button.closest<HTMLElement>("[data-english-writing-print-scope]") || button.closest<HTMLElement>(".english-writing-sequence-page");
    if (!scope) return;
    const printCourseSection = (browserWindow as Window & { printCourseSection?: (element: HTMLElement) => void }).printCourseSection;
    if (typeof printCourseSection === "function") { printCourseSection(scope); return; }
    body.classList.add("english-writing-printing");
    scope.classList.add("english-writing-print-target");
    browserWindow.print();
    scope.classList.remove("english-writing-print-target");
    body.classList.remove("english-writing-printing");
  }

  function initialize() {
    initializeTrackGroups();
    rootDocument.querySelectorAll<HTMLElement>("[data-english-writing-stage]").forEach(updateStage);
    rootDocument.querySelectorAll<HTMLElement>("[data-english-writing-preview]").forEach(updatePreview);
  }

  rootDocument.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof browserWindow.HTMLInputElement || target instanceof browserWindow.HTMLTextAreaElement || target instanceof browserWindow.HTMLSelectElement)) return;
    const stage = target.closest<HTMLElement>("[data-english-writing-stage]");
    if (stage) updateStage(stage);
    rootDocument.querySelectorAll<HTMLElement>("[data-english-writing-preview]").forEach((preview) => {
      const namespace = preview.getAttribute("data-english-writing-preview-namespace") || "english-unit";
      const kind = preview.getAttribute("data-english-writing-preview-kind") || "personal-response";
      const workId = preview.getAttribute("data-english-writing-work-id") || "unit";
      if (String(target.getAttribute("data-response-id") || "").startsWith(`${namespace}:${kind}:${workId}:`)) updatePreview(preview);
    });
  });
  rootDocument.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof browserWindow.HTMLSelectElement && target.hasAttribute("data-response-id")) {
      const group = target.getAttribute("data-english-writing-track-select");
      if (group) applyTrackSelection(group, target.value);
      target.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    }
  });
  rootDocument.addEventListener("click", (event) => {
    const target = event.target instanceof browserWindow.Element ? event.target : null;
    if (!target) return;
    const hints = target.closest<HTMLElement>("[data-english-writing-toggle-hints]");
    if (hints) {
      event.preventDefault();
      const scope = hints.closest<HTMLElement>("[data-english-writing-stage]");
      const show = hints.getAttribute("aria-pressed") !== "true";
      hints.setAttribute("aria-pressed", String(show));
      hints.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ${show ? "Hide Hints" : "Show Hints"}`;
      scope?.querySelectorAll<HTMLElement>("[data-english-writing-hint]").forEach((hint) => { hint.hidden = !show; });
      return;
    }
    const print = target.closest<HTMLElement>("[data-english-writing-print]");
    if (print) { event.preventDefault(); printScope(print); return; }
    const save = target.closest<HTMLElement>("[data-save-english-writing-preview]");
    if (save) { event.preventDefault(); event.stopImmediatePropagation(); const preview = save.closest<HTMLElement>("[data-english-writing-preview]"); if (preview) savePreview(preview); return; }
    const stageSave = target.closest<HTMLElement>("[data-save-response-collection]");
    const stage = stageSave?.closest<HTMLElement>("[data-english-writing-stage]");
    if (stageSave && stage) { event.preventDefault(); event.stopImmediatePropagation(); saveStage(stage); }
  });
  browserWindow.addEventListener("hashchange", initialize);
  if (rootDocument.readyState === "loading") rootDocument.addEventListener("DOMContentLoaded", initialize, { once: true }); else initialize();
  browserWindow.setTimeout(initialize, 0);
}

export const ENGLISH_WRITING_SEQUENCE_RUNTIME = `(function(){const __name=function(target){return target;};(${installEnglishWritingSequenceRuntime.toString()})(document);})();`;
