import React, { useMemo, useState, useEffect } from "react";
import { 
  Shield, Activity, Cpu, 
  Fingerprint, Microscope, Camera, Database,
  ChevronRight, User, BookOpen, GraduationCap, 
  Scale, Printer, ExternalLink, CheckCircle2, ClipboardList
} from "lucide-react";

// --- SIMULATOR DATA ---
const careers = [
  { id: "fingerprints", name: "Latent Print Examiner", summary: "Compares latent prints, ridge detail, and known print cards.", day: "Examines print lifts, marks ridge characteristics, and compares suspects to evidence samples.", fit: "High visual acuity, pattern recognition, and extreme patience for comparative analysis.", icon: <Fingerprint className="w-5 h-5" />, color: "bg-indigo-500", text: "text-indigo-600", bgLight: "bg-indigo-50" },
  { id: "trace", name: "Trace Evidence Analyst", summary: "Studies hair, fibers, paint, glass, and other microscopic transfer evidence.", day: "Uses microscopes and reference collections to compare tiny evidence samples from scenes.", fit: "Detail-oriented, scientific mindset, capable of connecting microscopic anomalies to a macro event.", icon: <Microscope className="w-5 h-5" />, color: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50" },
  { id: "csi", name: "Crime Scene Investigator", summary: "Collects, documents, and preserves physical evidence from a scene.", day: "Photographs the scene, marks evidence, and protects chain of custody for later analysis.", fit: "Strong situational awareness, operational stamina, and strict adherence to protocol.", icon: <Camera className="w-5 h-5" />, color: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50" },
  { id: "analyst", name: "Bio-Forensic Analyst", summary: "Processes biological samples and writes formal lab reports for court.", day: "Prepares samples, runs instruments like DNA sequencers, records results, and writes findings.", fit: "High precision, methodological rigor, and ability to operate in sterile environments.", icon: <Database className="w-5 h-5" />, color: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50" },
  { id: "digital", name: "Digital Forensics Analyst", summary: "Searches devices and digital records for hidden timelines and metadata.", day: "Recovers files, examines phones and computers, and builds timelines from digital traces.", fit: "Technical fluency, logical deduction, and ability to reverse-engineer digital behavior.", icon: <Cpu className="w-5 h-5" />, color: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50" },
];

const scenarioQuestions = [
  { phase: "Deployment", prompt: "You arrive at a compromised secure facility. The alarm is still blaring and the scene is chaotic. What is your immediate priority?", helper: "Select your initial operational instinct.", options: [ { label: "Establish a physical perimeter and systematically document the point of entry.", weights: { csi: 4, fingerprints: 1 } }, { label: "Plug into the network mainframe to isolate the security system breach.", weights: { digital: 4 } }, { label: "Examine the shattered glass at the entryway for microscopic clothing snags.", weights: { trace: 4, analyst: 1 } }, { label: "Look for bodily fluids or biologicals left behind in the suspect's rush.", weights: { analyst: 4, csi: 1 } } ] },
  { phase: "Discovery", prompt: "You access the breached vault. Several types of evidence are present. Which asset do you secure first?", helper: "Determine the most critical piece of evidence.", options: [ { label: "Dust the exposed keypad and vault handle for latent prints before they smudge.", weights: { fingerprints: 4, csi: 1 } }, { label: "Collect a dropped, encrypted USB drive and a burner phone.", weights: { digital: 4 } }, { label: "Collect a torn piece of fabric caught on the vault's locking mechanism.", weights: { trace: 4, analyst: 1 } }, { label: "Carefully swab a drop of blood found near the vault door.", weights: { analyst: 4, csi: 1 } } ] },
  { phase: "Processing", prompt: "Back at headquarters, the collected evidence requires processing. Which task do you claim?", helper: "Choose your preferred operational environment.", options: [ { label: "Spend hours meticulously running biological swabs through a DNA sequencer.", weights: { analyst: 4, trace: 1 } }, { label: "Decompile the malware found on the USB drive to trace its origin.", weights: { digital: 4 } }, { label: "Compare the lifted prints against the national AFIS database.", weights: { fingerprints: 4 } }, { label: "Catalog the physical evidence, meticulously maintaining the chain of custody.", weights: { csi: 4 } } ] },
  { phase: "Breakthrough", prompt: "The investigation stalls. Where do you look to find the missing link that cracks the case?", helper: "Identify your preferred method of problem-solving.", options: [ { label: "Finding a micro-fiber match that links the suspect's jacket to the vault.", weights: { trace: 4 } }, { label: "Reconstructing a deleted email thread that proves premeditation.", weights: { digital: 4 } }, { label: "Getting a 12-point minutiae match on a partial, smudged thumbprint.", weights: { fingerprints: 4 } }, { label: "Piecing together the timeline using scene photos and physical access logs.", weights: { csi: 4, digital: 1 } } ] },
  { phase: "Prosecution", prompt: "The case goes to court. What is your role in securing the conviction?", helper: "Select how you want to present your findings.", options: [ { label: "Presenting flawless scene documentation that proves the suspect's presence.", weights: { csi: 4 } }, { label: "Testifying on the exact chemical composition of the transfer evidence.", weights: { trace: 4, analyst: 2 } }, { label: "Explaining the indisputable biometric match of the suspect's fingerprint.", weights: { fingerprints: 4 } }, { label: "Walking the jury through the suspect's digital footprint and GPS data.", weights: { digital: 4 } } ] },
];

// --- INITIAL ASSIGNMENT STATE ---
const initialAssignmentData = {
  career1: { name: "", desc: "", reqs: "", edu: "", salary: "", sources: "" },
  career2: { name: "", desc: "", reqs: "", edu: "", salary: "", sources: "" },
  program1: { name: "", institution: "", desc: "", reqs: "", length: "", cost: "", sources: "" },
  program2: { name: "", institution: "", desc: "", reqs: "", length: "", cost: "", sources: "" },
  csiEffect: { definition: "", consequences: "", juror: "" }
};

export default function Professional_Forensics_Platform() {
  const [activeTab, setActiveTab] = useState("simulator");
  const [assignmentData, setAssignmentData] = useState(initialAssignmentData);
  const [printMode, setPrintMode] = useState(false);

  // Print Handler
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  const handleInputChange = (section, field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // If we are printing, render the clean white document version
  if (printMode) {
    return (
      <div className="bg-white text-black p-8 font-serif max-w-4xl mx-auto space-y-8">
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold">Exploring Careers in Forensic Science</h1>
          <p className="text-lg mt-2 text-slate-600">Candidate Evaluation Dossier</p>
        </div>
        <section>
          <h2 className="text-2xl font-bold bg-slate-100 p-2 mb-4">Part 1: Careers in Forensic Science (20 Marks)</h2>
          <PrintCareer data={assignmentData.career1} num={1} />
          <PrintCareer data={assignmentData.career2} num={2} />
        </section>
        <section className="break-before-page">
          <h2 className="text-2xl font-bold bg-slate-100 p-2 mb-4">Part 2: Post-Secondary Programs (24 Marks)</h2>
          <PrintProgram data={assignmentData.program1} num={1} />
          <PrintProgram data={assignmentData.program2} num={2} />
        </section>
        <section className="break-before-page">
          <h2 className="text-2xl font-bold bg-slate-100 p-2 mb-4">Part 3: The CSI Effect (6 Marks)</h2>
          <div className="mb-6"><h3 className="font-bold">What is the "CSI Effect"?</h3><p className="mt-2 whitespace-pre-wrap border p-4 min-h-[100px]">{assignmentData.csiEffect.definition}</p></div>
          <div className="mb-6"><h3 className="font-bold">What are some of the long-term negative consequences?</h3><p className="mt-2 whitespace-pre-wrap border p-4 min-h-[100px]">{assignmentData.csiEffect.consequences}</p></div>
          <div className="mb-6"><h3 className="font-bold">As a juror, would your perception be affected?</h3><p className="mt-2 whitespace-pre-wrap border p-4 min-h-[100px]">{assignmentData.csiEffect.juror}</p></div>
        </section>
      </div>
    );
  }

  // Regular UI
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row selection:bg-blue-200">
      
      {/* Professional Sidebar */}
      <div className="w-full md:w-72 bg-slate-900 flex flex-col shadow-xl z-20">
        
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">
              Assignment Portal
            </div>
            <div className="font-bold text-white tracking-tight">Forensic Sciences</div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 mt-4">
            Required Modules
          </div>
          <NavButton active={activeTab === "simulator"} onClick={() => setActiveTab("simulator")} icon={<Activity size={18} />} label="Aptitude Profiler" />
          <NavButton active={activeTab === "part1"} onClick={() => setActiveTab("part1")} icon={<User size={18} />} label="Career Research" marks="20" />
          <NavButton active={activeTab === "part2"} onClick={() => setActiveTab("part2")} icon={<GraduationCap size={18} />} label="Academy Pathways" marks="24" />
          <NavButton active={activeTab === "part3"} onClick={() => setActiveTab("part3")} icon={<Scale size={18} />} label="The CSI Effect" marks="6" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-[0.98]">
            <Printer size={16} /> Print Assignment
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {activeTab === "simulator" && <SimulatorModule />}
          {activeTab === "part1" && <Part1Careers data={assignmentData} onChange={handleInputChange} />}
          {activeTab === "part2" && <Part2Programs data={assignmentData} onChange={handleInputChange} />}
          {activeTab === "part3" && <Part3CSIEffect data={assignmentData} onChange={handleInputChange} />}
        </div>
      </div>
    </div>
  );
}

// --- MODULE 1: SIMULATOR COMPONENT ---
function SimulatorModule() {
  const [systemState, setSystemState] = useState("active");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(Array.from({ length: scenarioQuestions.length }, () => null));

  const ranked = useMemo(() => {
    const scores = Object.fromEntries(careers.map((career) => [career.id, 0]));
    selected.forEach((choiceIndex, questionIndex) => {
      if (choiceIndex === null) return;
      const weights = scenarioQuestions[questionIndex].options[choiceIndex].weights;
      Object.entries(weights).forEach(([careerId, value]) => {
        scores[careerId] = (scores[careerId] || 0) + value;
      });
    });
    return careers.map((career) => ({ ...career, score: scores[career.id] || 0 })).sort((a, b) => b.score - a.score);
  }, [selected]);

  const question = scenarioQuestions[step];
  const topMatch = ranked[0];

  const handleNext = () => {
    if (step === scenarioQuestions.length - 1) {
      setSystemState("analyzing");
      setTimeout(() => setSystemState("results"), 2000);
    } else setStep(s => s + 1);
  };

  if (systemState === "analyzing") {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center text-blue-600 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <Activity className="w-12 h-12 mb-6 animate-spin-slow text-blue-600" />
        <div className="text-lg font-bold text-slate-900 mb-2">Analyzing Responses</div>
        <div className="text-sm text-slate-500">Calculating career alignment...</div>
        <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-blue-600 w-1/2 animate-[ping_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  if (systemState === "results") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`rounded-2xl border bg-white p-8 md:p-10 shadow-sm relative overflow-hidden ${topMatch.bgLight} border-${topMatch.color.split('-')[1]}-200`}>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${topMatch.color}`}>
              {topMatch.icon}
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${topMatch.text}`}>
                Primary Career Match
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{topMatch.name}</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/50">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Psychological Fit</div>
              <p className="text-sm text-slate-700 leading-relaxed">{topMatch.fit}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/50">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Operational Summary</div>
              <p className="text-sm text-slate-700 leading-relaxed">{topMatch.summary}</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Complete Alignment Breakdown</h3>
          <div className="space-y-5">
            {ranked.map((career, idx) => (
              <div key={career.id}>
                <div className="flex justify-between text-sm font-medium mb-2 text-slate-700">
                  <span className={idx === 0 ? "font-bold text-slate-900" : ""}>{career.name}</span>
                  <span className="text-slate-500 text-xs">{career.score} PTS</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${idx === 0 ? career.color : "bg-slate-300"}`} style={{ width: `${Math.min(100, Math.max(5, career.score * 15))}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button onClick={() => {setSystemState("active"); setStep(0); setSelected(selected.map(()=>null));}} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((step + 1) / scenarioQuestions.length) * 100}%` }}></div>
      </div>

      <div className="p-8 md:p-10 border-b border-slate-100">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          Phase {step + 1} of {scenarioQuestions.length} <span className="text-slate-300">•</span> {question.phase}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 leading-snug">{question.prompt}</h2>
      </div>
      
      <div className="p-8 md:p-10 space-y-3 bg-slate-50/50">
        {question.options.map((option, index) => {
          const isActive = selected[step] === index;
          return (
            <button key={index} onClick={() => { const n = [...selected]; n[step] = index; setSelected(n); }}
              className={`w-full text-left p-5 rounded-xl border transition-all flex gap-4 items-start ${isActive ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}
            >
              <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isActive ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"}`}>
                <CheckCircle2 size={14} />
              </div>
              <div className={`text-sm leading-relaxed ${isActive ? "text-blue-900 font-medium" : "text-slate-700"}`}>{option.label}</div>
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-100 flex justify-between bg-white items-center">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-colors">
          Previous
        </button>
        <button onClick={handleNext} disabled={selected[step] === null} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm">
          {step === scenarioQuestions.length - 1 ? "View Results" : "Continue"} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// --- MODULE 2: CAREER RESEARCH (PART 1) ---
function Part1Careers({ data, onChange }) {
  const resources = [
    { title: "ALIS Alberta Occupations", url: "https://alis.alberta.ca/occinfo/occupations-in-alberta/" },
    { title: "RCMP ID Services", url: "https://rcmp.ca/en/forensic-science-and-identification-services/forensic-identification-services" },
    { title: "RCMP Science Services", url: "https://rcmp.ca/en/specialized-policing-services/forensic-science-and-identification-services" },
    { title: "Centre of Forensic Sciences", url: "https://www.csfs.ca/resources/government-labs-in-canada/centre-of-forensic-sciences/" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Careers in Forensic Science" subtitle="Part 1" marks="20" desc="Use the provided resources to thoroughly research two distinct careers within the forensic science field." />
      <ResourceBox links={resources} />
      <CareerForm num="1" data={data.career1} onChange={(f, v) => onChange("career1", f, v)} />
      <CareerForm num="2" data={data.career2} onChange={(f, v) => onChange("career2", f, v)} />
    </div>
  );
}

// --- MODULE 3: POST-SECONDARY (PART 2) ---
function Part2Programs({ data, onChange }) {
  const resources = [
    { title: "UAlberta Forensic Science", url: "https://www.ualberta.ca/science/programs/bachelor-of-science/degrees-and-majors/programs-by-areas-of-interest/forensic-science" },
    { title: "BCIT Forensics", url: "https://www.bcit.ca/study/programs/forensics" },
    { title: "Ontario Tech (UOIT)", url: "https://uoit.ca/programs/science/forensic-science.php" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Post-Secondary Pathways" subtitle="Part 2" marks="24" desc="Research and detail the requirements for two academic programs related to your career goals." />
      <ResourceBox links={resources} />
      <ProgramForm num="1" data={data.program1} onChange={(f, v) => onChange("program1", f, v)} />
      <ProgramForm num="2" data={data.program2} onChange={(f, v) => onChange("program2", f, v)} />
    </div>
  );
}

// --- MODULE 4: CSI EFFECT (PART 3) ---
function Part3CSIEffect({ data, onChange }) {
  const resources = [
    { title: "NIJ Journal: The CSI Effect", url: "https://www.nij.gov/journals/259/pages/csi-effect.aspx" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="The CSI Effect" subtitle="Part 3" marks="6" desc="Review the provided literature and articulate the real-world impact of media on the justice system." />
      <ResourceBox links={resources} />
      <div className="p-8 border border-slate-200 bg-white rounded-2xl shadow-sm space-y-6">
        <FormTextarea label="1. What is the 'CSI Effect'?" val={data.csiEffect.definition} onChange={(v) => onChange("csiEffect", "definition", v)} />
        <FormTextarea label="2. What are some of the long-term negative consequences?" val={data.csiEffect.consequences} onChange={(v) => onChange("csiEffect", "consequences", v)} />
        <FormTextarea label="3. If you were a juror, do you think your perception would be affected? Explain." val={data.csiEffect.juror} onChange={(v) => onChange("csiEffect", "juror", v)} />
      </div>
    </div>
  );
}


// --- UI HELPERS ---

function NavButton({ active, onClick, icon, label, marks }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
      <div className="flex items-center gap-3 text-sm font-medium">{icon} {label}</div>
      {marks && <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}>{marks} pts</div>}
    </button>
  );
}

function SectionHeader({ title, subtitle, marks, desc }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide">
          Worth {marks} Marks
        </span>
      </div>
      <p className="text-base text-slate-600">{desc}</p>
    </div>
  );
}

function ResourceBox({ links }) {
  return (
    <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
        <BookOpen size={16} /> Approved Resources
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors">
            {link.title} <ExternalLink size={12} className="text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}

function CareerForm({ num, data, onChange }) {
  return (
    <div className="p-8 border border-slate-200 bg-white rounded-2xl shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
          {num}
        </div>
        Career Profile
      </h3>
      <FormInput label="Detailed Job Title" val={data.name} onChange={(v) => onChange("name", v)} />
      <FormTextarea label="Detailed Job Description" val={data.desc} onChange={(v) => onChange("desc", v)} />
      <div className="grid md:grid-cols-2 gap-6">
        <FormTextarea label="Personal Requirements" val={data.reqs} onChange={(v) => onChange("reqs", v)} />
        <FormTextarea label="Educational Requirements" val={data.edu} onChange={(v) => onChange("edu", v)} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <FormInput label="Average Salary" val={data.salary} onChange={(v) => onChange("salary", v)} />
        <FormInput label="Source(s)" val={data.sources} onChange={(v) => onChange("sources", v)} />
      </div>
    </div>
  );
}

function ProgramForm({ num, data, onChange }) {
  return (
    <div className="p-8 border border-slate-200 bg-white rounded-2xl shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
          {num}
        </div>
        Academic Program
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <FormInput label="Program Name" val={data.name} onChange={(v) => onChange("name", v)} />
        <FormInput label="Institution Offering Program" val={data.institution} onChange={(v) => onChange("institution", v)} />
      </div>
      <FormTextarea label="Detailed Program Description" val={data.desc} onChange={(v) => onChange("desc", v)} />
      <FormTextarea label="Admission Requirements" val={data.reqs} onChange={(v) => onChange("reqs", v)} />
      <div className="grid md:grid-cols-3 gap-6">
        <FormInput label="Length of Program" val={data.length} onChange={(v) => onChange("length", v)} />
        <FormInput label="Program Cost" val={data.cost} onChange={(v) => onChange("cost", v)} />
        <FormInput label="Source(s)" val={data.sources} onChange={(v) => onChange("sources", v)} />
      </div>
    </div>
  );
}

function FormInput({ label, val, onChange }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input type="text" value={val} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl placeholder:text-slate-400" placeholder="Enter details..." />
    </div>
  );
}

function FormTextarea({ label, val, onChange }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <textarea value={val} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-y rounded-xl placeholder:text-slate-400" placeholder="Enter details..." />
    </div>
  );
}

// --- PRINT HELPERS ---
function PrintCareer({ data, num }) {
  return (
    <div className="mb-8 border border-gray-300 p-6 break-inside-avoid">
      <h3 className="text-xl font-bold border-b pb-2 mb-4">Career #{num}: {data.name || "___________________"}</h3>
      <div className="space-y-4">
        <div><strong>Detailed Job Description:</strong> <p className="mt-1">{data.desc}</p></div>
        <div><strong>Personal Requirements:</strong> <p className="mt-1">{data.reqs}</p></div>
        <div><strong>Educational Requirements:</strong> <p className="mt-1">{data.edu}</p></div>
        <div><strong>Average Salary:</strong> <p className="mt-1">{data.salary}</p></div>
        <div><strong>Source(s):</strong> <p className="mt-1">{data.sources}</p></div>
      </div>
    </div>
  );
}

function PrintProgram({ data, num }) {
  return (
    <div className="mb-8 border border-gray-300 p-6 break-inside-avoid">
      <h3 className="text-xl font-bold border-b pb-2 mb-4">Program #{num}: {data.name || "___________________"}</h3>
      <div className="space-y-4">
        <div><strong>Institution:</strong> <p className="mt-1">{data.institution}</p></div>
        <div><strong>Detailed Program Description:</strong> <p className="mt-1">{data.desc}</p></div>
        <div><strong>Admission Requirements:</strong> <p className="mt-1">{data.reqs}</p></div>
        <div><strong>Length of Program:</strong> <p className="mt-1">{data.length}</p></div>
        <div><strong>Program Cost:</strong> <p className="mt-1">{data.cost}</p></div>
        <div><strong>Source(s):</strong> <p className="mt-1">{data.sources}</p></div>
      </div>
    </div>
  );
}