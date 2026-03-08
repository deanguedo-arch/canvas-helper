import type {
  NormalizedBlock,
  NormalizedTableCell,
  NormalizedTableRow,
} from '../shared/questionCandidates'

type NumberingMap = Map<string, string>

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
  }

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function extractBodyXml(documentXml: string) {
  const bodyMatch = /<w:body\b[^>]*>([\s\S]*?)<\/w:body>/.exec(documentXml)
  return bodyMatch?.[1] ?? ''
}

function extractTopLevelBodyElements(bodyXml: string) {
  const elements: Array<{ kind: 'paragraph' | 'table'; xml: string }> = []
  let index = 0

  while (index < bodyXml.length) {
    const paragraphIndex = bodyXml.indexOf('<w:p', index)
    const tableIndex = bodyXml.indexOf('<w:tbl', index)
    const candidates = [paragraphIndex, tableIndex].filter(
      (candidateIndex) => candidateIndex >= 0,
    )

    if (candidates.length === 0) {
      break
    }

    const startIndex = Math.min(...candidates)

    if (startIndex === tableIndex) {
      const endIndex = bodyXml.indexOf('</w:tbl>', startIndex)
      if (endIndex < 0) {
        break
      }

      elements.push({
        kind: 'table',
        xml: bodyXml.slice(startIndex, endIndex + '</w:tbl>'.length),
      })
      index = endIndex + '</w:tbl>'.length
      continue
    }

    const endIndex = bodyXml.indexOf('</w:p>', startIndex)
    if (endIndex < 0) {
      break
    }

    elements.push({
      kind: 'paragraph',
      xml: bodyXml.slice(startIndex, endIndex + '</w:p>'.length),
    })
    index = endIndex + '</w:p>'.length
  }

  return elements
}

function parseNumberingXml(numberingXml?: string) {
  const numberingMap: NumberingMap = new Map()

  if (!numberingXml || numberingXml.trim().length === 0) {
    return numberingMap
  }

  const abstractMap = new Map<string, Map<string, string>>()

  for (const abstractMatch of numberingXml.matchAll(
    /<w:abstractNum\b[^>]*w:abstractNumId="([^"]+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g,
  )) {
    const abstractNumId = abstractMatch[1]
    const abstractLevels = new Map<string, string>()

    for (const levelMatch of abstractMatch[2].matchAll(
      /<w:lvl\b[^>]*w:ilvl="([^"]+)"[^>]*>([\s\S]*?)<\/w:lvl>/g,
    )) {
      const ilvl = levelMatch[1]
      const levelXml = levelMatch[2]
      const levelTextMatch = /<w:lvlText\b[^>]*w:val="([^"]+)"/.exec(levelXml)
      const numFormatMatch = /<w:numFmt\b[^>]*w:val="([^"]+)"/.exec(levelXml)

      abstractLevels.set(
        ilvl,
        decodeXmlEntities(levelTextMatch?.[1] ?? numFormatMatch?.[1] ?? 'list'),
      )
    }

    abstractMap.set(abstractNumId, abstractLevels)
  }

  for (const numberMatch of numberingXml.matchAll(
    /<w:num\b[^>]*w:numId="([^"]+)"[^>]*>([\s\S]*?)<\/w:num>/g,
  )) {
    const numId = numberMatch[1]
    const abstractNumId = /<w:abstractNumId\b[^>]*w:val="([^"]+)"/.exec(numberMatch[2])?.[1]

    if (!abstractNumId) {
      continue
    }

    const abstractLevels = abstractMap.get(abstractNumId)
    if (!abstractLevels) {
      continue
    }

    for (const [ilvl, marker] of abstractLevels.entries()) {
      numberingMap.set(`${numId}:${ilvl}`, marker)
    }
  }

  return numberingMap
}

function extractParagraphLines(paragraphXml: string) {
  const tokenPattern =
    /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>|<w:tab\b[^>]*\/>/g
  const rawLines: string[] = []
  let currentLine = ''

  for (const tokenMatch of paragraphXml.matchAll(tokenPattern)) {
    if (tokenMatch[1] !== undefined) {
      currentLine += decodeXmlEntities(tokenMatch[1])
      continue
    }

    if (tokenMatch[0].startsWith('<w:tab')) {
      currentLine += ' '
      continue
    }

    rawLines.push(currentLine)
    currentLine = ''
  }

  rawLines.push(currentLine)

  return rawLines.map(normalizeLine).filter((line) => line.length > 0)
}

function extractParagraphStyle(paragraphXml: string) {
  return /<w:pStyle\b[^>]*w:val="([^"]+)"/.exec(paragraphXml)?.[1] ?? null
}

function extractListMarker(paragraphXml: string, numberingMap: NumberingMap) {
  const numId = /<w:numId\b[^>]*w:val="([^"]+)"/.exec(paragraphXml)?.[1]
  const level = /<w:ilvl\b[^>]*w:val="([^"]+)"/.exec(paragraphXml)?.[1] ?? '0'

  if (!numId) {
    return null
  }

  return numberingMap.get(`${numId}:${level}`) ?? null
}

function extractMaxFontSize(paragraphXml: string) {
  const fontSizes = [...paragraphXml.matchAll(/<w:sz\b[^>]*w:val="(\d+)"/g)].map(
    (match) => Number(match[1]),
  )

  return fontSizes.length > 0 ? Math.max(...fontSizes) : 0
}

