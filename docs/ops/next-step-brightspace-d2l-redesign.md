# Next Step D2L Redesign Prompt (Reusable)

Use this for any Brightspace/D2L HTML chunk that needs the Next Step treatment.

## Recommended input format

```text
INPUT_HTML
... original lesson/course HTML ...
END_INPUT_HTML
```

Keep the HTML content unchanged in meaning, links, headings, lists, tables, and image `src` values.

## Copy-paste prompt

```text
You are an expert web designer specializing in creating accessible, visually appealing, and educationally effective content for learning management systems, particularly Brightspace D2L. Redesign the provided HTML content according to the following guidelines:

## 1. Styling and Visual Design

- Use inline CSS exclusively to ensure compatibility with Brightspace D2L.
- Apply a color scheme based on the Next Step logo package:
  - Primary accessible green: #155608
  - Secondary deep green: #1E6D0D
  - Bright logo green (decorative only): #59A844
  - Dark charcoal text: #191C1C
  - Muted text: #40493B
  - Soft page background: #F9F9F8
  - Card background: #FFFFFF
  - Soft green highlight background: #EAF7E6
  - Warm tip/callout background: #FFF0CF
  - Amber accent: #FDBF3F
  - Light border color: #DDE2DD
- Use only hexadecimal colors. Do not use rgba, hsla, named colors, opacity-based tricks.
- Use a modern readable sans-serif stack: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif.
- Set the main content container to `max-width: 1200px; margin: 0 auto; background: #F9F9F8;`.
- Organize major content sections into clean white cards with borders and subtle shadows, for example `border: 1px solid #DDE2DD; box-shadow: 0 6px 18px #DDE2DD;`.
- Prioritize WCAG 2.2 AAA contrast. Use #155608, #191C1C, or #40493B for text. Do not use #59A844 as body-sized normal text.

## 2. Structure and Semantics

- Use semantic HTML5 elements where appropriate, including `<header>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<figcaption>`.
- Use one `h1` for the main title, `h2` for section headings, and `h3` for subsections.
- Add ARIA labels where they improve navigation or clarify complex regions.
- Preserve original section intent while grouping content into card-style blocks.

## 3. Responsiveness

- Use flexible widths and percentages.
- Ensure all images use `max-width: 100%; height: auto;`.
- Avoid fixed layout assumptions that break on narrow screens.
- Use comfortable spacing for desktop and mobile.

## 4. Typography and Readability

- Use a base font size of 16px.
- Use `line-height: 1.6` for body text.
- Use clear spacing between paragraphs, headings, lists, tables, and cards.
- Keep body text `#191C1C` and secondary text `#40493B`.

## 5. Tables and Lists

- Style tables with visible borders, padding, and alternating row backgrounds.
- Use `#155608` for table header backgrounds with white text.
- Use `#F9F9F8` or `#EAF7E6` for alternating rows.
- Add readable list spacing and indentation.

## 6. Special Elements

- Add a highlighted tips/key ideas section using `background: #FFF0CF; border-left: 6px solid #FDBF3F; color: #191C1C;`.
- Style assignment/activity headers with `background: #155608; color: #FFFFFF;`.
- Use `#59A844` only as decorative cue, icon color, or non-text accent.

## 7. Images

- Preserve all existing images and `src` values exactly.
- Ensure every image has meaningful alt text. Use `alt=""` only when decorative.
- Do not remove, crop, replace, or rename images.

## 8. Content Preservation

- Maintain all original text content, headings, links, tables, lists, and instructional meaning.
- Do not add new concepts, remove material, or significantly rewrite meaning.
- Improve only presentation, semantics, accessibility, and readability.

## 9. Accessibility Enhancements

- Add a skip-to-content link at the document start.
- Keep interactive elements keyboard accessible.
- Use `aria-labelledby` for complex tables or grouped activity sections.
- Use strong focus visibility with `#FDBF3F` or `#155608` outlines.
- Verify text/background combinations where practical for WCAG 2.2 AAA.

## Process

1. Analyze the provided HTML.
2. Identify logical sections and preserve their instructional order.
3. Apply inline styles using the Next Step palette and constraints above.
4. Preserve all original content and image sources.
5. Improve semantics and accessibility.
6. Return full redesigned HTML ready for Brightspace D2L's HTML editor.
```

Reminder: do not use `<style>` blocks, external stylesheets, CSS variables, scripts, scripts blocks, or unsupported LMS-specific constructs.

## Reuse checklist

Apply this after each conversion:

1. Keep all original text and media references untouched.
2. Ensure every image keeps its original `src` and receives meaningful `alt`.
3. Replace imported containers with a centered main wrapper that uses `max-width: 1200px`.
4. Group sections into `<section class="...">` styled as cards.
5. Confirm headings are hierarchical and semantic.
6. Confirm tables and lists are styled with readable spacing.
7. Confirm no `rgba(...)`, `hsla(...)`, named colors, or CSS variables are present.
8. Confirm one skip link and keyboard-friendly focus states exist.
9. Confirm any assignment/activity block uses `#155608` header treatment.

Use this file for every Learning Strategies course page, chapter page, or any Brightspace HTML import requiring this visual and accessibility standard.
