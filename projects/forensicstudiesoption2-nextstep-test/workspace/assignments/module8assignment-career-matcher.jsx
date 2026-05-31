import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Fingerprint,
  Microscope
} from 'lucide-react';

export const careers = [
  {
    id: 'fingerprints',
    name: 'Latent Print Examiner',
    summary: 'Compares latent prints, ridge detail, and known print cards.',
    fit: 'High visual acuity, pattern recognition, and extreme patience for comparative analysis.',
    icon: <Fingerprint className="w-5 h-5" />,
    color: 'bg-indigo-500',
    text: 'text-indigo-200',
    bgLight: 'bg-indigo-500/10',
    border: 'border-indigo-400/30'
  },
  {
    id: 'trace',
    name: 'Trace Evidence Analyst',
    summary: 'Studies hair, fibers, paint, glass, and other microscopic transfer evidence.',
    fit: 'Detail-oriented, scientific mindset, capable of connecting microscopic anomalies to a macro event.',
    icon: <Microscope className="w-5 h-5" />,
    color: 'bg-emerald-500',
    text: 'text-emerald-200',
    bgLight: 'bg-emerald-500/10',
    border: 'border-emerald-400/30'
  },
  {
    id: 'csi',
    name: 'Crime Scene Investigator',
    summary: 'Collects, documents, and preserves physical evidence from a scene.',
    fit: 'Strong situational awareness, operational stamina, and strict adherence to protocol.',
    icon: <Camera className="w-5 h-5" />,
    color: 'bg-amber-500',
    text: 'text-amber-200',
    bgLight: 'bg-amber-500/10',
    border: 'border-amber-400/30'
  },
  {
    id: 'analyst',
    name: 'Bio-Forensic Analyst',
    summary: 'Processes biological samples and writes formal lab reports for court.',
    fit: 'High precision, methodological rigor, and ability to operate in sterile environments.',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-rose-500',
    text: 'text-rose-200',
    bgLight: 'bg-rose-500/10',
    border: 'border-rose-400/30'
  },
  {
    id: 'digital',
    name: 'Digital Forensics Analyst',
    summary: 'Searches devices and digital records for hidden timelines and metadata.',
    fit: 'Technical fluency, logical deduction, and ability to reverse-engineer digital behavior.',
    icon: <Cpu className="w-5 h-5" />,
    color: 'bg-orange-500',
    text: 'text-orange-200',
    bgLight: 'bg-orange-500/10',
    border: 'border-orange-400/30'
  }
];

