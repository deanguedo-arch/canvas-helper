# Aboriginal Studies 30 Google Stitch Redesign Brief

## Goal

Create a polished student-facing redesign for an online Aboriginal Studies 30 course website. The current course already works as a dark Sports Wellness-style shell with a fixed sidebar, progress panel, Google sign-in area, Units, Quizzes, Assignments, Library, and Film Room. Redesign the visual presentation and layout quality while preserving the course structure, learning flow, and existing interaction model.

The redesigned course should feel mature, readable, respectful, and suitable for high school students completing a serious humanities/social studies course online.

## Product Context

- Course name: Aboriginal Studies 30
- Audience: high school students
- Course type: online course shell built from existing course materials plus PDF chapter resources
- Main workflow: students move through themes, open readings/videos, complete online questions, view chapter PDFs, and access assignments
- Existing shell inspiration: Sports Wellness course shell with strong sidebar navigation, dark interface, compact progress panel, and a TV-style Film Room

## Core Screens To Design

Design these screens as one cohesive course website:

1. Units home
2. Individual Theme page
3. Theme 1 Questions online booklet
4. Assignments
5. Library
6. PDF chapter viewer
7. Film Room
8. Quiz placeholder/list view
9. Mobile layout

## Navigation

Keep this sidebar navigation exactly:

- Units
- Quizzes
- Assignments
- Library
- Film Room

Do not include:

- Phases
- Performance
- Sports Wellness
- Course Information
- Source-system labels
- Teacher/admin comments
- Answer key references

The sidebar should stay persistent on desktop. It should contain:

- Course title: Aboriginal Studies 30
- Small course badge or mark using initials such as AS 30
- Course progress area
- Google sign-in/sync control area near the lower portion
- Clear active navigation state

## Course Structure

Use four main units/themes:

- Theme 1 - Aboriginal Rights and Self-Government
- Theme 2 - Aboriginal Land Claims
- Theme 3 - Aboriginal Peoples in Canadian Society
- Theme 4 - Aboriginal World Issues

Design the units as clear selectable rows or cards. The whole course is currently unlocked for editing, but the design must also support locked/blurred future states after student release.

## Theme Page Requirements

Each theme page should include:

- A clear theme title
- A compact Resources section
- A student activity section when present
- Mark Complete controls
- Back to Units control

For Theme 1, the Resources list must show Chapter 1 first.

Resource rows should feel clearly clickable. They should have strong link affordances, hover/focus states, and readable labels.

Theme 1 Resources should include:

- Chapter 1, action: Open Chapter
- Walking Together: The Oral Tradition, action: Open
- Road Allowance People, action: Watch
- Metis Self-Governance, action: Watch

## Theme 1 Questions Online Booklet

Create a refined design for an online booklet called:

Theme 1 Questions

This page replaces the PDF-style booklet with web-native questions. It should feel like a structured digital worksheet, not a raw imported document.

It must support:

- Section labels
- Source references such as textbook page ranges or reading/video references
- Numbered questions
- Fill-in-the-blank inputs
- Multiple-choice choices
- Long-answer response boxes
- Fillable chart/table questions
- Prompt-specific resource cards for videos/readings
- Copy Responses action
- Autosave status text

Important interaction behavior:

- Long-answer boxes and table-answer boxes should not be manually resizable by students.
- They should grow vertically as students type.
- Very long responses should cap at a stable height and scroll internally.
- Responses save automatically.

Do not include inline booklet images in this activity design. They did not format well for this online assignment.

## Assignments Screen

Design assignment cards from the course assignment source folders.

Each assignment card should include:

- Assignment title
- Theme/unit association
- Short student-facing summary
- Status or completion affordance
- Buttons:
  - View Assignment
  - Download DOCX
  - Open Source, only when useful

Avoid any wording that sounds like a backend conversion note. This is for students.

## Library Screen

The Library must work like the Sports Wellness Library, but with chapters instead of slides.

Each resource card should include:

- Resource title
- Type label such as Chapter, Textbook, or Glossary
- A primary button: View Chapter
- A secondary button: Download PDF

