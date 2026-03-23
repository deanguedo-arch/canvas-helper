import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  User, 
  Printer,
  LayoutDashboard,
  Menu,
  Briefcase,
  Heart,
  FileText,
  Target,
  PlayCircle,
  Lightbulb,
  Building,
  Network,
  Users, 
  Quote, 
  CheckCircle2,
  PenTool,
  Mail
} from 'lucide-react';
import CareerPlanning from './components/careerplanning.reference.jsx';
import ResourcefulPeople from './components/resourcefulpeople.reference.jsx';
import MasterPlan from './components/masterplan.reference.jsx';
import ResumeBuilder from './components/resumebuilder.reference.jsx';
import CoverLetterBuilder from './components/coverletterbuilder.reference.jsx';
import {
  CALM_MODULE_4_CAREER_PLANNER_STORAGE_KEY,
  CALM_MODULE_4_COVER_LETTER_STORAGE_KEY,
  CALM_MODULE_4_MAIN_STORAGE_KEY,
  CALM_MODULE_4_MASTER_PLAN_STORAGE_KEY,
  CALM_MODULE_4_RESOURCEFUL_PEOPLE_STORAGE_KEY,
  CALM_MODULE_4_RESUME_BUILDER_STORAGE_KEY
} from './components/storageKeys.js';

// Export compatibility: storage-key scanners detect this exact token.
const STORAGE_KEY = 'calmModule4MainState';

// Define the units based on the CALM Module 4 PDFs
const MODULE_UNITS = [
  { id: 'intro', title: 'Career Exploration', icon: BookOpen },
  { id: 'portfolio', title: 'Career Planner', icon: Briefcase },
  { id: 'resourceful-people', title: 'Resourceful People', icon: Users },
  { id: 'master-plan', title: 'Master Plan', icon: FileText },
  { id: 'resume-builder', title: 'Resume Builder', icon: PenTool },
  { id: 'cover-letter-builder', title: 'Cover Letter Builder', icon: Mail },
  { id: 'reflection', title: 'Module Reflection', icon: FileText, isInteractive: true },
];

const DEFAULT_MAIN_FORM_DATA = {
  // Career Exploration (Shadowing & Volunteering)
  jobShadow1: '',
  jobShadow2: '',
  whyVolunteer: '',
  volunteerSkills: '',
  volunteerExperience: '',
  idealVolunteer: '',
  volunteerResume: '',
  mandatoryVolunteer: '',
  // Module Reflection
  loveWhatYouDo: '',
  influences: '',
  jobSkills: '',
  portfolioBenefits: '',
  portfolioAdjustments: '',
  missionPurpose: '',
  selfAssessment: ''
};

const readStoredJson = (storageKey) => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
};

const prettifyPathSegment = (segment) => {
  if (typeof segment === 'number') {
    return `Item ${segment + 1}`;
  }

  const source = String(segment)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return source.replace(/\b\w/g, (char) => char.toUpperCase());
};

