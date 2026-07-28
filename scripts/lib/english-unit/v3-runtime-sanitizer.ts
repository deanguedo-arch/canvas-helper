import generateImport from "@babel/generator";
import { parse } from "@babel/parser";
import traverseImport, { type NodePath } from "@babel/traverse";
import type {
  ConditionalExpression,
  File,
  FunctionDeclaration,
  IfStatement,
  Node,
  VariableDeclaration,
  VariableDeclarator,
} from "@babel/types";

const traverse =
  ((traverseImport as unknown as { default?: typeof traverseImport }).default ?? traverseImport) as typeof traverseImport;
const generate =
  ((generateImport as unknown as { default?: typeof generateImport }).default ?? generateImport) as typeof generateImport;

export type EnglishV3RuntimeFragmentKind =
  | "writing-sequence"
  | "activity-profile"
  | "modern-drama"
  | "novel-study"
  | "film-study"
  | "short-fiction"
  | "shakespeare-drama"
  | "writing-foundations"
  | "composite"
  | "pass-through";

export type EnglishV3RuntimeFragment = {
  id: string;
  kind: EnglishV3RuntimeFragmentKind;
  source: string;
};

export type EnglishV3RuntimeViolation = {
  code: "critical-essay-token" | "critical-essay-hook" | "critical-essay-symbol";
  match: string;
  index: number;
};

type SanitizerRule = {
  symbols: ReadonlySet<string>;
};

const MODERN_ESSAY_SYMBOLS = [
  "modernEssayFields",
  "modernEssayFieldValue",
  "modernEssayPayload",
  "updateModernEssayPreview",
  "updateModernEssayPreviews",
  "saveModernEssayPreview",
  "modernEssaySave",
] as const;

const NOVEL_ESSAY_SYMBOLS = [
  "essayFieldMap",
  "previewField",
  "buildEssayPreview",
  "replacePreviewText",
  "updateEssayPreview",
  "updateEssayPreviews",
  "saveEssayPreview",
] as const;

const FILM_ESSAY_SYMBOLS = [
  "essayResponseFields",
  "essayPreviewControls",
  "buildEssayPreview",
  "replacePreviewText",
  "updateEssayPreview",
  "updateEssayPreviews",
  "saveEssayPreview",
  "essayPreviewSave",
] as const;

const EMPTY_SYMBOLS = new Set<string>();

function symbolSet(...groups: readonly (readonly string[])[]) {
  return new Set(groups.flat());
}

const RULES: Record<EnglishV3RuntimeFragmentKind, SanitizerRule> = {
  "writing-sequence": { symbols: EMPTY_SYMBOLS },
  "activity-profile": { symbols: symbolSet(MODERN_ESSAY_SYMBOLS) },
  "modern-drama": { symbols: symbolSet(MODERN_ESSAY_SYMBOLS) },
  "novel-study": { symbols: symbolSet(NOVEL_ESSAY_SYMBOLS) },
  "film-study": { symbols: symbolSet(FILM_ESSAY_SYMBOLS) },
  "short-fiction": { symbols: EMPTY_SYMBOLS },
  "shakespeare-drama": { symbols: EMPTY_SYMBOLS },
  "writing-foundations": { symbols: EMPTY_SYMBOLS },
  composite: { symbols: symbolSet(MODERN_ESSAY_SYMBOLS, NOVEL_ESSAY_SYMBOLS, FILM_ESSAY_SYMBOLS) },
  "pass-through": { symbols: EMPTY_SYMBOLS },
};

const CRITICAL_TOKEN_PATTERNS = [
  /critical(?:[-_\s]?essay)/gi,
] as const;

const CRITICAL_HOOK_PATTERNS = [
  /data-(?:save-modern-essay-preview|modern-essay-preview[^\s"'`]*)/gi,
  /data-novel-(?:essay-preview|save-essay-preview)[^\s"'`]*/gi,
  /data-film-(?:essay-preview|save-essay-preview)[^\s"'`]*/gi,
] as const;

function parseRuntime(source: string, fragmentId: string): File {
  try {
    return parse(source, { sourceType: "script" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new EnglishV3RuntimeSanitizationError(fragmentId, `Runtime JavaScript could not be parsed: ${detail}`);
  }
}

function isAstNode(value: unknown): value is Node {
  return Boolean(value && typeof value === "object" && "type" in value && typeof (value as { type?: unknown }).type === "string");
}

function nodeContains(node: Node, predicate: (candidate: Node) => boolean): boolean {
  if (predicate(node)) return true;
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "start", "end", "extra", "leadingComments", "innerComments", "trailingComments"].includes(key)) continue;
    if (isAstNode(value) && nodeContains(value, predicate)) return true;
    if (Array.isArray(value) && value.some((item) => isAstNode(item) && nodeContains(item, predicate))) return true;
  }
  return false;
}

function nodeReferencesSymbolOutsideNestedFunction(node: Node, symbols: ReadonlySet<string>, root = true): boolean {
  if (!symbols.size) return false;
  if (node.type === "Identifier" && symbols.has(node.name)) return true;
  if (!root && ["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"].includes(node.type)) return false;
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "start", "end", "extra", "leadingComments", "innerComments", "trailingComments"].includes(key)) continue;
    if (isAstNode(value) && nodeReferencesSymbolOutsideNestedFunction(value, symbols, false)) return true;
    if (Array.isArray(value) && value.some((item) => isAstNode(item) && nodeReferencesSymbolOutsideNestedFunction(item, symbols, false))) return true;
  }
  return false;
}

