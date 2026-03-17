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
  { id: 's_lyons', name: 'Joseph Lyons', desc: 'Male, 5\'10", Brown Hair', bookingId: '394-882A', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=250&auto=format&fit=crop', prints: ['loop_ulnar', 'whorl_plain'] },
  { id: 's_banes', name: 'Doug Banes', desc: 'Male, 6\'2", Brown Hair', bookingId: '992-104B', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=250&auto=format&fit=crop', prints: ['arch_tented', 'loop_radial'] },
  { id: 's_chapman', name: 'Reynold Chapman', desc: 'Male, 5\'8", Black Hair', bookingId: '112-909C', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=250&auto=format&fit=crop', prints: ['whorl_plain', 'whorl_plain'] },
  { id: 's_atkins', name: 'Troy Atkins', desc: 'Male, 6\'0", Black Hair', bookingId: '445-221D', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200&h=250&auto=format&fit=crop', prints: ['arch_plain', 'loop_ulnar'] }
];

// --- REALISTIC FINGERPRINT COMPONENT ---
// Uses actual forensic photographs and CSS manipulation to simulate the 8 patterns
const FingerprintGraphic = ({ pattern, showOverlay, className = "w-48 h-48" }) => {
  // Base realistic images from public domain forensic archives
  const BASE_IMAGES = {
    whorl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Fingerprint_Whorl.jpg/400px-Fingerprint_Whorl.jpg',
    loop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Fingerprint_Loop.jpg/400px-Fingerprint_Loop.jpg',
    arch: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Fingerprint_Arch.jpg/400px-Fingerprint_Arch.jpg'
  };

  // Configuration maps logical forensic patterns to base images + CSS manipulations
  const PATTERN_CONFIG = {
    'Plain Whorl': {
        src: BASE_IMAGES.whorl,
        transform: 'scale(1)',
        markers: [
            { type: 'core', top: '48%', left: '48%' },
            { type: 'delta', top: '75%', left: '20%' },
            { type: 'delta', top: '72%', left: '80%' }
        ]
    },
    'Central Pocket Whorl': {
        src: BASE_IMAGES.whorl,
        transform: 'scale(1.2) rotate(15deg)',
        markers: [
            { type: 'core', top: '48%', left: '48%' },
            { type: 'delta', top: '75%', left: '20%' },
            { type: 'delta', top: '72%', left: '80%' }
        ]
    },
    'Double Loop Whorl': {
        src: BASE_IMAGES.whorl,
        transform: 'scale(-1, 1) rotate(20deg)', 
        markers: [
            { type: 'core', top: '48%', left: '48%' },
            { type: 'delta', top: '75%', left: '20%' },
            { type: 'delta', top: '72%', left: '80%' }
        ]
    },
    'Accidental Whorl': {
        src: BASE_IMAGES.whorl,
        transform: 'scale(1, -1) rotate(-10deg)', 
        markers: [
            { type: 'core', top: '48%', left: '48%' },
            { type: 'delta', top: '75%', left: '20%' },
            { type: 'delta', top: '72%', left: '80%' }
        ]
    },
    'Ulnar Loop': {
        src: BASE_IMAGES.loop,
        transform: 'scale(1)',
        markers: [
            { type: 'core', top: '45%', left: '45%' },
            { type: 'delta', top: '75%', left: '18%' }
        ]
    },
    'Radial Loop': {
        src: BASE_IMAGES.loop,
        transform: 'scale(-1, 1)', // Flips it horizontally
        markers: [
            { type: 'core', top: '45%', left: '45%' },
            { type: 'delta', top: '75%', left: '18%' }
        ]
    },
    'Plain Arch': {
        src: BASE_IMAGES.arch,
        transform: 'scale(1)',
        markers: [] // No true core/delta
    },
    'Tented Arch': {
        src: BASE_IMAGES.arch,
        transform: 'scaleX(0.7) scaleY(1.2)', // Squeezes horizontally to create a "tent" peak
        markers: []
    }
  };

  // Aliases used in evidence/suspect databases
  PATTERN_CONFIG['whorl_plain'] = PATTERN_CONFIG['Plain Whorl'];
  PATTERN_CONFIG['loop_ulnar'] = PATTERN_CONFIG['Ulnar Loop'];
  PATTERN_CONFIG['loop_radial'] = PATTERN_CONFIG['Radial Loop'];
  PATTERN_CONFIG['arch_plain'] = PATTERN_CONFIG['Plain Arch'];
  PATTERN_CONFIG['arch_tented'] = PATTERN_CONFIG['Tented Arch'];

  const config = PATTERN_CONFIG[pattern] || PATTERN_CONFIG['Plain Whorl'];
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-slate-400 shadow-inner ${className}`}>
       {!imgError ? (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: config.transform, transition: 'transform 0.3s ease' }}>
               {/* Realistic Image from public domain databases */}
               <img 
                  src={config.src} 
                  alt={pattern}
                  className="absolute min-w-[150%] min-h-[150%] object-cover opacity-85 mix-blend-multiply"
                  style={{ filter: 'contrast(1.5) sepia(0.2) brightness(0.9) grayscale(1)' }}
                  onError={() => setImgError(true)}
               />
               
               {/* Core & Delta Markers */}
               {showOverlay && config.markers.map((m, i) => (
                   <div 
                       key={i}
                       className={`absolute w-8 h-8 rounded-full border-[3px] transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-xl ${
                           m.type === 'core' 
                              ? 'bg-red-500/30 border-red-500 shadow-red-500/50' 
                              : 'bg-blue-500/30 border-blue-500 shadow-blue-500/50'
                       }`}
                       style={{ top: m.top, left: m.left }}
                   >
                       {/* Pulsing effect */}
                       <div className="absolute inset-0 rounded-full animate-ping opacity-60 border-2 border-inherit"></div>
                   </div>
               ))}
           </div>
       ) : (
           <div className="text-center p-4 text-slate-500">
              <Fingerprint size={48} className="mx-auto mb-2 opacity-50" />
              <span className="text-xs font-mono">IMG_ERROR</span>
           </div>
       )}

       {/* Arch specific message */}
       {showOverlay && !imgError && config.markers.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
               <div className="bg-black/80 text-yellow-400 text-sm font-mono px-4 py-2 rounded-lg border border-yellow-400 backdrop-blur-sm">
                   NO TRUE CORE/DELTA
               </div>
           </div>
       )}
       
       {/* Static Legend Container overlay */}
       {showOverlay && !imgError && (
          <div className="absolute top-3 right-3 text-xs bg-slate-900/95 text-slate-200 px-3 py-2 rounded shadow flex flex-col gap-2 border border-slate-700 z-30">
            <span className="flex items-center gap-2 font-bold"><span className="w-3 h-3 rounded-full bg-red-500 border border-red-300 inline-block shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> CORE</span>
            <span className="flex items-center gap-2 font-bold"><span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300 inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> DELTA</span>
          </div>
       )}
       
       {/* Grime overlay to make it look like an old evidence card */}
       <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20 pointer-events-none mix-blend-multiply rounded-lg"></div>
    </div>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState('training');
  
  // State for Phase 1 (Training)
  const [trainingData, setTrainingData] = useState(
    PATTERN_TYPES.reduce((acc, type) => ({ ...acc, [type]: { definition: '' } }), {})
  );
  const [selectedTrainingPattern, setSelectedTrainingPattern] = useState(PATTERN_TYPES[0]);
  const [showOverlay, setShowOverlay] = useState(false);

  // State for Phase 2 & 3 (Evidence & Suspects)
  const [evidenceTags, setEvidenceTags] = useState({});
  const [suspectTags, setSuspectTags] = useState({});
  
  // AFIS Comparison State
  const [afisLeft, setAfisLeft] = useState(null);
  const [afisRight, setAfisRight] = useState(null);

  // State for Phase 4 (Report)
  const [reportData, setReportData] = useState({
    guilty1: '', guilty2: '', handImportance: '', evidenceExplanation: ''
  });

  // --- HANDLERS ---
  const handleTrainingUpdate = (type, field, value) => {
    setTrainingData(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const handleEvidenceTag = (id, value) => {
    setEvidenceTags(prev => ({ ...prev, [id]: value }));
  };

  const handleSuspectTag = (suspectId, printIndex, value) => {
    setSuspectTags(prev => ({
      ...prev,
      [suspectId]: { ...(prev[suspectId] || {}), [printIndex]: value }
    }));
  };

  // --- RENDERERS ---
  const renderNav = () => (
    <nav className="bg-slate-900 border-b border-cyan-900 p-4 flex gap-4 print:hidden">
      <div className="flex items-center text-cyan-400 font-bold text-xl mr-8">
        <Shield className="mr-2" /> AFIS Terminal V2.0
      </div>
      {[
        { id: 'training', icon: <FileText size={18}/>, label: '1. Training Manual' },
        { id: 'evidence', icon: <Search size={18}/>, label: '2. Evidence Locker' },
        { id: 'suspects', icon: <Users size={18}/>, label: '3. Suspect Database' },
        { id: 'report', icon: <Database size={18}/>, label: '4. Final Report' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            activeTab === tab.id 
              ? 'bg-cyan-900 text-cyan-100 border border-cyan-500' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-300'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </nav>
  );

  const renderTraining = () => (
    <div className="flex h-full animate-fadeIn">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-slate-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Fingerprint Classes</h2>
        <div className="space-y-2">
          {PATTERN_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedTrainingPattern(type)}
              className={`w-full text-left px-4 py-3 rounded ${
                selectedTrainingPattern === type 
                  ? 'bg-cyan-900 border-l-4 border-cyan-400 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type}
              {trainingData[type].definition && <CheckCircle size={14} className="inline float-right mt-1 text-green-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-cyan-400">{selectedTrainingPattern}</h2>
          <button 
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-4 py-2 rounded flex items-center gap-2 font-bold ${showOverlay ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
          >
            <Crosshair size={18} /> {showOverlay ? 'Scanner: ON' : 'Scanner: OFF'}
          </button>
        </div>

        <div className="flex justify-center p-8 bg-slate-800 rounded-xl border border-slate-600 shadow-inner">
           <FingerprintGraphic pattern={selectedTrainingPattern} showOverlay={showOverlay} className="w-64 h-64" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-sm">DEFINITION RECORD:</label>
            <textarea 
              value={trainingData[selectedTrainingPattern].definition}
              onChange={(e) => handleTrainingUpdate(selectedTrainingPattern, 'definition', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 h-32"
              placeholder="Research and type the definition here..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvidence = () => (
    <div className="p-8 h-full overflow-y-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
        <Search className="text-cyan-400"/> Crime Scene Evidence Tags
      </h2>
      <p className="text-slate-400 mb-8">Analyze the prints lifted from the crime scene. Use the dropdown to tag the pattern type. *Assume all prints are from a right hand.*</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EVIDENCE_ITEMS.map((item) => (
          <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex gap-6 hover:border-cyan-700 transition-colors">
            <div className="group relative cursor-crosshair">
              {/* Fake Magnifying Glass Hover Effect */}
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 scale-105"></div>
              <FingerprintGraphic pattern={item.type} className="w-32 h-32" />
              <div className="mt-2 text-center text-xs text-slate-500 font-mono">ENHANCE <Maximize2 size={12} className="inline"/></div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-200 mb-1">{item.name}</h3>
              <p className="text-slate-500 text-sm font-mono mb-4">ITEM ID: #{item.id.toUpperCase()}</p>
              
              <label className="block text-cyan-400 text-xs font-bold mb-2">IDENTIFIED PATTERN:</label>
              <select 
                value={evidenceTags[item.id] || ''}
                onChange={(e) => handleEvidenceTag(item.id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:border-cyan-500"
              >
                <option value="">-- Select Pattern --</option>
                {PATTERN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              
              {evidenceTags[item.id] && (
                <div className="mt-3 text-xs text-green-400 flex items-center gap-1 font-mono bg-green-900/20 p-2 rounded">
                  <CheckCircle size={14}/> Logged in Database
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuspects = () => (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* Top: AFIS COMPARISON */}
      <div className="h-1/2 border-b border-slate-700 bg-slate-950 p-4 flex flex-col">
        <h2 className="text-sm font-mono text-cyan-500 mb-2 flex items-center justify-between">
          <span>AFIS COMPARISON TERMINAL</span>
          <span className="text-slate-500">Select prints below to load into terminal</span>
        </h2>
        <div className="flex-1 flex gap-4">
          <div className="flex-1 border border-slate-800 rounded bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 left-2 text-xs font-mono text-slate-500">EVIDENCE BUFFER</div>
            {afisLeft ? (
              <FingerprintGraphic pattern={afisLeft.type} className="w-48 h-48 scale-150 opacity-80 mix-blend-screen" />
            ) : (
              <div className="text-slate-700 font-mono">AWAITING INPUT</div>
            )}
            {afisLeft && <div className="absolute bottom-2 left-0 w-full text-center text-cyan-400 font-bold bg-black/50 py-1">{afisLeft.name}</div>}
          </div>
          
          <div className="w-12 flex flex-col items-center justify-center gap-2">
            <div className="h-full w-px bg-slate-800"></div>
            <Search className="text-cyan-600" />
            <div className="h-full w-px bg-slate-800"></div>
          </div>

          <div className="flex-1 border border-slate-800 rounded bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-xs font-mono text-slate-500">SUSPECT BUFFER</div>
            {afisRight ? (
              <FingerprintGraphic pattern={afisRight.type} className="w-48 h-48 scale-150 opacity-80 mix-blend-screen" />
            ) : (
              <div className="text-slate-700 font-mono">AWAITING INPUT</div>
            )}
            {afisRight && <div className="absolute bottom-2 left-0 w-full text-center text-red-400 font-bold bg-black/50 py-1">{afisRight.name}</div>}
          </div>
        </div>
      </div>

      {/* Bottom: Database */}
      <div className="h-1/2 p-4 overflow-y-auto bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SUSPECTS.map((suspect) => (
            <div key={suspect.id} className="bg-slate-800 border border-slate-700 rounded p-4 flex gap-4">
              <div className="w-28 h-32 bg-slate-700 rounded-sm flex flex-col items-center justify-center text-slate-500 border border-slate-500 overflow-hidden shrink-0 relative shadow-md">
                {suspect.avatar ? (
                  <>
                    <img 
                      src={suspect.avatar} 
                      alt={`Mugshot of ${suspect.name}`} 
                      className="w-full h-full object-cover z-10"
                      style={{ filter: 'contrast(1.1) brightness(0.95)' }} 
                    />
                    {/* Booking Plate Overlay */}
                    <div className="absolute bottom-2 w-11/12 bg-black/90 border border-white/30 flex flex-col items-center justify-center z-20 py-0.5 rounded-sm shadow-lg">
                        <span className="text-[6px] text-white/70 font-mono tracking-widest leading-none mb-0.5">POLICE DEPT</span>
                        <span className="text-[10px] text-white font-mono font-bold leading-none">{suspect.bookingId}</span>
                    </div>
                  </>
                ) : (
                  <Users size={40} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-200 truncate">{suspect.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-3 truncate">{suspect.desc}</p>
                
                <div className="flex gap-4">
                  {[0, 1].map((printIdx) => (
                    <div key={printIdx} className="flex-1 bg-slate-900 p-2 rounded border border-slate-700">
                      <div 
                        className="cursor-pointer hover:ring-2 hover:ring-red-500 rounded flex justify-center bg-slate-200 mb-2"
                        onClick={() => setAfisRight({ name: `${suspect.name} - Print ${printIdx + 1}`, type: suspect.prints[printIdx] })}
                        title="Load to AFIS Terminal"
                      >
                         <FingerprintGraphic pattern={suspect.prints[printIdx]} className="w-16 h-16" />
                      </div>
                      <select 
                        value={suspectTags[suspect.id]?.[printIdx] || ''}
                        onChange={(e) => handleSuspectTag(suspect.id, printIdx, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-xs text-slate-200 focus:border-red-500"
                      >
                        <option value="">Tag Pattern...</option>
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
      
      {/* Floating Evidence Palette for AFIS */}
      <div className="absolute bottom-4 right-4 bg-slate-800 border border-cyan-700 p-3 rounded-lg shadow-xl shadow-black max-w-xs">
        <h4 className="text-xs font-bold text-cyan-400 mb-2 font-mono">EVIDENCE QUICK-LOAD</h4>
        <div className="flex gap-2">
          {EVIDENCE_ITEMS.map(item => (
             <button 
                key={item.id}
                onClick={() => setAfisLeft({ name: item.name, type: item.type })}
                className="p-1 bg-slate-900 rounded border border-slate-600 hover:border-cyan-400"
                title={`Load ${item.name}`}
             >
                <FingerprintGraphic pattern={item.type} className="w-8 h-8" />
             </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="p-8 h-full overflow-y-auto animate-fadeIn bg-slate-100">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-2xl rounded">
        
        {/* Printable Header */}
        <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Official Case Report</h1>
            <p className="text-slate-500 font-mono mt-2">DEPT. OF FORENSIC SCIENCES // MORINVILLE BANK HEIST</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="print:hidden bg-slate-900 text-white px-4 py-2 rounded shadow hover:bg-slate-800 flex items-center gap-2 font-bold"
          >
            <Printer size={18}/> Print / Export PDF
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-8 text-slate-800">
          
          <div className="bg-slate-50 p-6 rounded border border-slate-200">
            <h3 className="text-lg font-bold border-b border-slate-300 pb-2 mb-4">I. Suspect Identification</h3>
            <p className="mb-4 text-sm text-slate-600">Based on the AFIS comparison, identify the TWO suspects responsible for the robbery.</p>
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-bold mb-1">Guilty Suspect 1:</label>
                 <select 
                    value={reportData.guilty1} 
                    onChange={e => setReportData({...reportData, guilty1: e.target.value})}
                    className="w-full border-slate-300 rounded p-2 bg-white"
                 >
                   <option value="">Select Suspect...</option>
                   {SUSPECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-bold mb-1">Guilty Suspect 2:</label>
                 <select 
                    value={reportData.guilty2} 
                    onChange={e => setReportData({...reportData, guilty2: e.target.value})}
                    className="w-full border-slate-300 rounded p-2 bg-white"
                 >
                   <option value="">Select Suspect...</option>
                   {SUSPECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold mb-2">II. Forensic Theory</h3>
             <label className="block text-sm font-bold mb-1 text-slate-600">Why is determining if a set of fingerprints is from the right or left hand important? (2 Marks)</label>
             <textarea 
                value={reportData.handImportance}
                onChange={e => setReportData({...reportData, handImportance: e.target.value})}
                className="w-full border border-slate-300 rounded p-3 h-24"
                placeholder="Enter your analysis here..."
             />
          </div>

          <div>
             <h3 className="text-lg font-bold mb-2">III. Evidentiary Justification</h3>
             <label className="block text-sm font-bold mb-1 text-slate-600">Give three pieces of evidence to support your conclusion of the guilty suspects. (3 Marks)</label>
             <textarea 
                value={reportData.evidenceExplanation}
                onChange={e => setReportData({...reportData, evidenceExplanation: e.target.value})}
                className="w-full border border-slate-300 rounded p-3 h-32"
                placeholder="1. ...&#10;2. ...&#10;3. ..."
             />
          </div>

          {/* Print-only automated data summary */}
          <div className="hidden print:block mt-8 pt-8 border-t-2 border-dashed border-slate-300">
             <h3 className="text-md font-bold mb-4 uppercase text-slate-500">Appendix: Raw Database Entries</h3>
             <div className="text-xs font-mono grid grid-cols-2 gap-4">
                <div>
                   <strong>EVIDENCE TAGS:</strong>
                   {EVIDENCE_ITEMS.map(item => (
                      <div key={item.id}>- {item.name}: {evidenceTags[item.id] || 'UNTAGGED'}</div>
                   ))}
                </div>
                <div>
                   <strong>SUSPECT TAGS:</strong>
                   {SUSPECTS.map(s => (
                      <div key={s.id}>
                        - {s.name}: P1({suspectTags[s.id]?.[0] || '?'}), P2({suspectTags[s.id]?.[1] || '?'})
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>
      
      {renderNav()}
      
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'training' && renderTraining()}
        {activeTab === 'evidence' && renderEvidence()}
        {activeTab === 'suspects' && renderSuspects()}
        {activeTab === 'report' && renderReport()}
      </main>
    </div>
  );
}
