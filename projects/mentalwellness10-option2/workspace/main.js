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
    id: 'a1',
    code: '01',
    title: 'The Engine',
    accent: '#00ff7f',
    body: 'Regulation Engine tactical assignment focused on pressure response, arousal control, and reset habits.',
    steps: ['Briefing', 'Stress Reset', 'Arousal', 'Targeting', 'Confidence', 'Review & Print']
  },
  {
    id: 'a2a',
    code: '02A',
    title: 'Values Blueprint',
    accent: '#f59e0b',
    body: 'Values mapping assignment that connects identity, standards, and action rules.',
    steps: ['Briefing', 'Core Values', 'Standards', 'Decision Filters', 'Review']
  },
  {
    id: 'a2b',
    code: '02B',
    title: 'Master Config',
    accent: '#ffd166',
    body: 'System build assignment for routines, maintenance logic, and personal operating settings.',
    steps: ['Briefing', 'System Audit', 'Default Settings', 'If-Then Plans', 'Review']
  },
  {
    id: 'a3',
    code: '03',
    title: 'The Focus',
    accent: '#10b981',
    body: 'Attention-control assignment centered on spotlight control, cueing, and fortress routines.',
    steps: ['Briefing', 'Spotlight Audit', 'Cue Builder', 'Fortress Plan', 'Review']
  },
  {
    id: 'a4a',
    code: '04A',
    title: 'Confidence',
    accent: '#0ea5e9',
    body: 'Confidence blueprint covering mental bank account deposits, damage control, and C-B-A routines.',
    steps: ['Briefing', 'Top Ten Audit', 'Damage Control', 'C-B-A Routine', 'Review']
  },
  {
    id: 'a4b',
    code: '04B',
    title: 'Visualization',
    accent: '#8b5cf6',
    body: 'Visualization master blueprint for sanctuary building, multisensory scripting, and reset rehearsal.',
    steps: ['Briefing', 'Sanctuary', 'Performance Script', 'Reset Drill', 'Review']
  }
];

const ICONS = [
  { icon: 'fa-person-running', title: 'Performance', body: 'Reserved for performance-focused support content.' },
  { icon: 'fa-dumbbell', title: 'Athletic Icons', body: 'Reserved for athletic icon sets and quick references.' },
  { icon: 'fa-layer-group', title: 'Stacks', body: 'Reserved for future stackable drill content.' }
];

