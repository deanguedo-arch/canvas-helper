import type { AssessmentProject } from '../schema/assessment'
import { AssessmentProjectSchema } from '../schema/assessment'

export function cloneProject(project: AssessmentProject): AssessmentProject {
  return AssessmentProjectSchema.parse(structuredClone(project))
}
