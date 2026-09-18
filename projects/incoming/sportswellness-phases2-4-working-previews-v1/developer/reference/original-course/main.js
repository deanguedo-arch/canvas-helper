const SIDEBAR_COLLAPSE_KEY = 'sportswellness.sidebarCollapsed';
const SIDEBAR_BREAKPOINT = 860;

const MATERIALS = [
  {
    id: 'm0',
    code: '00',
    title: 'What is Sports Psychology?',
    desc: 'The Diagnostic & Baseline Protocol.',
    color: '#94a3b8',
    file: './assets/slides/00-diagnostic.pdf'
  },
  {
    id: 'm1',
    code: '01',
    title: 'The Engine',
    desc: 'Values, identity, and foundation.',
    color: '#f43f5e',
    file: './assets/slides/01-engine.pdf'
  },
  {
    id: 'm2',
    code: '02',
    title: 'The Drive',
    desc: 'Integrated discipline, motivation quality, and recovery.',
    color: '#f59e0b',
    file: './assets/slides/02-drive.pdf'
  },
  {
    id: 'm3',
    code: '03',
    title: 'The Focus',
    desc: 'Spotlight, cues, and the fortress.',
    color: '#10b981',
    file: './assets/slides/03-focus.pdf'
  },
  {
    id: 'm4',
    code: '04',
    title: 'The Toolkit',
    desc: 'Confidence and visualization protocols.',
    color: '#0ea5e9',
    file: './assets/slides/04-toolkit.pdf'
  }
];

