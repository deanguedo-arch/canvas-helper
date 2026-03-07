export type PdfChoiceCandidate = {
  label: string
  text: string
}

export type PdfMatchingPairCandidate = {
  promptText: string
  matchText: string
}

export type PdfQuestionCandidate = {
  prompt: string
  sourcePage: number
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'multi_select'
    | 'short_answer'
    | 'written_response'
    | 'matching'
    | 'ordering'
  choices: PdfChoiceCandidate[]
  matchingPairs: PdfMatchingPairCandidate[]
  orderingItems: string[]
}

type SectionMode =
  | 'multiple_choice'
  | 'true_false'
  | 'multi_select'
  | 'matching'
  | 'ordering'
  | 'short_answer'
  | null

const MIN_PROMPT_LENGTH = 8
const MAX_PROMPT_LENGTH = 420
const QUESTION_START_PATTERN = /^(\d+)[).-]\s+(.+)$/
const OPTION_START_PATTERN = /^([A-H])[).]\s+(.+)$/i
const INLINE_TRUE_FALSE_PATTERN =
  /^(?:true\s*\/\s*false|true\s+or\s+false|t\s*\/\s*f)[:\-\s]+(.+)$/i
const MATCHING_CUE_PATTERN = /\bmatch(?:ing)?\b/i
const ORDERING_CUE_PATTERN = /\b(order|arrange|sequence|rank)\b/i
const SHORT_ANSWER_CUE_PATTERN =
  /\b(short answer|fill in the blank|one word|brief answer)\b/i
const MULTI_SELECT_CUE_PATTERN =
  /\b(select|choose|mark)\b[\w\s,-]{0,40}\b(all that apply|all correct|more than one)\b|\ball that apply\b/i

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function normalizePdfText(rawText: string) {
  return rawText.replaceAll('\0', '').replace(/\r\n/g, '\n').trim()
}

function splitIntoPages(normalizedText: string) {
  const pages = normalizedText.split('\f')
  return pages.length > 0 ? pages : [normalizedText]
}

function isLikelyHeader(line: string) {
  const isUppercase = line.length > 20 && line === line.toUpperCase()
  const looksLikePage = /^page\s+\d+/i.test(line)
  const mostlyDigits = /^[\d\s\-.,]+$/.test(line)
  return isUppercase || looksLikePage || mostlyDigits
}

function isLikelyFallbackQuestion(line: string) {
  if (line.length < MIN_PROMPT_LENGTH || line.length > MAX_PROMPT_LENGTH) {
    return false
  }

  if (isLikelyHeader(line)) {
    return false
  }

  if (detectSectionMode(line) !== null) {
    return false
  }

  if (line.includes('?')) {
    return true
  }

  if (/^(?:explain|describe|compare|analyze|identify|list|discuss)\b/i.test(line)) {
    return true
  }

  if (SHORT_ANSWER_CUE_PATTERN.test(line) || /_{3,}/.test(line)) {
    return true
  }

  return false
}

function isTrueToken(value: string) {
  const token = normalizedKey(value).replace(/[.!?]+$/g, '')
  return token === 'true' || token === 't'
}

function isFalseToken(value: string) {
  const token = normalizedKey(value).replace(/[.!?]+$/g, '')
  return token === 'false' || token === 'f'
}

function isTrueFalseChoiceSet(choices: PdfChoiceCandidate[]) {
  if (choices.length !== 2) {
    return false
  }

  const texts = choices.map((choice) => choice.text)
  const labels = choices.map((choice) => choice.label)
  const hasTrue = texts.some(isTrueToken) || labels.some(isTrueToken)
  const hasFalse = texts.some(isFalseToken) || labels.some(isFalseToken)
  return hasTrue && hasFalse
}

function parseMatchingPairs(lines: string[]): PdfMatchingPairCandidate[] {
  const pairs: PdfMatchingPairCandidate[] = []

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/^(?:[-*•]|\d+[).-]|[A-H][).])\s*/, '')
      .trim()
    const match = /^(.+?)\s*(?:-|:|–|—)\s*(.+)$/.exec(line)

    if (!match) {
      continue
    }

    const left = normalizeLine(match[1])
    const right = normalizeLine(match[2])
    if (left.length < 2 || right.length < 2) {
      continue
    }

    pairs.push({
      promptText: left,
      matchText: right,
    })
  }

  return pairs.length >= 2 ? pairs : []
}

function parseOrderingItems(lines: string[]): string[] {
  const items = lines
    .map((line) => line.replace(/^(?:[-*•]|\d+[).-]|[A-H][).])\s*/, '').trim())
    .filter((line) => line.length > 0)

  return items.length >= 2 ? items : []
}

