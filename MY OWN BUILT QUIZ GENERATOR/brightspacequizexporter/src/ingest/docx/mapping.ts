import type { QuestionRegion } from '../shared/questionCandidates'
import { extractQuestionRegionsFromDocxBlocks } from './questionRegions'
import {
  extractDocxTextFromDocumentXml as extractTextFromDocumentXml,
  extractNormalizedBlocksFromDocxDocumentXml,
} from './structure'

export type DocxQuestionCandidate = {
  prompt: string
}

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function isLikelyHeader(line: string) {
  const isUppercase = line.length > 20 && line === line.toUpperCase()
  const looksLikePage = /^page\s+\d+/i.test(line)
  const mostlyDigits = /^[\d\s\-.,]+$/.test(line)
  return isUppercase || looksLikePage || mostlyDigits
}

function isLikelyQuestion(line: string) {
  if (line.length < 12 || line.length > 360) {
    return false
  }

  if (isLikelyHeader(line)) {
    return false
  }

  if (line.includes('?')) {
    return true
  }

  if (/^\d+[).-]\s+/.test(line)) {
    return true
  }

  return /^(?:explain|describe|compare|analyze|identify|list|discuss)\b/i.test(line)
}

function mapRegionsToDraftPrompts(regions: QuestionRegion[]) {
  const seenPrompts = new Set<string>()
  const candidates: DocxQuestionCandidate[] = []

  for (const region of regions) {
    const prompt = normalizeLine(region.prompt)
    const dedupeKey = prompt.toLowerCase()

    if (prompt.length === 0 || seenPrompts.has(dedupeKey)) {
      continue
    }

    seenPrompts.add(dedupeKey)
    candidates.push({ prompt })
  }

  return candidates
}

export function extractNormalizedDocxBlocks(
  documentXml: string,
  options: { numberingXml?: string } = {},
) {
  return extractNormalizedBlocksFromDocxDocumentXml(documentXml, options)
}

export function extractDocxTextFromDocumentXml(
  documentXml: string,
  options: { numberingXml?: string } = {},
) {
  return extractTextFromDocumentXml(documentXml, options)
}

export function extractDraftQuestionsFromDocxBlocks(
  documentXml: string,
  options: { numberingXml?: string } = {},
) {
  const blocks = extractNormalizedBlocksFromDocxDocumentXml(documentXml, options)
  return mapRegionsToDraftPrompts(extractQuestionRegionsFromDocxBlocks(blocks))
}

export function extractDraftQuestionsFromDocxText(rawText: string): DocxQuestionCandidate[] {
  const lines = rawText
    .split('\n')
    .map(normalizeLine)
    .filter((line) => line.length > 0)

  const candidates: DocxQuestionCandidate[] = []
  const seenPrompts = new Set<string>()

  for (const line of lines) {
    if (!isLikelyQuestion(line)) {
      continue
    }

    const prompt = normalizeLine(line.replace(/^\d+[).-]\s+/, ''))
    const dedupeKey = prompt.toLowerCase()

    if (seenPrompts.has(dedupeKey)) {
      continue
    }

    seenPrompts.add(dedupeKey)
    candidates.push({ prompt })
  }

  return candidates
}

export { extractQuestionRegionsFromDocxBlocks }
