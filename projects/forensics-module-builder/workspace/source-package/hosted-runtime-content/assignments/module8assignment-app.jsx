import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ClipboardList, FileText, Printer, Search, Shield, Activity as ActivityIcon } from 'lucide-react';
import Module8CareerMatcher, { getCareerRankings, scenarioQuestions } from './module8assignment-career-matcher.jsx';
import Module8DayInLifePicker, { roles } from './module8assignment-day-in-life.jsx';
import LIMSOS_Simulation, { casePhases, getCaseGrade } from './module8assignment-case-role.jsx';

const activityConfig = [
  {
    id: 'career',
    label: 'Career Matcher',
    overline: 'Aptitude Profiler',
    description: 'Run the full scenario sequence and lock your strongest forensic career match.',
    icon: ActivityIcon
  },
  {
    id: 'day',
    label: 'Day-in-the-Life',
    overline: 'Role Picker',
    description: 'Compare where the job happens, what the work feels like, and which tools are involved.',
    icon: Search
  },
  {
    id: 'case',
    label: 'Case-Role Simulation',
    overline: 'LIMS OS',
    description: 'Move evidence through four departments and protect procedure from scene intake to AFIS.',
    icon: ClipboardList
  },
  {
    id: 'reflection',
    label: 'Reflection',
    overline: 'Final Response',
    description: 'Complete all three reflection prompts to unlock the final print-ready report.',
    icon: FileText
  }
];

const MODULE8_ASSIGNMENT_STORAGE_KEY = 'forensics::module8assignment::v1';

function readModule8AssignmentState() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem('forensics::module8assignment::v1');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeModule8AssignmentState(state) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem('forensics::module8assignment::v1', JSON.stringify(state));
  } catch (_error) {
    // Ignore storage write failures.
  }
}

function buildDefaultCareerSnapshot() {
  const selected = Array.from({ length: scenarioQuestions.length }, () => null);
  return {
    complete: false,
    selected,
    ranked: getCareerRankings(selected),
    topMatch: null
  };
}

function buildDefaultDaySnapshot() {
  return {
    complete: false,
    activeRole: roles[0]
  };
}

function buildDefaultCaseSnapshot() {
  return {
    complete: false,
    mistakes: 0,
    decisionHistory: []
  };
}

