import React, { useState, useRef } from 'react';
import { 
  FileText, Download, CheckCircle2,
  Database, Microscope, Fingerprint, Lightbulb,
  ChevronRight, ChevronLeft, Camera, ShieldCheck, Menu,
  Zap, ZapOff
} from 'lucide-react';

// --- DATA & STATE ---

const INITIAL_ANSWERS = {
  q1_rflp_cells: "100,000+ cells (size of a quarter)",
  q1_rflp_time: "Weeks to Months",
  q1_pcr_cells: "50+ cells (microscopic)",
  q1_pcr_time: "Hours to Days",
  q2_vntr_str: "",
  q3_nuclear_mtdna: "",
  q4_probability: "",
  q5a_benefits: "",
  q5a_drawbacks: "",
  q5b_opinion: "",
  q6_suspect_match: "",
  q7_pcr_rflp: ""
};

const SUSPECTS = [
  { id: 1, name: "John 'Slim' Doe", age: 24, height: "5'10\"", history: "Petty theft, shoplifting. No history of violent crime.", status: "Apprehended near scene." },
  { id: 2, name: "Marcus Vance", age: 29, height: "6'1\"", history: "Armed robbery (2019), Aggravated assault (2021). Known to carry firearms.", status: "Apprehended near scene." },
  { id: 3, name: "David 'Wheels' Smith", age: 22, height: "5'8\"", history: "Grand theft auto, fleeing police. Known getaway driver.", status: "Apprehended near scene." }
];

// --- COMPONENTS ---

