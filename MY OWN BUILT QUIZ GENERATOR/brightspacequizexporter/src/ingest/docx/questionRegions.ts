import type {
  NormalizedBlock,
  QuestionChoiceCandidate,
  QuestionRegion,
} from '../shared/questionCandidates'

const NUMBERED_PROMPT_PATTERN = /^(\d+)[).-]\s+(.+)$/
const SUBPART_PROMPT_PATTERN = /^([a-z])[).-]\s+(.+)$/i
const LABELED_SLOT_PATTERN = /^([A-Za-z][A-Za-z\s/-]{0,40}):\s*$/
const OPTION_PATTERN = /^([A-H])[).]\s+(.+)$/i
const MATCHING_CUE_PATTERN = /\bmatch(?:ing)?\b/i
const ORDERING_CUE_PATTERN = /\b(order|arrange|sequence|rank)\b/i
const FILL_BLANK_CUE_PATTERN =
  /\b(fill in the blank|fill in the blanks|identify the name|statement:)\b/i

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function isQuestionLikeParagraph(text: string) {
  const normalizedText = normalizeText(text)

  if (normalizedText.length < 8 || normalizedText.length > 500) {
    return false
  }

  if (NUMBERED_PROMPT_PATTERN.test(normalizedText)) {
    return true
  }

  if (normalizedText.includes('?')) {
    return true
  }

  return /^(?:what|why|how|when|where|who|explain|describe|compare|discuss|define|identify)\b/i.test(
    normalizedText,
  )
}

function isSubpartPrompt(text: string) {
  return SUBPART_PROMPT_PATTERN.test(text)
}

function isLabeledResponseSlot(text: string) {
  return LABELED_SLOT_PATTERN.test(text)
}

function stripNumberPrefix(text: string) {
  return normalizeText(text.replace(NUMBERED_PROMPT_PATTERN, '$2'))
}

function stripSubpartPrefix(text: string) {
  return normalizeText(text.replace(SUBPART_PROMPT_PATTERN, '$2'))
}

function buildRegion(
  regionId: string,
  promptParts: string[],
  contextHeadings: string[],
  instructionContext: string[],
  sourceBlockIds: string[],
  sourcePage: number | null,
  originParts: string[],
  responseSpaceCount: number,
  structuralSignals: string[],
  choices: QuestionChoiceCandidate[] = [],
  matchingPairs: QuestionRegion['matchingPairs'] = [],
  orderingItems: string[] = [],
  tableColumnCount: number | null = null,
  splitFromComposite = false,
): QuestionRegion {
  const normalizedPromptParts = promptParts.map(normalizeText).filter((part) => part.length > 0)

  return {
    regionId,
    prompt: normalizeText(normalizedPromptParts.join(' ')),
    promptParts: normalizedPromptParts,
    originText: originParts.map(normalizeText).filter((part) => part.length > 0).join('\n'),
    contextHeadings,
    instructionContext: instructionContext.map(normalizeText).filter((part) => part.length > 0),
    sourceBlockIds,
    sourcePage,
    choices,
    matchingPairs,
    orderingItems,
    responseSpaceCount,
    tableColumnCount,
    splitFromComposite,
    structuralSignals,
  }
}

function isPureResponseSpaceTable(block: NormalizedBlock) {
  if (block.kind !== 'table' || block.rows.length === 0) {
    return false
  }

  return block.rows.every((row) => row.cells.every((cell) => cell.isBlank))
}

function countResponseSpaceRows(block: NormalizedBlock) {
  if (block.kind !== 'table') {
    return 0
  }

  const blankRowCount = block.rows.filter((row) =>
    row.cells.every((cell) => cell.isBlank),
  ).length

  return blankRowCount > 0 ? blankRowCount : 1
}

