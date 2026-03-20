import React, { useState, useEffect } from 'react';
import { 
  Save, 
  ExternalLink, 
  BrainCircuit, 
  Target, 
  HeartHandshake, 
  Lightbulb, 
  Briefcase, 
  Award, 
  UserPlus, 
  Settings,
  LayoutDashboard,
  BookOpen
} from 'lucide-react';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    interests: { rank1: '', rank2: '', rank3: '', desc1: '', desc2: '', desc3: '', summary: '', occupations: '' },
    abilities: { rank1: '', rank2: '', rank3: '', desc1: '', desc2: '', desc3: '', summary: '', occupations: '' },
    workValues: { top5: '' },
    intelligences: { intel1: '', intel2: '', intel3: '', summary: '', strat1: '', strat2: '', strat3: '' },
    experiences: { exp1Desc: '', exp1Proud: '', exp2Desc: '', exp2Proud: '', helpCareer: '' },
    skills: { difference: '', top10: '', helpCareer: '' },
    traits: { definition: '', top10: '', helpCareer: '' },
    conditions: { top5: '', helpCareer: '' }
  });

  const [activeSection, setActiveSection] = useState('instructions');
  // Helper to handle nested state updates
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { id: 'instructions', label: 'Start Here', icon: <BookOpen size={16} /> },
    { id: 'interests', label: '1. Interests', icon: <Target size={16} /> },
    { id: 'abilities', label: '2. Abilities', icon: <BrainCircuit size={16} /> },
    { id: 'workValues', label: '3. Work Values', icon: <HeartHandshake size={16} /> },
    { id: 'intelligences', label: '4. Multiple Intelligences', icon: <Lightbulb size={16} /> },
    { id: 'experiences', label: '5. Experiences', icon: <Briefcase size={16} /> },
    { id: 'skills', label: '6. Skills', icon: <Award size={16} /> },
    { id: 'traits', label: '7. Traits', icon: <UserPlus size={16} /> },
    { id: 'conditions', label: '8. Working Conditions', icon: <Settings size={16} /> }
  ];

  // Calculate generic progress
  const activeIndex = navItems.findIndex(item => item.id === activeSection);
  const progressPercentage = Math.max(5, Math.round(((activeIndex) / (navItems.length - 1)) * 100));

  // --- REUSABLE UI COMPONENTS ---
  const InputGroup = ({ label, value, onChange, placeholder, type = 'text', rows = 3 }) => (
    <div className="mb-8">
      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#9AA0B8] mb-3">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Your thoughts...'}
          rows={rows}
          className="w-full bg-[#111322] border border-[#2A2D4A] rounded-xl p-4 text-white placeholder-[#4A4D6A] focus:outline-none focus:border-[#E8437D] transition-colors resize-y shadow-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Enter value...'}
          className="w-full bg-[#111322] border border-[#2A2D4A] rounded-xl p-4 text-white placeholder-[#4A4D6A] focus:outline-none focus:border-[#E8437D] transition-colors shadow-sm"
        />
      )}
    </div>
  );

  const SectionCard = ({ id, title, icon, children }) => (
    <div id={id} className={`transition-opacity duration-300 ${activeSection === id ? 'block' : 'hidden'}`}>
      <div className="bg-[#1A1D36] rounded-2xl p-8 relative overflow-hidden border border-[#2A2D4A]">
        {/* Left Gradient Strip */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#E8437D] to-[#8B5CF6]"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-[#E8437D]/10 text-[#E8437D] rounded-full ring-1 ring-[#E8437D]/30">
            {icon}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#090A10] text-slate-200 font-sans selection:bg-[#E8437D]/30">
      
      {/* Global styles for robust printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 20mm; }
          h1, h2, h3, h4 { color: #111827 !important; }
          p, span, div { color: #374151 !important; }
          .print-section { page-break-inside: avoid; margin-bottom: 30px; }
          .print-field { margin-bottom: 15px; }
          .print-label { font-weight: bold; font-size: 0.9em; margin-bottom: 4px; color: #4b5563 !important; text-transform: uppercase; letter-spacing: 0.05em; }
          .print-value { padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; min-height: 40px; background: #f9fafb !important; white-space: pre-wrap; }
        }
      `}} />

      {/* TOP NAVIGATION (Hidden on Print) */}
      <nav className="no-print border-b border-white/10 bg-white/5 backdrop-blur-md overflow-visible transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-lg shadow-lg shadow-fuchsia-900/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
                  Career Planner
                </span>
                <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">
                  Career & Portfolio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-4 bg-[#131526] px-4 py-2 rounded-full border border-[#2A2D4A] shadow-inner">
                <span className="text-[10px] font-extrabold text-[#9AA0B8] uppercase tracking-widest">Progress</span>
                <div className="w-24 h-1.5 bg-[#2A2D4A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E8437D] to-[#8B5CF6] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-white w-6">{progressPercentage}%</span>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#1A1D36] hover:bg-[#232747] border border-[#2A2D4A] transition-colors px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold text-white tracking-widest uppercase shadow-sm"
              >
                <Save size={14} />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="flex items-start gap-3 py-3">
              <span className="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-[0.35em] text-slate-500 shrink-0 pr-2 pt-2">
                Topics
              </span>
              <div className="grid flex-1 min-w-0 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-2">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                        isActive
                          ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white border-fuchsia-400/30 shadow-lg shadow-indigo-900/20'
                          : 'text-slate-400 border-white/10 hover:text-white hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- APP UI (SCREEN MODE) --- */}
      <div className="no-print flex flex-col flex-1 min-h-0 overflow-hidden bg-[#090A10]">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-[#090A10]">
          {/* Content Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 relative">
            <div className="w-full max-w-none mt-4">

              {/* Instructions Section */}
              <div id="instructions" className={`transition-opacity duration-300 ${activeSection === 'instructions' ? 'block' : 'hidden'}`}>
                 <div className="bg-[#1A1D36] rounded-2xl p-10 relative overflow-hidden border border-[#2A2D4A]">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#E8437D] to-[#8B5CF6]"></div>
                    <BookOpen size={40} className="text-[#E8437D] mb-6" />
                    <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Online Career Planning Tools</h2>
                    <p className="text-[#9AA0B8] mb-8 leading-relaxed max-w-5xl text-sm">
                      Welcome to your digital career planner. Follow the instructions below to complete your ALIS assessments, then record your insights here to generate a comprehensive career plan document.
                    </p>
                    
                    <div className="bg-[#111322] border border-[#2A2D4A] p-6 rounded-xl inline-flex flex-col items-start w-full max-w-4xl mb-8">
                      <p className="text-xs font-bold text-[#9AA0B8] uppercase tracking-wider mb-4">Action Required</p>
                      <p className="text-sm text-white mb-4">Go to alis.alberta.ca or search ALIS on Google</p>
                      <a href="https://alis.alberta.ca" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#E8437D] hover:bg-[#D43A70] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors w-full shadow-lg shadow-[#E8437D]/20">
                        Open ALIS Platform <ExternalLink size={16} />
                      </a>
                    </div>
                    
                    <div className="space-y-4 text-sm text-[#9AA0B8] max-w-5xl">
                      <div className="flex gap-4"><span className="font-bold text-[#E8437D]">01</span><p>Sign Up or Sign In with a Guest Account.</p></div>
                      <div className="flex gap-4"><span className="font-bold text-[#E8437D]">02</span><p>Go to "My Account" → "My Career Plan" → "Explore Quizzes".</p></div>
                      <div className="flex gap-4"><span className="font-bold text-[#E8437D]">03</span><p>Find the "Know Yourself" section.</p></div>
                      <div className="flex gap-4"><span className="font-bold text-[#E8437D]">04</span><p>Complete the 9 exercises and answer the corresponding questions in this tool.</p></div>
                    </div>
                 </div>
              </div>

              {/* 1. Interests */}
              <SectionCard id="interests" title="Interests Exercise" icon={<Target size={24} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Rank 1 Interest Code" value={formData.interests.rank1} onChange={(v) => handleChange('interests', 'rank1', v)} placeholder="E.g., R" />
                  <InputGroup label="Rank 2 Interest Code" value={formData.interests.rank2} onChange={(v) => handleChange('interests', 'rank2', v)} placeholder="E.g., I" />
                  <InputGroup label="Rank 3 Interest Code" value={formData.interests.rank3} onChange={(v) => handleChange('interests', 'rank3', v)} placeholder="E.g., A" />
                </div>
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-white font-bold mb-4">Brief description of your interest codes:</p>
                  <InputGroup label="Code 1 Description" value={formData.interests.desc1} onChange={(v) => handleChange('interests', 'desc1', v)} />
                  <InputGroup label="Code 2 Description" value={formData.interests.desc2} onChange={(v) => handleChange('interests', 'desc2', v)} />
                  <InputGroup label="Code 3 Description" value={formData.interests.desc3} onChange={(v) => handleChange('interests', 'desc3', v)} />
                </div>
                <InputGroup 
                  type="textarea" label="Do these descriptions sound like a good summary of YOUR interests? Add or take away anything?" 
                  value={formData.interests.summary} onChange={(v) => handleChange('interests', 'summary', v)} 
                />
                <InputGroup 
                  type="textarea" label="List three matching occupations that stand out to you:" 
                  value={formData.interests.occupations} onChange={(v) => handleChange('interests', 'occupations', v)} 
                />
              </SectionCard>

              {/* 2. Abilities */}
              <SectionCard id="abilities" title="Abilities Exercise" icon={<BrainCircuit size={24} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Rank 1 Ability" value={formData.abilities.rank1} onChange={(v) => handleChange('abilities', 'rank1', v)} />
                  <InputGroup label="Rank 2 Ability" value={formData.abilities.rank2} onChange={(v) => handleChange('abilities', 'rank2', v)} />
                  <InputGroup label="Rank 3 Ability" value={formData.abilities.rank3} onChange={(v) => handleChange('abilities', 'rank3', v)} />
                </div>
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-white font-bold mb-4">Brief description of your top 3 abilities:</p>
                  <InputGroup label="Ability 1 Description" value={formData.abilities.desc1} onChange={(v) => handleChange('abilities', 'desc1', v)} />
                  <InputGroup label="Ability 2 Description" value={formData.abilities.desc2} onChange={(v) => handleChange('abilities', 'desc2', v)} />
                  <InputGroup label="Ability 3 Description" value={formData.abilities.desc3} onChange={(v) => handleChange('abilities', 'desc3', v)} />
                </div>
                <InputGroup 
                  type="textarea" label="Do you agree with these top three abilities? Explain." 
                  value={formData.abilities.summary} onChange={(v) => handleChange('abilities', 'summary', v)} 
                />
                <InputGroup 
                  type="textarea" label="List three NEW matching occupations that stand out to you based on interests & abilities:" 
                  value={formData.abilities.occupations} onChange={(v) => handleChange('abilities', 'occupations', v)} 
                />
              </SectionCard>

              {/* 3. Work Values */}
              <SectionCard id="workValues" title="Work Values Quiz" icon={<HeartHandshake size={24} />}>
                <InputGroup 
                  type="textarea" rows={6} label="What are the 5 work values that you selected as being the most important to you?" 
                  value={formData.workValues.top5} onChange={(v) => handleChange('workValues', 'top5', v)} 
                  placeholder="1.&#10;2.&#10;3.&#10;4.&#10;5."
                />
              </SectionCard>

              {/* 4. Multiple Intelligences */}
              <SectionCard id="intelligences" title="Multiple Intelligences Quiz" icon={<Lightbulb size={24} />}>
                <div className="space-y-2">
                  <p className="text-sm text-white font-bold mb-4">List and describe your top 3 Multiple Intelligences:</p>
                  <InputGroup label="Intelligence #1" value={formData.intelligences.intel1} onChange={(v) => handleChange('intelligences', 'intel1', v)} />
                  <InputGroup label="Intelligence #2" value={formData.intelligences.intel2} onChange={(v) => handleChange('intelligences', 'intel2', v)} />
                  <InputGroup label="Intelligence #3" value={formData.intelligences.intel3} onChange={(v) => handleChange('intelligences', 'intel3', v)} />
                </div>
                <InputGroup 
                  type="textarea" label="Do these Multiple Intelligences sound like you? Anything to add or take away?" 
                  value={formData.intelligences.summary} onChange={(v) => handleChange('intelligences', 'summary', v)} 
                />
                <div className="space-y-2 mt-8">
                  <p className="text-sm text-white font-bold mb-4 leading-relaxed">List learning strategies for each intelligence:<br/><span className="text-[#9AA0B8] font-normal text-xs">Include ones you've tried and at least 1 new strategy.</span></p>
                  <InputGroup type="textarea" label="Strategies for Intelligence #1" value={formData.intelligences.strat1} onChange={(v) => handleChange('intelligences', 'strat1', v)} />
                  <InputGroup type="textarea" label="Strategies for Intelligence #2" value={formData.intelligences.strat2} onChange={(v) => handleChange('intelligences', 'strat2', v)} />
                  <InputGroup type="textarea" label="Strategies for Intelligence #3" value={formData.intelligences.strat3} onChange={(v) => handleChange('intelligences', 'strat3', v)} />
                </div>
              </SectionCard>

              {/* 5. Experiences */}
              <SectionCard id="experiences" title="Identify Your Experiences" icon={<Briefcase size={24} />}>
                <div className="p-4 bg-[#111322] border-l-2 border-[#E8437D] rounded-r-xl mb-8">
                  <p className="text-[#9AA0B8] text-sm">
                    <strong className="text-white">Note:</strong> Provide responses here. You can type "na" on the ALIS website to quickly progress forward.
                  </p>
                </div>
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-3">
                      <span className="bg-[#2A2D4A] text-white text-xs px-2 py-1 rounded">01</span>
                      Significant Experience #1
                    </h3>
                    <InputGroup type="textarea" label="Describe your experience:" value={formData.experiences.exp1Desc} onChange={(v) => handleChange('experiences', 'exp1Desc', v)} />
                    <InputGroup type="textarea" label="Why are you proud of this experience?" value={formData.experiences.exp1Proud} onChange={(v) => handleChange('experiences', 'exp1Proud', v)} />
                  </div>
                  <div className="pt-8 border-t border-[#2A2D4A]">
                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-3">
                      <span className="bg-[#2A2D4A] text-white text-xs px-2 py-1 rounded">02</span>
                      Significant Experience #2
                    </h3>
                    <InputGroup type="textarea" label="Describe your experience:" value={formData.experiences.exp2Desc} onChange={(v) => handleChange('experiences', 'exp2Desc', v)} />
                    <InputGroup type="textarea" label="Why are you proud of this experience?" value={formData.experiences.exp2Proud} onChange={(v) => handleChange('experiences', 'exp2Proud', v)} />
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-[#2A2D4A]">
                  <InputGroup 
                    type="textarea" label="How do you think these experiences can help you in deciding what kind of career might be right for you?" 
                    value={formData.experiences.helpCareer} onChange={(v) => handleChange('experiences', 'helpCareer', v)} 
                  />
                </div>
              </SectionCard>

              {/* 6. Skills */}
              <SectionCard id="skills" title="Skills Quiz" icon={<Award size={24} />}>
                <InputGroup 
                  type="textarea" label="How would you describe the difference between a skill and an ability?" 
                  value={formData.skills.difference} onChange={(v) => handleChange('skills', 'difference', v)} 
                />
                <InputGroup 
                  type="textarea" rows={6} label="What are your top 10 Skills?" 
                  value={formData.skills.top10} onChange={(v) => handleChange('skills', 'top10', v)} 
                />
                <InputGroup 
                  type="textarea" label="How does knowing and recognizing your top 10 skills help you in deciding what kind of career might be right for you?" 
                  value={formData.skills.helpCareer} onChange={(v) => handleChange('skills', 'helpCareer', v)} 
                />
              </SectionCard>

              {/* 7. Traits */}
              <SectionCard id="traits" title="Traits Quiz" icon={<UserPlus size={24} />}>
                <InputGroup 
                  type="textarea" label="What are traits?" 
                  value={formData.traits.definition} onChange={(v) => handleChange('traits', 'definition', v)} 
                />
                <InputGroup 
                  type="textarea" rows={6} label="What are your top 10 traits?" 
                  value={formData.traits.top10} onChange={(v) => handleChange('traits', 'top10', v)} 
                />
                <InputGroup 
                  type="textarea" label="How does knowing and recognizing your top 10 traits help you in deciding what kind of career might be right for you?" 
                  value={formData.traits.helpCareer} onChange={(v) => handleChange('traits', 'helpCareer', v)} 
                />
              </SectionCard>

              {/* 8. Working Conditions */}
              <SectionCard id="conditions" title="Preferred Working Conditions Quiz" icon={<Settings size={24} />}>
                <InputGroup 
                  type="textarea" rows={6} label="What are the 5 working conditions that are most important to you?" 
                  value={formData.conditions.top5} onChange={(v) => handleChange('conditions', 'top5', v)} 
                />
                <InputGroup 
                  type="textarea" label="How does knowing and recognizing your top 5 working conditions help you in deciding what kind of career might be right for you?" 
                  value={formData.conditions.helpCareer} onChange={(v) => handleChange('conditions', 'helpCareer', v)} 
                />
              </SectionCard>

              {/* Footer Nav inside Content Area */}
              {activeSection !== 'instructions' && (
                <div className="mt-8 flex justify-between items-center bg-[#1A1D36] border border-[#2A2D4A] p-6 rounded-2xl">
                  <span className="text-[#9AA0B8] text-xs font-bold uppercase tracking-wider">All changes auto-saved</span>
                  <button 
                    onClick={handlePrint}
                    className="bg-[#E8437D] hover:bg-[#D43A70] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#E8437D]/20"
                  >
                    Generate PDF <Save size={16}/>
                  </button>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      {/* --- PRINT TEMPLATE (HIDDEN ON SCREEN, VISIBLE ON PRINT) --- */}
      <div className="hidden print-only bg-white text-black p-8 max-w-4xl mx-auto font-sans">
        
        <div className="border-b-2 border-gray-800 pb-4 mb-8">
          <h1 className="text-3xl font-extrabold text-black uppercase tracking-wider">Career Planning Workbook</h1>
          <p className="text-gray-600 mt-1">Based on ALIS CAREERinsite Tools</p>
        </div>

        {/* 1. Interests */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">1. Interests Exercise</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="print-label">Rank 1 Interest</div>
              <div className="print-value">{formData.interests.rank1 || ' '}</div>
            </div>
            <div>
              <div className="print-label">Rank 2 Interest</div>
              <div className="print-value">{formData.interests.rank2 || ' '}</div>
            </div>
            <div>
              <div className="print-label">Rank 3 Interest</div>
              <div className="print-value">{formData.interests.rank3 || ' '}</div>
            </div>
          </div>
          <div className="print-field">
            <div className="print-label">Descriptions of top 3 interests:</div>
            <div className="print-value">
              <strong>1:</strong> {formData.interests.desc1}<br/>
              <strong>2:</strong> {formData.interests.desc2}<br/>
              <strong>3:</strong> {formData.interests.desc3}
            </div>
          </div>
          <div className="print-field">
            <div className="print-label">Do these descriptions sound like a good summary of YOUR interests? Add/take away:</div>
            <div className="print-value">{formData.interests.summary || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">Three matching occupations to explore deeper:</div>
            <div className="print-value">{formData.interests.occupations || ' '}</div>
          </div>
        </div>

        {/* 2. Abilities */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">2. Abilities Exercise</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="print-label">Rank 1 Ability</div>
              <div className="print-value">{formData.abilities.rank1 || ' '}</div>
            </div>
            <div>
              <div className="print-label">Rank 2 Ability</div>
              <div className="print-value">{formData.abilities.rank2 || ' '}</div>
            </div>
            <div>
              <div className="print-label">Rank 3 Ability</div>
              <div className="print-value">{formData.abilities.rank3 || ' '}</div>
            </div>
          </div>
          <div className="print-field">
            <div className="print-label">Descriptions of top 3 abilities:</div>
            <div className="print-value">
              <strong>1:</strong> {formData.abilities.desc1}<br/>
              <strong>2:</strong> {formData.abilities.desc2}<br/>
              <strong>3:</strong> {formData.abilities.desc3}
            </div>
          </div>
          <div className="print-field">
            <div className="print-label">Do you agree with these top three abilities? Add/take away:</div>
            <div className="print-value">{formData.abilities.summary || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">Three NEW matching occupations based on interests & abilities:</div>
            <div className="print-value">{formData.abilities.occupations || ' '}</div>
          </div>
        </div>

        {/* 3. Work Values */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">3. Work Values Quiz</h2>
          <div className="print-field">
            <div className="print-label">The 5 work values that are most important to you:</div>
            <div className="print-value min-h-[100px]">{formData.workValues.top5 || ' '}</div>
          </div>
        </div>

        {/* 4. Multiple Intelligences */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">4. Multiple Intelligences Quiz</h2>
          <div className="print-field">
            <div className="print-label">Top 3 Multiple Intelligences:</div>
            <div className="print-value">
              <strong>1:</strong> {formData.intelligences.intel1}<br/>
              <strong>2:</strong> {formData.intelligences.intel2}<br/>
              <strong>3:</strong> {formData.intelligences.intel3}
            </div>
          </div>
          <div className="print-field">
            <div className="print-label">Do these sound like you? Anything to add or take away?</div>
            <div className="print-value">{formData.intelligences.summary || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">Learning strategies for each intelligence:</div>
            <div className="print-value">
              <strong>Intel #1 Strategies:</strong> {formData.intelligences.strat1}<br/><br/>
              <strong>Intel #2 Strategies:</strong> {formData.intelligences.strat2}<br/><br/>
              <strong>Intel #3 Strategies:</strong> {formData.intelligences.strat3}
            </div>
          </div>
        </div>

        {/* 5. Experiences */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">5. Identify Your Experiences</h2>
          <div className="print-field mb-6">
            <h3 className="font-bold mb-2">Significant Experience #1</h3>
            <div className="print-label">Description:</div>
            <div className="print-value mb-2">{formData.experiences.exp1Desc || ' '}</div>
            <div className="print-label">Why are you proud of this experience?</div>
            <div className="print-value">{formData.experiences.exp1Proud || ' '}</div>
          </div>
          <div className="print-field mb-6">
            <h3 className="font-bold mb-2">Significant Experience #2</h3>
            <div className="print-label">Description:</div>
            <div className="print-value mb-2">{formData.experiences.exp2Desc || ' '}</div>
            <div className="print-label">Why are you proud of this experience?</div>
            <div className="print-value">{formData.experiences.exp2Proud || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">How can these experiences help you in deciding your career?</div>
            <div className="print-value">{formData.experiences.helpCareer || ' '}</div>
          </div>
        </div>

        {/* 6. Skills */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">6. Skills Quiz</h2>
          <div className="print-field">
            <div className="print-label">Difference between a skill and an ability:</div>
            <div className="print-value">{formData.skills.difference || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">Top 10 Skills:</div>
            <div className="print-value min-h-[150px]">{formData.skills.top10 || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">How knowing your top 10 skills helps decide a career:</div>
            <div className="print-value">{formData.skills.helpCareer || ' '}</div>
          </div>
        </div>

        {/* 7. Traits */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">7. Traits Quiz</h2>
          <div className="print-field">
            <div className="print-label">What are traits?</div>
            <div className="print-value">{formData.traits.definition || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">Top 10 Traits:</div>
            <div className="print-value min-h-[150px]">{formData.traits.top10 || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">How knowing your top 10 traits helps decide a career:</div>
            <div className="print-value">{formData.traits.helpCareer || ' '}</div>
          </div>
        </div>

        {/* 8. Conditions */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-4">8. Preferred Working Conditions Quiz</h2>
          <div className="print-field">
            <div className="print-label">5 working conditions that are most important to you:</div>
            <div className="print-value min-h-[100px]">{formData.conditions.top5 || ' '}</div>
          </div>
          <div className="print-field">
            <div className="print-label">How knowing your top 5 conditions helps decide a career:</div>
            <div className="print-value">{formData.conditions.helpCareer || ' '}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