const PHASES = [
  { id: 'phase-0', code: 'Diagnostic', title: 'What is Sports Psychology?', body: 'Baseline phase shell ready. Add orientation content and readiness checkpoints here.', accent: '#94a3b8', image: './assets/readings/phase1-figures/phase0-module-diagnostic-cover-brain.png' },
  { id: 'phase-1', code: 'Phase 1', title: 'The Engine', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#00ff7f', image: './assets/readings/phase1-figures/phase1-module-engine-cover.png' },
  { id: 'phase-2', code: 'Phase 2', title: 'The Drive', body: 'Integrated discipline, self-determined motivation, recovery, and the social conditions that sustain high performance.', accent: '#8a2be2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvDf2Loe_K9P9rPvsVnKxak1lzcUPafuTXXcuWbvJlqfavtKwooYLAzn-8dLG0JTgPXYaD1fCNRnJ_BBztqMgkJuNraarq9K40uDncUo3VuHPUlE_74VhLYp6-ce_a0WXvi1IoKSHDBFjh3_XozgrVDifob2lwFGoiETAWWAkMWrId7aLagJPSIZXc0ihBAqy5xNPjqHpWQ3cQTjy5FWZGfRs9CDWmf4dcyLA7wv4J3O5tRrNNdxauFmMGjwvlXadZ4zYqzpyCQg' },
  { id: 'phase-3', code: 'Phase 3', title: 'The Focus', body: 'Attention control, the Inner Game, and practical refocus systems for pressure performance.', accent: '#00ced1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNgFbRFd5BzfIizgsYiWBVenbYdAhXa1r239HJE6lensK1WHkoFnTGSAWw-yC79HIjZy448eVlIgXEB6I-DANgc-HfvlvEdysH261NOgOU4M2xD49UTPmg1DXJ1hZJQcqJWFOb9g-YDZeSRNq3M1DJr9jo6A7bnykuIqQZhFYdolv1WY-bH1DjVTnVFYIvRPPylGs70rVzBv2m31FtPEdA_dDr0VsyFSBpq1c3sj9f8A01leCLUMJcMIsJD_5QYPSTSZCnH-Xhxg' },
  { id: 'phase-4', code: 'Phase 4', title: 'The Toolkit', body: 'Confidence, envisioning, and pre-performance control routines that help athletes build certainty before execution.', accent: '#5c2e91', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJxNkx8XcI7amPy8SuO1byA5jB5t7Vgu7IDETTzUHpNZhGv3sF5clnnWroiNORNERn_9nal0ZPF8GGKjLYf--q4FM8nx0XPMxa4i_fp273shRI9kHUcq30245dQF2VsMtJ8lHTY3YDHsReuTrF9sugMQOSiUbyGzLjKHT8hRQFeqEtTuwvv-48dKMeaWD8DSL5TKY6u2K1SwbH6OhAfQwIWBJp1GeTDbsue9kBX9PEhqg5ys1ea3ud-4d8uImQKJhVH5_bhs9Gw' }
];

const ASSIGNMENTS = [
  {
    id: "a0",
    code: "00",
    title: "Diagnostic",
    accent: "#94a3b8",
    body: "Baseline diagnostic assignment for pressure response, motivation, focus, and visualization readiness.",
    eyebrow: "Baseline Diagnostic",
    heroTitle: "Protocol 001",
    introCopy: "Start with an honest diagnostic of how your current mental performance system responds under pressure before you build the rest of the course tools.",
    steps: ["Run Diagnostic", "Generate Report"]
  },
  {
    id: "a1",
    code: "01",
    title: "The Engine",
    accent: "#00ff7f",
    body: "Regulation Engine tactical assignment focused on pressure response, arousal control, and reset habits.",
    eyebrow: "Regulation Engine",
    heroTitle: "Elite Operator Toolkit",
    introCopy: "Pressure creates physiological spikes. Your job is not to avoid activation, but to manage it with repeatable systems. This assignment builds a tactical routine for resetting, regulating arousal, targeting attention, and protecting confidence during competition.",
    steps: ["Briefing", "Stress Reset", "Arousal", "Targeting", "Confidence", "Review & Print"],
    introCards: [
      { title: "Stress Reset", body: "Identify what your body does under pressure and define the fastest reliable reset action." },
      { title: "Arousal Control", body: "Map when you are under-activated, over-activated, or in the ideal competitive zone." },
      { title: "Targeting", body: "Choose the narrow external cue that keeps the spotlight off panic and on execution." },
      { title: "Confidence", body: "Build a fast cue-and-belief routine you can trust when performance starts to wobble." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Stress Reset",
        copy: "Notice activation before it owns the moment. Build the first physical interrupt.",
        fields: [
          { label: "What does pressure feel like in your body?", type: "textarea", placeholder: "Describe your physical reaction pattern under pressure..." },
          { label: "What is your immediate reset action?", type: "input", placeholder: "Example: one long exhale, shoulders down, eyes on target" }
        ]
      },
      {
        label: "Step 02",
        title: "Arousal",
        copy: "Map your competitive zone so you know when to raise energy and when to bring it down.",
        fields: [
          { label: "When are you over-activated?", type: "textarea", placeholder: "Describe the signs that you are too hot..." },
          { label: "When are you under-activated?", type: "textarea", placeholder: "Describe the signs that you are flat or too calm..." }
        ]
      },
      {
        label: "Step 03",
        title: "Targeting",
        copy: "The spotlight must land somewhere external and controllable.",
        fields: [
          { label: "Primary cue word", type: "input", placeholder: "Example: drive, smooth, attack, release" },
          { label: "Spotlight target", type: "textarea", placeholder: "State the narrow external thing you want your attention locked onto..." }
        ]
      },
      {
        label: "Step 04",
        title: "Confidence",
        copy: "Confidence needs a routine, not a hope.",
        fields: [
          { label: "Confidence statement", type: "textarea", placeholder: "Write the belief statement you return to when doubt spikes..." },
          { label: "Between-play routine", type: "input", placeholder: "Example: exhale, cue word, visual lock, commit" }
        ]
      }
    ],
    summaryTitle: "Engine Master Summary",
    summaryCopy: "Define your reset protocol, ideal activation zone, spotlight cue, and confidence routine in one place.",
    summaryPlaceholder: "Summarize your complete Engine system here...",
    actionLabel: "Phase 1 system ready"
  },
  {
    id: "a2a",
    code: "02A",
    title: "Values Blueprint",
    accent: "#f59e0b",
    body: "Values mapping assignment that connects identity, standards, and action rules.",
    eyebrow: "Identity System",
    heroTitle: "Values Blueprint",
    introCopy: "This assignment translates abstract values into visible behavior. The goal is to identify what you stand for, define how those values look in action, and create filters that guide decisions when pressure or fatigue hits.",
    steps: ["Briefing", "Core Values", "Standards", "Decision Filters", "Review"],
    introCards: [
      { title: "Core Values", body: "Choose the principles that define you when you are at your best." },
      { title: "Standards", body: "Turn those values into behaviors that can be seen and measured." },
      { title: "Decision Filters", body: "Create questions that keep choices aligned under pressure." },
      { title: "Alignment Check", body: "Identify where current habits support or betray your values." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Core Values",
        copy: "Name the values that anchor the kind of athlete and person you are trying to become.",
        fields: [
          { label: "List your top three core values", type: "textarea", placeholder: "Example: discipline, courage, composure..." },
          { label: "Why do these values matter to you?", type: "textarea", placeholder: "Explain why these values are non-negotiable..." }
        ]
      },
      {
        label: "Step 02",
        title: "Standards",
        copy: "A value without a standard stays vague. Define what these values look like in action.",
        fields: [
          { label: "What behaviors prove your values in training?", type: "textarea", placeholder: "Describe concrete behaviors that show these values..." },
          { label: "What behaviors prove your values in competition?", type: "textarea", placeholder: "Describe how these values show up when pressure rises..." }
        ]
      },
      {
        label: "Step 03",
        title: "Decision Filters",
        copy: "Use short questions to guide your choices when emotions try to take over.",
        fields: [
          { label: "What question will you ask before a hard choice?", type: "input", placeholder: "Example: What would discipline do here?" },
          { label: "What question will you ask after a mistake?", type: "input", placeholder: "Example: What choice keeps me aligned right now?" }
        ]
      },
      {
        label: "Step 04",
        title: "Alignment Check",
        copy: "Find the gaps between what you say matters and what you repeatedly do.",
        fields: [
          { label: "Where are your habits currently aligned?", type: "textarea", placeholder: "Describe the habits that already support your values..." },
          { label: "Where are you out of alignment?", type: "textarea", placeholder: "Name the habits or situations that pull you off-standard..." }
        ]
      }
    ],
    summaryTitle: "Values Blueprint Summary",
    summaryCopy: "Capture your values, the behaviors that prove them, and the filters that will guide your choices when stress rises.",
    summaryPlaceholder: "Summarize your Values Blueprint here...",
    actionLabel: "Identity blueprint ready"
  },
  {
    id: "a2b",
    code: "02B",
    title: "Master Config",
    accent: "#ffd166",
    body: "System build assignment for routines, maintenance logic, and personal operating settings.",
    eyebrow: "Performance Architecture",
    heroTitle: "Master Config",
    introCopy: "This assignment is your operating-system build. You are defining your default settings, your automatic responses, and the maintenance rules that keep your performance system stable instead of reactive.",
    steps: ["Briefing", "System Audit", "Default Settings", "If-Then Plans", "Review"],
    introCards: [
      { title: "System Audit", body: "Assess what currently helps, what leaks energy, and what crashes your system." },
      { title: "Default Settings", body: "Define how you want to prepare, compete, and recover on purpose." },
      { title: "If-Then Plans", body: "Pre-build responses for predictable breakdown moments." },
      { title: "Maintenance Loop", body: "Create a repeatable schedule for review, reset, and updates." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "System Audit",
        copy: "Start with an honest diagnostic of what is already installed in your routine.",
        fields: [
          { label: "What currently strengthens your system?", type: "textarea", placeholder: "List the habits, routines, or supports already working..." },
          { label: "What currently creates performance leaks?", type: "textarea", placeholder: "Identify the habits or environments that destabilize you..." }
        ]
      },
      {
        label: "Step 02",
        title: "Default Settings",
        copy: "Set intentional defaults for before, during, and after performance.",
        fields: [
          { label: "Pre-performance default", type: "textarea", placeholder: "Describe how you want to enter performance..." },
          { label: "In-performance default", type: "textarea", placeholder: "Describe the baseline state you want to return to..." },
          { label: "Post-performance default", type: "textarea", placeholder: "Describe the first thing you do after competition or training..." }
        ]
      },
      {
        label: "Step 03",
        title: "If-Then Plans",
        copy: "Anticipate common breakdowns and remove hesitation by scripting the response now.",
        fields: [
          { label: "If anxiety spikes, then...", type: "input", placeholder: "Write the response you want to automate..." },
          { label: "If motivation drops, then...", type: "input", placeholder: "Write the maintenance response..." },
          { label: "If a mistake rattles you, then...", type: "input", placeholder: "Write the reset sequence..." }
        ]
      },
      {
        label: "Step 04",
        title: "Maintenance Loop",
        copy: "Stable systems get checked, tuned, and repaired on schedule.",
        fields: [
          { label: "Daily system check", type: "textarea", placeholder: "What quick daily check tells you whether the system is healthy?" },
          { label: "Weekly review and update", type: "textarea", placeholder: "How will you review and update the system each week?" }
        ]
      }
    ],
    summaryTitle: "Master Config Summary",
    summaryCopy: "Lock in your audit findings, your defaults, and the if-then responses that keep the system stable under stress.",
    summaryPlaceholder: "Summarize your Master Config system here...",
    actionLabel: "Config locked"
  },
  {
    id: "a3",
    code: "03",
    title: "The Focus",
    accent: "#10b981",
    body: "Attention-control assignment centered on attentional width, spotlight control, cueing, and fortress routines.",
    eyebrow: "Attention Command",
    heroTitle: "Focus Master Blueprint",
    introCopy: "Concentration is a trained spotlight built from selectivity, alertness, and shifting. This assignment helps you audit distracters, read when arousal is widening or narrowing the field, build cues and anchors, and create a fortress routine that moves attention away from noise and back to execution.",
    steps: ["Briefing", "Spotlight Audit", "Cue Builder", "Fortress Plan", "Review"],
    introCards: [
      { title: "The Spotlight", body: "Your attention must be narrow, external, and task-relevant when execution starts." },
      { title: "Alertness & Shift", body: "Notice when arousal makes the field too broad or too narrow, then move into the right quadrant on purpose." },
      { title: "Self 1 vs Self 2", body: "The goal is to reduce judgment and trust instinctive execution." },
      { title: "Quiet Eye", body: "A stable final fixation plus a nonjudgmental reset protects control under pressure." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "The Arena",
        copy: "Audit the internal and external distracters that pull your spotlight away from the task, then check what arousal is doing to attentional width.",
        fields: [
          { label: "Internal distracters", type: "textarea", placeholder: "Example: self-talk, fear of failure, replaying mistakes..." },
          { label: "External distracters", type: "textarea", placeholder: "Example: crowd noise, officiating, opponents, environment..." },
          { label: "Alertness / width check", type: "textarea", placeholder: "Describe whether pressure makes your attention too broad, too narrow, or too flat..." },
          { label: "Primary spotlight goal", type: "input", placeholder: "State the narrow external target you want your focus locked onto..." }
        ]
      },
      {
        label: "Step 02",
        title: "Cues & Anchors",
        copy: "Quiet Self 1 by using cues that direct behavior and anchors that return you to the now.",
        fields: [
          { label: "Instructional cue", type: "input", placeholder: "Example: follow through, tall, smooth..." },
          { label: "Motivational cue", type: "input", placeholder: "Example: attack, explode, compete..." },
          { label: "Physical anchor", type: "textarea", placeholder: "Describe the sensation or object detail you will return to..." }
        ]
      },
      {
        label: "Step 03",
        title: "Fortress Routine",
        copy: "Build the preparation sequence that carries you from noise to readiness.",
        fields: [
          { label: "Physical start to your routine", type: "textarea", placeholder: "Describe the first physical action that starts the routine..." },
          { label: "Mental cue or image", type: "textarea", placeholder: "Describe the cue or image that locks you in..." },
          { label: "What-if reset plan", type: "textarea", placeholder: "Describe the nonjudgmental reset that gets you back to the next target when disruption hits..." }
        ]
      }
    ],
    summaryTitle: "Focus Blueprint Summary",
    summaryCopy: "Combine the distracter audit, the cue system, and the fortress routine into a complete concentration plan.",
    summaryPlaceholder: "Summarize your Focus Blueprint here...",
    actionLabel: "Focus system ready"
  },
  {
    id: "a4a",
    code: "04A",
    title: "Confidence",
    accent: "#0ea5e9",
    body: "Confidence blueprint covering sources of belief, the confidence account, mental filter protection, and C-B-A routines.",
    eyebrow: "Confidence Command",
    heroTitle: "Confidence Master Blueprint",
    introCopy: "Confidence is built through evidence, protected through interpretation, and expressed through routine. This assignment turns the chapter's confidence model into something operational instead of emotional.",
    steps: ["Briefing", "Sources & Deposits", "Mental Filter", "C-B-A Bridge", "Review"],
    introCards: [
      { title: "Sources of Confidence", body: "Track mastery experiences, modeling, persuasive coaching, imagery, preparation, and the meaning assigned to arousal." },
      { title: "Confidence Account", body: "Use Top Ten evidence and Daily E-S-P deposits to keep belief stocked with real proof." },
      { title: "Mental Filter", body: "Protect confidence with temporary / limited / nonrepresentative thinking and What? So what? Now what?" },
      { title: "C-B-A Bridge", body: "Use cue conviction, a practiced breath plan, and an external attentional attachment to carry belief into action." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Sources & Deposits",
        copy: "Inventory the evidence that you are capable, prepared, and reliable, then map where confidence comes from in your real system.",
        fields: [
          { label: "Top Ten evidence list", type: "textarea", placeholder: "List ten pieces of evidence, accomplishments, or habits that build certainty..." },
          { label: "Daily E-S-P plan", type: "textarea", placeholder: "Describe how effort, success, and progress will keep feeding the account..." }
        ]
      },
      {
        label: "Step 02",
        title: "Mental Filter & Damage Control",
        copy: "The event is not the damage. The interpretation is. Build the filter, the What? So what? Now what? loop, and the arousal reframe now.",
        fields: [
          { label: "Recent withdrawal or confidence threat", type: "textarea", placeholder: "Describe the event that usually drains confidence..." },
          { label: "Mental filter rewrite", type: "textarea", placeholder: "Rewrite the event as temporary, limited, and nonrepresentative..." }
        ]
      },
      {
        label: "Step 03",
        title: "C-B-A Bridge",
        copy: "Build a quick sequence that restores conviction, settles the body, and reattaches attention to the task.",
        fields: [
          { label: "Cue conviction", type: "input", placeholder: "Example: trust, commit, attack, smooth..." },
          { label: "Practiced breath plan", type: "textarea", placeholder: "Describe the breath plan that calms the body into usable energy..." },
          { label: "External attentional attachment", type: "input", placeholder: "What external target or first action reattaches you to execution?" }
        ]
      },
      {
        label: "Step 04",
        title: "Understanding Narrative",
        copy: "Explain how sources, deposits, mental filter logic, and the C-B-A bridge work together under pressure.",
        fields: [
          { label: "Confidence logic narrative", type: "textarea", placeholder: "Explain how this system builds certainty, protects it, and carries it into execution..." }
        ]
      }
    ],
    summaryTitle: "Confidence Blueprint Summary",
    summaryCopy: "Capture your evidence, confidence sources, mental filter, and C-B-A bridge in one complete confidence system.",
    summaryPlaceholder: "Summarize your Confidence Blueprint here...",
    actionLabel: "Confidence system ready"
  },
  {
    id: "a4b",
    code: "04B",
    title: "Visualization",
    accent: "#8b5cf6",
    body: "Visualization master blueprint for prop check, mental cinema, perspective control, and the director's toolkit.",
    eyebrow: "Visualization Lab",
    heroTitle: "Visualization Master Blueprint",
    introCopy: "The brain responds to vivid internal rehearsal. This assignment builds a prop check, a mental cinema, and a director's toolkit so your internal film becomes useful rather than random.",
    steps: ["Briefing", "Prop Check", "Mental Cinema", "Director's Toolkit", "Review"],
    introCards: [
      { title: "Prop Check", body: "Start in a controlled mental place, then make the scene tactile with the actual tool, object, weight, texture, and familiar movement." },
      { title: "Mental Cinema", body: "Build the visual, auditory, kinesthetic, emotional, and timing layers of the scene." },
      { title: "Perspective Control", body: "Choose internal / first person or external / third person on purpose." },
      { title: "Director's Toolkit", body: "Use GoPro perspective, director's cut, flat tire drill, and real-time rehearsal to protect the film under stress." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Prop Check",
        copy: "Start the film in a place you control, then make it tactile and familiar with a real prop check.",
        fields: [
          { label: "Mental starting place", type: "textarea", placeholder: "Describe where the rehearsal begins before action starts..." },
          { label: "Tool or object", type: "input", placeholder: "Name the tool, object, or surface that grounds the scene..." },
          { label: "Weight, texture, and familiar movement", type: "textarea", placeholder: "Describe how the prop feels when you handle it..." }
        ]
      },
      {
        label: "Step 02",
        title: "Mental Cinema",
        copy: "Build the scene with multiple sensory channels, an explicit perspective choice, and timing that matches the task.",
        fields: [
          { label: "Visual / auditory detail", type: "textarea", placeholder: "Describe what you see and hear in the performance scene..." },
          { label: "Kinesthetic detail", type: "textarea", placeholder: "Describe what your body feels as you execute..." },
          { label: "Emotional tone", type: "textarea", placeholder: "Describe the feeling of control, readiness, or intensity..." }
        ]
      },
      {
        label: "Step 03",
        title: "Director's Toolkit",
        copy: "Use GoPro perspective, director's cut, flat tire drill, and real-time rehearsal so the film survives disruption.",
        fields: [
          { label: "GoPro perspective", type: "textarea", placeholder: "Describe the first-person camera angle that helps you feel the task from inside the action..." },
          { label: "Director's cut / rewind / overwrite", type: "textarea", placeholder: "Describe how you cut and replace the wrong image..." },
          { label: "Flat tire drill", type: "textarea", placeholder: "Describe the predictable disruption and the dominant recovery..." }
        ]
      },
      {
        label: "Step 04",
        title: "Review",
        copy: "Now combine the prop check, mental cinema, and director's toolkit into one full envisioning script.",
        fields: [
          { label: "Full envisioning script", type: "textarea", large: true, placeholder: "Write the full imagery script from opening frame to execution to disruption to recovery..." }
        ]
      }
    ],
    summaryTitle: "Visualization Blueprint Summary",
    summaryCopy: "Lock the prop check, mental cinema, perspective, timing, and director's toolkit into one usable internal script.",
    summaryPlaceholder: "Summarize your Visualization Blueprint here...",
    actionLabel: "Visualization system ready"
  }
];

const PERFORMANCE_TOOLS = [
  {
    id: 'phase1-performance-state-simulator-game',
    code: 'Phase 1',
    title: 'Phase 1 Performance State Simulator Game',
    eyebrow: 'Performance tool',
    accent: '#00ff7f',
    body: 'Arousal regulation simulator for inverted-U control, pace adaptation, and sustained execution tracking under pressure.',
    viewerSrc: './performance/phase1-performance-state-simulator-game.html'
  },
  {
    id: 'phase2-discipline-game',
    code: 'Phase 2',
    title: 'Phase 2 Architecture of Discipline Game',
    eyebrow: 'Performance tool',
    accent: '#f59e0b',
    body: 'Integrated discipline simulator for process execution, outcome-trap management, and growth-minded response under pressure.',
    viewerSrc: './performance/phase2-discipline-game.html'
  },
  {
    id: 'phase3-focus-game',
    code: 'Phase 3',
    title: 'Phase 3 Focus Game',
    eyebrow: 'Performance tool',
    accent: '#10b981',
    body: 'Inner Game simulator for attention control, cue timing, and interference management under pressure.',
    viewerSrc: './performance/phase3-focus-game.html'
  },
  {
    id: 'phase4-mental-filter-simulator-game',
    code: 'Phase 4',
    title: 'Phase 4 Mental Filter Simulator Game',
    eyebrow: 'Performance tool',
    accent: '#0ea5e9',
    body: 'Confidence-account simulator for filtering thought patterns, protecting identity, and converting evidence into durable belief.',
    viewerSrc: './performance/phase4-mental-filter-simulator-game.html'
  }
];

// Add new Film Room tapes by appending flat entries to this catalog.
const FILM_ROOM_VIDEOS = [
  { id: 'tape-01', code: 'Tape 01', title: 'How Self-Determination Theory (SDT) Creates Intrinsic Motivation', youtubeId: '6FTTX0H4HfE' },
  { id: 'tape-02', code: 'Tape 02', title: 'Michael Jordan and the Power of Failure', youtubeId: 'Q_EyPX3CD-g' },
  { id: 'tape-03', code: 'Tape 03', title: 'The Power of "Yet" in Student Athletics', youtubeId: 'px9CzSZsa0Y' },
  { id: 'tape-04', code: 'Tape 04', title: 'Growth Mindset vs. Fixed Mindset for High School Athletes', youtubeId: 'DDaV57glOVI' },
  { id: 'tape-05', code: 'Tape 05', title: 'The Science of Praise and Student Motivation (Carol Dweck)', youtubeId: 'y5ZBItSb7jw' },
  { id: 'tape-06', code: 'Tape 06', title: 'Mastering the Inner Game: Self 1 vs. Self 2 Concepts', youtubeId: 'pa2Mpa8t8iU' },
  { id: 'tape-07', code: 'Tape 07', title: 'Managing Pre-Game Anxiety: The ABCs Strategy', youtubeId: 'FcPSuW9pGcE' },
  { id: 'tape-08', code: 'Tape 08', title: 'Controlling Nerves and Reframing Pregame Jitters', youtubeId: 'Ih5IrYcXADo' },
  { id: 'tape-09', code: 'Tape 09', title: 'Dr. Nate Zinsser: Building the Mental Bank Account for Confidence', youtubeId: '00gzhaRnr6A' },
  { id: 'tape-10', code: 'Tape 10', title: 'Yerkes-Dodson: The Inverted-U Theory of Performance', youtubeId: 's9goL8OeB-0' },
  { id: 'tape-11', code: 'Tape 11', title: 'Practical Arousal Control for Elite Performance', youtubeId: '_Le9VIVi1xM' },
  { id: 'tape-12', code: 'Tape 12', title: 'The Power of Visualization: How Michael Phelps Swims in His Mind', youtubeId: '3-mm90LFPqU' },
  { id: 'tape-13', code: 'Tape 13', title: 'Scenario Planning: Michael Phelps and Preparing for Anything', youtubeId: 'RoEhKWmVF3g' },
  { id: 'tape-14', code: 'Tape 14', title: 'Guided Athletic Meditation and Imagery Session', youtubeId: '5Cl4OjZYBg0' },
  { id: 'tape-15', code: 'Tape 15', title: "A Beginner's Guide to Using Mental Rehearsal", youtubeId: 'EAGKsvhAPME' },
  { id: 'tape-16', code: 'Tape 16', title: 'Four Visualization Techniques for Game-Day Confidence', youtubeId: 'oa6o2LkcR5k' },
  { id: 'tape-17', code: 'Tape 17', title: 'Nick Saban on "The Process" and Avoiding Complacency', youtubeId: 'iWIeQlEUa5Q' },
  { id: 'tape-18', code: 'Tape 18', title: 'Outcomes are a Distraction: How The Process Changed Football', youtubeId: 'LIopioHzciA' },
  { id: 'tape-19', code: 'Tape 19', title: 'The Mamba Mentality: Being the Best Version of Yourself', youtubeId: 'GE0UAdxPTc0' },
  { id: 'tape-20', code: 'Tape 20', title: 'David Goggins: The Accountability Mirror Challenge', youtubeId: 'G7Jyh6IsjMg' },
  { id: 'tape-21', code: 'Tape 21', title: 'Confronting the Weak Self through Radical Ownership', youtubeId: 'ma4nh7aFzhk' },
  { id: 'tape-22', code: 'Tape 22', title: 'Jocko Willink: Fail Until You Win', youtubeId: 'jHnX-nMl59U' },
  { id: 'tape-23', code: 'Tape 23', title: 'Inky Johnson: Never Give In - The Mission and the Purpose', youtubeId: 'lOOd8D4DhwI' },
  { id: 'tape-24', code: 'Tape 24', title: 'Why Some Succeed: The Navy SEAL Selection Process', youtubeId: 'zP9jpxitfb4' },
  { id: 'tape-25', code: 'Tape 25', title: 'Developing Resilient Leaders through the Warrior Ethos', youtubeId: 'e4JWnQ8gLr4' },
  { id: 'tape-26', code: 'Tape 26', title: 'Ray Lewis: Lessons in Effort and the Law of Victory', youtubeId: 'nda4QXuX1XM' },
  { id: 'tape-27', code: 'Tape 27', title: 'Georges St-Pierre: Champion Spirit and Mental Toughness', youtubeId: 'epM7ZnaWWbk' },
  { id: 'tape-28', code: 'Tape 28', title: 'Building Team Culture: From "What\'s in it for Me" to "Give to We"', youtubeId: 'cPi9fr12ikg' },
  { id: 'tape-29', code: 'Tape 29', title: 'High Performance: Finding the Balance between Truth and Trust', youtubeId: 'j-pxzDgUid0' }
];

const QUIZZES = [
  {
    id: 'quiz-phase1-performance-state',
    code: 'Quiz 01',
    title: 'Arousal and Anxiety in Sport',
    accent: '#00ff7f',
    phaseId: 'phase-1',
    body: '10 multiple-choice questions on arousal, anxiety, stress, and regulation with answer-key explanations.',
    questionCount: 10,
    sourcePdf: './assets/readings/phase1-engine-content.pdf',
    questions: [
      {
        id: 'phase1-q1',
        question: 'An athlete describes their pre-competition state as "neutral energy," characterized by high heart rate and mental activation, yet they explicitly report an absence of worry or apprehension. Which concept is being described?',
        choices: ['State Anxiety', 'Arousal', 'Trait Anxiety', 'Cognitive Stress'],
        answerIndex: 1,
        explanation: 'The source defines arousal as neutral energy and a blend of physiological and psychological activation. Because the athlete does not report worry or apprehension, this is not anxiety.'
      },
      {
        id: 'phase1-q2',
        question: 'Two Olympic sprinters face the same qualifying heat. Sprinter A views the event as a minor hurdle, while Sprinter B views the same event as a significant threat to their self-worth. This difference in perception is primarily driven by a difference in:',
        choices: ['Somatic Activation', 'State Anxiety', 'Trait Anxiety', 'Attentional Control'],
        answerIndex: 2,
        explanation: 'Trait anxiety is the stable personality disposition that makes some people more likely to interpret objectively similar demands as threatening. State anxiety is the result of that appraisal, not the underlying cause.'
      },
      {
        id: 'phase1-q3',
        question: 'A professional golfer reports "butterflies" in their stomach, profuse sweating, and muscle tension immediately before a decisive putt. According to the Multidimensional Anxiety Theory, these are indicators of:',
        choices: ['Somatic State Anxiety', 'Cognitive State Anxiety', 'Attentional Search Patterns', 'Behavioral Consequences'],
        answerIndex: 0,
        explanation: 'Somatic state anxiety covers the moment-to-moment physical sensations of activation such as sweating, butterflies, and muscle tension. Cognitive state anxiety refers to worry, self-talk, and apprehensive thought.'
      },
      {
        id: 'phase1-q4',
        question: 'Within the Four-Stage Stress Process, which stage is identified as the "Pivot Point" where a demand is appraised as either a challenge or a threat?',
        choices: ['Environmental Demand (Stage 1)', 'Individual\'s Perception of Demand (Stage 2)', 'Stress Response (Stage 3)', 'Behavioral Consequences (Stage 4)'],
        answerIndex: 1,
        explanation: 'Stage 2, Perception of Demand, is the pivot point because the athlete interprets the objective load as manageable or threatening there. That appraisal determines whether the later stress response escalates or stays controlled.'
      },
      {
        id: 'phase1-q5',
        question: 'Which hypothesis postulates that an athlete\'s performance will increase up to an optimal midpoint of arousal, after which any further increase in arousal will cause a gradual decline in performance?',
        choices: ['Drive Theory', 'Catastrophe Phenomenon', 'Inverted-U Hypothesis', 'Individualized Zones of Optimal Functioning (IZOF)'],
        answerIndex: 2,
        explanation: 'The Inverted-U Hypothesis describes a curvilinear relationship where performance peaks at a moderate level of arousal and then declines as arousal keeps rising. Drive Theory is the simpler linear model that this question rules out.'
      },
      {
        id: 'phase1-q6',
        question: 'Athlete X requires a very high level of state anxiety to perform at their peak, while Athlete Y performs best when state anxiety is extremely low. This phenomenon, which argues that optimal arousal is not always a midpoint, is known as:',
        choices: ['Reversal Theory', 'Individualized Zones of Optimal Functioning (IZOF)', 'The Inverted-U Hypothesis', 'Drive Theory'],
        answerIndex: 1,
        explanation: 'IZOF argues that athletes have different personal bandwidths for best performance. It rejects the assumption that everyone shares the same ideal midpoint of arousal.'
      },
      {
        id: 'phase1-q7',
        question: 'According to the Catastrophe Model, what is the predicted outcome when an athlete experiences high cognitive state anxiety (worry) combined with physiological arousal that exceeds their optimal threshold?',
        choices: ['A gradual, linear decline in performance.', 'A rapid, dramatic performance crash that is difficult to reverse.', 'A shift into a facilitative flow state.', 'A steady improvement in performance due to high drive.'],
        answerIndex: 1,
        explanation: 'The Catastrophe Model predicts a cliff-edge drop rather than a smooth slide when high worry and high arousal combine. Recovery is difficult and usually requires relaxation, cognitive reset, and controlled reactivation.'
      },
      {
        id: 'phase1-q8',
        question: 'When an athlete becomes over-aroused and experiences tunnel vision, focusing exclusively on a narrow central task while failing to detect critical peripheral cues, they are suffering from:',
        choices: ['Attentional Narrowing', 'Too Broad / Distracted focus', 'Internal Focus', 'Broad External Focus'],
        answerIndex: 0,
        explanation: 'Attentional narrowing is the system fault created by high arousal. The athlete filters too aggressively and loses access to relevant peripheral information.'
      },
      {
        id: 'phase1-q9',
        question: 'Why is rhythmic diaphragmatic breathing, known as Centering, classified as a manual override in the Elite Operator Toolkit?',
        choices: ['It is the only physiological function under both voluntary and autonomic control.', 'It functions as a motivational cue word to increase intensity.', 'It serves as a cognitive restructuring technique to eliminate worry.', 'It is a strategy used exclusively for psyching up the nervous system.'],
        answerIndex: 0,
        explanation: 'Breathing is uniquely positioned under both voluntary and autonomic control, which lets the athlete directly interrupt the stress loop and send a safety signal back through the system.'
      },
      {
        id: 'phase1-q10',
        question: 'According to Martens (1987), which two factors are the primary situational sources of stress in competitive environments?',
        choices: ['Trait Anxiety and Self-Esteem', 'Event Importance and Uncertainty', 'Social Facilitation and Arousal', 'Motivation and Goal Specificity'],
        answerIndex: 1,
        explanation: 'Martens identifies event importance and uncertainty as the two main situational stressors. Personal variables such as trait anxiety and self-esteem matter too, but they are not the situational sources asked for here.'
      }
    ]
  },
  {
    id: 'quiz-phase2-integrated-discipline',
    code: 'Quiz 02',
    title: 'Integrated Discipline and Motivation Quality',
    accent: '#f59e0b',
    phaseId: 'phase-2',
    body: '10 multiple-choice questions on self-determination, values, mindset, recovery, and social context in sustainable discipline.',
    questionCount: 10,
    sourcePdf: './assets/readings/phase2-drive-content.pdf',
    questions: [
      {
        id: 'phase2-q1',
        question: 'In the chapter, what is the distinction between the direction and the intensity of motivation?',
        choices: [
          'Direction explains how much effort is available, while intensity explains whether the person values the goal.',
          'Direction explains where effort is aimed, while intensity explains how much force is applied once the target is chosen.',
          'Direction refers to emotional arousal, while intensity refers to social pressure from other people.',
          'Direction refers to trait motivation, while intensity refers only to short-term state anxiety.'
        ],
        answerIndex: 1,
        explanation: 'The chapter opens by defining direction as where effort is aimed and intensity as how much force is applied once that target has been selected. The distinction matters because effort can be intense but misdirected.'
      },
      {
        id: 'phase2-q2',
        question: 'Which form of regulation best represents integrated discipline?',
        choices: [
          'Doing the work mainly to avoid punishment or gain an external reward.',
          'Doing the work because guilt and shame make stopping feel unacceptable.',
          'Doing the work because the behavior now fits personal values and identity.',
          'Doing the work only when the task feels fun in the moment.'
        ],
        answerIndex: 2,
        explanation: 'Integrated regulation is the most autonomous form of extrinsic motivation. The behavior may still be hard, but it feels self-endorsed because it aligns with values and identity.'
      },
      {
        id: 'phase2-q3',
        question: 'According to self-determination theory, which set of needs supports movement toward more self-determined motivation?',
        choices: [
          'Autonomy, competence, and relatedness',
          'Confidence, discipline, and consistency',
          'Intensity, resilience, and self-esteem',
          'Reward, status, and belonging'
        ],
        answerIndex: 0,
        explanation: 'The chapter identifies autonomy, competence, and relatedness as the three basic psychological needs. When they are satisfied, motivation shifts toward ownership rather than control.'
      },
      {
        id: 'phase2-q4',
        question: 'What is the main psychological function of values in the chapter’s model of discipline?',
        choices: [
          'Values make hard tasks pleasant enough that motivation is no longer necessary.',
          'Values remove the need for recovery by making effort more meaningful.',
          'Values choose the direction of effort and move a task from “I should” toward “I choose.”',
          'Values guarantee intrinsic motivation whenever pressure rises.'
        ],
        answerIndex: 2,
        explanation: 'Values solve the direction problem. They connect behavior to a chosen standard or identity, which increases meaning and ownership without pretending the task becomes easy.'
      },
      {
        id: 'phase2-q5',
        question: 'How does a growth or incremental view of ability change the meaning of failure?',
        choices: [
          'Failure becomes evidence that the person lacks natural talent and should protect self-worth.',
          'Failure becomes proof that external rewards are not strong enough.',
          'Failure becomes process data about strategy, preparation, or current method.',
          'Failure stops mattering because effort alone is always enough.'
        ],
        answerIndex: 2,
        explanation: 'Under a growth view, failure is interpreted as information about process, strategy, or preparation rather than a verdict on the whole self.'
      },
      {
        id: 'phase2-q6',
        question: 'Which statement best captures the chapter’s distinction between guilt and shame?',
        choices: [
          'Guilt attacks the self, while shame focuses on a correctable behavior.',
          'Guilt focuses on a behavior that can be repaired, while shame frames the self as globally flawed.',
          'Guilt and shame are treated as interchangeable forms of useful accountability.',
          'Guilt is always maladaptive, while shame is the stronger motivational tool.'
        ],
        answerIndex: 1,
        explanation: 'The chapter argues that guilt can support repair because it targets behavior, while shame tends to trigger hiding or defensiveness because it frames the self as the problem.'
      },
      {
        id: 'phase2-q7',
        question: 'What makes authentic pride more stable than hubristic pride?',
        choices: [
          'Authentic pride is rooted in controllable causes like effort and preparation rather than superiority narratives.',
          'Authentic pride depends on public admiration, while hubristic pride depends on private effort.',
          'Authentic pride ignores feedback, while hubristic pride seeks it.',
          'Authentic pride is always intrinsic, while hubristic pride is always extrinsic.'
        ],
        answerIndex: 0,
        explanation: 'Authentic pride is built on controllable causes such as effort, skill, and preparation. That makes setbacks less threatening than pride built on fixed superiority.'
      },
      {
        id: 'phase2-q8',
        question: 'Which goal type usually offers the best protection for execution under pressure?',
        choices: [
          'Outcome goals because they keep attention on the final result',
          'Performance goals because they compare the athlete to other people',
          'Process goals because they target controllable actions, cues, and routines',
          'Identity goals because they remove the need for feedback'
        ],
        answerIndex: 2,
        explanation: 'The chapter treats process goals as the most stabilizing under pressure because they focus attention on controllable execution rather than uncontrollable outcomes.'
      },
      {
        id: 'phase2-q9',
        question: 'What is the key difference between functional overreaching and overtraining syndrome?',
        choices: [
          'Functional overreaching is a planned short-term dip followed by recovery, while overtraining syndrome is a long-term maladaptive breakdown state.',
          'Functional overreaching only affects beginners, while overtraining syndrome only affects elite athletes.',
          'Functional overreaching is psychological, while overtraining syndrome is only physical.',
          'Functional overreaching improves performance immediately, while overtraining syndrome improves it later.'
        ],
        answerIndex: 0,
        explanation: 'Functional overreaching is a temporary, planned overload that rebounds with recovery. Overtraining syndrome reflects a much deeper breakdown with prolonged performance decline and broader cognitive or physiological costs.'
      },
      {
        id: 'phase2-q10',
        question: 'What does the person-by-situation view add to the chapter’s understanding of discipline and motivation?',
        choices: [
          'It shows that the same motivational style works equally well for everyone in the same environment.',
          'It argues that social context matters less than personality once goals are specific.',
          'It shows that behavior depends on both the person and the setting, so coaching and accountability should be matched rather than universalized.',
          'It proves that team environments are always better than individual work for building grit.'
        ],
        answerIndex: 2,
        explanation: 'The chapter uses the person-by-situation view to show that the same environment can energize one performer and inhibit another. Good coaching diagnoses the person before choosing the social setup.'
      }
    ]
  },
  {
    id: 'quiz-phase3-focus-under-pressure',
    code: 'Quiz 03',
    title: 'Focus Under Pressure',
    accent: '#10b981',
    phaseId: 'phase-3',
    body: '12 multiple-choice questions on attentional control, the Inner Game, preparation, and refocus routines under pressure.',
    questionCount: 12,
    sourcePdf: './assets/readings/phase3-focus-content.pdf',
    questions: [
      {
        id: 'phase3-q1',
        question: 'Which statement best describes concentration in sport performance?',
        choices: [
          'Trying harder than everyone else.',
          'Selecting, sustaining, noticing, and shifting attention to the right cues.',
          'Eliminating all emotion before competition.',
          'Thinking about mechanics on every repetition.'
        ],
        answerIndex: 1,
        explanation: 'The chapter defines concentration as a control process: athletes select the right cue, stay with it, notice change, and shift when the task changes.'
      },
      {
        id: 'phase3-q2',
        question: 'In this chapter, attentional capacity refers to:',
        choices: [
          'The amount of pain an athlete can tolerate.',
          'The speed at which arousal rises.',
          'The limited amount of information a performer can process at one time.',
          'The number of routines an athlete memorizes.'
        ],
        answerIndex: 2,
        explanation: 'Capacity means bandwidth. Pressure, mechanics, strategy, and emotion can overload that limited mental space.'
      },
      {
        id: 'phase3-q3',
        question: 'Which example best fits broad-external attention?',
        choices: [
          'Feeling shoulder tension before a serve.',
          'Scanning spacing, defenders, and options before making a pass.',
          'Repeating a cue word during a lift.',
          'Locking eyes on the back rim during a free throw.'
        ],
        answerIndex: 1,
        explanation: 'Broad-external attention scans the environment for tactical information such as spacing, opponents, timing, and field position.'
      },
      {
        id: 'phase3-q4',
        question: 'Narrow-internal attention is most useful when the athlete needs to:',
        choices: [
          'Read the whole competitive environment.',
          'Regulate breath, body tone, or timing before execution.',
          'React to crowd noise.',
          'Evaluate the final result after competition.'
        ],
        answerIndex: 1,
        explanation: 'Narrow-internal attention is the regulation quadrant. It is used for breath, grip pressure, body tone, tempo, and centering.'
      },
      {
        id: 'phase3-q5',
        question: "Gallwey's performance equation states that performance equals:",
        choices: [
          'Confidence plus effort.',
          'Potential minus interference.',
          'Talent plus repetition.',
          'Preparation minus fatigue.'
        ],
        answerIndex: 1,
        explanation: 'Gallwey argues that performance falls when interference such as judgment, fear, and overcontrol subtracts from potential.'
      },
      {
        id: 'phase3-q6',
        question: 'Self 1 is best described as the:',
        choices: [
          'Automatic, sensory performer.',
          'Verbal, analytical judge that labels and evaluates.',
          'Physiological arousal system.',
          'Support network around the athlete.'
        ],
        answerIndex: 1,
        explanation: 'Self 1 is the teller and judge. Self 2 is the embodied performer that runs the learned skill when interference stays low.'
      },
      {
        id: 'phase3-q7',
        question: 'Which response best reflects nonjudgmental thinking after a mistake?',
        choices: [
          'I always choke under pressure.',
          'That proves I am not built for this.',
          'I was late on contact; next rep eyes on the target.',
          'Do not miss again or you will blow it.'
        ],
        answerIndex: 2,
        explanation: 'Nonjudgmental language describes what happened in usable terms and redirects attention to the next controllable cue.'
      },
      {
        id: 'phase3-q8',
        question: 'The main job of a good preperformance routine is to:',
        choices: [
          'Guarantee perfect calm.',
          'Shift attention onto controllable, task-relevant cues.',
          'Build as much intensity as possible.',
          'Analyze technique in detail during execution.'
        ],
        answerIndex: 1,
        explanation: 'The chapter treats routines as attentional transfer systems that move the athlete from life noise into performance readiness.'
      },
      {
        id: 'phase3-q9',
        question: 'What-if planning improves focus because it:',
        choices: [
          'Removes the need for practice.',
          'Pre-decides how to respond to likely distractions or disruptions.',
          'Makes pressure disappear.',
          'Prevents all attentional narrowing.'
        ],
        answerIndex: 1,
        explanation: 'What-if plans reduce surprise by deciding the response to bad calls, noise, delays, or early mistakes before they happen.'
      },
      {
        id: 'phase3-q10',
        question: 'An instructional cue word differs from a motivational cue word because it:',
        choices: [
          'Refines movement or technique rather than raising effort level.',
          'Is only used in practice, never in competition.',
          'Always increases arousal more strongly.',
          'Replaces the need for an external target.'
        ],
        answerIndex: 0,
        explanation: 'Instructional cues organize mechanics; motivational cues raise effort or activation when intensity drops.'
      },
      {
        id: 'phase3-q11',
        question: 'Centering and external anchors help under pressure by:',
        choices: [
          'Pulling attention back to the present and reducing mental noise.',
          'Increasing self-criticism so technique stays sharp.',
          'Keeping attention on the last mistake.',
          'Expanding attention to every possible cue.'
        ],
        answerIndex: 0,
        explanation: 'A slow exhale and a simple outside cue move attention away from worry and back to the present task.'
      },
      {
        id: 'phase3-q12',
        question: 'An anxious free-throw shooter who overthinks in games would likely benefit most from:',
        choices: [
          'More outcome-focused self-talk.',
          'A short breath-cue-target routine practiced under pressure.',
          'Constant mechanical instructions during the shot.',
          'Avoiding all rehearsal before competition.'
        ],
        answerIndex: 1,
        explanation: 'The chapter recommends a repeatable breath-cue-target routine that is trained under pressure until it becomes the default refocus response.'
      }
    ]
  },
  {
    id: 'quiz-phase4-winning-the-first-victory',
    code: 'Quiz 04',
    title: 'Winning the First Victory',
    accent: '#8b5cf6',
    phaseId: 'phase-4',
    body: '12 multiple-choice questions on confidence, protective thinking, C-B-A routines, and multisensory envisioning.',
    questionCount: 12,
    sourcePdf: './assets/slides/04-toolkit.pdf',
    questions: [
      {
        id: 'phase4-q1',
        question: 'In this chapter, practical confidence is best defined as:',
        choices: [
          'A personality trait that some performers are born with.',
          'A sense of certainty that allows a learned skill to be executed with less conscious interference.',
          'The absence of all physiological arousal before an event.',
          'The public display of boldness and intensity.'
        ],
        answerIndex: 1,
        explanation: 'Confidence is treated as functional certainty that quiets overanalysis and lets a learned skill run more automatically.'
      },
      {
        id: 'phase4-q2',
        question: 'Which confidence-related construct is the most task-specific?',
        choices: [
          'Trait confidence',
          'Robust sport confidence',
          'Self-efficacy',
          'General optimism'
        ],
        answerIndex: 2,
        explanation: 'Self-efficacy is a situation- and task-specific judgment of capability, not a broad personality trait.'
      },
      {
        id: 'phase4-q3',
        question: 'According to the confidence account metaphor, which option is a deposit?',
        choices: [
          'Replaying criticism after practice',
          'Noticing effort and small progress from the day',
          'Treating one bad rep as proof you are not ready',
          'Predicting disaster before competition'
        ],
        answerIndex: 1,
        explanation: 'Effort and progress count as deposits because they provide usable evidence that the performer is moving forward.'
      },
      {
        id: 'phase4-q4',
        question: 'What is the main job of the mental filter?',
        choices: [
          'Remove all emotion from performance',
          'Make every memory feel equally important',
          'Approve useful deposits and reframe or block withdrawals',
          'Eliminate the need for practice'
        ],
        answerIndex: 2,
        explanation: 'The mental filter decides what is retained as confidence-building evidence and what gets reframed as learning instead of damage.'
      },
      {
        id: 'phase4-q5',
        question: 'Constructive attitude lockdown treats an error as:',
        choices: [
          'Permanent, global, and diagnostic of identity',
          'Temporary, limited, and nonrepresentative of the whole self',
          'Proof that confidence was fake',
          'Something that should never be discussed again'
        ],
        answerIndex: 1,
        explanation: 'Lockdown prevents one error from becoming a story about the whole self by containing it to time, area, and meaning.'
      },
      {
        id: 'phase4-q6',
        question: 'The flat tire drill is designed to:',
        choices: [
          'Focus only on perfect outcomes',
          'Eliminate the possibility of setbacks',
          'Rehearse adversity and a composed response before it happens',
          'Replace physical preparation with mental rehearsal'
        ],
        answerIndex: 2,
        explanation: 'The drill prepares the mind for adversity so the response feels rehearsed rather than improvised under pressure.'
      },
      {
        id: 'phase4-q7',
        question: 'The step "Attach your attention" in the C-B-A routine means:',
        choices: [
          'Thinking harder about mechanics while you perform',
          'Focusing on an external cue or target so trained action can run',
          'Scanning the crowd to calm yourself down',
          'Repeating multiple affirmations while the action is unfolding'
        ],
        answerIndex: 1,
        explanation: 'The final step shifts attention outward so the performer stops self-monitoring and lets trained action take over.'
      },
      {
        id: 'phase4-q8',
        question: 'Why can reinterpreting butterflies improve confidence?',
        choices: [
          'Because arousal disappears when you relabel it',
          'Because the body stops releasing energy when you breathe',
          'Because the same activation can be understood as readiness instead of threat',
          'Because only weak performers feel butterflies'
        ],
        answerIndex: 2,
        explanation: 'Activation itself is not automatically bad; interpretation determines whether it becomes threat or fuel.'
      },
      {
        id: 'phase4-q9',
        question: 'Effective imagery differs from ordinary daydreaming because it is:',
        choices: [
          'Multisensory, controlled, emotional, and intentionally linked to performance',
          'Always vague so it stays positive',
          'Useful only after the event, not before it',
          'Limited to visual detail alone'
        ],
        answerIndex: 0,
        explanation: 'Effective envisioning is deliberate practice rather than passive fantasy. It includes multiple senses, emotion, control, and task relevance.'
      },
      {
        id: 'phase4-q10',
        question: 'Which imagery perspective is usually strongest for feeling timing and movement from inside the action?',
        choices: [
          'External / third person',
          'Statistical / analytical',
          'Internal / first person',
          'Verbal / linguistic'
        ],
        answerIndex: 2,
        explanation: 'First-person imagery usually gives the strongest sense of timing, kinesthetic feel, and emotional realism.'
      },
      {
        id: 'phase4-q11',
        question: 'If a negative image appears during rehearsal, the recommended response is to:',
        choices: [
          'Let it run so you get used to failure',
          'Ignore it and hope it goes away',
          'Cut it, rewind, and overwrite it with the correct action',
          'Stop using imagery altogether'
        ],
        answerIndex: 2,
        explanation: 'Controllability matters. Negative scenes should be corrected rather than replayed repeatedly.'
      },
      {
        id: 'phase4-q12',
        question: 'Why does real-time rehearsal matter?',
        choices: [
          'It prevents emotion from entering the scene',
          'It helps the mental blueprint match the temporal demands of the real task',
          'It makes every skill look faster',
          'It works only for team sports'
        ],
        answerIndex: 1,
        explanation: 'Real-time rehearsal helps the brain build a blueprint that fits the pace and rhythm of the actual event.'
      }
    ]
  }
];

const PHASE_CONTENT = {
  'phase-1': {
    eyebrow: 'Phase 1 lesson',
    heading: 'Mastering the Performance State',
    subheading: 'A Comprehensive Study Guide on Arousal, Stress, and Anxiety',
    summary: 'This lesson explains how elite performers regulate energy, attention, and control under pressure instead of trying to eliminate pressure entirely.',
    sourcePdf: './assets/readings/phase1-engine-content.pdf',
    quizId: 'quiz-phase1-performance-state',
    keyIdeas: [
      'Build a clear mental model of arousal, stress, and anxiety.',
      'See why attention and coordination change under pressure.',
      'Learn practical regulation tools that move performance back toward control.'
    ],
    sections: [
      {
        title: 'Inside This Chapter',
        paragraphs: [
          'The central task is not to eliminate arousal or pressure, but to regulate them so that energy, attention, and execution stay aligned with the demands of the moment.',
          'A repeated pattern runs through the lesson: environmental demands are filtered through perception, which shapes arousal, anxiety, attention, and ultimately performance. The best tools work because they help the performer regain a sense of control.'
        ],
        bullets: [
          'Foundations of mental fitness and the Ideal Performance State (IPS)',
          'How arousal, stress, and anxiety differ',
          'The four-stage stress process loop',
          'Major arousal-performance theories',
          'Sources of stress and anxiety in sport',
          'Why arousal changes coordination and attention',
          'Regulation tools: breathing, PMR, activation, cue words, and SMART goals'
        ]
      },
      {
        title: '1. Foundations of Mental Fitness',
        paragraphs: [
          'Mental fitness is the ability to regulate psychological and physiological states so they match the demands of sport, art, or academics. Unlike physical fitness, it emphasizes consistency, resilience, persistence, and focus.',
          'Elite performers often describe their best moments as "the zone" or flow. In practical terms, the Ideal Performance State is marked by supreme focus, effortless execution, and reproducibility.'
        ],
        bullets: [
          'Supreme focus: total absorption in the task',
          'Effortless execution: performance feels automatic and fluid',
          'Reproducibility: the state can be reached consistently, not just by accident',
          'Under-arousal can lead to apathy or boredom',
          'Overload and extreme pressure can lead to panic, disruption, and choking'
        ]
      },
      {
        title: '2. Defining the Key Constructs',
        paragraphs: [
          'Arousal is a blend of physiological and psychological activation. It describes intensity and can range from sleep to frenzy.',
          'Anxiety is a specifically negative emotional state marked by worry, apprehension, and perceived bodily activation.',
          'Stress is a substantial imbalance between demands and response capability when the consequences of failure matter.'
        ],
        bullets: [
          'Cognitive anxiety: worry, self-doubt, fear of failure',
          'Somatic anxiety: butterflies, sweating, shaky muscles, racing heart',
          'State anxiety is the right-now condition of the performer',
          'Trait anxiety is the stable tendency to interpret safe situations as threatening'
        ]
      },
      {
        title: '3. The Stress Process Loop',
        paragraphs: [
          'Stress unfolds as a cycle rather than a single event. A demand appears, the demand is interpreted, the body and mind react, and the resulting performance feeds back into the next experience.',
          'Perception of demand is the pivot point in the stress process. One person sees a challenge; another sees a threat.'
        ],
        bullets: [
          'Environmental demand: a contest, exam, performance, or evaluation',
          'Perception of demand: the interpretation of that event',
          'Stress response: arousal, anxiety, tension, and attentional change',
          'Behavioral consequences: the actual performance result',
          'Repeated threat interpretations can snowball unless regulation changes'
        ]
      },
      {
        title: '4. Theories of Arousal and Performance',
        paragraphs: [
          'Different theories explain performance changes under pressure in different ways. Some assume a shared pattern, some an individual pattern, and some allow for sudden collapse.'
        ],
        table: {
          headers: ['Theory', 'Description', 'Key takeaway'],
          rows: [
            ['Drive Theory', 'Suggests a direct linear relationship between arousal and performance.', 'Useful historically, but too simple for most real performance situations.'],
            ['Inverted-U', 'Performance rises to an optimal midpoint and then falls as arousal keeps increasing.', 'There is often a sweet spot rather than a "more is always better" rule.'],
            ['IZOF', 'Each athlete has an individual range of state anxiety that supports best performance.', 'The best zone is personal, not universal.'],
            ['Multidimensional Anxiety Theory', 'Proposes that cognitive anxiety hurts performance while somatic anxiety follows an inverted-U pattern.', 'Research support is mixed, especially when worry is assumed to always be harmful.'],
            ['Catastrophe Phenomenon', 'High cognitive anxiety plus high physiological arousal can trigger a sharp drop instead of a gentle decline.', 'Choking can be sudden and hard to reverse.'],
            ['Reversal Theory', 'The meaning attached to arousal changes its effect.', 'High activation can feel like excitement or anxiety depending on interpretation.'],
            ["Jones's Model", 'Anxiety is not automatically good or bad.', 'Perceived control determines whether anxiety feels facilitative or debilitative.']
          ]
        }
      },
      {
        title: '5. Sources of Stress and Anxiety',
        paragraphs: [
          'Stress can come from the situation itself or from personal dispositions that shape how the situation is interpreted.'
        ],
        table: {
          headers: ['Source type', 'Example', 'Why it matters'],
          rows: [
            ['Situational', 'Event importance', 'High-stakes contests, evaluations, and championships raise perceived pressure.'],
            ['Situational', 'Uncertainty', 'Unknown outcomes and unclear evaluations make situations more stressful.'],
            ['Personal', 'Trait anxiety', 'Highly trait-anxious people interpret more situations as threatening.'],
            ['Personal', 'Self-esteem', 'Lower self-esteem is linked to higher state anxiety.'],
            ['Personal', 'Social physique anxiety', 'Concern about body evaluation can elevate stress in performance and fitness settings.']
          ]
        }
      },
      {
        title: '6. Why Arousal Changes Performance',
        paragraphs: [
          'Arousal and state anxiety change performance through coordination and attention. High stress can increase soreness, fatigue, and unwanted muscle tension, making movement feel tight or overcontrolled.',
          'At low arousal, attention is often too broad and distractible. At an optimal level, attention narrows enough to filter out noise. At very high arousal, attention can narrow too far and create tunnel vision.'
        ]
      },
      {
        title: '7. The Elite Operator Toolkit',
        paragraphs: [
          'Elite athletes are not defined by the absence of stress. They stand out because they detect changes in arousal quickly and regulate them faster than less skilled performers.'
        ],
        bullets: [
          'Breathing: deep rhythmic diaphragmatic breathing acts like a manual reset',
          'Activation and relaxation: PMR reduces excess tension, while music, movement, and imagery can raise low energy',
          'Cue words: instructional cues target mechanics; motivational cues lift effort and intensity',
          'SMART goals: process goals are the most stabilizing because they are the most controllable'
        ],
        table: {
          headers: ['When you notice...', 'Likely issue', 'Best first move'],
          rows: [
            ['Flat energy or boredom', 'Under-arousal', 'Activate with movement, rhythm, music, or imagery.'],
            ['Tight muscles and racing thoughts', 'Over-arousal', 'Slow the breath and reduce somatic tension.'],
            ['Sloppy mechanics', 'Attention is drifting', 'Use one instructional cue word.'],
            ['Effort fading late', 'Intensity drop', 'Use a motivational cue and a process goal.']
          ]
        }
      },
      {
        title: 'Glossary of Key Terms',
        glossary: [
          ['Arousal', 'A blend of physiological and psychological activity that reflects intensity of motivation at a particular moment.'],
          ['Anxiety', 'A negative emotional state characterized by nervousness, worry, and apprehension associated with bodily activation.'],
          ['Catastrophe Model', 'A model proposing that performance can suddenly decline when high cognitive anxiety combines with high physiological arousal.'],
          ['Cognitive State Anxiety', 'The degree to which a person experiences negative thoughts and worry in the moment.'],
          ['Debilitative Anxiety', 'Anxiety interpreted as harmful to performance.'],
          ['Facilitative Anxiety', 'Anxiety interpreted as helpful or energizing for performance.'],
          ['Ideal Performance State (IPS)', 'A state of supreme focus and effortless execution often referred to as the zone.'],
          ['IZOF', 'The idea that each athlete has a personal range of state anxiety linked to best performance.'],
          ['Inverted-U Hypothesis', 'A theory stating that performance is best at a moderate level of arousal and poorer at very high or very low levels.'],
          ['Mental Fitness', 'The ability to regulate psychological and physiological states to meet environmental demands.'],
          ['Perception of Control', 'The degree to which a person believes they have the resources and ability to meet a challenge.'],
          ['Progressive Muscle Relaxation (PMR)', 'A technique that reduces physical tension through systematic muscle tensing and releasing.'],
          ['SMART Goals', 'Goals that are specific, measurable, achievable, relevant, and time-bound.'],
          ['Social Physique Anxiety', "Anxiety caused by the perception that others are evaluating one\'s body or physique."],
          ['Somatic State Anxiety', 'Moment-to-moment perceived physiological activation such as butterflies, sweating, or a racing heart.'],
          ['Stress', 'A substantial imbalance between demand and response capability under conditions where the consequences matter.'],
          ['Trait Anxiety', 'A personality disposition to perceive objectively non-dangerous situations as threatening.']
        ]
      }
    ]
  }
};

// DOCX-derived Phase 1 rebuild
PHASE_CONTENT['phase-1'] = {
  eyebrow: 'Phase 1 lesson',
  heading: 'Mastering the Performance State',
  subheading: 'A Comprehensive Study Guide on Arousal, Stress, and Anxiety',
  summary: '',
  sourcePdf: './assets/readings/phase1-engine-content.pdf',
  quizId: 'quiz-phase1-performance-state',
  heroFigure: {
    src: './assets/readings/phase1-figures/phase1-hero-athlete.png',
    alt: 'Mental performance athlete silhouette with focus, control, and execution themes',
    caption: 'Mental performance athlete visual built around focus, control, and execution.'
  },
  keyIdeas: [
    'Build a clear mental model of arousal, stress, and anxiety.',
    'See why attention and coordination change under pressure.',
    'Learn the practical tools that move you back toward control.'
  ],
  sections: [
    {
      title: 'Inside This Chapter',
      paragraphs: [
        'This guide synthesizes the core psychological principles that govern performance readiness. The central task is not to eliminate arousal or pressure, but to regulate them so that energy, attention, and execution stay aligned with the demands of the moment.'
      ]
    },
    {
      title: 'Chapter roadmap',
      bullets: [
        'Foundations of mental fitness and the Ideal Performance State (IPS)',
        'How arousal, stress, and anxiety differ',
        'The four-stage stress process loop',
        'Major arousal-performance theories',
        'Sources of stress and anxiety in sport',
        'Why arousal changes coordination and attention',
        'Regulation tools: breathing, PMR, activation, cue words, and SMART goals',
        'Practice quiz, answer key, and glossary'
      ]
    },
    {
      title: 'Study focus',
      paragraphs: [
        'Notice the repeated pattern running through the chapter: environmental demands are filtered through perception, which shapes arousal, anxiety, attention, and ultimately performance. The best tools work because they help the performer regain a sense of control.'
      ]
    },
    {
      title: '1. Foundations of Mental Fitness',
      paragraphs: [
        'Mental fitness is the ability to regulate psychological and physiological states so they match the demands of sport, art, or academics. Unlike physical fitness, which emphasizes bodily capacity, mental fitness emphasizes consistency, resilience, persistence, and focus.',
        'Elite performers often describe their best moments as entering the zone or a state of flow. In this state, attention is highly stable, action feels smooth rather than forced, and performance becomes easier to reproduce.',
        'In practical terms, the Ideal Performance State is recognizable through three recurring markers.',
        'Performance can drift away from the ideal state in two directions. Too little arousal produces flatness and boredom. Too much pressure can generate panic, disruption, and even choking.'
      ],
      bullets: [
        'Supreme focus: total absorption in the task.',
        'Effortless execution: performance feels automatic and fluid.',
        'Reproducibility: the state can be reached consistently, not just by accident.',
        'Apathy / boredom: under-arousal or too little challenge pulls the performer below the ideal state.',
        'Panic / choking: extreme pressure and overload push performance toward collapse.'
      ],
      figures: [
        {
          src: './assets/readings/phase1-figures/phase1-arousal-continuum.png',
          alt: 'Arousal continuum and middle performance zone',
          caption: 'Figure 1. Arousal lives on a continuum. Peak performance often sits inside a controllable middle zone.'
        }
      ]
    },
    {
      title: '2. Defining the Key Constructs',
      paragraphs: [
        'Sport psychologists separate arousal, anxiety, and stress because each describes a different part of the performance picture. Keeping the terms distinct makes it easier to diagnose what is happening and select the right regulation strategy.',
        'Anxiety has cognitive and somatic components.',
        'State anxiety versus trait anxiety is one of the most important practical distinctions in the chapter.'
      ],
      bullets: [
        'Cognitive anxiety: the cognitive component includes negative thoughts, worry, self-doubt, and fear of failure.',
        'Somatic anxiety: the somatic component refers to perceived physiological activation such as butterflies, sweating, shaky muscles, and a racing heart.',
        'State anxiety is the right now emotional condition of the performer.',
        'Trait anxiety is the stable tendency to interpret objectively safe situations as threatening.'
      ],
      table: {
        headers: ['Arousal', 'Anxiety', 'Stress'],
        rows: [
          [
            'A blend of physiological and psychological activation. It is the intensity level of motivation at a given moment, and it can range from sleep to frenzy.',
            'A specifically negative emotional state marked by worry, apprehension, and perceived bodily activation.',
            'A substantial imbalance between demands and response capability when the consequences of failure matter.'
          ],
          [
            'Quick distinction',
            'State anxiety is the right now emotional condition of the performer.',
            'Trait anxiety is the stable tendency to interpret objectively safe situations as threatening.'
          ]
        ]
      }
    },
    {
      title: '3. The Stress Process Loop',
      paragraphs: [
        'Stress unfolds as a cycle rather than a single event. A demand appears, the demand is interpreted, the body and mind react, and the resulting performance feeds back into the next experience.',
        'Figure 2. Perception of demand is the pivot point in the stress process.'
      ],
      bullets: [
        'Environmental demand: Stage 1 begins with an environmental demand such as a penalty kick, a difficult exam, or a public performance.',
        'Perception of demand: Stage 2 is the evaluation of that demand. One person sees a challenge; another sees a threat.',
        'Stress response: Stage 3 includes the stress response itself: rising arousal, state anxiety, muscle tension, and attentional changes.',
        'Behavioral consequences: Stage 4 is the behavioral consequence, the actual performance result, which then shapes future demands.'
      ],
      figures: [
        {
          src: './assets/readings/phase1-figures/phase1-stress-process.png',
          alt: 'Stress process loop diagram',
          caption: 'Figure 2. Perception of demand is the pivot point in the stress process.'
        }
      ],
      table: {
        headers: ['Why the loop matters', 'Explanation'],
        rows: [
          [
            'Why the loop matters',
            'If a performer repeatedly interprets pressure situations as threats and then performs poorly, that outcome becomes part of the next loop. The cycle can snowball unless interpretation or regulation changes.'
          ]
        ]
      }
    },
    {
      title: '4. Theories of Arousal and Performance',
      paragraphs: [
        'Several theories try to explain how arousal and anxiety influence performance. The key difference between them is whether they assume a universal pattern, an individual pattern, or the possibility of sudden collapse under pressure.',
        'Jones\' model adds one more important lens: anxiety is not automatically good or bad. Its impact depends on whether the athlete perceives enough control and resources to meet the challenge.'
      ],
      figures: [
        {
          src: './assets/readings/phase1-figures/phase1-arousal-theories.png',
          alt: 'Comparison of arousal and performance theories',
          caption: 'Figure 3. Major theories offer different models of how arousal relates to performance.'
        }
      ],
      table: {
        headers: ['Theory', 'Description', 'Key takeaway'],
        rows: [
          ['Drive Theory', 'A direct linear relationship between arousal and performance.', 'Useful historically, but too simple for most real performances.'],
          ['Inverted-U', 'Performance rises to an optimal midpoint and then falls as arousal keeps increasing.', 'There is often a sweet spot rather than a more is always better rule.'],
          ['IZOF', 'Each athlete has an individual range of state anxiety that supports best performance.', 'The best zone is personal, not universal.'],
          ['Multidimensional Anxiety Theory', 'Cognitive anxiety is proposed to hurt performance while somatic anxiety follows an inverted-U pattern.', 'Research support is mixed, especially for the idea that worry always harms performance.'],
          ['Catastrophe Phenomenon', 'High cognitive anxiety plus high physiological arousal can trigger a sharp drop instead of a gentle decline.', 'Choking can be sudden and hard to reverse.'],
          ['Reversal Theory', 'The meaning attached to arousal changes its effect.', 'High activation can feel like excitement or like anxiety depending on interpretation.'],
          ['Jones\' model', 'Anxiety is not automatically good or bad.', 'Its impact depends on whether the athlete perceives enough control and resources to meet the challenge.']
        ]
      }
    },
    {
      title: '5. Sources of Stress and Anxiety',
      paragraphs: [
        'Stress can originate in the situation itself or in personal dispositions that shape how the situation is interpreted.'
      ],
      table: {
        headers: ['Source type', 'Example', 'Why it matters'],
        rows: [
          ['Situational', 'Event importance', 'High-stakes contests, evaluations, and championships raise perceived pressure.'],
          ['Situational', 'Uncertainty', 'Unknown outcomes and unclear evaluations make situations more stressful.'],
          ['Personal', 'Trait anxiety', 'Highly trait-anxious people interpret more situations as threatening.'],
          ['Personal', 'Self-esteem', 'Lower self-esteem is linked to higher state anxiety.'],
          ['Personal', 'Social physique anxiety', 'Worry about how others evaluate one\'s body can elevate stress in performance and fitness settings.']
        ]
      }
    },
    {
      title: '6. Why Arousal Changes Performance',
      paragraphs: [
        'Arousal and state anxiety influence performance through at least two important pathways: coordination and attention.',
        'High stress can increase soreness, fatigue, and unwanted muscle tension. Movements that are normally coordinated begin to feel tight, choppy, or overcontrolled.',
        'At low arousal, attention is often too broad and distractible. At an optimal level, attention narrows just enough to filter out noise. At very high arousal, attention may narrow too far, creating tunnel vision.',
        'Figure 4. Attention must narrow enough to focus, but not so much that critical cues disappear.'
      ],
      figures: [
        {
          src: './assets/readings/phase1-figures/phase1-attention-field-topdown.png',
          alt: 'Attention field narrowing under arousal',
          caption: 'Figure 4. Attention must narrow enough to focus but not so much that critical cues disappear.'
        }
      ]
    },
    {
      title: '7. The Elite Operator Toolkit',
      paragraphs: [
        'Elite athletes are not defined by the absence of stress. They stand out because they detect changes in arousal quickly and regulate them faster than less skilled performers.',
        'Figure 5. Regulation tools are practical methods for tuning the performance state.',
        'The more controllable the goal, the more stabilizing it becomes under pressure.'
      ],
      bullets: [
        'Tool 1: Breathing. Deep rhythmic diaphragmatic breathing acts like a manual reset. Because breathing can be influenced voluntarily, it can interrupt the stress response and anchor attention in the present.',
        'Tool 2: Activation and relaxation. Progressive Muscle Relaxation (PMR) reduces excess somatic tension by systematically tensing and releasing muscle groups. Activation strategies such as music, movement, and imagery raise arousal when energy is too low.',
        'Tool 3: Cue words. Instructional cue words target mechanics, such as smooth or follow through, when execution is sloppy. Motivational cue words, such as explode or dig deep, lift effort when energy fades.',
        'Tool 4: SMART goals. Goals reduce anxiety when they move attention from the uncontrollable to the controllable: outcome goals create pressure, performance goals offer partial control, and process goals give the most stability.'
      ],
      figures: [
        {
          src: './assets/readings/phase1-figures/phase1-regulation-tools.png',
          alt: 'Regulation tools for tuning the performance state',
          caption: 'Figure 5. Regulation tools are practical methods for tuning the performance state.'
        },
        {
          src: './assets/readings/phase1-figures/phase1-goal-control.png',
          alt: 'Goal controllability figure',
          caption: 'Figure 6. The more controllable the goal, the more stabilizing it becomes under pressure.'
        }
      ],
      table: {
        headers: ['When you notice...', 'Likely issue', 'Best first move'],
        rows: [
          ['Flat energy or boredom', 'Under-arousal', 'Activate with movement, rhythm, music, or imagery.'],
          ['Tight muscles and racing thoughts', 'Over-arousal', 'Slow the breath and reduce somatic tension.'],
          ['Sloppy mechanics', 'Attention is drifting', 'Use one instructional cue word.'],
          ['Effort fading late', 'Intensity drop', 'Use a motivational cue and process goal.']
        ]
      }
    },
    {
      title: 'Glossary of Key Terms',
      paragraphs: [
        'Core vocabulary for quick review.'
      ],
      glossary: [
        ['Arousal', 'A blend of physiological and psychological activity that reflects the intensity of motivation at a particular moment.'],
        ['Anxiety', 'A negative emotional state characterized by nervousness, worry, and apprehension associated with bodily activation.'],
        ['Catastrophe Model', 'A model proposing that performance can suddenly decline when high cognitive anxiety combines with high physiological arousal.'],
        ['Cognitive State Anxiety', 'The degree to which a person experiences negative thoughts and worry in the moment.'],
        ['Debilitative Anxiety', 'Anxiety interpreted as harmful to performance.'],
        ['Facilitative Anxiety', 'Anxiety interpreted as helpful or energizing for performance.'],
        ['Ideal Performance State (IPS)', 'A state of supreme focus and effortless execution often referred to as the zone.'],
        ['Individualized Zones of Optimal Functioning (IZOF)', 'The idea that each athlete has a personal range of state anxiety linked to best performance.'],
        ['Inverted-U Hypothesis', 'A theory stating that performance is best at a moderate level of arousal and poorer at very high or very low levels.'],
        ['Mental Fitness', 'The ability to regulate psychological and physiological states to meet environmental demands.'],
        ['Perception of Control', 'The degree to which a person believes they have the resources and ability to meet a challenge.'],
        ['Progressive Muscle Relaxation (PMR)', 'A technique that reduces physical tension through systematic muscle tensing and releasing.'],
        ['SMART Goals', 'Goals that are specific, measurable, achievable, relevant, and time-bound.'],
        ['Social Physique Anxiety', 'Anxiety caused by the perception that others are evaluating one\'s body or physique.'],
        ['Somatic State Anxiety', 'Moment-to-moment perceived physiological activation such as butterflies, sweating, or a racing heart.'],
        ['Stress', 'A substantial imbalance between demand and response capability under conditions where the consequences matter.'],
        ['Trait Anxiety', 'A stable disposition that makes some people more likely to perceive situations as threatening.']
      ]
    }
  ]
};

PHASE_CONTENT['phase-2'] = {
  eyebrow: 'Phase 2 lesson',
  heading: 'Mastering the Arena',
  subheading: 'The Psychology of Integrated Discipline',
  summary: 'A textbook-style synthesis of values, motivation quality, mindset, recovery, and social context in sustainable high performance.',
  sourcePdf: './assets/readings/phase2-drive-content.pdf',
  quizId: 'quiz-phase2-integrated-discipline',
  heroFigure: {
    src: './assets/readings/phase2-figures/phase2-integrated-discipline-system.png',
    alt: 'Integrated discipline system showing values, motivation quality, recovery, and context',
    caption: 'Figure 1. Integrated discipline is a system, not a personality trait.'
  },
  keyIdeas: [
    'Discipline quality matters more than raw effort volume.',
    'Values, self-determined motivation, and honest feedback make effort more sustainable.',
    'Recovery and social context determine whether discipline turns into growth or breakdown.'
  ],
  sections: [
    {
      title: 'Inside This Chapter',
      paragraphs: [
        'Why this chapter matters',
        'Students are often taught discipline as if it were a moral trait: you either have it or you do not. That story is clean, simple, and mostly wrong. People can look equally hardworking from the outside while operating from completely different motivational systems. One student is driven by guilt, fear, or ego defense. Another is acting from a chosen identity, clear values, and an understanding of how much load the body and mind can actually recover from. Those two systems do not feel the same, and they do not produce the same long-term outcomes.',
        'This chapter reframes discipline as an architecture of self-regulation. It integrates self-determination theory, goal setting, mindset research, pride and attribution, overtraining science, and person-by-situation effects in social performance. The result is a practical model for students, athletes, and performers who want discipline that lasts.'
      ]
    },
    {
      title: 'Learning objectives',
      bullets: [
        'Distinguish direction and intensity of motivation and explain why a person-by-situation view predicts behavior better than trait-only explanations.',
        'Explain the self-determination continuum from amotivation to intrinsic motivation and differentiate introjected from integrated regulation.',
        'Describe how values, vulnerability, and growth mindset shape whether failure becomes useful feedback or an ego threat.',
        'Contrast guilt with shame and authentic pride with hubristic pride in the regulation of effort and self-worth.',
        'Use outcome, performance, and process goals appropriately and design a goal system that survives real-world stress.',
        'Recognize the recovery continuum from acute fatigue to overtraining syndrome and identify warning signs of under-recovery.',
        'Apply social-context findings to coaching, training design, and self-management.'
      ]
    },
    {
      title: 'Study lens',
      paragraphs: [
        'As you move through the chapter, ask a harder question than "How motivated am I?" Ask: "What is driving my effort right now - pressure, guilt, values, identity, enjoyment, or fear?" That question exposes the quality of the system.'
      ]
    },
    {
      title: '1. Rethinking Discipline',
      paragraphs: [
        'Motivation can be described with two basic dimensions: direction and intensity. Direction answers where effort is aimed. Intensity answers how much force is applied once the target is chosen. That is a more useful starting point than the usual cliches about winners and quitters, because it separates wanting from acting and acting from acting well.',
        'In applied performance settings, it helps to distinguish between the engine and the compass. The engine is raw effort: drive, activation, and the willingness to push. The compass is values-based direction: the system that determines whether the effort serves a meaningful end, an ego trap, or a fear-driven performance of toughness. Power without direction can look impressive for a while, but it is wasteful, brittle, and often self-destructive.',
        'Willpower is part of performance, but it is not the whole story and it is not stable enough to carry a person through months of training, study, rehabilitation, or behavior change. The important question is not whether someone can force effort today. The important question is whether the behavior can survive boredom, setbacks, ambiguity, and recovery demands without the person needing a daily internal war.',
        'Hard work is not enough. The same behavior can be either a guilt-driven performance or a values-driven expression of identity. The body sees the workout; psychology sees the reason.'
      ],
      table: {
        headers: ['Feature', 'False discipline', 'Integrated discipline'],
        rows: [
          ['Primary driver', 'Internal pressure, guilt, shame, or ego involvement.', 'A chosen value or identity standard that the person endorses.'],
          ['Typical self-talk', '"I should do this or I am lazy, weak, or failing."', '"I do this because it matches the kind of person I am building."'],
          ['Short-term effect', 'Can create urgent compliance and bursts of effort.', 'Creates steadier action with less inner friction.'],
          ['Long-term cost or benefit', 'High risk of resentment, brittleness, and burnout.', 'More sustainable because the behavior is assimilated into the self.']
        ]
      }
    },
    {
      title: '2. Self-Determination Theory and the Motivation Continuum',
      paragraphs: [
        'Self-determination theory shifts the discussion from how much motivation a person has to what kind of motivation is operating. That move matters because two athletes can show equal effort while experiencing radically different psychological costs. One can feel autonomous and purposeful. The other can feel trapped, resentful, and desperate to protect self-worth.',
        'At the far controlled end of the continuum sits amotivation, where the person sees little value in action or feels incapable of affecting outcomes. From there, motivation can become more regulated in stages. External regulation is driven by reward and punishment. Introjected regulation is driven by internal pressure such as guilt, shame, or ego maintenance. Identified regulation appears when the person accepts the value of the behavior. Integrated regulation appears when that value is fully aligned with identity. Intrinsic motivation sits at the far self-determined end, where the activity is done for inherent interest or enjoyment.',
        'Integrated regulation is the critical concept for discipline. The behavior may still be hard, repetitive, or unpleasant. It is not necessarily fun. What changes is ownership. The behavior stops feeling like an order and starts feeling like a standard. That is why the highest form of extrinsic motivation can still feel deeply autonomous.',
        'One important caution from self-determination theory is the overjustification problem. External rewards, pressure-heavy coaching, or performative discipline tactics can sometimes weaken intrinsic motivation by communicating control. Pressure can produce action, but it can also quietly erode the sense of ownership that makes action durable.',
        'Practical test: When a student says, "I am disciplined," the follow-up question is, "Disciplined by what?" If the answer is guilt, status, or fear, the system is still fragile. If the answer is values, identity, and chosen standards, the system is becoming integrated.'
      ],
      bullets: [
        'Amotivation: action feels pointless or beyond influence.',
        'External regulation: behavior follows reward or punishment.',
        'Introjected regulation: behavior is driven by guilt, shame, or ego pressure.',
        'Identified regulation: the person accepts the value of the behavior.',
        'Integrated regulation: the behavior aligns with identity.',
        'Intrinsic motivation: the activity is done for inherent interest or enjoyment.'
      ],
      figures: [
        {
          src: './assets/readings/phase2-figures/phase2-motivation-continuum.png',
          alt: 'Motivation continuum from amotivation to intrinsic motivation',
          caption: 'Figure 2. Movement along the continuum changes not just persistence, but the psychological cost of persistence.'
        }
      ]
    },
    {
      title: '3. The Three Psychological Needs',
      paragraphs: [
        'The three psychological needs are autonomy, competence, and relatedness. Autonomy does not mean doing whatever feels easy or pleasant. It means experiencing action as chosen and self-endorsed. Competence is the felt sense that effort produces mastery and that one can affect outcomes. Relatedness is the experience of belonging, being supported, and mattering to others.',
        'When autonomy is repeatedly undermined, people often comply in the short term but become controlled and resentful. When competence collapses, amotivation becomes more likely because the person stops perceiving a contingency between effort and progress. When relatedness is missing, risk taking, persistence, and willingness to tolerate challenge often weaken.'
      ],
      figures: [
        {
          src: './assets/readings/phase2-figures/phase2-psychological-needs.png',
          alt: 'Autonomy, competence, and relatedness as psychological fuel',
          caption: 'Figure 3. Need satisfaction is the psychological fuel for sustainable self-regulation.'
        }
      ],
      table: {
        headers: ['Need', 'What it feels like', 'What happens when it is undermined'],
        rows: [
          ['Autonomy', 'My actions feel chosen and self-endorsed.', 'Compliance may remain, but ownership erodes.'],
          ['Competence', 'My effort can affect outcomes and build skill.', 'Learned helplessness or amotivation becomes more likely.'],
          ['Relatedness', 'I belong, matter, and feel supported.', 'Persistence and challenge tolerance often weaken.']
        ]
      }
    },
    {
      title: '4. Values, Vulnerability, and Behavioral Direction',
      paragraphs: [
        'Values solve a problem that motivation alone cannot solve: they select direction. Without values, students can work hard at goals they do not truly endorse, or worse, at goals that mainly serve image management. A values system acts like a filter for difficult decisions. It answers not only "What do I want?" but "What kind of person am I at my best?"',
        'This is why values clarification matters in a chapter on discipline. A student who names durability, integrity, contribution, mastery, health, courage, or family as organizing values can map tedious behaviors onto something larger than immediate mood. Meal preparation, mobility work, recovery sessions, quiet study, and honest feedback become easier to tolerate when they are visibly attached to a chosen standard.',
        'Values also require vulnerability. The arena metaphor is useful here. Growth rarely begins once a person feels perfectly ready, bulletproof, and beyond embarrassment. Growth begins when the person enters public or personal uncertainty before certainty arrives. That may mean trying a new skill, sharing unfinished work, showing up to practice while underprepared, or taking responsibility before the outcome is safe.',
        'Discipline without vulnerability becomes image management. Vulnerability without discipline becomes drift. Durable performance needs both.'
      ],
      bullets: [
        'Values turn dull maintenance work into identity-consistent behavior.',
        'A values system answers not only what I want, but who I am at my best.',
        'Value-to-task mapping keeps hard behavior attached to chosen standards rather than temporary mood.',
        'Vulnerability is part of real development because growth begins before the outcome feels safe.',
        'Values move a task from "I should" toward "I choose." That shift is the beginning of autonomy, not the end of difficulty.'
      ],
      table: {
        headers: ['Core value', 'Behavior that lives it', 'Early warning sign of drift', 'Support cue or identity statement'],
        rows: [
          ['Durability', 'Recovery work, mobility, sleep discipline', 'Skipping recovery because it feels unproductive', 'I protect the system that lets me perform.'],
          ['Mastery', 'Deliberate practice and honest review', 'Choosing only familiar tasks that protect ego', 'I train to get better, not just to look capable.'],
          ['Integrity', 'Following through on the plan when no one is watching', 'Changing standards to match mood', 'My standard counts even in private.']
        ]
      }
    },
    {
      title: '5. Mindset, Accountability, Guilt, and Shame',
      paragraphs: [
        'Implicit theories of ability shape how people interpret friction. In an entity or fixed view, ability is treated as a stable trait that must be displayed and protected. The main goal becomes proving ability and avoiding looking incompetent. In an incremental or growth view, ability is treated as something built through effort, strategy, feedback, and time. The main goal becomes mastery.',
        'That distinction changes everything about failure. Under a fixed view, failure feels like a verdict on the self. Effort can even feel humiliating because needing to work implies not being naturally gifted enough. Under a growth view, failure becomes process data. The question changes from "What does this say about me?" to "What does this tell me about my current strategy?"',
        'The classic praise findings make the contrast concrete. When learners are praised mainly for intelligence or talent, they often become more fragile under difficulty. When they are praised for process, strategy, and sustained effort, they show more persistence and recover more effectively after mistakes. The deeper point is not that any effort deserves applause. False growth mindset is real. Empty encouragement without strategy, feedback, or adjustment is not growth; it is sentimentality.',
        'The accountability mirror only works if it remains behavior-focused. Guilt says, "I did a low-quality thing." Shame says, "I am low quality." That is not a minor wording difference. Guilt can drive repair because behavior is changeable. Shame triggers hiding, numbing, aggression, defensiveness, or quitting because the self is experienced as defective.',
        'Accountability is useful only when it exposes behavior without attacking identity. The moment feedback becomes "you are the problem," discipline starts mutating into shame-based control.'
      ],
      table: {
        headers: ['Dimension', 'Fixed / entity view', 'Growth / incremental view'],
        rows: [
          ['Primary goal', 'Prove ability and avoid looking deficient.', 'Improve ability and increase mastery.'],
          ['Meaning of failure', 'Evidence of limited talent or low worth.', 'Feedback about the current method or preparation.'],
          ['Meaning of effort', 'A sign that ability is lacking.', 'The path that converts potential into skill.'],
          ['Response to feedback', 'Defensive if feedback threatens identity.', 'Curious if feedback helps refine process.']
        ]
      },
      bullets: [
        'Adaptive guilt stays behavior-focused and supports repair.',
        'Maladaptive shame globalizes the problem and attacks identity.',
        'Useful accountability exposes behavior without turning the person into the problem.'
      ]
    },
    {
      title: '6. Authentic Pride and Hubristic Pride',
      paragraphs: [
        'Students often chase pride without distinguishing its forms. That is dangerous. Pride can stabilize effort, but it can also become a defense against vulnerability. The difference lies in attribution, the causes a person assigns to success.',
        'Authentic pride is linked to controllable causes such as effort, skill development, preparation, and adherence to process. It produces confidence without needing superiority. Because the person believes success was built, not handed down by fixed greatness, setbacks do not threaten the entire self. Performance can be poor on a given day without the person needing to protect status through denial or aggression.',
        'Hubristic pride is tied to stable superiority narratives: being naturally better, above others, or entitled to admiration. It can look like confidence from a distance, but it is fragile. If worth depends on being exceptional by nature, then any failure becomes a threat to the whole identity. Defensiveness, blame, and self-inflation are common downstream behaviors.',
        'For discipline, the implication is blunt. Build pride around what you can repeatedly do, not around what you need others to believe about you. The first creates a foundation. The second creates a mask.'
      ],
      table: {
        headers: ['Dimension', 'Hubristic pride', 'Authentic pride'],
        rows: [
          ['Source', 'Superiority, dominance, stable trait narratives.', 'Effort, preparation, skill, and achievement.'],
          ['Typical experience', 'Arrogance, entitlement, defensiveness.', 'Confidence, earned self-respect, resilience.'],
          ['Impact on feedback', 'Feedback threatens status and is often resisted.', 'Feedback can be used because worth is not hanging on perfection.'],
          ['Likely outcome', 'Fragile self-esteem and interpersonal friction.', 'More durable self-worth and better self-regulation.']
        ]
      }
    },
    {
      title: '7. Goal Setting: Turning Identity into Action',
      paragraphs: [
        'Goals translate identity into daily behavior. The problem for most students is not a lack of goals. It is a lack of structure. People regularly set intentions that are vague, overambitious, disconnected from priorities, or unsupported by a plan for review and adjustment.',
        'A useful distinction is between subjective priorities and objective goals. Subjective priorities are global commitments such as health, mastery, contribution, or graduation. Objective goals are concrete targets attached to time or performance. Students often fail because their daily calendar obeys urgency rather than true priorities. The goal system itself is not broken; the hierarchy is.',
        'In sport and performance settings, three goal types matter. Outcome goals focus on the result relative to others. Performance goals focus on a standard relative to your own prior level. Process goals focus on the controllable actions that make performance more likely. Outcome goals can provide direction, but process goals usually carry the greatest value under pressure because they pull attention toward controllable execution.',
        'SMART goals can be useful, but they are not enough on their own. A goal can be specific and measurable while still being psychologically poor if it conflicts with core values, ignores recovery capacity, or relies entirely on outcomes the student does not control.',
        'Goal ladder: Build goals from the top down: one meaningful outcome direction, two performance standards tied to your own progress, and three process actions you can control this week. Then review the ladder before you review your mood.'
      ],
      table: {
        headers: ['Goal type', 'What it targets', 'Best use', 'Main risk if overused'],
        rows: [
          ['Outcome', 'Winning, selection, ranking, finishing ahead of others.', 'Long-range direction and significance.', 'Can elevate anxiety and pull attention away from the task.'],
          ['Performance', 'A personal standard or measurable improvement relative to self.', 'Tracking progress and calibrating challenge.', 'Can still become pressure-heavy if treated like identity proof.'],
          ['Process', 'Specific controllable actions, cues, and routines.', 'Competition focus, skill execution, and daily consistency.', 'Too many process cues at once can overload attention.']
        ]
      },
      bullets: [
        'Specific targets rather than vague wishes.',
        'A mix of short-term and long-term markers.',
        'Moderate-to-high challenge rather than trivial comfort goals.',
        'Visible feedback and review, because unmeasured goals become fantasies fast.',
        'Participant input and ownership, which increases commitment.',
        'Multiple goal levels, so outcome direction is paired with performance and process control.',
        'Written plans, not goals that exist only as feelings.',
        'Adjustment when life load, recovery, or context changes.'
      ]
    },
    {
      title: '8. Recovery, Overreaching, and Overtraining Syndrome',
      paragraphs: [
        'Performance psychology gets sloppy when it talks as if hard effort alone produces adaptation. The body does not reward heroic slogans. It adapts to stress only when recovery is adequate. That is the logic behind the SAID principle: specific adaptations to imposed demands. Demands matter. Recovery matters just as much.',
        'A useful continuum runs from acute fatigue to functional overreaching, nonfunctional overreaching, and overtraining syndrome. Acute fatigue is expected after hard work. Functional overreaching is a short-term planned dip followed by supercompensation. Nonfunctional overreaching begins when recovery is inadequate and performance stagnates rather than rebounds. Overtraining syndrome is the long-term breakdown state: months to years of reduced performance with cognitive, hormonal, immune, and neuromuscular consequences.',
        'Overtraining is not caused only by extreme volume. It can emerge from monotony, inadequate sleep, poor nutrition, repeated life stress, abrupt load increases, training too hard on supposed recovery days, and long stretches without meaningful variation. The mistake people make is assuming the danger comes only from spectacular training blocks. In reality, the most common problem is often repeated, poorly regulated sameness.',
        'Red flags often appear cognitively and emotionally before they appear mechanically: brain fog, irritability, blunted desire to compete, frequent illness, chronic soreness, sleep disruption, and falling performance despite high motivation. That last point matters. Burnout and overtraining are not identical. In burnout, motivation often drops away. In overtraining, motivation can remain high while the hardware fails.',
        'Hard truth: Pushing harder is not always discipline. Sometimes it is just refusal to update the plan in response to evidence.'
      ],
      figures: [
        {
          src: './assets/readings/phase2-figures/phase2-recovery-continuum.png',
          alt: 'Recovery continuum from adaptation toward breakdown',
          caption: 'Figure 4. The line between adaptation and breakdown is determined largely by recovery.'
        }
      ],
      table: {
        headers: ['Category', 'Common signs of under-recovery or overtraining'],
        rows: [
          ['Cognitive', 'Brain fog, reduced concentration, slower decision making, poor reaction quality.'],
          ['Autonomic', 'Sleep disruption, unusual resting heart patterns, persistent fatigue.'],
          ['Physical', 'Chronic soreness, frequent illness, reduced performance, higher injury risk.'],
          ['Psychological', 'Irritability, emotional flatness, guilt about resting, loss of competitive sharpness.']
        ]
      }
    },
    {
      title: '9. The Growth Equation',
      paragraphs: [
        'A clean rule for sustainable high performance is this: stress plus rest equals growth. Growth does not happen during the stressor. The stressor creates disruption. Growth happens afterward, when the system is given enough time and support to repair, adapt, and supercompensate.',
        'The best challenge is not maximum difficulty. It is a just-manageable challenge: hard enough to force adaptation, but not so overwhelming that the system spends its energy on survival rather than learning. The same logic applies mentally. Real cognitive growth usually requires periods of intense, focused strain followed by real disengagement. Constant partial engagement, the gray zone, produces far less than people think.',
        'Rest is not passive emptiness. Short-term rest can include walking, low-load movement, time away from screens, or mentally unstructured periods that allow the default mode network to keep solving problems in the background. Long-term rest is dominated by sleep, which supports information processing, endocrine recovery, tissue repair, and emotional regulation.',
        'For high-achieving students, rest often feels psychologically harder than work because it triggers guilt. That is exactly why it must be trained as a skill. Professionalism includes the willingness to deload, to reduce intensity when data indicate under-recovery, and to treat longevity as part of the goal rather than a sign of softness.'
      ],
      figures: [
        {
          src: './assets/readings/phase2-figures/phase2-growth-equation.png',
          alt: 'Stress plus rest equals growth diagram',
          caption: 'Figure 5. Stress is only productive when the cycle includes adequate recovery.'
        }
      ],
      bullets: [
        'The best challenge is hard enough to force adaptation without overwhelming the whole system.',
        'Short-term rest can include walking, low-load movement, and time away from constant input.',
        'Sleep remains the dominant long-term recovery tool for learning, hormonal repair, and emotional regulation.',
        'Professionalism includes deloading when the evidence says the system is not rebounding.'
      ]
    },
    {
      title: '10. Person by Situation: Social Context and the Myth of Universal Grit',
      paragraphs: [
        'The interactional view of motivation argues that behavior is best understood as a function of both person and situation. This matters because coaches, teachers, and leaders are constantly tempted to universalize their own style. They find one rhetoric that works for some people and assume it should work for everyone. It should not.',
        'The Sorrentino and Sheppard swimming study illustrates the point. Approval-oriented swimmers improved when competing in the relay context, where belonging and connection could amplify effort. Rejection-threatened swimmers performed better alone because the risk of letting others down interfered with execution in the team condition.',
        'The applied implication is not that team culture is bad or that lone-wolf training is good. The implication is that the social environment must match the motive profile. Some performers need the unit, the shared mission, and responsibility to others. Others need to temporarily remove social evaluation so that effort is not hijacked by anxiety.',
        'Coaching implication: Do not universalize grit. Some performers need more connection. Others need more privacy. Good coaching is diagnostic before it is motivational.'
      ],
      figures: [
        {
          src: './assets/readings/phase2-figures/phase2-person-situation.png',
          alt: 'Person by situation interaction diagram',
          caption: 'Figure 6. Social context can pull performance up or push it down depending on the performer.'
        }
      ],
      bullets: [
        'Do not universalize grit or coaching style.',
        'Some people need more connection; others need more privacy.',
        'The social environment should be chosen strategically, not ideologically.'
      ]
    },
    {
      title: '11. Tactical Drills for Integrated Discipline',
      paragraphs: [
        'A complete chapter should end with tools, not just concepts. The drills below are not magic tricks. They are ways of steering behavior back toward autonomy, competence, relatedness, and biological realism when motivation starts drifting.'
      ],
      table: {
        headers: ['Tool', 'Purpose', 'Key question'],
        rows: [
          ['Diagnostic audit', 'Separate behavior from identity.', 'What exactly did I do, and what will I change next?'],
          ['Value-to-task mapping', 'Reconnect an unglamorous task to a chosen value.', 'Which value does this behavior protect or build?'],
          ['Goal ladder', 'Translate big direction into controllable daily actions.', 'What is my outcome direction, performance standard, and process focus?'],
          ['Governor pulse check', 'Distinguish discomfort from dangerous under-recovery.', 'Is this normal resistance, or is the system sending a legitimate stop signal?'],
          ['Recovery checkpoint', 'Treat restoration as a tracked skill.', 'What do sleep, mood, concentration, and soreness suggest today?'],
          ['Pit crew check-in', 'Match the social environment to the person.', 'Do I need accountability through connection or relief from social evaluation?']
        ]
      }
    },
    {
      title: '12. Common Misunderstandings',
      paragraphs: [
        'Integrated discipline is not softer than brute-force discipline. It is simply harder to fake and much harder to maintain dishonestly.'
      ],
      table: {
        headers: ['Misunderstanding', 'Correction'],
        rows: [
          ['Discipline is basically willpower.', 'Willpower matters, but durable discipline depends on values, motivation quality, skill, recovery, and context.'],
          ['More pressure always creates more effort.', 'Pressure can create action, but it can also undermine autonomy and increase brittleness.'],
          ['Harsh self-talk creates toughness.', 'Only behavior-focused accountability helps. Identity-focused shame usually damages regulation.'],
          ['Outcome goals are the main driver of performance.', 'Outcome goals provide direction; process goals usually protect execution under pressure.'],
          ['Rest is laziness.', 'Recovery is a performance skill and a condition for adaptation.'],
          ['Team culture motivates everyone the same way.', 'Some performers are helped by shared responsibility; others are inhibited by social evaluation.'],
          ['Pride is always positive.', 'Authentic pride supports resilience; hubristic pride often hides fragility and invites defensiveness.']
        ]
      }
    },
    {
      title: '13. End-of-Chapter Summary',
      paragraphs: [
        'Sustainable discipline is not the absence of emotion, comfort, or self-doubt. It is better architecture. Values choose the direction of effort. Self-determination theory explains why the quality of motivation matters more than its volume. Growth mindset keeps failure usable. Guilt corrects behavior; shame attacks identity. Authentic pride stabilizes self-worth through controllable causes. Goal setting translates identity into execution. Recovery keeps physiology from turning effort into breakdown. Social-context research reminds us that motivation is never purely inside the person.',
        'When these pieces work together, discipline becomes less theatrical and more reliable. The person does not need to manufacture a dramatic inner speech every day. The system carries more of the load. That is the real target: not occasional heroic effort, but a repeatable structure that can survive pressure without destroying the performer.'
      ]
    },
    {
      title: '14. Glossary of Essential Terms',
      paragraphs: [
        'Core vocabulary for quick review.'
      ],
      glossary: [
        ['Amotivation', 'A state in which action feels pointless or beyond one’s capacity to influence.'],
        ['Authentic Pride', 'A form of pride grounded in controllable causes such as effort, preparation, and skill development.'],
        ['Autonomy', 'The experience of acting with ownership and self-endorsement rather than feeling controlled.'],
        ['Competence', 'The felt sense of effectiveness and mastery in one’s environment.'],
        ['Entity View', 'A fixed mindset in which ability is treated as a stable trait that must be protected or proven.'],
        ['External Regulation', 'Behavior controlled mainly by outside rewards, punishments, or demands.'],
        ['Functional Overreaching', 'A planned short-term dip in performance followed by recovery and improvement.'],
        ['Guilt', 'A behavior-focused emotion that can support correction because it points to something changeable.'],
        ['Growth Equation', 'The principle that growth depends on stress being followed by sufficient recovery.'],
        ['Hubristic Pride', 'A superiority-based form of pride tied to fixed status narratives and defensiveness.'],
        ['Identified Regulation', 'A relatively autonomous form of motivation in which a person accepts the value of the behavior.'],
        ['Incremental View', 'A growth mindset in which ability is treated as something developed through effort, strategy, and feedback.'],
        ['Integrated Regulation', 'The most autonomous form of extrinsic motivation, where behavior aligns with values and identity.'],
        ['Intrinsic Motivation', 'Engaging in an activity for inherent interest, satisfaction, or enjoyment.'],
        ['Introjected Regulation', 'Behavior driven by internal pressure such as guilt, shame, or ego maintenance.'],
        ['Outcome Goal', 'A goal focused on a final competitive or comparative result.'],
        ['Overtraining Syndrome', 'A long-term maladaptive state marked by decreased performance and broad physiological or psychological strain.'],
        ['Performance Goal', 'A goal focused on a measurable standard relative to one’s own prior level.'],
        ['Process Goal', 'A goal focused on specific controllable behaviors, cues, or routines.'],
        ['Relatedness', 'The need to feel connected, supported, and significant in relationships.'],
        ['SAID principle', 'Specific adaptations to imposed demands; the body adapts specifically to the stressors placed upon it.'],
        ['Shame', 'An identity-focused emotion in which the self is experienced as globally flawed or unworthy.'],
        ['Supercompensation', 'The adaptive rebound in capacity that can occur when stress is followed by adequate recovery.']
      ]
    }
  ]
};

PHASE_CONTENT['phase-3'] = {
  eyebrow: 'Phase 3 lesson',
  heading: 'Mastering Focus Under Pressure',
  subheading: 'Attention, Concentration, and the Inner Game of Performance',
  summary: 'Pressure usually does not erase skill. It reallocates attention. The better the athlete understands attention, interference, and self-regulation, the more often skill survives the moment.',
  sourcePdf: './assets/readings/phase3-focus-content.pdf',
  quizId: 'quiz-phase3-focus-under-pressure',
  heroFigure: {
    src: './assets/readings/phase3-figures/phase3-focus-system-map.png',
    alt: 'Focus under pressure chapter map showing attention architecture, the inner game, preparation, and reset tools',
    caption: 'Figure 1. Focus under pressure is a system, not a single mindset trick.'
  },
  keyIdeas: [
    'Learn how selectivity, capacity, alertness, and shifting shape performance.',
    'See how Self 1 and Self 2 explain overthinking, trust, and automaticity.',
    'Build routines, imagery, cue words, breath control, and reset strategies.'
  ],
  sections: [
    {
      title: 'Chapter roadmap',
      paragraphs: [
        'This chapter merges the scientific study of concentration with the applied "Inner Game" approach to performance. Together they explain how athletes can prepare attention before competition, protect it during performance, and recover it quickly when it drifts.'
      ]
    },
    {
      title: 'Inside This Chapter',
      paragraphs: [
        'Why this chapter matters',
        'Students often treat focus as if it were a vague personality trait: some people "have it" and others do not. That view is too simple. Concentration is a trainable performance skill. It can be diagnosed, rehearsed, disrupted, and rebuilt. Once coaches and performers understand the architecture of attention, breakdowns become easier to explain and easier to fix.',
        'The deeper lesson is that pressure rarely invents a new athlete. It exposes the attentional habits the athlete already owns. A strong chapter on concentration therefore has to cover both the science of attention and the lived experience of performance under pressure.'
      ]
    },
    {
      title: 'Learning objectives',
      bullets: [
        'Define concentration as selective, sustained, and shiftable attention rather than simple effortful focus.',
        'Explain the core attentional processes of selectivity, capacity, alertness, and attentional shifting.',
        "Use Nideffer's attentional quadrants to diagnose what kind of focus a task requires.",
        "Differentiate Gallwey's Self 1 and Self 2 and explain the performance equation: potential minus interference.",
        'Design pre-competition routines, what-if plans, imagery scripts, and simulation drills that protect focus.',
        'Build an in-performance focus plan using breath control, cue words, external anchors, and nonjudgmental resets.'
      ]
    },
    {
      title: 'Study lens',
      paragraphs: [
        'Read this chapter with a diagnostic mindset. Instead of asking only whether an athlete was "focused," ask what they were focused on, whether that focus matched the task, and how quickly they could shift when the moment changed.'
      ]
    },
    {
      title: '1. Why focus fails under pressure',
      paragraphs: [
        'Pressure does not simply add emotion; it changes what the mind attends to. In practice, athletes can devote substantial attention to technique, correction, and repetition with relatively little consequence attached. In competition, the same attentional system must manage evaluation, uncertainty, time pressure, fatigue, crowd noise, opponents, and the meaning of the moment. That combination can pull attention away from task-relevant cues and toward self-conscious monitoring or distraction.',
        'When performance drops under stress, the athlete often still possesses the skill. What changes is access to the skill. Attention begins replaying the last error, predicting the next mistake, overanalyzing body mechanics, or listening to an inner critic narrate the entire event. These processes reduce fluidity, increase muscle tension, and make automatic skills feel strangely effortful.'
      ],
      bullets: [
        'Past mistakes steal present-moment bandwidth.',
        'Future consequences pull attention away from execution.',
        'Analysis paralysis feeds conscious overcontrol.',
        'The inner critic turns observation into interference.'
      ]
    },
    {
      title: '2. Concentration as a trainable control process',
      paragraphs: [
        'In sport psychology, concentration refers to more than simply "trying to focus." It includes the ability to select the right cues, keep attention there long enough to act, remain aware of important changes or errors, and shift attention efficiently when the task demands something different. That last piece matters because almost no performance task requires one static kind of focus from start to finish.',
        'The architecture of attention is often explained through four linked processes. Each process can support performance or break it down, depending on how well trained it is and how much pressure is present.',
        'Capacity is especially important for understanding why experts and novices perform differently. Novices spend large amounts of bandwidth on how to move. Experts can let well-learned skills run automatically, which frees attention for anticipation, tactical reading, and environmental awareness. Under heavy pressure, even experts can be pulled backward into conscious control if their focus plan is weak.'
      ],
      table: {
        headers: ['Process', 'What it does', 'Performance value', 'Breakdown when weak'],
        rows: [
          ['Selectivity', 'Screens out irrelevant information.', 'Keeps the spotlight on the most useful cue.', 'Noise, thoughts, and irrelevant events steal the spotlight.'],
          ['Capacity', 'Manages limited mental bandwidth.', 'Lets experts execute skills automatically and still read the game.', 'Athletes become overloaded by mechanics, strategy, and emotion at once.'],
          ['Alertness', 'Links arousal to readiness and attentional width.', 'Sharpens readiness when arousal is appropriate.', 'Too little arousal creates drift; too much creates tunnel vision.'],
          ['Shifting', 'Moves focus as the moment changes.', 'Allows scan -> plan -> regulate -> execute transitions.', 'Athletes get stuck overthinking or staring at the wrong cue.']
        ]
      }
    },
    {
      title: "3. Nideffer's attentional quadrants",
      paragraphs: [
        "Nideffer's model is useful because it names different kinds of concentration instead of treating focus as one single state. Broad-external attention scans the environment. Broad-internal attention analyzes and plans. Narrow-internal attention regulates the body and mind. Narrow-external attention locks onto the immediate execution cue. Elite performers do not stay in one quadrant; they shift deliberately as the moment changes.",
        'A free throw offers a simple example. Before the shot, the athlete may briefly use broad-external awareness to orient to the environment and game situation. Next comes a brief broad-internal decision about routine and tempo. Then narrow-internal attention organizes breath and body tone. Finally, narrow-external attention locks onto the target and release. Problems arise when athletes stay in the wrong quadrant too long, such as continuing to analyze mechanics while the shot is already unfolding.',
        'Do not diagnose every lapse as "lost concentration." Ask what kind of focus the athlete needed, where their attention went instead, and whether arousal made the attentional field too broad or too narrow.'
      ],
      table: {
        headers: ['Quadrant', 'Primary demand', 'Performance example'],
        rows: [
          ['Broad-external', 'Scan the environment.', 'Read spacing, defenders, timing, and tactical options.'],
          ['Broad-internal', 'Analyze and plan.', 'Choose strategy, tempo, or sequence before action.'],
          ['Narrow-internal', 'Regulate the body and mind.', 'Set breath, body tone, timing, or grip pressure.'],
          ['Narrow-external', 'Lock onto the immediate outside target.', 'Fixate on the back rim, seams of the ball, or release target.']
        ]
      },
      figures: [
        {
          src: './assets/readings/phase3-figures/phase3-attentional-quadrants.png',
          alt: 'Four attentional quadrants diagram showing broad internal, broad external, narrow internal, and narrow external focus',
          caption: 'Figure 2. High-level performers shift deliberately between attentional widths and directions instead of forcing one kind of focus onto every moment.'
        }
      ]
    },
    {
      title: '4. Self 1, Self 2, and the problem of interference',
      paragraphs: [
        "Gallwey's language of Self 1 and Self 2 gives an applied explanation for why attention can sabotage skilled movement. Self 1 is the verbal, analytical, judgmental part of the mind. It can be useful for setting goals, observing patterns, and choosing practice priorities. But during live execution it often overreaches by trying to micromanage movement. Self 2 is the automatic, sensory, embodied system that actually performs the skill once it has been learned.",
        "Gallwey's performance equation states that performance equals potential minus interference. Interference includes judgment, fear of outcome, overcontrol, and self-conscious correction. The athlete who says 'Do not miss' or 'Keep your elbow exactly here' while the skill is already unfolding is feeding Self 1 at the exact moment Self 2 needs room to work.",
        'Nonjudgmental awareness is one of the most practical ways to reduce interference. Instead of "I am terrible under pressure," the performer describes the event more accurately: "I was late on contact," "I came off the target early," or "I rushed the routine." This style of observation preserves information while stripping away ego involvement. It keeps the athlete coachable in the moment.',
        'Treat skill development like growth, not a courtroom verdict. Errors are data about stage, timing, and need. The moment an athlete turns every mistake into an identity judgment, interference spikes and learning slows.'
      ],
      table: {
        headers: ['Feature', 'Self 1', 'Self 2'],
        rows: [
          ['Core role', 'Sets goals, labels events, analyzes, and evaluates.', 'Executes the skill through automatic and sensory processes.'],
          ['Strength', 'Useful for planning and observation.', 'Reliable, fast, and fluid once skill is learned.'],
          ['Main risk', 'Overcoaching, judgment, and trying too hard.', 'Gets disrupted when Self 1 will not let it run.'],
          ['Helpful language', 'Observe and choose the cue.', 'Feel, see, trust, and execute.']
        ]
      },
      figures: [
        {
          src: './assets/readings/phase3-figures/phase3-inner-game-equation.png',
          alt: 'Inner Game performance equation diagram comparing Self 1 and Self 2 and showing performance equals potential minus interference',
          caption: 'Figure 3. The Inner Game frames pressure as an interference problem as much as a skill problem.'
        }
      ]
    },
    {
      title: '5. Pre-competition plans that protect attention',
      paragraphs: [
        'A pre-competition plan is not superstition. It is an attentional transfer system. Its job is to move the athlete from everyday noise into performance-relevant readiness. The strongest plans blend stable elements - breath, body check, cue word, target image - with flexible responses to likely disruptions such as delays, bad calls, weather changes, hostile crowds, or a slow start.',
        'Routines narrow attention. What-if planning reduces surprise. Simulation training makes pressure familiar. Imagery programs the body with sensory targets instead of endless verbal instructions. Some athletes also benefit from programming by identity, or briefly stepping into the role of the composed, decisive performer they want to become.'
      ],
      table: {
        headers: ['Tool', 'Main purpose', 'Example', 'Common mistake'],
        rows: [
          ['Routine', 'Transfers attention to controllables.', 'One breath, posture check, cue word, target image.', 'Too long, too rigid, or superstitious.'],
          ['What-if plan', 'Prepares the response to likely distractions.', '"If the call is bad, I breathe, reset, and play the next point."', 'Planning the problem but not the response.'],
          ['Imagery', 'Programs the desired result or feeling.', 'See the arc, hear contact, feel rhythm before the rep.', 'Using vague or purely verbal imagery.'],
          ['Simulation', 'Makes pressure familiar in practice.', 'Noise, consequence, fatigue, scoring, and evaluation drills.', 'Practicing only in safe, sterile conditions.'],
          ['Identity cue', 'Links behavior to the role the athlete wants to embody.', '"Compete like the calm version of me."', 'Trying to fake confidence without a routine underneath it.']
        ]
      },
      figures: [
        {
          src: './assets/readings/phase3-figures/phase3-precompetition-blueprint.png',
          alt: 'Pre-competition blueprint diagram showing routine, what-if plan, imagery, simulation, and identity cue',
          caption: 'Figure 4. Strong preparation specifies how attention will be transferred, protected, and reset before stress arrives.'
        }
      ]
    },
    {
      title: '6. Regaining concentration during performance',
      paragraphs: [
        'A focus plan answers a brutally practical question: what will the athlete do the moment attention drifts? Many performers know that they "should refocus," but have no script for how. The most useful plans name a reset cue, a breath pattern, an attentional target, and a rule for how to respond after mistakes.',
        'Cue words work because they compress a complex instruction into one usable trigger. Instructional cues are best when a specific technical reminder is needed. Motivational cues raise intensity when energy drops. External anchors such as the seams of the ball, the back rim, the lane line, or the sound of clean contact help keep the mind in the present and prevent analysis paralysis.',
        'Instructional vs. motivational cues: instructional cues organize mechanics, while motivational cues organize effort and activation.',
        "Breathing is especially valuable because it is both physiological and attentional. A slow exhale lowers noise, softens unnecessary tension, and gives the athlete a bridge back into the present. Gallwey's examples of watching the seams of the ball or listening for the sound of contact show the same logic: occupy attention with a simple, immediate cue so the critical mind has less room to interfere."
      ],
      bullets: [
        'Instructional cues organize mechanics: "smooth," "finish," "eyes up."',
        'Motivational cues organize effort: "drive," "attack," "explode."',
        'A usable recovery plan should name a reset cue, a breath pattern, an attentional target, and a nonjudgmental response after mistakes so recovery is rehearsed instead of improvised.'
      ],
      figures: [
        {
          src: './assets/readings/phase3-figures/phase3-reset-sequence.png',
          alt: 'In-performance reset sequence diagram showing notice, breathe, cue, anchor, execute, and release',
          caption: 'Figure 5. Refocus is not a vague command. It is a rehearsed sequence the athlete can run under stress.'
        }
      ]
    },
    {
      title: '7. How focus becomes reliable',
      paragraphs: [
        'Psychological skills are most effective when trained in phases. Education gives the athlete a language for attention, interference, and arousal. Acquisition teaches the actual tools - cue words, centering, imagery, target focus, and nonjudgmental observation. Practice integration then takes those tools into increasingly competitive settings until they are available under stress rather than only in calm environments.',
        'Useful drills include performance profiling, interference audits, seam-watching or target-gaze exercises, simulation training, and practice journals that record how the skill felt rather than only what the outcome was. Research on quiet eye behavior supports the same pattern: stable gaze on a task-relevant target immediately before action improves performance because it stabilizes attention at the right moment.',
        'This athlete often becomes stuck in narrow-internal focus on mechanics and consequences. The fix is not more instructions. The fix is a short routine: breathe, soften, cue, eyes on target, shoot, release. Then the routine must be practiced under pressure until it becomes the default response.'
      ],
      table: {
        headers: ['Symptom', 'Likely focus problem', 'Useful intervention'],
        rows: [
          ['Replays mistakes', 'Past-oriented attention and judgment.', 'Short breath reset + describe the error objectively + next cue.'],
          ['Thinks about outcome', 'Future-oriented distraction.', 'What-if planning + present-moment target cue.'],
          ['Feels robotic', 'Overcontrol and narrow-internal overload.', 'External anchor + trust cue + simulated repetition.'],
          ['Misses key cues', 'Attention too broad or directed wrong.', 'Re-define the target cue and rehearse scan-to-lock transitions.'],
          ['Gets tight late in games', 'Arousal narrows attention too much.', 'Centering, exhale control, and pressure rehearsal.']
        ]
      }
    },
    {
      title: '8. End-of-chapter summary',
      paragraphs: [
        "Concentration is a trainable control system built from selectivity, capacity, alertness, and shifting. Pressure does not merely test courage; it tests how well attention has been prepared. Nideffer's quadrants explain what kind of focus the moment requires, while Gallwey's Inner Game explains why overthinking and judgment interfere with automatic skill.",
        'Pre-competition plans protect attention before stress arrives. Focus plans restore it when stress breaks through. The most effective performers do not chase a mystical state of perfect calm. They learn how to diagnose drift early, recover quickly, and return attention to the cue that matters now.',
        'Focus under pressure is not one skill. It is a coordinated system of preparation, attentional direction, arousal regulation, and recovery.'
      ]
    },
    {
      title: '9. Glossary of essential terms',
      paragraphs: [
        'Use these terms as active language for coaching and self-analysis.'
      ],
      glossary: [
        ['Alertness', 'The readiness level of the performer and the way arousal changes attentional width.'],
        ['Attentional capacity', 'The limited amount of information a performer can process at one time.'],
        ['Attentional shift', 'A deliberate move from one type of focus to another as task demands change.'],
        ['Automaticity', 'Execution that requires little conscious control because the skill has become well learned.'],
        ['Broad-external focus', 'A wide scan of the environment used to assess opponents, space, timing, or tactical options.'],
        ['Broad-internal focus', 'Internal analysis used for planning, reflection, or strategic problem solving.'],
        ['Centering', 'A brief reset routine, usually built around slow breathing and body awareness, used to regain control.'],
        ['Concentration', 'The ability to direct attention to relevant cues, sustain it, notice important changes, and shift when necessary.'],
        ['Cue word', 'A short word or phrase used to trigger a desired movement, feeling, or effort level.'],
        ['External anchor', 'A simple outside cue - such as the seams of a ball, a target, or a sound - that stabilizes attention.'],
        ['Focus plan', 'A personalized strategy for maintaining or regaining concentration during performance.'],
        ['Imagery', 'The use of sensory images to rehearse outcomes, feelings, or movement patterns.'],
        ['Interference', 'Anything that subtracts from performance potential, such as judgment, fear, or overcontrol.'],
        ['Narrow-external focus', 'A tight focus on the immediate target or execution cue outside the body.'],
        ['Narrow-internal focus', 'A tight focus on body sensations, breathing, or internal regulation.'],
        ['Nonjudgmental thinking', 'Observing events accurately without labeling them as proof of personal worth or failure.'],
        ['Performance equation', "Gallwey's idea that performance equals potential minus interference."],
        ['Preperformance routine', 'A repeatable sequence of task-relevant thoughts and actions used before a skill or event.'],
        ['Quiet eye', 'A stable visual fixation on a task-relevant target immediately before movement execution.'],
        ['Selectivity', 'The ability to screen out irrelevant stimuli and focus on the most useful cues.'],
        ['Self 1', "Gallwey's label for the analytical, verbal, judgmental teller."],
        ['Self 2', "Gallwey's label for the automatic, intuitive, sensory doer."],
        ['Simulation training', 'Practice that reproduces competitive stressors such as noise, consequence, time pressure, or evaluation.'],
        ['What-if planning', 'Pre-deciding how to respond to likely distractions or disruptions before competition begins.']
      ]
    }
  ]
};

PHASE_CONTENT['phase-4'] = {
  eyebrow: 'Phase 4 lesson',
  heading: 'Winning the First Victory',
  subheading: 'Confidence, Envisioning, and Pre-Performance Control',
  summary: 'The first victory is won in the mind before the event begins. Confidence is built through evidence, protected through interpretation, and expressed through routine and vivid mental rehearsal.',
  sourcePdf: './assets/slides/04-toolkit.pdf',
  quizId: 'quiz-phase4-winning-the-first-victory',
  keyIdeas: [
    'Confidence becomes usable when it is based on evidence rather than mood or bravado.',
    'Protective thinking keeps one bad moment from turning into an identity story.',
    'Routine and multisensory rehearsal help certainty show up when pressure rises.'
  ],
  sections: [
    {
      title: 'Inside This Chapter',
      paragraphs: [
        'Confidence and envisioning are not soft extras that sit beside real training. They are part of the performance system itself. This chapter explains how performers build the first victory before pressure arrives: they create certainty through evidence, protect it from needless withdrawals, and mentally rehearse both success and recovery so the body can perform with less interference.',
        'Designed as a textbook-style chapter for study, teaching, and practical review.',
        'The first victory is won in the mind before the event begins.'
      ]
    },
    {
      title: 'Learning objectives',
      bullets: [
        'Define confidence in performance terms and distinguish it from arrogance, mood, and empty positivity.',
        'Differentiate state confidence, trait confidence, self-efficacy, and robust sport confidence.',
        'Explain how deposits, withdrawals, and the mental filter shape the confidence account.',
        'Apply protective tools such as constructive attitude lockdown, the flat tire drill, and the "So What?" review.',
        'Use the C-B-A routine to bridge preparation and live execution under pressure.',
        'Design imagery that is vivid, controlled, emotional, and matched to the timing of the actual task.'
      ]
    },
    {
      title: 'Chapter roadmap',
      bullets: [
        'What confidence is and why it supports automatic execution.',
        'State confidence, trait confidence, self-efficacy, and robust sport confidence.',
        'The confidence account: deposits, withdrawals, and mental filtering.',
        'Protective thinking, arousal reappraisal, and resilience under setbacks.',
        'The C-B-A pre-performance routine.',
        'Envisioning as multisensory mental rehearsal.',
        'Perspective, controllability, emotion, and real-time timing in imagery.',
        "The Mental Director's Toolkit and glossary."
      ],
      figures: [
        {
          src: './assets/readings/phase4-figures/phase4-chapter-map.png',
          alt: 'Chapter map showing confidence, protection, routine, and mental cinema feeding the first victory',
          caption: 'Figure 1. The chapter is built around one system: build certainty, protect it, then express it under pressure.'
        }
      ]
    },
    {
      title: '1. Foundations of Confidence',
      paragraphs: [
        'Confidence is often described vaguely as believing in yourself, but that description is too soft to be useful in performance settings. For performers, confidence is a working sense of certainty about ability that reduces unnecessary conscious interference. When a skill is well learned, execution is best when the performer can perceive, decide, and respond without micromanaging every movement or word. The more pressure rises, the more valuable that certainty becomes.',
        'This is why confidence should not be confused with showmanship, noise, or bravado. A performer can sound certain and still perform tentatively. Likewise, a calm and modest performer may compete with deep conviction. The meaningful question is functional: does confidence free attention and movement, or does doubt pull the performer back into judgment, hesitation, and overcontrol?',
        "Confidence and competence must also be kept distinct. Competence supplies the actual skill base. Confidence determines whether that skill is expressed under pressure. Without competence, confidence becomes fantasy. Without confidence, competence becomes trapped potential. The 'first victory' is won when the performer enters the arena already certain enough to let preparation show up."
      ],
      table: {
        headers: ['Construct', 'Definition', 'Why it matters'],
        rows: [
          ['State confidence', 'The performer’s momentary belief right now.', 'It rises and falls with recent events, context, and immediate interpretation.'],
          ['Trait confidence', 'A more stable tendency to feel assured across situations.', 'It shapes how often a person enters a situation expecting success.'],
          ['Self-efficacy', 'A task-specific judgment of capability for a particular challenge.', 'It can be strong in one domain and weak in another, and it is highly trainable.'],
          ['Robust sport confidence', 'A durable network of positive beliefs that resists environmental and psychological challenge.', 'It is built over time through evidence, self-regulation, and supportive climate.']
        ]
      }
    },
    {
      title: '2. Where Confidence Comes From',
      paragraphs: [
        'Several related constructs help clarify how confidence works. State confidence refers to how certain a performer feels in the moment. Trait confidence refers to a more stable tendency to feel assured across situations. Self-efficacy narrows the lens even further: it is the belief that one can execute a specific task successfully. Robust sport confidence describes a broader, more durable network of positive beliefs that helps a performer withstand challenge, evaluation, and environmental stress.',
        'Bandura’s self-efficacy framework explains why confidence is trainable rather than fixed. The strongest source is mastery experience - past evidence that the performer has actually done the thing or has built the ingredients for doing it. But mastery is not the only source. Modeling, persuasive coaching, imagery, preparation, and the meaning assigned to bodily arousal all shape a performer’s belief about what is possible right now.',
        'A constructive self-fulfilling prophecy develops when the performer expects capability and therefore perceives options, persists longer, and makes cleaner task-relevant decisions. A destructive prophecy does the opposite: it narrows attention toward threat, increases hesitation, and makes the performer search for signs that failure is coming.'
      ],
      table: {
        headers: ['Source', 'Practical deposit', 'Performance effect'],
        rows: [
          ['Mastery experiences', 'Review successful reps, competition highlights, and solved problems.', 'Direct evidence of capability makes this the most dependable source of certainty.'],
          ['Vicarious experiences', 'Observe similar others succeeding and study model performances.', 'It expands belief about what is possible and how it can be done.'],
          ['Verbal persuasion', 'Use constructive coaching language and believable present-tense self-talk.', 'It works best when it is specific, credible, and linked to preparation.'],
          ['Imaginal experiences', 'Rehearse success, decision sequences, and recovery responses in imagery.', 'Future execution feels more familiar before it happens.'],
          ['Physiological and emotional states', 'Interpret butterflies, racing heart, and activation as readiness.', 'The same arousal can become threat or fuel depending on meaning.'],
          ['Preparation and self-regulation', 'Use routines, plans, and repeated quality practice.', 'Preparation creates the sense that the performer has earned the right to feel certain.']
        ]
      }
    },
    {
      title: '3. The Confidence Account: Deposits, Withdrawals, and the Mental Filter',
      paragraphs: [
        'A useful way to organize confidence is to treat it like a mental bank account. Every memory, self-statement, and interpretation functions like a transaction. Deposits include remembered success, honest evidence of effort, noticed progress, quality preparation, and vivid mental rehearsal. Withdrawals occur when performers replay criticism, globalize mistakes, or treat temporary setbacks as proof that they are not ready.',
        'The account is managed by a mental filter. This filter decides what gets mentally retained and what gets released or reframed. Strong filters do not deny reality; they keep useful evidence available and convert setbacks into learning. Weak filters allow every bad moment to become a referendum on identity. That is why two performers can live through the same event and leave it with completely different confidence balances.'
      ],
      figures: [
        {
          src: './assets/readings/phase4-figures/phase4-confidence-account.png',
          alt: 'Confidence account diagram showing deposits on one side and withdrawals on the other',
          caption: 'Figure 2. Confidence behaves like an account balance: deposits strengthen usable certainty while withdrawals deplete it.'
        }
      ],
      bullets: [
        'Top Ten list: keep a written list of meaningful performances, solved problems, or breakthroughs so evidence stays available.',
        'Daily E-S-P: record one example of effort, success, and progress so ordinary days still produce deposits.',
        'After-action review: use What happened? So what did it mean? Now what will I do next? to turn each performance into learning and the next plan.'
      ]
    },
    {
      title: '4. Protecting Confidence Under Pressure',
      paragraphs: [
        'Confidence becomes fragile when errors are interpreted as global truths. One miss turns into "I am off today." One awkward start becomes "I am not built for this level." Protective thinking exists to stop that chain reaction. Its job is containment: the mistake is temporary, limited, and nonrepresentative.',
        'The same logic explains why performers benefit from rehearsing adversity instead of only rehearsing perfection. The flat tire drill asks the performer to imagine a likely disruption for a brief period, stop the scene, and then spend more time rehearsing the ideal response. When the disruption actually happens, the performer experiences familiarity instead of surprise and can move quickly toward the next controllable action.',
        'Another part of protection is how bodily activation is interpreted. Racing heart, tight stomach, and jittery hands are often read as proof that something is wrong. In many performance contexts, the same activation can also be understood as mobilized readiness.'
      ],
      figures: [
        {
          src: './assets/readings/phase4-figures/phase4-flat-tire-drill.png',
          alt: 'Flat tire drill diagram showing brief setback rehearsal followed by longer response rehearsal',
          caption: 'Figure 3. The flat tire drill rehearses likely adversity and, more importantly, the desired recovery response.'
        }
      ],
      bullets: [
        'Temporary: it happened once and does not define the whole event.',
        'Limited: it belongs to this area or this moment, not everything.',
        'Nonrepresentative: it is data, not a full statement about who you are.',
        'Arousal reframe: butterflies do not automatically mean danger; they can also mean mobilized readiness.'
      ]
    },
    {
      title: '5. The Routine Bridge: C-B-A',
      paragraphs: [
        'Even performers who have built strong confidence can struggle to access it in the instant of performance. The gap between preparation and expression often fills with thought traffic: outcomes, judgments, technique corrections, and self-conscious monitoring. A pre-performance routine serves as a bridge from a thinking mind to a performing body.',
        'The C-B-A routine is deliberately short. First, cue conviction with a brief, present-tense statement that reminds the performer who they are when prepared and at their best. Second, breathe the body with one or two controlled breaths that interrupt the panic spiral and convert activation into readiness. Third, attach attention to an external target, cue, or task-relevant focal point so that trained action can take over.',
        'The routine works best when it is specific, portable, and repeatable. It should not become a long motivational speech. The cue must be believable, the breath must be practiced, and the attentional target must actually matter for the task.'
      ],
      figures: [
        {
          src: './assets/readings/phase4-figures/phase4-cba-routine.png',
          alt: 'C-B-A routine diagram showing cue conviction, breathe your body, and attach your attention',
          caption: 'Figure 4. A short routine helps the performer cross from preparation into live execution.'
        }
      ],
      bullets: [
        'Cue conviction: use a brief believable statement that reconnects you to who you are when prepared.',
        'Breathe your body: one or two slow breaths interrupt the panic spiral and turn nervous energy into readiness.',
        'Attach your attention: lock onto an external cue or target so trained action can run.',
        'Design rules: keep the cue brief, practice the breath before you need it, and choose an attentional target that actually matters.'
      ]
    },
    {
      title: '6. Envisioning: The Mental Cinema',
      paragraphs: [
        'Visualization is a misleading label if it implies only sight. Effective imagery is better understood as envisioning or mental rehearsal: a multisensory simulation of a performance experience. The performer should see the scene, feel the movement, hear the environment, sense the rhythm, and include the emotional tone of successful action.',
        'Several theories explain why imagery can help. Psychoneuromuscular accounts argue that imagining action activates movement-related pathways in ways that support skill learning. Bioinformational accounts emphasize that images need both stimulus information and response information. Symbolic learning accounts suggest that imagery acts as a blueprint for sequencing, strategy, and action plans.',
        'Perspective matters. Internal imagery is usually strongest for timing, kinesthetic feel, and emotion. External imagery is helpful for analyzing form, posture, or overall action shape. Timing matters as well: the nervous system needs a blueprint that matches the speed of the actual task. Emotion matters too, because an image without felt energy is weak rehearsal.'
      ],
      figures: [
        {
          src: './assets/readings/phase4-figures/phase4-mental-cinema.png',
          alt: 'Mental cinema diagram showing vividness, control, timing, perspective, and emotion',
          caption: 'Figure 5. Effective imagery depends on vividness, perspective, control, emotion, and timing.'
        }
      ],
      table: {
        headers: ['Perspective', 'Best use', 'Practical note'],
        rows: [
          ['Internal / first person', 'Strongest for timing, feel, rhythm, kinesthetic cues, and emotional realism.', 'Use it when you want to inhabit the movement and feel the action from inside the body.'],
          ['External / third person', 'Useful for form analysis, posture checks, and viewing the whole action pattern.', 'Use it when you need to inspect mechanics, spacing, or tactical shape as an observer.'],
          ['Skilled use', 'Switch perspectives deliberately rather than randomly.', 'Feel the action from inside, then step outside briefly if you need a technical correction.']
        ]
      }
    },
    {
      title: "7. The Mental Director's Toolkit",
      paragraphs: [
        'A practical imagery system begins with a warm-up. In the prop check drill, the performer imagines a tool of the trade and mentally feels its weight, texture, and familiar movement. From there, the performer shifts to a GoPro perspective, seeing the action through their own eyes rather than as a spectator from the stands.',
        'The next layer is controllability. The director’s cut drill trains the performer to stop unhelpful scenes, rewind, and overwrite them with the correct execution. Real-time rehearsal then ensures that the action unfolds at the speed and rhythm of the true event. A private, familiar mental starting place can help by giving the performer a consistent place from which to begin each rehearsal session.',
        'A quick vividness test helps here too: if you imagine cutting into a lemon and biting it, your mouth may water. That response shows why vivid symbolic experience can trigger genuine physiological reaction.'
      ],
      table: {
        headers: ['Drill', 'Purpose'],
        rows: [
          ['Prop check', 'Warm up the imaging system by mentally handling an object: its weight, texture, shape, and familiar movement.'],
          ['GoPro perspective', 'Run the scene through your own eyes so the action feels inhabited rather than merely watched.'],
          ['Director’s cut', 'If a negative image appears, cut it, rewind to just before the error, and overwrite it with the correct action.'],
          ['Flat tire drill', 'See a realistic setback briefly, stop it, then spend longer rehearsing the composed response.'],
          ['Real-time rehearsal', 'Match the speed and rhythm of the real event so the mental blueprint fits the actual task.']
        ]
      },
      bullets: [
        'Quality check: Did I include multiple senses?',
        'Did I choose the right perspective for the training goal?',
        'Did I feel believable emotion?',
        'Did the scene unfold at real-task timing?'
      ]
    },
    {
      title: '8. Integrating the System',
      paragraphs: [
        'Confidence and envisioning should be treated as one integrated system rather than separate mental skills. Deposits from past performance create evidence. Protective thinking prevents unnecessary withdrawals. Envisioning makes future success and recovery more familiar. Routine bridges preparation and expression. After-action review then feeds the next cycle by turning today’s performance into tomorrow’s deposits.',
        'A simple weekly plan is enough to keep the system alive. Capture daily effort, success, and progress. Rehearse a cue phrase and a short breath-attention reset. Run several brief imagery sessions each week that include both successful execution and a calm response to likely setbacks. After performance, review facts, extract lessons, and plan the next action. The goal is not to feel inspired once; it is to manage certainty as an ongoing discipline.'
      ],
      bullets: [
        '1. Each day: record one item of effort, one success, and one sign of progress.',
        '2. Several times per week: run a short imagery session that includes both ideal execution and a calm response to a likely setback.',
        '3. Before performance: use the C-B-A routine to cue conviction, regulate the body, and narrow attention.',
        '4. After performance: review facts, lessons, and the next action rather than dwelling in vague self-criticism.'
      ]
    },
    {
      title: 'Common misunderstandings',
      table: {
        headers: ['Misunderstanding', 'Correction'],
        rows: [
          ['Confidence is the same as loudness.', 'High-functioning confidence can be quiet. The real test is whether it frees performance, not whether it sounds impressive.'],
          ['Positive thinking alone is enough.', 'Without competence, preparation, and evidence, positivity becomes wishful thinking rather than performance confidence.'],
          ['Imagery is just seeing pictures.', 'Effective envisioning is multisensory and embodied. The performer should feel timing, movement, context, and emotion.'],
          ['Protective thinking means denying mistakes.', 'The goal is not denial. It is to contain the mistake, extract learning, and prevent one event from becoming identity.']
        ]
      }
    },
    {
      title: 'End-of-chapter summary',
      bullets: [
        'Confidence is a trainable sense of certainty that allows well-learned skill to run with less conscious interference.',
        'The strongest confidence draws on evidence: mastery, preparation, imaginal rehearsal, constructive self-talk, and the meaning assigned to arousal.',
        'The confidence account grows through deposits such as success, effort, and progress, and it is protected by a mental filter that reframes setbacks.',
        'Protective tools work by containing damage: temporary, limited, nonrepresentative; stop and reset; learn, plan, and move on.',
        'A pre-performance routine bridges the gap between preparation and live performance by cueing conviction, regulating the body, and narrowing attention.',
        'Envisioning is deliberate mental rehearsal. It works best when it is vivid, emotionally believable, controlled, and timed like the real event.'
      ]
    },
    {
      title: 'Glossary of Essential Terms',
      paragraphs: [
        'Core vocabulary for quick review.'
      ],
      glossary: [
        ['C-B-A routine', 'A brief pre-performance sequence: cue conviction, breathe the body, and attach attention.'],
        ['Confidence', 'A sense of certainty about ability that allows a performer to execute with less conscious interference.'],
        ['Confidence account', 'A metaphor that treats thoughts, memories, and interpretations as deposits or withdrawals that influence certainty.'],
        ['Constructive attitude lockdown', 'A damage-control interpretation that treats errors as temporary, limited, and nonrepresentative.'],
        ['Controllability', 'The ability to direct and edit mental images so the desired action, not the feared mistake, is rehearsed.'],
        ['Daily E-S-P', 'A brief daily log of effort, success, and progress used to create deposits in confidence.'],
        ['Envisioning', 'Deliberate, multisensory mental rehearsal of a desired future performance or response.'],
        ['Flat tire drill', 'A resilience drill that rehearses likely setbacks and a composed recovery response.'],
        ['Imaginal experiences', 'Imagery-based experiences that shape efficacy beliefs by mentally rehearsing successful action.'],
        ['Internal perspective', 'Seeing the action through your own eyes; usually best for feel, timing, and emotion.'],
        ['Mental filter', 'The interpretive process that approves confidence-building evidence and blocks or reframes withdrawals.'],
        ['Psychoneuromuscular theory', 'The view that imagery activates movement-related pathways in a way that can support skill learning.'],
        ['Real-time rehearsal', 'Running imagery at the speed of the actual event so the mental representation matches the task.'],
        ['Robust sport confidence', 'A durable set of positive beliefs that protects performance from challenge and pressure.'],
        ['Self-efficacy', 'A task-specific belief that one can organize and execute the actions required for success.'],
        ['State confidence', 'The performer’s immediate, situation-bound sense of certainty.'],
        ['Trait confidence', 'A more stable tendency to feel assured across time and situations.'],
        ['Vividness', 'The clarity and sensory richness of mental imagery.']
      ]
    }
  ]
};

const ASSIGNMENT_RUNTIME_VIEW = {
  a0: 'intro',
  a1: 'phase1',
  a2a: 'values',
  a2b: 'master',
  a3: 'phase3',
  a4a: 'phase4a',
  a4b: 'phase4b'
};

const ASSIGNMENT_RUNTIME_HTML_SRC = './assignment-runtime.html';
const ASSIGNMENT_RUNTIME_SCRIPT_SRC = './assignment-runtime-main.js';
const ASSIGNMENT_RUNTIME_TAILWIND_SRC = 'https://cdn.tailwindcss.com';
const ASSIGNMENT_RUNTIME_FONTS_HREF = 'https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap';

const assignmentRuntimeState = {
  htmlPromise: null,
  runtimePromise: null,
  tailwindPromise: null,
  fontsPromise: null,
  viewMarkup: new Map(),
  requestToken: 0
};

const state = {
  section: 'home',
  tab: 'phases',
  activeId: PHASES[0]?.id || null,
  activePerformanceView: 'menu',
  activePerformanceToolId: PERFORMANCE_TOOLS[0]?.id || null,
  activeFilmRoomVideoId: FILM_ROOM_VIDEOS[0]?.id || null,
  activeStep: 0,
  activeMaterialId: null
};

const AUTHORING_UNLOCK_ALL = true;
const COURSE_PROGRESS_KEY = 'sportswellness.course-progress.v1';
const UI_STATE_KEY = 'sportswellness.ui-state.v1';
const PHASE_ASSIGNMENT_MAP = {
  'phase-0': ['a0'],
  'phase-1': ['a1'],
  'phase-2': ['a2a', 'a2b'],
  'phase-3': ['a3'],
  'phase-4': ['a4a', 'a4b']
};
const ASSIGNMENT_PHASE_MAP = Object.fromEntries(
  Object.entries(PHASE_ASSIGNMENT_MAP).flatMap(([phaseId, assignmentIds]) => assignmentIds.map((assignmentId) => [assignmentId, phaseId]))
);
const PHASE_QUIZ_MAP = Object.fromEntries(QUIZZES.filter((item) => item.phaseId).map((item) => [item.phaseId, item.id]));

function loadStoredJson(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function getDefaultActiveIdForTab(tab) {
  if (tab === 'quizzes') return QUIZZES[0]?.id || null;
  if (tab === 'assignments') return ASSIGNMENTS[0]?.id || null;
  return PHASES[0]?.id || null;
}

function normalizeUiState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return null;
  }

  const nextSection = typeof rawState.section === 'string' ? rawState.section : 'home';
  const nextTab = typeof rawState.tab === 'string' ? rawState.tab : 'phases';
  const normalized = {
    section: ['home', 'phase', 'assignment', 'quiz', 'library', 'performance', 'icons'].includes(nextSection) ? nextSection : 'home',
    tab: ['phases', 'quizzes', 'assignments'].includes(nextTab) ? nextTab : 'phases',
    activeId: null,
    activePerformanceToolId: PERFORMANCE_TOOLS.some((item) => item.id === rawState.activePerformanceToolId)
      ? rawState.activePerformanceToolId
      : (PERFORMANCE_TOOLS[0]?.id || null),
    activeFilmRoomVideoId: FILM_ROOM_VIDEOS.some((item) => item.id === rawState.activeFilmRoomVideoId)
      ? rawState.activeFilmRoomVideoId
      : (FILM_ROOM_VIDEOS[0]?.id || null),
    activeStep: Number.isFinite(Number(rawState.activeStep)) ? Math.max(0, Number(rawState.activeStep)) : 0,
    activeMaterialId: MATERIALS.some((item) => item.id === rawState.activeMaterialId) ? rawState.activeMaterialId : null
  };

  if (normalized.section === 'phase') {
    normalized.activeId = PHASES.some((item) => item.id === rawState.activeId) ? rawState.activeId : (PHASES[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'assignment') {
    normalized.activeId = ASSIGNMENTS.some((item) => item.id === rawState.activeId) ? rawState.activeId : (ASSIGNMENTS[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'quiz') {
    normalized.activeId = QUIZZES.some((item) => item.id === rawState.activeId) ? rawState.activeId : (QUIZZES[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'performance') {
    normalized.activeId = getDefaultActiveIdForTab(normalized.tab);
    return normalized;
  }

  normalized.activeId = getDefaultActiveIdForTab(normalized.tab);
  return normalized;
}

function applyUiStateSnapshot(snapshot) {
  if (!snapshot) return;
  state.section = snapshot.section;
  state.tab = snapshot.tab;
  state.activeId = snapshot.activeId;
  state.activePerformanceToolId = snapshot.activePerformanceToolId;
  state.activeFilmRoomVideoId = snapshot.activeFilmRoomVideoId;
  state.activeStep = snapshot.activeStep;
  state.activeMaterialId = snapshot.activeMaterialId;
}

function persistUiState() {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify({
      section: state.section,
      tab: state.tab,
      activeId: state.activeId,
      activePerformanceToolId: state.activePerformanceToolId,
      activeFilmRoomVideoId: state.activeFilmRoomVideoId,
      activeStep: state.activeStep,
      activeMaterialId: state.activeMaterialId
    }));
  } catch (_error) {
    // Ignore storage failures so the course still works in constrained contexts.
  }
}

function restoreUiState() {
  applyUiStateSnapshot(normalizeUiState(loadStoredJson(UI_STATE_KEY)));
}

function loadCourseProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
    return {
      completedPhases: parsed.completedPhases && typeof parsed.completedPhases === 'object' ? parsed.completedPhases : {},
      passedQuizzes: parsed.passedQuizzes && typeof parsed.passedQuizzes === 'object' ? parsed.passedQuizzes : {},
      quizAttempts: parsed.quizAttempts && typeof parsed.quizAttempts === 'object' ? parsed.quizAttempts : {},
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {}
    };
  } catch (error) {
    return {
      completedPhases: {},
      passedQuizzes: {},
      quizAttempts: {},
      quizScores: {}
    };
  }
}

const courseProgress = loadCourseProgress();

function saveCourseProgress() {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(courseProgress));
}

function getPhaseById(phaseId) {
  return PHASES.find((item) => item.id === phaseId) || null;
}

function getQuizById(quizId) {
  return QUIZZES.find((item) => item.id === quizId) || null;
}

function getPerformanceToolById(toolId) {
  return PERFORMANCE_TOOLS.find((item) => item.id === toolId) || null;
}

function getFilmRoomVideoById(videoId) {
  return FILM_ROOM_VIDEOS.find((item) => item.id === videoId) || null;
}

function getPhaseIndex(phaseId) {
  return PHASES.findIndex((item) => item.id === phaseId);
}

function getNextPhase(phaseId) {
  const nextIndex = getPhaseIndex(phaseId) + 1;
  return PHASES[nextIndex] || null;
}

function getQuizForPhase(phaseId) {
  return getQuizById(PHASE_QUIZ_MAP[phaseId] || '');
}

function getAssignmentsForPhase(phaseId) {
  return (PHASE_ASSIGNMENT_MAP[phaseId] || []).map((assignmentId) => ASSIGNMENTS.find((item) => item.id === assignmentId)).filter(Boolean);
}

function isPhaseComplete(phaseId) {
  return !!courseProgress.completedPhases[phaseId];
}

function isQuizPassed(quizId) {
  return !!courseProgress.passedQuizzes[quizId];
}

function isPhaseUnlocked(phaseId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const phaseIndex = getPhaseIndex(phaseId);
  if (phaseIndex <= 0) return true;
  const previousPhase = PHASES[phaseIndex - 1];
  const previousQuiz = getQuizForPhase(previousPhase.id);
  return previousQuiz ? isQuizPassed(previousQuiz.id) : isPhaseComplete(previousPhase.id);
}

function isQuizUnlocked(quizId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const quiz = getQuizById(quizId);
  return quiz ? isPhaseComplete(quiz.phaseId) : true;
}

function isAssignmentUnlocked(assignmentId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const phaseId = ASSIGNMENT_PHASE_MAP[assignmentId];
  if (!phaseId) return true;
  const linkedQuiz = getQuizForPhase(phaseId);
  return linkedQuiz ? isQuizPassed(linkedQuiz.id) : isPhaseComplete(phaseId);
}

function getPhaseUnlockRequirement(phaseId) {
  const phaseIndex = getPhaseIndex(phaseId);
  if (phaseIndex <= 0) {
    return 'Available now.';
  }

  const previousPhase = PHASES[phaseIndex - 1];
  const previousQuiz = getQuizForPhase(previousPhase.id);
  if (previousQuiz) {
    return `Pass ${previousQuiz.code} with 70% to unlock.`;
  }
  return `Mark ${previousPhase.code} complete to unlock.`;
}

function getQuizUnlockRequirement(quizId) {
  const quiz = getQuizById(quizId);
  if (!quiz) return 'Locked.';
  const phase = getPhaseById(quiz.phaseId);
  return phase ? `Mark ${phase.code} complete to unlock.` : 'Locked.';
}

function getAssignmentUnlockRequirement(assignmentId) {
  const phaseId = ASSIGNMENT_PHASE_MAP[assignmentId];
  const phase = getPhaseById(phaseId);
  const linkedQuiz = getQuizForPhase(phaseId);
  if (linkedQuiz) {
    return `Pass ${linkedQuiz.code} with 70% to unlock.`;
  }
  return phase ? `Mark ${phase.code} complete to unlock.` : 'Locked.';
}

function markPhaseComplete(phaseId) {
  if (isPhaseComplete(phaseId)) return;
  courseProgress.completedPhases[phaseId] = true;
  saveCourseProgress();
  render();
}

function submitQuizResult(quizId, scorePercent) {
  courseProgress.quizAttempts[quizId] = (courseProgress.quizAttempts[quizId] || 0) + 1;
  courseProgress.quizScores[quizId] = Math.max(courseProgress.quizScores[quizId] || 0, scorePercent);
  if (scorePercent >= 70) {
    courseProgress.passedQuizzes[quizId] = true;
  }
  saveCourseProgress();
  render();
}

function getProgressSnapshot() {
  const completedPhases = PHASES.filter((item) => isPhaseComplete(item.id)).length;
  const passedQuizzes = QUIZZES.filter((item) => isQuizPassed(item.id)).length;
  const total = PHASES.length + QUIZZES.length;
  const complete = completedPhases + passedQuizzes;
  return {
    completedPhases,
    totalPhases: PHASES.length,
    passedQuizzes,
    totalQuizzes: QUIZZES.length,
    total,
    complete,
    percent: total ? Math.round((complete / total) * 100) : 0
  };
}

const refs = {
  sectionTitle: document.getElementById('section-title'),
  contentBody: document.getElementById('content-body'),
  progressShell: document.querySelector('.progress-shell'),
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percent'),
  progressCounters: Array.from(document.querySelectorAll('.progress-counters span')),
  progressModulesCount: document.querySelector('.progress-meta strong'),
  navHome: document.getElementById('nav-home'),
  navLibrary: document.getElementById('nav-library'),
  navPerformance: document.getElementById('nav-performance'),
  navIcons: document.getElementById('nav-icons'),
  tabPhases: document.getElementById('tab-phases'),
  tabQuizzes: document.getElementById('tab-quizzes'),
  tabAssignments: document.getElementById('tab-assignments'),
  collapseToggle: document.getElementById('menu-collapse-toggle')
};

const COMPACT_LAYOUT_BREAKPOINT = 1180;

function isCompactLayout() {
  return window.matchMedia(`(max-width: ${COMPACT_LAYOUT_BREAKPOINT}px)`).matches;
}

function applySidebarCollapse(collapsed) {
  const compact = isCompactLayout();
  document.body.classList.toggle('compact-layout', compact);
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  document.body.classList.toggle('mobile-menu-open', compact && !collapsed);
  if (refs.collapseToggle) {
    refs.collapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    refs.collapseToggle.title = compact
      ? (collapsed ? 'Open menu' : 'Close menu')
      : (collapsed ? 'Expand menu' : 'Collapse menu');
  }
}

function toggleSidebarCollapse() {
  const next = !document.body.classList.contains('sidebar-collapsed');
  applySidebarCollapse(next);
  if (!isCompactLayout()) {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0');
  }
}

function collapseCompactMenu() {
  if (!isCompactLayout()) return;
  applySidebarCollapse(true);
}

function getCollection() {
  if (state.tab === 'phases') return PHASES;
  if (state.tab === 'quizzes') return QUIZZES;
  if (state.tab === 'assignments') return ASSIGNMENTS;
  return [];
}

function setSection(section) {
  const previous = state.section;
  state.section = section;
  if (section !== 'library') {
    state.activeMaterialId = null;
  }
  if (section === 'home' && previous !== 'home') {
    state.tab = 'phases';
    state.activeId = PHASES[0]?.id || null;
  }
  if (section === 'performance' && !getPerformanceToolById(state.activePerformanceToolId)) {
    state.activePerformanceToolId = PERFORMANCE_TOOLS[0]?.id || null;
  }
  if (section === 'icons' && !getFilmRoomVideoById(state.activeFilmRoomVideoId)) {
    state.activeFilmRoomVideoId = FILM_ROOM_VIDEOS[0]?.id || null;
  }
  if (section === 'performance') {
    state.activePerformanceView = 'menu';
  }
  if (section !== 'home') {
    state.tab = 'phases';
  }
  collapseCompactMenu();
  persistUiState();
  render();
}

function setTab(tab) {
  state.section = 'home';
  state.tab = tab;
  const collection = getCollection();
  state.activeId = collection[0]?.id || null;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openPhase(id) {
  if (!isPhaseUnlocked(id)) return;
  if (id === 'phase-0') {
    openAssignment('a0');
    return;
  }
  state.section = 'phase';
  state.activeId = id;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openAssignment(id) {
  if (!isAssignmentUnlocked(id)) return;
  state.section = 'assignment';
  state.activeId = id;
  state.activeStep = 0;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openQuiz(id) {
  if (!isQuizUnlocked(id)) return;
  state.section = 'quiz';
  state.activeId = id;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openPerformanceTool(id) {
  if (!getPerformanceToolById(id)) return;
  state.section = 'performance';
  state.activePerformanceToolId = id;
  state.activePerformanceView = 'player';
  collapseCompactMenu();
  persistUiState();
  render();
}

function closePerformanceTool() {
  state.section = 'performance';
  state.activePerformanceView = 'menu';
  collapseCompactMenu();
  persistUiState();
  render();
}

function selectFilmRoomVideo(id) {
  if (!getFilmRoomVideoById(id)) return;
  state.section = 'icons';
  state.activeFilmRoomVideoId = id;
  persistUiState();
  render();
}

function openMaterial(id) {
  state.activeMaterialId = id;
  persistUiState();
  renderLibrary();
}

function closeMaterialViewer() {
  state.activeMaterialId = null;
  persistUiState();
  renderLibrary();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAppsScriptAssetId(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, window.location.href);
    return parsedUrl.searchParams.get('asset');
  } catch (error) {
    return null;
  }
}

function getAppsScriptRawAssetUrl(url) {
  const assetId = getAppsScriptAssetId(url);
  if (!assetId || typeof window.__CH_ASSET_RAW__ !== 'function') {
    return url;
  }

  return window.__CH_ASSET_RAW__(assetId);
}

function getEmbeddedTextAsset(url) {
  const assetId = getAppsScriptAssetId(url);
  if (!assetId || typeof window.__CH_TEXT_ASSET__ !== 'function') {
    return null;
  }

  const embeddedTextAsset = window.__CH_TEXT_ASSET__(assetId);
  return typeof embeddedTextAsset === 'string' ? embeddedTextAsset : null;
}

async function fetchTextAsset(url) {
  const embeddedTextAsset = getEmbeddedTextAsset(url);
  if (typeof embeddedTextAsset === 'string') {
    return embeddedTextAsset;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.text();
}

async function setPerformanceFrameSource(frame, url) {
  if (!frame) {
    return;
  }

  if (!url) {
    frame.removeAttribute('src');
    frame.srcdoc = '';
    return;
  }

  if (getAppsScriptAssetId(url) && typeof window.__CH_ASSET_RAW__ === 'function') {
    const html = await fetchTextAsset(getAppsScriptRawAssetUrl(url));
    frame.removeAttribute('src');
    frame.srcdoc = html;
    return;
  }

  frame.removeAttribute('srcdoc');
  frame.src = url;
}

function renderReadingTable(table) {
  return `
    <div class="reading-table-wrap">
      <table class="reading-table">
        <thead>
          <tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${table.rows.map((row) => `
            <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

const quizDrafts = {};

function getQuizDraft(quizId) {
  if (!quizDrafts[quizId]) {
    quizDrafts[quizId] = {
      questionIndex: 0,
      answersByQuestion: {},
      feedbackByQuestion: {}
    };
  }
  return quizDrafts[quizId];
}

function setQuizDraft(quizId, nextDraft) {
  quizDrafts[quizId] = nextDraft;
  if (state.section === 'quiz' && state.activeId === quizId) {
    renderQuizDetail();
  }
}

function setAssignmentStep(step) {
  state.activeStep = step;
  render();
}

function renderNavState() {
  refs.navHome.classList.toggle('active', state.section === 'home' || state.section === 'phase' || state.section === 'quiz');
  refs.navLibrary.classList.toggle('active', state.section === 'library');
  refs.navPerformance.classList.toggle('active', state.section === 'performance');
  refs.navIcons.classList.toggle('active', state.section === 'icons');

  refs.tabPhases.classList.toggle('active', (state.section === 'home' && state.tab === 'phases') || state.section === 'phase');
  refs.tabQuizzes.classList.toggle('active', (state.section === 'home' && state.tab === 'quizzes') || state.section === 'quiz');
  refs.tabAssignments.classList.toggle('active', (state.section === 'home' && state.tab === 'assignments') || state.section === 'assignment');
}

function renderHome() {
  if (state.tab === 'phases') {
    refs.sectionTitle.textContent = 'Training Modules';
    refs.contentBody.innerHTML = `
      <div class="modules-grid">
        ${PHASES.map((item) => {
          const locked = !isPhaseUnlocked(item.id);
          return `
          <button type="button" class="module-tile${locked ? ' is-locked' : ''}" data-id="${item.id}" style="--tile-accent:${item.accent}"${locked ? ' disabled' : ''}>
            <article class="module-card${item.id === state.activeId ? ' is-active' : ''}">
              <img src="${item.image}" alt="${item.title}" />
              <div class="module-copy">
                <p class="module-code">${item.code}</p>
                <h4 class="module-title">${item.code}<br />${item.title}</h4>
                <div class="module-state">${locked ? getPhaseUnlockRequirement(item.id) : isPhaseComplete(item.id) ? 'Completed' : 'Open module'}</div>
              </div>
            </article>
          </button>
        `;
        }).join('')}
      </div>
    `;

    refs.contentBody.querySelectorAll('[data-id]').forEach((button) => {
      button.addEventListener('click', () => openPhase(button.dataset.id));
    });
    return;
  }

  if (state.tab === 'quizzes') {
    renderQuizzes();
    return;
  }

  if (state.tab === 'assignments') {
    renderAssignments();
    return;
  }

  refs.sectionTitle.textContent = 'Training Modules';
  refs.contentBody.innerHTML = '';
}

function renderPhaseCompletionCard(active) {
  const linkedQuiz = getQuizForPhase(active.id);
  const linkedAssignments = getAssignmentsForPhase(active.id);
  const nextPhase = getNextPhase(active.id);
  const isComplete = isPhaseComplete(active.id);
  const assignmentTitles = linkedAssignments.map((item) => `${item.code}: ${item.title}`).join(', ');

  let statusCopy = 'Mark this phase complete to record progress.';
  if (linkedQuiz) {
    statusCopy = isComplete
      ? isQuizPassed(linkedQuiz.id)
        ? `Quiz passed. ${assignmentTitles ? `${assignmentTitles} unlocked.` : ''}${nextPhase ? ` ${nextPhase.code}: ${nextPhase.title} is now open.` : ''}`.trim()
        : `${linkedQuiz.code} is now unlocked. Score 70% or better to open ${assignmentTitles || 'the assignment'}${nextPhase ? ` and ${nextPhase.code}: ${nextPhase.title}` : ''}.`
      : `This unlocks ${linkedQuiz.code}. A 70% quiz score opens ${assignmentTitles || 'the assignment'}${nextPhase ? ` and ${nextPhase.code}: ${nextPhase.title}` : ''}.`;
  } else if (linkedAssignments.length || nextPhase) {
    const unlockTargets = [];
    if (assignmentTitles) unlockTargets.push(assignmentTitles);
    if (nextPhase) unlockTargets.push(`${nextPhase.code}: ${nextPhase.title}`);
    statusCopy = isComplete
      ? `${unlockTargets.join(' and ')} unlocked.`
      : `This unlocks ${unlockTargets.join(' and ')}.`;
  } else if (isComplete) {
    statusCopy = 'Phase completion recorded.';
  }

  return `
    <article class="stack-card phase-complete-card" style="border-left-color: ${active.accent}">
      <p class="reading-eyebrow">Phase progress</p>
      <h4>${isComplete ? 'Phase complete' : 'Mark complete'}</h4>
      <p>${escapeHtml(statusCopy)}</p>
      <div class="reading-actions">
        <button type="button" class="reading-btn reading-btn-primary" id="phase-mark-complete"${isComplete ? ' disabled' : ''}>${isComplete ? 'Completed' : 'Mark complete'}</button>
      </div>
    </article>
  `;
}

function renderPhaseDetail() {
  const active = PHASES.find((item) => item.id === state.activeId) || PHASES[0];
  const content = PHASE_CONTENT[active.id];
  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
  if (content) {
    refs.contentBody.innerHTML = `
      <div class="reading-shell">
        <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
          <div class="reading-hero-head">
            <div class="reading-title-block">
              <p class="reading-eyebrow">${escapeHtml(content.eyebrow)}</p>
              <h4 class="reading-hero-title">${escapeHtml(content.heading)}</h4>
            </div>
            <div class="reading-actions reading-hero-actions">
              <button type="button" class="reading-btn reading-btn-secondary" id="back-to-home">Back to phase picker</button>
              ${content.quizId ? `<button type="button" class="reading-btn reading-btn-secondary" id="open-linked-quiz"${isQuizUnlocked(content.quizId) ? '' : ' disabled'}>${isQuizUnlocked(content.quizId) ? 'Open phase quiz' : 'Quiz locked until mark complete'}</button>` : ''}
            </div>
          </div>
          <p class="reading-subtitle">${escapeHtml(content.subheading)}</p>
          ${content.summary ? `<p class="reading-lead">${escapeHtml(content.summary)}</p>` : ''}
          ${content.heroFigure ? `<figure class="reading-hero-figure"><img src="${content.heroFigure.src}" alt="${escapeHtml(content.heroFigure.alt || '')}">${content.heroFigure.caption ? `<figcaption>${escapeHtml(content.heroFigure.caption)}</figcaption>` : ''}</figure>` : ''}
        </article>
        ${content.sections.map((section) => `
          <section class="stack-card reading-section" style="border-left-color: ${active.accent}">
            <h4>${escapeHtml(section.title)}</h4>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            ${section.figures?.length ? `
              <div class="reading-media-grid${section.figures.length === 1 ? ' single' : ''}">
                ${section.figures.map((figure) => `
                  <figure class="reading-figure">
                    <img src="${figure.src}" alt="${escapeHtml(figure.alt || '')}">
                    ${figure.caption ? `<figcaption>${escapeHtml(figure.caption)}</figcaption>` : ''}
                  </figure>
                `).join('')}
              </div>
            ` : ''}
            ${section.bullets?.length ? `<ul class="reading-list">${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
            ${section.table ? renderReadingTable(section.table) : ''}
            ${section.glossary?.length ? `
              <dl class="glossary-grid">
                ${section.glossary.map(([term, definition]) => `
                  <div class="glossary-card">
                    <dt>${escapeHtml(term)}</dt>
                    <dd>${escapeHtml(definition)}</dd>
                  </div>
                `).join('')}
              </dl>
            ` : ''}
          </section>
        `).join('')}
        ${renderPhaseCompletionCard(active)}
      </div>
    `;
    document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
    document.getElementById('open-linked-quiz')?.addEventListener('click', () => openQuiz(content.quizId));
    document.getElementById('phase-mark-complete')?.addEventListener('click', () => markPhaseComplete(active.id));
    return;
  }

  refs.contentBody.innerHTML = `
    <div class="stack-list">
      <article class="stack-card" style="border-left-color: ${active.accent}">
        <h4>${active.code}: ${active.title}</h4>
        <p>${active.body}</p>
      </article>
      <button type="button" class="stack-card" id="back-to-home" style="text-align:left; cursor:pointer;">
        <h4>Back to phase picker</h4>
        <p>Return to the module grid.</p>
      </button>
      ${renderPhaseCompletionCard(active)}
    </div>
  `;
  document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
  document.getElementById('phase-mark-complete')?.addEventListener('click', () => markPhaseComplete(active.id));
}

function renderLibrary() {
  const activeMaterial = MATERIALS.find((item) => item.id === state.activeMaterialId) || null;
  const viewerSrc = activeMaterial
    ? `./pdf-viewer.html?file=${encodeURIComponent(activeMaterial.file)}&title=${encodeURIComponent(activeMaterial.title)}`
    : '';
  refs.sectionTitle.textContent = 'Course Materials';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${activeMaterial ? `
        <article class="stack-card" style="border-left-color: ${activeMaterial.color}; padding:0; overflow:hidden;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid rgba(120,140,180,0.18); background:rgba(8,13,22,0.72); flex-wrap:wrap;">
            <div>
              <p class="mono" style="margin:0 0 4px; color:${activeMaterial.color}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${activeMaterial.code}</p>
              <h4 style="margin:0;">${activeMaterial.title}</h4>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <a href="${activeMaterial.file}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; background:${activeMaterial.color}; color:#07111d; text-decoration:none; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;">Download PDF</a>
              <button type="button" id="close-material-viewer" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; border:1px solid rgba(120,140,180,0.3); background:#162033; color:#eef4ff; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer;">Close Viewer</button>
            </div>
          </div>
          <iframe src="${viewerSrc}" title="${activeMaterial.title}" style="display:block; width:100%; min-height:760px; border:0; background:#0b1220;"></iframe>
        </article>
      ` : ''}
      ${MATERIALS.map((item) => `
        <article class="stack-card" style="border-left-color: ${item.color}">
          <p class="mono" style="margin:0 0 6px; color:${item.color}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            <button type="button" data-open-material="${item.id}" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; border:1px solid rgba(120,140,180,0.3); background:#162033; color:#eef4ff; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer;">View Slides</button>
            <a href="${item.file}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; background:${item.color}; color:#07111d; text-decoration:none; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;">Download PDF</a>
          </div>
        </article>
      `).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-open-material]').forEach((button) => {
    button.addEventListener('click', () => openMaterial(button.dataset.openMaterial));
  });
  document.getElementById('close-material-viewer')?.addEventListener('click', closeMaterialViewer);
}

function renderQuizzes() {
  refs.sectionTitle.textContent = 'Quiz Library';
  if (!QUIZZES.length) {
    refs.contentBody.innerHTML = `
      <div class="empty-card">
        <h4>No quizzes loaded yet</h4>
        <p>Quiz scaffolds can be added here without changing the shell structure.</p>
      </div>
    `;
    return;
  }

  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${QUIZZES.map((item) => {
        const locked = !isQuizUnlocked(item.id);
        return `
        <button type="button" class="stack-card stack-card-button${locked ? ' is-locked' : ''}" data-quiz-id="${item.id}" style="border-left-color: ${item.accent}"${locked ? ' disabled' : ''}>
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:20px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${locked ? getQuizUnlockRequirement(item.id) : item.body}</p>
          <div class="reading-chip-row" style="margin-top:14px;">
            <span class="reading-chip">${item.questionCount} questions</span>
            <span class="reading-chip">Multiple choice</span>
            <span class="reading-chip">${locked ? 'Locked' : isQuizPassed(item.id) ? 'Passed' : '70% to pass'}</span>
          </div>
        </button>
      `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-quiz-id]').forEach((button) => {
    button.addEventListener('click', () => openQuiz(button.dataset.quizId));
  });
}

function renderQuizDetail() {
  const active = QUIZZES.find((item) => item.id === state.activeId) || QUIZZES[0];
  const activePhase = getPhaseById(active.phaseId);
  const draft = getQuizDraft(active.id);
  const questions = active.questions || [];
  const questionIndex = Math.min(Math.max(draft.questionIndex || 0, 0), Math.max(questions.length - 1, 0));
  const activeQuestion = questions[questionIndex];
  const currentSelected = activeQuestion ? draft.answersByQuestion[activeQuestion.id] : undefined;
  const showFeedback = activeQuestion ? !!draft.feedbackByQuestion[activeQuestion.id] : false;
  const correct = activeQuestion ? currentSelected === activeQuestion.answerIndex : false;
  const answeredCount = questions.filter((question) => draft.answersByQuestion[question.id] !== undefined).length;
  const correctCount = questions.filter((question) => draft.answersByQuestion[question.id] === question.answerIndex).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const scorePercent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const attempts = courseProgress.quizAttempts[active.id] || 0;
  const bestScore = courseProgress.quizScores[active.id] || 0;
  const passed = isQuizPassed(active.id);
  const unlockAssignments = getAssignmentsForPhase(active.phaseId).map((item) => `${item.code}: ${item.title}`).join(', ');
  const nextPhase = getNextPhase(active.phaseId);
  refs.sectionTitle.textContent = active.title;
  refs.contentBody.innerHTML = `
    <div class="quiz-detail-shell">
      <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
        <p class="reading-eyebrow">${escapeHtml(active.code)}</p>
        <h4 class="reading-hero-title">${escapeHtml(active.title)}</h4>
        <p class="reading-lead">${escapeHtml(active.body)}</p>
        <div class="reading-chip-row">
          <span class="reading-chip">${active.questionCount} questions</span>
          <span class="reading-chip">${answeredCount}/${questions.length} answered</span>
          <span class="reading-chip">${correctCount}/${questions.length} correct</span>
        </div>
        <div class="reading-actions">
          <a class="reading-btn reading-btn-primary" href="${active.sourcePdf}" target="_blank" rel="noopener noreferrer">Source PDF</a>
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-quizzes">Back to quizzes</button>
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-phase">Back to ${escapeHtml(activePhase ? activePhase.code.toLowerCase() : 'phase')}</button>
        </div>
      </article>
      <section class="stack-card quiz-question-card quiz-interactive-card" style="border-left-color: ${active.accent}">
        ${questions.length > 1 ? `
          <div class="quiz-question-nav">
            ${questions.map((question, index) => `
              <button
                type="button"
                class="quiz-question-pill${index === questionIndex ? ' is-active' : ''}"
                data-quiz-nav-index="${index}"
              >
                Q${index + 1}${draft.answersByQuestion[question.id] !== undefined ? ' •' : ''}
              </button>
            `).join('')}
          </div>
        ` : ''}
        <div class="quiz-progress-track">
          <div class="quiz-progress-fill" style="width:${questions.length ? (answeredCount / questions.length) * 100 : 0}%"></div>
        </div>
        ${activeQuestion ? `
          <p class="reading-eyebrow">Question ${questionIndex + 1} of ${questions.length}</p>
          <h4>${escapeHtml(activeQuestion.question)}</h4>
          <div class="quiz-choice-list">
            ${activeQuestion.choices.map((choice, index) => `
              <button
                type="button"
                class="quiz-choice-btn${currentSelected === index ? ' is-selected' : ''}"
                data-choice-index="${index}"
              >
                <span class="quiz-choice-label">${String.fromCharCode(65 + index)}.</span>
                <span>${escapeHtml(choice)}</span>
              </button>
            `).join('')}
          </div>
          <div class="quiz-action-row">
            <button type="button" class="reading-btn reading-btn-primary" id="quiz-check-answer"${currentSelected === undefined ? ' disabled' : ''}>Check answer</button>
            <button type="button" class="reading-btn reading-btn-secondary" id="quiz-clear-answer">Clear answer</button>
            <button type="button" class="reading-btn reading-btn-secondary" id="quiz-retake">Retake quiz</button>
            ${questionIndex < questions.length - 1 ? '<button type="button" class="reading-btn reading-btn-secondary" id="quiz-next-question">Next question</button>' : ''}
            <button type="button" class="reading-btn reading-btn-primary" id="quiz-submit"${allAnswered ? '' : ' disabled'}>Submit quiz</button>
          </div>
          ${showFeedback && currentSelected !== undefined ? `
            <div class="quiz-feedback-card${correct ? ' is-correct' : ' is-wrong'}">
              <div class="quiz-feedback-title">${correct ? 'Correct' : 'Wrong'}</div>
              <p>The correct answer is <strong>${escapeHtml(activeQuestion.choices[activeQuestion.answerIndex])}</strong>.</p>
              <p>${escapeHtml(activeQuestion.explanation)}</p>
            </div>
          ` : ''}
          <div class="quiz-feedback-card quiz-submit-card${passed ? ' is-correct' : attempts ? ' is-wrong' : ''}">
            <div class="quiz-feedback-title">${passed ? 'Quiz passed' : attempts ? 'Needs 70% to unlock next content' : 'Submit quiz to continue'}</div>
            <p>${passed ? `Best score: ${bestScore}%.` : attempts ? `Best score so far: ${bestScore}%.` : `Answer all ${questions.length} questions, then submit the quiz.`}</p>
            <p>${passed ? `${unlockAssignments || 'The assignment'} unlocked.${nextPhase ? ` ${nextPhase.code}: ${nextPhase.title} is now open.` : ''}` : `A 70% score unlocks ${unlockAssignments || 'the assignment'}${nextPhase ? ` and ${nextPhase.code}: ${nextPhase.title}` : ''}. Retakes are allowed.`}</p>
          </div>
        ` : '<p>No quiz question loaded.</p>'}
      </section>
    </div>
  `;
  document.getElementById('back-to-quizzes')?.addEventListener('click', () => setTab('quizzes'));
  document.getElementById('back-to-phase')?.addEventListener('click', () => openPhase(active.phaseId));
  refs.contentBody.querySelectorAll('[data-quiz-nav-index]').forEach((button) => {
    button.addEventListener('click', () => {
      setQuizDraft(active.id, {
        ...draft,
        questionIndex: Number(button.dataset.quizNavIndex)
      });
    });
  });
  refs.contentBody.querySelectorAll('[data-choice-index]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!activeQuestion) return;
      setQuizDraft(active.id, {
        ...draft,
        answersByQuestion: {
          ...draft.answersByQuestion,
          [activeQuestion.id]: Number(button.dataset.choiceIndex)
        },
        feedbackByQuestion: {
          ...draft.feedbackByQuestion,
          [activeQuestion.id]: false
        }
      });
    });
  });
  document.getElementById('quiz-check-answer')?.addEventListener('click', () => {
    if (!activeQuestion || currentSelected === undefined) return;
    setQuizDraft(active.id, {
      ...draft,
      feedbackByQuestion: {
        ...draft.feedbackByQuestion,
        [activeQuestion.id]: true
      }
    });
  });
  document.getElementById('quiz-clear-answer')?.addEventListener('click', () => {
    if (!activeQuestion) return;
    const nextAnswers = { ...draft.answersByQuestion };
    const nextFeedback = { ...draft.feedbackByQuestion };
    delete nextAnswers[activeQuestion.id];
    delete nextFeedback[activeQuestion.id];
    setQuizDraft(active.id, {
      ...draft,
      answersByQuestion: nextAnswers,
      feedbackByQuestion: nextFeedback
    });
  });
  document.getElementById('quiz-retake')?.addEventListener('click', () => {
    setQuizDraft(active.id, {
      questionIndex: 0,
      answersByQuestion: {},
      feedbackByQuestion: {}
    });
  });
  document.getElementById('quiz-next-question')?.addEventListener('click', () => {
    setQuizDraft(active.id, {
      ...draft,
      questionIndex: Math.min(questionIndex + 1, questions.length - 1)
    });
  });
  document.getElementById('quiz-submit')?.addEventListener('click', () => {
    if (!allAnswered) return;
    submitQuizResult(active.id, scorePercent);
  });
}

function renderAssignments() {
  refs.sectionTitle.textContent = 'Assignments';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${ASSIGNMENTS.map((item) => {
        const locked = !isAssignmentUnlocked(item.id);
        return `
        <button type="button" class="stack-card stack-card-button${locked ? ' is-locked' : ''}" data-assignment-id="${item.id}" style="border-left-color: ${item.accent}"${locked ? ' disabled' : ''}>
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">Assignment ${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:22px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.code}: ${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${locked ? getAssignmentUnlockRequirement(item.id) : item.body}</p>
        </button>
      `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-assignment-id]').forEach((button) => {
    button.addEventListener('click', () => openAssignment(button.dataset.assignmentId));
  });
}

function renderPerformanceToolButtons(activeToolId, layoutClass = 'performance-launcher-grid') {
  return `
    <div class="${layoutClass}">
      ${PERFORMANCE_TOOLS.map((item) => `
        <button
          type="button"
          class="performance-tool-button${item.id === activeToolId ? ' is-active' : ''}"
          data-performance-tool-id="${item.id}"
          style="--performance-accent:${item.accent}"
        >
          <span class="performance-tool-code mono">${item.code}</span>
          <span class="performance-tool-copy">
            <strong>${item.title}</strong>
            <span>${item.body}</span>
          </span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderPerformance() {
  const activeTool = getPerformanceToolById(state.activePerformanceToolId) || PERFORMANCE_TOOLS[0];
  const isPlayerView = state.activePerformanceView === 'player' && activeTool;
  refs.sectionTitle.textContent = isPlayerView ? '' : 'Performance';
  refs.sectionTitle.style.display = isPlayerView ? 'none' : '';
  if (refs.progressShell) refs.progressShell.style.display = isPlayerView ? 'none' : '';

  if (!isPlayerView) {
    refs.contentBody.innerHTML = `
      <section class="performance-launcher">
        <div class="performance-menu">
          <div class="performance-menu-head">
            <p class="mono performance-menu-kicker">Performance tools</p>
            <h4>Training menu</h4>
            <p>Launch a focused training game built for the live performance layer without changing the lesson or assignment flow.</p>
          </div>
        </div>
        ${renderPerformanceToolButtons(activeTool?.id)}
      </section>
    `;

    refs.contentBody.querySelectorAll('[data-performance-tool-id]').forEach((button) => {
      button.addEventListener('click', () => openPerformanceTool(button.dataset.performanceToolId));
    });
    return;
  }

  refs.contentBody.innerHTML = `
    <section class="performance-player-shell">
      <div class="performance-player-layout">
        <aside class="performance-player-sidebar">
          <div class="performance-menu performance-player-menu">
            <div class="performance-menu-head">
              <p class="mono performance-menu-kicker">Performance tools</p>
              <h4>Training menu</h4>
              <p>Select a tool to swap the live game surface without leaving the performance section.</p>
            </div>
            <div class="performance-tool-list">
              ${PERFORMANCE_TOOLS.map((item) => `
                <button
                  type="button"
                  class="performance-tool-button${item.id === activeTool?.id ? ' is-active' : ''}"
                  data-performance-tool-id="${item.id}"
                  style="--performance-accent:${item.accent}"
                >
                  <span class="performance-tool-code mono">${item.code}</span>
                  <span class="performance-tool-copy">
                    <strong>${item.title}</strong>
                    <span>${item.body}</span>
                  </span>
                </button>
              `).join('')}
            </div>
          </div>
        </aside>
        <div class="performance-player-stage">
          <div class="performance-player-nav">
            <button type="button" class="performance-player-back" data-performance-close>Back to training menu</button>
          </div>
          <div class="performance-player-frame-wrap">
            <iframe
              title="${activeTool?.title || 'Performance tool'}"
              class="performance-player-frame"
              data-performance-frame
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  `;

  refs.contentBody.querySelectorAll('[data-performance-tool-id]').forEach((button) => {
    button.addEventListener('click', () => openPerformanceTool(button.dataset.performanceToolId));
  });

  const closeButton = refs.contentBody.querySelector('[data-performance-close]');
  if (closeButton) {
    closeButton.addEventListener('click', closePerformanceTool);
  }

  const performanceFrame = refs.contentBody.querySelector('[data-performance-frame]');
  if (performanceFrame instanceof HTMLIFrameElement) {
    setPerformanceFrameSource(performanceFrame, activeTool?.viewerSrc || '').catch((error) => {
      performanceFrame.removeAttribute('src');
      performanceFrame.srcdoc = `<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#08111c;color:#fda4af;font-family:Rajdhani,sans-serif;">${escapeHtml(error instanceof Error ? error.message : 'Failed to load performance tool.')}</body>`;
    });
  }
}

function renderAssignmentField(field) {
  if (field.type === 'textarea') {
    return `
      <label class="assignment-label">${field.label}</label>
      <textarea class="assignment-field assignment-textarea${field.large ? ' assignment-textarea-lg' : ''}" placeholder="${field.placeholder}"></textarea>
    `;
  }

  return `
    <label class="assignment-label">${field.label}</label>
    <input class="assignment-field" placeholder="${field.placeholder}" />
  `;
}

function renderAssignmentPanel(panel, accent) {
  return `
    <article class="assignment-panel${panel.wide ? ' assignment-panel-wide' : ''}" style="--assignment-accent:${accent}">
      <div class="assignment-panel-head">
        <span class="mono">${panel.label}</span>
        <h5>${panel.title}</h5>
      </div>
      ${panel.copy ? `<p class="assignment-panel-copy" style="margin-bottom:16px;">${panel.copy}</p>` : ''}
      ${panel.fields.map((field) => renderAssignmentField(field)).join('')}
    </article>
  `;
}

function ensureScriptLoaded(src, id) {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  const embeddedScriptAsset = getEmbeddedTextAsset(src);
  if (typeof embeddedScriptAsset === 'string') {
    const script = document.createElement('script');
    script.id = id;
    script.textContent = embeddedScriptAsset;
    document.head.appendChild(script);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function ensureStylesheetLoaded(href, id) {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });
}

function ensureAssignmentRuntimeAssets() {
  if (!assignmentRuntimeState.fontsPromise) {
    assignmentRuntimeState.fontsPromise = ensureStylesheetLoaded(ASSIGNMENT_RUNTIME_FONTS_HREF, 'mentalwellness-runtime-fonts');
  }

  if (!assignmentRuntimeState.tailwindPromise) {
    assignmentRuntimeState.tailwindPromise = ensureScriptLoaded(ASSIGNMENT_RUNTIME_TAILWIND_SRC, 'mentalwellness-runtime-tailwind');
  }

  if (!assignmentRuntimeState.runtimePromise) {
    assignmentRuntimeState.runtimePromise = ensureScriptLoaded(ASSIGNMENT_RUNTIME_SCRIPT_SRC, 'mentalwellness-runtime-script');
  }

  return Promise.all([assignmentRuntimeState.fontsPromise, assignmentRuntimeState.tailwindPromise, assignmentRuntimeState.runtimePromise]);
}

async function getAssignmentRuntimeDocument() {
  if (!assignmentRuntimeState.htmlPromise) {
    assignmentRuntimeState.htmlPromise = fetchTextAsset(getAppsScriptRawAssetUrl(ASSIGNMENT_RUNTIME_HTML_SRC))
      .then((html) => new DOMParser().parseFromString(html, 'text/html'));
  }

  return assignmentRuntimeState.htmlPromise;
}

async function getAssignmentRuntimeMarkup(view) {
  if (assignmentRuntimeState.viewMarkup.has(view)) {
    return assignmentRuntimeState.viewMarkup.get(view);
  }

  const doc = await getAssignmentRuntimeDocument();
  const section = doc.getElementById(`view-${view}`);
  if (!section) {
    throw new Error(`Missing runtime view: ${view}`);
  }

  const clone = section.cloneNode(true);
  clone.classList.remove('hidden');
  const markup = clone.outerHTML;
  assignmentRuntimeState.viewMarkup.set(view, markup);
  return markup;
}

async function mountAssignmentRuntime(active) {
  const mount = document.getElementById('assignment-runtime-mount');
  if (!mount) {
    return;
  }

  const view = ASSIGNMENT_RUNTIME_VIEW[active.id];
  if (!view) {
    mount.innerHTML = '<div class="assignment-runtime-error">Assignment view is not mapped.</div>';
    return;
  }

  const requestToken = ++assignmentRuntimeState.requestToken;
  mount.innerHTML = '<div class="assignment-runtime-loading">Loading full assignment system...</div>';

  try {
    const markup = await getAssignmentRuntimeMarkup(view);
    if (assignmentRuntimeState.requestToken !== requestToken || state.section !== 'assignment' || state.activeId !== active.id) {
      return;
    }

    mount.style.visibility = 'hidden';
    mount.innerHTML = markup;
    mount.firstElementChild?.classList.remove('hidden');
    mount.firstElementChild?.classList.add('assignment-runtime-view');

    await ensureAssignmentRuntimeAssets();
    if (assignmentRuntimeState.requestToken !== requestToken || state.section !== 'assignment' || state.activeId !== active.id) {
      return;
    }

    const runtime = window.MentalWellnessRuntime;
    if (!runtime || typeof runtime.mountAssignmentView !== 'function') {
      throw new Error('Assignment runtime did not initialize.');
    }

    runtime.mountAssignmentView(view);
    mount.style.visibility = '';
  } catch (error) {
    if (assignmentRuntimeState.requestToken !== requestToken) {
      return;
    }

    mount.style.visibility = '';
    mount.innerHTML = `<div class="assignment-runtime-error">${error instanceof Error ? error.message : 'Failed to load assignment runtime.'}</div>`;
  }
}

function renderAssignmentDetail() {
  const active = ASSIGNMENTS.find((item) => item.id === state.activeId) || ASSIGNMENTS[0];
  const diagnosticPhase = active.id === 'a0' ? getPhaseById('phase-0') : null;
  const nextPhase = diagnosticPhase ? getNextPhase(diagnosticPhase.id) : null;
  const diagnosticComplete = diagnosticPhase ? isPhaseComplete(diagnosticPhase.id) : false;
  const diagnosticRuntime = active.id === 'a0' ? loadStoredJson('diag_data') || {} : null;
  const diagnosticReportReady = Boolean(diagnosticRuntime?.reportReady);
  const diagnosticLockedCopy = `Run diagnostics to unlock the system report and ${nextPhase ? `${nextPhase.code}: ${nextPhase.title}` : 'the next phase'}.`;
  const diagnosticLogCopy = 'Add the operator log before running diagnostics so the baseline report can be generated.';
  const diagnosticPendingCopy = `Diagnostics are filled in. Run diagnostics to verify the system, then mark complete to unlock ${nextPhase ? `${nextPhase.code}: ${nextPhase.title}` : 'the next phase'}.`;
  const diagnosticReadyCopy = `Diagnostic verified. Generate the baseline report or mark complete to unlock ${nextPhase ? `${nextPhase.code}: ${nextPhase.title}` : 'the next phase'}.`;
  refs.sectionTitle.textContent = '';
  refs.sectionTitle.style.display = 'none';
  if (refs.progressShell) refs.progressShell.style.display = 'none';
  refs.contentBody.innerHTML = `
    <section class="assignment-shell">
      <article class="assignment-runtime-shell">
        <div id="assignment-runtime-mount" class="assignment-runtime-frame assignment-runtime-mount">
          <div class="assignment-runtime-loading">Loading full assignment system...</div>
        </div>
      </article>
      ${diagnosticPhase ? `
        <article class="stack-card phase-complete-card" style="border-left-color: ${diagnosticPhase.accent}">
          <p class="reading-eyebrow">Phase progress</p>
          <h4>${diagnosticComplete ? 'Diagnostic complete' : 'Mark complete'}</h4>
          <p
            id="diagnostic-complete-copy"
            data-locked-copy="${escapeHtml(diagnosticLockedCopy)}"
            data-log-copy="${escapeHtml(diagnosticLogCopy)}"
            data-pending-copy="${escapeHtml(diagnosticPendingCopy)}"
            data-ready-copy="${escapeHtml(diagnosticReadyCopy)}"
          >${diagnosticComplete ? `${nextPhase ? `${nextPhase.code}: ${nextPhase.title} is unlocked.` : 'Progress recorded.'}` : diagnosticReportReady ? diagnosticReadyCopy : diagnosticLockedCopy}</p>
          <div class="reading-actions">
            <button
              type="button"
              class="reading-btn reading-btn-primary"
              id="diagnostic-mark-complete"
              data-phase-complete="${diagnosticComplete ? '1' : '0'}"
              ${diagnosticComplete || !diagnosticReportReady ? ' disabled' : ''}
            >${diagnosticComplete ? 'Completed' : 'Mark complete'}</button>
          </div>
        </article>
      ` : ''}
    </section>
  `;
  mountAssignmentRuntime(active);
  document.getElementById('diagnostic-mark-complete')?.addEventListener('click', () => markPhaseComplete('phase-0'));
}

function renderIcons() {
  const activeVideo = getFilmRoomVideoById(state.activeFilmRoomVideoId) || FILM_ROOM_VIDEOS[0];
  const activeTapeNumber = Math.max(1, FILM_ROOM_VIDEOS.findIndex((item) => item.id === activeVideo?.id) + 1);
  refs.sectionTitle.textContent = 'Film Room';
  refs.contentBody.innerHTML = `
    <section class="film-room-shell">
      <div class="film-room-stage">
        <div class="film-room-sign">
          <div>
            <p class="mono film-room-kicker">Sports Wellness Archive</p>
            <h4>Coach's Film Room</h4>
          </div>
          <div class="mono film-room-count">${FILM_ROOM_VIDEOS.length} tapes loaded</div>
        </div>
        <div class="film-room-tv-wrap">
          <div class="film-room-antenna" aria-hidden="true">
            <span></span>
            <span></span>
          </div>
          <div class="film-room-tv">
            <div class="film-room-screen-shell">
              <div class="film-room-screen">
                <iframe
                  src="https://www.youtube.com/embed/${activeVideo.youtubeId}"
                  title="${activeVideo.title}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
            <div class="film-room-console">
              <div class="film-room-slot" aria-hidden="true"></div>
              <div class="film-room-led mono">${String(activeTapeNumber).padStart(2, '0')}:${String(FILM_ROOM_VIDEOS.length).padStart(2, '0')}</div>
            </div>
          </div>
        </div>
      </div>
      <aside class="film-room-sidebar">
        <article class="film-room-panel">
          <p class="mono film-room-kicker">Tape catalog</p>
          <h4>Load a video</h4>
          <p>Use the dropdown to swap the tape in the CRT player without leaving the course shell.</p>
          <label class="film-room-label" for="film-room-select">Playlist</label>
          <select id="film-room-select" class="film-room-select" data-film-room-select>
            ${FILM_ROOM_VIDEOS.map((item) => `
              <option value="${item.id}"${item.id === activeVideo.id ? ' selected' : ''}>${item.code} - ${item.title}</option>
            `).join('')}
          </select>
        </article>
        <article class="film-room-panel film-room-now-playing">
          <p class="mono film-room-kicker">Now loaded</p>
          <h4>${activeVideo.code}</h4>
          <p class="film-room-title">${activeVideo.title}</p>
          <div class="film-room-meta mono">
            <span>YouTube embed</span>
            <span>${activeTapeNumber} / ${FILM_ROOM_VIDEOS.length}</span>
          </div>
        </article>
      </aside>
    </section>
  `;

  refs.contentBody.querySelector('[data-film-room-select]')?.addEventListener('change', (event) => {
    selectFilmRoomVideo(event.target.value);
  });
}

function renderContent() {
  refs.sectionTitle.style.display = '';
  if (refs.progressShell) refs.progressShell.style.display = '';
  const progress = getProgressSnapshot();
  refs.progressFill.style.width = `${progress.percent}%`;
  refs.progressPercent.textContent = `${progress.percent}%`;
  if (refs.progressCounters[0]) {
    refs.progressCounters[0].innerHTML = `<i class="fa-solid fa-server"></i> ${progress.completedPhases}/${progress.totalPhases}`;
  }
  if (refs.progressCounters[1]) {
    refs.progressCounters[1].innerHTML = `<i class="fa-solid fa-database"></i> ${progress.passedQuizzes}/${progress.totalQuizzes}`;
  }
  if (refs.progressModulesCount) {
    refs.progressModulesCount.textContent = `${progress.completedPhases}/${progress.totalPhases}`;
  }

  if (state.section === 'library') {
    renderLibrary();
    return;
  }

  if (state.section === 'home') {
    renderHome();
    return;
  }

  if (state.section === 'phase') {
    renderPhaseDetail();
    return;
  }

  if (state.section === 'assignment') {
    renderAssignmentDetail();
    return;
  }

  if (state.section === 'quiz') {
    renderQuizDetail();
    return;
  }

  if (state.section === 'performance') {
    renderPerformance();
    return;
  }

  renderIcons();
}

function render() {
  renderNavState();
  renderContent();
}

refs.navHome.addEventListener('click', () => setSection('home'));
refs.navLibrary.addEventListener('click', () => setSection('library'));
refs.navPerformance.addEventListener('click', () => setSection('performance'));
refs.navIcons.addEventListener('click', () => setSection('icons'));
refs.tabPhases.addEventListener('click', () => setTab('phases'));
refs.tabQuizzes.addEventListener('click', () => setTab('quizzes'));
refs.tabAssignments.addEventListener('click', () => setTab('assignments'));
refs.collapseToggle?.addEventListener('click', toggleSidebarCollapse);

let lastCompactLayout = isCompactLayout();
applySidebarCollapse(lastCompactLayout ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
restoreUiState();
render();

window.addEventListener('resize', () => {
  const compact = isCompactLayout();
  if (compact !== lastCompactLayout) {
    lastCompactLayout = compact;
    applySidebarCollapse(compact ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
    return;
  }

  if (compact) {
    applySidebarCollapse(document.body.classList.contains('sidebar-collapsed'));
    return;
  }

  applySidebarCollapse(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
});

window.addEventListener('storage', (event) => {
  if (event.storageArea !== localStorage || event.key !== UI_STATE_KEY) {
    return;
  }

  const nextState = normalizeUiState(loadStoredJson(UI_STATE_KEY));
  if (!nextState) {
    return;
  }

  applyUiStateSnapshot(nextState);
  render();
});