function parseChoiceLines(lines: string[]) {
  if (lines.length === 0) {
    return null
  }

  const firstLineMatch = NUMBERED_PROMPT_PATTERN.exec(lines[0])
  if (!firstLineMatch) {
    return null
  }

  let prompt = normalizeText(firstLineMatch[2])
  const choices: QuestionChoiceCandidate[] = []
  let currentChoice: QuestionChoiceCandidate | null = null

  for (const line of lines.slice(1)) {
    const optionMatch = OPTION_PATTERN.exec(line)

    if (optionMatch) {
      if (currentChoice) {
        choices.push(currentChoice)
      }

      currentChoice = {
        label: optionMatch[1].toUpperCase(),
        text: normalizeText(optionMatch[2]),
      }
      continue
    }

    if (currentChoice) {
      currentChoice = {
        ...currentChoice,
        text: normalizeText(`${currentChoice.text} ${line}`),
      }
      continue
    }

    prompt = normalizeText(`${prompt} ${line}`)
  }

  if (currentChoice) {
    choices.push(currentChoice)
  }

  return choices.length >= 2
    ? {
        prompt,
        choices,
      }
    : null
}

function extractChoiceRegionsFromTable(
  block: NormalizedBlock,
  instructionContext: string[],
) {
  const regions: QuestionRegion[] = []

  if (block.kind !== 'table') {
    return regions
  }

  for (const row of block.rows) {
    const populatedCells = row.cells.filter((cell) => !cell.isBlank)
    if (populatedCells.length === 0) {
      continue
    }

    const candidateCell =
      populatedCells.sort((left, right) => right.lines.length - left.lines.length)[0]
    const parsedChoiceBlock = parseChoiceLines(candidateCell.lines)

    if (!parsedChoiceBlock) {
      continue
    }

    regions.push(
      buildRegion(
        `${block.blockId}_row_${row.rowIndex + 1}`,
        [parsedChoiceBlock.prompt],
        block.contextHeadings,
        instructionContext,
        [block.blockId],
        null,
        [...instructionContext, ...candidateCell.lines],
        0,
        ['table-choice-row', 'labeled-options'],
        parsedChoiceBlock.choices,
        [],
        [],
        row.cells.length,
      ),
    )
  }

  return regions
}

function extractMatchingPairsFromTable(block: NormalizedBlock) {
  if (block.kind !== 'table') {
    return []
  }

  return block.rows
    .map((row) => {
      const populatedCells = row.cells.filter((cell) => !cell.isBlank)
      if (populatedCells.length < 2) {
        return null
      }

      const promptCell = populatedCells[0]
      const matchCell = populatedCells[populatedCells.length - 1]

      if (
        promptCell.text.length === 0 ||
        matchCell.text.length === 0 ||
        promptCell.columnIndex === matchCell.columnIndex
      ) {
        return null
      }

      if (/^column\b/i.test(promptCell.text) || /^answer\b/i.test(matchCell.text)) {
        return null
      }

      return {
        promptText: promptCell.text,
        matchText: matchCell.text,
      }
    })
    .filter((pair): pair is NonNullable<typeof pair> => pair !== null)
}

function extractMatchingRegionFromTable(
  block: NormalizedBlock,
  instructionContext: string[],
) {
  if (block.kind !== 'table') {
    return []
  }

  const combinedContext = normalizeText(
    [...block.contextHeadings, ...instructionContext].join(' '),
  )
  const matchingPairs = extractMatchingPairsFromTable(block)

  if (
    matchingPairs.length < 2 ||
    (!MATCHING_CUE_PATTERN.test(combinedContext) &&
      !/column a|column b|answer/i.test(block.text))
  ) {
    return []
  }

  const prompt =
    instructionContext.at(-1) ??
    block.contextHeadings.at(-1) ??
    'Match each prompt with the correct response.'

  return [
    buildRegion(
      block.blockId,
      [prompt],
      block.contextHeadings,
      instructionContext,
      [block.blockId],
      null,
      [prompt, block.originText],
      0,
      ['matching-table'],
      [],
      matchingPairs,
      [],
      block.rows[0]?.cells.length ?? null,
    ),
  ]
}

function extractOrderingRegionFromTable(
  block: NormalizedBlock,
  instructionContext: string[],
) {
  if (block.kind !== 'table') {
    return []
  }

  const combinedContext = normalizeText(
    [...block.contextHeadings, ...instructionContext].join(' '),
  )

  if (!ORDERING_CUE_PATTERN.test(combinedContext)) {
    return []
  }

  const orderingItems = block.rows
    .flatMap((row) => row.cells.map((cell) => cell.text))
    .map(normalizeText)
    .filter((item) => item.length > 0)

  if (orderingItems.length < 2) {
    return []
  }

  const prompt =
    instructionContext.at(-1) ?? block.contextHeadings.at(-1) ?? 'Arrange the items in order.'

  return [
    buildRegion(
      block.blockId,
      [prompt],
      block.contextHeadings,
      instructionContext,
      [block.blockId],
      null,
      [prompt, block.originText],
      0,
      ['ordering-items'],
      [],
      [],
      orderingItems,
      block.rows[0]?.cells.length ?? null,
    ),
  ]
}

