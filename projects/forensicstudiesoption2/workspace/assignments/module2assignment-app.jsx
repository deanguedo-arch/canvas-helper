import React, { useState, useRef, useEffect } from 'react';
const IconStub = () => null;
const Search = IconStub;
const Shield = IconStub;
const FileText = IconStub;
const Users = IconStub;
const Database = IconStub;
const CheckCircle = IconStub;
const XCircle = IconStub;
const Printer = IconStub;
const Maximize2 = IconStub;
const Crosshair = IconStub;
const Fingerprint = IconStub;
const BookOpen = IconStub;
const ClipboardCheck = IconStub;
const AlertCircle = IconStub;
const MODULE2_ASSET_ROOT = './module2';

// --- DATA CONSTANTS ---
const PATTERN_TYPES = [
  "Plain Whorl", "Central Pocket Whorl", "Double Loop Whorl", "Accidental Whorl",
  "Plain Arch", "Tented Arch", "Radial Loop", "Ulnar Loop"
];

const EVIDENCE_ITEMS = [
  { id: 'ev_note', name: 'Note to Bank Teller', type: 'loop_ulnar' },
  { id: 'ev_bill', name: 'Five Dollar Bill', type: 'whorl_plain' },
  { id: 'ev_glass1', name: 'Glass #1 (Restaurant)', type: 'arch_tented' },
  { id: 'ev_glass2', name: 'Glass #2 (Restaurant)', type: 'loop_radial' }
];

const SUSPECTS = [
  { id: 's_lyons', name: 'Joseph Lyons', desc: 'Male, 5\'10", Brown Hair', bookingId: '394-882A', avatar: `${MODULE2_ASSET_ROOT}/suspect-lyons.svg`, prints: ['loop_ulnar', 'whorl_plain'] },
  { id: 's_banes', name: 'Doug Banes', desc: 'Male, 6\'2", Blonde Hair', bookingId: '992-104B', avatar: `${MODULE2_ASSET_ROOT}/suspect-banes.svg`, prints: ['arch_tented', 'loop_radial'] },
  { id: 's_chapman', name: 'Reynold Chapman', desc: 'Male, 5\'8", Black Hair', bookingId: '112-909C', avatar: `${MODULE2_ASSET_ROOT}/suspect-chapman.svg`, prints: ['whorl_plain', 'whorl_plain'] },
  { id: 's_atkins', name: 'Troy Atkins', desc: 'Male, 6\'0", Red Hair', bookingId: '445-221D', avatar: `${MODULE2_ASSET_ROOT}/suspect-atkins.svg`, prints: ['arch_plain', 'loop_ulnar'] }
];

