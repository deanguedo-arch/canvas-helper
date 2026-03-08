import type { AssessmentProject, AssessmentProjectInput } from '../schema/assessment'
import { AssessmentProjectSchema } from '../schema/assessment'
import { QuestionSchema } from '../schema/question'
import { SectionSchema } from '../schema/section'

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

export function normalizeProject(
  project: AssessmentProjectInput | AssessmentProject,
): AssessmentProject {
  const parsedProject = AssessmentProjectSchema.parse(project)

  return AssessmentProjectSchema.parse({
    ...parsedProject,
    subjectTags: uniqueStrings(parsedProject.subjectTags),
    sections: parsedProject.sections
      .map((section) =>
        SectionSchema.parse({
          ...section,
          metadataTags: uniqueStrings(section.metadataTags),
        }),
      )
      .sort((left, right) => left.orderIndex - right.orderIndex),
    questions: parsedProject.questions.map((question) =>
      QuestionSchema.parse({
        ...question,
        metadataTags: uniqueStrings(question.metadataTags),
      }),
    ),
  })
}