function extractBlankAnswerRegionsFromTable(
  block: NormalizedBlock,
  instructionContext: string[],
) {
  const regions: QuestionRegion[] = []

  if (block.kind !== 'table') {
    return regions
  }

  const combinedContext = normalizeText(
    [...block.contextHeadings, ...instructionContext].join(' '),
  )
  const shouldTreatAsBlankAnswerTable =
    FILL_BLANK_CUE_PATTERN.test(combinedContext) ||
    /statement:/i.test(block.text) ||
    /individual'?s name/i.test(block.text)

  if (!shouldTreatAsBlankAnswerTable) {
    return regions
  }

  const stemPrompt =
    instructionContext.at(-1) ??
    block.contextHeadings.at(-1) ??
    'Complete the blank answer fields from the source.'

  for (const row of block.rows) {
    const populatedCells = row.cells.filter((cell) => !cell.isBlank)

    if (populatedCells.length === 0 || populatedCells.length > 1) {
      continue
    }

    if (/statement:|individual'?s name:/i.test(populatedCells[0].text)) {
      continue
    }

    regions.push(
      buildRegion(
        `${block.blockId}_row_${row.rowIndex + 1}`,
        [stemPrompt, populatedCells[0].text],
        block.contextHeadings,
        instructionContext,
        [block.blockId],
        null,
        [stemPrompt, populatedCells[0].text],
        1,
        ['blank-answer-cell'],
        [],
        [],
        [],
        row.cells.length,
      ),
    )
  }

  return regions
}

function extractRegionsFromTable(block: NormalizedBlock, instructionContext: string[]) {
  const choiceRegions = extractChoiceRegionsFromTable(block, instructionContext)
  if (choiceRegions.length > 0) {
    return choiceRegions
  }

  const matchingRegions = extractMatchingRegionFromTable(block, instructionContext)
  if (matchingRegions.length > 0) {
    return matchingRegions
  }

  const orderingRegions = extractOrderingRegionFromTable(block, instructionContext)
  if (orderingRegions.length > 0) {
    return orderingRegions
  }

  return extractBlankAnswerRegionsFromTable(block, instructionContext)
}

type CaptureResult = {
  nextIndex: number
  regions: QuestionRegion[]
}

function captureCompositeRegions(
  blocks: NormalizedBlock[],
  startIndex: number,
  stemParts: string[],
  contextHeadings: string[],
  instructionContext: string[],
  parentBlockIds: string[],
): CaptureResult {
  const regions: QuestionRegion[] = []
  let index = startIndex

  while (index < blocks.length) {
    const block = blocks[index]

    if (block.kind !== 'paragraph') {
      break
    }

    const isSubpart = isSubpartPrompt(block.text)
    const isLabeledSlot = isLabeledResponseSlot(block.text)

    if (!isSubpart && !isLabeledSlot) {
      break
    }

    const labelText = isSubpart ? block.text : normalizeText(block.text)
    const promptText = isSubpart ? stripSubpartPrefix(block.text) : normalizeText(block.text)
    const sourceBlockIds = [...parentBlockIds, block.blockId]
    const originParts = [...instructionContext, ...stemParts, labelText]
    let responseSpaceCount = 0
    let tableColumnCount: number | null = null
    const structuralSignals = [isSubpart ? 'subpart-response-slot' : 'labeled-response-slot']
    index += 1

    while (index < blocks.length && blocks[index].kind === 'break') {
      index += 1
    }

    if (index < blocks.length && blocks[index].kind === 'table' && isPureResponseSpaceTable(blocks[index])) {
      const tableBlock = blocks[index]
      sourceBlockIds.push(tableBlock.blockId)
      responseSpaceCount = countResponseSpaceRows(tableBlock)
      tableColumnCount = tableBlock.rows[0]?.cells.length ?? null
      structuralSignals.push('response-space-table')
      index += 1
    }

    regions.push(
      buildRegion(
        `${block.blockId}_split`,
        [...stemParts, promptText],
        contextHeadings,
        instructionContext,
        sourceBlockIds,
        null,
        originParts,
        responseSpaceCount,
        structuralSignals,
        [],
        [],
        [],
        tableColumnCount,
        true,
      ),
    )
  }

  return {
    nextIndex: index,
    regions,
  }
}