Required Library items:

- Chapter 1
- Chapter 2
- Chapter 3
- Chapter 4
- Chapter 5
- Chapter 6
- Chapter 7
- Textbook
- Glossary

Use an in-page PDF viewer pattern. When a student chooses View Chapter, they should stay inside the course shell and see the PDF in a large readable viewer area.

## Film Room

The Film Room should preserve the Sports Wellness-style TV concept.

Design:

- Main TV/player area
- Video catalog panel
- Now loaded panel
- Playlist dropdown
- Open Source link when embeds are unavailable
- Module/theme label instead of tape label

Use wording such as:

- Film Room
- Video catalog
- Load a video
- Playlist
- Now loaded
- Theme 1, Theme 2, Theme 3, Theme 4

Do not use:

- Tape catalog
- Tape 01
- Tapes loaded

Some videos may be YouTube embeds, CBC links, archive.org links, or local HTML/video resources. The design must include a graceful unavailable/external-source state.

## Visual Direction

Keep the course close to the current Sports Wellness shell quality:

- Dark interface
- Fixed left sidebar
- High-contrast white text
- Cyan/green accent for active actions
- Compact, structured panels
- Strong typography for navigation and section headings
- Clear borders and spacing
- Professional, course-shell feel

The redesign should improve:

- Reading comfort
- Question spacing
- Form field polish
- Resource link visibility
- Assignment card hierarchy
- Mobile usability
- Long content scanning

Avoid:

- Generic landing page hero sections
- Marketing copy
- Oversized decorative cards
- Excessive gradients
- Glassmorphism
- Decorative blobs or orbs
- Cliche pan-Indigenous decoration
- Faux tribal patterns
- Dreamcatcher/feather token imagery
- Random earth-tone/brown-only palette
- Visuals that stereotype Indigenous cultures

Use a respectful, restrained visual language. If imagery is used, keep it abstract, documentary, or resource-focused rather than decorative.

## Layout Requirements

Desktop:

- Sidebar around the left edge
- Main content area scrolls independently
- Progress module near the top of main content
- Content width should be readable and not too wide
- Long forms must stay organized and easy to scan

Mobile:

- Sidebar becomes a drawer or compact top navigation
- Buttons are touch-safe
- Question fields stack cleanly
- Tables become horizontally scrollable or transform into stacked rows
- Film Room TV area remains visible and usable
- PDF viewer remains reachable with download fallback

## Accessibility Requirements

- Strong contrast between text and background
- Visible focus states
- Real button/link affordances
- Labels for inputs
- Large enough touch targets
- No text overlap at small widths
- No tiny low-contrast metadata
- Keyboard-accessible navigation and form controls

## Content Tone

Use direct student-facing wording.

Good:

- Open Chapter
- Watch
- View Assignment
- Download DOCX
- Responses save automatically
- Mark Complete

Avoid:

- Source file
- Converted/imported source-system wording
- Opens in a new window
- Retained content from original module
- Hidden/source label
- Admin notes

## Deliverable Expectations

Produce a complete responsive course website mockup or prototype for Aboriginal Studies 30. It should include realistic examples for:

- Units home with four themes
- Theme 1 page with Resources and Theme 1 Questions
- Several sample question types
- Assignment cards
- Library cards and PDF viewer
- Film Room with TV-style player and module-labeled playlist
- Empty/placeholder Quiz screen that still looks intentional
- Mobile state

The result should look like a real course shell that can be implemented directly, not a marketing website.

## Acceptance Criteria

- The course clearly reads as Aboriginal Studies 30.
- The sidebar and main navigation match the required sections.
- No Phases or Performance section appears.
- Theme 1 Questions looks like a clean online worksheet, not a PDF dump.
- Resource links look visibly clickable.
- Library buttons say View Chapter and Download PDF.
- Film Room keeps the TV-style player but uses video/module language.
- Assignments have View Assignment and Download DOCX actions.
- The design avoids admin-facing conversion language.
- The visual style is respectful, readable, and production-quality.