function detectSectionMode(line: string): SectionMode {
  const normalized = line.toLowerCase()
  const looksLikeHeading =
    normalized.length <= 90 &&
    !QUESTION_START_PATTERN.test(normalized) &&
    !OPTION_START_PATTERN.test(normalized)

  if (!looksLikeHeading) {
    return null
  }

  if (/true\s*or\s*false|t\s*\/\s*f/.test(normalized)) {
    return 'true_false'
  }

  if (/multiple[-\s]*choice|multiple choice/.test(normalized)) {
    return 'multiple_choice'
  }

  if (/multi[-\s]*select|all that apply/.test(normalized)) {
    return 'multi_select'
  }

  if (/matching|match the following/.test(normalized)) {
    return 'matching'
  }

  if (/ordering|sequence|arrange|rank/.test(normalized)) {
    return 'ordering'
  }

  if (/short answer|fill in the blank|brief answer/.test(normalized)) {
    return 'short_answer'
  }

  return null
}

function pushCandidate(
  candidates: PdfQuestionCandidate[],
  seenKeys: Set<string>,
  candidate: PdfQuestionCandidate,
) {
  const prompt = normalizeLine(candidate.prompt)
  if (prompt.length < MIN_PROMPT_LENGTH || prompt.length > MAX_PROMPT_LENGTH) {
    return
  }

  const choiceKey = candidate.choices
    .map((choice) => `${choice.label}:${normalizedKey(choice.text)}`)
    .join('|')
  const pairKey = candidate.matchingPairs
    .map((pair) => `${normalizedKey(pair.promptText)}=>${normalizedKey(pair.matchText)}`)
    .join('|')
  const orderKey = candidate.orderingItems.map(normalizedKey).join('|')
  const dedupeKey = `${normalizedKey(prompt)}|${candidate.questionType}|${choiceKey}|${pairKey}|${orderKey}`

  if (seenKeys.has(dedupeKey)) {
    return
  }

  seenKeys.add(dedupeKey)
  candidates.push({
    ...candidate,
    prompt,
    choices: candidate.choices.map((choice) => ({
      label: choice.label,
      text: normalizeLine(choice.text),
    })),
    matchingPairs: candidate.matchingPairs.map((pair) => ({
      promptText: normalizeLine(pair.promptText),
      matchText: normalizeLine(pair.matchText),
    })),
    orderingItems: candidate.orderingItems.map(normalizeLine),
  })
}

function classifyNumberedBlock(
  prompt: string,
  choices: PdfChoiceCandidate[],
  bodyLines: string[],
  sectionMode: SectionMode,
) {
  const matchingPairsFromBody = parseMatchingPairs(bodyLines)
  const matchingPairsFromChoices = parseMatchingPairs(
    choices.map((choice) => choice.text),
  )

  if (choices.length >= 2) {
    if (isTrueFalseChoiceSet(choices) || sectionMode === 'true_false') {
      return 'true_false' as const
    }

    if (
      (sectionMode === 'matching' || MATCHING_CUE_PATTERN.test(prompt)) &&
      (matchingPairsFromBody.length >= 2 || matchingPairsFromChoices.length >= 2)
    ) {
      return 'matching' as const
    }

    if (sectionMode === 'ordering') {
      return 'ordering' as const
    }

    if (sectionMode === 'multi_select' || MULTI_SELECT_CUE_PATTERN.test(prompt)) {
      return 'multi_select' as const
    }

    return 'multiple_choice' as const
  }

  if (
    sectionMode === 'true_false' ||
    INLINE_TRUE_FALSE_PATTERN.test(prompt) ||
    /(?:true|false)\b/i.test(prompt)
  ) {
    return 'true_false' as const
  }

  if (sectionMode === 'matching' || MATCHING_CUE_PATTERN.test(prompt)) {
    const pairs =
      matchingPairsFromBody.length >= 2
        ? matchingPairsFromBody
        : matchingPairsFromChoices
    if (pairs.length >= 2) {
      return 'matching' as const
    }
  }

  if (sectionMode === 'ordering' || ORDERING_CUE_PATTERN.test(prompt)) {
    const orderingItems = parseOrderingItems(bodyLines)
    if (orderingItems.length >= 2) {
      return 'ordering' as const
    }
  }

  if (
    sectionMode === 'short_answer' ||
    SHORT_ANSWER_CUE_PATTERN.test(prompt) ||
    /_{3,}/.test(prompt)
  ) {
    return 'short_answer' as const
  }

  return 'written_response' as const
}

