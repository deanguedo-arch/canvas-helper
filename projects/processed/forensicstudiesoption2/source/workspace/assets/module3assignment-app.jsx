import React, { useState } from 'react';

const IconStub = () => null;
const BookOpen = IconStub;
const Microscope = IconStub;
const FileText = IconStub;
const Download = IconStub;
const Info = IconStub;
const Search = IconStub;
const ShieldAlert = IconStub;
const History = IconStub;
const Sliders = IconStub;
const Crosshair = IconStub;
const Sun = IconStub;
const Activity = IconStub;
const Move = IconStub;

const App = () => {
  const [activeTab, setActiveTab] = useState('foundations');
  const [microscope, setMicroscope] = useState({ zoom: 1, focus: 4, brightness: 100, filter: 'normal', x: -60, y: 50 });
  const [answers, setAnswers] = useState({
    table: {
      identified: '',
      individualized: '',
      organic: '',
      inorganic: ''
    },
    theory: {
      hairType: '',
      limitations: ''
    },
    lab: {
      observations: '',
      classification: '',
      classificationReason: '',
      identification: '',
      identificationReason: ''
    },
    caseStudies: {
      joggerIdentified: '',
      dnaImportance: '',
      morganConclusion: '',
      morganFiber: ''
    }
  });

  const updateAnswer = (section, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-8 border-b border-slate-200 pb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Icon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <p className="text-slate-500 ml-11 font-medium">{subtitle}</p>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-6">
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <textarea
        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 shadow-sm hover:border-slate-300"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const renderFoundations = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        icon={BookOpen} 
        title="Forensic Foundations" 
        subtitle="Classification & Concepts of Trace Evidence" 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Search size={16} className="text-indigo-500" />
            Evidence Classification Matrix
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest w-1/3">Type</th>
              <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Examples (List 2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              { id: 'identified', label: 'Identified' },
              { id: 'individualized', label: 'Individualized' },
              { id: 'organic', label: 'Organic' },
              { id: 'inorganic', label: 'Inorganic' }
            ].map(row => (
              <tr key={row.id}>
                <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">{row.label}</td>
                <td className="p-2">
                  <input 
                    type="text"
                    className="w-full p-3 border-transparent bg-transparent focus:ring-0 text-slate-700 placeholder:italic focus:bg-white transition-colors rounded-lg"
                    placeholder="Type two examples..."
                    value={answers.table[row.id]}
                    onChange={(e) => updateAnswer('table', row.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <InputField 
          label="1. Is hair and fibre evidence considered identified or individualized evidence? Explain your answer."
          value={answers.theory.hairType}
          onChange={(val) => updateAnswer('theory', 'hairType', val)}
        />
        
        <InputField 
          label="2. What are some of the limitations of hair and fibre evidence?"
          value={answers.theory.limitations}
          onChange={(val) => updateAnswer('theory', 'limitations', val)}
        />
      </div>
    </div>
  );

  const isCalibrated = microscope.focus === 0 && microscope.zoom >= 2 && microscope.brightness >= 80 && microscope.brightness <= 120 && Math.abs(microscope.x) <= 10 && Math.abs(microscope.y) <= 10;

  const renderLab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        icon={Microscope} 
        title="Microscopic Analysis Lab" 
        subtitle="Calibrate the instrument to identify the trace sample's internal structures." 
      />

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Interactive Microscope */}
        <div className="bg-slate-900 rounded-3xl p-6 border-8 border-slate-800 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-8 w-32 h-2 bg-indigo-500/20 blur-xl rounded-full"></div>
          
          <div className="flex items-center justify-between text-slate-400 mb-2 print:hidden">
             <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
                <Activity size={14} className={isCalibrated ? "text-green-400" : "text-indigo-400"} />
                <span>Forensic Optics Engine</span>
             </div>
             <div className="flex gap-1.5 items-center">
                {isCalibrated && <span className="text-[10px] text-green-400 font-mono tracking-widest mr-2 animate-pulse">LOCKED</span>}
                <div className={`w-2 h-2 rounded-full ${isCalibrated ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
             </div>
          </div>

          {/* Viewfinder */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square border-2 border-slate-700 shadow-inner group cursor-crosshair">
             {/* Reticle / Grid overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10" />
             
             {/* Crosshairs & Calibration Overlay */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 print:hidden">
                <div className={`w-full h-[1px] ${isCalibrated ? 'bg-green-500/60' : 'bg-indigo-500/30'} transition-colors duration-500`} />
                <div className={`absolute h-full w-[1px] ${isCalibrated ? 'bg-green-500/60' : 'bg-indigo-500/30'} transition-colors duration-500`} />
                <div className={`w-12 h-12 border rounded-full absolute transition-all duration-500 ${isCalibrated ? 'border-green-500/80 scale-150' : 'border-indigo-500/50'}`} />
                <button 
                  onClick={() => setMicroscope(prev => ({ ...prev, x: 0, y: 0 }))}
                  className={`absolute text-[9px] font-mono top-1/2 mt-2 ml-8 pointer-events-auto transition-all ${isCalibrated ? 'text-green-400' : 'text-indigo-500/80 hover:text-indigo-300 hover:scale-105 cursor-pointer'}`}
                >
                  {isCalibrated ? 'TARGET ACQUIRED' : 'CTR-ALIGN (CLICK)'}
                </button>
             </div>

             {/* Dynamic SVG Sample (Replaces the broken image) */}
             <div 
               className="w-full h-full origin-center transition-all duration-75 print:!filter-none print:!scale-100"
               style={{
                  transform: `scale(${microscope.zoom}) translate(${microscope.x}px, ${microscope.y}px)`,
                  filter: `blur(${microscope.focus}px) brightness(${microscope.brightness}%) ${
                    microscope.filter === 'uv' ? 'hue-rotate(180deg) invert(1) contrast(1.5)' : 
                    microscope.filter === 'polarized' ? 'contrast(2) saturate(2)' : ''
                  }`
               }}
             >
                <svg viewBox="0 0 400 400" className="w-full h-full bg-[#e8eaf6]">
                  <defs>
                    <filter id="microscope-noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.9 0 0 0  0 0.8 0 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
                      <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
                    </filter>
                  </defs>
                  
                  <g filter="url(#microscope-noise)">
                    {/* Air Bubbles / Dust on slide */}
                    <circle cx="80" cy="120" r="4" fill="#000" opacity="0.1" />
                    <circle cx="320" cy="280" r="2" fill="#000" opacity="0.2" />
                    <circle cx="260" cy="90" r="8" fill="none" stroke="#000" strokeWidth="1" opacity="0.15" />
                    
                    {/* Main Hair Cortex */}
                    <path d="M 120 -50 C 140 100, 110 300, 160 450" fill="none" stroke="#d4b483" strokeWidth="100" strokeLinecap="round" opacity="0.8" />
                    
                    {/* Cuticle Scales (Outer edges) */}
                    <path d="M 70 -50 Q 90 50 80 100 Q 100 200 65 250 Q 80 350 110 450" fill="none" stroke="#a67c52" strokeWidth="3" opacity="0.7" />
                    <path d="M 170 -50 Q 190 50 180 100 Q 200 200 165 250 Q 180 350 210 450" fill="none" stroke="#a67c52" strokeWidth="3" opacity="0.7" />
                    <path d="M 90 150 Q 120 160 160 145" fill="none" stroke="#a67c52" strokeWidth="1.5" opacity="0.4" />
                    <path d="M 80 280 Q 110 290 150 275" fill="none" stroke="#a67c52" strokeWidth="1.5" opacity="0.4" />

                    {/* Medulla (The distinct 'Ladder' animal structure) */}
                    <path d="M 120 -50 C 140 100, 110 300, 160 450" fill="none" stroke="#5c4033" strokeWidth="35" strokeDasharray="18, 12" opacity="0.95" />
                    <path d="M 120 -50 C 140 100, 110 300, 160 450" fill="none" stroke="#3e2723" strokeWidth="12" opacity="0.6" />
                  </g>
                </svg>
             </div>

             {/* Analysis Callouts (Only visible when calibrated) */}
             {isCalibrated && (
                <div className="absolute inset-0 z-30 pointer-events-none print:hidden">
                   {/* Medulla Callout */}
                   <div className="absolute top-1/3 left-1/2 w-32 h-0 border-t border-green-400">
                      <div className="absolute -top-6 left-full ml-2 bg-green-900/80 text-green-300 text-[9px] font-mono px-2 py-1 rounded border border-green-500 whitespace-nowrap backdrop-blur-sm">
                        LADDER MEDULLA DETECTED
                      </div>
                      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-green-400"></div>
                   </div>
                   {/* Cuticle Callout */}
                   <div className="absolute bottom-1/3 right-1/2 w-24 h-0 border-t border-green-400">
                      <div className="absolute -top-6 right-full mr-2 bg-green-900/80 text-green-300 text-[9px] font-mono px-2 py-1 rounded border border-green-500 whitespace-nowrap backdrop-blur-sm">
                        IMBRICATE CUTICLE
                      </div>
                      <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-green-400"></div>
                   </div>
                </div>
             )}

             {/* HUD Readout */}
             <div className="absolute bottom-4 left-4 font-mono text-[10px] text-green-400 z-20 bg-black/80 border border-green-900/50 p-2 rounded backdrop-blur-sm print:hidden">
                STATUS: {isCalibrated ? <span className="text-green-300 bg-green-900/50 px-1 rounded">OPTIMAL</span> : <span className="text-yellow-400">UNCALIBRATED</span>}<br/>
                MAG: {(400 * microscope.zoom).toFixed(0)}x<br/>
                FOC: {microscope.focus === 0 ? <span className="text-green-300">LOCKED</span> : <span className="text-red-400">{(10 - microscope.focus).toFixed(1)}</span>}<br/>
                LUM: {microscope.brightness}%<br/>
                POS: X:{microscope.x.toFixed(0)} Y:{microscope.y.toFixed(0)}
             </div>
          </div>

          {/* Hardware Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl text-slate-300 border border-slate-800 shadow-inner print:hidden">
             {/* Zoom */}
             <div className="flex flex-col gap-2 text-xs font-bold">
                <label className="flex items-center justify-between uppercase text-slate-500">
                  <span className="flex items-center gap-1.5"><Search size={12}/> Zoom</span>
                  {microscope.zoom >= 2 && <span className="text-green-500 text-[10px]">&check;</span>}
                </label>
                <input type="range" min="1" max="4" step="0.1" value={microscope.zoom} onChange={(e) => setMicroscope({...microscope, zoom: parseFloat(e.target.value)})} className="accent-indigo-500 cursor-ew-resize" />
             </div>
             {/* Focus */}
             <div className="flex flex-col gap-2 text-xs font-bold">
                <label className="flex items-center justify-between uppercase text-slate-500">
                  <span className="flex items-center gap-1.5"><Crosshair size={12}/> Focus</span>
                  {microscope.focus === 0 && <span className="text-green-500 text-[10px]">&check;</span>}
                </label>
                <input type="range" min="0" max="5" step="0.1" value={microscope.focus} onChange={(e) => setMicroscope({...microscope, focus: parseFloat(e.target.value)})} className="accent-indigo-500 cursor-ew-resize" />
             </div>
             {/* Brightness */}
             <div className="flex flex-col gap-2 text-xs font-bold">
                <label className="flex items-center justify-between uppercase text-slate-500">
                  <span className="flex items-center gap-1.5"><Sun size={12}/> Light</span>
                  {(microscope.brightness >= 80 && microscope.brightness <= 120) && <span className="text-green-500 text-[10px]">&check;</span>}
                </label>
                <input type="range" min="50" max="150" step="1" value={microscope.brightness} onChange={(e) => setMicroscope({...microscope, brightness: parseFloat(e.target.value)})} className="accent-indigo-500 cursor-ew-resize" />
             </div>
             {/* X-Align */}
             <div className="flex flex-col gap-2 text-xs font-bold">
                <label className="flex items-center justify-between uppercase text-slate-500">
                  <span className="flex items-center gap-1.5"><Move size={12}/> X-Axis</span>
                  {Math.abs(microscope.x) <= 10 && <span className="text-green-500 text-[10px]">&check;</span>}
                </label>
                <input type="range" min="-100" max="100" step="1" value={microscope.x} onChange={(e) => setMicroscope({...microscope, x: parseFloat(e.target.value)})} className="accent-indigo-500 cursor-ew-resize" />
             </div>
             {/* Y-Align */}
             <div className="flex flex-col gap-2 text-xs font-bold">
                <label className="flex items-center justify-between uppercase text-slate-500">
                  <span className="flex items-center gap-1.5"><Move size={12}/> Y-Axis</span>
                  {Math.abs(microscope.y) <= 10 && <span className="text-green-500 text-[10px]">&check;</span>}
                </label>
                <input type="range" min="-100" max="100" step="1" value={microscope.y} onChange={(e) => setMicroscope({...microscope, y: parseFloat(e.target.value)})} className="accent-indigo-500 cursor-ew-resize" />
             </div>
          </div>

          {/* Light Filters */}
          <div className="flex gap-2 print:hidden">
             {['normal', 'polarized', 'uv'].map(f => (
               <button 
                 key={f} 
                 onClick={() => setMicroscope({...microscope, filter: f})} 
                 className={`flex-1 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-colors border ${
                   microscope.filter === f 
                   ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                   : 'bg-slate-800 text-slate-500 border-transparent hover:bg-slate-700'
                 }`}
               >
                 {f === 'normal' ? 'White Light' : f === 'uv' ? 'UV Fluor' : 'Polarized'}
               </button>
             ))}
          </div>
        </div>

        {/* Right: Data Entry */}
        <div className="flex flex-col h-full justify-start gap-4">
          <div className={`p-4 rounded-xl border flex gap-3 text-sm shadow-sm mb-2 transition-colors duration-500 ${isCalibrated ? 'bg-green-50 border-green-200 text-green-900' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
            <Info className={`shrink-0 mt-0.5 ${isCalibrated ? 'text-green-500' : 'text-indigo-500'}`} size={20} />
            <p className="leading-relaxed">
              <strong>{isCalibrated ? 'Analysis Complete:' : 'Forensic Objective:'}</strong> {isCalibrated ? 'Target structures identified. You can now use the highlighted data to classify the sample and answer the questions below.' : 'Use the hardware controls to calibrate the image. (Hint: Zoom in, drop Focus to 0, balance the Light, and Center the sample). Find the specific internal structure.'}
            </p>
          </div>

          <InputField 
            label="Provide 2 Physical Observations (Seeing only, no inferences):"
            value={answers.lab.observations}
            onChange={(val) => updateAnswer('lab', 'observations', val)}
            placeholder="Example: The sample shows a ladder-like internal structure with distinct dark segments..."
          />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Classification</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                  value={answers.lab.classification}
                  onChange={(e) => updateAnswer('lab', 'classification', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Hair">Hair</option>
                  <option value="Fiber">Fiber</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Sub-Type</label>
                <input 
                   className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                   placeholder="Animal/Human/Man-made"
                   value={answers.lab.identification}
                   onChange={(e) => updateAnswer('lab', 'identification', e.target.value)}
                />
             </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-2">
            <InputField 
              label="Conclusion Logic: Classification"
              placeholder="How do you know it is a hair or a fiber?"
              value={answers.lab.classificationReason}
              onChange={(val) => updateAnswer('lab', 'classificationReason', val)}
              rows={2}
            />
            <InputField 
              label="Conclusion Logic: Sub-Type"
              placeholder="How did you identify the specific origin?"
              value={answers.lab.identificationReason}
              onChange={(val) => updateAnswer('lab', 'identificationReason', val)}
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCaseStudies = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        icon={FileText} 
        title="Case Analysis Dossiers" 
        subtitle="Verbatim historical records of trace evidence cases." 
      />

      {/* Case Study 1 - FULL TEXT RESTORED */}
      <div className="bg-white rounded-2xl border border-slate-200 mb-12 shadow-sm overflow-hidden">
        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">01</div>
            <h3 className="text-xl font-black text-red-900 tracking-tight">THE CENTRAL PARK JOGGER CASE</h3>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full border border-red-200 tracking-wider">FULL DOSSIER</span>
        </div>
        
        <div className="p-8">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-justify">
            <p>On April 19 1989, a young lady left her apartment around 9 PM to jog in New York's Central Park. Nearly five hours later, she was found comatose lying in a puddle of mud within the park. She had been raped her skull was fractured, and she had lost about 75% of her blood. When the woman recovered, she had no memory of what happened to her. The brutality of the crime sent shock waves through the city and seemed to fuel a national perception that crime was running rampant and unchecked through the streets of New York.</p>
            
            <p>Already in custody at the station house of the Central Park Precinct was a group of 14 and 15 year old boys who had been rounded up leaving the park earlier in the night by police who suspected that they had been involved in a series of random attacks. Over the next two days, four of the teenager gave video tape statements, which they later recanted (meaning they tried to withdraw their statements), admitting to participating in the attack. Ultimately, give of the teenagers were charged with the crime. Interestingly, none of the semen collected from the victim could be linked to any of the defendants. However, according to the testimony of a forensic analyst, two head hairs collected from one of the defendant's clothing microscopically compared to the victim, and a third hair collected from the same defendant's T-shirt microscopically compared to the victim's pubic hair. Besides these three hairs, a fourth hair was found to be microscopically similar to the victim's. This hair was recovered from the clothing of Steven Lopez, who was originally charged with rape, but not prosecuted for the crime. Hairs were the only pieces of physical evidence offered by the district attorney to directly link any of the teenagers to the crime. The hairs were cited by the district attorney as a way for the jury to know that the videotaped confessions of the teenagers were reliable. The five defendants were convicted and they ultimately served from 9 to 13 years.</p>

            <p>Matias Reyes was arrested in August 1989, more than three months after the jogger attack. He pleaded guilty to murdering a pregnant woman, raping three others and a robbery. He was sentenced to 33 years to life. In January 2002, Reyes confessed to the Central Park attack. Follow-up tests revealed tat Reyes's DNA compared to semen recovered from the jogger's body and her sock. Other DNA tests showed that the hairs offered into evidence at the trial did not emanate from the victim, and so, in fact, could not be used to link the teenagers to the crime as the district attorney had argued. After an 11 month reinvestigation of the original charges, a New York State Supreme Court judge dismissed all the convictions against the five men in the Central Park jogger case.</p>
            
            <p>Although the original suspects had confessed on videotape in the presence of a parent or guardian, they retracted their statements within weeks, claiming that they had been intimidated, lied to, and coerced into making false confessions. Salaam confessed to being present only after the detective falsely told him that fingerprints had been found on the victim's clothing. According to Salaam, "I would hear them beating up Korey Wise in the next room", and "they would come and look at me and say: 'You realise you're next.' The fear made me feel really like I was not going to be able to make it out." While the confessions themselves were videotaped, the hours of interrogation that preceded the confessions were not.</p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 bg-slate-50 -mx-8 px-8 pb-8">
            <InputField 
              label="Did the police consider the hair evidence collected from the teenagers to be identified or individualized evidence? Explain."
              value={answers.caseStudies.joggerIdentified}
              onChange={(val) => updateAnswer('caseStudies', 'joggerIdentified', val)}
            />
            <InputField 
              label="Why is it important that microscopic hair comparisons be confirmed by DNA determinations?"
              value={answers.caseStudies.dnaImportance}
              onChange={(val) => updateAnswer('caseStudies', 'dnaImportance', val)}
            />
          </div>
        </div>
      </div>

      {/* Case Study 2 - FULL TEXT RESTORED */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">02</div>
            <h3 className="text-xl font-black text-emerald-900 tracking-tight">THE SAMUEL MORGAN CASE</h3>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-200 tracking-wider">FULL DOSSIER</span>
        </div>

        <div className="p-8">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-justify">
            <p>In November 1940, five hours after a fifteen-year-old girl had gone out to get the evening paper, her body was found near some railway tracks by her home. The teenage girl had been sexually assaulted and strangled. A forensic expert called to the scene found a small piece of fabric near the girl’s body. The piece of fabric appeared to be a finger bandage that had mud and blood upon it. No blood from the victim was found on or near the body because the victim had been strangled to death. Therefore, investigators concluded that the suspect had lost the fabric finger bandage while he killed the teenager.</p>
            
            <p>When the bandage was analyzed, a disinfectant known to be used by the military was found upon it. This led investigators to think that the suspect was a member of the military. Further investigation discovered that a soldier who had deserted the local military base, Samuel Morgan, was a suspect in an attack upon a local woman.</p>

            <p>When Samuel Morgan was brought in for questioning, he had a deep cut on his right thumb. Investigators found that Morgan had been living with his brother and sister-in-law. When his brother was questioned, he said that on the night of the murder Samuel had told him he had to leave town and he begged him for money. The sister-in-law admitted she had dressed his finger wound and had applied disinfectant from Morgan’s military kit.</p>

            <p>Upon microscopic analysis, the fibres of the bandage found at the crime scene matched the fibres of the bandages from Morgan’s sister-in-law. Also, trace elements found in the dirt at the crime scene matched the trace elements found in dirt found upon Morgan’s clothing. The testimonies from relatives in addition to the fibre and trace element evidence lead to the conviction and subsequent hanging of Samuel Morgan.</p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 bg-slate-50 -mx-8 px-8 pb-8">
            <InputField 
              label="What led investigators to conclude the bandage belonged to the suspect and not the victim, and linked him to the military?"
              value={answers.caseStudies.morganConclusion}
              onChange={(val) => updateAnswer('caseStudies', 'morganConclusion', val)}
            />
            <InputField 
              label="Describe the fibre evidence that was found to support the case against Samuel Morgan."
              value={answers.caseStudies.morganFiber}
              onChange={(val) => updateAnswer('caseStudies', 'morganFiber', val)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Trace Evidence Lab</h1>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                <History size={14} />
                Forensic Case File #2024-TE
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="group flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            GENERATE CASE REPORT
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-12 border border-slate-200 print:hidden">
          {[
            { id: 'foundations', label: 'Foundations', icon: BookOpen },
            { id: 'lab', label: 'Analysis Lab', icon: Microscope },
            { id: 'caseStudies', label: 'Case Files', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-md scale-100' 
                  : 'text-slate-500 hover:text-slate-700 scale-95 opacity-70'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="min-h-[50vh]">
          {activeTab === 'foundations' && renderFoundations()}
          {activeTab === 'lab' && renderLab()}
          {activeTab === 'caseStudies' && renderCaseStudies()}
        </main>

        {/* Static Footer Nav */}
        <div className="mt-8 pt-8 pb-12 border-t border-slate-200 flex justify-between gap-4 print:hidden">
          <button 
            disabled={activeTab === 'foundations'}
            onClick={() => setActiveTab(activeTab === 'caseStudies' ? 'lab' : 'foundations')}
            className={`px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'foundations' ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
          >
            Previous
          </button>
          <button 
            disabled={activeTab === 'caseStudies'}
            onClick={() => setActiveTab(activeTab === 'foundations' ? 'lab' : 'caseStudies')}
            className={`px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${activeTab === 'caseStudies' ? 'opacity-50 cursor-not-allowed bg-indigo-300 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-200'}`}
          >
            Continue
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .fixed, nav, header button, .bg-slate-200\/50 { display: none !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .bg-slate-50 { background: white !important; }
          .animate-in { display: block !important; opacity: 1 !important; transform: none !important; }
          main { padding-bottom: 0 !important; }
          textarea { border: 1px solid #e2e8f0 !important; height: auto !important; min-height: 80px !important; }
          h3 { margin-top: 2rem !important; }
          .mb-12 { margin-bottom: 1.5rem !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 8px !important; }
          .bg-slate-900 { background: #f8fafc !important; color: black !important; border: 1px solid #ddd !important; }
          .shadow-xl, .shadow-2xl, .shadow-lg { shadow: none !important; box-shadow: none !important; }
          .prose { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
