# Create a Biology 30 interactive neural-pathway labeling activity

Use the attached `source/reference-label-neurons.png` only as a scientific and layout reference. First use ChatGPT image creation to make a new, original, high-resolution educational diagram. Then build a working interactive HTML prototype around the generated diagram.

## Learners and purpose

The audience is Alberta Biology 30 high-school students. The activity should help students identify the structures in a simple sensory-to-motor neural pathway. It must look like a clear science-learning activity, not an administrative dashboard or a game.

## New image requirements

Create `neural-pathway-labeling.png` at approximately 1600 × 1000 pixels with:

- a clean white or very light neutral background;
- a scientifically accurate pathway showing a skin sensory receptor, a sensory neuron carrying information toward the central nervous system, an interneuron, a motor neuron carrying information away from the central nervous system, and a skeletal-muscle effector;
- a clear left-to-right or top-to-bottom visual flow with enough separation between structures to prevent ambiguity;
- exactly five callout letters: A, B, C, D and J;
- leader lines and open space beside each callout so an HTML dropdown can be positioned close to it;
- no written structure names and no visible answer key;
- no unused letters E, F, G, H or I;
- no title, instructions, buttons, dropdowns, interface chrome, watermark or decorative background inside the generated image;
- crisp textbook-style biological illustration, readable when displayed between 700 and 1000 CSS pixels wide.

Use these exact scientific mappings when composing the diagram:

- A = sensory neuron
- B = interneuron
- C = motor neuron
- D = sensory receptor
- J = effector (skeletal muscle)

Do not trace or closely reproduce the supplied image. Create an original educational rendering of the same biological relationship.

## Interactive prototype requirements

Create one self-contained `interactive-labeling.html` that references `neural-pathway-labeling.png` locally. Use semantic HTML, embedded CSS and embedded JavaScript only. Do not use a framework, CDN, external font, network request, localStorage, IndexedDB or LMS API.

Place one real HTML `<select>` close to each corresponding letter on the diagram at desktop widths. Each dropdown must use the same five choices:

1. Sensory neuron — value `sensory neuron`
2. Interneuron — value `interneuron`
3. Motor neuron — value `motor neuron`
4. Sensory receptor — value `sensory receptor`
5. Effector (muscle) — value `effector`

Use these exact control IDs because they will be connected to an existing course state system later:

- A: `label-A`
- B: `label-B`
- C: `label-C`
- D: `label-D`
- J: `label-J`

Required interaction:

- The student chooses an answer independently for each letter.
- A student can check one letter at a time.
- Feedback says `Correct` or `Not correct yet` without revealing the answer after an incorrect attempt.
- A final `Check all labels` control reports how many of five are correct.
- The activity must not open the diagram in another tab or window.
- On narrow screens, move the five labeled dropdowns into a clear list immediately below the full-width image instead of shrinking them until unreadable.
- Keep the diagram large and central. Avoid five tall cards that push most controls below the fold.

## Accessibility

- Every dropdown must have a visible letter label and a descriptive accessible name.
- The image needs concise alt text plus a nearby expandable long description explaining the pathway without giving away the letter answers.
- All controls must work by keyboard and have strong visible focus states.
- Do not rely on colour alone for feedback.
- Use high contrast, readable 16 px or larger control text, and touch targets at least 44 px high.
- Respect reduced-motion settings and avoid unnecessary animation.

## Visual direction

Use the reference course colours where helpful: dark green `#154212`, teal `#146c60`, near-black `#171b1b`, light canvas `#f7f8f5`, white, and subtle grey-green borders. Use square or lightly rounded controls, simple borders and direct instructional language. Do not use gradients, glass effects, oversized cards, badges, gamified decoration or excessive shadows.

## Return exactly these files

1. `neural-pathway-labeling.png`
2. `interactive-labeling.html`
3. `hotspots.json` with each letter and its desktop position as percentage-based `x` and `y` coordinates relative to the image
4. `implementation-notes.md` describing the generated image dimensions, coordinate method, responsive behaviour, accessibility features and any assumptions

Package those four files in a ZIP. Before returning it, open the HTML locally and confirm the image appears, all five dropdowns work, each individual check works, `Check all labels` works, no network requests occur, and the narrow-screen fallback remains readable.

Do not alter the supplied answer mappings or invent additional assessed letters.