function parseNumberedQuestionBlock(
  lines: string[],
  startIndex: number,
  sourcePage: number,
  sectionMode: SectionMode,
) {
  const startLine = lines[startIndex]
  const questionMatch = QUESTION_START_PATTERN.exec(startLine)

  if (!questionMatch) {
    return null
  }

  const promptHead = questionMatch[2]
  const bodyLines: string[] = []
  const choices: PdfChoiceCandidate[] = []
  let index = startIndex + 1

  while (index < lines.length) {
    const line = lines[index]

    if (QUESTION_START_PATTERN.test(line) || OPTION_START_PATTERN.test(line)) {
      break
    }

    if (!isLikelyHeader(line)) {
      bodyLines.push(line)
    }
    index += 1
  }

  while (index < lines.length) {
    const line = lines[index]
    const optionMatch = OPTION_START_PATTERN.exec(line)

    if (!optionMatch) {
      break
    }

    const option = {
      label: optionMatch[1].toUpperCase(),
      text: optionMatch[2],
    }
    index += 1

    while (index < lines.length) {
      const continuationLine = lines[index]

      if (
        QUESTION_START_PATTERN.test(continuationLine) ||
        OPTION_START_PATTERN.test(continuationLine)
      ) {
        break
      }

      if (isLikelyHeader(continuationLine)) {
        index += 1
        continue
      }

      option.text = `${option.text} ${continuationLine}`.trim()
      index += 1
    }

    choices.push(option)
  }

  const prompt = [promptHead, ...bodyLines].join(' ').trim()
  const questionType = classifyNumberedBlock(prompt, choices, bodyLines, sectionMode)
  const matchingPairs =
    questionType === 'matching'
      ? (() => {
          const fromBody = parseMatchingPairs(bodyLines)
          if (fromBody.length >= 2) {
            return fromBody
          }
          return parseMatchingPairs(choices.map((choice) => choice.text))
        })()
      : []
  const orderingItems =
    questionType === 'ordering'
      ? choices.length >= 2
        ? choices.map((choice) => choice.text)
        : parseOrderingItems(bodyLines)
      : []
  const normalizedChoices =
    questionType === 'true_false'
      ? [
          { label: 'T', text: 'True' },
          { label: 'F', text: 'False' },
        ]
      : questionType === 'ordering'
        ? orderingItems.map((item, itemIndex) => ({
            label: String(itemIndex + 1),
            text: item,
          }))
        : choices

  return {
    nextIndex: index,
    candidate: {
      prompt,
      sourcePage,
      questionType,
      choices: normalizedChoices,
      matchingPairs,
      orderingItems,
    } satisfies PdfQuestionCandidate,
  }
}

export function extractDraftQuestionsFromPdfText(rawText: string): PdfQuestionCandidate[] {
  const normalizedText = normalizePdfText(rawText)
  const pages = splitIntoPages(normalizedText)
  const candidates: PdfQuestionCandidate[] = []
  const seenKeys = new Set<string>()

  pages.forEach((pageText, pageIndex) => {
    const lines = pageText
      .split('\n')
      .map(normalizeLine)
      .filter((line) => line.length > 0)

    let index = 0
    let sectionMode: SectionMode = null

    while (index < lines.length) {
      const line = lines[index]
      const detectedMode = detectSectionMode(line)
      if (detectedMode !== null) {
        sectionMode = detectedMode
      }

      const numberedBlock = parseNumberedQuestionBlock(
        lines,
        index,
        pageIndex + 1,
        sectionMode,
      )

      if (numberedBlock) {
        pushCandidate(candidates, seenKeys, numberedBlock.candidate)
        index = numberedBlock.nextIndex
        continue
      }

      const inlineTrueFalseMatch = INLINE_TRUE_FALSE_PATTERN.exec(line)
      if (inlineTrueFalseMatch) {
        pushCandidate(candidates, seenKeys, {
          prompt: inlineTrueFalseMatch[1],
          sourcePage: pageIndex + 1,
          questionType: 'true_false',
          choices: [
            { label: 'T', text: 'True' },
            { label: 'F', text: 'False' },
          ],
          matchingPairs: [],
          orderingItems: [],
        })
        index += 1
        continue
      }

      if (isLikelyFallbackQuestion(line)) {
        const fallbackType =
          sectionMode === 'short_answer' || SHORT_ANSWER_CUE_PATTERN.test(line)
            ? 'short_answer'
            : 'written_response'
        pushCandidate(candidates, seenKeys, {
          prompt: line,
          sourcePage: pageIndex + 1,
          questionType: fallbackType,
          choices: [],
          matchingPairs: [],
          orderingItems: [],
        })
      }

      index += 1
    }
  })

  return candidates
}

export function hasQuestionSignals(extractedText: string) {
  return /[?]|\b(?:what|why|how|when|where|who|explain|describe|compare|discuss|true|false|match|order|arrange)\b/i.test(
    extractedText,
  )
}
