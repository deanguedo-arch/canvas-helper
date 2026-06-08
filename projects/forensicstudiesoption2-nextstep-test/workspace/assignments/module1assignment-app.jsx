import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Camera,
  Users,
  Search,
  Map,
  Package,
  AlertTriangle,
  CheckCircle2,
  Info,
  Eye,
  ChevronRight,
  X,
  FileText,
  Crosshair,
  Droplet
} from 'lucide-react';

function readModule1AssignmentState() {
  return null;
}

function writeModule1AssignmentState(state) {
  return;
}

const App = () => {
  const [persistedState] = useState(() => readModule1AssignmentState());
  const [step, setStep] = useState(persistedState?.step || 'intro');
  const [activeHotspot, setActiveHotspot] = useState(persistedState?.activeHotspot || null);
  
  // Part 1 State
  const [securingAnswers, setSecuringAnswers] = useState(
    persistedState?.securingAnswers && typeof persistedState.securingAnswers === 'object'
      ? { r1: persistedState.securingAnswers.r1 || '', r2: persistedState.securingAnswers.r2 || '' }
      : { r1: '', r2: '' }
  );
  
  // Part 2 State
  const stepsData = [
    { name: 'Securing', icon: <Shield className="w-8 h-8" />, key: 'securing', hint: "Establishing the perimeter and log.", desc: "First responder's priority. Preserve life and protect the area." },
    { name: 'Separating', icon: <Users className="w-8 h-8" />, key: 'separating', hint: "Keeping witnesses apart to prevent collusion.", desc: "Ensure witnesses don't create a shared narrative." },
    { name: 'Scanning', icon: <Eye className="w-8 h-8" />, key: 'scanning', hint: "Primary walkthrough to identify evidence.", desc: "Determine where photos are needed and assess the scope." },
    { name: 'Seeing', icon: <Camera className="w-8 h-8" />, key: 'seeing', hint: "Detailed photography of everything.", desc: "Capturing the scene with and without measuring scales." },
    { name: 'Sketching', icon: <Map className="w-8 h-8" />, key: 'sketching', hint: "Creating a scaled diagram of the scene.", desc: "Documenting exact spatial relationships of evidence." },
    { name: 'Searching', icon: <Search className="w-8 h-8" />, key: 'searching', hint: "Using a grid/spiral pattern for missed items.", desc: "Systematic physical search for all trace evidence." },
    { name: 'Collecting', icon: <Package className="w-8 h-8" />, key: 'collecting', hint: "Packaging and labeling items correctly.", desc: "Maintaining the chain of custody." },
  ];
  const [stepDescriptions, setStepDescriptions] = useState(
    persistedState?.stepDescriptions && typeof persistedState.stepDescriptions === 'object'
      ? persistedState.stepDescriptions
      : {}
  );
  const [activeStepModal, setActiveStepModal] = useState(persistedState?.activeStepModal || null);

  // Part 3 State
  const [safetyAnswers, setSafetyAnswers] = useState(
    persistedState?.safetyAnswers && typeof persistedState.safetyAnswers === 'object'
      ? {
          p1: persistedState.safetyAnswers.p1 || '',
          d1: persistedState.safetyAnswers.d1 || '',
          p2: persistedState.safetyAnswers.p2 || '',
          d2: persistedState.safetyAnswers.d2 || ''
        }
      : { p1: '', d1: '', p2: '', d2: '' }
  );
  const [flashlightPos, setFlashlightPos] = useState(
    persistedState?.flashlightPos && typeof persistedState.flashlightPos === 'object'
      ? { x: Number(persistedState.flashlightPos.x) || 50, y: Number(persistedState.flashlightPos.y) || 50 }
      : { x: 50, y: 50 }
  );
  const [discoveredHazards, setDiscoveredHazards] = useState(
    persistedState?.discoveredHazards && typeof persistedState.discoveredHazards === 'object'
      ? {
          glass: Boolean(persistedState.discoveredHazards.glass),
          chemical: Boolean(persistedState.discoveredHazards.chemical)
        }
      : { glass: false, chemical: false }
  );
  const roomRef = useRef(null);

  useEffect(() => {
    writeModule1AssignmentState({
      step,
      activeHotspot,
      securingAnswers,
      stepDescriptions,
      activeStepModal,
      safetyAnswers,
      flashlightPos,
      discoveredHazards
    });
  }, [step, activeHotspot, securingAnswers, stepDescriptions, activeStepModal, safetyAnswers, flashlightPos, discoveredHazards]);

  const handleFlashlight = (e) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFlashlightPos({ x, y });
  };

  const renderIntroduction = () => (
    <div className="max-w-5xl mx-auto p-8 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">
      {/* Background graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-blue-600/20 rounded-full mb-6 border border-blue-500/30">
            <Shield size={48} className="text-blue-400" />
        </div>
        <h1 className="text-5xl font-black text-white mb-3 uppercase tracking-tighter">Forensic Investigator</h1>
        <p className="text-blue-400 font-mono text-lg">Virtual Crime Scene Certification | Total Marks: 12</p>
      </div>
      
      <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl mb-10 border border-slate-600 relative z-10 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
            <Info size={24} className="text-blue-400" /> MISSION BRIEFING
        </h3>
        <p className="text-slate-300 leading-relaxed text-lg">
          You are the lead CSI arriving at Case #2024-ALPHA-09, a suspected residential burglary. 
          The local PD has requested your expertise. You must successfully navigate the perimeter, 
          document standard operating procedures, and clear the scene of hazards before processing begins.
        </p>
      </div>

      <button 
        onClick={() => setStep('part1')}
        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 relative z-10"
      >
        DEPLOY TO SCENE <ChevronRight size={24} />
      </button>
    </div>
  );

  const renderPart1 = () => (
    <div className="max-w-5xl mx-auto p-8 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-yellow-500 text-slate-900 p-2 rounded-lg"><Shield size={28} /></span> 
            Phase 1: Perimeter Control
        </h2>
        <span className="text-yellow-400 font-mono font-bold bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/20">2 MARKS</span>
      </div>
      <p className="text-slate-400 mb-8 text-lg">Investigate the scene below by clicking the glowing markers to understand the perimeter logic.</p>
      
      {/* High-Fidelity SVG Scene */}
      <div className="relative w-full h-96 bg-slate-950 rounded-xl mb-10 overflow-hidden border border-slate-700 shadow-2xl group cursor-crosshair">
        <svg viewBox="0 0 1000 400" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020617"/>
              <stop offset="100%" stopColor="#1e293b"/>
            </linearGradient>
            <radialGradient id="streetlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(253, 224, 71, 0.4)" />
              <stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
            </radialGradient>
            <radialGradient id="sirenRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
            <radialGradient id="sirenBlue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </radialGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          </defs>
          
          {/* Sky & Ground */}
          <rect width="100%" height="400" fill="url(#nightSky)" />
          <circle cx="850" cy="80" r="40" fill="#e2e8f0" opacity="0.9" filter="blur(2px)"/>
          <path d="M 0 300 Q 250 280 500 300 T 1000 320 L 1000 400 L 0 400 Z" fill="#0f172a" />
          
          {/* Background House */}
          <g transform="translate(150, 100)">
            <path d="M 0 200 L 0 50 L 150 0 L 300 50 L 300 200 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <path d="M -20 50 L 150 -10 L 320 50 L 150 20 Z" fill="#0f172a" />
            {/* Windows */}
            <rect x="40" y="80" width="60" height="80" fill="#fef08a" opacity="0.8" filter="url(#glow)" />
            <rect x="200" y="80" width="60" height="80" fill="#334155" />
            {/* Door */}
            <rect x="120" y="110" width="60" height="90" fill="#020617" />
            <polygon points="120,110 160,100 160,200 120,200" fill="#fef08a" opacity="0.4" /> {/* Ajar door light spill */}
          </g>

          {/* Trees silhouette */}
          <path d="M 500 300 Q 520 200 550 250 T 600 300 Z" fill="#020617" />
          <path d="M 50 320 Q 80 150 120 280 T 180 320 Z" fill="#020617" />

          {/* Streetlight & Illumination */}
          <rect x="800" y="50" width="8" height="250" fill="#334155" />
          <path d="M 750 50 L 808 50 L 808 60 L 750 60 Z" fill="#475569" />
          <circle cx="760" cy="55" r="10" fill="#fef08a" filter="url(#glow)"/>
          <circle cx="760" cy="300" r="200" fill="url(#streetlight)" className="opacity-50" />

          {/* Police Car Silhouette */}
          <g transform="translate(550, 240)">
            <path d="M 20 60 L 40 20 L 120 20 L 160 60 L 220 60 L 220 90 L 0 90 L 0 60 Z" fill="#020617" stroke="#334155" strokeWidth="2"/>
            <circle cx="50" cy="90" r="15" fill="#0f172a" stroke="#475569" strokeWidth="3"/>
            <circle cx="170" cy="90" r="15" fill="#0f172a" stroke="#475569" strokeWidth="3"/>
            {/* Flashing Lights */}
            <rect x="70" y="10" width="15" height="10" fill="#ef4444" className="animate-pulse" filter="url(#glow)"/>
            <rect x="85" y="10" width="15" height="10" fill="#3b82f6" className="animate-[pulse_1s_ease-in-out_infinite_0.5s]" filter="url(#glow)"/>
            {/* Light casting */}
            <circle cx="75" cy="50" r="150" fill="url(#sirenRed)" className="animate-pulse opacity-30" />
            <circle cx="90" cy="50" r="150" fill="url(#sirenBlue)" className="animate-[pulse_1s_ease-in-out_infinite_0.5s] opacity-30" />
          </g>

          {/* Yellow Crime Tape (Foreground) */}
          <path d="M -50 350 Q 400 380 1050 320" stroke="#eab308" strokeWidth="12" fill="none" filter="drop-shadow(0 10px 8px rgba(0,0,0,0.8))"/>
          <path d="M -50 350 Q 400 380 1050 320" stroke="#000" strokeWidth="12" strokeDasharray="30 30" fill="none" opacity="0.6"/>

          {/* Interactive Hotspots */}
          <g transform="translate(730, 200)" onClick={() => setActiveHotspot('bystanders')} className="cursor-pointer">
            <path d="M 0 40 Q 15 10 30 40 Z" fill="#334155" />
            <circle cx="15" cy="10" r="10" fill="#334155" />
            <circle cx="15" cy="20" r="30" fill="#3b82f6" opacity="0.4" className="animate-ping" />
            <circle cx="15" cy="20" r="15" fill="#3b82f6" filter="url(#glow)" />
            <text x="15" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">?</text>
          </g>

          <g transform="translate(260, 310)" onClick={() => setActiveHotspot('evidence')} className="cursor-pointer">
            <path d="M 0 5 L 15 0 L 25 15 L -5 10 Z" fill="#94a3b8" /> {/* Footprint/dropped item */}
            <circle cx="10" cy="5" r="30" fill="#ef4444" opacity="0.4" className="animate-ping" />
            <circle cx="10" cy="5" r="15" fill="#ef4444" filter="url(#glow)" />
            <text x="10" y="9" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text>
          </g>
        </svg>

        {/* Info Modal overlay */}
        {activeHotspot && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-lg shadow-2xl relative w-full transform transition-all">
                    <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={() => setActiveHotspot(null)}>
                        <X size={24} />
                    </button>
                    <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center ${activeHotspot === 'bystanders' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activeHotspot === 'bystanders' ? <Users size={32} /> : <Search size={32} />}
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                        {activeHotspot === 'bystanders' ? 'Crowd Control & Witnesses' : 'Fragile Trace Evidence'}
                    </h4>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        {activeHotspot === 'bystanders' 
                            ? 'Unauthorized personnel, neighbors, or media can easily destroy evidence, trample footprints, or introduce their own DNA/hair to the scene if the perimeter is not established immediately.' 
                            : 'Trace evidence like glass shards, fibers, or biological fluids are extremely fragile. Without securing the scene, evidence can be accidentally kicked, washed away, or permanently altered.'}
                    </p>
                    <button className="mt-8 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors" onClick={() => setActiveHotspot(null)}>Acknowledge</button>
                </div>
            </div>
        )}
      </div>
      
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6">
        <p className="font-bold text-white text-lg">Based on your inspection, provide two reasons why it’s critical to secure the crime scene:</p>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 block">Reason 1 (1 Mark)</label>
            <textarea 
                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-white resize-none h-32"
                placeholder="Type your first reason here..."
                value={securingAnswers.r1}
                onChange={(e) => setSecuringAnswers({...securingAnswers, r1: e.target.value})}
            />
            </div>
            <div>
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 block">Reason 2 (1 Mark)</label>
            <textarea 
                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-white resize-none h-32"
                placeholder="Type your second reason here..."
                value={securingAnswers.r2}
                onChange={(e) => setSecuringAnswers({...securingAnswers, r2: e.target.value})}
            />
            </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={() => setStep('intro')} className="px-8 py-4 text-slate-400 font-medium hover:bg-slate-800 rounded-xl transition-colors">Back to Briefing</button>
        <button onClick={() => setStep('part2')} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg flex items-center gap-2">Proceed to Phase 2 <ChevronRight size={20}/></button>
      </div>
    </div>
  );

  const renderPart2 = () => (
    <div className="max-w-5xl mx-auto p-8 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-green-500 text-slate-900 p-2 rounded-lg"><FileText size={28} /></span> 
            Phase 2: The 7 S's Protocol
        </h2>
        <span className="text-green-400 font-mono font-bold bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">7 MARKS</span>
      </div>
      <p className="text-slate-400 mb-8 text-lg">Review the evidence board. Click each pinned file to log your description of the procedure in your own words.</p>
      
      {/* Evidence Board UI (Corkboard simulation) */}
      <div className="bg-[#8b5a2b] p-8 rounded-xl border-[12px] border-[#5c3a21] shadow-inner relative min-h-[500px]">
        {/* Cork texture */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: `radial-gradient(#4a2f18 1px, transparent 1px)`, backgroundSize: '10px 10px'}}></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {stepsData.map((s, index) => {
            const isFilled = stepDescriptions[s.key]?.trim().length > 5;
            // Slight random rotations for polaroid effect
            const rotation = index % 2 === 0 ? `rotate-${(index % 3) + 1}` : `-rotate-${(index % 3) + 1}`;
            
            return (
              <div 
                key={s.key} 
                onClick={() => setActiveStepModal(s)}
                className={`bg-slate-50 p-3 pb-8 rounded shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-200 group relative
                  ${index === 6 ? 'md:col-start-2 md:col-span-2 mx-auto w-48' : ''} 
                  ${isFilled ? 'border-2 border-green-500' : 'border-2 border-transparent'}
                `}
                style={{transform: `rotate(${Math.random() * 6 - 3}deg)`}}
              >
                {/* Red Pin */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-600 shadow-sm border border-red-800 z-10"></div>
                
                <div className="bg-slate-200 h-24 mb-3 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {s.icon}
                </div>
                <h4 className="font-mono font-bold text-slate-800 text-center text-sm">{index + 1}. {s.name}</h4>
                {isFilled && (
                    <div className="absolute bottom-2 right-2 text-green-500"><CheckCircle2 size={16}/></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note Editor Modal */}
        {activeStepModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="assignment-step-note bg-yellow-100 p-8 rounded shadow-2xl max-w-lg w-full transform rotate-1 border border-yellow-300 relative">
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md"></div>
               <button className="assignment-step-note-close absolute top-4 right-4 text-slate-500 hover:text-black" onClick={() => setActiveStepModal(null)}><X size={24} /></button>
                
                <h3 className="text-2xl font-black text-slate-800 mt-4 mb-2 border-b-2 border-slate-300 pb-2">
                  Step {stepsData.findIndex(s => s.key === activeStepModal.key) + 1}: {activeStepModal.name}
                </h3>
                
                <div className="assignment-step-note-callout bg-yellow-200/50 p-3 rounded text-sm text-slate-700 font-mono mb-6 italic border-l-4 border-yellow-400">
                   <Info size={16} className="inline mr-2 -mt-1"/> Field Note: {activeStepModal.hint}
                </div>

                <label className="block text-slate-800 font-bold mb-2">Description (In your own words):</label>
                <textarea 
                   className="assignment-step-note-textarea w-full bg-transparent border-b-2 border-slate-400 focus:border-blue-600 outline-none text-slate-800 font-mono text-lg resize-none min-h-[120px] leading-relaxed"
                   style={{backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #94a3b8 28px)', lineHeight: '28px', paddingTop: '2px'}}
                   placeholder="Describe the objective of this step..."
                   value={stepDescriptions[activeStepModal.key] || ''}
                   onChange={(e) => setStepDescriptions({...stepDescriptions, [activeStepModal.key]: e.target.value})}
                  autoFocus
               />
               
                <div className="mt-6 flex justify-end">
                   <button 
                     onClick={() => setActiveStepModal(null)} 
                     className="assignment-step-note-submit px-6 py-2 bg-slate-800 text-white font-bold rounded hover:bg-slate-700 shadow"
                   >
                     Pin to Board
                   </button>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={() => setStep('part1')} className="px-8 py-4 text-slate-400 font-medium hover:bg-slate-800 rounded-xl transition-colors">Back to Phase 1</button>
        <button onClick={() => setStep('part3')} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg flex items-center gap-2">Proceed to Phase 3 <ChevronRight size={20}/></button>
      </div>
    </div>
  );

  const renderPart3 = () => (
    <div className="max-w-5xl mx-auto p-8 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-red-500 text-slate-900 p-2 rounded-lg"><AlertTriangle size={28} /></span> 
            Phase 3: Safety & Hazards
        </h2>
        <span className="text-red-400 font-mono font-bold bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">3 MARKS</span>
      </div>
      <p className="text-slate-400 mb-8 text-lg">The power is cut. Use your flashlight (hover/drag over the room) to identify two severe safety hazards before processing the scene.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Flashlight Interactive Room */}
        <div 
          className="relative w-full aspect-square bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl cursor-none"
          onMouseMove={handleFlashlight}
          onMouseLeave={() => setFlashlightPos({ x: 50, y: 50 })}
          ref={roomRef}
        >
          {/* Base Room Detail (Only visible under flashlight mask) */}
          <div 
            className="absolute inset-0"
            style={{
              background: '#1e293b',
              maskImage: `radial-gradient(circle 120px at ${flashlightPos.x}% ${flashlightPos.y}%, black 40%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 150px at ${flashlightPos.x}% ${flashlightPos.y}%, black 30%, transparent 100%)`
            }}
          >
            {/* Room Background Elements */}
            <svg viewBox="0 0 500 500" className="w-full h-full object-cover">
                <rect width="500" height="500" fill="#0f172a" />
                {/* Wallpaper */}
                <path d="M 0 0 L 500 0 L 500 300 L 0 300 Z" fill="#1e293b" />
                {/* Floorboards */}
                <path d="M 0 300 L 500 300 L 500 500 L 0 500 Z" fill="#334155" />
                <path d="M 50 300 L 0 500 M 150 300 L 100 500 M 250 300 L 250 500 M 350 300 L 400 500 M 450 300 L 500 500" stroke="#0f172a" strokeWidth="4" />
                
                {/* Furniture - Couch */}
                <rect x="50" y="200" width="200" height="120" rx="10" fill="#475569" />
                <rect x="40" y="220" width="30" height="110" rx="5" fill="#334155" />
                <rect x="230" y="220" width="30" height="110" rx="5" fill="#334155" />
                
                {/* Table */}
                <rect x="300" y="280" width="150" height="20" fill="#78350f" />
                <rect x="310" y="300" width="10" height="80" fill="#451a03" />
                <rect x="430" y="300" width="10" height="80" fill="#451a03" />

                {/* --- HAZARD 1: Shattered Window/Glass --- */}
                <g transform="translate(100, 50)">
                  <rect x="0" y="0" width="100" height="120" fill="#020617" stroke="#64748b" strokeWidth="4" />
                  <path d="M 0 0 L 30 40 L 10 70 L 0 50 Z" fill="#cbd5e1" opacity="0.3" />
                  <path d="M 100 120 L 70 80 L 90 40 L 100 50 Z" fill="#cbd5e1" opacity="0.3" />
                  {/* Glass shards on floor */}
                  <g transform="translate(20, 270)">
                    <polygon points="0,0 15,-10 20,5" fill="#e2e8f0" stroke="#fff" strokeWidth="1" className="animate-pulse" />
                    <polygon points="30,5 40,-5 50,15 35,20" fill="#e2e8f0" stroke="#fff" strokeWidth="1" className="animate-pulse" />
                    <polygon points="-20,10 -10,-5 0,15" fill="#e2e8f0" stroke="#fff" strokeWidth="1" className="animate-pulse" />
                  </g>
                </g>

                {/* --- HAZARD 2: Chemical Spill / Biohazard --- */}
                <g transform="translate(320, 380)">
                   <ellipse cx="40" cy="20" rx="50" ry="15" fill="#84cc16" opacity="0.8" />
                   <ellipse cx="50" cy="25" rx="30" ry="10" fill="#a3e635" />
                   {/* Overturned bottle */}
                   <path d="M 0 10 L 15 5 L 30 25 L 10 35 Z" fill="#cbd5e1" />
                   <rect x="-5" y="15" width="10" height="10" fill="#ef4444" transform="rotate(-30)" />
                   <circle cx="50" cy="25" r="3" fill="#ecfccb" className="animate-ping" />
                   <circle cx="30" cy="20" r="2" fill="#ecfccb" className="animate-ping" style={{animationDelay: '0.5s'}} />
                </g>
            </svg>
          </div>
          
          {/* Flashlight Cursor Halo */}
          <div 
            className="absolute pointer-events-none rounded-full border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            style={{
              left: `${flashlightPos.x}%`, 
              top: `${flashlightPos.y}%`, 
              width: '240px', 
              height: '240px', 
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)'
            }}
          />
          <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-mono px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
            <Crosshair size={14} className="text-red-500"/> FLASHLIGHT MODE
          </div>
        </div>

        {/* Hazard Log Forms */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
             <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Shield size={20} className="text-blue-400" /> Log Hazard & Precautions
             </h4>
             <p className="text-sm text-slate-400 mb-6">Based on the scene or standard protocol, identify two safety precautions to take (other than securing the perimeter) and their associated dangers.</p>
             
             <div className="space-y-6">
               <div className="bg-slate-900 p-5 rounded-lg border border-slate-600 focus-within:border-blue-500 transition-colors">
                 <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Precaution #1</label>
                 <input 
                    className="w-full bg-transparent text-white text-lg font-medium outline-none mt-2 border-b border-slate-700 focus:border-blue-500 pb-2 mb-4"
                    placeholder="e.g. Wear puncture-resistant gloves"
                    value={safetyAnswers.p1}
                    onChange={(e) => setSafetyAnswers({...safetyAnswers, p1: e.target.value})}
                 />
                 <label className="text-xs font-bold text-red-400 uppercase tracking-wider block mt-2">Danger if ignored</label>
                 <textarea 
                    className="w-full bg-slate-800 text-white rounded outline-none mt-2 p-3 text-sm min-h-[80px] resize-none border border-slate-700 focus:border-red-500"
                    placeholder="Explain what injury or contamination could occur..."
                    value={safetyAnswers.d1}
                    onChange={(e) => setSafetyAnswers({...safetyAnswers, d1: e.target.value})}
                 />
               </div>

               <div className="bg-slate-900 p-5 rounded-lg border border-slate-600 focus-within:border-blue-500 transition-colors">
                 <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Precaution #2</label>
                 <input 
                    className="w-full bg-transparent text-white text-lg font-medium outline-none mt-2 border-b border-slate-700 focus:border-blue-500 pb-2 mb-4"
                    placeholder="e.g. Hazardous material respirator"
                    value={safetyAnswers.p2}
                    onChange={(e) => setSafetyAnswers({...safetyAnswers, p2: e.target.value})}
                 />
                 <label className="text-xs font-bold text-red-400 uppercase tracking-wider block mt-2">Danger if ignored</label>
                 <textarea 
                    className="w-full bg-slate-800 text-white rounded outline-none mt-2 p-3 text-sm min-h-[80px] resize-none border border-slate-700 focus:border-red-500"
                    placeholder="Explain what injury or contamination could occur..."
                    value={safetyAnswers.d2}
                    onChange={(e) => setSafetyAnswers({...safetyAnswers, d2: e.target.value})}
                 />
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={() => setStep('part2')} className="px-8 py-4 text-slate-400 font-medium hover:bg-slate-800 rounded-xl transition-colors">Back to Phase 2</button>
        <button onClick={() => setStep('final')} className="px-8 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-500 transition-colors shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center gap-2">SUBMIT FINAL REPORT <CheckCircle2 size={24}/></button>
      </div>
    </div>
  );

  const renderFinal = () => {
    const p2Count = Object.keys(stepDescriptions).filter(k => stepDescriptions[k].length > 5).length;
    const allDone = securingAnswers.r1 && securingAnswers.r2 && p2Count === 7 && safetyAnswers.p1 && safetyAnswers.p2;

    return (
        <div className="max-w-4xl mx-auto p-10 bg-slate-900 rounded-2xl shadow-2xl text-center border-t-8 border-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: `radial-gradient(circle at 50% 0%, #3b82f6 0%, transparent 70%)`}}></div>
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl transform rotate-3">
              <FileText size={48} />
            </div>
          </div>
          <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tight relative z-10">Case Filed</h2>
          <p className="text-blue-400 mb-10 font-mono relative z-10">Incident Report #2024-ALPHA-09 Submitted to HQ</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
            <div className={`p-6 rounded-xl border-2 ${securingAnswers.r1 && securingAnswers.r2 ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}>
                <Shield size={24} className={`mx-auto mb-3 ${securingAnswers.r1 && securingAnswers.r2 ? 'text-green-400' : 'text-slate-500'}`} />
                <p className="text-xs font-black uppercase text-slate-400 mb-1 tracking-widest">Phase 1 (2 Marks)</p>
                <p className="font-bold text-white text-lg">Perimeter</p>
                <div className="mt-2 text-sm font-medium">{securingAnswers.r1 && securingAnswers.r2 ? <span className="text-green-400">✅ Complete</span> : <span className="text-yellow-400">⚠️ Incomplete</span>}</div>
            </div>
            
            <div className={`p-6 rounded-xl border-2 ${p2Count === 7 ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}>
                <Search size={24} className={`mx-auto mb-3 ${p2Count === 7 ? 'text-green-400' : 'text-slate-500'}`} />
                <p className="text-xs font-black uppercase text-slate-400 mb-1 tracking-widest">Phase 2 (7 Marks)</p>
                <p className="font-bold text-white text-lg">7 S's Protocol</p>
                <div className="mt-2 text-sm font-medium">{p2Count === 7 ? <span className="text-green-400">✅ Complete</span> : <span className="text-yellow-400">⚠️ {p2Count}/7 Logged</span>}</div>
            </div>
            
            <div className={`p-6 rounded-xl border-2 ${safetyAnswers.p1 && safetyAnswers.p2 ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}>
                <AlertTriangle size={24} className={`mx-auto mb-3 ${safetyAnswers.p1 && safetyAnswers.p2 ? 'text-green-400' : 'text-slate-500'}`} />
                <p className="text-xs font-black uppercase text-slate-400 mb-1 tracking-widest">Phase 3 (3 Marks)</p>
                <p className="font-bold text-white text-lg">Safety Log</p>
                <div className="mt-2 text-sm font-medium">{safetyAnswers.p1 && safetyAnswers.p2 ? <span className="text-green-400">✅ Complete</span> : <span className="text-yellow-400">⚠️ Incomplete</span>}</div>
            </div>
          </div>

          {!allDone && (
              <div className="mb-10 p-4 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm flex items-center gap-3 justify-center max-w-2xl mx-auto relative z-10">
                  <AlertTriangle size={20} /> <strong>Warning:</strong> Missing critical data. This report may be rejected by the prosecution.
              </div>
          )}
    
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <button 
                onClick={() => window.print()} 
                className="px-10 py-5 bg-white text-slate-900 font-black text-lg rounded-xl hover:bg-slate-200 shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
            >
                <Camera size={24} /> PRINT TO PDF
            </button>
            <button 
                onClick={() => setStep('intro')} 
                className="px-10 py-5 bg-transparent border-2 border-slate-600 text-slate-300 font-bold text-lg rounded-xl hover:bg-slate-800 transition-colors"
            >
                START NEW CASE
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="mb-8">
        {step !== 'intro' && step !== 'final' && (
          <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-4">
            <div>
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Active Operation</p>
                <h3 className="text-2xl font-black text-white uppercase">
                    {step === 'part1' && 'Phase I: Establish Perimeter'}
                    {step === 'part2' && 'Phase II: Execute Protocol'}
                    {step === 'part3' && 'Phase III: Hazard Clearance'}
                </h3>
            </div>
            <div className="flex gap-3">
              <div className={`h-2.5 w-12 md:w-20 rounded-full transition-all duration-500 ${['part1', 'part2', 'part3'].includes(step) ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-slate-800'}`}></div>
              <div className={`h-2.5 w-12 md:w-20 rounded-full transition-all duration-500 ${['part2', 'part3'].includes(step) ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-slate-800'}`}></div>
              <div className={`h-2.5 w-12 md:w-20 rounded-full transition-all duration-500 ${['part3'].includes(step) ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' : 'bg-slate-800'}`}></div>
            </div>
          </div>
        )}
      </div>

      {step === 'intro' && renderIntroduction()}
      {step === 'part1' && renderPart1()}
      {step === 'part2' && renderPart2()}
      {step === 'part3' && renderPart3()}
      {step === 'final' && renderFinal()}
    </div>
  );
};

export default App;