export const scenarioQuestions = [
  {
    phase: 'Deployment',
    prompt: 'You arrive at a compromised secure facility. The alarm is still blaring and the scene is chaotic. What is your immediate priority?',
    helper: 'Select your initial operational instinct.',
    options: [
      { label: 'Establish a physical perimeter and systematically document the point of entry.', weights: { csi: 4, fingerprints: 1 } },
      { label: 'Plug into the network mainframe to isolate the security system breach.', weights: { digital: 4 } },
      { label: 'Examine the shattered glass at the entryway for microscopic clothing snags.', weights: { trace: 4, analyst: 1 } },
      { label: "Look for bodily fluids or biologicals left behind in the suspect's rush.", weights: { analyst: 4, csi: 1 } }
    ]
  },
  {
    phase: 'Discovery',
    prompt: 'You access the breached vault. Several types of evidence are present. Which asset do you secure first?',
    helper: 'Determine the most critical piece of evidence.',
    options: [
      { label: 'Dust the exposed keypad and vault handle for latent prints before they smudge.', weights: { fingerprints: 4, csi: 1 } },
      { label: 'Collect a dropped, encrypted USB drive and a burner phone.', weights: { digital: 4 } },
      { label: "Collect a torn piece of fabric caught on the vault's locking mechanism.", weights: { trace: 4, analyst: 1 } },
      { label: 'Carefully swab a drop of blood found near the vault door.', weights: { analyst: 4, csi: 1 } }
    ]
  },
  {
    phase: 'Processing',
    prompt: 'Back at headquarters, the collected evidence requires processing. Which task do you claim?',
    helper: 'Choose your preferred operational environment.',
    options: [
      { label: 'Spend hours meticulously running biological swabs through a DNA sequencer.', weights: { analyst: 4, trace: 1 } },
      { label: 'Decompile the malware found on the USB drive to trace its origin.', weights: { digital: 4 } },
      { label: 'Compare the lifted prints against the national AFIS database.', weights: { fingerprints: 4 } },
      { label: 'Catalog the physical evidence, meticulously maintaining the chain of custody.', weights: { csi: 4 } }
    ]
  },
  {
    phase: 'Breakthrough',
    prompt: 'The investigation stalls. Where do you look to find the missing link that cracks the case?',
    helper: 'Identify your preferred method of problem-solving.',
    options: [
      { label: "Finding a micro-fiber match that links the suspect's jacket to the vault.", weights: { trace: 4 } },
      { label: 'Reconstructing a deleted email thread that proves premeditation.', weights: { digital: 4 } },
      { label: 'Getting a 12-point minutiae match on a partial, smudged thumbprint.', weights: { fingerprints: 4 } },
      { label: 'Piecing together the timeline using scene photos and physical access logs.', weights: { csi: 4, digital: 1 } }
    ]
  },
  {
    phase: 'Prosecution',
    prompt: 'The case goes to court. What is your role in securing the conviction?',
    helper: 'Select how you want to present your findings.',
    options: [
      { label: "Presenting flawless scene documentation that proves the suspect's presence.", weights: { csi: 4 } },
      { label: 'Testifying on the exact chemical composition of the transfer evidence.', weights: { trace: 4, analyst: 2 } },
      { label: "Explaining the indisputable biometric match of the suspect's fingerprint.", weights: { fingerprints: 4 } },
      { label: "Walking the jury through the suspect's digital footprint and GPS data.", weights: { digital: 4 } }
    ]
  }
];

export function getCareerRankings(selected) {
  const scores = Object.fromEntries(careers.map((career) => [career.id, 0]));

  selected.forEach((choiceIndex, questionIndex) => {
    if (choiceIndex === null || choiceIndex === undefined) {
      return;
    }
    const weights = scenarioQuestions[questionIndex].options[choiceIndex].weights;
    Object.entries(weights).forEach(([careerId, value]) => {
      scores[careerId] = (scores[careerId] || 0) + value;
    });
  });

  return careers
    .map((career) => ({ ...career, score: scores[career.id] || 0 }))
    .sort((a, b) => b.score - a.score);
}

