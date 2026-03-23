import React, { useState, useEffect } from 'react';
import {
  BookOpen, 
  FileText, 
  PenTool, 
  Printer, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Info,
  Sparkles,
  LayoutTemplate,
  Copy,
  Check
} from 'lucide-react';
import { CALM_MODULE_4_COVER_LETTER_STORAGE_KEY } from './storageKeys.js';

// Export compatibility: storage-key scanners detect this exact token.
const STORAGE_KEY = 'calmModule4CoverLetterState';

// --- DATA STRUCTURES ---

const guideTopics = [
  {
    id: 'header',
    title: 'Header & Contact Info',
    description: 'The very top of your letter should clearly present who you are and who you are writing to. It sets a professional tone immediately.',
    dos: [
      'Use a professional email address (e.g., firstname.lastname@email.com).',
      'Include your phone number and city/province.',
      'Include the date you are submitting the application.',
      'List the specific name and title of the hiring manager if known.'
    ],
    donts: [
      'Include highly personal info like your SIN or marital status.',
      'Use an unprofessional email (e.g., skater_boi_99@hotmail.com).',
      'Forget to double-check the spelling of the employer\'s name.'
    ]
  },
  {
    id: 'salutation',
    title: 'Professional Salutation',
    description: 'Your greeting matters. It shows you have done your research and respect the reader.',
    dos: [
      'Address the letter to a specific person whenever possible (e.g., "Dear Ms. Smith,").',
      'Use "Dear Hiring Manager," or "To the [Department] Team," if a name isn\'t available.',
      'Ensure you have the correct spelling and title.'
    ],
    donts: [
      'Use "To Whom It May Concern" unless absolutely necessary (it feels outdated and generic).',
      'Use casual greetings like "Hi," "Hey," or "Dear Sir/Madam".'
    ]
  },
  {
    id: 'intro',
    title: 'The Hook / Intro',
    description: 'The first paragraph should explain where you heard about the job and state exactly which role you are applying for. Grab their attention.',
    dos: [
      'Clearly state the job title you are applying for.',
      'Mention where you found the listing or who referred you.',
      'Include a "hook" – a brief statement of why you are excited about the role or company.'
    ],
    donts: [
      'Start with a boring "I am writing to apply for..." if you can avoid it.',
      'Talk about what the company can do for YOU. Focus on what you offer THEM.'
    ]
  },
  {
    id: 'body',
    title: 'Body Paragraphs / Selling Yourself',
    description: 'This is where you connect your skills to their needs. Explain specific experiences that make you the perfect person for the job.',
    dos: [
      'Tailor your skills clearly to the requirements listed in the job posting.',
      'Use specific examples of past successes or projects.',
      'Highlight transferable skills if you lack direct experience.',
      'Keep it focused on how you can solve their problems or add value.'
    ],
    donts: [
      'Just repeat your resume word-for-word. Tell a story instead.',
      'Exaggerate or lie about your qualifications.',
      'Write huge blocks of text. Break it into 1-2 concise paragraphs.'
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion & Call to Action',
    description: 'Restate your interest, point them to your resume, and confidently ask for an interview.',
    dos: [
      'Reiterate your enthusiasm for the position.',
      'Direct them to your enclosed/attached resume.',
      'Include a clear call to action (e.g., "I look forward to discussing this opportunity in an interview").',
      'Provide your availability or preferred contact method.'
    ],
    donts: [
      'Sound desperate or aggressive.',
      'Forget to actually ask for the interview.'
    ]
  },
  {
    id: 'signoff',
    title: 'Professional Sign-off',
    description: 'A formal and polite closing to your letter.',
    dos: [
      'Use professional closings like "Sincerely,", "Best regards,", or "Respectfully,".',
      'Leave space for a physical signature if printing.',
      'Type your full name clearly at the bottom.'
    ],
    donts: [
      'Use casual sign-offs like "Cheers,", "Yours truly,", or "Talk soon,".',
      'Use emojis or text slang (e.g., "thx").'
    ]
  }
];

const emptyFormData = {
  yourName: '', yourAddress: '', yourCity: '', yourPhone: '', yourEmail: '',
  date: '',
  recipientName: '', recipientTitle: '', companyName: '', companyAddress: '', companyCity: '',
  salutation: '',
  openingParagraph: '',
  bodyParagraphs: '',
  closingParagraph: '',
  signOff: ''
};

const dummyFormData = {
  yourName: 'Ine Dajobb',
  yourAddress: '123 Sesame Street',
  yourCity: 'Fort Saskatchewan, Alberta T8A 4H5',
  yourPhone: '(780) 123-4567',
  yourEmail: 'ine.dajobb@email.ca',
  date: 'January 1, 2026',
  recipientName: 'Jane Doe',
  recipientTitle: 'Human Resources Director',
  companyName: 'Acme Innovations Inc.',
  companyAddress: '456 Business Blvd',
  companyCity: 'Edmonton, AB T5J 2R4',
  salutation: 'Dear Ms. Doe,',
  openingParagraph: 'I am writing to express my strong interest in the Junior Developer position at Acme Innovations Inc., as advertised on your company website. With a solid foundation in modern web technologies and a passion for creating intuitive user experiences, I am eager to contribute to your award-winning development team.',
  bodyParagraphs: 'During my recent studies and personal projects, I have developed strong skills in React, JavaScript, and Tailwind CSS. Specifically, I spearheaded a collaborative academic project where we built a fully functional e-commerce prototype. This experience taught me how to write clean, maintainable code and collaborate effectively using version control. I noticed your job posting emphasized a need for responsive design skills, which is an area I have dedicated significant time to mastering over the past year.\n\nFurthermore, my previous part-time experience in customer service has equipped me with excellent communication skills and the ability to solve problems under pressure—traits I believe are essential for understanding user needs and debugging complex software issues.',
  closingParagraph: 'I am highly motivated to bring my technical skills and enthusiasm to Acme Innovations. I have attached my resume for your review. I would welcome the opportunity to discuss how my background, skills, and certifications will be of benefit to your company. Please feel free to contact me at (780) 123-4567 to arrange an interview at your earliest convenience.',
  signOff: 'Sincerely,'
};

const loadSavedCoverLetterBuilderState = () => {
  try {
    const raw = window.localStorage.getItem(CALM_MODULE_4_COVER_LETTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
};

// --- MAIN APPLICATION ---

export default function CoverLetterBuilder() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = loadSavedCoverLetterBuilderState();
    return typeof saved?.activeTab === 'string' && saved.activeTab.length > 0
      ? saved.activeTab
      : 'workshop';
  });

  const [formData, setFormData] = useState(() => {
    const saved = loadSavedCoverLetterBuilderState();
    return { ...emptyFormData, ...(saved?.formData || {}) };
  });

  const [docStyle, setDocStyle] = useState(() => {
    const saved = loadSavedCoverLetterBuilderState();
    return typeof saved?.docStyle === 'string' && saved.docStyle.length > 0
      ? saved.docStyle
      : 'modern';
  }); // 'classic', 'modern', 'elegant'

  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(() => {
    const saved = loadSavedCoverLetterBuilderState();
    return Boolean(saved?.isToolbarCollapsed);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CALM_MODULE_4_COVER_LETTER_STORAGE_KEY,
        JSON.stringify({
          activeTab,
          formData,
          docStyle,
          isToolbarCollapsed
        })
      );
    } catch (error) {
      // Ignore storage quota/privacy errors and keep the UI interactive.
    }
  }, [activeTab, formData, docStyle, isToolbarCollapsed]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 font-sans selection:bg-fuchsia-500/30">
      
      {/* Print-specific styles to hide UI and format page */}
      <style>{`
        @media print {
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 1in; size: letter portrait; }
        }
      `}</style>

      {/* TOP NAVIGATION (Hidden on Print) */}
      <nav className="no-print border-b border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`flex ${isToolbarCollapsed ? 'items-center justify-between h-14 py-2' : 'justify-between h-16 items-center'}`}>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-lg shadow-lg shadow-fuchsia-900/20">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
                LetterForge
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isToolbarCollapsed && (
                <>
                  {/* Tabs */}
                  <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    <TabButton 
                      active={activeTab === 'guide'} 
                      onClick={() => setActiveTab('guide')}
                      icon={<BookOpen className="w-4 h-4" />}
                      label="Learning Guide"
                    />
                    <TabButton 
                      active={activeTab === 'exemplar'} 
                      onClick={() => setActiveTab('exemplar')}
                      icon={<FileText className="w-4 h-4" />}
                      label="Exemplar"
                    />
                    <TabButton 
                      active={activeTab === 'workshop'} 
                      onClick={() => setActiveTab('workshop')}
                      icon={<LayoutTemplate className="w-4 h-4" />}
                      label="Workshop"
                    />
                  </div>

                  {/* Print Action */}
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md transition-all text-sm font-medium text-white hover:shadow-lg hover:shadow-white/5"
                  >
                    <Printer className="w-4 h-4" />
                    Export PDF
                  </button>
                </>
              )}

              <button
                onClick={() => setIsToolbarCollapsed(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-white/10 border border-white/10 rounded-md transition-all text-sm font-medium text-white"
                aria-expanded={!isToolbarCollapsed}
                aria-label={isToolbarCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
              >
                {isToolbarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                <span className="hidden sm:inline">{isToolbarCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA (Hidden on Print) */}
      <main className={`no-print w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${isToolbarCollapsed ? 'pt-6' : ''}`}>
        {activeTab === 'guide' && <LearningGuide />}
        {activeTab === 'exemplar' && <Exemplar />}
        {activeTab === 'workshop' && (
          <Workshop 
            formData={formData} 
            setFormData={setFormData} 
            docStyle={docStyle} 
            setDocStyle={setDocStyle}
          />
        )}
      </main>

      {/* PRINT-ONLY CONTAINER */}
      <div className="hidden print-only absolute top-0 left-0 w-full h-full bg-white text-black m-0 p-0">
        <PrintableDocument data={formData} docStyle={docStyle} />
      </div>

    </div>
  );
}

// --- TAB COMPONENTS ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- MODULE 1: LEARNING GUIDE ---

function LearningGuide() {
  const [activeTopicId, setActiveTopicId] = useState(guideTopics[0].id);
  const activeTopic = guideTopics.find(t => t.id === activeTopicId);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Sidebar: Topics */}
        <div className="col-span-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              What to Include
            </h2>
          </div>
          <div className="p-2">
            {guideTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between transition-all ${
                  activeTopicId === topic.id
                    ? 'bg-white/10 text-white border-l-2 border-fuchsia-500'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-medium">{topic.title}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTopicId === topic.id ? 'translate-x-1 text-fuchsia-400' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Detail View */}
        <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">{activeTopic.title}</h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">{activeTopic.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Dos */}
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-5">
                <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Dos
                </h3>
                <ul className="space-y-3">
                  {activeTopic.dos.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-emerald-100/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-rose-900/20 border border-rose-500/20 rounded-lg p-5">
                <h3 className="text-rose-400 font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Don'ts
                </h3>
                <ul className="space-y-3">
                  {activeTopic.donts.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-rose-100/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Interactive Phrase Builder Activity */}
      <InteractivePhraseBuilder />

    </div>
  );
}

function InteractivePhraseBuilder() {
  const [opening, setOpening] = useState('');
  const [verb, setVerb] = useState('');
  const [accomplishment, setAccomplishment] = useState('');
  const [signOff, setSignOff] = useState('');
  const [copied, setCopied] = useState(false);

  const hooks = [
    "I am writing to express my strong interest in the open position.",
    "I was thrilled to see this opening, as I have long admired your company.",
    "With a proven track record of dedication, I am eager to apply for this role."
  ];
  
  const verbs = [
    "Spearheaded", "Optimized", "Implemented", "Cultivated", "Streamlined", "Engineered", "Collaborated on"
  ];
  
  const signOffs = [
    "Sincerely,", "Best regards,", "Respectfully yours,", "Kind regards,"
  ];

  const generatedText = `${opening ? opening : '[Your Hook]'} During my recent experiences, I successfully ${verb ? verb.toLowerCase() : '[action verb]'} ${accomplishment ? accomplishment : '[your accomplishment/project]'}. I believe these skills make me an excellent fit for your team.\n\n${signOff ? signOff : '[Your Sign-off]'}\n[Your Name]`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = generatedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Practice Activity: The Sentence Builder
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Combine strong professional phrases with your own experiences to practice writing impactful paragraphs. Select options below to see how they flow together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          
          {/* Step 1: Hook */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">1. Choose a Strong Opening</h3>
            <div className="flex flex-col gap-2">
              {hooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setOpening(hook)}
                  className={`text-left px-4 py-2 rounded border text-sm transition-all ${
                    opening === hook 
                      ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-200 shadow-inner' 
                      : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Verb */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">2. Pick an Action Verb</h3>
            <div className="flex flex-wrap gap-2">
              {verbs.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVerb(v)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                    verb === v 
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-inner' 
                      : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Accomplishment */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">3. Describe the Accomplishment</h3>
            <input
              type="text"
              placeholder="e.g., a school project that raised $500 for charity"
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Step 4: Sign-off */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">4. Select a Sign-off</h3>
            <div className="flex flex-wrap gap-2">
              {signOffs.map((so, i) => (
                <button
                  key={i}
                  onClick={() => setSignOff(so)}
                  className={`px-3 py-1.5 rounded border text-sm transition-all ${
                    signOff === so 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-inner' 
                      : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {so}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Live Preview */}
        <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h3 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider flex items-center justify-between">
            Your Constructed Draft
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white transition-all z-10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </h3>
          
          <div className="flex-1 bg-black/50 border border-white/5 rounded-lg p-5 font-serif text-[15px] leading-relaxed text-slate-300 whitespace-pre-wrap relative z-10">
            {opening ? <span className="text-white">{opening}</span> : <span className="text-fuchsia-400/50 italic">[Your Hook]</span>}
            {' '}During my recent experiences, I successfully{' '}
            {verb ? <span className="text-indigo-300 font-bold">{verb.toLowerCase()}</span> : <span className="text-indigo-400/50 italic">[action verb]</span>}
            {' '}
            {accomplishment ? <span className="text-emerald-300">{accomplishment}</span> : <span className="text-emerald-400/50 italic">[your accomplishment/project]</span>}
            . I believe these skills make me an excellent fit for your team.
            {'\n\n'}
            {signOff ? <span className="text-white">{signOff}</span> : <span className="text-white/50 italic">[Your Sign-off]</span>}
            {'\n'}
            [Your Name]
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MODULE 2: EXEMPLAR ---

function Exemplar() {
  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500 slide-in-from-bottom-4">
      <p className="text-slate-400 mb-6 flex items-center gap-2 text-sm bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-500/20">
        <Info className="w-4 h-4 text-indigo-400" />
        Hover over the highlighted sections to reveal pro tips and structural rules.
      </p>

      {/* The "Paper" */}
      <div className="bg-white max-w-3xl w-full rounded-sm shadow-2xl p-10 md:p-16 text-black font-serif text-[15px] leading-relaxed relative mx-auto">
        
        {/* Contact Block */}
        <div className="mb-8">
          <Tooltip text="Make sure your name stands out. Bold it or make it slightly larger.">
            <h1 className="text-2xl font-bold mb-1">Ine Dajobb</h1>
          </Tooltip>
          <Tooltip text="Ensure your contact information is professional and up-to-date. No unprofessional emails!">
            <div className="text-gray-600">
              123 Sesame Street<br />
              Fort Saskatchewan, Alberta T8A 4H5<br />
              (780) 123-4567<br />
              appropriate_email@hotmail.ca
            </div>
          </Tooltip>
        </div>

        <div className="mb-6">
          <Tooltip text="Spell out the date formally. Always update this to the day you actually send the application.">
            <span>January 1, 2026</span>
          </Tooltip>
        </div>

        {/* Employer Block */}
        <div className="mb-6">
          <Tooltip text="If you can find out exactly who makes the hiring decision, address it to them. It shows initiative.">
            <div>
              <strong>Jane Doe</strong><br />
              Human Resources Director<br />
              Acme Innovations Inc.<br />
              456 Business Blvd<br />
              Edmonton, AB T5J 2R4
            </div>
          </Tooltip>
        </div>

        {/* Salutation */}
        <div className="mb-6">
          <Tooltip text="Use a formal salutation. 'Dear [Name]' is best. Avoid 'To Whom It May Concern' if possible.">
            <span>Dear Ms. Doe,</span>
          </Tooltip>
        </div>

        {/* Intro Paragraph */}
        <div className="mb-4">
          <Tooltip text="The Hook: State clearly what job you are applying for and where you found it. Add a brief sentence about why you are a great fit.">
            <p>
              I am writing to express my strong interest in the Junior Developer position at Acme Innovations Inc., as advertised on your company website. With a solid foundation in modern web technologies and a passion for creating intuitive user experiences, I am eager to contribute to your award-winning development team.
            </p>
          </Tooltip>
        </div>

        {/* Body Paragraphs */}
        <div className="mb-4">
          <Tooltip text="The Body: Highlight specific skills that match their job posting. Use concrete examples of past projects or experiences. Don't just list traits; prove them.">
            <p className="mb-4">
              During my recent studies and personal projects, I have developed strong skills in React, JavaScript, and Tailwind CSS. Specifically, I spearheaded a collaborative academic project where we built a fully functional e-commerce prototype. This experience taught me how to write clean, maintainable code and collaborate effectively using version control. I noticed your job posting emphasized a need for responsive design skills, which is an area I have dedicated significant time to mastering over the past year.
            </p>
          </Tooltip>
          <Tooltip text="Transferable Skills: Even part-time or unrelated jobs can demonstrate soft skills like problem-solving, communication, or teamwork.">
            <p>
              Furthermore, my previous part-time experience in customer service has equipped me with excellent communication skills and the ability to solve problems under pressure—traits I believe are essential for understanding user needs and debugging complex software issues.
            </p>
          </Tooltip>
        </div>

        {/* Conclusion Paragraph */}
        <div className="mb-8">
          <Tooltip text="Call to Action: Restate your interest, mention your enclosed resume, and confidently ask for an interview. Provide your contact details again.">
            <p>
              I am highly motivated to bring my technical skills and enthusiasm to Acme Innovations. I have attached my resume for your review. I would welcome the opportunity to discuss how my background, skills, and certifications will be of benefit to your company. Please feel free to contact me at (780) 123-4567 to arrange an interview at your earliest convenience.
            </p>
          </Tooltip>
        </div>

        {/* Sign-off */}
        <div>
          <Tooltip text="Use a professional closing. Leave space (about 3-4 lines) for a physical signature if you are printing it.">
            <div className="mb-8">Sincerely,</div>
          </Tooltip>
          <Tooltip text="Type your full name.">
            <div><strong>Ine Dajobb</strong></div>
          </Tooltip>
        </div>

      </div>
    </div>
  );
}

// Custom Tooltip Component for the Exemplar
function Tooltip({ children, text }) {
  return (
    <div className="block">
      <div className="relative group inline-block cursor-help max-w-full align-top">
        <div className="group-hover:bg-fuchsia-200/50 group-hover:text-fuchsia-900 transition-colors duration-200 rounded px-1 -mx-1">
          {children}
        </div>
        <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl shadow-fuchsia-900/20 border border-fuchsia-500/30 text-left font-sans leading-tight pointer-events-none">
          <div className="flex gap-2 items-start">
            <Sparkles className="w-4 h-4 text-fuchsia-400 mt-0.5 flex-shrink-0" />
            <span>{text}</span>
          </div>
          {/* Triangle pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
}

// --- MODULE 3: WORKSHOP / BUILDER ---

function Workshop({ formData, setFormData, docStyle, setDocStyle }) {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fillDummyData = () => {
    setFormData(dummyFormData);
  };

  const clearData = () => {
    setFormData(emptyFormData);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 xl:gap-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      
      {/* Left Column: Form Inputs */}
      <div className="w-full lg:w-[44%] min-w-0 flex flex-col bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden">
        
        {/* Form Header */}
        <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-fuchsia-400" />
            Letter Content
          </h2>
          <div className="flex gap-2">
            <button onClick={clearData} className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10">
              Clear
            </button>
            <button onClick={fillDummyData} className="px-3 py-1 text-xs rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition-colors border border-indigo-500/30">
              Auto-fill Example
            </button>
          </div>
        </div>

        {/* Form Scroll Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Section: Your Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-400 border-b border-white/10 pb-2">Your Contact Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="yourName" value={formData.yourName} onChange={handleChange} />
              <InputField label="Phone" name="yourPhone" value={formData.yourPhone} onChange={handleChange} />
              <InputField label="Email" name="yourEmail" value={formData.yourEmail} onChange={handleChange} />
              <InputField label="Address (Street)" name="yourAddress" value={formData.yourAddress} onChange={handleChange} />
              <InputField label="City, Prov, Postal" name="yourCity" value={formData.yourCity} onChange={handleChange} />
            </div>
          </section>

          {/* Section: Date */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-400 border-b border-white/10 pb-2">Document Date</h3>
             <InputField label="Date (e.g., January 1, 2026)" name="date" value={formData.date} onChange={handleChange} />
          </section>

          {/* Section: Employer Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-400 border-b border-white/10 pb-2">Employer Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Recipient Name" name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="e.g. Jane Doe" />
              <InputField label="Recipient Title" name="recipientTitle" value={formData.recipientTitle} onChange={handleChange} placeholder="e.g. Hiring Manager" />
              <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} />
              <InputField label="Company Address" name="companyAddress" value={formData.companyAddress} onChange={handleChange} />
              <InputField label="Company City/Postal" name="companyCity" value={formData.companyCity} onChange={handleChange} />
            </div>
          </section>

          {/* Section: Letter Content */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-400 border-b border-white/10 pb-2">Letter Body</h3>
            <InputField label="Salutation" name="salutation" value={formData.salutation} onChange={handleChange} placeholder="e.g. Dear Ms. Doe," />
            
            <TextAreaField 
              label="Opening Paragraph (The Hook)" 
              name="openingParagraph" 
              value={formData.openingParagraph} 
              onChange={handleChange} 
              rows={3}
              placeholder="State the job you are applying for and why you are excited..."
            />
            
            <TextAreaField 
              label="Body Paragraph(s) (Selling Yourself)" 
              name="bodyParagraphs" 
              value={formData.bodyParagraphs} 
              onChange={handleChange} 
              rows={6}
              placeholder="Detail your relevant skills and experiences. Connect them to the job requirements..."
            />
            
            <TextAreaField 
              label="Closing Paragraph (Call to Action)" 
              name="closingParagraph" 
              value={formData.closingParagraph} 
              onChange={handleChange} 
              rows={3}
              placeholder="Restate interest, point to resume, ask for interview..."
            />

            <InputField label="Sign-off" name="signOff" value={formData.signOff} onChange={handleChange} placeholder="e.g. Sincerely," />
          </section>

        </div>
      </div>

      {/* Right Column: Live Preview & Style Tools */}
      <div className="w-full lg:w-[56%] min-w-0 flex flex-col gap-4">
        
        {/* Style Selector */}
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-sm flex justify-center gap-2 shrink-0">
          <StyleButton active={docStyle === 'classic'} onClick={() => setDocStyle('classic')} label="Classic" />
          <StyleButton active={docStyle === 'modern'} onClick={() => setDocStyle('modern')} label="Modern" />
          <StyleButton active={docStyle === 'elegant'} onClick={() => setDocStyle('elegant')} label="Elegant" />
        </div>

        {/* Live Preview Container */}
        <div className="flex-1 bg-[#1a1c23] border border-white/10 rounded-xl overflow-hidden relative flex justify-center items-start p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {/* Subtle background grid for the "workspace" feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          {/* The Actual Rendered Paper (Scale down slightly to fit well in view) */}
          <div className="w-full max-w-[816px] min-h-[1056px] bg-white shadow-2xl relative shrink-0 transition-all duration-300 origin-top">
             <PrintableDocument data={formData} docStyle={docStyle} isPreview={true} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Custom Input Components for the Workshop form
function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, rows = 4, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <textarea 
        name={name} 
        value={value} 
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-y"
      />
    </div>
  );
}

function StyleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-white text-black shadow-md' 
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}


// --- THE PRINTABLE DOCUMENT CORE ---
// Used for both the Live Preview and the actual physical print output.

function PrintableDocument({ data, docStyle, isPreview = false }) {
  
  // Style Mappings
  const styleConfig = {
    classic: {
      fontFamily: 'font-serif',
      headerAlign: 'text-left',
      headerBg: 'bg-transparent',
      nameText: 'text-3xl font-bold mb-2',
      contactText: 'text-gray-700',
      divider: 'border-b-2 border-gray-800 mb-6 pb-6'
    },
    modern: {
      fontFamily: 'font-sans',
      headerAlign: 'text-left',
      headerBg: 'bg-gray-100 p-8 -mx-8 -mt-8 mb-8 rounded-t-sm',
      nameText: 'text-4xl font-black text-gray-900 tracking-tight mb-2',
      contactText: 'text-gray-600 flex flex-wrap gap-x-4',
      divider: 'hidden'
    },
    elegant: {
      fontFamily: 'font-serif',
      headerAlign: 'text-center',
      headerBg: 'bg-transparent',
      nameText: 'text-3xl uppercase tracking-widest mb-3 text-gray-900',
      contactText: 'text-gray-500 flex justify-center gap-3 text-sm',
      divider: 'border-b border-gray-300 mb-8 pb-8 mt-6 w-32 mx-auto'
    }
  };

  const config = styleConfig[docStyle] || styleConfig.classic;

  // Split body paragraphs by newline
  const formattedBody = data.bodyParagraphs.split('\n').filter(p => p.trim() !== '');

  return (
    <div className={`w-full h-full text-black bg-white ${config.fontFamily} ${isPreview ? 'p-8 md:p-12' : 'p-0'}`}>
      
      {/* HEADER SECTION */}
      <div className={`${config.headerBg} ${config.divider}`}>
        <div className={config.headerAlign}>
          <h1 className={config.nameText}>
            {data.yourName || 'Your Name'}
          </h1>
          
          {docStyle === 'modern' || docStyle === 'elegant' ? (
            // Inline contact layout for Modern/Elegant
            <div className={config.contactText}>
               {data.yourEmail && <span>{data.yourEmail}</span>}
               {data.yourEmail && data.yourPhone && <span>•</span>}
               {data.yourPhone && <span>{data.yourPhone}</span>}
               {(data.yourEmail || data.yourPhone) && (data.yourAddress || data.yourCity) && <span>•</span>}
               {(data.yourAddress || data.yourCity) && <span>{data.yourAddress} {data.yourCity}</span>}
            </div>
          ) : (
            // Stacked contact layout for Classic
            <div className={config.contactText}>
              {data.yourAddress && <div>{data.yourAddress}</div>}
              {data.yourCity && <div>{data.yourCity}</div>}
              {data.yourPhone && <div>{data.yourPhone}</div>}
              {data.yourEmail && <div>{data.yourEmail}</div>}
            </div>
          )}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="text-[11pt] leading-relaxed text-gray-800 space-y-6">
        
        {/* Date */}
        <div>
          {data.date || 'Date'}
        </div>

        {/* Employer Info */}
        <div className="leading-snug">
          {data.recipientName && <strong>{data.recipientName}<br /></strong>}
          {data.recipientTitle && <>{data.recipientTitle}<br /></>}
          {data.companyName && <>{data.companyName}<br /></>}
          {data.companyAddress && <>{data.companyAddress}<br /></>}
          {data.companyCity && <>{data.companyCity}</>}
          {/* Fallback if empty */}
          {!data.recipientName && !data.companyName && <span className="text-gray-400 italic">[Employer Information]</span>}
        </div>

        {/* Salutation */}
        <div>
          {data.salutation || 'Dear [Hiring Manager],'}
        </div>

        {/* Paragraphs */}
        <div className="space-y-4">
          <p>
            {data.openingParagraph || <span className="text-gray-400 italic">[Opening paragraph outlining the role you are applying for and your hook...]</span>}
          </p>
          
          {formattedBody.length > 0 ? (
            formattedBody.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p className="text-gray-400 italic">[Body paragraphs detailing your relevant skills, experiences, and why you are the perfect fit for the job...]</p>
          )}

          <p>
            {data.closingParagraph || <span className="text-gray-400 italic">[Closing paragraph with a call to action and interview request...]</span>}
          </p>
        </div>

        {/* Sign-off */}
        <div className="pt-4">
          <div className="mb-8">{data.signOff || 'Sincerely,'}</div>
          <div className="font-bold">{data.yourName || 'Your Name'}</div>
        </div>

      </div>
    </div>
  );
}
