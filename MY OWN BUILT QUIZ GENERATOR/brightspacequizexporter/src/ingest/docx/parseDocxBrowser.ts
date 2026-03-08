import JSZip from 'jszip'
import type { IngestParseResult } from '../shared/ingestTypes'
import { createSourceDocument } from '../shared/sourceDocument'
import { buildDocxParseResult } from './parseDocxShared'

export async function parseDocxFile(file: File): Promise<IngestParseResult> {
  const sourceDocument = createSourceDocument({
    type: 'docx',
    origin: file.name,
    name: file.name,
  })

  const input = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(input)
  const documentXmlFile = zip.file('word/document.xml')

  if (!documentXmlFile) {
    return {
      sourceDocument,
      extractedText: '',
      questions: [],
      confidenceScore: 0,
      issues: [
        {
          code: 'missing_document_xml',
          severity: 'error',
          message: 'DOCX archive is missing word/document.xml.',
          sourcePage: null,
        },
      ],
      candidateDiagnostics: [],
    }
  }

  const documentXml = await documentXmlFile.async('text')
  const numberingXml = await zip.file('word/numbering.xml')?.async('text')

  return buildDocxParseResult({
    sourceDocument,
    documentXml,
    numberingXml,
  })
}
