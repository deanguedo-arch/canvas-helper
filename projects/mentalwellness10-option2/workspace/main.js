const SIDEBAR_COLLAPSE_KEY = 'mentalwellness10-option2.sidebarCollapsed';
const SIDEBAR_BREAKPOINT = 860;

const MATERIALS = [
  {
    id: 'm1',
    code: '01',
    title: 'The Engine',
    desc: 'Values, identity, and foundation.',
    color: '#f43f5e',
    preview: 'https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/preview',
    download: 'https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/view?usp=sharing'
  },
  {
    id: 'm2',
    code: '02',
    title: 'The Drive',
    desc: 'Motivation, 7/10 task, and maintenance.',
    color: '#f59e0b',
    preview: 'https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/preview',
    download: 'https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/view?usp=sharing'
  },
  {
    id: 'm3',
    code: '03',
    title: 'The Focus',
    desc: 'Spotlight, cues, and the fortress.',
    color: '#10b981',
    preview: 'https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/preview',
    download: 'https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/view?usp=sharing'
  },
  {
    id: 'm4',
    code: '04',
    title: 'The Toolkit',
    desc: 'Confidence and visualization protocols.',
    color: '#0ea5e9',
    preview: 'https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/preview',
    download: 'https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/view?usp=sharing'
  }
];