export default function Module8CareerMatcher({ onStateChange, initialState }) {
  const [systemState, setSystemState] = useState(() => {
    const next = initialState?.systemState;
    if (next === 'results' || next === 'active') {
      return next;
    }
    return 'active';
  });
  const [step, setStep] = useState(() => {
    const next = Number.isInteger(initialState?.step) ? initialState.step : 0;
    return Math.max(0, Math.min(scenarioQuestions.length - 1, next));
  });
  const [selected, setSelected] = useState(() => {
    if (Array.isArray(initialState?.selected) && initialState.selected.length === scenarioQuestions.length) {
      return initialState.selected.map((value) => {
        if (Number.isInteger(value) && value >= 0) {
          return value;
        }
        return null;
      });
    }
    return Array.from({ length: scenarioQuestions.length }, () => null);
  });

  const ranked = useMemo(() => getCareerRankings(selected), [selected]);
  const answeredCount = selected.filter((value) => value !== null).length;
  const topMatch = answeredCount ? ranked[0] : null;
  const question = scenarioQuestions[step];

  useEffect(() => {
    onStateChange?.({
      complete: systemState === 'results',
      systemState,
      step,
      selected,
      ranked,
      topMatch
    });
  }, [onStateChange, ranked, selected, step, systemState, topMatch]);

  function handleNext() {
    if (step === scenarioQuestions.length - 1) {
      setSystemState('analyzing');
      window.setTimeout(() => {
        setSystemState('results');
      }, 2000);
      return;
    }

    setStep((current) => current + 1);
  }

  function resetAssessment() {
    setSystemState('active');
    setStep(0);
    setSelected(Array.from({ length: scenarioQuestions.length }, () => null));
  }

  if (systemState === 'analyzing') {
    return (
      <div className="h-[620px] rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="flex h-full flex-col items-center justify-center text-rose-300">
          <Activity className="mb-6 h-12 w-12 animate-spin-slow text-rose-400" />
          <div className="text-lg font-bold text-slate-100">Analyzing Responses</div>
          <div className="mt-2 text-sm text-slate-400">Calculating career alignment...</div>
          <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-rose-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (systemState === 'results' && topMatch) {
    return (
      <div className="space-y-6">
        <div className={`relative overflow-hidden rounded-[2rem] border bg-slate-950/80 p-8 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-10 ${topMatch.bgLight} ${topMatch.border}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.16),transparent_30%)]"></div>
          <div className="relative">
            <div className="mb-8 flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${topMatch.color}`}>{topMatch.icon}</div>
              <div>
                <div className={`mb-1 text-xs font-bold uppercase tracking-widest ${topMatch.text}`}>Primary Career Match</div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-white">{topMatch.name}</h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-sm">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Psychological Fit</div>
                <p className="text-sm leading-relaxed text-slate-200">{topMatch.fit}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-sm">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Operational Summary</div>
                <p className="text-sm leading-relaxed text-slate-200">{topMatch.summary}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <h3 className="mb-6 text-sm font-bold text-slate-100">Complete Alignment Breakdown</h3>
          <div className="space-y-5">
            {ranked.map((career, index) => (
              <div key={career.id}>
                <div className="mb-2 flex justify-between text-sm font-medium text-slate-300">
                  <span className={index === 0 ? 'font-bold text-white' : ''}>{career.name}</span>
                  <span className="text-xs text-slate-400">{career.score} PTS</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${index === 0 ? 'bg-rose-500' : 'bg-slate-500/70'}`} style={{ width: `${Math.min(100, Math.max(5, career.score * 15))}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetAssessment}
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 shadow-sm transition-colors hover:bg-white/10"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="h-1.5 w-full bg-white/10">
        <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${((step + 1) / scenarioQuestions.length) * 100}%` }}></div>
      </div>

      <div className="border-b border-white/10 p-8 md:p-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-300">
          <span>Phase {step + 1} of {scenarioQuestions.length}</span>
          <span className="text-slate-500">/</span>
          <span>{question.phase}</span>
        </div>
        <h2 className="font-display text-2xl font-bold leading-snug text-white">{question.prompt}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{question.helper}</p>
      </div>

      <div className="space-y-3 bg-slate-950/40 p-8 md:p-10">
        {question.options.map((option, index) => {
          const isActive = selected[step] === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                const nextSelected = [...selected];
                nextSelected[step] = index;
                setSelected(nextSelected);
              }}
              className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                isActive ? 'border-rose-400/60 bg-rose-500/10 ring-1 ring-rose-500/60 shadow-sm' : 'border-white/10 bg-white/5 hover:border-rose-300/50 hover:bg-white/10'
              }`}
            >
              <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${isActive ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/30 text-transparent'}`}>
                <CheckCircle2 size={14} />
              </div>
              <div className={`text-sm leading-relaxed ${isActive ? 'font-medium text-rose-100' : 'text-slate-200'}`}>{option.label}</div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/80 p-6">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
          className="px-6 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:text-white disabled:opacity-0"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selected[step] === null}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-500 disabled:opacity-50"
        >
          {step === scenarioQuestions.length - 1 ? 'View Results' : 'Continue'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