function nodeContainsCriticalEssayToken(node: Node) {
  return nodeContains(node, (candidate) =>
    candidate.type === "StringLiteral" && /^(?:critical-essay|Critical Essay)$/.test(candidate.value));
}

function removeVariable(path: NodePath<VariableDeclarator>) {
  const declaration = path.parentPath as NodePath<VariableDeclaration>;
  if (declaration.node.declarations.length === 1) declaration.remove();
  else path.remove();
}

function stripCriticalEssayAst(ast: File, rule: SanitizerRule) {
  traverse(ast, {
    ConditionalExpression(path: NodePath<ConditionalExpression>) {
      if (nodeContainsCriticalEssayToken(path.node.test)) path.replaceWith(path.node.alternate);
    },
    FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
      if (path.node.id && rule.symbols.has(path.node.id.name)) path.remove();
    },
    VariableDeclarator(path: NodePath<VariableDeclarator>) {
      if (path.node.id.type === "Identifier" && rule.symbols.has(path.node.id.name)) removeVariable(path);
    },
    IfStatement(path: NodePath<IfStatement>) {
      if (nodeReferencesSymbolOutsideNestedFunction(path.node, rule.symbols) || nodeContainsCriticalEssayToken(path.node.test)) path.remove();
    },
    ExpressionStatement(path) {
      if (nodeReferencesSymbolOutsideNestedFunction(path.node, rule.symbols)) path.remove();
    },
  });
}

function firstMatches(source: string, pattern: RegExp) {
  pattern.lastIndex = 0;
  const match = pattern.exec(source);
  pattern.lastIndex = 0;
  return match;
}

function symbolPattern(symbol: string) {
  return new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
}

export function inspectEnglishV3Runtime(
  source: string,
  kind: EnglishV3RuntimeFragmentKind = "composite",
): EnglishV3RuntimeViolation[] {
  const violations: EnglishV3RuntimeViolation[] = [];
  for (const pattern of CRITICAL_TOKEN_PATTERNS) {
    const match = firstMatches(source, pattern);
    if (match) violations.push({ code: "critical-essay-token", match: match[0], index: match.index });
  }
  for (const pattern of CRITICAL_HOOK_PATTERNS) {
    const match = firstMatches(source, pattern);
    if (match) violations.push({ code: "critical-essay-hook", match: match[0], index: match.index });
  }
  for (const symbol of RULES[kind].symbols) {
    const match = firstMatches(source, symbolPattern(symbol));
    if (match) violations.push({ code: "critical-essay-symbol", match: match[0], index: match.index });
  }
  return violations.sort((left, right) => left.index - right.index);
}

export class EnglishV3RuntimeSanitizationError extends Error {
  readonly fragmentId: string;
  readonly violations: readonly EnglishV3RuntimeViolation[];

  constructor(fragmentId: string, message: string, violations: readonly EnglishV3RuntimeViolation[] = []) {
    super(`[${fragmentId}] ${message}`);
    this.name = "EnglishV3RuntimeSanitizationError";
    this.fragmentId = fragmentId;
    this.violations = violations;
  }
}

export function assertEnglishV3RuntimeHasNoCriticalEssay(
  source: string,
  options: { fragmentId?: string; kind?: EnglishV3RuntimeFragmentKind } = {},
) {
  const fragmentId = options.fragmentId ?? "english-v3-runtime";
  const kind = options.kind ?? "composite";
  const violations = inspectEnglishV3Runtime(source, kind);
  if (!violations.length) return;
  const summary = violations.map((violation) => `${violation.code}:${violation.match}`).join(", ");
  throw new EnglishV3RuntimeSanitizationError(
    fragmentId,
    `Critical Essay runtime residue remains after sanitization (${summary}).`,
    violations,
  );
}

/**
 * Removes donor-only Critical Essay runtime branches from a V3 ELA -2 runtime.
 * The operation is structural: known declarations and their call sites are
 * deleted from the JavaScript AST, and the generic writing-form title branch is
 * rewritten to its non-Critical-Essay alternate. Unknown residue fails closed.
 */
export function sanitizeEnglishV3Runtime(fragment: EnglishV3RuntimeFragment): string {
  const source = fragment.source.trim();
  if (!source) return "";
  if (fragment.kind === "pass-through") {
    assertEnglishV3RuntimeHasNoCriticalEssay(source, { fragmentId: fragment.id, kind: fragment.kind });
    return source;
  }
  const ast = parseRuntime(source, fragment.id);
  stripCriticalEssayAst(ast, RULES[fragment.kind]);
  const sanitized = generate(ast, { comments: false, compact: true }).code;
  assertEnglishV3RuntimeHasNoCriticalEssay(sanitized, { fragmentId: fragment.id, kind: fragment.kind });
  return sanitized;
}

/**
 * Sanitizes and joins runtime fragments in their original order. Supplying
 * separate fragments is preferred, but a renderer's already-combined native +
 * writing runtime can be passed as `modern-drama`, `novel-study`, `film-study`,
 * or `composite`.
 */
export function composeEnglishV3Runtime(fragments: readonly EnglishV3RuntimeFragment[]): string {
  const runtime = fragments
    .map(sanitizeEnglishV3Runtime)
    .filter(Boolean)
    .join("\n");
  assertEnglishV3RuntimeHasNoCriticalEssay(runtime, { fragmentId: "english-v3-runtime-composite", kind: "composite" });
  return runtime;
}
