import { expect, type Page } from "@playwright/test";

import { waitForWorkspacePreviewReady } from "./project-open";

export type StudioFixtureDescriptor = {
  slug: string;
  title: string;
  heading: string;
  workspacePage: string;
};

export const STUDIO_FIXTURES = Object.freeze({
  primary: Object.freeze({
    slug: "e2e-fixture",
    title: "E2E Fixture",
    heading: "E2E Fixture Workspace",
    workspacePage: "index.html"
  }),
  secondary: Object.freeze({
    slug: "e2e-studio-secondary",
    title: "Studio Fixture Secondary",
    heading: "Secondary Studio Fixture",
    workspacePage: "index.html"
  })
} satisfies Record<string, StudioFixtureDescriptor>);

export const STUDIO_PRIMARY_FIXTURE = STUDIO_FIXTURES.primary.slug;
export const STUDIO_SECONDARY_FIXTURE = STUDIO_FIXTURES.secondary.slug;

export async function switchStudioFixture(page: Page, fixture: StudioFixtureDescriptor | string) {
  const slug = typeof fixture === "string" ? fixture : fixture.slug;
  const projectSelect = page.getByTestId("workspace-project-select");
  await expect(projectSelect).toBeVisible();
  await projectSelect.selectOption(slug);
  await expect(projectSelect).toHaveValue(slug);
  await waitForWorkspacePreviewReady(page, slug);
}
