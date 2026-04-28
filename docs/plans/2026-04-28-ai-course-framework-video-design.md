# AI Course Framework Video Design

## Goal

Add the local `AI_Assessment_Framework (1).mp4` file to the Assessment Pillars resource as an introductory video between the current hero and the "Why Assessment Has to Change" section.

## Placement

Keep the existing hero as the first slide because it states the course thesis directly: "Product. Process. Defence." Add a new `section-slide` immediately after it so the video frames the rest of the resource without replacing the thesis.

## Content And Assets

Copy the MP4 into `projects/ai-course-building-resources/workspace/resources/media/ai-assessment-framework.mp4`. Reference it with a relative `./media/ai-assessment-framework.mp4` path from `dean-ai-assessment-pillars.html` so exports can inline or package it through the existing asset flow.

## Interaction

Use a normal browser video player with `controls` and `preload="metadata"`. Do not autoplay. The section should participate in presentation mode because it uses the existing `section-slide` class.

## Verification

Add a focused regression test that confirms the asset exists, the video section appears after the hero and before `#context`, and the video uses the local workspace path.
