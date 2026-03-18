import React, { useMemo, useState } from "react";

const careers = [
  {
    id: "fingerprints",
    name: "Fingerprint Examiner",
    summary: "Compares latent prints, ridge detail, and known print cards.",
    day: "Examines print lifts, marks ridge characteristics, and compares suspects to evidence samples.",
    fit: "Strong fit if you enjoy visual detail, pattern matching, and careful comparison work.",
  },
  {
    id: "trace",
    name: "Trace Evidence Analyst",
    summary: "Studies hair, fibers, paint, glass, and other microscopic transfer evidence.",
    day: "Uses microscopes and reference collections to compare tiny evidence samples from scenes.",
    fit: "Strong fit if you like microscopic detail and connecting small clues to a bigger story.",
  },
  {
    id: "csi",
    name: "Crime Scene Investigator",
    summary: "Collects, documents, and preserves physical evidence from a scene.",
    day: "Photographs the scene, marks evidence, and protects chain of custody for later analysis.",
    fit: "Strong fit if you like active environments, observation, and organized scene work.",
  },
  {
    id: "analyst",
    name: "Forensic Lab Analyst",
    summary: "Processes samples and writes formal lab reports for court.",
    day: "Prepares samples, runs instruments, records results, and writes findings.",
    fit: "Strong fit if you like precision, patience, and methodical work.",
  },
  {
    id: "digital",
    name: "Digital Forensics Analyst",
    summary: "Searches devices and digital records for hidden timelines and metadata.",
    day: "Recovers files, examines phones and computers, and builds timelines from digital traces.",
    fit: "Strong fit if you like technology, patterns, and solving technical puzzles.",
  },
];

const questions = [
  {
    prompt: "Where would you rather spend most of your time?",
    helper: "Choose the setting that sounds most natural to you.",
    options: [
      { label: "At a crime scene with evidence markers.", weights: { csi: 4, fingerprints: 1 } },
      { label: "At a comparison bench studying prints or fibers.", weights: { fingerprints: 4, trace: 4, analyst: 1 } },
      { label: "In a controlled lab with samples and instruments.", weights: { analyst: 4, trace: 2 } },
      { label: "At a workstation pulling data from phones and logs.", weights: { digital: 4, csi: 1 } },
    ],
  },
  {
    prompt: "Which evidence sounds most interesting?",
    helper: "Pick the evidence type you would be most curious to examine.",
    options: [
      { label: "Fingerprints and scene photos.", weights: { fingerprints: 4, csi: 2 } },
      { label: "Hair, fibers, paint chips, and glass.", weights: { trace: 4, analyst: 2 } },
      { label: "DNA, blood, and biological samples.", weights: { analyst: 3, trace: 1 } },
      { label: "Phones, emails, and browser history.", weights: { digital: 4 } },
    ],
  },
  {
    prompt: "What pace feels most satisfying?",
    helper: "Think about the kind of day you would enjoy most.",
    options: [
      { label: "Fast-moving and unpredictable.", weights: { csi: 4, digital: 1 } },
      { label: "Slow, exact comparison work.", weights: { fingerprints: 4, trace: 4 } },
      { label: "Methodical lab work.", weights: { analyst: 4, trace: 2 } },
      { label: "Discussion and interpretation.", weights: { digital: 1, csi: 1 } },
    ],
  },
  {
    prompt: "What part of the work sounds most rewarding?",
    helper: "Choose the result you would be proudest to produce.",
    options: [
      { label: "Finding and documenting evidence others missed.", weights: { csi: 4 } },
      { label: "Matching prints or microscopic fibers.", weights: { fingerprints: 4, trace: 4 } },
      { label: "Producing a careful lab result.", weights: { analyst: 4 } },
      { label: "Building a digital timeline.", weights: { digital: 4 } },
    ],
  },
  {
    prompt: "Which skill do you want to use every day?",
    helper: "Pick the skill that sounds most like you.",
    options: [
      { label: "Scene organization and evidence handling.", weights: { csi: 4, fingerprints: 1 } },
      { label: "Fingerprint comparison and trace sampling.", weights: { fingerprints: 4, trace: 4 } },
      { label: "Lab precision and instrument work.", weights: { analyst: 4 } },
      { label: "Technology troubleshooting and data analysis.", weights: { digital: 4 } },
    ],
  },
];

export default function Module8CareerMatcher() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(Array.from({ length: questions.length }, () => null));

  const ranked = useMemo(() => {
    const scores = Object.fromEntries(careers.map((career) => [career.id, 0]));
    selected.forEach((choiceIndex, questionIndex) => {
      if (choiceIndex === null) return;
      const weights = questions[questionIndex].options[choiceIndex].weights;
      Object.entries(weights).forEach(([careerId, value]) => {
        scores[careerId] = (scores[careerId] || 0) + value;
      });
    });
    return careers
      .map((career) => ({ ...career, score: scores[career.id] || 0 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }, [selected]);

  const progress = Math.round((selected.filter(Boolean).length / questions.length) * 100);
  const question = questions[step];
  const top = ranked[0];

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-rose-300">Module 8</div>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Career Path Simulation</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Answer five short scenarios and see which forensic career fits you best.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
              {progress}% complete
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Question {step + 1} of {questions.length}
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight">{question.prompt}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">{question.helper}</p>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-200"
                onClick={() => {
                  setStep(0);
                  setSelected(Array.from({ length: questions.length }, () => null));
                }}
              >
                Restart
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {question.options.map((option, index) => {
                const active = selected[step] === index;
                return (
                  <button
                    key={option.label}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active ? "border-rose-400 bg-rose-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => {
                      const next = [...selected];
                      next[step] = index;
                      setSelected(next);
                    }}
                  >
                    <div className="text-sm font-semibold leading-6">{option.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                disabled={step === 0}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                Back
              </button>
              <button
                className="rounded-xl border border-rose-500/70 bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                disabled={selected[step] === null}
                onClick={() => setStep((value) => Math.min(questions.length - 1, value + 1))}
              >
                {step === questions.length - 1 ? "See result" : "Continue"}
              </button>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight">Career scoreboard</h3>
            <div className="mt-4 grid gap-3">
              {ranked.map((career, index) => (
                <div key={career.id} className={`rounded-2xl border p-4 ${index === 0 ? "border-rose-400/60 bg-rose-500/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{career.name}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">{career.score} pts</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.max(8, career.score * 12)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Top match</div>
              <div className="mt-2 text-lg font-black">{top.name}</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{top.summary}</p>
            </div>
          </aside>
        </section>

        {selected.every((value) => value !== null) && (
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-rose-300">Result</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{top.name}</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{top.fit}</p>
          </section>
        )}
      </div>
    </div>
  );
}