const CASE_STUDIES = [
  {
    id: 'case1',
    title: 'Crime Case 1: Hit-and-Run',
    scenario: 'One night a hit-and-run collision occurs; a vehicle that lost control at an intersection strikes a parked car. The suspected vehicle speeds away after the collision. Although a license plate number was not obtained, a witness noted that the suspected vehicle was a blue half-ton truck. In addition to fragments of blue paint, police officers find one half of a distinctive plastic license plate frame at the scene and determine that it does not belong to the victim’s car. Several hours after the collision, police officers find a damaged blue half-ton truck that has half a plastic license plate frame that matches the fragments of frame found at the earlier collision.',
    questions: [
      { id: 'q1_1', label: 'Is the license plate frame Individualized or Identified?', type: 'select', options: ['Individualized', 'Identified'] },
      { id: 'q1_2', label: 'Explain the plate evidence classification with details from the scenario:', type: 'textarea' },
      { id: 'q1_3', label: 'What type of physical evidence are the paint fragments?', type: 'select', options: ['Individualized', 'Identified'] },
      { id: 'q1_4', label: 'Explain the paint evidence classification:', type: 'textarea' }
    ]
  },
  {
    id: 'case2',
    title: 'Crime Case 2: Red Cotton Fibers',
    scenario: 'Several red cotton fibres are found upon the ledge of a window that had been broken to gain entry into a home. A person wearing a torn red cotton jacket is apprehended nearby. Tests conducted later show that the fibres from the crime scene and the fibres from the person’s jacket have identical physical properties.',
    questions: [
      { id: 'q2_1', label: 'Explain why the jacket would be considered identified evidence rather than individualized:', type: 'textarea' }
    ]
  },
  {
    id: 'case3',
    title: 'Crime Case 3: Laci Peterson Case',
    scenario: "Laci Peterson was a 27 year-old woman from Modesto, California, who was eight months pregnant at the time of her disappearance on Christmas Eve 2002. Despite an extensive search, not until four months later were the bodies of Laci and her unborn child found off the coast of the San Francisco Bay. After a two-month investigation, Laci' s husband, Scott Peterson, was charged with two counts of murder. At Scott Peterson's criminal trial, the prosecution team presented only one piece of physical evidence while the remainder of their evidence was based on his actions, unusual behaviors, and conversations with others. The one piece of physical evidence submitted at trial was a human hair found on a pair of pliers in a boat that Scott had secretly purchased and hidden in a warehouse. Forensic DNA analysis of the hair indicated that the mitochondrial DNA (mtDNA) within the hair matched the mtDNA of Laci Peterson. Scott Peterson's defense team argued that mtDNA analysis was not as reliable as nuclear DNA testing and that the evidence was mishandled and tampered with as two hairs had actually been presented at the trial. The prosecution team fought back by arguing that analysis of mtDNA has been an accepted scientific method for over twenty years. They concluded by pointing out that the hair had not been mishandled or tampered with; it simply broke into two pieces within the container in which it had been enclosed. This single piece of physical evidence, combined with other circumstantial evidence from the trial, proved to be credible. On December 13, 2004, a jury found Scott Peterson guilty of murdering his wife and unborn child and sentenced him to death by lethal injection.",
    questions: [
      { id: 'q3_1', label: 'State how the Prosecution would have categorized the hair (Justify):', type: 'textarea' },
      { id: 'q3_2', label: 'State how the Defense Team would have categorized the hair (Justify):', type: 'textarea' },
      { id: 'q3_3', label: 'State how the Jury would have categorized the hair (Justify):', type: 'textarea' },
      { id: 'q3_4', label: 'Why was this single piece of physical evidence useful in helping the jury convict Scott Peterson?', type: 'textarea' }
    ]
  }
];

