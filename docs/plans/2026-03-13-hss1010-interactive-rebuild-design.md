# HSS1010 Interactive Rebuild Design

## Goal

Rebuild `hss1010` from a styled source conversion into a true Canvas Helper course module:

- the content stays substantially complete
- the source material is reorganized into teachable lesson sequences
- each lesson sequence includes aligned activity and reflection layers
- the page feels like a self-contained teacher, not a prettier PDF transcript

## Problem Statement

The current HSS1010 output now covers the source pages, but it still behaves like a conversion artifact:

- legacy authored content is preserved, but new source material is still too page-shaped
- many additions read as continuation excerpts rather than lesson chunks
- interaction is still concentrated in the assignment tab instead of sitting beside the learning
- the study side is not yet using the full “Canvas Helper studio” pattern visible in stronger projects

That is not the product standard the repo has already demonstrated elsewhere.

## Target Product Standard

The benchmark is not “looks nicer than a PDF.”

The benchmark is what the stronger course builds already do:

- [genpsy-studio/workspace/index.html](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/genpsy-studio/workspace/index.html)
- [genpsy-studio/workspace/main.js](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/genpsy-studio/workspace/main.js)
- [genpsy-studio/workspace/styles.css](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/genpsy-studio/workspace/styles.css)
- [calm-module-2-activites-reference/workspace/main.jsx](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/calm-module-2-activites-reference/workspace/main.jsx)
- [calm3new/workspace/main.js](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/calm3new/workspace/main.js)

Those projects establish the right product behavior:

1. The module teaches in chunks, not pages.
2. Every important chunk gets an activity, sorter, prompt, or decision task.
3. Reflection/application is embedded directly after the lesson that prepares it.
4. The UI carries a strong learning rhythm:
   - hero
   - teacher note / study flow
   - lesson cards / concept blocks
   - practice panel
   - checker / result
   - reflection or write-in
   - assignment bridge

## Source Inventory

For HSS1010, the current resource base is:

- [Health Services Foundations.pdf](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/resources/hss1010/Health Services Foundations.pdf)
- extracted chunks under [projects/resources/hss1010/_extracted](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/resources/hss1010/_extracted)
- current generated models under [projects/hss1010/meta](C:/Users/dean.guedo/Documents/GitHub/canvas-helper/projects/hss1010/meta)

This means we have enough source material to build a better teaching model without waiting for new inputs.

## Chosen Direction

Keep the top-level HSS section navigation, but transform each section into a **module-teacher sequence**.

The section tabs remain useful because HSS1010 is large. Inside each tab, however, the content stops being “page supplement blocks” and becomes:

1. Section hero
2. Study-flow note
3. Lesson sequence A
4. Activity A
5. Lesson sequence B
6. Activity B
7. Reflection / application
8. Assignment bridge

So:

- navigation stays section-based
- learning flow becomes lesson-based

## Core Architectural Decision

### Current architecture

Current `course.json` is mostly a list of display blocks:

- raw lesson HTML
- some preserved rich markup
- source supplement blocks

That is enough for rendering, but not enough for an interactive teacher model.

### Target architecture

HSS1010 needs an intermediate structure between raw source and rendered HTML:

- `Section`
  - `lessonSequences[]`
- `LessonSequence`
  - `id`
  - `title`
  - `teachingBlocks[]`
  - `activityBlocks[]`
  - `reflectionBlock?`
  - `assignmentBridge?`
  - `sourceRefs[]`

This can be implemented either by:

1. adding a richer block taxonomy to the current course model, or
2. introducing an HSS-specific composition layer that groups current blocks into lesson sequences before render

Recommended: option 2 first, because it is lower-risk and faster to prove.

## HSS Learning Block System

The rebuild should use a reusable HSS-specific vocabulary, drawing on `genpsy-studio` and the CALM activity references.

### Teaching blocks

- `module-hero`
- `workbook-note`
- `lesson-panel`
- `concept-grid`
- `comparison-table`
- `warning-panel`
- `protocol-panel`
- `accordion-review`
- `figure-panel`
- `source-note`

### Activity blocks

- `practice-panel`
- `card-sort`
- `matching-grid`
- `scenario-decision`
- `checklist-audit`
- `timeline-sequencer`
- `quick-check`
- `reflection-writein`
- `application-bridge`

### Feedback blocks

- `activity-result success`
- `activity-result warning`
- `activity-result error`

The visual language should borrow proven patterns:

- `module-container`
- `clay-card`
- `practice-panel`
- `activity-number`
- `workbook-note`
- accordion sections
- saveable text areas and inputs

## Section-by-Section Design

### 0. Start / Source Launch

Purpose:

- orient the learner
- explain how the module works
- make the PDF/supporting source available without making it the default reading experience

Structure:

1. Hero: “HSS 1010: Health Services Foundations”
2. Study-flow note:
   - what each section includes
   - how to move through teacher content and activities
   - how saving/reporting works
3. “What you will learn” overview tiles:
   - Wellness
   - Anatomy
   - Lifestyle
   - Public Health
4. Source center:
   - PDF access
   - note that visuals and citation checking can be referenced there
5. Readiness prompt:
   - what to pay attention to in the first section

This tab should stop being a passive PDF parking lot.

### 1. Wellness

Theme:

- define health
- define wellness
- teach the wellness dimensions
- teach determinants of health
- connect those ideas to student life

Lesson sequence design:

1. What health and wellness mean
   - short teacher explanation
   - key definition comparison
   - “obvious but wrong” misconceptions callout

2. Dimensions of wellness
   - concept grid with dimension cards
   - each dimension includes examples and self-check prompts
   - associated activity: dimension sorter or scenario match

