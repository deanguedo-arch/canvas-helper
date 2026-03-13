import assert from "node:assert/strict";
import test from "node:test";

import { applyCourseImageManifest, validateCourseImageManifest } from "../lib/conversion/course-images.js";
import { renderStudySections } from "../lib/conversion/renderCourse.js";
import type { CourseModel } from "../lib/conversion/types.js";

function createCourseFixture(): CourseModel {
  return {
    courseId: "hss1010",
    slug: "hss1010",
    title: "HSS 1010",
    generatedAt: "2026-03-13T00:00:00.000Z",
    sourceTitle: "Fixture",
    sourcePdfUrl: null,
    sections: [
      {
        id: "wellness",
        tabLabel: "01 Wellness",
        title: "Section 1",
        blocks: [
          {
            id: "wellness-intro",
            type: "paragraph",
            text: "Intro",
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture",
              sourcePageStart: null,
              sourcePageEnd: null,
              sourceBlockId: "intro",
              conversionStatus: "converted",
              notes: []
            }
          }
        ]
      }
    ]
  };
}

test("applyCourseImageManifest inserts approved images and skips drafts", () => {
  const base = createCourseFixture();

  const result = applyCourseImageManifest({
    course: base,
    manifest: {
      schemaVersion: 1,
      projectSlug: "hss1010",
      images: [
        {
          id: "wellness-diagram",
          sectionId: "wellness",
          src: "./assets/images/wellness-diagram.webp",
          alt: "Wellness wheel",
          title: "Wellness Wheel",
          caption: "Use this to review dimensions.",
          status: "approved"
        },
        {
          id: "wellness-draft",
          sectionId: "wellness",
          src: "./assets/images/draft.webp",
          alt: "Draft image",
          status: "draft"
        }
      ]
    },
    existingImagePaths: new Set(["./assets/images/wellness-diagram.webp"])
  });

  const section = result.course.sections[0];
  assert.ok(section);
  assert.equal(result.inserted, 1);
  assert.equal(result.updated, 0);
  assert.equal(result.skipped, 1);
  assert.equal(section?.blocks.filter((block) => block.type === "figure").length, 1);
});

test("applyCourseImageManifest updates existing managed figure block without duplication", () => {
  const base = createCourseFixture();
  base.sections[0]?.blocks.push({
    id: "image-wellness-diagram",
    type: "figure",
    figureLabel: "Old label",
    figureDescription: "Old description",
    figureStatus: "available",
    figureSourceUrl: "./assets/images/old.webp",
    source: {
      sourceType: "legacy-html",
      sourceTitle: "Fixture",
      sourcePageStart: null,
      sourcePageEnd: null,
      sourceBlockId: "image-wellness-diagram",
      conversionStatus: "converted",
      notes: ["image-manifest:wellness-diagram"]
    }
  });

  const result = applyCourseImageManifest({
    course: base,
    manifest: {
      schemaVersion: 1,
      projectSlug: "hss1010",
      images: [
        {
          id: "wellness-diagram",
          sectionId: "wellness",
          src: "./assets/images/wellness-diagram.webp",
          alt: "Wellness wheel",
          title: "New label",
          caption: "New caption",
          status: "approved"
        }
      ]
    },
    existingImagePaths: new Set(["./assets/images/wellness-diagram.webp"])
  });

  const section = result.course.sections[0];
  const figures = section?.blocks.filter((block) => block.type === "figure") ?? [];
  assert.equal(result.inserted, 0);
  assert.equal(result.updated, 1);
  assert.equal(figures.length, 1);
  assert.equal(figures[0]?.figureLabel, "New label");
  assert.equal(figures[0]?.figureSourceUrl, "./assets/images/wellness-diagram.webp");
});

test("validateCourseImageManifest reports missing files and unknown section ids", () => {
  const course = createCourseFixture();

  const issues = validateCourseImageManifest({
    course,
    manifest: {
      schemaVersion: 1,
      projectSlug: "hss1010",
      images: [
        {
          id: "missing-image",
          sectionId: "wellness",
          src: "./assets/images/missing.webp",
          alt: "Missing",
          status: "approved"
        },
        {
          id: "bad-section",
          sectionId: "anatomy",
          src: "./assets/images/ok.webp",
          alt: "OK",
          status: "approved"
        }
      ]
    },
    existingImagePaths: new Set(["./assets/images/ok.webp"])
  });

  assert.equal(issues.length, 2);
  assert.match(issues[0] ?? "", /missing-image/i);
  assert.match(issues[1] ?? "", /bad-section/i);
});

test("renderStudySections renders figure blocks as inline images", () => {
  const course = createCourseFixture();
  course.sections[0]?.blocks.push({
    id: "image-wellness",
    type: "figure",
    figureLabel: "Wellness Wheel",
    figureDescription: "Caption copy",
    figureStatus: "available",
    figureSourceUrl: "./assets/images/wellness-wheel.webp",
    source: {
      sourceType: "legacy-html",
      sourceTitle: "Fixture",
      sourcePageStart: null,
      sourcePageEnd: null,
      sourceBlockId: "image-wellness",
      conversionStatus: "converted",
      notes: ["image-manifest:wellness-wheel"]
    }
  });

  const html = renderStudySections(course);
  assert.match(html, /<img[^>]+src="\.\/assets\/images\/wellness-wheel\.webp"/);
  assert.match(html, /alt="Wellness Wheel"/);
  assert.match(html, /Caption copy/);
});
