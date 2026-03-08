import type { QuestionType } from '../../core/schema/enums'
import type {
  BrightspaceCsvRowKeyword,
  BrightspaceQuestionTypeMap,
} from './csvTypes'

export const BRIGHTSPACE_CSV_FORMAT = 'brightspace_csv'
export const BRIGHTSPACE_CSV_FILE_SUFFIX = '-brightspace.csv'

export const BRIGHTSPACE_CSV_ROW_KEYWORDS: Record<
  BrightspaceCsvRowKeyword,
  BrightspaceCsvRowKeyword
> = {
  NewQuestion: 'NewQuestion',
  Title: 'Title',
  Points: 'Points',
  QuestionText: 'QuestionText',
  Scoring: 'Scoring',
  Option: 'Option',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  Answer: 'Answer',
  Choice: 'Choice',
  Match: 'Match',
  Item: 'Item',
}

export const QUESTION_TYPE_TO_BRIGHTSPACE_CODE: BrightspaceQuestionTypeMap = {
  written_response: 'WR',
  short_answer: 'SA',
  matching: 'M',
  multiple_choice: 'MC',
  true_false: 'TF',
  multi_select: 'MS',
  ordering: 'O',
}

export const BRIGHTSPACE_DEFAULT_SCORING: Partial<Record<QuestionType, string>> = {
  multi_select: 'All or nothing',
  matching: 'All or nothing',
  ordering: 'All or nothing',
}
