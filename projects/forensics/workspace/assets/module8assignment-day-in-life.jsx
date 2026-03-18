import React, { useEffect, useState } from "react";

export const roles = [
  {
    id: "fingerprints",
    title: "Fingerprint Examiner",
    summary: "Compares latent prints, ridge detail, and known print cards.",
    what: "Examines print lifts, marks ridge characteristics, and compares suspects to evidence samples.",
    where: "Usually works at a comparison bench with print scans and reference records.",
    pace: "Slow, exact, and detail-heavy.",
    tools: "Print lifts, ridge maps, reference files, and magnification tools.",
  },
  {
    id: "trace",
    title: "Trace Evidence Analyst",
    summary: "Studies hair, fibers, paint, and glass under a microscope.",
    what: "Uses microscopes and reference collections to compare tiny evidence samples from scenes.",
    where: "Works mostly in a lab between microscope work and report writing.",
    pace: "Measured and methodical.",
    tools: "Microscopes, comparison charts, and reference collections.",
  },
  {
    id: "csi",
    title: "Crime Scene Investigator",
    summary: "Documents and collects evidence from a scene.",
    what: "Photographs the scene, marks evidence, and protects chain of custody for later analysis.",
    where: "Splits time between the field, evidence intake, and follow-up notes.",
    pace: "Fast and responsive.",
    tools: "Camera, evidence markers, gloves, and chain-of-custody forms.",
  },
  {
    id: "analyst",
    title: "Forensic Lab Analyst",
    summary: "Processes samples and writes formal lab reports.",
    what: "Prepares samples, runs instruments, records results, and writes findings.",
    where: "Spends most of the day in a controlled lab environment.",
    pace: "Careful and repetitive.",
    tools: "Lab instruments, sample prep materials, and documentation systems.",
  },
];

export default function Module8DayInLifePicker({ onStateChange, initialState }) {
  const [activeRole, setActiveRole] = useState(() => {
    const initialRoleId = initialState?.activeRole?.id || initialState?.activeRoleId;
    if (!initialRoleId) {
      return roles[0];
    }
    return roles.find((role) => role.id === initialRoleId) || roles[0];
  });
  const [hasSelected, setHasSelected] = useState(
    Boolean(initialState?.hasSelected || initialState?.complete || initialState?.activeRole?.id)
  );

  useEffect(() => {
    onStateChange?.({
      complete: hasSelected,
      activeRole,
      activeRoleId: activeRole.id,
      hasSelected
    });
  }, [activeRole, hasSelected, onStateChange]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-rose-300">Module 8</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Day-in-the-Life Path Picker</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Choose a role to reveal what the job does, where the work happens, and what pace it usually has.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-black tracking-tight">Pick a role</h2>
            <div className="mt-5 grid gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`rounded-2xl border p-4 text-left transition ${
                    activeRole.id === role.id ? "border-rose-400 bg-rose-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => {
                    setActiveRole(role);
                    setHasSelected(true);
                  }}
                >
                  <div className="text-sm font-semibold">{role.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{role.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-rose-300">Reveal</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{activeRole.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{activeRole.summary}</p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">What the job does</div>
                <div className="mt-2 text-sm leading-7 text-slate-200">{activeRole.what}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Where the work happens</div>
                <div className="mt-2 text-sm leading-7 text-slate-200">{activeRole.where}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Typical pace</div>
                <div className="mt-2 text-sm leading-7 text-slate-200">{activeRole.pace}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Common tools</div>
                <div className="mt-2 text-sm leading-7 text-slate-200">{activeRole.tools}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
