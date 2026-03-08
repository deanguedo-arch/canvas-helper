declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export function getDocument(source: {
    data: Uint8Array
    disableWorker: boolean
    useWorkerFetch: boolean
    isEvalSupported: boolean
    disableFontFace: boolean
  }): {
    promise: Promise<{
      numPages: number
      getPage: (pageNumber: number) => Promise<{
        getViewport: (options: { scale: number }) => { width: number; height: number }
        render: (params: {
          canvasContext: unknown
          viewport: { width: number; height: number }
        }) => { promise: Promise<void> }
      }>
    }>
    destroy?: () => Promise<void> | void
  }
}
