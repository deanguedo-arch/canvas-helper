# Readiness Architecture Presentation: Design Brief For Gemini

## Purpose

This brief converts the PowerPoint concept `Architectures of Academic Gatekeeping: Pacing, Process, and Readiness` into a digital presentation model that reuses the structure of the existing AI assessment prototype.

The goal is not to make a slide-by-slide copy. The goal is to turn the three gatekeeping options into an interactive decision tool for staff discussion.

## Core Thesis

High-stakes assessments need readiness boundaries. Without a boundary, students can reach a summative task without enough baseline knowledge, process evidence, or confidence to succeed.

The decision is not whether gates are good or bad. The decision is which architecture matches the reality of the course, the learners, the LMS, and the teacher's capacity.

## District Engagement Lens

The district priority for the next two years is student engagement. This presentation should make that priority explicit. The gatekeeping architectures should be evaluated through the language already being used by the district:

- Teacher Clarity: expectations, learning intentions, success criteria, and readiness conditions are visible before students begin high-stakes work.
- Cognitive Load Management: the unit is segmented and sequenced so students are not carrying too much at once.
- Cognitive Engagement and High-Leverage Feedback: students must explain, apply, retrieve, and respond to timely teacher feedback instead of passively submitting work.
- Metacognition and Ownership: students set goals, declare intent, monitor progress, and provide process evidence.
- Emotional Engagement: the structure builds trust, belonging, safety, and the confidence to take academic risks.

The readiness architecture should not be presented as separate from engagement. The argument should be:

```text
The right gate architecture is an engagement strategy because it clarifies expectations, manages cognitive load, requires active thinking, builds ownership, and protects teacher-student trust.
```

## Source Concepts To Preserve

### Option 1: Strict Funnel

Students complete learning materials and ungraded practice checks. At the end of the unit, one LMS-controlled Readiness Check unlocks the summative prompt only after the student reaches a target score such as 70 percent.

This model protects teacher time and prevents unprepared students from reaching a live Defence or high-stakes task too early. It is efficient, but it can feel rigid for advanced students.

### Option 2: Multi-Macro Scaffold

The unit is divided into halves or thirds. Students pass Macro A to unlock the next learning segment, then Macro B to unlock the summative prompt.

This model protects cognitive load and supports vulnerable learners by creating smaller success points. It is structured, but students may experience it as bureaucratic or full of roadblocks.

### Option 3: Process Check-In

Automated quiz locks are removed or softened. Students build a process portfolio: notes, outlines, research, practice evidence, and a Declaration and Intent.

Before the final Product prompt unlocks, the teacher reviews the process evidence and discusses preparation with the student. This builds trust and makes formative work visible, but it moves teacher workload upstream.

## Adapted Structure From The AI Assessment Prototype

### 1. Three-Part Model

AI assessment version:

- Product
- Process
- Defence

Readiness version:

- Pacing: how the system controls movement through the unit.
- Process Evidence: what proves preparation happened before the summative.
- Readiness Sign-Off: how readiness is validated before release.

Use a live model that changes as users select the architecture. The user should see that each architecture changes the balance between automation, cognitive protection, relational trust, teacher time, and student friction.

### 2. Architecture Selector

AI assessment version:

- Select an AI-use level.
- Evidence burden changes.

Readiness version:

- Select Strict Funnel, Multi-Macro Scaffold, or Process Check-In.
- The trade-off profile changes.
- The timeline changes.
- The likely pain point changes.

This should be the core interaction. It lets staff see that each model solves one problem while creating another.

### 3. Gate Simulator

AI assessment version:

- Review evidence.
- Conduct Defence.
- Decide whether work is valid.

Readiness version:

- Review a student case.
- Select a gate architecture.
- Decide whether the student is released, scaffolded, conferenced, or delayed.
- Show the consequence of the decision.

The simulator should make the trade-offs concrete:

