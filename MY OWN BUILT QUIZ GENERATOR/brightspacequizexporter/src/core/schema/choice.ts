import { z } from 'zod'
import { MatchRoleSchema } from './enums'

export const ChoiceSchema = z.object({
  choiceId: z.string().min(1),
  label: z.string(),
  text: z.string(),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().nonnegative().default(0),
  matchKey: z.string().nullable().default(null),
  fixedPosition: z.boolean().nullable().default(null),
  matchRole: MatchRoleSchema.nullable().default(null),
})

export const MatchingChoiceSchema = ChoiceSchema.extend({
  matchKey: z.string().min(1),
  matchRole: MatchRoleSchema,
})

export type Choice = z.infer<typeof ChoiceSchema>
export type MatchingChoice = z.infer<typeof MatchingChoiceSchema>
