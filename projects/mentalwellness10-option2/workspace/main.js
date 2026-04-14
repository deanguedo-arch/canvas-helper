const SIDEBAR_COLLAPSE_KEY = 'mentalwellness10-option2.sidebarCollapsed';
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
    desc: 'Motivation, 7/10 task, and maintenance.',
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
  { id: 'phase-0', code: 'Diagnostic', title: 'What is Sports Psychology?', body: 'Baseline phase shell ready. Add orientation content and readiness checkpoints here.', accent: '#94a3b8', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlq-6-CPseoFR8UqMT0X2FMeB--00jNw4cSJD49Y9ssTGx5fMBeIyYo3_koXT1u-GNGQo-qWY-SfF98bfBdfLBiecnb4bjKkQazfV2ViRxowEf8pS-zzrSJD7u-8TpTzj4SnuNvIQawrpjFo55wREt8B2GL1Hx7_3cQaSTH1wPEidAjvo6Df0RtY_0TcWEPu6N7IfSYAMsvmwUTBnlteQD6ko6A2H_wpcJbaB6z8u-Jl80VDQ3jC54lhSjlVFiExFX0vnCLkm0Sg' },
  { id: 'phase-1', code: 'Phase 1', title: 'The Engine', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#00ff7f', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlq-6-CPseoFR8UqMT0X2FMeB--00jNw4cSJD49Y9ssTGx5fMBeIyYo3_koXT1u-GNGQo-qWY-SfF98bfBdfLBiecnb4bjKkQazfV2ViRxowEf8pS-zzrSJD7u-8TpTzj4SnuNvIQawrpjFo55wREt8B2GL1Hx7_3cQaSTH1wPEidAjvo6Df0RtY_0TcWEPu6N7IfSYAMsvmwUTBnlteQD6ko6A2H_wpcJbaB6z8u-Jl80VDQ3jC54lhSjlVFiExFX0vnCLkm0Sg' },
  { id: 'phase-2', code: 'Phase 2', title: 'The Drive', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#8a2be2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvDf2Loe_K9P9rPvsVnKxak1lzcUPafuTXXcuWbvJlqfavtKwooYLAzn-8dLG0JTgPXYaD1fCNRnJ_BBztqMgkJuNraarq9K40uDncUo3VuHPUlE_74VhLYp6-ce_a0WXvi1IoKSHDBFjh3_XozgrVDifob2lwFGoiETAWWAkMWrId7aLagJPSIZXc0ihBAqy5xNPjqHpWQ3cQTjy5FWZGfRs9CDWmf4dcyLA7wv4J3O5tRrNNdxauFmMGjwvlXadZ4zYqzpyCQg' },
  { id: 'phase-3', code: 'Phase 3', title: 'The Focus', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#00ced1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNgFbRFd5BzfIizgsYiWBVenbYdAhXa1r239HJE6lensK1WHkoFnTGSAWw-yC79HIjZy448eVlIgXEB6I-DANgc-HfvlvEdysH261NOgOU4M2xD49UTPmg1DXJ1hZJQcqJWFOb9g-YDZeSRNq3M1DJr9jo6A7bnykuIqQZhFYdolv1WY-bH1DjVTnVFYIvRPPylGs70rVzBv2m31FtPEdA_dDr0VsyFSBpq1c3sj9f8A01leCLUMJcMIsJD_5QYPSTSZCnH-Xhxg' },
  { id: 'phase-4', code: 'Phase 4', title: 'The Toolkit', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#5c2e91', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJxNkx8XcI7amPy8SuO1byA5jB5t7Vgu7IDETTzUHpNZhGv3sF5clnnWroiNORNERn_9nal0ZPF8GGKjLYf--q4FM8nx0XPMxa4i_fp273shRI9kHUcq30245dQF2VsMtJ8lHTY3YDHsReuTrF9sugMQOSiUbyGzLjKHT8hRQFeqEtTuwvv-48dKMeaWD8DSL5TKY6u2K1SwbH6OhAfQwIWBJp1GeTDbsue9kBX9PEhqg5ys1ea3ud-4d8uImQKJhVH5_bhs9Gw' }
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
    body: "Attention-control assignment centered on spotlight control, cueing, and fortress routines.",
    eyebrow: "Attention Command",
    heroTitle: "Focus Master Blueprint",
    introCopy: "Concentration is a trained spotlight. This assignment helps you audit distracters, build cues and anchors, and create a fortress routine that moves attention away from noise and back to execution.",
    steps: ["Briefing", "Spotlight Audit", "Cue Builder", "Fortress Plan", "Review"],
    introCards: [
      { title: "The Spotlight", body: "Your attention must be narrow, external, and task-relevant." },
      { title: "Cues & Anchors", body: "Use short language and physical anchors to quiet mental noise." },
      { title: "Self 1 vs Self 2", body: "The goal is to reduce judgment and trust instinctive execution." },
      { title: "Quiet Eye", body: "A stable final fixation improves control and motor clarity." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "The Arena",
        copy: "Audit both the internal and external distracters that pull your spotlight away from the task.",
        fields: [
          { label: "Internal distracters", type: "textarea", placeholder: "Example: self-talk, fear of failure, replaying mistakes..." },
          { label: "External distracters", type: "textarea", placeholder: "Example: crowd noise, officiating, opponents, environment..." },
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
          { label: "What-if reset plan", type: "textarea", placeholder: "Describe how you will recover instantly when disruption hits..." }
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
    body: "Confidence blueprint covering mental bank account deposits, damage control, and C-B-A routines.",
    eyebrow: "Confidence Command",
    heroTitle: "Confidence Master Blueprint",
    introCopy: "Confidence is built through deposits, protected through interpretation, and expressed through routine. This assignment turns belief into something operational rather than emotional.",
    steps: ["Briefing", "Top Ten Audit", "Damage Control", "C-B-A Routine", "Review"],
    introCards: [
      { title: "Bank Account", body: "Confidence grows through repeated, specific deposits rather than vague positivity." },
      { title: "Lockdown Filter", body: "Interpret setbacks as temporary, limited, and non-defining." },
      { title: "C-B-A Routine", body: "Use a cue, a belief, and an attachment action to re-enter performance." },
      { title: "Selective Perception", body: "Direct attention toward evidence that supports effective action." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Top Ten Audit",
        copy: "Inventory the evidence that you are capable, prepared, and reliable.",
        fields: [
          { label: "List your top ten confidence deposits", type: "textarea", placeholder: "List ten pieces of evidence, accomplishments, or habits that build belief..." },
          { label: "Daily deposit plan", type: "textarea", placeholder: "Describe how you will keep adding to the account each day..." }
        ]
      },
      {
        label: "Step 02",
        title: "Damage Control",
        copy: "The event is not the damage. The interpretation is. Build the reframing system now.",
        fields: [
          { label: "Recent setback or recurring fear", type: "textarea", placeholder: "Describe the event that usually drains confidence..." },
          { label: "Lockdown reframe", type: "textarea", placeholder: "Rewrite the event as temporary, limited, and non-defining..." }
        ]
      },
      {
        label: "Step 03",
        title: "C-B-A Routine",
        copy: "Build a quick sequence that restores belief and reattaches attention to action.",
        fields: [
          { label: "Cue word", type: "input", placeholder: "Example: reset, trust, hunt, compete" },
          { label: "Belief statement", type: "textarea", placeholder: "Write the belief statement you want active in the moment..." },
          { label: "Attachment action", type: "input", placeholder: "What physical or visual action reattaches you to the task?" }
        ]
      },
      {
        label: "Step 04",
        title: "Understanding Narrative",
        copy: "Explain how your bank account, lockdown logic, and C-B-A routine work together.",
        fields: [
          { label: "Confidence logic narrative", type: "textarea", placeholder: "Explain how this system improves your performance under pressure..." }
        ]
      }
    ],
    summaryTitle: "Confidence Blueprint Summary",
    summaryCopy: "Capture your deposits, your damage-control reframe, and your C-B-A routine in one complete confidence system.",
    summaryPlaceholder: "Summarize your Confidence Blueprint here...",
    actionLabel: "Confidence system ready"
  },
  {
    id: "a4b",
    code: "04B",
    title: "Visualization",
    accent: "#8b5cf6",
    body: "Visualization master blueprint for sanctuary building, multisensory scripting, and reset rehearsal.",
    eyebrow: "Visualization Lab",
    heroTitle: "Visualization Master Blueprint",
    introCopy: "The brain responds to vivid internal rehearsal. This assignment builds a mental sanctuary, a multisensory performance script, and a reset drill so your internal film becomes useful rather than random.",
    steps: ["Briefing", "Sanctuary", "Performance Script", "Reset Drill", "Review"],
    introCards: [
      { title: "Sanctuary", body: "Design a controlled internal room where rehearsal begins." },
      { title: "Performance Script", body: "Build the visual, auditory, kinesthetic, and emotional layers of the scene." },
      { title: "Flat Tire Drill", body: "Rehearse the crisis and the dominant recovery, not just success." },
      { title: "Script Builder", body: "Combine the pieces into one coherent internal film." }
    ],
    panels: [
      {
        label: "Step 01",
        title: "Mental Sanctuary",
        copy: "Start the film in a place you control completely.",
        fields: [
          { label: "Describe your sanctuary", type: "textarea", placeholder: "Describe the room, lighting, colors, temperature, and atmosphere..." },
          { label: "Anchor object", type: "input", placeholder: "Name the object or tool you hold in the sanctuary..." },
          { label: "Object manipulation details", type: "textarea", placeholder: "Describe the texture, weight, and feel as you handle it..." }
        ]
      },
      {
        label: "Step 02",
        title: "Performance Script",
        copy: "Build the scene with multiple sensory channels, not just pictures.",
        fields: [
          { label: "Visual and auditory details", type: "textarea", placeholder: "Describe what you see and hear in the performance scene..." },
          { label: "Kinesthetic details", type: "textarea", placeholder: "Describe what your body feels as you execute..." },
          { label: "Emotional state", type: "textarea", placeholder: "Describe the feeling of control, readiness, or intensity..." }
        ]
      },
      {
        label: "Step 03",
        title: "Reset Drill",
        copy: "Do not rehearse only perfect performance. Rehearse recovery.",
        fields: [
          { label: "The failure or glitch", type: "textarea", placeholder: "Describe the common error or disruption that normally breaks rhythm..." },
          { label: "The dominant reset", type: "textarea", placeholder: "Describe the breath, cue, and physical response that restores control..." }
        ]
      },
      {
        label: "Step 04",
        title: "Script Builder",
        copy: "Now combine the sanctuary, performance sequence, and reset drill into one complete story.",
        fields: [
          { label: "Full visualization script", type: "textarea", large: true, placeholder: "Write the full multisensory script from entry to execution to reset..." }
        ]
      }
    ],
    summaryTitle: "Visualization Blueprint Summary",
    summaryCopy: "Lock the full sequence into one usable internal script that includes preparation, execution, and recovery.",
    summaryPlaceholder: "Summarize your Visualization Blueprint here...",
    actionLabel: "Visualization system ready"
  }
];

const ICONS = [
  { icon: 'fa-person-running', title: 'Performance', body: 'Reserved for performance-focused support content.' },
  { icon: 'fa-dumbbell', title: 'Athletic Icons', body: 'Reserved for athletic icon sets and quick references.' },
  { icon: 'fa-layer-group', title: 'Stacks', body: 'Reserved for future stackable drill content.' }
];

const QUIZZES = [
  {
    id: 'quiz-phase1-performance-state',
    code: 'Quiz 01',
    title: 'Arousal and Anxiety in Sport',
    accent: '#00ff7f',
    phaseId: 'phase-1',
    body: '10 short-response questions extracted from the end of the Phase 1 lesson.',
    questionCount: 10,
    sourcePdf: './assets/readings/phase1-engine-content.pdf',
    questions: [
      {
        prompt: 'How do sport psychologists distinguish between arousal and anxiety?',
        answer: 'Arousal is a neutral level of physiological and psychological activation. Anxiety is a negative emotional state marked by worry, apprehension, and physical tension.'
      },
      {
        prompt: 'Explain the difference between state anxiety and trait anxiety.',
        answer: 'State anxiety is temporary and changes from moment to moment. Trait anxiety is a stable disposition that makes some people more likely to perceive situations as threatening.'
      },
      {
        prompt: 'What occurs during the "Perception of Demand" stage in the stress process loop?',
        answer: 'The performer evaluates the demand and decides whether it feels manageable or threatening. That interpretation becomes the pivot point for the rest of the stress response.'
      },
      {
        prompt: 'Describe the primary difference between the Inverted-U Hypothesis and the IZOF model.',
        answer: 'The Inverted-U assumes a shared moderate optimum. IZOF argues that each athlete has a personal optimal zone that may sit low, middle, or high on the continuum.'
      },
      {
        prompt: 'What is the "Catastrophe Phenomenon," and what two factors must be high for it to occur?',
        answer: 'The Catastrophe Phenomenon is a sudden performance collapse rather than a gradual decline. It occurs when both cognitive anxiety and physiological arousal are high.'
      },
      {
        prompt: "How does high arousal affect an athlete's attentional field?",
        answer: 'High arousal narrows attention too much and can create tunnel vision. The performer may miss important peripheral cues or changing conditions.'
      },
      {
        prompt: "According to Jones's model, what determines whether anxiety is facilitative or debilitative?",
        answer: 'Perception of control is the key factor. Anxiety is more facilitative when the athlete believes they have the resources to meet the challenge.'
      },
      {
        prompt: 'Why is breathing considered a "manual override switch" for the stress response?',
        answer: 'Breathing is one of the few body processes under both voluntary and autonomic influence. Slowing the breath can interrupt the stress loop and restore control.'
      },
      {
        prompt: 'Explain the difference between instructional and motivational cue words.',
        answer: 'Instructional cues direct attention to technique and mechanics. Motivational cues restore effort, energy, and intensity.'
      },
      {
        prompt: 'Why should athletes prioritize process goals over outcome goals to manage anxiety?',
        answer: 'Process goals focus on actions that are fully controllable, which stabilizes confidence and reduces uncertainty. Outcome goals depend on many external factors and therefore raise anxiety more easily.'
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
          ['Social Physique Anxiety', "Anxiety caused by the perception that others are evaluating one's body or physique."],
          ['Somatic State Anxiety', 'Moment-to-moment perceived physiological activation such as butterflies, sweating, or a racing heart.'],
          ['Stress', 'A substantial imbalance between demand and response capability under conditions where the consequences matter.'],
          ['Trait Anxiety', 'A personality disposition to perceive objectively non-dangerous situations as threatening.']
        ]
      }
    ]
  }
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
  activeStep: 0,
  activeMaterialId: null
};

const refs = {
  sectionTitle: document.getElementById('section-title'),
  contentBody: document.getElementById('content-body'),
  progressShell: document.querySelector('.progress-shell'),
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percent'),
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
  document.body.classList.toggle('compact-layout', isCompactLayout());
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  if (refs.collapseToggle) {
    refs.collapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    refs.collapseToggle.title = collapsed ? 'Expand menu' : 'Collapse menu';
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
  if (section !== 'home') {
    state.tab = 'phases';
  }
  collapseCompactMenu();
  render();
}

function setTab(tab) {
  state.section = 'home';
  state.tab = tab;
  const collection = getCollection();
  state.activeId = collection[0]?.id || null;
  collapseCompactMenu();
  render();
}

function openPhase(id) {
  state.section = 'phase';
  state.activeId = id;
  collapseCompactMenu();
  render();
}

function openAssignment(id) {
  state.section = 'assignment';
  state.activeId = id;
  state.activeStep = 0;
  collapseCompactMenu();
  render();
}

function openQuiz(id) {
  state.section = 'quiz';
  state.activeId = id;
  collapseCompactMenu();
  render();
}

function openMaterial(id) {
  state.activeMaterialId = id;
  renderLibrary();
}

function closeMaterialViewer() {
  state.activeMaterialId = null;
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
        ${PHASES.map((item) => `
          <button type="button" class="module-tile" data-id="${item.id}" data-accent="${item.id === 'phase-1' ? 'green' : item.id === 'phase-2' ? 'purple' : item.id === 'phase-3' ? 'cyan' : 'violet'}">
            <article class="module-card${item.id === state.activeId ? ' is-active' : ''}">
              <img src="${item.image}" alt="${item.title}" />
              <div class="module-copy">
                <p class="module-code">${item.code}</p>
                <h4 class="module-title">${item.code}<br />${item.title}</h4>
                <div class="module-state">Open module</div>
              </div>
            </article>
          </button>
        `).join('')}
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

function renderPhaseDetail() {
  const active = PHASES.find((item) => item.id === state.activeId) || PHASES[0];
  const content = PHASE_CONTENT[active.id];
  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
  if (content) {
    refs.contentBody.innerHTML = `
      <div class="reading-shell">
        <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
          <p class="reading-eyebrow">${escapeHtml(content.eyebrow)}</p>
          <h4 class="reading-hero-title">${escapeHtml(content.heading)}</h4>
          <p class="reading-subtitle">${escapeHtml(content.subheading)}</p>
          <p class="reading-lead">${escapeHtml(content.summary)}</p>
          <div class="reading-chip-row">
            ${content.keyIdeas.map((idea) => `<span class="reading-chip">${escapeHtml(idea)}</span>`).join('')}
          </div>
          <div class="reading-actions">
            <a class="reading-btn reading-btn-primary" href="${content.sourcePdf}" target="_blank" rel="noopener noreferrer">Source PDF</a>
            ${content.quizId ? `<button type="button" class="reading-btn reading-btn-secondary" id="open-linked-quiz">Open phase quiz</button>` : ''}
            <button type="button" class="reading-btn reading-btn-secondary" id="back-to-home">Back to phase picker</button>
          </div>
        </article>
        ${content.sections.map((section) => `
          <section class="stack-card reading-section" style="border-left-color: ${active.accent}">
            <h4>${escapeHtml(section.title)}</h4>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
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
      </div>
    `;
    document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
    document.getElementById('open-linked-quiz')?.addEventListener('click', () => openQuiz(content.quizId));
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
    </div>
  `;
  document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
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
      ${QUIZZES.map((item) => `
        <button type="button" class="stack-card stack-card-button" data-quiz-id="${item.id}" style="border-left-color: ${item.accent}">
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:20px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${item.body}</p>
          <div class="reading-chip-row" style="margin-top:14px;">
            <span class="reading-chip">${item.questionCount} questions</span>
            <span class="reading-chip">Short response</span>
            <span class="reading-chip">Answer key included</span>
          </div>
        </button>
      `).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-quiz-id]').forEach((button) => {
    button.addEventListener('click', () => openQuiz(button.dataset.quizId));
  });
}

function renderQuizDetail() {
  const active = QUIZZES.find((item) => item.id === state.activeId) || QUIZZES[0];
  refs.sectionTitle.textContent = active.title;
  refs.contentBody.innerHTML = `
    <div class="quiz-detail-shell">
      <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
        <p class="reading-eyebrow">${escapeHtml(active.code)}</p>
        <h4 class="reading-hero-title">${escapeHtml(active.title)}</h4>
        <p class="reading-lead">${escapeHtml(active.body)}</p>
        <div class="reading-chip-row">
          <span class="reading-chip">${active.questionCount} questions</span>
          <span class="reading-chip">Phase 1</span>
          <span class="reading-chip">Use the answer key to self-check</span>
        </div>
        <div class="reading-actions">
          <a class="reading-btn reading-btn-primary" href="${active.sourcePdf}" target="_blank" rel="noopener noreferrer">Source PDF</a>
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-quizzes">Back to quizzes</button>
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-phase">Back to phase 1</button>
        </div>
      </article>
      <div class="quiz-question-grid">
        ${active.questions.map((question, index) => `
          <section class="stack-card quiz-question-card" style="border-left-color: ${active.accent}">
            <p class="reading-eyebrow">Question ${index + 1}</p>
            <h4>${escapeHtml(question.prompt)}</h4>
            <details class="quiz-answer">
              <summary>Show answer key</summary>
              <p>${escapeHtml(question.answer)}</p>
            </details>
          </section>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('back-to-quizzes')?.addEventListener('click', () => setTab('quizzes'));
  document.getElementById('back-to-phase')?.addEventListener('click', () => openPhase(active.phaseId));
}

function renderAssignments() {
  refs.sectionTitle.textContent = 'Assignments';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${ASSIGNMENTS.map((item) => `
        <button type="button" class="stack-card stack-card-button" data-assignment-id="${item.id}" style="border-left-color: ${item.accent}">
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">Assignment ${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:22px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.code}: ${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${item.body}</p>
        </button>
      `).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-assignment-id]').forEach((button) => {
    button.addEventListener('click', () => openAssignment(button.dataset.assignmentId));
  });
}

function renderPerformance() {
  refs.sectionTitle.textContent = 'Performance';
  refs.contentBody.innerHTML = `
    <div class="summary-grid">
      <article class="summary-card">
        <h4>Rhythm</h4>
        <p>Use this lane for pacing, consistency, and repeated training prompts.</p>
      </article>
      <article class="summary-card">
        <h4>Focus</h4>
        <p>Reserved for attention control, resets, and cueing systems.</p>
      </article>
      <article class="summary-card">
        <h4>Confidence</h4>
        <p>Reserved for confidence, rehearsal, and pressure-response work.</p>
      </article>
    </div>
  `;
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
    assignmentRuntimeState.htmlPromise = fetch(ASSIGNMENT_RUNTIME_HTML_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${ASSIGNMENT_RUNTIME_HTML_SRC}`);
        }
        return response.text();
      })
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
    </section>
  `;
  mountAssignmentRuntime(active);
}

function renderIcons() {
  refs.sectionTitle.textContent = 'Athletic Icons';
  refs.contentBody.innerHTML = `
    <div class="icon-grid">
      ${ICONS.map((item) => `
        <article class="icon-card">
          <h4><i class="fa-solid ${item.icon}" style="color: var(--green); margin-right: 8px;"></i>${item.title}</h4>
          <p>${item.body}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function renderContent() {
  refs.sectionTitle.style.display = '';
  if (refs.progressShell) refs.progressShell.style.display = '';
  refs.progressFill.style.width = '76%';
  refs.progressPercent.textContent = '0%';

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

applySidebarCollapse(isCompactLayout() ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
render();

window.addEventListener('resize', () => {
  applySidebarCollapse(isCompactLayout() ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
});

