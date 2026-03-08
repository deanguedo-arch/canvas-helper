type PdfExtractionConfidenceInput = {
  extractedTextLength: number
  questionCandidateCount: number
  pageCount: number
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function scorePdfQuestionConfidence(prompt: string) {
  const trimmedPrompt = prompt.trim()
  if (trimmedPrompt.length === 0) {
    return 0
  }

  let score = 0.35

  if (trimmedPrompt.includes('?')) {
    score += 0.25
  }

  if (/^(?:\d+[).-]\s*)?(?:what|why|how|when|where|who|do|does|should|explain|describe|compare)\b/i.test(trimmedPrompt)) {
    score += 0.2
  }

  if (trimmedPrompt.length >= 20 && trimmedPrompt.length <= 220) {
    score += 0.15
  }

  if (/[.!?]$/.test(trimmedPrompt)) {
    score += 0.05
  }

  return clamp(Number(score.toFixed(2)))
}

export function scorePdfExtractionConfidence(input: PdfExtractionConfidenceInput) {
  const normalizedTextScore = Math.min(1, input.extractedTextLength / 2000)
  const normalizedQuestionScore = Math.min(
    1,
    input.questionCandidateCount / Math.max(2, input.pageCount),
  )

  const score = normalizedTextScore * 0.55 + normalizedQuestionScore * 0.45
  return clamp(Number(score.toFixed(2)))
}
