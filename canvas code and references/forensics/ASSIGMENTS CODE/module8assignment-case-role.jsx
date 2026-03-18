import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, MapPin, Search, Beaker, Fingerprint, 
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, 
  ChevronRight, Activity, Camera, Lock, Database,
  Crosshair, FileText
} from "lucide-react";

// The chronological pipeline of the case
const casePhases = [
  {
    id: "scene",
    department: "Field Operations",
    role: "Evidence Lead / CSI",
    title: "Scene Processing: Burned Van",
    directive: "Locate the primary transfer evidence and secure it without compromising biologicals.",
    visual: "map",
    choices: [
      {
        text: "Photograph in place, then secure in an airtight plastic evidence bag.",
        isCorrect: false,
        feedback: "CRITICAL ERROR: Plastic traps moisture. If there is saliva on that bandana, mold will grow and destroy the DNA before it reaches the lab."
      },
      {
        text: "Photograph in place, then secure in a breathable paper evidence bag.",
        isCorrect: true,
        feedback: "LOG UPDATED: Perfect. Paper prevents moisture buildup, protecting biological evidence (DNA) while maintaining the chain of custody."
      },
      {
        text: "Pick it up to check for hairs, then place it in a paper bag.",
        isCorrect: false,
        feedback: "PROCEDURE VIOLATION: Never examine evidence in the field if it can be avoided. You risk losing microscopic trace evidence to the wind."
      }
    ]
  },
  {
    id: "trace",
    department: "Trace Evidence Unit",
    role: "Trace Analyst",
    title: "Microscopic Extraction",
    directive: "The paper bag has arrived at the lab. Extract trace materials from the bandana.",
    visual: "microscope",
    choices: [
      {
        text: "Vigorously shake the bandana over a sterile examination table.",
        isCorrect: false,
        feedback: "CONTAMINATION RISK: Shaking evidence sends microscopic fibers airborne, potentially losing them or contaminating other open cases in the lab."
      },
      {
        text: "Use a specialized vacuum with a filter trap to pull debris from the fabric.",
        isCorrect: false,
        feedback: "METHODOLOGY ERROR: Vacuums pull *everything* including deep dirt. We need surface transfers (hairs/fibers). Too messy for this item."
      },
      {
        text: "Perform a methodical tape lift across the surface of the fabric.",
        isCorrect: true,
        feedback: "LOG UPDATED: Correct. Tape lifting gently removes superficial hairs and fibers (cross-transfers) without destroying the base material."
      }
    ]
  },
  {
    id: "dna",
    department: "Bio-Forensics",
    role: "Lab Analyst",
    title: "Biological Processing",
    directive: "A suspected saliva stain was found on the bandana. Process for identification.",
    visual: "sequencer",
    choices: [
      {
        text: "Process the swab using PCR (Polymerase Chain Reaction) to amplify the DNA.",
        isCorrect: true,
        feedback: "LOG UPDATED: Excellent. PCR takes a tiny, degraded sample of DNA and copies it millions of times so we can generate a full profile."
      },
      {
        text: "Run the bandana through a chemical fuming chamber to reveal biologicals.",
        isCorrect: false,
        feedback: "ROLE CONFLICT: Chemical fuming (Cyanoacrylate) is used for latent fingerprints, not DNA. This could damage the biological sample."
      },
      {
        text: "Check the blood type of the saliva stain.",
        isCorrect: false,
        feedback: "OUTDATED PROTOCOL: While ABO blood typing is possible, modern forensic labs go straight to DNA profiling for definitive identification."
      }
    ]
  },
  {
    id: "prints",
    department: "Latent Analysis",
    role: "Fingerprint Examiner",
    title: "AFIS Database Run",
    directive: "CSIs lifted a partial print from the van's exterior door handle. Analyze it.",
    visual: "afis",
    choices: [
      {
        text: "Run the partial print blindly into the AFIS database and accept the first match.",
        isCorrect: false,
        feedback: "CRITICAL ERROR: AFIS provides *candidates*, not definitive matches. A human examiner must always verify the minutiae."
      },
      {
        text: "Apply the ACE-V method (Analyze, Compare, Evaluate, Verify) against AFIS candidates.",
        isCorrect: true,
        feedback: "LOG UPDATED: Correct. You mark the ridge endings/bifurcations, compare against the database, and have a peer verify your exact match."
      },
      {
        text: "Dust the lift card again with magnetic powder to make it darker.",
        isCorrect: false,
        feedback: "DESTRUCTIVE ACTION: You never alter a completed lift card. You enhance it digitally using high-resolution scanning and contrast adjustments."
      }
    ]
  }
];