function buildDefaultReflection() {
  return {
    fit: '',
    surprise: '',
    nextStep: ''
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createReportHtml({ careerSnapshot, daySnapshot, caseSnapshot, reflection }) {
  const generatedAt = new Date().toLocaleString();
  const ranked = careerSnapshot.ranked || [];
  const topMatch = careerSnapshot.topMatch || ranked[0] || { name: 'Not recorded', summary: 'No summary captured.', fit: 'No fit captured.', score: 0 };
  const runnerUp = ranked[1] || { name: 'Not recorded', score: 0 };
  const grade = getCaseGrade(caseSnapshot.mistakes || 0);
  const answerRows = scenarioQuestions
    .map((question, index) => {
      const selectedIndex = careerSnapshot.selected?.[index];
      const answer = selectedIndex === null || selectedIndex === undefined ? 'Not answered' : question.options[selectedIndex].label;
      return `
        <tr>
          <td>${index + 1}. ${escapeHtml(question.phase)}</td>
          <td>${escapeHtml(question.prompt)}</td>
          <td>${escapeHtml(answer)}</td>
        </tr>
      `;
    })
    .join('');
  const rankingRows = ranked
    .map(
      (career, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(career.name)}</td>
          <td>${escapeHtml(career.score)}</td>
        </tr>
      `
    )
    .join('');
  const decisionRows =
    caseSnapshot.decisionHistory?.map(
      (decision) => `
        <tr>
          <td>${escapeHtml(decision.department)}</td>
          <td>${escapeHtml(decision.phaseTitle)}</td>
          <td>${escapeHtml(decision.choiceText)}</td>
          <td>${decision.correct ? 'Correct' : 'Needs correction'}</td>
        </tr>
      `
    ).join('') || '<tr><td colspan="4">No case-role decisions recorded.</td></tr>';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Module 8 Career Path Simulation Lab Report</title>
        <style>
          body { margin: 0; padding: 32px; background: #ffffff; color: #0f172a; font: 15px/1.55 Georgia, 'Times New Roman', serif; }
          h1, h2, h3, p { margin-top: 0; }
          .header { border-bottom: 3px solid #1e293b; padding-bottom: 18px; margin-bottom: 24px; }
          .header h1 { margin-bottom: 10px; font-size: 32px; }
          .meta { margin: 4px 0; color: #475569; font-size: 13px; font-family: Arial, Helvetica, sans-serif; }
          .section { margin-top: 24px; break-inside: avoid; }
          .section h2 { margin-bottom: 12px; font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; }
          .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #f8fafc; margin-bottom: 14px; }
          .answer-block { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; background: #ffffff; min-height: 96px; white-space: pre-wrap; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; vertical-align: top; text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; }
          th { background: #e2e8f0; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
          .pill { display: inline-block; padding: 5px 10px; border-radius: 999px; font: 700 11px/1 Arial, Helvetica, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
          @media print { body { padding: 18px; } .page-break { break-before: page; } }
        </style>
      </head>
      <body>
        <header class="header">
          <h1>Module 8 Career Path Simulation Lab</h1>
          <p class="meta">Generated: ${escapeHtml(generatedAt)}</p>
          <p class="meta">Activities complete: Career Matcher, Day-in-the-Life Picker, Case-Role Simulation, Reflection</p>
        </header>

        <section class="section">
          <h2>1. Career Matcher</h2>
          <div class="card">
            <p><strong>Top Match:</strong> ${escapeHtml(topMatch.name)} (${escapeHtml(topMatch.score)} points)</p>
            <p><strong>Runner Up:</strong> ${escapeHtml(runnerUp.name)} (${escapeHtml(runnerUp.score)} points)</p>
            <p><strong>Operational Summary:</strong> ${escapeHtml(topMatch.summary)}</p>
            <p><strong>Psychological Fit:</strong> ${escapeHtml(topMatch.fit)}</p>
          </div>
          <table>
            <thead>
              <tr><th>Rank</th><th>Career</th><th>Score</th></tr>
            </thead>
            <tbody>${rankingRows}</tbody>
          </table>
          <div style="height: 12px;"></div>
          <table>
            <thead>
              <tr><th>Phase</th><th>Prompt</th><th>Selected Answer</th></tr>
            </thead>
            <tbody>${answerRows}</tbody>
          </table>
        </section>

        <section class="section page-break">
          <h2>2. Day-in-the-Life Picker</h2>
          <div class="card">
            <p><strong>Selected Role:</strong> ${escapeHtml(daySnapshot.activeRole?.title || 'Not recorded')}</p>
            <p>${escapeHtml(daySnapshot.activeRole?.summary || 'No role summary recorded.')}</p>
          </div>
          <div class="grid">
            <div class="card"><h3>What the job does</h3><p>${escapeHtml(daySnapshot.activeRole?.what || '')}</p></div>
            <div class="card"><h3>Where the work happens</h3><p>${escapeHtml(daySnapshot.activeRole?.where || '')}</p></div>
            <div class="card"><h3>Typical pace</h3><p>${escapeHtml(daySnapshot.activeRole?.pace || '')}</p></div>
            <div class="card"><h3>Common tools</h3><p>${escapeHtml(daySnapshot.activeRole?.tools || '')}</p></div>
          </div>
        </section>

        <section class="section page-break">
          <h2>3. Case-Role Simulation</h2>
          <div class="card">
            <p><strong>Case Status:</strong> <span class="pill" style="color: ${grade.tone}; border: 1px solid ${grade.tone}; background: transparent;">${escapeHtml(grade.label)}</span></p>
            <p><strong>Procedural Errors:</strong> ${escapeHtml(caseSnapshot.mistakes || 0)}</p>
          </div>
          <table>
            <thead>
              <tr><th>Department</th><th>Phase</th><th>Submitted Action</th><th>Outcome</th></tr>
            </thead>
            <tbody>${decisionRows}</tbody>
          </table>
        </section>

        <section class="section page-break">
          <h2>4. Reflection</h2>
          <div class="card"><h3>Which activity felt most natural?</h3><div class="answer-block">${escapeHtml(reflection.fit || '')}</div></div>
          <div class="card"><h3>What surprised you?</h3><div class="answer-block">${escapeHtml(reflection.surprise || '')}</div></div>
          <div class="card"><h3>What career do you want to research next?</h3><div class="answer-block">${escapeHtml(reflection.nextStep || '')}</div></div>
        </section>
      </body>
    </html>
  `;
}

function printReportHtml(html) {
  const frame = document.getElementById('module8-report-frame');
  const frameWindow = frame?.contentWindow;

  if (!frame || !frameWindow) {
    return;
  }

  const doc = frameWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.print();
  }, 300);
}

function ActivitySelectorCard({ activity, active, complete, summary, onSelect }) {
  const Icon = activity.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-[1.6rem] border p-5 text-left transition-all duration-300 ${
        active
          ? 'border-rose-400/70 bg-rose-500/12 shadow-[0_24px_70px_rgba(244,63,94,0.2)]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.2),transparent_35%)] opacity-90"></div>
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
            <Icon className="h-3.5 w-3.5 text-rose-300" />
            {activity.overline}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">{activity.label}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">{activity.description}</p>
          </div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${complete ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-300' : 'border-amber-400/30 bg-amber-500/12 text-amber-200'}`}>
          {complete ? 'Complete' : 'Pending'}
        </div>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
        <span>{summary}</span>
        <span className="font-semibold text-slate-200 transition-transform duration-300 group-hover:translate-x-1">Open</span>
      </div>
    </button>
  );
}

function ReflectionField({ label, value, onChange, placeholder }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-slate-100">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-rose-400/60 focus:ring-2 focus:ring-rose-400/20"
      />
    </label>
  );
}

function ReflectionPanel({ reflection, updateReflection, isComplete }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-xl md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.14),transparent_30%)]"></div>
      <div className="relative">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300">
              <FileText className="h-4 w-4 text-rose-300" />
              Reflection Notes
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">Capture what the report should print.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              Reflection is now a required activity. All three fields must be completed before report generation unlocks.
            </p>
          </div>
          <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${isComplete ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}>
            {isComplete ? 'Reflection Complete' : 'All 3 Responses Required'}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <ReflectionField
            label="Which activity felt most natural?"
            value={reflection.fit}
            onChange={(value) => updateReflection('fit', value)}
            placeholder="Describe the activity and explain why it matched your instincts."
          />
          <ReflectionField
            label="What surprised you?"
            value={reflection.surprise}
            onChange={(value) => updateReflection('surprise', value)}
            placeholder="Note any job detail, tool, or procedure that changed your view."
          />
          <ReflectionField
            label="What career do you want to research next?"
            value={reflection.nextStep}
            onChange={(value) => updateReflection('nextStep', value)}
            placeholder="Name the career and what you want to learn more about."
          />
        </div>
      </div>
    </section>
  );
}

