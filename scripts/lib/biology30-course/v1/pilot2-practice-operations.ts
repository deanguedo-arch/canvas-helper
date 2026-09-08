type AcademicOperations = {
  unit: string;
  components: { id: string; outcomeId: string; requiredPracticeIds: string[] }[];
};
type PracticeOperations = {
  unit: string;
  items: { id: string; role: string; componentIds: string[]; outcomeIds: string[]; componentEvidenceRole: string }[];
};

/** Keep author-reviewed sub-operation links honest. No matching tag proves an entire criterion. */
export function validateBiology30PracticeOperations(academic: AcademicOperations, practice: PracticeOperations) {
  if (academic.unit !== practice.unit) throw new Error("Cross-unit practice operation mapping");
  const components = new Map(academic.components.map(component => [component.id, component]));
  const items = new Map(practice.items.map(item => [item.id, item]));
  if (components.size !== academic.components.length || items.size !== practice.items.length) throw new Error("Duplicate practice operation identity");
  let prerequisiteOnly = 0;
  for (const item of items.values()) {
    if (!["prerequisite-only", "assessed-suboperation"].includes(item.componentEvidenceRole)) throw new Error(`Missing operation evidence role: ${item.id}`);
    if (item.componentEvidenceRole === "prerequisite-only") prerequisiteOnly++;
    if (!item.componentIds.length || new Set(item.componentIds).size !== item.componentIds.length || item.componentIds.some(id => !components.has(id))) throw new Error(`Unknown or duplicate practice component: ${item.id}`);
    const outcomes = new Set(item.componentIds.map(id => components.get(id)!.outcomeId));
    if (new Set(item.outcomeIds).size !== item.outcomeIds.length || item.outcomeIds.length !== outcomes.size || item.outcomeIds.some(id => !outcomes.has(id))) throw new Error(`Practice outcome mapping drift: ${item.id}`);
  }
  const withoutRequiredPractice: string[] = [];
  for (const component of components.values()) {
    const expected = practice.items.filter(item => item.role !== "challenge" && item.componentEvidenceRole === "assessed-suboperation" && item.componentIds.includes(component.id)).map(item => item.id);
    const actual = component.requiredPracticeIds;
    if (!Array.isArray(actual) || new Set(actual).size !== actual.length || actual.length !== expected.length || actual.some(id => !expected.includes(id))) throw new Error(`Required practice operation inventory drift: ${component.id}`);
    if (!expected.length) withoutRequiredPractice.push(component.id);
  }
  return { unit: practice.unit, reviewedItems: items.size, prerequisiteOnly, withoutRequiredPractice,
    proof: "Mapping integrity only. Links identify author-reviewed sub-operations; missing links require other required evidence or repair. Neither nonempty links nor this pass establish complete curriculum coverage." };
}
