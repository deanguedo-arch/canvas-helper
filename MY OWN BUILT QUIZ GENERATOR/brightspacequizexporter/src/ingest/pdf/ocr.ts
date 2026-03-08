import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCanvas } from '@napi-rs/canvas'
import { createWorker } from 'tesseract.js'

const OCR_SCALE = 2
const DEFAULT_MAX_OCR_PAGES = 40

type PdfJsPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number }
  render: (params: {
    canvasContext: unknown
    viewport: { width: number; height: number }
  }) => { promise: Promise<void> }
}

type PdfJsDocument = {
  numPages: number
  getPage: (pageNumber: number) => Promise<PdfJsPage>
}

type PdfJsLoadingTask = {
  promise: Promise<PdfJsDocument>
  destroy?: () => Promise<void> | void
}

export type PdfOcrResult = {
  text: string
  pagesProcessed: number
}

function normalizeOcrText(rawText: string) {
  return rawText.replaceAll('\0', '').replace(/\r\n/g, '\n').trim()
}

async function loadPdfJs() {
  return (await import('pdfjs-dist/legacy/build/pdf.mjs')) as {
    getDocument: (source: {
      data: Uint8Array
      disableWorker: boolean
      useWorkerFetch: boolean
      isEvalSupported: boolean
      disableFontFace: boolean
    }) => PdfJsLoadingTask
  }
}

async function renderPageToPngBuffer(page: PdfJsPage) {
  const viewport = page.getViewport({ scale: OCR_SCALE })
  const canvas = createCanvas(
    Math.max(1, Math.floor(viewport.width)),
    Math.max(1, Math.floor(viewport.height)),
  )
  const context = canvas.getContext('2d')
  await page.render({ canvasContext: context, viewport }).promise
  return canvas.toBuffer('image/png')
}

export async function extractOcrTextFromPdf(
  filePath: string,
  maxPages = DEFAULT_MAX_OCR_PAGES,
): Promise<PdfOcrResult> {
  const pdfBuffer = await readFile(filePath)
  const pdfjs = await loadPdfJs()
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  })
  const pdfDocument = await loadingTask.promise
  const pageLimit = Math.max(1, Math.min(maxPages, pdfDocument.numPages))

  const worker = await createWorker('eng', 1, {
    cachePath: join(tmpdir(), 'brightspace-assessment-factory-ocr'),
  })
  const pageText: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const pngBuffer = await renderPageToPngBuffer(page)
      const { data } = await worker.recognize(pngBuffer)
      const normalizedText = normalizeOcrText(data.text ?? '')

      if (normalizedText.length > 0) {
        pageText.push(normalizedText)
      }
    }
  } finally {
    await worker.terminate()
    await loadingTask.destroy?.()
  }

  return {
    text: pageText.join('\f').trim(),
    pagesProcessed: pageLimit,
  }
}