- Advanced student: may be slowed by Strict Funnel.
- Vulnerable learner: may benefit from Multi-Macro Scaffold.
- Prepared but anxious student: may benefit from Process Check-In.
- Unprepared student: any architecture should prevent premature high-stakes release.

### 4. Engagement Alignment Layer

Add a persistent engagement layer across the prototype. Every architecture should show how it supports or strains the five district engagement priorities.

- Strict Funnel: strongest for Teacher Clarity and baseline readiness, weaker for Emotional Engagement if students experience the gate as impersonal.
- Multi-Macro Scaffold: strongest for Cognitive Load Management, useful for Teacher Clarity, but can reduce engagement if students feel blocked too often.
- Process Check-In: strongest for Emotional Engagement, Metacognition and Ownership, and High-Leverage Feedback, but only works if teacher capacity exists.

## Suggested Digital Presentation Flow

1. Opening frame: `Architectures of Academic Gatekeeping`
2. Problem frame: high-stakes assessment without readiness boundaries creates predictable failure.
3. District engagement frame: define the five engagement priorities and show why readiness architecture is an engagement strategy.
4. Spectrum frame: automation paces the student; relationships build the student.
5. Architecture explorer: compare the three options across automation, cognitive load, trust, teacher workload, friction, and engagement alignment.
6. Timeline frame: show where teacher effort appears in the unit.
7. Scenario simulator: test the architecture against student cases.
8. Capacity frame: ask which architecture fits current staff capacity and student engagement goals.
9. Discussion frame: vote, name risks, and choose a pilot.

## Visual Direction

Use the AI assessment prototype's dark executive presentation feel, but make this version more like an architectural planning board.

Recommended traits:

- Dark graphite or deep green background.
- Fine grid lines and schematic dividers.
- Amber for locks, friction, and workload warnings.
- Green for readiness and safe release.
- Bone/white for text and linework.
- Minimal decoration. Let the diagrams and trade-off meters carry the visual interest.

Avoid making it feel like a generic dashboard. This is a staff decision room, not an analytics product.

## Gemini Prompt Seed

```text
Use the attached design brief and standalone HTML prototype as a reference. Create a new interactive digital presentation for "Architectures of Academic Gatekeeping: Pacing, Process, and Readiness."

The presentation should convert three models into an interactive decision tool:

1. Strict Funnel: one automated LMS readiness gate before the summative.
2. Multi-Macro Scaffold: multiple automated gates across unit segments.
3. Process Check-In: teacher-reviewed process evidence and relational readiness sign-off.

Reuse the logic of the AI assessment prototype, but do not copy its topic. Replace Product/Process/Defence with Pacing/Process Evidence/Readiness Sign-Off. Replace AI Levels with the three readiness architectures. Replace the Validity Gate Simulator with a Readiness Gate Simulator.

Layer in the district's two-year student engagement priority. Use the district language directly: Teacher Clarity, Cognitive Load Management, Cognitive Engagement and High-Leverage Feedback, Metacognition and Ownership, and Emotional Engagement.

The output should help educators compare trade-offs between automation, cognitive load, relational trust, teacher workload, student friction, and engagement alignment. End with the practical question: Which architecture fits our reality right now and best supports student engagement?
```

## What Gemini Should Generate Ideas For

- A clearer interaction flow for staff facilitation.
- A refined architecture selector.
- A better visual metaphor for the funnel, macro gates, and relational check-in.
- Scenario cards for different student profiles.
- A closing discussion/voting activity.
- A version that could be turned into a full web presentation later.

## My Recommendation

Build this as a decision simulator, not a lecture deck.

The strongest interactive moment is selecting an architecture and immediately seeing the cost profile change. Strict Funnel should look efficient but rigid. Multi-Macro should look supportive but controlled. Process Check-In should look humane but expensive in teacher time.

The final question should not be `Which model is best?`

The final question should be:

```text
Which architecture can we actually support with our current students, LMS setup, teacher bandwidth, and engagement goals?
```
