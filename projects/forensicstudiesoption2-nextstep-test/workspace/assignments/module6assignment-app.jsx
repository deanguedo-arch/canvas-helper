import React, { useState, useEffect, useRef } from 'react';

const MODULE6_ASSIGNMENT_STORAGE_KEY = 'forensics::module6assignment::v1';

function readModule6AssignmentState() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(MODULE6_ASSIGNMENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeModule6AssignmentState(state) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(MODULE6_ASSIGNMENT_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Ignore storage write failures in locked/private contexts.
  }
}

const IconStub = () => null;
const Activity = IconStub;
const BookOpen = IconStub;
const PenTool = IconStub;
const FileText = IconStub;
const Download = IconStub;
const Search = IconStub;
const AlertCircle = IconStub;
const CheckCircle2 = IconStub;
const ChevronRight = IconStub;
const User = IconStub;

// --- DATA ---

const SUSAN_QUESTIONS = [
  { id: 1, text: "Is your name Susan Smith?", type: "Control", spike: 0.2 },
  { id: 2, text: "Are we currently in South Carolina?", type: "Control", spike: 0.1 },
  { id: 3, text: "Are you separated from your husband, David?", type: "Relevant", spike: 0.3 },
  { id: 4, text: "Do you own a burgundy 1990 Mazda Protegé?", type: "Relevant", spike: 0.4 },
  { id: 5, text: "Have you ever lied to get out of trouble?", type: "Control", spike: 0.8 },
  { id: 6, text: "Did you voluntarily come to the police station today?", type: "Relevant", spike: 0.2 },
  { id: 7, text: "Were you stopped at a red light when the carjacking happened?", type: "Relevant", spike: 2.5 }, // She lied; the light was triggered by cars, but the intersection was empty.
  { id: 8, text: "Did you see a black man take your children?", type: "Relevant", spike: 2.8 },
  { id: 9, text: "Do you know where your children are right now?", type: "Relevant", spike: 3.5 },
  { id: 10, text: "Did you roll your car into John D. Long Lake?", type: "Relevant", spike: 4.0 }
];

const INITIAL_ANSWERS = {
  q1_polygraph_help: "",
  q2a_pass_type: "",
  q2b_pass_how: "",
  q3a_sc_reasons: "",
  q3b_sc_agree: "",
  q4_suspect_match: "",
  q4_suspect_evidence: "",
  q5_minimize_alteration: "",
  q6_lindbergh_same: "",
  q7_lindbergh_features: "",
  q8_research_desc: "",
  q8_research_role: "",
  q8_research_reliable: "",
  q8_research_conclusion: "",
  q8_research_sources: ""
};

// --- COMPONENTS ---