function hasBoldRun(paragraphXml: string) {
  return /<w:b(?:\s[^>]*w:val="0"[^>]*)?[^>]*\/?>/.test(paragraphXml)
}

function inferHeadingLevel(
  text: string,
  styleId: string | null,
  paragraphXml: string,
) {
  if (styleId) {
    const styleMatch = /^Heading([1-6])$/i.exec(styleId)
    if (styleMatch) {
      return Number(styleMatch[1])
    }
  }

  if (/^section\b/i.test(text)) {
    return 1
  }

  if (/^exercise\b/i.test(text)) {
    return 2
  }

  const maxFontSize = extractMaxFontSize(paragraphXml)
  if (text.length <= 120 && hasBoldRun(paragraphXml) && maxFontSize >= 28) {
    return 3
  }

  return null
}

function extractCellParagraphs(cellXml: string) {
  return [...cellXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((match) => match[0])
}

function parseTableCell(cellXml: string, columnIndex: number): NormalizedTableCell {
  const paragraphs = extractCellParagraphs(cellXml)
  const lines = paragraphs.flatMap((paragraphXml) => extractParagraphLines(paragraphXml))
  const text = normalizeLine(lines.join(' | '))

  return {
    columnIndex,
    text,
    lines,
    isBlank: text.length === 0,
  }
}

function parseTableRows(tableXml: string): NormalizedTableRow[] {
  return [...tableXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((rowMatch, rowIndex) => {
    const rowXml = rowMatch[0]
    const cells = [...rowXml.matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)].map(
      (cellMatch, columnIndex) => parseTableCell(cellMatch[0], columnIndex),
    )
    const text = normalizeLine(
      cells
        .map((cell) => cell.text)
        .filter((cellText) => cellText.length > 0)
        .join(' | '),
    )

    return {
      rowIndex,
      text,
      cells,
    }
  })
}

function applyHeadingContext(blocks: NormalizedBlock[]) {
  const activeHeadings: string[] = []

  return blocks.map((block) => {
    if (block.kind === 'heading' && block.headingLevel !== null) {
      activeHeadings[block.headingLevel - 1] = block.text
      activeHeadings.length = block.headingLevel
    }

    return {
      ...block,
      contextHeadings: activeHeadings.filter((heading) => heading.trim().length > 0),
    }
  })
}

type ExtractNormalizedBlocksOptions = {
  numberingXml?: string
}

export function extractNormalizedBlocksFromDocxDocumentXml(
  documentXml: string,
  options: ExtractNormalizedBlocksOptions = {},
) {
  const bodyXml = extractBodyXml(documentXml)
  const numberingMap = parseNumberingXml(options.numberingXml)
  const bodyElements = extractTopLevelBodyElements(bodyXml)
  const blocks: NormalizedBlock[] = []
  let paragraphCount = 0
  let tableCount = 0

  for (const element of bodyElements) {
    if (element.kind === 'paragraph') {
      paragraphCount += 1
      const lines = extractParagraphLines(element.xml)
      const text = normalizeLine(lines.join(' '))
      const styleId = extractParagraphStyle(element.xml)
      const headingLevel = text.length > 0 ? inferHeadingLevel(text, styleId, element.xml) : null
      const hasImage = /<w:drawing\b|<w:pict\b/.test(element.xml)
      const kind =
        text.length === 0 ? (hasImage ? 'image' : 'break') : headingLevel !== null ? 'heading' : 'paragraph'

      blocks.push({
        blockId: `paragraph_${paragraphCount}`,
        kind,
        text,
        originText: lines.join('\n'),
        lines,
        contextHeadings: [],
        headingLevel,
        listMarker: extractListMarker(element.xml, numberingMap),
        hasImage,
        tableId: null,
        rows: [],
      })
      continue
    }

    tableCount += 1
    const rows = parseTableRows(element.xml)
    blocks.push({
      blockId: `table_${tableCount}`,
      kind: 'table',
      text: rows
        .map((row) => row.text)
        .filter((rowText) => rowText.length > 0)
        .join('\n'),
      originText: rows
        .map((row) => row.cells.map((cell) => cell.text).join(' | '))
        .join('\n'),
      lines: rows
        .flatMap((row) =>
          row.cells.flatMap((cell) => cell.lines.filter((line) => line.length > 0)),
        )
        .filter((line) => line.length > 0),
      contextHeadings: [],
      headingLevel: null,
      listMarker: null,
      hasImage: false,
      tableId: `table_${tableCount}`,
      rows,
    })
  }

  return applyHeadingContext(blocks)
}

export function extractDocxTextFromDocumentXml(
  documentXml: string,
  options: ExtractNormalizedBlocksOptions = {},
) {
  return extractNormalizedBlocksFromDocxDocumentXml(documentXml, options)
    .map((block) => {
      if (block.kind === 'image') {
        return '[image]'
      }

      return block.kind === 'table'
        ? block.rows
            .map((row) => row.cells.map((cell) => cell.text).join('\n'))
            .filter((rowText) => rowText.trim().length > 0)
            .join('\n')
        : block.originText
    })
    .filter((text) => text.trim().length > 0)
    .join('\n')
    .trim()
}