export default function LIMSOS_Simulation() {
  const [systemState, setSystemState] = useState("booting"); // booting, active, summary
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const terminalEndRef = useRef(null);
  const activePhase = casePhases[currentPhaseIndex];

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (systemState === "booting") {
      addLog("Initializing LIMS Kernel v9.4...", "sys");
      setTimeout(() => addLog("Establishing secure connection to Evidence DB...", "sys"), 800);
      setTimeout(() => addLog("Loading Active Case File: X-892-B [ROBBERY/ARSON]", "warn"), 1600);
      setTimeout(() => setSystemState("active"), 2500);
    }
  }, [systemState]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text, type = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time: timestamp, text, type }]);
  };

  const handleChoice = (index) => {
    setSelectedChoiceIndex(index);
    const choice = activePhase.choices[index];
    
    if (choice.isCorrect) {
      addLog(`[ACTION SUBMITTED] ${choice.text}`, "info");
      addLog(choice.feedback, "success");
    } else {
      addLog(`[ACTION SUBMITTED] ${choice.text}`, "info");
      addLog(choice.feedback, "error");
      setMistakes(m => m + 1);
    }
  };

  const advancePhase = () => {
    setIsTransferring(true);
    addLog(`Transferring evidence to next department...`, "sys");
    
    setTimeout(() => {
      setSelectedChoiceIndex(null);
      setIsTransferring(false);
      
      if (currentPhaseIndex < casePhases.length - 1) {
        setCurrentPhaseIndex(i => i + 1);
        addLog(`Chain of Custody updated. Evidence received by ${casePhases[currentPhaseIndex + 1].department}.`, "warn");
      } else {
        setSystemState("summary");
        addLog("CASE CLOSED. Final report generated.", "success");
      }
    }, 1500);
  };

  // ----------------------------------------------------------------------
  // RENDER BLOCKS
  // ----------------------------------------------------------------------

  if (systemState === "booting") {
    return (
      <div className="min-h-screen bg-black text-emerald-500 font-mono p-10 flex flex-col justify-end">
        <div className="space-y-2 opacity-80">
          {logs.map((log, i) => (
            <div key={i}>{`[${log.time}] ${log.text}`}</div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-2 md:p-4 text-slate-300 font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
      
      {/* OS Wrapper */}
      <div className="flex-1 border border-slate-800 rounded-xl bg-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Top OS Bar */}
        <div className="h-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>Secure LIMS Environment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={mistakes > 0 ? "text-rose-400" : ""}>Procedural Errors: {mistakes}</span>
            <span>{time}</span>
          </div>
        </div>

        {/* Main Interface Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: The Module / Action Area */}
          <div className="flex-1 flex flex-col relative bg-slate-900/50">
            {systemState === "summary" ? (
              <SummaryScreen mistakes={mistakes} reset={() => { setSystemState("booting"); setCurrentPhaseIndex(0); setLogs([]); setMistakes(0); setSelectedChoiceIndex(null); }} />
            ) : isTransferring ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <Lock className="w-12 h-12 text-slate-600 animate-pulse" />
                <div className="text-sm font-mono text-slate-400 uppercase tracking-[0.2em]">Updating Chain of Custody...</div>
              </div>
            ) : (
              <>
                {/* Department Header */}
                <div className="p-6 border-b border-white/5 bg-slate-950/30">
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    {activePhase.department} // {activePhase.role}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">{activePhase.title}</h1>
                  <p className="mt-2 text-sm text-slate-400 font-mono border-l-2 border-emerald-500/30 pl-3">
                    DIR: {activePhase.directive}
                  </p>
                </div>

                {/* Visual Area */}
                <div className="p-6 border-b border-white/5 bg-black/40 flex justify-center items-center min-h-[200px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                  <VisualModule type={activePhase.visual} />
                </div>

                {/* Interactive Matrix */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Execute Protocol:</div>
                  <div className="space-y-3">
                    {activePhase.choices.map((choice, index) => {
                      const isAnswered = selectedChoiceIndex !== null;
                      const isSelected = selectedChoiceIndex === index;
                      
                      let btnStyle = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300";
                      if (isAnswered) {
                        if (isSelected) {
                          btnStyle = choice.isCorrect 
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" 
                            : "border-rose-500/50 bg-rose-500/10 text-rose-300";
                        } else if (choice.isCorrect) {
                          btnStyle = "border-emerald-500/30 bg-emerald-500/5 text-emerald-500/50";
                        } else {
                          btnStyle = "border-white/5 bg-black/20 text-slate-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={index}
                          disabled={isAnswered}
                          onClick={() => handleChoice(index)}
                          className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-start gap-4 ${btnStyle}`}
                        >
                          <div className="mt-0.5 text-[10px] font-mono opacity-50">[{index + 1}]</div>
                          <div className="text-sm font-medium leading-relaxed flex-1">{choice.text}</div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedChoiceIndex !== null && (
                    <div className="mt-6 flex justify-end animate-in fade-in">
                      <button
                        onClick={advancePhase}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider rounded-lg transition-colors shadow-lg shadow-emerald-900/50"
                      >
                        {currentPhaseIndex === casePhases.length - 1 ? "Close Case File" : "Transfer Evidence"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Panel: Terminal / System Logs */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 flex flex-col font-mono text-[10px]">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2 text-slate-500 uppercase tracking-widest bg-slate-900/50">
              <Terminal className="w-3 h-3" /> System Logs
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth">
              {logs.map((log, i) => (
                <div key={i} className={`leading-relaxed ${
                  log.type === "error" ? "text-rose-400" : 
                  log.type === "success" ? "text-emerald-400" : 
                  log.type === "warn" ? "text-amber-400" : 
                  "text-slate-400"
                }`}>
                  <span className="opacity-50 mr-2">[{log.time}]</span>
                  {log.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function VisualModule({ type }) {
  if (type === "map") return (
    <div className="w-full max-w-sm aspect-video border border-emerald-500/20 bg-emerald-500/5 relative rounded-lg flex items-center justify-center">
      {/* Stylized Van */}
      <div className="w-48 h-20 border-2 border-slate-600 rounded-md relative flex items-center justify-center text-slate-700 font-mono text-xs font-bold uppercase tracking-widest">
        Vehicle Frame
        {/* Door Handle */}
        <div className="absolute top-1/2 left-8 w-4 h-1 bg-slate-500 rounded-full"></div>
      </div>
      {/* Bandana Hotspot */}
      <div className="absolute bottom-6 right-12 w-6 h-6 flex items-center justify-center group cursor-crosshair">
        <div className="absolute w-full h-full bg-rose-500/20 rounded-full animate-ping"></div>
        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
        <div className="absolute top-full mt-2 text-[8px] font-mono text-rose-400 bg-black/80 px-2 py-1 rounded border border-rose-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
          OBJ-01: Cloth Material
        </div>
      </div>
    </div>
  );

  if (type === "microscope") return (
    <div className="w-48 h-48 rounded-full border-4 border-slate-800 bg-slate-900 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
      <div className="absolute inset-0 border-[20px] border-black/50 rounded-full pointer-events-none z-10"></div>
      {/* Fibers */}
      <div className="w-full h-0.5 bg-rose-500/60 rotate-45 absolute shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
      <div className="w-full h-1 bg-blue-500/40 -rotate-12 absolute blur-[1px]"></div>
      <div className="w-full h-0.5 bg-emerald-400/80 rotate-90 absolute"></div>
      {/* Reticle */}
      <Crosshair className="w-full h-full text-emerald-500/20 absolute p-4 opacity-50" strokeWidth={1} />
    </div>
  );

  if (type === "sequencer") return (
    <div className="flex items-end gap-2 h-32 w-full max-w-xs border-b-2 border-emerald-500/30 pb-2">
      {[40, 70, 20, 90, 60, 30, 80, 50].map((h, i) => (
        <div key={i} className="flex-1 bg-blue-500/20 rounded-t relative overflow-hidden group hover:bg-blue-500/40 transition-colors" style={{ height: `${h}%` }}>
          <div className="absolute bottom-0 w-full bg-blue-400" style={{ height: '4px' }}></div>
          <div className="absolute top-0 w-full h-full bg-gradient-to-t from-transparent to-blue-400/30 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
        </div>
      ))}
    </div>
  );

  if (type === "afis") return (
    <div className="relative">
      <Fingerprint className="w-32 h-32 text-emerald-500/60 stroke-[1]" />
      {/* Minutiae Nodes */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full border border-rose-500 bg-rose-500/20 animate-ping"></div>
      <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full border border-rose-500 bg-rose-500/20 animate-ping" style={{ animationDelay: '500ms'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-8 h-8 border border-blue-500/50 rounded flex items-center justify-center -translate-x-1/2">
        <div className="w-full h-0.5 bg-blue-500/50"></div>
      </div>
    </div>
  );

  return <Database className="w-16 h-16 text-slate-700" />;
}

function SummaryScreen({ mistakes, reset }) {
  let grade = "EXEMPLARY";
  let gradeColor = "text-emerald-400";
  if (mistakes > 0 && mistakes <= 2) { grade = "ACCEPTABLE"; gradeColor = "text-amber-400"; }
  if (mistakes > 2) { grade = "COMPROMISED"; gradeColor = "text-rose-500"; }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
        <FileText className={`w-10 h-10 ${gradeColor}`} />
      </div>
      <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2">Final Case Report // X-892-B</h2>
      <h1 className="text-4xl font-black text-white mb-6">Investigation Concluded</h1>
      
      <div className="bg-black/30 border border-white/5 rounded-xl p-6 max-w-md w-full mb-8 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
          <span className="text-sm text-slate-400 font-mono">Chain of Custody Status:</span>
          <span className={`text-xl font-black uppercase ${gradeColor}`}>{grade}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-mono">
          <span className="text-slate-400">Procedural Errors Logged:</span>
          <span className="font-bold text-white">{mistakes}</span>
        </div>
      </div>

      <button
        onClick={reset}
        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-all"
      >
        Reboot System (Try Again)
      </button>
    </div>
  );
}