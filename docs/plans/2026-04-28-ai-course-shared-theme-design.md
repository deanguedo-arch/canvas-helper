# AI Course Shared Theme Design

## Goal

Make both AI course resource pages feel like one digital presentation by using the Assessment Pillars visual system as the shared base.

## Direction

Use `dean-ai-assessment-pillars.html` as the source of visual truth. Extract the reusable theme tokens, scrollbar behavior, presentation-mode rules, and shared utility classes into `workspace/resources/ai-course-theme.css`. Both resource pages should link this file.

## Page Treatment

`dean-ai-assessment-pillars.html` keeps its current structure and behavior, but moves the shared CSS responsibility into the theme file so the visual base is no longer trapped in one page.

`jon-ai-resource.html` keeps its unabridged content data and interactive module behavior, but changes its shell to the Assessment Pillars style:

- dark `bg-surface` body and `text-on-surface`
- fixed top app bar
- surface-based sidebar
- resource sections styled as `section-slide`
- cards and accordion content using `surface-container` and `surface-variant`
- buttons and active states using `primary`, `secondary`, and `tertiary`

## Constraints

Do not merge the two resources into one page. Do not rewrite Jon’s content. Do not change raw files. Keep Firebase hosted export and single-HTML export compatible.

## Verification

Add source tests to confirm both pages link the shared theme, Jon’s page has the Assessment-style shell classes, and the old `bg-slate-100` / `bg-slate-50` page shell does not return. Then regenerate HTML and Google Hosted exports and redeploy Firebase.