const TheoryLab = ({ answers, setAnswers }) => {
  const [methodScale, setMethodScale] = useState(0); 
  const handleChange = (e) => setAnswers({...answers, [e.target.name]: e.target.value});

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-in fade-in duration-700">
      {/* Q1: Methodology */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-b pb-4 tracking-tighter uppercase italic">
            <Microscope className="text-indigo-600" /> 01. DNA Analysis Methodology
          </h3>
          
          <div className="bg-slate-900 rounded-3xl p-8 text-white mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <span className={`text-lg font-black tracking-widest ${methodScale < 50 ? 'text-indigo-400' : 'text-slate-600'}`}>PCR</span>
              <input 
                type="range" min="0" max="100" value={methodScale} onChange={(e) => setMethodScale(e.target.value)}
                className="flex-grow mx-10 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className={`text-lg font-black tracking-widest ${methodScale >= 50 ? 'text-rose-500' : 'text-slate-600'}`}>RFLP</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cell Threshold</div>
                <div className="text-xl font-bold">{methodScale < 50 ? '~50 Cells' : '100,000+ Cells'}</div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Processing Time</div>
                <div className="text-xl font-bold">{methodScale < 50 ? 'Hours/Days' : 'Weeks/Months'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">
              <span>Metric</span>
              <span>RFLP Specs</span>
              <span>PCR Specs</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center text-sm font-bold text-slate-700">Cells Required</div>
              <input type="text" name="q1_rflp_cells" value={answers.q1_rflp_cells} onChange={handleChange} className="bg-slate-50 border rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
              <input type="text" name="q1_pcr_cells" value={answers.q1_pcr_cells} onChange={handleChange} className="bg-slate-50 border rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center text-sm font-bold text-slate-700">Time Required</div>
              <input type="text" name="q1_rflp_time" value={answers.q1_rflp_time} onChange={handleChange} className="bg-slate-50 border rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
              <input type="text" name="q1_pcr_time" value={answers.q1_pcr_time} onChange={handleChange} className="bg-slate-50 border rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      {/* Q2, Q3, Q4: Technical Explanations */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
        <div className="space-y-3">
          <h4 className="text-lg font-black uppercase text-slate-800 tracking-tight italic">02. VNTR & STR Sections</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Explain how these sections are used in forensic analysis and how investigators determine a match.</p>
          <textarea name="q2_vntr_str" value={answers.q2_vntr_str} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Enter explanation..."></textarea>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-black uppercase text-slate-800 tracking-tight italic">03. Nuclear DNA vs mtDNA</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Explain the main differences and give an example of when each would be used.</p>
          <textarea name="q3_nuclear_mtdna" value={answers.q3_nuclear_mtdna} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Enter comparison..."></textarea>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-black uppercase text-slate-800 tracking-tight italic">04. Probability Ratios</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Why is it important to include a probability ratio with every DNA print match?</p>
          <textarea name="q4_probability" value={answers.q4_probability} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="Enter justification..."></textarea>
        </div>
      </div>

      {/* Q5: Data Bank Ethics */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-8">
        <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-4 uppercase">
          <Database className="text-indigo-400" /> 05. National DNA Data Bank
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Benefits to Society</label>
            <textarea name="q5a_benefits" value={answers.q5a_benefits} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-2xl p-5 h-40 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="List benefits..."></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Ethical Drawbacks</label>
            <textarea name="q5a_drawbacks" value={answers.q5a_drawbacks} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-2xl p-5 h-40 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-rose-500" placeholder="List drawbacks..."></textarea>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-black uppercase tracking-tight">Personal Stance & Justification</h4>
          <textarea name="q5b_opinion" value={answers.q5b_opinion} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-2xl p-5 h-32 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Are you in favor or against? Give at least 2 reasons."></textarea>
        </div>
      </div>
    </div>
  );
};

const CaseFile = ({ discovered, setDiscovered }) => {
  const [flashlight, setFlashlight] = useState({ x: 50, y: 50 });
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cabinLight, setCabinLight] = useState(false);
  const [log, setLog] = useState("Sifting terminal initialized. Scene is in total darkness.");
  const containerRef = useRef(null);

  const evidence = {
    bandanas: {
      label: "Marker A: Bandanas",
      x: 78,
      y: 31,
      markerX: 81,
      markerY: 24,
      markerId: "A-04",
      message: "Biological trace found. Red bandanas recovered from the open glove compartment."
    },
    gun: {
      label: "Marker B: Handgun",
      x: 43,
      y: 76,
      markerX: 47,
      markerY: 67,
      markerId: "B-07",
      message: "Weapon secured: 9mm semi-auto found on the floorboard near the center console."
    },
    cash: {
      label: "Marker C: Bank Bag",
      x: 72,
      y: 73,
      markerX: 76,
      markerY: 65,
      markerId: "C-12",
      message: "Evidence secured: canvas bank bag with dye-pack residue retrieved from the rear cargo area."
    }
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFlashlight({ x, y });
  };

  const handleScreenClick = () => {
    if (!flashlightOn) {
      setFlashlightOn(true);
      setLog("Beam activated. Searching for physical evidence in the wreckage.");
    }
  };

  const toggleCabinLight = () => {
    setCabinLight((prev) => {
      const next = !prev;
      setLog(next ? "Cabin dome light engaged. The van interior is dimly visible." : "Cabin dome light cut. Returning scene to blackout conditions.");
      return next;
    });
  };

  const toggleFlashlight = () => {
    setFlashlightOn((prev) => {
      const next = !prev;
      setLog(next ? "Flashlight online. Sweep the beam over the van to isolate evidence." : "Flashlight offline. Evidence search paused.");
      return next;
    });
  };

  const capture = (key, msg) => {
    if (!flashlightOn) return; 
    setDiscovered(prev => ({ ...prev, [key]: true }));
    setLog(`SECURED: ${msg}`);
  };

  const allFound = discovered.bandanas && discovered.gun && discovered.cash;

  const isNear = (targetX, targetY) => {
    if (!flashlightOn) return false;
    const dx = flashlight.x - targetX;
    const dy = flashlight.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 11;
  };

  const getEvidenceOpacity = (key) => {
    const target = evidence[key];
    if (discovered[key]) return 1;
    if (isNear(target.x, target.y)) return 0.98;
    if (cabinLight) return 0.2;
    return 0.02;
  };

  const getEvidenceButtonState = (key) => {
    if (discovered[key]) return "pointer-events-none";
    return isNear(evidence[key].x, evidence[key].y) ? "pointer-events-auto cursor-pointer" : "pointer-events-none";
  };

  const sceneDarkness = cabinLight ? "rgba(2, 6, 23, 0.38)" : "rgba(0, 0, 0, 0.88)";

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Case Briefing Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 px-8 py-5 text-white flex items-center gap-3">
          <FileText size={20} />
          <h3 className="font-black italic tracking-tighter uppercase text-lg">Case Study: The Bandana Bank Robbery</h3>
        </div>
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm font-medium">
          <p>Shortly after 1:00 PM on a Wednesday afternoon in April, three males dressed in black, wearing hats, and each carrying a handgun entered a bank. To disguise their appearance, each suspect wore a bandana to cover his face. The suspect wearing a red bandana approached one of the two bank clerks working the counter and demanded cash. The other two suspects wearing blue and black bandanas blocked the doors of the bank to prevent anyone from entering or leaving.</p>
          <p>While the suspect with the red bandana waited nervously for the cash at the counter, he screamed at the bank clerk to hurry up. The frightened bank clerk began to cry, causing the suspect to yell louder at her. In the midst of his outburst, a cellphone from a male bank employee rang loudly. This startled the red bandana suspect at the counter causing him to fire a single shot at the young male bank employee. He died later in hospital. Terrified by the shooting, the two suspects at the door yelled at the suspect who fired his gun. The suspect grabbed two bags of cash and all three suspects left the bank and entered a waiting orange van.</p>
          <p>Soon after, the orange van was found abandoned ten blocks away; it had been stolen and was set on fire. Both the police and the fire department responded quickly. Inside the van, police investigators found the three bandanas the bank robbers had used for their disguises. The bandanas suffered some damage but were not destroyed by the fire because they had been hidden in the glove compartment. A handgun and an empty bag that had contained some of the cash from the bank were also found.</p>
          <p className="p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded text-indigo-950 italic">Each bandana was examined and each had multiple hair strands and sweat residue. DNA was retrieved from each of the bandanas and a DNA profile was created for each of the three suspects.</p>
        </div>
      </div>

      {/* Investigation Section */}
      <div className="bg-slate-900 p-4 md:p-8 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col xl:flex-row gap-8 relative overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="xl:w-[22rem] flex flex-col gap-6 z-50">
          <div className="bg-slate-800/90 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-3 italic tracking-tighter uppercase">
              <Camera className="text-indigo-400" /> Sifting Hud
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={toggleCabinLight}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest border-2 ${
                  cabinLight ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.28)]' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {cabinLight ? <Lightbulb className="animate-pulse" size={18} /> : <ZapOff size={18} />}
                Cabin Light: {cabinLight ? 'On' : 'Off'}
              </button>
              <button
                onClick={toggleFlashlight}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest border-2 ${
                  flashlightOn ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.22)]' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {flashlightOn ? <Zap size={18} /> : <ZapOff size={18} />}
                Flashlight: {flashlightOn ? 'On' : 'Off'}
              </button>
            </div>
            <div className="mt-4 px-1 text-[11px] text-slate-400 leading-relaxed">
              Turn on the cabin light for a dim overview, then sweep the flashlight across the van to expose each evidence marker.
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {['bandanas', 'gun', 'cash'].map(key => (
              <div key={key} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${discovered[key] ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
                <div className={`w-3 h-3 rounded-full ${discovered[key] ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-slate-800'}`}></div>
                <span className={`text-[11px] font-black uppercase text-white tracking-widest`}>
                  {evidence[key].label}
                </span>
                {discovered[key] && <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />}
              </div>
            ))}
          </div>

          <div className="mt-auto bg-black p-5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-black text-indigo-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div> Investigator Log
            </div>
            <p className="text-[11px] text-slate-400 font-mono h-24 overflow-y-auto italic leading-relaxed">{log}</p>
          </div>
        </div>

        {/* The Realistic Interactive Viewport */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onClick={handleScreenClick}
          className={`relative flex-grow rounded-[2.5rem] overflow-hidden min-h-[680px] border border-slate-800 shadow-inner group select-none ${flashlightOn ? 'cursor-none' : 'cursor-crosshair'}`}
        >
          {/* Van shell and interior */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(248,250,252,0.08),transparent_28%),linear-gradient(180deg,#334155_0%,#1e293b_18%,#0f172a_45%,#020617_100%)]" />
          <div className="absolute inset-x-[5%] top-[4%] h-[18%] rounded-b-[3rem] bg-[linear-gradient(180deg,#64748b_0%,#334155_55%,#111827_100%)] opacity-90 border-b border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]" />
          <div className="absolute left-[7%] top-[11%] h-[16%] w-[38%] rounded-[2rem] border border-slate-500/30 bg-[linear-gradient(180deg,rgba(148,163,184,0.22),rgba(15,23,42,0.1))]" />
          <div className="absolute right-[7%] top-[11%] h-[16%] w-[38%] rounded-[2rem] border border-slate-500/30 bg-[linear-gradient(180deg,rgba(148,163,184,0.22),rgba(15,23,42,0.1))]" />
          <div className="absolute left-[9%] top-[31%] h-[30%] w-[27%] rounded-[2rem] bg-[linear-gradient(180deg,#475569_0%,#334155_35%,#111827_100%)] border border-slate-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_30px_rgba(0,0,0,0.28)]" />
          <div className="absolute left-[12%] top-[25%] h-[13%] w-[21%] rounded-[1.75rem] bg-[linear-gradient(180deg,#526277_0%,#334155_100%)] border border-slate-400/20" />
          <div className="absolute right-[9%] top-[31%] h-[30%] w-[27%] rounded-[2rem] bg-[linear-gradient(180deg,#475569_0%,#334155_35%,#111827_100%)] border border-slate-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_30px_rgba(0,0,0,0.28)]" />
          <div className="absolute right-[12%] top-[25%] h-[13%] w-[21%] rounded-[1.75rem] bg-[linear-gradient(180deg,#526277_0%,#334155_100%)] border border-slate-400/20" />
          <div className="absolute left-[38%] top-[35%] h-[28%] w-[24%] rounded-[2rem] bg-[linear-gradient(180deg,#1f2937_0%,#0f172a_100%)] border border-slate-600/30 shadow-[0_18px_30px_rgba(0,0,0,0.34)]" />
          <div className="absolute left-[44%] top-[23%] h-[18%] w-[12%] rounded-[1.5rem] bg-[linear-gradient(180deg,#64748b_0%,#334155_100%)] border border-slate-500/30" />
          <div className="absolute inset-x-[8%] bottom-[10%] h-[20%] rounded-[2.5rem] bg-[linear-gradient(180deg,#3f3f46_0%,#1f2937_38%,#0f172a_100%)] border border-slate-600/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
          <div className="absolute inset-x-[10%] bottom-[11.5%] h-[10%] rounded-[2rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
          <div className="absolute left-[60%] top-[30%] h-[18%] w-[22%] rounded-[1rem] border border-slate-500/20 bg-[linear-gradient(180deg,#1f2937_0%,#111827_100%)]" />
          <div className="absolute left-[61%] top-[31.5%] h-[5%] w-[18%] rounded-md border border-slate-400/20 bg-black/30" />
          <div className="absolute left-[12%] bottom-[20%] h-[10%] w-[76%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.04),rgba(0,0,0,0.45))]" />

          {/* Cabin dome light */}
          <div
            className={`absolute left-1/2 top-[10%] -translate-x-1/2 h-4 w-24 rounded-full border transition-all duration-500 ${
              cabinLight ? 'border-amber-200/60 bg-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.65)]' : 'border-slate-600/30 bg-slate-700/30'
            }`}
          />
          {cabinLight && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at 50% 12%, rgba(251, 191, 36, 0.32), rgba(245, 158, 11, 0.12) 18%, rgba(15, 23, 42, 0) 48%)'
              }}
            />
          )}

          {/* Burn marks and debris */}
          <div className="absolute left-[20%] top-[66%] h-[8%] w-[16%] rounded-full bg-black/35 blur-xl" />
          <div className="absolute right-[18%] top-[63%] h-[7%] w-[14%] rounded-full bg-black/30 blur-xl" />
          <div className="absolute left-[63%] top-[53%] h-[3%] w-[10%] rounded-full bg-black/35 blur-lg" />

          {/* Evidence items */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 z-10"
            style={{ top: `${evidence.bandanas.y}%`, left: `${evidence.bandanas.x}%`, opacity: getEvidenceOpacity('bandanas') }}
          >
            <svg width="76" height="60" viewBox="0 0 76 60">
              <path d="M8 38 C20 14 38 14 54 39 L45 46 L14 42 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
              <path d="M25 39 C34 20 50 20 66 42 L56 48 L31 44 Z" fill="#1d4ed8" stroke="#172554" strokeWidth="1.5" opacity="0.8" />
            </svg>
          </div>
          {!discovered.bandanas && (
            <button 
              onClick={(e) => { e.stopPropagation(); capture('bandanas', evidence.bandanas.message); }}
              className={`absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 z-30 ${getEvidenceButtonState('bandanas')}`}
              style={{ top: `${evidence.bandanas.y}%`, left: `${evidence.bandanas.x}%` }}
              aria-label="Recover bandanas"
            />
          )}

          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 z-10 rotate-12"
            style={{ top: `${evidence.gun.y}%`, left: `${evidence.gun.x}%`, opacity: getEvidenceOpacity('gun') }}
          >
            <svg width="84" height="54" viewBox="0 0 84 54">
              <path d="M15 25 h32 v-12 h23 v8 h-14 v19 h-12 l-11 -9 h-18 z" fill="#1f2937" stroke="#020617" strokeWidth="2" />
              <path d="M48 13 l11 -7 h9 v7 z" fill="#334155" opacity="0.7" />
            </svg>
          </div>
          {!discovered.gun && (
            <button 
              onClick={(e) => { e.stopPropagation(); capture('gun', evidence.gun.message); }}
              className={`absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 z-30 ${getEvidenceButtonState('gun')}`}
              style={{ top: `${evidence.gun.y}%`, left: `${evidence.gun.x}%` }}
              aria-label="Recover handgun"
            />
          )}

          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 z-10 -rotate-6"
            style={{ top: `${evidence.cash.y}%`, left: `${evidence.cash.x}%`, opacity: getEvidenceOpacity('cash') }}
          >
            <svg width="90" height="70" viewBox="0 0 90 70">
               <path d="M18 56 Q43 64 69 57 L62 18 L26 18 Z" fill="#78716c" stroke="#44403c" strokeWidth="2" />
               <path d="M35 18 C36 8 53 8 55 18" fill="none" stroke="#44403c" strokeWidth="3" />
               <circle cx="47" cy="38" r="8" fill="#be185d" opacity="0.6" />
            </svg>
          </div>
          {!discovered.cash && (
            <button 
              onClick={(e) => { e.stopPropagation(); capture('cash', evidence.cash.message); }}
              className={`absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 z-30 ${getEvidenceButtonState('cash')}`}
              style={{ top: `${evidence.cash.y}%`, left: `${evidence.cash.x}%` }}
              aria-label="Recover bank bag"
            />
          )}

          {/* Visual Markers (Found) */}
          {Object.entries(evidence).map(([key, item]) => (
            discovered[key] ? (
              <div
                key={item.markerId}
                className="absolute z-40 bg-yellow-300 text-black font-black text-[9px] px-1.5 py-0.5 border border-black shadow-lg"
                style={{ top: `${item.markerY}%`, left: `${item.markerX}%` }}
              >
                {item.markerId}
              </div>
            ) : null
          ))}

          {/* Darkness and flashlight layers */}
          <div
            className="absolute inset-0 z-20 pointer-events-none transition-all duration-500"
            style={{ background: sceneDarkness }}
          />
          {flashlightOn && (
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle 120px at ${flashlight.x}% ${flashlight.y}%, rgba(255,255,245,0.02) 0%, rgba(255,248,210,0.12) 20%, rgba(255,244,160,0.35) 32%, rgba(125,211,252,0.16) 46%, rgba(2,6,23,0.04) 58%, rgba(2,6,23,0.72) 74%, rgba(0,0,0,0.88) 100%)`
              }}
            />
          )}

          {/* Flashlight HUD Cursor */}
          {flashlightOn && (
            <div 
              className="absolute pointer-events-none w-16 h-16 border border-white/35 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-[100] transition-transform duration-75"
              style={{ left: `${flashlight.x}%`, top: `${flashlight.y}%` }}
            >
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]"></div>
              <div className="absolute inset-0 border border-cyan-300/35 rounded-full scale-[2.15] animate-pulse"></div>
            </div>
          )}

          {/* Activation Overlay */}
          {!flashlightOn && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-white/10 text-white text-center">
                 <div className="text-2xl font-black italic tracking-tighter uppercase mb-2 flex items-center justify-center gap-3">
                   <Zap className="text-amber-400 fill-amber-400" /> Van Scene Ready
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Use the flashlight control or click the scene to begin the sweep</div>
              </div>
            </div>
          )}

          {/* Transition Modal */}
          {allFound && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-8 animate-in fade-in duration-1000">
              <div className="max-w-md w-full text-center space-y-10">
                <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(79,70,229,0.5)] border-4 border-indigo-400/20 rotate-12">
                  <ShieldCheck size={56} className="text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-3">Investigation Complete</h2>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    The minivan sifting is complete. High-priority hair strands from the Red Bandana are ready for PCR sequencing.
                  </p>
                </div>
                <button 
                  onClick={() => document.getElementById('lab-suite-scroll').scrollIntoView({ behavior: 'smooth' })}
                  className="group bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 px-16 rounded-3xl text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
                >
                  Enter DNA Lab <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="lab-suite-scroll" className="h-20"></div>
    </div>
  );
};

const DnaLab = ({ answers, setAnswers }) => {
  const [uvLight, setUvLight] = useState(false);
  const handleChange = (e) => setAnswers({...answers, [e.target.name]: e.target.value});

  const DNA_PROFILES = {
    marker: [10, 25, 40, 55, 70, 85],
    evidence: [25, 55, 85],          
    suspect1: [10, 40, 70, 85],      
    suspect2: [25, 55, 85],          
    suspect3: [25, 40, 55, 70]
  };

  const renderLane = (title, bands) => (
    <div className="flex shrink-0 flex-col items-center">
      <div className="mb-5 flex h-10 w-[clamp(3.5rem,5vw,4.25rem)] items-end justify-center text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 leading-tight">{title}</div>
      <div className={`h-[500px] w-[clamp(3.5rem,5vw,4.25rem)] border-x border-slate-700 relative transition-all duration-700 shadow-2xl ${uvLight ? 'bg-slate-800' : 'bg-slate-950'}`}>
        <div className="w-12 h-3 border border-slate-600 mx-auto mt-2 rounded-sm bg-slate-900 shadow-inner"></div>
        {bands.map((pos, idx) => (
          <div 
            key={idx}
            className={`absolute left-2 right-2 h-2 rounded-full transition-all duration-1000 ${
              uvLight ? 'bg-indigo-400 shadow-[0_0_25px_rgba(129,140,248,1)]' : 'bg-transparent'
            }`}
            style={{ top: `${pos}%` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-800">
        <div className="bg-slate-800 p-12 lg:w-96 flex flex-col justify-between border-r border-slate-700">
          <div>
            <h3 className="text-3xl font-black text-white mb-6 italic tracking-tighter flex items-center gap-5 uppercase">
              <Microscope size={40} className="text-indigo-400" /> Bio-Analysis
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-12 font-medium">
              Analyze the Gel Electrophoresis profile for Marker A (Red Bandana) against the suspect DNA library.
            </p>
            
            <button 
              onClick={() => setUvLight(!uvLight)}
              className={`w-full py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border-2 ${
                uvLight ? 'bg-indigo-900/50 border-indigo-400 text-indigo-400 shadow-[0_0_50px_rgba(79,70,229,0.4)]' : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              {uvLight ? 'UV Lamp: Active' : 'UV Lamp: Standby'}
            </button>
          </div>

          <div className="mt-12 bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-700 shadow-inner">
            <label className="block text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4">Case Conclusion (Q6)</label>
            <select name="q6_suspect_match" value={answers.q6_suspect_match} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all shadow-xl">
              <option value="">-- Match Identified --</option>
              <option value="Suspect 1">Suspect 1 (Doe)</option>
              <option value="Suspect 2">Suspect 2 (Vance)</option>
              <option value="Suspect 3">Suspect 3 (Smith)</option>
            </select>
          </div>
        </div>

        <div className={`w-full overflow-x-auto overscroll-x-contain px-8 py-12 md:px-12 md:py-16 lg:w-full relative transition-colors duration-1000 ${uvLight ? 'bg-slate-900' : 'bg-black'}`}>
          <div className="flex min-w-max justify-start gap-4 md:gap-6 xl:justify-center xl:gap-8">
          {renderLane('DNA Ladder', DNA_PROFILES.marker)}
          {renderLane('Marker A', DNA_PROFILES.evidence)}
          {renderLane('Suspect 1', DNA_PROFILES.suspect1)}
          {renderLane('Suspect 2', DNA_PROFILES.suspect2)}
          {renderLane('Suspect 3', DNA_PROFILES.suspect3)}
          </div>
        </div>
      </div>

      <div className="bg-white p-16 rounded-[4rem] shadow-sm border border-slate-200">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center justify-between italic tracking-tighter uppercase">
          <span>07. Laboratory Findings</span>
          <span className="text-[12px] bg-indigo-600 px-5 py-2 rounded-full text-white font-black tracking-widest uppercase">2 Marks</span>
        </h3>
        <label className="block font-bold mb-6 text-slate-700 text-base leading-relaxed">
          "Based on the low cell count (60-75 cells) recovered from the scene, justify the use of PCR over RFLP."
        </label>
        <textarea name="q7_pcr_rflp" value={answers.q7_pcr_rflp} onChange={handleChange} className="w-full border border-slate-200 rounded-[2.5rem] p-10 h-64 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner bg-slate-50 leading-relaxed font-medium" placeholder="Draft your technical justification here..."></textarea>
      </div>
    </div>
  );
};

const FinalReport = ({ answers, discovered }) => {
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const handleExport = () => {
    const generatedAt = new Date().toLocaleString();
    const evidenceRows = [
      ["Marker A", discovered.bandanas ? "Recovered" : "Not recovered", "Bandanas / glove compartment"],
      ["Marker B", discovered.gun ? "Recovered" : "Not recovered", "Handgun / floorboard"],
      ["Marker C", discovered.cash ? "Recovered" : "Not recovered", "Bank bag / cargo area"]
    ];

    const responseRows = [
      ["RFLP cell threshold", answers.q1_rflp_cells],
      ["RFLP time", answers.q1_rflp_time],
      ["PCR cell threshold", answers.q1_pcr_cells],
      ["PCR time", answers.q1_pcr_time],
      ["VNTR and STR explanation", answers.q2_vntr_str],
      ["Nuclear DNA vs mtDNA", answers.q3_nuclear_mtdna],
      ["Probability ratio rationale", answers.q4_probability],
      ["DNA databank benefits", answers.q5a_benefits],
      ["DNA databank drawbacks", answers.q5a_drawbacks],
      ["Personal stance", answers.q5b_opinion],
      ["Suspect match", answers.q6_suspect_match],
      ["PCR over RFLP justification", answers.q7_pcr_rflp]
    ];

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Forensic DNA Evidence Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 28px; color: #0f172a; line-height: 1.45; }
          h1, h2 { margin: 0; }
          .header { border-bottom: 3px solid #1e293b; padding-bottom: 14px; margin-bottom: 22px; }
          .meta { margin-top: 6px; font-size: 12px; color: #475569; }
          .section { margin-top: 24px; }
          .section h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; font-size: 13px; }
          th { background: #e2e8f0; }
          .answer { white-space: pre-wrap; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Forensic DNA Evidence Report</h1>
          <div class="meta">Case ID: 882-DELTA-B</div>
          <div class="meta">Generated: ${escapeHtml(generatedAt)}</div>
        </div>

        <div class="section">
          <h2>Evidence Recovery</h2>
          <table>
            <thead>
              <tr><th>Marker</th><th>Status</th><th>Location</th></tr>
            </thead>
            <tbody>
              ${evidenceRows.map(([marker, status, location]) => `<tr><td>${escapeHtml(marker)}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(location)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Student Responses</h2>
          <table>
            <thead>
              <tr><th>Prompt</th><th>Response</th></tr>
            </thead>
            <tbody>
              ${responseRows.map(([prompt, value]) => `<tr><td>${escapeHtml(prompt)}</td><td class="answer">${escapeHtml(value || "Not answered")}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    let printFrame = document.getElementById("module7-assignment-print-frame");
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "module7-assignment-print-frame";
      printFrame.setAttribute("aria-hidden", "true");
      printFrame.style.position = "fixed";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      document.body.appendChild(printFrame);
    }

    printFrame.onload = () => {
      setTimeout(() => {
        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        }
      }, 120);
    };
    printFrame.srcdoc = reportHtml;
  };

  return (
    <div className="bg-white rounded-[5rem] shadow-xl border p-20 max-w-4xl mx-auto text-center space-y-12">
      <div className="inline-flex items-center justify-center w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] mb-4 shadow-inner">
        <ShieldCheck size={64} />
      </div>
      <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Certification</h2>
      <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-bold text-lg">
        The forensic file for Case ID 882-Delta-B is complete. Ensure all evidence and arguments are finalized.
      </p>
      
      <button 
        onClick={handleExport}
        className="bg-slate-900 hover:bg-black text-white font-black py-8 px-24 rounded-[3rem] flex items-center justify-center gap-6 transition-all mx-auto shadow-2xl hover:scale-105 active:scale-95 border-t border-white/20 uppercase tracking-[0.2em]"
      >
        <Download size={32} /> Generate Report
      </button>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('theory');
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [caseEvidence, setCaseEvidence] = useState({ bandanas: false, gun: false, cash: false });

  const tabs = [
    { id: 'theory', label: 'Theory & Policy', icon: Database },
    { id: 'case', label: 'Crime Scene', icon: Camera },
    { id: 'lab', label: 'DNA Lab', icon: Microscope },
    { id: 'report', label: 'Certification', icon: ShieldCheck }
  ];

  const filledFields = Object.values(answers).filter(val => val.trim().length > 0).length;
  const progress = Math.round((filledFields / Object.keys(answers).length) * 100);
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-indigo-100">
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="md:hidden fixed top-5 left-5 z-[140] bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3"
      >
        <Menu size={20} />
        <span className="text-xs font-black uppercase tracking-[0.2em]">Modules</span>
      </button>

      {isMobileMenuOpen && (
        <button
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[120]"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}
      
      {/* Sidebar Navigation */}
      <nav className={`bg-slate-950 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex fixed md:relative inset-y-0 left-0 flex-col shadow-2xl z-[130] ${
        isSidebarCollapsed ? 'md:w-20' : 'w-[18.5rem]'
      }`}>
        
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-4 top-12 bg-indigo-600 text-white w-8 h-8 rounded-full items-center justify-center hover:bg-indigo-500 shadow-lg z-[110]"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className={`p-8 border-b border-slate-900 bg-slate-950 text-center transition-all ${isSidebarCollapsed ? 'opacity-0 scale-50 overflow-hidden h-0' : 'opacity-100'}`}>
          <h1 className="text-3xl font-black text-white flex items-center justify-center gap-4 tracking-tighter italic">
            <Fingerprint className="text-indigo-500" /> CSI
          </h1>
        </div>
        
        <div className="flex-grow py-12">
          <ul className="space-y-6 px-3">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => handleTabChange(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} px-5 py-5 rounded-[2rem] transition-all text-slate-200 ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.4)] scale-105' 
                      : 'bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <tab.icon size={isSidebarCollapsed ? 28 : 22} />
                  {!isSidebarCollapsed && <span className="text-base font-black tracking-tight uppercase whitespace-nowrap text-current">{tab.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-10 border-t border-slate-900 bg-black/40 transition-all ${isSidebarCollapsed ? 'opacity-0 overflow-hidden h-0' : 'opacity-100'}`}>
          <div className="text-[10px] font-black text-slate-500 mb-5 flex justify-between uppercase tracking-[0.2em]">
            <span>System Data</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.6)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </nav>

      <main className="flex-grow overflow-y-auto h-screen relative bg-slate-50 w-full">
        <div className="p-10 pt-24 md:pt-24 md:p-24 max-w-7xl mx-auto pb-48">
          <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-slate-200 pb-12">
            <div>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.6em] mb-4 italic">Case Analysis 882-B</div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic break-words">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-16 duration-1000">
            {activeTab === 'theory' && <TheoryLab answers={answers} setAnswers={setAnswers} />}
            {activeTab === 'case' && <CaseFile discovered={caseEvidence} setDiscovered={setCaseEvidence} />}
            {activeTab === 'lab' && <DnaLab answers={answers} setAnswers={setAnswers} />}
            {activeTab === 'report' && <FinalReport answers={answers} discovered={caseEvidence} />}
          </div>
        </div>
      </main>
    </div>
  );
}
