/** Catalog organization is independent of readiness and canonical ownership. */
export type ProjectOrganization = { archived: boolean; canArchive: boolean; role?: "fixture" };
export type ProjectOrganizationRegistry = {
  schemaVersion: 1;
  projects: Record<string, { archived: boolean; role?: "fixture" }>;
};