3. Determinants of health
   - ranked determinant lesson
   - cluster determinants by external systems vs personal factors
   - associated activity: drag/match or rank-and-justify

4. Population health / public policy bridge
   - short synthesis block
   - reflection: “Which determinants matter most in your own life and why?”

Activities:

- dimension-to-example matching
- determinant category sorter
- “Which determinant is operating here?” mini-scenarios
- short self-audit reflection

### 2. Anatomy

Theme:

- teach the foundation language
- organize systems clearly
- move from terms to function to application

Lesson sequence design:

1. Anatomy, physiology, pathology, homeostasis
   - concept comparison cards
   - homeostasis explained with everyday examples
   - associated quick-check

2. Levels of organization
   - cells -> tissues -> organs -> systems -> organism
   - ladder-style visual block
   - associated sequence ordering activity

3. Human body systems
   - chunk into smaller system families rather than one giant wall
   - use anatomy cards
   - associated system-function matchers

4. Disease and prevention basics
   - disease categories
   - lifestyle links
   - associated “what system is affected / what prevention fits” checks

5. Vocabulary lab
   - medical terms and meaning construction
   - prefix/suffix preview for later public health section

Activities:

- system-to-function match
- homeostasis scenario choice
- sequence the organization levels
- identify the best definition or example
- diagram placeholders with label exercises when visuals exist

### 3. Lifestyle

Theme:

- turn the course into daily decision-making
- teach nutrition, activity, sleep, checkups, consumer skepticism, and prevention

Lesson sequence design:

1. Nutrition and food guidance
   - what the source says
   - what students actually need to take away
   - associated meal-analysis or recommendation task

2. Physical activity
   - recommendations
   - barriers and myths
   - associated habit planning or myth/fact sorter

3. Sleep, dental care, medical care
   - why maintenance matters
   - associated “best next choice” scenarios

4. Informed consumer and supplements
   - advertising claims
   - energy drinks
   - meal replacements
   - product skepticism
   - associated ad-claim audit

5. Preventing disease
   - hygiene and self-care
   - associated preventive action quick checks

Activities:

- myth vs fact cards
- claim audit panel
- healthy choice scenario cards
- weekly plan reflection
- “what would you advise this student to change?” write-in

### 4. Public Health

Theme:

- move from personal health to system responsibility and care ethics

Lesson sequence design:

1. Public health system and agency roles
   - who does what
   - federal/provincial/provider/consumer distinctions
   - associated role sorter

2. Confidentiality and information sharing
   - what is protected
   - when sharing is justified
   - associated decision scenarios

3. Abuse recognition and reporting
   - signs and indicators
   - what to do
   - what not to do
   - associated reporting sequence and judgment cases

4. Medical terminology
   - prefixes and suffixes
   - building meanings from parts
   - associated term builder / quick-check

5. Integrative health and complementary care
   - appropriate caution and informed decision-making
   - associated compare-and-evaluate activity

Activities:

- role/responsibility matching
- confidentiality “share or not share” scenarios
- reporting protocol sequence activity
- terminology builder
- complementary-care claim evaluation

## Resource Use Strategy

The rebuild should use all the resource material, but not dump it.

Resource handling rules:

1. The source PDF remains the authority.
2. Existing authored HSS HTML remains a strong seed for layout and initial explanations.
3. New source material must be reorganized into topic packets.
4. Each topic packet must answer:
   - what does the student need to know?
   - what is the most natural activity for this content?
   - what evidence from the source supports it?

So the workflow becomes:

source chunks -> topic packet -> teaching block -> aligned activity

not:

source chunks -> supplement HTML

## Interaction Design Rules

### Rule 1: Every major concept earns a learner action

If a student just read an important concept, they should immediately:

- sort
- match
- choose
- sequence
- reflect
- apply

### Rule 2: Activity difficulty must match content type

- factual distinctions -> sorter/matcher
- procedural content -> sequence/checklist
- judgment content -> scenario decisions
- personal transfer -> write-in reflection
- terminology -> structured retrieval practice

### Rule 3: The assignment tab is not the only active part

The study side must do real teaching and real readiness-building, not just preparation by passive reading.

## Data and Rendering Implications

The current pipeline needs a new HSS composition phase:

1. ingest source chunks
2. map them into topic packets by section
3. combine legacy authored material with packet content
4. render packet-driven teaching blocks
5. render aligned activity blocks

Recommended new internal modules:

- `scripts/lib/conversion/hss1010-outline.ts`
- `scripts/lib/conversion/hss1010-compose.ts`
- `scripts/lib/conversion/hss1010-activities.ts`
- `scripts/lib/conversion/hss1010-render.ts`

The current `hss1010.ts` orchestrator can call these.

## Quality Bar

This rebuild is only acceptable if:

- the study tabs feel like a teacher-led interactive module
- the source material is still substantially present
- the learner can learn and practice inside the study side
- activities align directly with the lesson chunks above them
- the assignment tab feels like the final hand-in layer, not the first real interaction

## Non-Goals

- perfectly reconstructing every original diagram on pass one
- turning the entire course into a single huge SPA rewrite
- replacing proven save/report/export behavior during the rebuild

## Recommended Execution Strategy

Do not rebuild all sections blindly at once.

Recommended sequence:

1. define the new HSS lesson/activity block system
2. rebuild `wellness` as the reference implementation
3. rebuild `anatomy`
4. rebuild `lifestyle`
5. rebuild `public`
6. rebuild `start` as the launch/orientation layer

This gives one clear gold-standard section before scaling the pattern across the course.