const PolygraphLab = ({ history, setHistory }) => {
  const canvasRef = useRef(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isExamining, setIsExamining] = useState(false);
  
  // Polygraph Animation State
  const timeRef = useRef(0);
  const stressLevelRef = useRef(0.2); // Base stress
  const animationRef = useRef(null);
  const tracesRef = useRef({
    heart: Array(500).fill(0),
    breath: Array(500).fill(0),
    sweat: Array(500).fill(0)
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      
      // Decay stress level slowly back to baseline (0.2)
      if (stressLevelRef.current > 0.2) {
        stressLevelRef.current -= 0.01;
      }
      const stress = stressLevelRef.current;

      // Generate new data points
      const newHeart = Math.sin(t * (0.2 + stress * 0.1)) * (10 + stress * 15) + (Math.random() * 5 * stress);
      const newBreath = Math.sin(t * 0.05) * (15 + stress * 5) + (Math.random() * 2);
      
      // GSR (Sweat) reacts slowly to stress
      const targetGsr = stress * 30;
      const lastGsr = tracesRef.current.sweat[tracesRef.current.sweat.length - 1];
      const newGsr = lastGsr + (targetGsr - lastGsr) * 0.05 + (Math.random() * 2 - 1);

      // Shift arrays
      tracesRef.current.heart.shift();
      tracesRef.current.heart.push(newHeart);
      
      tracesRef.current.breath.shift();
      tracesRef.current.breath.push(newBreath);
      
      tracesRef.current.sweat.shift();
      tracesRef.current.sweat.push(newGsr);

      // Clear & Draw Grid
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for(let i=0; i<canvas.width; i+=20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i=0; i<canvas.height; i+=20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Helper to draw trace
      const drawTrace = (data, color, offset) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < data.length; i++) {
          const x = (i / data.length) * canvas.width;
          const y = offset - data[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // Draw traces
      drawTrace(tracesRef.current.breath, '#3b82f6', 60); // Blue: Breathing
      drawTrace(tracesRef.current.sweat, '#10b981', 150); // Green: GSR
      drawTrace(tracesRef.current.heart, '#ef4444', 240); // Red: Heart Rate

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const askQuestion = (q) => {
    if (isExamining) return;
    setIsExamining(true);
    setActiveQuestion(q);
    
    // Simulate delay before response
    setTimeout(() => {
      stressLevelRef.current = q.spike;
      setHistory(prev => [{...q, timestamp: new Date().toLocaleTimeString()}, ...prev]);
      
      setTimeout(() => {
        setIsExamining(false);
        setActiveQuestion(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-red-400" /> Polygraph Simulator
            </h2>
            <p className="text-slate-400">Subject: Susan Smith | Test Type: Control Question Test (CQT)</p>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1 text-blue-400"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Pneumograph (Breathing)</span>
            <span className="flex items-center gap-1 text-emerald-400"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Galvanograph (Sweat)</span>
            <span className="flex items-center gap-1 text-red-400"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Cardiograph (Heart)</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-2 overflow-hidden relative">
          <canvas ref={canvasRef} width={800} height={300} className="w-full h-[300px]" />
          {activeQuestion && (
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full font-semibold animate-pulse shadow-xl">
               Asking: "{activeQuestion.text}"
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Examiner Questions</h3>
          <p className="text-sm text-gray-600 mb-4">Select a question to ask the subject. Observe the physiological responses on the chart above.</p>
          <div className="space-y-2">
            {SUSAN_QUESTIONS.map(q => (
              <button 
                key={q.id}
                onClick={() => askQuestion(q)}
                disabled={isExamining}
                className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                  isExamining ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-blue-300'
                }`}
              >
                <span className="font-medium text-gray-800">{q.text}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  q.type === 'Control' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'
                }`}>{q.type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border rounded-xl p-6 shadow-sm overflow-y-auto max-h-[400px]">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Session Log</h3>
          {history.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">No questions asked yet. Begin the examination.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border shadow-sm flex flex-col">
                  <span className="text-xs text-gray-400 mb-1">{item.timestamp}</span>
                  <span className="font-medium">"{item.text}"</span>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Observed Reaction:</span>
                    {item.spike > 2 ? (
                      <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={14}/> High Arousal (Deception Indicated)</span>
                    ) : item.spike > 0.5 ? (
                      <span className="text-orange-500 font-bold">Moderate Arousal</span>
                    ) : (
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Baseline (No Deception)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CaseFiles = () => (
  <div className="space-y-8 max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-md overflow-hidden border">
      <div className="bg-slate-800 text-white p-4 flex items-center gap-3">
        <BookOpen className="text-blue-400" />
        <h2 className="text-xl font-bold">Case File #1: Nine Long Days - The Susan Smith Case (1994)</h2>
      </div>
      <div className="p-6 space-y-4 text-gray-700 leading-relaxed">
        <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Background Information</h3>
        <p>Susan Smith had been separated from her husband, David Smith, 24, for several months. Susan had been seeing a successful businessman named Tom Findlay. Mr. Findlay had recently broke off their short relationship saying that he was not comfortable about getting involved with someone who had children. After this break up, Susan threatened suicide on several occasions.</p>
        
        <h3 className="font-bold text-lg text-slate-900 border-b pb-2 pt-4">Susan's Story</h3>
        <p>On the evening of October 24, 1994, Susan Smith, 23, frantically pounded on the front door of a house in the town of Union, South Carolina. When the unsuspecting homeowner opened the door, Susan began sobbing and screaming that her children had been kidnapped.</p>
        <p>When police arrived, Susan told them that a middle-aged black man with a gun had forced her out of the car while she was waiting with her two children at a red light. The suspect then drove off with her two young children: Alex, 1, and Michael, 3. The alleged kidnapping occurred near John D. Long Lake, and an extensive search of the area was completed.</p>
        
        <h3 className="font-bold text-lg text-slate-900 border-b pb-2 pt-4">Police Become Suspicious & The Polygraph</h3>
        <p>When police found nothing during their search, they began questioning Susan Smith more extensively. Questioned for 6 hours, Ms. Smith was asked to recount the ordeal numerous times. Investigators soon noticed inconsistencies. A major flaw in her story involved the red light she claimed to be stopped at; investigators determined that the specific traffic light would only turn red if a car triggered it on the cross street, yet she claimed the intersection was completely empty.</p>
        <p>Over the next nine days, Smith made tearful pleas on national television for the safe return of her children. However, behind the scenes, police administered multiple polygraph examinations. She failed them. The physiological arousal indicated severe deception when questioned about the whereabouts of her children and the details of the carjacking.</p>
        <p>Finally, under mounting pressure and the weight of the failed polygraphs, Susan Smith confessed. There was no carjacker. She had strapped her children into their car seats, released the parking brake, and let the car roll down a boat ramp into John D. Long Lake, drowning them. She was convicted of murder.</p>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-md overflow-hidden border">
      <div className="bg-slate-800 text-white p-4 flex items-center gap-3">
        <BookOpen className="text-blue-400" />
        <h2 className="text-xl font-bold">Case File #2: The Lindbergh Kidnapping (1932)</h2>
      </div>
      <div className="p-6 space-y-4 text-gray-700 leading-relaxed">
        <h3 className="font-bold text-lg text-slate-900 border-b pb-2">The Crime of the Century</h3>
        <p>On March 1, 1932, the infant son of famous aviator Charles Lindbergh was kidnapped from his second-floor nursery in Hopewell, New Jersey. A homemade ladder was found outside the window, along with a ransom note demanding $50,000. Over the next weeks, 14 more ransom notes were delivered. Despite paying the ransom, the child's body was tragically found months later in nearby woods.</p>
        
        <h3 className="font-bold text-lg text-slate-900 border-b pb-2 pt-4">Forensic Evidence</h3>
        <p>For two years, the case went cold until the marked ransom bills started turning up in New York. A gas station attendant noted the license plate of a man paying with a gold certificate (ransom money), leading police to Bruno Richard Hauptmann, a German immigrant and carpenter.</p>
        <p>The evidence against him heavily relied on early forensic science:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Forensic Botany (Wood Analysis):</strong> Expert Arthur Koehler proved that the wood used to build the homemade ladder perfectly matched a missing floorboard in Hauptmann's attic, down to the grain and unique tool marks from Hauptmann's specific hand plane.</li>
          <li><strong>Forensic Graphology (Handwriting):</strong> Handwriting expert Albert S. Osborn analyzed the ransom notes against Hauptmann's known writing. They found striking, repeated similarities. The writer consistently made backward "N"s, unclosed "o"s, and had a very specific way of crossing the letter "t". Furthermore, phonetic misspellings characteristic of a native German speaker matching Hauptmann's exact dialect were found (e.g., spelling "where" as "were", "our" as "ouer").</li>
          <li><strong>Physical Evidence:</strong> Over $14,000 of the ransom money was found hidden inside a tin can in Hauptmann's garage. Also, the phone number of the man who delivered the ransom (Dr. Condon) was found written on the inside of Hauptmann's closet door.</li>
        </ul>
        <p>Hauptmann was convicted of capital murder and executed in 1936, though he maintained his innocence to the end. The case remains a landmark in the history of forensic science admissibility in court.</p>
      </div>
    </div>
  </div>
);

const HandwritingLab = ({ selectedSuspect, setSelectedSuspect }) => {
  const suspects = [
    { id: 1, desc: "Slanted heavily to the right, thick pen pressure, tightly closed loops.", handwritingClass: "font-serif italic tracking-tighter" },
    { id: 2, desc: "Small, upright print mixed with cursive. Very neat and controlled.", handwritingClass: "font-sans text-sm tracking-wide" },
    { id: 3, desc: "Slanted to the left, sharp angles on letters, very light pen strokes.", handwritingClass: "font-mono italic" },
    { id: 4, desc: "Erratic baseline, disjointed 't' crosses, distinctive unclosed 'o's and 'e' loops.", handwritingClass: "font-caveat text-xl tracking-wider text-red-800" }, // The match
    { id: 5, desc: "Elaborate cursive with exaggerated, overly large upper and lower loops.", handwritingClass: "font-serif text-lg italic" },
    { id: 6, desc: "All capital block letters, uniform size, heavily pressed onto the paper.", handwritingClass: "font-sans uppercase font-bold" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex gap-3">
        <PenTool className="flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold">Interactive Handwriting Comparison</h3>
          <p className="text-sm mt-1">Select a suspect's sample below to compare it against the recovered threatening note in the Lightbox. Look for class characteristics (general style) and individual characteristics (unique quirks, spacing, baseline alignment).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Suspect Samples</h3>
          <div className="space-y-2">
            {suspects.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedSuspect(s.id)}
                className={`w-full text-left p-3 rounded border transition-colors flex justify-between items-center ${
                  selectedSuspect === s.id ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-semibold">Suspect {s.id}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-xl shadow-inner p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Lightbox Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700/50 via-slate-900 to-slate-900 pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crime Scene Note */}
              <div className="bg-[#fdfbf7] p-6 rounded shadow-lg transform rotate-1">
                <div className="border-b-2 border-red-500/20 mb-4 pb-1 flex justify-between items-end">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Exhibit A: Crime Scene</span>
                </div>
                <p className="font-caveat text-xl tracking-wider text-gray-800 leading-relaxed" style={{fontFamily: 'cursive'}}>
                  Leave the money by the oak tree tonight or else. Don't call the cops. We are watching you closely.
                </p>
              </div>

              {/* Suspect Comparison */}
              <div className="bg-white p-6 rounded shadow-lg transform -rotate-1">
                <div className="border-b-2 border-blue-500/20 mb-4 pb-1 flex justify-between items-end">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Exhibit B: Suspect {selectedSuspect} (Dictated Sample)</span>
                </div>
                <p className={`leading-relaxed text-gray-800 ${suspects.find(s=>s.id === selectedSuspect).handwritingClass}`} style={selectedSuspect === 4 ? {fontFamily: 'cursive'} : {}}>
                  I did not leave my house tonight. I don't have any money to give you. I walked by the oak tree, but I didn't see anyone watching me. I will call the cops.
                </p>
              </div>
            </div>
            
            <div className="relative z-10 bg-black/40 text-gray-300 text-sm p-3 rounded backdrop-blur-sm mt-2">
              <strong>Analyst Notes on Suspect {selectedSuspect}:</strong> {suspects.find(s=>s.id === selectedSuspect).desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinalReport = ({ answers, setAnswers }) => {
  const handleChange = (e) => {
    setAnswers({...answers, [e.target.name]: e.target.value});
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Official Investigator's Report</h2>
          <p className="text-slate-500 mt-1">Complete all fields below. Click Generate Report to download your final assignment.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
        >
          <Download size={18} /> Generate Report
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20}/> Part 1: Polygraph Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">1. Explain three ways that a polygraph examination can help in the police investigation of a crime. (3 marks)</label>
              <textarea name="q1_polygraph_help" value={answers.q1_polygraph_help} onChange={handleChange} className="w-full border rounded p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1. ...&#10;2. ...&#10;3. ..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">2a. Identify the type of person who may lie repeatedly but who will very likely pass a polygraph. (1 mark)</label>
                <input type="text" name="q2a_pass_type" value={answers.q2a_pass_type} onChange={handleChange} className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block font-medium mb-1">2b. Explain how this type of person is able to pass. (1 mark)</label>
                <input type="text" name="q2b_pass_how" value={answers.q2b_pass_how} onChange={handleChange} className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">3a. The Supreme Court of Canada (1987) ruled polygraph evidence inadmissible. Give two reasons why. (2 marks)</label>
              <textarea name="q3a_sc_reasons" value={answers.q3a_sc_reasons} onChange={handleChange} className="w-full border rounded p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block font-medium mb-1">3b. Do you agree with the Supreme Court's decision? Explain why or why not. (2 marks)</label>
              <textarea name="q3b_sc_agree" value={answers.q3b_sc_agree} onChange={handleChange} className="w-full border rounded p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
          </div>
        </section>

        <hr />

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><PenTool size={20}/> Part 2: Forensic Writing Analysis</h3>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-gray-600 mb-2 italic">Refer to the 'Handwriting Lab' tab for the interactive evidence comparison.</p>
              <label className="block font-medium mb-1">4a. Which suspect do you think is most likely to have written the threatening note? (1 mark)</label>
              <select name="q4_suspect_match" value={answers.q4_suspect_match} onChange={handleChange} className="w-full border rounded p-3 mb-3 bg-white">
                <option value="">Select a suspect...</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={`Suspect ${n}`}>Suspect {n}</option>)}
              </select>
              <label className="block font-medium mb-1">4b. Give two pieces of evidence that indicate this match. (2 marks)</label>
              <textarea name="q4_suspect_evidence" value={answers.q4_suspect_evidence} onChange={handleChange} className="w-full border rounded p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block font-medium mb-1">5. Explain three specific ways forensic experts try to minimize the alteration of a handwriting sample by a suspect (so they cannot disguise it). (3 marks)</label>
              <textarea name="q5_minimize_alteration" value={answers.q5_minimize_alteration} onChange={handleChange} className="w-full border rounded p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
          </div>
        </section>

        <hr />

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20}/> Part 3: Lindbergh Case</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">6. Give two possible reasons that led police to believe the 15 ransom notes were written by the same person. (2 marks)</label>
              <textarea name="q6_lindbergh_same" value={answers.q6_lindbergh_same} onChange={handleChange} className="w-full border rounded p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block font-medium mb-1">7. Based on the case file notes, describe the distinct features of two letters that indicate Hauptmann's samples matched the ransom notes. (2 marks)</label>
              <textarea name="q7_lindbergh_features" value={answers.q7_lindbergh_features} onChange={handleChange} className="w-full border rounded p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Letter 1: ...&#10;Letter 2: ..."></textarea>
            </div>
          </div>
        </section>

        <hr />

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Search size={20}/> Part 4: Crime Case Study #3 - Research</h3>
          <p className="text-sm text-gray-600 mb-4">Do some internet research to find a criminal case in Canada where polygraph testing and/or writing analysis played an important part. (6 marks total)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Describe the case. Where/when did it take place, who was involved? (1 mark)</label>
              <textarea name="q8_research_desc" value={answers.q8_research_desc} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Explain how polygraph/writing analysis played a part. (2 marks)</label>
              <textarea name="q8_research_role" value={answers.q8_research_role} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Were the results reliable? (1 mark)</label>
              <input type="text" name="q8_research_reliable" value={answers.q8_research_reliable} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">What was the conclusion of the case? (1 mark)</label>
              <input type="text" name="q8_research_conclusion" value={answers.q8_research_conclusion} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Include your research sources. (1 mark)</label>
              <input type="text" name="q8_research_sources" value={answers.q8_research_sources} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="URLs or book titles..." />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function App() {
  const [persistedState] = useState(() => readModule6AssignmentState());
  const [activeTab, setActiveTab] = useState(persistedState?.activeTab || 'polygraph');
  const [answers, setAnswers] = useState(
    persistedState?.answers && typeof persistedState.answers === 'object'
      ? { ...INITIAL_ANSWERS, ...persistedState.answers }
      : INITIAL_ANSWERS
  );
  const [polygraphHistory, setPolygraphHistory] = useState(
    Array.isArray(persistedState?.polygraphHistory) ? persistedState.polygraphHistory : []
  );
  const [selectedSuspect, setSelectedSuspect] = useState(
    Number.isFinite(Number(persistedState?.selectedSuspect)) ? Number(persistedState.selectedSuspect) : 4
  );

  useEffect(() => {
    writeModule6AssignmentState({
      activeTab,
      answers,
      polygraphHistory,
      selectedSuspect
    });
  }, [activeTab, answers, polygraphHistory, selectedSuspect]);

  const tabs = [
    { id: 'polygraph', label: 'Polygraph Lab', icon: Activity },
    { id: 'cases', label: 'Case Files', icon: BookOpen },
    { id: 'handwriting', label: 'Handwriting Lab', icon: PenTool },
    { id: 'report', label: 'Final Report', icon: FileText }
  ];

  // Calculate completion percentage
  const totalFields = Object.keys(answers).length;
  const filledFields = Object.values(answers).filter(val => val.trim().length > 0).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <nav className="bg-slate-900 w-full md:w-64 flex-shrink-0 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Search className="text-blue-500" /> Forensic Lab
          </h1>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Interactive Assignment</p>
        </div>
        
        <div className="flex-grow py-4">
          <ul className="space-y-1">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white border-l-4 border-blue-400 font-medium shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400 mb-2 flex justify-between">
            <span>Report Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {progress === 100 && (
             <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Ready to export</p>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 capitalize flex items-center gap-3">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 mt-1">Complete the tasks and transfer findings to your Final Report.</p>
            </div>
            
            <button 
              onClick={() => setActiveTab('report')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
            >
              <User size={16}/> Student Workspace
            </button>
          </header>

          {/* Render Active Tab */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'polygraph' && <PolygraphLab history={polygraphHistory} setHistory={setPolygraphHistory} />}
            {activeTab === 'cases' && <CaseFiles />}
            {activeTab === 'handwriting' && (
              <HandwritingLab selectedSuspect={selectedSuspect} setSelectedSuspect={setSelectedSuspect} />
            )}
            {activeTab === 'report' && <FinalReport answers={answers} setAnswers={setAnswers} />}
          </div>
        </div>
      </main>
    </div>
  );
}
