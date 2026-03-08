import type { QuestionType } from '../../core/schema/enums'

export type BrightspaceQuestionTypeCode =
  | 'WR'
  | 'SA'
  | 'M'
  | 'MC'
  | 'TF'
  | 'MS'
  | 'O'

export type BrightspaceCsvRowKeyword =
  | 'NewQuestion'
  | 'Title'
  | 'Points'
  | 'QuestionText'
  | 'Scoring'
  | 'Option'
  | 'TRUE'
  | 'FALSE'
  | 'Answer'
  | 'Choice'
  | 'Match'
  | 'Item'

export type BrightspaceCsvRow = [BrightspaceCsvRowKeyword, ...string[]]

export type BrightspaceQuestionTypeMap = Record<
  QuestionType,
  BrightspaceQuestionTypeCode
>
