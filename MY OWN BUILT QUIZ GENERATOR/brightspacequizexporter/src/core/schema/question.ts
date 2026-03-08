import { z } from 'zod'
import { ChoiceSchema, MatchingChoiceSchema } from './choice'
import { AnswerStatusSchema, ReviewStatusSchema } from './enums'

const QuestionCommonSchema = z.object({
  questionId: z.string().min(1),
  sectionId: z.string().min(1).nullable().default(null),
  prompt: z.string(),
  stemRichText: z.string().nullable().default(null),
  points: z.number().nonnegative().default(1),
  feedbackCorrect: z.string().default(''),
  feedbackIncorrect: z.string().default(''),
  explanation: z.string().default(''),
  sourceReference: z.string().default(''),
  sourcePage: z.number().int().nonnegative().nullable().default(null),
  originText: z.string().default(''),
  confidenceScore: z.number().min(0).max(1).nullable().default(null),
  answerStatus: AnswerStatusSchema.default('missing'),
  reviewStatus: ReviewStatusSchema.default('draft'),
  exportNotes: z.string().default(''),
  metadataTags: z.array(z.string().min(1)).default([]),
})

export const MatchingCorrectAnswerSchema = z.object({
  promptChoiceId: z.string().min(1),
  matchChoiceId: z.string().min(1),
})

const MultipleChoiceQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('multiple_choice'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([]),
})

const TrueFalseQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('true_false'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([]),
})

const MultiSelectQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('multi_select'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([]),
})

const ShortAnswerQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('short_answer'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string()).default([]),
})

const WrittenResponseQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('written_response'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string()).default([]),
})

const MatchingQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('matching'),
  choices: z.array(MatchingChoiceSchema).default([]),
  correctAnswers: z.array(MatchingCorrectAnswerSchema).default([]),
})

const OrderingQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal('ordering'),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([]),
})

export const QuestionSchema = z.discriminatedUnion('type', [
  MultipleChoiceQuestionSchema,
  TrueFalseQuestionSchema,
  MultiSelectQuestionSchema,
  ShortAnswerQuestionSchema,
  WrittenResponseQuestionSchema,
  MatchingQuestionSchema,
  OrderingQuestionSchema,
])

export type MatchingCorrectAnswer = z.infer<typeof MatchingCorrectAnswerSchema>
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>
export type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>
export type MultiSelectQuestion = z.infer<typeof MultiSelectQuestionSchema>
export type ShortAnswerQuestion = z.infer<typeof ShortAnswerQuestionSchema>
export type WrittenResponseQuestion = z.infer<typeof WrittenResponseQuestionSchema>
export type MatchingQuestion = z.infer<typeof MatchingQuestionSchema>
export type OrderingQuestion = z.infer<typeof OrderingQuestionSchema>
export type Question = z.infer<typeof QuestionSchema>
export type QuestionInput = z.input<typeof QuestionSchema>
