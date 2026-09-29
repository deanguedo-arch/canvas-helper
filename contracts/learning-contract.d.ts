/**
 * AB30 learning block contract — T08.
 *
 * Versioned teaching-block schema for Aboriginal Studies 30 lessons.
 * Reader capability is declared by top-level `schemaVersion: 2` in
 * course-data.js. Lessons without a `blocks` array render through the v1
 * legacy path (body/example/check) unchanged; lessons WITH a non-empty
 * `blocks` array render through the v2 block renderer with goal strip,
 * reading band, key terms, vocabulary help, then blocks.
 *
 * Per-lesson `contentVersion` defaults to "v1-legacy" when absent. Teacher
 * reviews are recorded per (lessonId, contentVersion) in
 * meta/ab30-parity/lesson-review-manifest.json — never inferred from
 * structure alone.
 */

export type LessonBlockType =
  | "explanation"
  | "source"
  | "comparison"
  | "figure"
  | "workedExample"
  | "supportedPractice"
  | "independentTask"
  | "reflection"
  | "assignmentConnection";

export interface LessonBlockBase {
  /** Block discriminator; unknown types render a visible unsupported badge. */
  type: string;
  /**
   * Authoring-only notes. NEVER rendered student-facing; the renderer
   * ignores this field (proven by CONTENT tests). Teacher-facing records
   * live in meta/ab30-parity/, not in shipped lesson HTML.
   */
  editorial?: { hold?: string; note?: string };
}

export interface ExplanationBlock extends LessonBlockBase {
  type: "explanation";
  heading?: string;
  /** Required: one or more teaching paragraphs (plain text, escaped). */
  paragraphs: string[];
}

export interface SourceBlock extends LessonBlockBase {
  type: "source";
  /** Required: the quoted/taught extract (plain text, escaped). */
  extract: string;
  /** All attribution fields optional; absent fields render nothing. */
  speaker?: string;
  creator?: string;
  nation?: string;
  date?: string;
  sourceType?: string;
  locator?: string;
  attribution?: string;
  contextLimits?: string;
  sourceId?: string;
}

export interface ComparisonBlock extends LessonBlockBase {
  type: "comparison";
  /** Required: 2+ headed columns rendered as a table with th scope. */
  columns: Array<{ heading: string; points: string[] }>;
  caption?: string;
}

export interface FigureBlock extends LessonBlockBase {
  type: "figure";
  /** Approved-URL only (relative ./assets, #anchor, https; see policy). */
  src: string;
  /** Required: alt text that teaches the same relationship as the figure. */
  alt: string;
  /** Required: visible caption teaching the same relationship. */
  caption: string;
  sourceId?: string;
}

export interface WorkedExampleBlock extends LessonBlockBase {
  type: "workedExample";
  title?: string;
  directions?: string;
  /** Required: selected evidence with references. */
  evidence: Array<{ ref: string; text: string }>;
  /** Required: intermediate reasoning steps. */
  reasoning: string[];
  /** Required: the completed finished response. */
  response: string;
}

export interface SupportedPracticeBlock extends LessonBlockBase {
  type: "supportedPractice";
  title?: string;
  /** Required: the method to apply (names the worked-example method). */
  method: string;
  /** Required: the supported task itself. */
  task: string;
  /** Required: useful feedback shown with the task. */
  feedback: string;
}

export interface IndependentTaskBlock extends LessonBlockBase {
  type: "independentTask";
  title?: string;
  /** Required: the independent task itself. */
  task: string;
  /**
   * Required: how this task differs from the worked example / supported
   * practice (new evidence or new example — never shuffled choices alone).
   */
  differsFrom: { evidence?: string; example?: string };
  /**
   * Optional (T10): formative save key for the learner's response.
   * Saved through the standard activity-response path (formative role,
   * versioned draft, truthful save status). Omit for read-only tasks.
   */
  responseKey?: string;
  /** Optional: label for the response box. Defaults to "Your response". */
  responseLabel?: string;
  /**
   * Optional: annotated comparison criteria, revealed only after a saved
   * response exists for responseKey. Requires responseKey; without it the
   * criteria render openly (no gating theater) plus a validation issue.
   */
  criteria?: string;
}

export interface ReflectionBlock extends LessonBlockBase {
  type: "reflection";
  /** Required: the reflection prompt (optional to include; visible). */
  prompt: string;
}

export interface AssignmentConnectionBlock extends LessonBlockBase {
  type: "assignmentConnection";
  /** Required: target assignment id (must exist in course data). */
  assignmentId: string;
  note?: string;
}

export type LessonBlock =
  | ExplanationBlock
  | SourceBlock
  | ComparisonBlock
  | FigureBlock
  | WorkedExampleBlock
  | SupportedPracticeBlock
  | IndependentTaskBlock
  | ReflectionBlock
  | AssignmentConnectionBlock;

export interface LessonGoalStrip {
  goal: string;
  prerequisite?: string;
  essentialQuestion?: string;
}

export interface BlockIssue {
  index: number;
  type: string;
  code: string;
  detail: string;
}