function capturePromptRegion(
  blocks: NormalizedBlock[],
  startIndex: number,
  instructionContext: string[],
): CaptureResult {
  const startBlock = blocks[startIndex]

  if (startBlock.kind !== 'paragraph') {
    return {
      nextIndex: startIndex + 1,
      regions: [],
    }
  }

  const stemParts = [stripNumberPrefix(startBlock.text)]
  const continuationParts: string[] = []
  const sourceBlockIds = [startBlock.blockId]
  const originParts = [...instructionContext, startBlock.text]
  let index = startIndex + 1
  let responseSpaceCount = 0
  let tableColumnCount: number | null = null

  while (index < blocks.length) {
    const block = blocks[index]

    if (block.kind === 'heading') {
      break
    }

    if (block.kind === 'break' || block.kind === 'image') {
      index += 1
      continue
    }

    if (block.kind === 'table') {
      if (isPureResponseSpaceTable(block)) {
        sourceBlockIds.push(block.blockId)
        responseSpaceCount = countResponseSpaceRows(block)
        tableColumnCount = block.rows[0]?.cells.length ?? null
        index += 1
      }
      break
    }

    if (block.kind === 'paragraph') {
      if (NUMBERED_PROMPT_PATTERN.test(block.text)) {
        break
      }

      if (isSubpartPrompt(block.text) || isLabeledResponseSlot(block.text)) {
        return captureCompositeRegions(
          blocks,
          index,
          [...stemParts, ...continuationParts],
          startBlock.contextHeadings,
          instructionContext,
          sourceBlockIds,
        )
      }

      continuationParts.push(block.text)
      sourceBlockIds.push(block.blockId)
      originParts.push(block.text)
      index += 1
      continue
    }

    index += 1
  }

  return {
    nextIndex: index,
    regions: [
      buildRegion(
        `${startBlock.blockId}_prompt`,
        [...stemParts, ...continuationParts],
        startBlock.contextHeadings,
        instructionContext,
        sourceBlockIds,
        null,
        originParts,
        responseSpaceCount,
        responseSpaceCount > 0 ? ['response-space-table'] : ['numbered-paragraph'],
        [],
        [],
        [],
        tableColumnCount,
      ),
    ],
  }
}

export function extractQuestionRegionsFromDocxBlocks(blocks: NormalizedBlock[]) {
  const regions: QuestionRegion[] = []
  let instructionContext: string[] = []
  let index = 0

  while (index < blocks.length) {
    const block = blocks[index]

    if (block.kind === 'heading') {
      instructionContext = []
      index += 1
      continue
    }

    if (block.kind === 'break' || block.kind === 'image') {
      index += 1
      continue
    }

    if (block.kind === 'table') {
      const tableRegions = extractRegionsFromTable(block, instructionContext)
      if (tableRegions.length > 0) {
        regions.push(...tableRegions)
        instructionContext = []
      }
      index += 1
      continue
    }

    if (NUMBERED_PROMPT_PATTERN.test(block.text)) {
      const captureResult = capturePromptRegion(blocks, index, instructionContext)
      regions.push(...captureResult.regions)
      instructionContext = []
      index = captureResult.nextIndex
      continue
    }

    if (isQuestionLikeParagraph(block.text)) {
      regions.push(
        buildRegion(
          `${block.blockId}_fallback`,
          [block.text],
          block.contextHeadings,
          instructionContext,
          [block.blockId],
          null,
          [...instructionContext, block.text],
          0,
          ['question-like-paragraph'],
        ),
      )
      instructionContext = []
      index += 1
      continue
    }

    instructionContext.push(block.text)
    index += 1
  }

  return regions
}
