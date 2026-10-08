# STYLE LOCK — do not improvise

Reference share supplied by the user:
`https://chatgpt.com/s/p_6ac691e823b88191bcb3c4ffb3da9306`

The public prompt-template page did not expose its image to automated retrieval in this environment. This asset pack therefore uses the approved Writing Studio visual references already present in the project/conversation as the concrete implementation authority. If the shared-link image is visually different, replace the canonical reference PNGs before implementation.

## Product feel
A premium but practical student writing workspace:
- calm, mature, editorial
- academic without feeling institutional
- very light warm surfaces
- deep forest green for navigation/actions
- dark charcoal copy
- restrained pale sage and pale gold support colors
- crisp 1px borders
- minimal shadows
- generous but not wasteful spacing
- serif is reserved for student prose / selected editorial accents
- interface remains predominantly sans-serif

## Exact design tokens
- Ink: `#171C1A`
- Muted: `#535D58`
- Primary: `#124B38`
- Primary hover: `#0C3B2B`
- Primary soft: `#EAF2EC`
- Background: `#F7F8F6`
- Surface: `#FFFFFF`
- Border: `#D9DFDA`
- Control border: `#7B897F`
- Sage: `#DCE9DD`
- Pale gold: `#F6ECD4`
- Warning ink: `#70520C`
- Error: `#A12A2A`
- Focus: `#176E50`

## Typography
No font files are bundled.
- UI default: `Arial, Helvetica, sans-serif`
- Student prose / editorial serif: `Georgia, "Times New Roman", serif`
- Display heading: 38–40px / ~42px, weight 800, tracking `-0.025em`
- Page heading: 30–34px
- Section: 22–23px
- Card heading: 18px
- Body: 16px / 24px
- Metadata: 13px / 19px
- Student prose: 19px / 32px

If the production environment already has authorized local Hanken Grotesk and Work Sans, they may replace the UI fallbacks. Do not add CDN font dependencies to a SCORM build.

## Geometry
- Top bar: 56px
- Wide left rail: 224px
- Context rail: 304px
- Content outer padding: 28–32px
- Major gap: 24px
- Base spacing: 4px
- Preferred spacing: 8 / 12 / 16 / 24 / 32 / 40px
- Card radius: 6px
- Button/input radius: 4px
- Pills only: 999px
- Minimum control height: 44px

## Surface rules
- Cards: white, 1px `#D9DFDA`, almost no shadow
- Main background: `#F7F8F6`
- Editable writing surfaces: true white
- Green blocks only for primary navigation / primary action / selected states
- Gold is an accent, never the dominant UI color
- Use large typography for hierarchy, not oversized decorative boxes

## Interaction look
- One authoritative save state in the top bar
- Selected navigation: solid forest green or subtle green emphasis
- Selected project tab: green label + 3px underline
- Primary button: forest green / white
- Secondary button: white / green-border
- Status badges: rectangular-small-radius, not bubbly
- Progress ring: thin semantic green arc, runtime-generated SVG/CSS
- Inputs: visible label, neutral border, no floating labels
- Focus: 3px `#176E50` outline with offset

## Do not
- Do not reproduce D2L/Brightspace's outer masthead inside the SCORM.
- Do not bake real UI labels into screenshots.
- Do not use the raster component sheets as sprites.
- Do not turn every section into a card.
- Do not use glassmorphism.
- Do not use large gradients.
- Do not add stock people.
- Do not create fake grades, fake teacher feedback, or fabricated progress.