const flattenAnsweredEntries = (value, path = [], entries = []) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      entries.push({
        label: path.map(prettifyPathSegment).join(' / '),
        value: trimmed
      });
    }
    return entries;
  }

  if (typeof value === 'number') {
    if (Number.isFinite(value)) {
      entries.push({
        label: path.map(prettifyPathSegment).join(' / '),
        value: String(value)
      });
    }
    return entries;
  }

  if (typeof value === 'boolean') {
    entries.push({
      label: path.map(prettifyPathSegment).join(' / '),
      value: value ? 'Yes' : 'No'
    });
    return entries;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenAnsweredEntries(item, [...path, index], entries));
    return entries;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      flattenAnsweredEntries(nestedValue, [...path, key], entries);
    });
  }

  return entries;
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = readStoredJson(CALM_MODULE_4_MAIN_STORAGE_KEY);
    return typeof saved?.isSidebarOpen === 'boolean' ? saved.isSidebarOpen : true;
  });

  const [activeUnitId, setActiveUnitId] = useState(() => {
    const saved = readStoredJson(CALM_MODULE_4_MAIN_STORAGE_KEY);
    const savedUnitId = typeof saved?.activeUnitId === 'string' ? saved.activeUnitId : null;
    return MODULE_UNITS.some((unit) => unit.id === savedUnitId)
      ? savedUnitId
      : MODULE_UNITS[0].id;
  });

  const [completedUnits, setCompletedUnits] = useState(() => {
    const saved = readStoredJson(CALM_MODULE_4_MAIN_STORAGE_KEY);
    const savedUnits = Array.isArray(saved?.completedUnits)
      ? saved.completedUnits.filter((unitId) => MODULE_UNITS.some((unit) => unit.id === unitId))
      : [];

    if (!savedUnits.includes('intro')) {
      savedUnits.unshift('intro');
    }

    return [...new Set(savedUnits)];
  });

  const [isSaving, setIsSaving] = useState(false);

  // Form state for the final reflection questions
  const [formData, setFormData] = useState(() => {
    const saved = readStoredJson(CALM_MODULE_4_MAIN_STORAGE_KEY);
    return {
      ...DEFAULT_MAIN_FORM_DATA,
      ...(saved?.formData || {})
    };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CALM_MODULE_4_MAIN_STORAGE_KEY,
        JSON.stringify({
          isSidebarOpen,
          activeUnitId,
          completedUnits,
          formData
        })
      );
    } catch (error) {
      // Ignore storage quota/privacy errors and keep the UI interactive.
    }
  }, [isSidebarOpen, activeUnitId, completedUnits, formData]);

  const activeUnitIndex = MODULE_UNITS.findIndex(u => u.id === activeUnitId);
  const activeUnit = MODULE_UNITS[activeUnitIndex];
  const isBuilderUnit = activeUnitId === 'resume-builder' || activeUnitId === 'cover-letter-builder';
  const isWideUnit = isBuilderUnit || activeUnitId === 'portfolio' || activeUnitId === 'resourceful-people' || activeUnitId === 'master-plan';
  
  // Calculate progress
  const progressPercentage = Math.round((completedUnits.length / MODULE_UNITS.length) * 100);

  const handleNext = () => {
    if (!completedUnits.includes(activeUnitId)) {
      setCompletedUnits([...completedUnits, activeUnitId]);
    }
    if (activeUnitIndex < MODULE_UNITS.length - 1) {
      setActiveUnitId(MODULE_UNITS[activeUnitIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (activeUnitIndex > 0) {
      setActiveUnitId(MODULE_UNITS[activeUnitIndex - 1].id);
    }
  };

  const handleGenerateReport = () => {
    setIsSaving(true);
    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      setIsSaving(false);
      return;
    }

    try {
      const html = buildTeacherReportHtml();
      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
      reportWindow.focus();
      window.setTimeout(() => {
        reportWindow.print();
        setIsSaving(false);
      }, 200);
    } catch (error) {
      reportWindow.document.body.innerHTML = '<pre style="padding:16px;font-family:monospace;">Report generation failed.</pre>';
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const reportDate = new Date().toLocaleString();
  const reportQuestions = [
    { key: 'jobShadow1', label: 'Job Shadowing Choice 1' },
    { key: 'jobShadow2', label: 'Job Shadowing Choice 2' },
    { key: 'whyVolunteer', label: 'Why do people volunteer?' },
    { key: 'volunteerSkills', label: 'Skills helpful to community organizations' },
    { key: 'volunteerExperience', label: 'Volunteer experience' },
    { key: 'idealVolunteer', label: 'Ideal way to volunteer in the community' },
    { key: 'volunteerResume', label: 'Why volunteer work belongs on a resume' },
    { key: 'mandatoryVolunteer', label: 'Should youth volunteer work be required?' },
    { key: 'loveWhatYouDo', label: 'Can what you love become what you do?' },
    { key: 'influences', label: 'Major influences on career decisions' },
    { key: 'jobSkills', label: 'Skills and behaviors needed to keep a job' },
    { key: 'portfolioBenefits', label: 'Benefits of having a portfolio' },
    { key: 'portfolioAdjustments', label: 'How to adjust a portfolio for different jobs' },
    { key: 'missionPurpose', label: 'Purpose of a mission statement' },
    { key: 'selfAssessment', label: 'Importance of ongoing self-assessment' }
  ];

  const introReflectionEntries = reportQuestions
    .map((question) => ({
      label: question.label,
      value: String(formData[question.key] ?? '').trim()
    }))
    .filter((entry) => entry.value.length > 0);

  const careerPlannerState = readStoredJson(CALM_MODULE_4_CAREER_PLANNER_STORAGE_KEY);
  const resourcefulPeopleState = readStoredJson(CALM_MODULE_4_RESOURCEFUL_PEOPLE_STORAGE_KEY);
  const masterPlanState = readStoredJson(CALM_MODULE_4_MASTER_PLAN_STORAGE_KEY);
  const resumeBuilderState = readStoredJson(CALM_MODULE_4_RESUME_BUILDER_STORAGE_KEY);
  const coverLetterState = readStoredJson(CALM_MODULE_4_COVER_LETTER_STORAGE_KEY);

  const reportSections = [
    {
      eyebrow: 'Core Workbook',
      title: 'Career Exploration & Reflection',
      entries: introReflectionEntries
    },
    {
      eyebrow: 'Career Planner',
      title: 'Portfolio Workbook Responses',
      entries: flattenAnsweredEntries(careerPlannerState?.formData || {})
    },
    {
      eyebrow: 'Resourceful People',
      title: 'Reflection & Resource List',
      entries: flattenAnsweredEntries({
        reflections: resourcefulPeopleState?.reflections || {},
        resources: resourcefulPeopleState?.resources || {}
      })
    },
    {
      eyebrow: 'Master Plan',
      title: 'Career, Post-Secondary, and Course Planning',
      entries: flattenAnsweredEntries(masterPlanState?.data || {})
    },
    {
      eyebrow: 'Resume Builder',
      title: 'Resume Workshop Responses',
      entries: flattenAnsweredEntries(resumeBuilderState?.resume || {})
    },
    {
      eyebrow: 'Cover Letter Builder',
      title: 'Cover Letter Workshop Responses',
      entries: flattenAnsweredEntries(coverLetterState?.formData || {})
    }
  ];

  const allReportEntries = reportSections.flatMap((section) =>
    section.entries.map((entry) => ({
      label: `${section.title} / ${entry.label}`,
      value: entry.value
    }))
  );

  const totalAnsweredCount = reportSections.reduce((total, section) => total + section.entries.length, 0);
  const sectionsWithAnswers = reportSections.filter((section) => section.entries.length > 0).length;

  const hasTeacherReportValue = (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    return Boolean(value);
  };

  const escapeTeacherReportHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderTeacherReportValue = (value) => {
    if (!hasTeacherReportValue(value)) {
      return '<span class="answer-empty-chip">No response provided</span>';
    }
    return escapeTeacherReportHtml(value).replace(/\n/g, '<br />');
  };

  const buildTeacherReportSection = (eyebrow, title, bodyHtml) => `
    <section class="report-section">
      <div class="report-section-heading">
        <p class="report-section-eyebrow">${escapeTeacherReportHtml(eyebrow)}</p>
        <h2>${escapeTeacherReportHtml(title)}</h2>
      </div>
      ${bodyHtml}
    </section>
  `;

  const renderTeacherReportCardGrid = (items) => items.map((item) => `
      <article class="report-card report-card-wide">
        <h3>${escapeTeacherReportHtml(item.label)}</h3>
        <div class="report-answer">${renderTeacherReportValue(item.value)}</div>
      </article>
    `).join('');

  const buildTeacherReportHtml = () => {
    const responseSections = reportSections.map((section) => {
      if (section.entries.length === 0) {
        return buildTeacherReportSection(
          section.eyebrow,
          section.title,
          `<div class="report-grid">
            <article class="report-card report-card-wide">
              <h3>No responses captured yet</h3>
              <div class="report-answer">Complete this section in Module 4, then generate the report again.</div>
            </article>
          </div>`
        );
      }

      return buildTeacherReportSection(
        section.eyebrow,
        section.title,
        `<div class="report-grid">${renderTeacherReportCardGrid(section.entries)}</div>`
      );
    }).join('');

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CALM Module 4 Teacher Report</title>
        <style>
          :root { color-scheme: light; --ink: #0f172a; --muted: #475569; --line: #dbe4f0; --panel: #ffffff; --panel-soft: #f8fafc; --accent: #6d28d9; --warning: #92400e; --warning-soft: #fff7ed; }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 2rem; background: #eef2ff; color: var(--ink); font-family: Inter, "Segoe UI", Arial, sans-serif; }
          .report-shell { max-width: 1100px; margin: 0 auto; }
          .report-hero { background: linear-gradient(135deg, #4c1d95, #7c3aed 52%, #c4b5fd); color: white; border-radius: 2rem; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 24px 60px rgba(76, 29, 149, 0.22); }
          .report-hero h1 { margin: 0 0 0.6rem; font-size: 2rem; line-height: 1.05; }
          .report-hero p { margin: 0; color: rgba(255, 255, 255, 0.88); font-size: 1rem; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.9rem; margin-top: 1.4rem; }
          .summary-stat { background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 1.25rem; padding: 0.95rem 1rem; }
          .summary-stat-label { display: block; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.74); margin-bottom: 0.35rem; }
          .summary-stat-value { font-size: 1.05rem; font-weight: 800; line-height: 1.35; }
          .report-section { background: var(--panel); border: 1px solid var(--line); border-radius: 1.8rem; padding: 1.4rem; margin-bottom: 1.2rem; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06); }
          .report-section-heading { margin-bottom: 1rem; }
          .report-section-eyebrow { margin: 0 0 0.3rem; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
          .report-section-heading h2 { margin: 0; font-size: 1.45rem; line-height: 1.15; }
          .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.9rem; }
          .report-card { background: var(--panel-soft); border: 1px solid var(--line); border-radius: 1.25rem; padding: 1rem; break-inside: avoid; }
          .report-card-wide { grid-column: 1 / -1; }
          .report-card h3 { margin: 0 0 0.65rem; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
          .report-answer { font-size: 0.95rem; line-height: 1.6; color: var(--ink); }
          .answer-empty-chip { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.3rem 0.7rem; background: var(--warning-soft); color: var(--warning); font-size: 0.8rem; font-weight: 700; }
          @media print { body { background: white; padding: 0; } .report-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="report-shell">
          <header class="report-hero">
            <h1>CALM Module 4 Teacher Report</h1>
            <p>Career, portfolio, resume, and cover letter responses for review, printing, and discussion.</p>
            <div class="summary-grid">
              <div class="summary-stat"><span class="summary-stat-label">Answered Fields</span><div class="summary-stat-value">${totalAnsweredCount}</div></div>
              <div class="summary-stat"><span class="summary-stat-label">Sections With Answers</span><div class="summary-stat-value">${sectionsWithAnswers} / ${reportSections.length}</div></div>
              <div class="summary-stat"><span class="summary-stat-label">Generated</span><div class="summary-stat-value">${escapeTeacherReportHtml(reportDate)}</div></div>
            </div>
          </header>
          ${responseSections}
        </div>
      </body>
    </html>`;
  };

  // --- Content Renderers ---

  const renderContent = () => {
    switch (activeUnitId) {
      case 'intro':
        return (
          <div className="space-y-16 max-w-4xl mx-auto pb-10">
            {/* 1. Career Exploration Header */}
            <div>
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
                Career Exploration
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"></div>
              <p className="text-slate-300 leading-relaxed text-xl font-medium">
                There are many ways to explore jobs and careers to help determine what type of job you would like to pursue. 
                We are going to quickly look at four effective ways to "test-drive" a job and get some hands-on experience.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-3xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Target className="text-pink-400" />
                Why test-drive?
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                Getting hands-on experience is extremely valuable because some jobs seem great on paper but, in real life, 
                it may not be as enjoyable as you thought. The reverse can also be true, it may seem like a horrible job 
                on paper but, in real life, it could be your dream job. How else will you know unless you try?
              </p>
            </div>

            {/* 2. Job Shadowing Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-700/50 pb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-3xl font-bold text-white">Job Shadowing</h3>
              </div>
              
              <div className="text-slate-300 space-y-4 text-lg">
                <p>
                  Job shadowing can be an important career step for anyone who is looking to break into a new field or 
                  learn more about the job of their dreams. You can find opportunities to shadow a new position in almost any field.
                </p>
                <p>
                  It is an important process of observing the day-to-day tasks of a job in order to learn whether or not 
                  it is a good fit for your skills and interests. Job shadowing is often targeted at people who are deciding 
                  on a career path or are in the early phases of career planning. It usually entails following an employee 
                  while they complete their regular duties and daily routine. You could even work on some light skill 
                  development, but since these are usually short programs that sometimes only last a day or two, they are 
                  more associated with observation than skill development.
                </p>
              </div>

              {/* Benefits Cards Grid */}
              <div className="pt-4">
                <h4 className="text-xl font-bold text-white mb-6">What are the benefits of job shadowing?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-colors group">
                    <Lightbulb className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <h5 className="font-bold text-white text-lg mb-2">Important Insight</h5>
                    <p className="text-slate-400">Partaking in a job-shadowing program offers important insights about the career and the profession that will help you decide if it's the right fit for you.</p>
                  </div>
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-colors group">
                    <Building className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <h5 className="font-bold text-white text-lg mb-2">Organizational Info</h5>
                    <p className="text-slate-400">By job shadowing, you gain information about an organization or industry you might want to work in. This can be important for setting the right expectations.</p>
                  </div>
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-colors group">
                    <Network className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <h5 className="font-bold text-white text-lg mb-2">Networking</h5>
                    <p className="text-slate-400">Job shadowing is a good way to network and meet important people in fields you might want to work in.</p>
                  </div>
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-colors group">
                    <Users className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <h5 className="font-bold text-white text-lg mb-2">Skill Development</h5>
                    <p className="text-slate-400">Job shadowing could result in light skill development.</p>
                  </div>
                </div>
              </div>

              {/* Q&A section */}
              <div className="bg-[#0f172a] p-8 rounded-3xl border border-slate-700/50 space-y-6">
                <div>
                  <h5 className="text-pink-400 font-bold mb-2 uppercase tracking-wide text-sm">Can I get paid for job shadowing?</h5>
                  <p className="text-slate-300">Generally, there is no payment associated with job shadowing. It’s a short-term commitment that allows potential applicants to explore jobs and their own interests in order to develop skills and experience as the main objective.</p>
                </div>
                <div>
                  <h5 className="text-pink-400 font-bold mb-2 uppercase tracking-wide text-sm">Can I include job shadowing on my resume?</h5>
                  <p className="text-slate-300">Job shadowing can be used on your resume. In most cases, job shadowing is included at the bottom of a resume where you would normally list awards, scholarships, volunteer experience or publications. You may choose to include it within the work experience of a chronological resume format. In a functional resume, job shadowing could be included in a more prominent way if it makes sense to the job you are applying for.</p>
                </div>
              </div>

              {/* Case Study */}
              <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 sm:p-10 rounded-3xl border border-indigo-500/30 overflow-hidden">
                <Quote className="absolute top-6 right-6 text-indigo-500/20 rotate-180" size={80} />
                <div className="relative z-10">
                  <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Real World Scenario</span>
                  <h4 className="text-2xl font-bold text-white mb-4">Example of Job Shadow Training</h4>
                  <p className="text-indigo-100/80 leading-relaxed mb-4 text-lg">
                    Gail works at a restaurant and has expressed interest in moving from a serving position to an open management position. After discussing the position with Gail, Gail’s manager, Rose, has decided that she can shadow her for a week to decide if she wants to take the job.
                  </p>
                  <p className="text-indigo-100/80 leading-relaxed text-lg">
                    During this time, Gail watches how Rose performs her essential duties like opening the restaurant, counting down the till and doing bank deposits. Gail is given the opportunity after each shift to ask questions. By the end of the week, Gail has started performing some of Rose’s duties while shadowing and is gaining the essential skills she needs to be successful in the role. <strong className="text-white">Most importantly, however, Gail learns it’s the right fit for her.</strong>
                  </p>
                </div>
              </div>

              {/* Job Shadow Interactive Checkpoint */}
              <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 mt-8">
                <label className="block text-sm font-bold uppercase tracking-widest text-pink-400 mb-4">
                  If you had the opportunity to job shadow anywhere in the work force, where would it be? (List at least two jobs/places)
                </label>
                <div className="space-y-4">
                  <input 
                    type="text"
                    name="jobShadow1"
                    value={formData.jobShadow1}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition-all text-base"
                    placeholder="1. First dream job or company..."
                  />
                  <input 
                    type="text"
                    name="jobShadow2"
                    value={formData.jobShadow2}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition-all text-base"
                    placeholder="2. Second dream job or company..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Volunteering Section */}
            <div className="space-y-10 pt-10 border-t border-slate-700/50 mt-10">
              <div className="flex items-center gap-4 border-b border-slate-700/50 pb-4">
                <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400">
                  <Heart size={28} />
                </div>
                <h3 className="text-3xl font-bold text-white">Volunteering</h3>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed">
                Getting volunteer experience in your community can be a helpful step in the career exploration process 
                and can assist all of us greatly in discovering our skills and strengths. <strong className="text-pink-400">Plus, volunteering looks GREAT on a resume!</strong> If you are having trouble finding a job because you have no work experience, start volunteering today!
              </p>
              
              <p className="text-slate-400 italic">Read the two articles below regarding youth and volunteerism and then answer the related questions.</p>

              {/* Magazine Style Article 1 */}
              <article className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl">
                <div className="bg-slate-800 p-8 sm:px-12 border-b border-slate-700/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none"></div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight relative z-10">
                    Youth Who Volunteer Get Better Grades and Become Active Citizens
                  </h3>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">DV</div>
                    <p className="text-pink-400 text-sm font-bold tracking-widest uppercase">By Devorah Vineburg</p>
                  </div>
                </div>
                
                <div className="p-8 sm:p-12 space-y-6 text-slate-300 text-lg leading-relaxed bg-[#020617]/50">
                  <p>
                    <span className="float-left text-6xl font-black text-slate-500 mr-2 -mt-2">V</span>
                    olunteering amongst High School students has reached the highest levels in the past 50 years. 
                    Research has shown that those people who have volunteered when they are young, and who have seen 
                    their parents volunteer, become the most generous adults for charitable and philanthropic causes.
                  </p>
                  
                  <h4 className="text-2xl font-bold text-white mt-8 mb-4">Why Is It Important for Youth to Volunteer?</h4>
                  <p>
                    Youth who volunteer are twice as likely to volunteer as adults. The Independent Sector, a leading organization 
                    doing research on charity and philanthropy in the United States, has shown that 6 out of 10 volunteers, 
                    started volunteering by age 14. When surveyed, 70% of teens that volunteer reported that volunteering 
                    gave them a new perspective on community issues.
                  </p>
                  <p>
                    Volunteering not only creates engaged young citizens. As a result of their volunteer efforts, teens report 
                    doing better in school, improved grades, developing new career goals and of learning about new career options.
                  </p>

                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 my-8">
                    <h5 className="font-bold text-pink-400 mb-4 tracking-wide uppercase text-sm">Other significant benefits of youth volunteerism include:</h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Learning how to respect others",
                        "Learning how to be helpful and kind",
                        "Understanding people different from themselves",
                        "Developing leadership skills",
                        "Becoming more patient",
                        "Understanding qualities of good citizenship"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-1" />
                          <span className="text-slate-300 text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    From their volunteer experiences teens learn how to solve community problems, enhanced understanding 
                    of good citizenship, to become more aware of community programs, and more about how government and voluntary organizations work.
                  </p>
                  <p>
                    Adults who began volunteering as youth, are twice as likely to volunteer, as compared to those who did 
                    not volunteer when they were younger. Today, 44% of adults volunteer. Of these adult volunteers, 2/3 
                    of these volunteers began volunteering when they were young.
                  </p>
                  
                  <div className="text-center pt-6">
                    <p className="text-xl font-bold text-white italic">"Encourage a young person to get involved in the community today!"</p>
                  </div>
                </div>
              </article>

              {/* Magazine Style Article 2 */}
              <article className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl mt-12">
                <div className="bg-slate-800 p-8 sm:px-12 border-b border-slate-700/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight relative z-10">
                    Volunteering is Great for You Too!
                  </h3>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">DV</div>
                    <p className="text-emerald-400 text-sm font-bold tracking-widest uppercase">By Devorah Vineburg</p>
                  </div>
                </div>
                
                <div className="p-8 sm:p-12 space-y-8 text-slate-300 text-lg leading-relaxed bg-[#020617]/50">
                  <div className="text-center px-4 py-8 bg-slate-800/30 rounded-3xl border border-slate-700/30 mb-10">
                    <p className="text-2xl sm:text-3xl font-serif italic text-white leading-relaxed">
                      "Never doubt that a small, group of thoughtful, committed citizens can change the world. Indeed, it is the only thing that ever has."
                    </p>
                    <p className="text-emerald-400 font-bold uppercase tracking-widest mt-4 text-sm">— Margaret Mead</p>
                  </div>

                  <p>
                    Our world benefits from all of the good works that volunteers do. Did you ever stop to realize however, 
                    some of the benefits volunteering brings to you, yourself, also?
                  </p>
                  
                  <h4 className="text-2xl font-bold text-white mt-8 mb-6">Top 10 Reasons to Volunteer (For Yourself!)</h4>
                  
                  <div className="space-y-4">
                    {[
                      "Volunteering builds self-confidence.",
                      "Volunteering helps you learn new skills.",
                      "Volunteering helps you meet new people and make new friends.",
                      "Volunteering with your friends and family members helps to build stronger bonds and relationships with the people that you care about.",
                      "Volunteering keeps you healthy and helps to maintain positive mental health.",
                      "Volunteering helps you learn more about important social issues in your community.",
                      "Volunteering helps you to develop a great understanding and appreciation about diversity and other cultures.",
                      "Volunteering helps you share a lifetime of experience.",
                      "Volunteering helps build a common bond with others in our community. (Instead of discussing the weather, try telling them about your volunteer projects!)",
                      "Volunteering with our children helps to teach them important values. Be a role model!"
                    ].map((reason, i) => (
                      <div key={i} className="flex gap-4 items-start bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-slate-200 pt-1.5">{reason}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xl font-medium text-white text-center pt-8 border-t border-slate-700/50">
                    So, the next time you step out the door to get involved in a project in your community remember, 
                    volunteering is not just great for our communities. <span className="text-emerald-400">It is a great activity that keeps you happy and healthy too!</span>
                  </p>
                </div>
              </article>
            </div>

            {/* Volunteering Reflection Questions */}
            <div className="mt-16 bg-slate-800/30 p-8 sm:p-10 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-pink-900/5 to-transparent pointer-events-none"></div>
              
              <div className="mb-10 text-center relative z-10">
                <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Community Action Plan</h3>
                <p className="text-slate-400">Reflect on your own potential as a volunteer in your community.</p>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    Why do people volunteer?
                  </label>
                  <textarea 
                    name="whyVolunteer"
                    value={formData.whyVolunteer}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    What skills do you have that would be helpful to a community organization? List as many as you can think of:
                  </label>
                  <textarea 
                    name="volunteerSkills"
                    value={formData.volunteerSkills}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    What kind of volunteer experience do you have?
                  </label>
                  <textarea 
                    name="volunteerExperience"
                    value={formData.volunteerExperience}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    If you had to volunteer in your community, what would you like to spend your time doing?
                  </label>
                  <textarea 
                    name="idealVolunteer"
                    value={formData.idealVolunteer}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    Why would a young person want to include some volunteer experience on their resume?
                  </label>
                  <textarea 
                    name="volunteerResume"
                    value={formData.volunteerResume}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  />
                </div>

                <div className="space-y-3 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-pink-300/80 group-focus-within:text-pink-400 transition-colors">
                    Based on the articles, do you think youth should be required to do some sort of volunteer work during their high school years? Explain.
                  </label>
                  <textarea 
                    name="mandatoryVolunteer"
                    value={formData.mandatoryVolunteer}
                    onChange={handleFormChange}
                    className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'resume-builder':
        return <ResumeBuilder />;

      case 'cover-letter-builder':
        return <CoverLetterBuilder />;

      case 'portfolio':
        return <CareerPlanning />;

      case 'resourceful-people':
        return <ResourcefulPeople />;

      case 'master-plan':
        return <MasterPlan />;
      
      case 'reflection':
        return (
          <div className="space-y-8 max-w-3xl">
            <div className="mb-10">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2 tracking-tight">
                Final Reflection Questions
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"></div>
              <p className="text-slate-400 text-lg font-medium">Complete the following questions based on your learning, experiences, and thoughts throughout this module.</p>
            </div>

            <div className="space-y-10 bg-slate-800/30 p-8 sm:p-10 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none"></div>
              
              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  Do you believe that what you love can be what you do? Explain.
                </label>
                <textarea 
                  name="loveWhatYouDo"
                  value={formData.loveWhatYouDo}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[120px] text-base resize-y hover:border-slate-600"
                  placeholder="Your thoughts..."
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  What are some of the major influences in your life right now that affect your career decision making process?
                </label>
                <textarea 
                  name="influences"
                  value={formData.influences}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="E.g., Family, friends, interests, location, finances..."
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  Once you have a job, what do you feel are the most important skills, attitudes, and behaviors necessary in order to keep your job?
                </label>
                <textarea 
                  name="jobSkills"
                  value={formData.jobSkills}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="E.g., Punctuality, communication, positive attitude..."
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  What do you feel would be the personal benefits of having a portfolio, both now and in the future?
                </label>
                <textarea 
                  name="portfolioBenefits"
                  value={formData.portfolioBenefits}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="Why is it useful to document your achievements?"
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  What kind of adjustments would you make to your portfolio when applying to completely different types of jobs?
                </label>
                <textarea 
                  name="portfolioAdjustments"
                  value={formData.portfolioAdjustments}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="How do you tailor it to the audience?"
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  What do you think is the purpose of having you do a mission statement as part of your portfolio?
                </label>
                <textarea 
                  name="missionPurpose"
                  value={formData.missionPurpose}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="Think about your personal goals and values..."
                />
              </div>

              <div className="space-y-3 group relative z-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 group-focus-within:text-pink-400 transition-colors">
                  Explain the importance of ongoing self-assessment and self-appraisal
                </label>
                <textarea 
                  name="selfAssessment"
                  value={formData.selfAssessment}
                  onChange={handleFormChange}
                  className="w-full bg-[#0f172a]/80 border border-slate-700/50 rounded-xl p-5 text-slate-100 placeholder:text-slate-600 focus:bg-[#0f172a] focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 shadow-inner transition-all min-h-[150px] text-base resize-y hover:border-slate-600"
                  placeholder="Why is it important to reflect on your progress?"
                />
              </div>

            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <div className="w-20 h-20 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-center text-slate-400 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <activeUnit.icon size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{activeUnit.title}</h2>
            <p className="text-slate-400 max-w-md text-lg">
              This unit is wired up and ready for content. You can navigate to it using the sidebar.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden relative selection:bg-purple-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: letter portrait; margin: 0.6in; }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #root {
            min-height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page {
            display: grid;
            gap: 16px;
            font-family: "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif;
          }
          .print-hero {
            border: 1px solid #cbd5e1;
            border-radius: 24px;
            padding: 24px;
            background: linear-gradient(135deg, #fff1f7 0%, #fff 42%, #f8fafc 100%);
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-top: 6px;
          }
          .print-card {
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 18px;
            background: #ffffff;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          }
          .print-heading {
            color: #0f172a !important;
            letter-spacing: -0.04em;
          }
          .print-muted {
            color: #475569 !important;
          }
          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .print-stat {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          }
          .print-stat-label {
            margin: 0 0 4px;
            color: #e11d48 !important;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          .print-stat-value {
            margin: 0;
            color: #0f172a !important;
            font-size: 1.02rem;
            font-weight: 800;
          }
          .print-list {
            display: grid;
            gap: 10px;
          }
          .print-list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            background: #f8fafc;
          }
          .print-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            background: #fce7f3;
            color: #be185d !important;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }
          .print-field {
            display: grid;
            gap: 0.4rem;
          }
          .print-label {
            color: #be185d !important;
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }
          .print-value {
            color: #0f172a !important;
            white-space: pre-wrap;
            line-height: 1.6;
          }
        }
      `}} />
      
      {/* Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Sidebar --- */}
      <aside 
        className={`${isSidebarOpen ? 'w-72 xl:w-80 overflow-visible' : 'w-0 overflow-hidden'} transition-all duration-300 ease-in-out relative flex flex-col border-r border-slate-700/50 bg-slate-900/60 backdrop-blur-2xl z-20 shrink-0 min-w-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}
      >
        <div className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Sidebar Header */}
          <div className="p-8 border-b border-slate-700/50 bg-slate-900/40">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Module 4</h1>
            <p className="text-sm text-pink-400 font-bold uppercase tracking-wider mt-2">Career & Portfolio</p>
          </div>

          {/* Sidebar Navigation */}
          <div className="p-4 space-y-2">
            {MODULE_UNITS.map((unit, index) => {
              const isActive = activeUnitId === unit.id;
              const isCompleted = completedUnits.includes(unit.id);
              const Icon = unit.icon;

              return (
                <button
                  key={unit.id}
                  onClick={() => setActiveUnitId(unit.id)}
                  className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-300 text-left group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-purple-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>}
                  
                  <div className={`mr-4 p-2 rounded-lg transition-all duration-300 shadow-sm ${isActive ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/20' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'}`}>
                    <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                  </div>
                  <span className={`flex-1 text-sm font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                    {unit.title}
                  </span>
                  
                  {/* Status Indicator */}
                  <div className="ml-2 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapse Toggle Button (Floating) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-8 bg-slate-800 border border-slate-600 text-slate-300 hover:text-white rounded-full p-1.5 z-30 shadow-xl hover:bg-slate-700 hover:scale-110 transition-all"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        
        {/* Top Header */}
        <header className="h-20 border-b border-slate-700/50 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-400 hover:text-white mr-2 bg-slate-800/50 p-2 rounded-lg hover:bg-slate-700 transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            
            {/* Progress indicator */}
            <div className="flex items-center gap-4 bg-[#0f172a]/80 px-4 py-2.5 rounded-2xl border border-slate-700/50 shadow-inner">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Progress</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-700 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{progressPercentage}%</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 shadow-lg bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white border border-pink-400/30 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(236,72,153,0.45)]"
            >
              <Printer size={18} className={isSaving ? 'animate-pulse' : ''} />
              {isSaving ? 'GENERATING...' : 'GENERATE REPORT'}
            </button>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-transparent">
                <User size={18} className="text-pink-100" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className={isWideUnit ? 'w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8' : 'max-w-5xl mx-auto px-8 sm:px-12 py-12'}>
            
            {/* Active Content Rendering */}
            <div className="min-h-[60vh] relative z-10">
              {renderContent()}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-20 pt-8 border-t border-slate-700/50 flex items-center justify-between relative z-10 pb-12">
              <button
                onClick={handlePrev}
                disabled={activeUnitIndex === 0}
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold tracking-wide text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all duration-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:cursor-not-allowed group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                PREVIOUS
              </button>
              
              <button
                onClick={handleNext}
                disabled={activeUnitIndex === MODULE_UNITS.length - 1}
                className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
              >
                {activeUnitIndex === MODULE_UNITS.length - 2 ? 'FINISH MODULE' : 'NEXT UNIT'}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </main>

      <div className="hidden print-only">
        <div className="print-page">
          <section className="print-hero print-section">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-pink-700">
                  CALM Module 4 Report
                </div>
                <h1 className="print-heading mt-4 text-4xl font-black">
                  Career, Portfolio, Resume, and Letter Responses
                </h1>
                <p className="print-muted mt-3 max-w-3xl text-sm leading-7">
                  Print-ready answers from every completed response field in this module.
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-pink-200 bg-white px-4 py-3 shadow-sm">
                <p className="print-stat-label">Generated</p>
                <p className="print-stat-value">{reportDate}</p>
              </div>
            </div>
          </section>

          <section className="print-section print-card">
            <div className="mb-4">
              <p className="print-stat-label">Responses</p>
              <h2 className="print-heading text-2xl font-black">Filled Answers ({allReportEntries.length})</h2>
            </div>
            <div className="grid gap-4">
              {allReportEntries.length === 0 ? (
                <div className="print-field">
                  <div className="print-label">No responses found</div>
                  <div className="print-value">Complete at least one question in the module before generating the report.</div>
                </div>
              ) : (
                allReportEntries.map((entry) => (
                  <div className="print-field" key={entry.label}>
                    <div className="print-label">{entry.label}</div>
                    <div className="print-value">{entry.value}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<App />);
}