const PHASES = [
  { id: 'phase-1', code: 'Phase 1', title: 'The Engine', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#00ff7f', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlq-6-CPseoFR8UqMT0X2FMeB--00jNw4cSJD49Y9ssTGx5fMBeIyYo3_koXT1u-GNGQo-qWY-SfF98bfBdfLBiecnb4bjKkQazfV2ViRxowEf8pS-zzrSJD7u-8TpTzj4SnuNvIQawrpjFo55wREt8B2GL1Hx7_3cQaSTH1wPEidAjvo6Df0RtY_0TcWEPu6N7IfSYAMsvmwUTBnlteQD6ko6A2H_wpcJbaB6z8u-Jl80VDQ3jC54lhSjlVFiExFX0vnCLkm0Sg' },
  { id: 'phase-2', code: 'Phase 2', title: 'The Drive', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#8a2be2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvDf2Loe_K9P9rPvsVnKxak1lzcUPafuTXXcuWbvJlqfavtKwooYLAzn-8dLG0JTgPXYaD1fCNRnJ_BBztqMgkJuNraarq9K40uDncUo3VuHPUlE_74VhLYp6-ce_a0WXvi1IoKSHDBFjh3_XozgrVDifob2lwFGoiETAWWAkMWrId7aLagJPSIZXc0ihBAqy5xNPjqHpWQ3cQTjy5FWZGfRs9CDWmf4dcyLA7wv4J3O5tRrNNdxauFmMGjwvlXadZ4zYqzpyCQg' },
  { id: 'phase-3', code: 'Phase 3', title: 'The Focus', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#00ced1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNgFbRFd5BzfIizgsYiWBVenbYdAhXa1r239HJE6lensK1WHkoFnTGSAWw-yC79HIjZy448eVlIgXEB6I-DANgc-HfvlvEdysH261NOgOU4M2xD49UTPmg1DXJ1hZJQcqJWFOb9g-YDZeSRNq3M1DJr9jo6A7bnykuIqQZhFYdolv1WY-bH1DjVTnVFYIvRPPylGs70rVzBv2m31FtPEdA_dDr0VsyFSBpq1c3sj9f8A01leCLUMJcMIsJD_5QYPSTSZCnH-Xhxg' },
  { id: 'phase-4', code: 'Phase 4', title: 'The Toolkit', body: 'Phase shell ready. Add learning content and checkpoints here.', accent: '#5c2e91', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJxNkx8XcI7amPy8SuO1byA5jB5t7Vgu7IDETTzUHpNZhGv3sF5clnnWroiNORNERn_9nal0ZPF8GGKjLYf--q4FM8nx0XPMxa4i_fp273shRI9kHUcq30245dQF2VsMtJ8lHTY3YDHsReuTrF9sugMQOSiUbyGzLjKHT8hRQFeqEtTuwvv-48dKMeaWD8DSL5TKY6u2K1SwbH6OhAfQwIWBJp1GeTDbsue9kBX9PEhqg5ys1ea3ud-4d8uImQKJhVH5_bhs9Gw' }
];

const ASSIGNMENTS = [
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

const ASSIGNMENT_RUNTIME_NAV = {
  a1: 'nav-a1',
  a2a: 'nav-a2a',
  a2b: 'nav-a2b',
  a3: 'nav-a3',
  a4a: 'nav-a4a',
  a4b: 'nav-a4b'
};

const ASSIGNMENT_RUNTIME_SRC = './assignment-runtime.html';

const state = {
  section: 'home',
  tab: 'phases',
  activeId: PHASES[0]?.id || null,
  activeStep: 0
};

const refs = {
  sectionTitle: document.getElementById('section-title'),
  contentBody: document.getElementById('content-body'),
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

function applySidebarCollapse(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  if (refs.collapseToggle) {
    refs.collapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    refs.collapseToggle.title = collapsed ? 'Expand menu' : 'Collapse menu';
  }
}

function toggleSidebarCollapse() {
  const next = !document.body.classList.contains('sidebar-collapsed');
  applySidebarCollapse(next);
  localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0');
}

function getCollection() {
  if (state.tab === 'phases') return PHASES;
  if (state.tab === 'assignments') return ASSIGNMENTS;
  return [];
}

function setSection(section) {
  const previous = state.section;
  state.section = section;
  if (section === 'home' && previous !== 'home') {
    state.tab = 'phases';
    state.activeId = PHASES[0]?.id || null;
  }
  if (section !== 'home') {
    state.tab = 'phases';
  }
  render();
}

function setTab(tab) {
  state.section = 'home';
  state.tab = tab;
  const collection = getCollection();
  state.activeId = collection[0]?.id || null;
  render();
}

function openPhase(id) {
  state.section = 'phase';
  state.activeId = id;
  render();
}

function openAssignment(id) {
  state.section = 'assignment';
  state.activeId = id;
  state.activeStep = 0;
  render();
}

function setAssignmentStep(step) {
  state.activeStep = step;
  render();
}

function renderNavState() {
  refs.navHome.classList.toggle('active', state.section === 'home' || state.section === 'phase');
  refs.navLibrary.classList.toggle('active', state.section === 'library');
  refs.navPerformance.classList.toggle('active', state.section === 'performance');
  refs.navIcons.classList.toggle('active', state.section === 'icons');

  refs.tabPhases.classList.toggle('active', state.section === 'home' && state.tab === 'phases');
  refs.tabQuizzes.classList.toggle('active', state.section === 'home' && state.tab === 'quizzes');
  refs.tabAssignments.classList.toggle('active', state.section === 'home' && state.tab === 'assignments');
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
  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
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
  refs.sectionTitle.textContent = 'Course Materials';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${MATERIALS.map((item) => `
        <article class="stack-card" style="border-left-color: ${item.color}">
          <p class="mono" style="margin:0 0 6px; color:${item.color}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            <a href="${item.preview}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; border:1px solid rgba(120,140,180,0.3); background:#162033; color:#eef4ff; text-decoration:none; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">View Slides</a>
            <a href="${item.download}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:12px; background:${item.color}; color:#07111d; text-decoration:none; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;">Open Source</a>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderQuizzes() {
  refs.sectionTitle.textContent = 'Quiz Library';
  refs.contentBody.innerHTML = `
    <div class="empty-card">
      <h4>No quizzes loaded yet</h4>
      <p>Quiz scaffolds can be added here without changing the shell structure.</p>
    </div>
  `;
}

function renderAssignments() {
  refs.sectionTitle.textContent = 'Assignments';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${ASSIGNMENTS.map((item) => `
        <button type="button" class="stack-card stack-card-button" data-assignment-id="${item.id}" style="border-left-color: ${item.accent}">
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">Assignment ${item.code}</p>
          <h4>${item.code}: ${item.title}</h4>
          <p>${item.body}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;">
            ${item.steps.map((step) => `
              <span style="display:inline-flex; align-items:center; padding:7px 10px; border-radius:999px; border:1px solid rgba(120,140,180,0.25); background:rgba(13,22,35,0.86); color:#dce7f7; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">${step}</span>
            `).join('')}
          </div>
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

function mountAssignmentRuntime(frame, navId) {
  const bootRuntime = () => {
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) return;

    const root = doc.body?.firstElementChild;
    const sidebar = root?.children?.[0];
    const main = root?.children?.[1];
    const floatingProgress = doc.querySelector('.floating-progress-panel');

    doc.documentElement.style.background = '#0b111a';
    doc.body.style.background = '#0b111a';
    doc.body.style.margin = '0';
    doc.body.style.overflow = 'hidden';

    if (sidebar) {
      sidebar.style.display = 'none';
    }

    if (floatingProgress) {
      floatingProgress.style.display = 'none';
    }

    if (root) {
      root.style.display = 'block';
      root.style.minHeight = '100vh';
    }

    if (main) {
      main.style.width = '100%';
      main.style.maxWidth = '100%';
      main.style.height = '100vh';
      main.style.background = '#0b111a';
    }

    const navButton = doc.getElementById(navId);
    if (navButton && typeof navButton.click === 'function') {
      navButton.click();
    }
  };

  frame.addEventListener('load', bootRuntime, { once: true });
  frame.src = ASSIGNMENT_RUNTIME_SRC;
}

function renderAssignmentDetail() {
  const active = ASSIGNMENTS.find((item) => item.id === state.activeId) || ASSIGNMENTS[0];
  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
  refs.contentBody.innerHTML = `
    <section class="assignment-shell">
      <article class="assignment-hero" style="--assignment-accent:${active.accent}">
        <div class="assignment-kicker mono">${active.eyebrow}</div>
        <h4>${active.heroTitle}</h4>
        <p>${active.body}</p>
        <div class="assignment-actions" style="margin-top:18px;">
          <button type="button" class="assignment-action assignment-action-secondary" id="assignment-back">Back to assignments</button>
        </div>
      </article>

      <article class="assignment-runtime-shell" style="--assignment-accent:${active.accent}">
        <iframe
          id="assignment-runtime-frame"
          class="assignment-runtime-frame"
          title="${active.code}: ${active.title}"
        ></iframe>
      </article>
    </section>
  `;
  document.getElementById('assignment-back')?.addEventListener('click', () => setTab('assignments'));
  const frame = document.getElementById('assignment-runtime-frame');
  if (frame) {
    mountAssignmentRuntime(frame, ASSIGNMENT_RUNTIME_NAV[active.id]);
  }
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

applySidebarCollapse(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
render();

window.addEventListener('resize', () => {
  applySidebarCollapse(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
});