const state = {
  section: 'home',
  tab: 'phases',
  activeId: PHASES[0]?.id || null
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

function renderEngineAssignment(item) {
  refs.sectionTitle.textContent = `${item.code}: ${item.title}`;
  refs.contentBody.innerHTML = `
    <section class="assignment-shell assignment-shell-engine">
      <article class="assignment-hero" style="--assignment-accent:${item.accent}">
        <div class="assignment-kicker mono">Regulation Engine</div>
        <h4>Elite Operator Toolkit</h4>
        <p>
          Tactical assignment focused on pressure control, body-state regulation, and reliable reset habits.
          This is the option 2 rebuild of the original Engine workflow.
        </p>
        <div class="assignment-step-row">
          ${item.steps.map((step, index) => `
            <span class="assignment-step-pill${index === 0 ? ' is-active' : ''}">${step}</span>
          `).join('')}
        </div>
      </article>

      <div class="assignment-grid">
        <article class="assignment-panel assignment-panel-wide" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Step 00</span>
            <h5>Briefing</h5>
          </div>
          <p class="assignment-panel-copy">
            Pressure creates physiological spikes. Your job is not to avoid activation, but to manage it with repeatable
            systems. This assignment builds a tactical routine for resetting, regulating arousal, targeting attention,
            and protecting confidence during competition.
          </p>
          <div class="assignment-mini-grid">
            <div class="assignment-mini-card">
              <h6>Stress Reset</h6>
              <p>Identify what your body does under pressure and define the fastest reliable reset action.</p>
            </div>
            <div class="assignment-mini-card">
              <h6>Arousal Control</h6>
              <p>Map when you are under-activated, over-activated, or in the ideal competitive zone.</p>
            </div>
            <div class="assignment-mini-card">
              <h6>Targeting</h6>
              <p>Choose the narrow external cue that keeps the spotlight off panic and on execution.</p>
            </div>
            <div class="assignment-mini-card">
              <h6>Confidence</h6>
              <p>Build a fast cue-and-belief routine you can trust when performance starts to wobble.</p>
            </div>
          </div>
        </article>

        <article class="assignment-panel" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Step 01</span>
            <h5>Stress Reset</h5>
          </div>
          <label class="assignment-label">What does pressure feel like in your body?</label>
          <textarea class="assignment-field assignment-textarea" placeholder="Describe your physical reaction pattern under pressure..."></textarea>
          <label class="assignment-label">What is your immediate reset action?</label>
          <input class="assignment-field" placeholder="Example: one long exhale, shoulders down, eyes on target" />
        </article>

        <article class="assignment-panel" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Step 02</span>
            <h5>Arousal</h5>
          </div>
          <label class="assignment-label">When are you over-activated?</label>
          <textarea class="assignment-field assignment-textarea" placeholder="Describe the signs that you are too hot..."></textarea>
          <label class="assignment-label">When are you under-activated?</label>
          <textarea class="assignment-field assignment-textarea" placeholder="Describe the signs that you are flat or too calm..."></textarea>
        </article>

        <article class="assignment-panel" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Step 03</span>
            <h5>Targeting</h5>
          </div>
          <label class="assignment-label">Primary cue word</label>
          <input class="assignment-field" placeholder="Example: drive, smooth, attack, release" />
          <label class="assignment-label">Spotlight target</label>
          <textarea class="assignment-field assignment-textarea" placeholder="State the narrow external thing you want your attention locked onto..."></textarea>
        </article>

        <article class="assignment-panel" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Step 04</span>
            <h5>Confidence</h5>
          </div>
          <label class="assignment-label">Confidence statement</label>
          <textarea class="assignment-field assignment-textarea" placeholder="Write the belief statement you return to when doubt spikes..."></textarea>
          <label class="assignment-label">Between-play routine</label>
          <input class="assignment-field" placeholder="Example: exhale, cue word, visual lock, commit" />
        </article>

        <article class="assignment-panel assignment-panel-wide" style="--assignment-accent:${item.accent}">
          <div class="assignment-panel-head">
            <span class="mono">Review</span>
            <h5>Engine Master Summary</h5>
          </div>
          <p class="assignment-panel-copy">
            The original assignment ended in review/export. In option 2, this becomes a clean summary checkpoint:
            define your reset protocol, your ideal activation zone, your spotlight cue, and your confidence routine in one place.
          </p>
          <textarea class="assignment-field assignment-textarea assignment-textarea-lg" placeholder="Summarize your complete Engine system here..."></textarea>
          <div class="assignment-actions">
            <button type="button" class="assignment-action assignment-action-secondary" id="assignment-back">Back to assignments</button>
            <button type="button" class="assignment-action">Phase 1 system ready</button>
          </div>
        </article>
      </div>
    </section>
  `;
  document.getElementById('assignment-back')?.addEventListener('click', () => setTab('assignments'));
}

function renderAssignmentDetail() {
  const active = ASSIGNMENTS.find((item) => item.id === state.activeId) || ASSIGNMENTS[0];
  if (active.id === 'a1') {
    renderEngineAssignment(active);
    return;
  }

  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
  refs.contentBody.innerHTML = `
    <section class="assignment-shell">
      <article class="assignment-hero" style="--assignment-accent:${active.accent}">
        <div class="assignment-kicker mono">Assignment ${active.code}</div>
        <h4>${active.title}</h4>
        <p>${active.body}</p>
        <div class="assignment-step-row">
          ${active.steps.map((step) => `<span class="assignment-step-pill">${step}</span>`).join('')}
        </div>
      </article>
      <article class="assignment-panel" style="--assignment-accent:${active.accent}">
        <div class="assignment-panel-head">
          <span class="mono">Conversion queue</span>
          <h5>Native option 2 rebuild pending</h5>
        </div>
        <p class="assignment-panel-copy">
          This assignment is now wired into the shell and ready for the same full native conversion pattern as The Engine.
        </p>
        <div class="assignment-actions">
          <button type="button" class="assignment-action assignment-action-secondary" id="assignment-back">Back to assignments</button>
        </div>
      </article>
    </section>
  `;
  document.getElementById('assignment-back')?.addEventListener('click', () => setTab('assignments'));
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
