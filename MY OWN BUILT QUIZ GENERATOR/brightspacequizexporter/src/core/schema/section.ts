import { z } from 'zod'

export const SectionSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string(),
  description: z.string().default(''),
  instructions: z.string().default(''),
  orderIndex: z.number().int().nonnegative().default(0),
  metadataTags: z.array(z.string().min(1)).default([]),
})

export type Section = z.infer<typeof SectionSchema>