function Module8AssignmentApp() {
  const [persistedState] = useState(() => readModule8AssignmentState());
  const [activeActivity, setActiveActivity] = useState(persistedState?.activeActivity || 'career');
  const [careerSnapshot, setCareerSnapshot] = useState(
    persistedState?.careerSnapshot && typeof persistedState.careerSnapshot === 'object'
      ? persistedState.careerSnapshot
      : buildDefaultCareerSnapshot()
  );
  const [daySnapshot, setDaySnapshot] = useState(
    persistedState?.daySnapshot && typeof persistedState.daySnapshot === 'object'
      ? persistedState.daySnapshot
      : buildDefaultDaySnapshot()
  );
  const [caseSnapshot, setCaseSnapshot] = useState(
    persistedState?.caseSnapshot && typeof persistedState.caseSnapshot === 'object'
      ? persistedState.caseSnapshot
      : buildDefaultCaseSnapshot()
  );
  const [reflection, setReflection] = useState(
    persistedState?.reflection && typeof persistedState.reflection === 'object'
      ? {
          fit: persistedState.reflection.fit || '',
          surprise: persistedState.reflection.surprise || '',
          nextStep: persistedState.reflection.nextStep || ''
        }
      : buildDefaultReflection()
  );

  useEffect(() => {
    writeModule8AssignmentState({
      activeActivity,
      careerSnapshot,
      daySnapshot,
      caseSnapshot,
      reflection
    });
  }, [activeActivity, careerSnapshot, daySnapshot, caseSnapshot, reflection]);

  const reflectionComplete =
    reflection.fit.trim().length > 0 &&
    reflection.surprise.trim().length > 0 &&
    reflection.nextStep.trim().length > 0;
  const allComplete = careerSnapshot.complete && daySnapshot.complete && caseSnapshot.complete && reflectionComplete;
  const completedCount = [careerSnapshot.complete, daySnapshot.complete, caseSnapshot.complete, reflectionComplete].filter(Boolean).length;
  const topMatch = careerSnapshot.topMatch;
  const caseGrade = getCaseGrade(caseSnapshot.mistakes || 0);
  const reflectionFilledCount = [reflection.fit, reflection.surprise, reflection.nextStep].filter((entry) => entry.trim().length > 0).length;
  const activitySummaries = {
    career: topMatch ? `${topMatch.name} is currently leading.` : `${careerSnapshot.selected.filter((value) => value !== null).length} of ${scenarioQuestions.length} prompts answered.`,
    day: daySnapshot.complete ? `${daySnapshot.activeRole?.title || 'Role selected'} captured for the report.` : 'Choose a role to complete this activity.',
    case: caseSnapshot.complete ? `${caseGrade.label} with ${caseSnapshot.mistakes || 0} procedural error(s).` : `${caseSnapshot.decisionHistory?.length || 0} of ${casePhases.length} evidence phases submitted.`,
    reflection: reflectionComplete ? 'All required reflection responses completed.' : `${reflectionFilledCount} of 3 required responses completed.`
  };

  function updateReflection(field, value) {
    setReflection((current) => ({ ...current, [field]: value }));
  }

  function handlePrintReport() {
    if (!allComplete) {
      return;
    }
    printReportHtml(
      createReportHtml({
        careerSnapshot,
        daySnapshot,
        caseSnapshot,
        reflection
      })
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(251,113,133,0.12),transparent_26%)]"></div>
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-rose-200">
                  <Shield className="h-4 w-4" />
                  Module 8 Unified Career Assignment
                </div>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Complete all four required activities in one place.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  The assignment now combines your Canvas-generated career matcher, day-in-the-life picker, LIMS case-role simulation, and a required reflection activity. Students can complete them in any order and finish with one print-ready report.
                </p>
              </div>
              <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:min-w-[280px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Assignment Tracker</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white">
                    {completedCount} / 4 complete
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-red-500 transition-all duration-500" style={{ width: `${(completedCount / 4) * 100}%` }}></div>
                </div>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  disabled={!allComplete}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    allComplete
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/10 hover:bg-slate-100 active:scale-[0.99]'
                      : 'cursor-not-allowed border border-white/10 bg-white/[0.05] text-slate-500'
                  }`}
                >
                  <Printer className="h-4 w-4" />
                  Generate Print Report
                </button>
                {!allComplete && (
                  <p className="text-xs leading-5 text-slate-500">
                    Complete Career Matcher, Day-in-the-Life, Case-Role Simulation, and Reflection before printing.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {activityConfig.map((activity) => (
                <ActivitySelectorCard
                  key={activity.id}
                  activity={activity}
                  active={activeActivity === activity.id}
                  complete={
                    activity.id === 'career'
                      ? careerSnapshot.complete
                      : activity.id === 'day'
                        ? daySnapshot.complete
                        : activity.id === 'case'
                          ? caseSnapshot.complete
                          : reflectionComplete
                  }
                  summary={activitySummaries[activity.id]}
                  onSelect={() => setActiveActivity(activity.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={activeActivity === 'career' ? 'block' : 'hidden'}>
          <Module8CareerMatcher onStateChange={setCareerSnapshot} initialState={careerSnapshot} />
        </div>
        <div className={activeActivity === 'day' ? 'block' : 'hidden'}>
          <Module8DayInLifePicker onStateChange={setDaySnapshot} initialState={daySnapshot} />
        </div>
        <div className={activeActivity === 'case' ? 'block' : 'hidden'}>
          <LIMSOS_Simulation onStateChange={setCaseSnapshot} initialState={caseSnapshot} />
        </div>
        <div className={activeActivity === 'reflection' ? 'block' : 'hidden'}>
          <ReflectionPanel reflection={reflection} updateReflection={updateReflection} isComplete={reflectionComplete} />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Module8AssignmentApp />);
