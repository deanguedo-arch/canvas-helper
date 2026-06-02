# AI Assessment Portion: Design Brief For Gemini

## Purpose

This brief isolates the AI assessment portion of the existing digital presentation so it can be used as a model for a new presentation about `Architectures of Academic Gatekeeping: Pacing, Process, and Readiness`.

The original AI assessment presentation is not just a slide deck. It is a decision-support surface. It turns a policy idea into a set of interactive models that help staff understand trade-offs, test scenarios, and discuss what the system should require from students and teachers.

## Source Slice

Use only these AI assessment concepts from the existing presentation:

- `Product / Process / Defence`: a three-part evidence model for validating learning.
- `AI Levels`: a selectable scale showing how evidence burden rises as AI assistance increases.
- `Validity Gates`: a scenario simulator where the teacher reviews evidence, conducts a defence, and decides whether the result is validated.

Do not copy the full resource hub, deck library, media section, or navigation shell unless needed for the prototype.

## Design Intent

The experience should feel like an executive briefing tool rather than a traditional website. It should help a group see the logic of a policy architecture quickly, then manipulate the variables together.

The AI assessment version teaches this idea:

> If AI can help produce polished work, then assessment must gather evidence beyond the final product.

The readiness version should teach this parallel idea:

> If high-stakes assessments can fail unprepared students, then readiness architecture must balance automation, cognitive load, relational trust, and teacher capacity.

## Interaction Patterns To Reuse

### 1. Three-Bucket Model

AI assessment version:

- Product: final student work.
- Process: evidence of how the work was created.
- Defence: oral or written proof of ownership.

Readiness adaptation:

- Pacing: how students move through prerequisite learning.
- Process Evidence: notes, outlines, practice attempts, portfolio checks.
- Readiness Defence: conference, oral check, skill demonstration, or teacher sign-off.

The key interaction is a live weighting model. Users adjust weights and marks, and a score bar updates immediately. For readiness, this could become a capacity model instead of a grade model:

- Automation load.
- Cognitive load protection.
- Relational trust / teacher time.

### 2. Evidence Burden Scale

AI assessment version:

- Higher AI level means more required evidence.
- The user selects an AI level and sees the evidence burden change.

Readiness adaptation:

- Higher relational support means more upstream teacher effort.
- The user selects one of three gatekeeping architectures:
  - Strict Funnel.
  - Multi-Macro Scaffold.
  - Process Check-In.
- The visual output changes to show automation, cognitive load management, relational trust, and workload timing.

### 3. Validity Gate Simulator

AI assessment version:

- Review product/process evidence.
- Conduct defence.
- Decide whether the student validated their learning.
- Choose redo or accept mark when not validated.

Readiness adaptation:

- Review student progress and process portfolio.
- Conduct a readiness check-in.
- Decide whether the student is ready for the summative assessment.
- Choose release, scaffold, conference, or delay.

## Visual System

The existing AI assessment presentation uses:

- Dark executive shell with high-contrast content.
- Blueprint-like structure and visible system boundaries.
- Three accent colors for the major decision dimensions.
- Large section headings and compact interaction panels.
- Card-like elements only for repeated decision items, not for every page section.

For the readiness topic, the blueprint language is especially strong. It matches the deck's gatekeeping architecture theme:

- Deep blueprint blue background.
- Thin grid lines and schematic dividers.
- White line-work for gates, funnels, timelines, and decision paths.
- Amber/orange accents for locks, friction, and capacity warnings.
- Controlled use of green/teal for readiness, validation, and successful release.

## Suggested Readiness Prototype Structure

1. Opening frame: `Architectures of Academic Gatekeeping`
2. Problem frame: high-stakes assessments require boundaries to prevent failure.
3. Architecture spectrum: Strict Funnel, Multi-Macro Scaffold, Process Check-In.
4. Model explorer: select an architecture and compare automation, cognitive load, relational trust, and teacher workload.
5. Readiness gate simulator: review a learner case and choose the correct gate decision.
6. Capacity question: what can our current staffing and instructional reality support?

## Gemini Prompt Seed

Use this when asking Gemini for adaptation ideas:

```text
I am giving you a design brief and a standalone HTML prototype from an existing AI assessment presentation. Do not copy the topic directly. Study the interaction patterns and adapt them for a new presentation called "Architectures of Academic Gatekeeping: Pacing, Process, and Readiness."

The new presentation should help educators compare three readiness architectures: Strict Funnel, Multi-Macro Scaffold, and Process Check-In. Keep the blueprint-style executive tone. Create ideas for an interactive web presentation that lets staff explore trade-offs between automation, cognitive load management, relational trust, and teacher workload. Prioritize practical staff discussion and consensus voting over decorative slides.
```

## What To Ask Gemini For

- A redesigned interaction flow for the readiness topic.
- A readiness architecture selector based on the AI-level selector pattern.
- A trade-off meter or curve showing teacher workload over time.
- A scenario simulator for deciding whether a student is ready for a summative.
- A concise script for facilitating staff discussion after the prototype.

## My Take

The strongest move is not to replicate the AI assessment presentation one-for-one. The better direction is to reuse its underlying logic:

- Make the invisible policy trade-off visible.
- Let staff manipulate the model.
- Use scenarios to move from abstract philosophy to concrete judgment.
- End with a capacity question rather than a fixed answer.

For this readiness topic, I would build the central interaction around `Which architecture fits our reality right now?` The deck already sets up three choices clearly. An interactive version should let staff select one, see the cost profile, test it against two or three student cases, and then vote or discuss the implementation risk.