// --- REALISTIC FINGERPRINT COMPONENT ---
const FingerprintGraphic = ({ pattern, showOverlay, className = "w-48 h-48" }) => {
  const BASE_IMAGES = {
    whorl: `${MODULE2_ASSET_ROOT}/Whorl.png`,
    loop: `${MODULE2_ASSET_ROOT}/Loop.png`,
    arch: `${MODULE2_ASSET_ROOT}/PlainArch.png`
  };

  const PATTERN_CONFIG = {
    'Plain Whorl': { src: BASE_IMAGES.whorl, transform: 'scale(1)', markers: [{ type: 'core', top: '48%', left: '48%' }, { type: 'delta', top: '75%', left: '20%' }, { type: 'delta', top: '72%', left: '80%' }] },
    'Central Pocket Whorl': { src: BASE_IMAGES.whorl, transform: 'scale(1.2) rotate(15deg)', markers: [{ type: 'core', top: '48%', left: '48%' }, { type: 'delta', top: '75%', left: '20%' }, { type: 'delta', top: '72%', left: '80%' }] },
    'Double Loop Whorl': { src: BASE_IMAGES.whorl, transform: 'scale(-1, 1) rotate(20deg)', markers: [{ type: 'core', top: '48%', left: '48%' }, { type: 'delta', top: '75%', left: '20%' }, { type: 'delta', top: '72%', left: '80%' }] },
    'Accidental Whorl': { src: BASE_IMAGES.whorl, transform: 'scale(1, -1) rotate(-10deg)', markers: [{ type: 'core', top: '48%', left: '48%' }, { type: 'delta', top: '75%', left: '20%' }, { type: 'delta', top: '72%', left: '80%' }] },
    'Ulnar Loop': { src: BASE_IMAGES.loop, transform: 'scale(1)', markers: [{ type: 'core', top: '45%', left: '45%' }, { type: 'delta', top: '75%', left: '18%' }] },
    'Radial Loop': { src: BASE_IMAGES.loop, transform: 'scale(-1, 1)', markers: [{ type: 'core', top: '45%', left: '45%' }, { type: 'delta', top: '75%', left: '18%' }] },
    'Plain Arch': { src: BASE_IMAGES.arch, transform: 'scale(1)', markers: [] },
    'Tented Arch': { src: BASE_IMAGES.arch, transform: 'scaleX(0.7) scaleY(1.2)', markers: [] }
  };

  PATTERN_CONFIG['whorl_plain'] = PATTERN_CONFIG['Plain Whorl'];
  PATTERN_CONFIG['loop_ulnar'] = PATTERN_CONFIG['Ulnar Loop'];
  PATTERN_CONFIG['loop_radial'] = PATTERN_CONFIG['Radial Loop'];
  PATTERN_CONFIG['arch_plain'] = PATTERN_CONFIG['Plain Arch'];
  PATTERN_CONFIG['arch_tented'] = PATTERN_CONFIG['Tented Arch'];

  const config = PATTERN_CONFIG[pattern] || PATTERN_CONFIG['Plain Whorl'];
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-slate-400 shadow-inner ${className}`}>
       {!imgError ? (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: config.transform, transition: 'transform 0.3s ease' }}>
               <img 
                  src={config.src} 
                  alt={pattern}
                  className="absolute min-w-[150%] min-h-[150%] object-cover opacity-85 mix-blend-multiply"
                  style={{ filter: 'contrast(1.5) sepia(0.2) brightness(0.9) grayscale(1)' }}
                  onError={() => setImgError(true)}
               />
               {showOverlay && config.markers.map((m, i) => (
                   <div 
                       key={i}
                       className={`absolute w-8 h-8 rounded-full border-[3px] transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-xl ${
                           m.type === 'core' ? 'bg-red-500/30 border-red-500 shadow-red-500/50' : 'bg-blue-500/30 border-blue-500 shadow-blue-500/50'
                       }`}
                       style={{ top: m.top, left: m.left }}
                   >
                       <div className="absolute inset-0 rounded-full animate-ping opacity-60 border-2 border-inherit"></div>
                   </div>
               ))}
           </div>
       ) : (
           <div className="text-center p-4 text-slate-500">
              <Fingerprint size={48} className="mx-auto mb-2 opacity-50" />
              <span className="text-xs font-mono">ASSET OFFLINE</span>
           </div>
       )}
       {showOverlay && !imgError && config.markers.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
               <div className="bg-black/80 text-yellow-400 text-sm font-mono px-4 py-2 rounded-lg border border-yellow-400 backdrop-blur-sm">
                   NO TRUE CORE/DELTA
               </div>
           </div>
       )}
       {showOverlay && !imgError && (
          <div className="absolute top-3 right-3 text-xs bg-slate-900/95 text-slate-200 px-3 py-2 rounded shadow flex flex-col gap-2 border border-slate-700 z-30">
            <span className="flex items-center gap-2 font-bold"><span className="w-3 h-3 rounded-full bg-red-500 border border-red-300 inline-block"></span> CORE</span>
            <span className="flex items-center gap-2 font-bold"><span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300 inline-block"></span> DELTA</span>
          </div>
       )}
       <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20 pointer-events-none mix-blend-multiply rounded-lg"></div>
    </div>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState('training');
  const [trainingData, setTrainingData] = useState(PATTERN_TYPES.reduce((acc, type) => ({ ...acc, [type]: { definition: '', source: '' } }), {}));
  const [selectedTrainingPattern, setSelectedTrainingPattern] = useState(PATTERN_TYPES[0]);
  const [showOverlay, setShowOverlay] = useState(false);
  
  // States for second assignment
  const [theoryAnswers, setTheoryAnswers] = useState({ altered: '', reliability: '', elements: '', latent: '' });
  const [caseAnswers, setCaseAnswers] = useState({});

  const [evidenceTags, setEvidenceTags] = useState({});
  const [suspectTags, setSuspectTags] = useState({});
  const [afisLeft, setAfisLeft] = useState(null);
  const [afisRight, setAfisRight] = useState(null);
  const [reportData, setReportData] = useState({ guilty1: '', guilty2: '', handImportance: '', evidenceExplanation: '' });

  const handleTrainingUpdate = (type, field, value) => {
    setTrainingData(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const renderNav = () => (
    <nav className="bg-slate-900 border-b border-cyan-900 p-4 flex gap-2 overflow-x-auto no-scrollbar print:hidden">
      <div className="flex items-center text-cyan-400 font-bold text-xl mr-8 whitespace-nowrap">
        <Shield className="mr-2" /> AFIS V2.5
      </div>
      {[
        { id: 'training', icon: <BookOpen size={18}/>, label: '1. Training' },
        { id: 'cases', icon: <ClipboardCheck size={18}/>, label: '2. Case Studies' },
        { id: 'evidence', icon: <Search size={18}/>, label: '3. Evidence' },
        { id: 'suspects', icon: <Users size={18}/>, label: '4. Suspects' },
        { id: 'report', icon: <Database size={18}/>, label: '5. Report' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors whitespace-nowrap ${
            activeTab === tab.id ? 'bg-cyan-900 text-cyan-100 border border-cyan-500' : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-300'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </nav>
  );

  const renderTraining = () => (
    <div className="flex h-full animate-fadeIn overflow-hidden">
      <div className="w-1/3 border-r border-slate-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Pattern Training</h2>
        <div className="space-y-2 mb-8">
          {PATTERN_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedTrainingPattern(type)}
              className={`w-full text-left px-4 py-3 rounded ${selectedTrainingPattern === type ? 'bg-cyan-900 border-l-4 border-cyan-400 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {type}
              {trainingData[type].definition && <CheckCircle size={14} className="inline float-right mt-1 text-green-400" />}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <AlertCircle size={18} className="text-yellow-400"/> Fingerprint Theory
        </h2>
        <div className="space-y-4 pr-2">
            <div>
                <label className="text-xs font-bold text-slate-400">Can fingerprints be altered or disguised? Explain thoroughly:</label>
                <textarea value={theoryAnswers.altered} onChange={e => setTheoryAnswers({...theoryAnswers, altered: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 mt-1" rows="2"/>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400">How reliable is fingerprint identification? (Include specific examples):</label>
                <textarea value={theoryAnswers.reliability} onChange={e => setTheoryAnswers({...theoryAnswers, reliability: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 mt-1" rows="2"/>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400">Identify two specific elements (parts) analyzed:</label>
                <textarea value={theoryAnswers.elements} onChange={e => setTheoryAnswers({...theoryAnswers, elements: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 mt-1" rows="2"/>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400">What is a Latent Print & how is it collected?</label>
                <textarea value={theoryAnswers.latent} onChange={e => setTheoryAnswers({...theoryAnswers, latent: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 mt-1" rows="2"/>
            </div>
        </div>
      </div>
      <div className="w-2/3 p-8 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-400">{selectedTrainingPattern}</h2>
          <button onClick={() => setShowOverlay(!showOverlay)} className={`px-4 py-2 rounded flex items-center gap-2 font-bold ${showOverlay ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
            <Crosshair size={18} /> {showOverlay ? 'Scanner: ON' : 'Scanner: OFF'}
          </button>
        </div>
        <div className="flex justify-center p-8 bg-slate-800 rounded-xl border border-slate-600 shadow-inner">
           <FingerprintGraphic pattern={selectedTrainingPattern} showOverlay={showOverlay} className="w-64 h-64" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-sm">DEFINITION RECORD:</label>
            <textarea value={trainingData[selectedTrainingPattern].definition} onChange={(e) => handleTrainingUpdate(selectedTrainingPattern, 'definition', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 h-32" placeholder="Research and type the definition here..."/>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-sm">SOURCE CITATION:</label>
            <input type="text" value={trainingData[selectedTrainingPattern].source} onChange={(e) => handleTrainingUpdate(selectedTrainingPattern, 'source', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:border-cyan-500" placeholder="URL or Book Title..."/>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCases = () => (
    <div className="p-8 h-full overflow-y-auto animate-fadeIn max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Individualized & Identified Evidence</h2>
        <p className="text-slate-400 mb-8 font-mono border-b border-slate-700 pb-4">Read the following real-world scenarios and classify the physical evidence.</p>
        
        <div className="space-y-12 pb-20">
            {CASE_STUDIES.map(caseStudy => (
                <div key={caseStudy.id} className="bg-slate-800 border-l-4 border-cyan-600 rounded-r-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">{caseStudy.title}</h3>
                    <div className="bg-slate-950/50 p-4 rounded mb-6 text-slate-300 leading-relaxed italic border border-slate-700/50 text-sm">
                        {caseStudy.scenario}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {caseStudy.questions.map(q => (
                            <div key={q.id}>
                                <label className="block text-sm font-bold text-slate-400 mb-2">{q.label}</label>
                                {q.type === 'select' ? (
                                    <select 
                                        value={caseAnswers[q.id] || ''} 
                                        onChange={e => setCaseAnswers({...caseAnswers, [q.id]: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                                    >
                                        <option value="">-- Select --</option>
                                        {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <textarea 
                                        value={caseAnswers[q.id] || ''} 
                                        onChange={e => setCaseAnswers({...caseAnswers, [q.id]: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                                        rows="3"
                                        placeholder="Justify with details from the scenario..."
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderEvidence = () => (
    <div className="p-8 h-full overflow-y-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2"><Search className="text-cyan-400"/> Crime Scene Evidence Tags</h2>
      <p className="text-slate-400 mb-8">Analyze the prints lifted from the bank heist. Use the dropdown to tag the pattern type.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EVIDENCE_ITEMS.map((item) => (
          <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex gap-6 hover:border-cyan-700 transition-colors">
            <div className="group relative cursor-crosshair shrink-0">
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 scale-105"></div>
              <FingerprintGraphic pattern={item.type} className="w-32 h-32" />
              <div className="mt-2 text-center text-xs text-slate-500 font-mono">ENHANCE <Maximize2 size={12} className="inline"/></div>
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h3 className="text-xl font-bold text-slate-200 mb-1 truncate">{item.name}</h3>
              <p className="text-slate-500 text-sm font-mono mb-4">ITEM ID: #{item.id.toUpperCase()}</p>
              <label className="block text-cyan-400 text-xs font-bold mb-2">IDENTIFIED PATTERN:</label>
              <select value={evidenceTags[item.id] || ''} onChange={(e) => setEvidenceTags(prev => ({ ...prev, [item.id]: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:border-cyan-500">
                <option value="">-- Select Pattern --</option>
                {PATTERN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {evidenceTags[item.id] && <div className="mt-3 text-xs text-green-400 flex items-center gap-1 font-mono bg-green-900/20 p-2 rounded truncate"><CheckCircle size={14}/> Logged in Database</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuspects = () => (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="h-2/5 border-b border-slate-700 bg-slate-950 p-4 flex flex-col">
        <h2 className="text-sm font-mono text-cyan-500 mb-2 flex items-center justify-between">
          <span>AFIS COMPARISON TERMINAL</span>
          <span className="text-slate-500 text-[10px] hidden sm:inline">Select suspect prints below to load into terminal</span>
        </h2>
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 border border-slate-800 rounded bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            {afisLeft ? <FingerprintGraphic pattern={afisLeft.type} className="w-48 h-48 scale-150 opacity-80 mix-blend-screen" /> : <div className="text-slate-700 font-mono text-xs">EVIDENCE BUFFER</div>}
            {afisLeft && <div className="absolute bottom-2 left-0 w-full text-center text-cyan-400 font-bold bg-black/50 py-1 z-20 text-xs">{afisLeft.name}</div>}
          </div>
          <div className="w-8 flex flex-col items-center justify-center"><Search className="text-cyan-600 w-4 h-4" /></div>
          <div className="flex-1 border border-slate-800 rounded bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            {afisRight ? <FingerprintGraphic pattern={afisRight.type} className="w-48 h-48 scale-150 opacity-80 mix-blend-screen" /> : <div className="text-slate-700 font-mono text-xs">SUSPECT BUFFER</div>}
            {afisRight && <div className="absolute bottom-2 left-0 w-full text-center text-red-400 font-bold bg-black/50 py-1 z-20 text-xs">{afisRight.name}</div>}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SUSPECTS.map((suspect) => (
            <div key={suspect.id} className="bg-slate-800 border border-slate-700 rounded p-4 flex gap-4">
              <div className="w-24 h-28 bg-slate-700 rounded-sm flex flex-col items-center justify-center text-slate-500 border border-slate-500 overflow-hidden shrink-0 relative shadow-md">
                <img src={suspect.avatar} alt={suspect.name} className="w-full h-full object-cover z-10" style={{ filter: 'contrast(1.1) brightness(0.95)' }} />
                <div className="absolute bottom-1.5 w-11/12 bg-black/90 border border-white/30 flex flex-col items-center justify-center z-20 py-0.5 rounded-sm">
                    <span className="text-[5px] text-white/70 font-mono tracking-widest leading-none mb-0.5 uppercase">Booking ID</span>
                    <span className="text-[9px] text-white font-mono font-bold leading-none">{suspect.bookingId}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-200 truncate">{suspect.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mb-2 truncate uppercase">{suspect.desc}</p>
                <div className="flex gap-2">
                  {[0, 1].map((printIdx) => (
                    <div key={printIdx} className="flex-1 bg-slate-900 p-2 rounded border border-slate-700">
                      <div className="cursor-pointer hover:ring-2 hover:ring-red-500 rounded flex justify-center bg-slate-200 mb-2 overflow-hidden" onClick={() => setAfisRight({ name: `${suspect.name} - P${printIdx + 1}`, type: suspect.prints[printIdx] })}>
                         <FingerprintGraphic pattern={suspect.prints[printIdx]} className="w-12 h-12" />
                      </div>
                      <select value={suspectTags[suspect.id]?.[printIdx] || ''} onChange={(e) => setSuspectTags(prev => ({ ...prev, [suspect.id]: { ...(prev[suspect.id] || {}), [printIdx]: e.target.value } }))} className="w-full bg-slate-800 border border-slate-600 rounded p-0.5 text-[10px] text-slate-200">
                        <option value="">Tag...</option>
                        {PATTERN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 bg-slate-800 border border-cyan-700 p-2 rounded-lg shadow-xl shadow-black z-50">
        <h4 className="text-[10px] font-bold text-cyan-400 mb-2 font-mono uppercase text-center">Quick Load</h4>
        <div className="flex gap-2">
          {EVIDENCE_ITEMS.map(item => (
             <button key={item.id} onClick={() => setAfisLeft({ name: item.name, type: item.type })} className="p-1 bg-slate-900 rounded border border-slate-600 hover:border-cyan-400 transition-all">
                <FingerprintGraphic pattern={item.type} className="w-8 h-8" />
             </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="p-8 h-full overflow-y-auto animate-fadeIn bg-slate-100 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-2xl rounded">
        <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Integrated Forensics Report</h1><p className="text-slate-500 font-mono mt-2 tracking-widest">DEPT. OF FORENSICS // CASE CONSOLIDATION</p></div>
          <button onClick={() => window.print()} className="print:hidden bg-slate-900 text-white px-4 py-2 rounded shadow hover:bg-slate-800 flex items-center gap-2 font-bold"><Printer size={18}/> Print Report</button>
        </div>
        
        <div className="space-y-10">
          <section>
            <h3 className="text-xl font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-900">I. Fingerprint Analysis Training</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
                {PATTERN_TYPES.map(p => (
                    <div key={p} className="border p-2 rounded">
                        <span className="font-bold text-slate-700">{p}:</span> {trainingData[p].definition || <span className="text-red-400 italic">No record entered</span>}
                    </div>
                ))}
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded border text-sm italic">
                <strong>Forensic Theory Summary:</strong><br/>
                Alteration: {theoryAnswers.altered || '...'} <br/>
                Reliability: {theoryAnswers.reliability || '...'} <br/>
                Latent: {theoryAnswers.latent || '...'}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-900">II. Evidence Classification (Case Studies)</h3>
            <div className="space-y-4 text-sm">
                <div className="border p-3 rounded">
                    <strong>Hit-and-Run Plate Frame:</strong> {caseAnswers.q1_1} — {caseAnswers.q1_2}
                </div>
                <div className="border p-3 rounded">
                    <strong>Hit-and-Run Paint:</strong> {caseAnswers.q1_3} — {caseAnswers.q1_4}
                </div>
                <div className="border p-3 rounded">
                    <strong>Jacket Classification:</strong> {caseAnswers.q2_1}
                </div>
                <div className="border p-3 rounded bg-slate-50">
                    <strong>Peterson Case Summary:</strong> Prosecution ({caseAnswers.q3_1}), Defense ({caseAnswers.q3_2}), Jury ({caseAnswers.q3_3})
                </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-900">III. Suspect Identification (Bank Heist)</h3>
            <div className="flex gap-4 mb-6">
              {['guilty1', 'guilty2'].map(field => (
                <div key={field} className="flex-1">
                  <label className="block text-xs font-bold mb-1 uppercase text-slate-500">{field === 'guilty1' ? 'Identified Suspect 1' : 'Identified Suspect 2'}:</label>
                  <select value={reportData[field]} onChange={e => setReportData({...reportData, [field]: e.target.value})} className="w-full border-2 border-slate-300 rounded p-2 bg-white font-bold">
                    <option value="">Select...</option>
                    {SUSPECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Evidence Summary Justification:</label>
            <textarea value={reportData.evidenceExplanation} onChange={e => setReportData({...reportData, evidenceExplanation: e.target.value})} className="w-full border-2 border-slate-300 rounded p-3 h-32" placeholder="List three specific evidentiary links found in the AFIS terminal..."/>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } 
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {renderNav()}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'training' && renderTraining()}
        {activeTab === 'cases' && renderCases()}
        {activeTab === 'evidence' && renderEvidence()}
        {activeTab === 'suspects' && renderSuspects()}
        {activeTab === 'report' && renderReport()}
      </main>
    </div>
  );
}
