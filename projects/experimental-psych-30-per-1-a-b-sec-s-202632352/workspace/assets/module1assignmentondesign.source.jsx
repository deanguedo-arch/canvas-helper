import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  AlertTriangle,
  ArrowRight,
  Copy,
  Microscope,
  FileText,
  Lightbulb,
  Printer,
  ShieldCheck,
  Award
} from 'lucide-react';

// --- DATA ---
// Unified Scenario: All methodologies are testing the SAME core research question.
const RESEARCH_OBJECTIVE = "The Impact of Smartphone Notifications on High School Student Attention and Academic Performance.";

const METHODOLOGIES = {
  naturalistic: {
    id: 'naturalistic',
    name: 'Naturalistic Observation',
    icon: Search,
    color: 'bg-white text-slate-900 border-slate-900',
    scenario: {
      desc: "Sitting in the back of a real classroom, recording how often students look at their phones when it buzzes vs. when it doesn't, and tracking their eye contact with the teacher."
    },
    events: [
      { id: 'n_s1', text: "You observe students in their actual math class, so their behavior is completely authentic.", type: 'strength', term: "High ecological validity (real-world behavior)" },
      { id: 'n_s2', text: "You notice students hiding phones in their sleeves—a physical behavior you wouldn't have thought to test in a lab.", type: 'strength', term: "Can inspire future controlled lab research" },
      { id: 'n_s3', text: "Because you act as a substitute teacher grading papers, students don't know they are being watched.", type: 'strength', term: "Observes natural, unprompted reactions" },
      { id: 'n_s4', text: "You avoid bringing teenagers into an intimidating, sterile university laboratory.", type: 'strength', term: "Avoids artificial laboratory settings" },
      { id: 'n_l1', text: "A fire drill happens in the middle of your observation, ruining your data collection for the day.", type: 'limitation', term: "Lack of control over extraneous variables" },
      { id: 'n_l2', text: "You recorded 'looking down' as checking a phone, but your co-researcher thought they were just reading a textbook.", type: 'limitation', term: "High risk of observer bias" },
      { id: 'n_l3', text: "Another researcher tries to repeat your study at a different school, but their classroom layout blocks the view.", type: 'limitation', term: "Difficult to replicate exactly" },
      { id: 'n_l4', text: "You see phone checking and low test scores, but because you didn't control anything, you can't strictly prove the phone *caused* the low scores.", type: 'limitation', term: "Cannot determine cause-and-effect" }
    ]
  },
  case_study: {
    id: 'case_study',
    name: 'Case Study',
    icon: BookOpen,
    color: 'bg-white text-slate-900 border-slate-900',
    scenario: {
      desc: "Following a single student with extremely high screen time over 6 months, interviewing their parents, teachers, and analyzing their grades and personal diaries."
    },
    events: [
      { id: 'c_s1', text: "You gathered 500 pages of interview transcripts, grade history, and personal behavior logs from this one student.", type: 'strength', term: "Provides incredibly rich, detailed qualitative data" },
      { id: 'c_s2', text: "You are able to deeply study a student with a unique clinical attention deficit, which you couldn't ethically induce in others.", type: 'strength', term: "Allows study of rare or unusual psychological conditions" },
      { id: 'c_s3', text: "By spending months with the student, you map out their entire family context, sleep schedule, and diet.", type: 'strength', term: "Explores the full context of an individual's life" },
      { id: 'c_s4', text: "The student's unique coping mechanisms give you a brand new idea for how attention works in the brain.", type: 'strength', term: "Can generate deep hypotheses for future study" },
      { id: 'c_l1', text: "The student you are studying is an honors student, so your findings might not apply to struggling students.", type: 'limitation', term: "Extremely difficult to generalize to wider populations" },
      { id: 'c_l2', text: "You started to mentor the student and unconsciously ignored some of their worst distracted behaviors.", type: 'limitation', term: "Highly susceptible to researcher bias" },
      { id: 'c_l3', text: "The student lied to you about how late they stay up on their phone, skewing your background data.", type: 'limitation', term: "Relies heavily on subject's accurate memory/honesty" },
      { id: 'c_l4', text: "It takes you a full school year just to finish studying this single individual.", type: 'limitation', term: "Time-consuming and cannot prove causality" }
    ]
  },
  survey: {
    id: 'survey',
    name: 'Survey',
    icon: Users,
    color: 'bg-white text-slate-900 border-slate-900',
    scenario: {
      desc: "Sending a questionnaire to 5,000 high schoolers asking them to self-report how many times a day they check their phones and what their GPA is."
    },
    events: [
      { id: 's_s1', text: "You post a link on the school district portal and get 10,000 student responses in a single weekend.", type: 'strength', term: "Can gather data from huge sample sizes very quickly" },
      { id: 's_s2', text: "You use a free online form, so the entire district-wide research project costs exactly $0.00.", type: 'strength', term: "Highly cost-effective and easy to distribute" },
      { id: 's_s3', text: "You export the results to Excel to instantly find the average screen time across all 10,000 students.", type: 'strength', term: "Allows for easy statistical comparison of responses" },
      { id: 's_s4', text: "You are able to ask them *why* they check their phones, gathering internal opinions you couldn't get just by watching them.", type: 'strength', term: "Useful for assessing internal attitudes and beliefs" },
      { id: 's_l1', text: "Many students claim they only use their phones 1 hour a day because they thought the principal might see the results.", type: 'limitation', term: "Vulnerable to social desirability bias (lying to look good)" },
      { id: 's_l2', text: "A kid who uses their phone for educational flashcards is grouped the same as a kid playing games because you only had one checkbox.", type: 'limitation', term: "Rigid question structures may miss behavioral nuance" },
      { id: 's_l3', text: "Many students honestly just miscalculate and misremember how much time they actually spend on their screens.", type: 'limitation', term: "Self-reporting behavior can be highly inaccurate" },
      { id: 's_l4', text: "Only students who actually *care* about the school survey bothered to open the email and fill it out.", type: 'limitation', term: "Risk of low response rates or non-response bias" }
    ]
  },
  correlational: {
    id: 'correlational',
    name: 'Correlational Research',
    icon: TrendingUp,
    color: 'bg-white text-slate-900 border-slate-900',
    scenario: {
      desc: "Analyzing an existing dataset of school records containing screen-time logs from a school-issued tracking app and comparing it to standardized test scores."
    },
    events: [
      { id: 'co_s1', text: "You found a clear mathematical number (-0.75) linking screen time to GPA.", type: 'strength', term: "Identifies the strength of relationships between variables" },
      { id: 'co_s2', text: "Based on your mathematical model, if you know a student's daily screen time, you can now accurately guess their likely GPA.", type: 'strength', term: "Allows researchers to make statistical predictions" },
      { id: 'co_s3', text: "Instead of bothering students, you just downloaded a massive pre-existing school database of screen-time app logs and grades.", type: 'strength', term: "Can utilize massive pre-existing data sets" },
      { id: 'co_s4', text: "You didn't have to physically force kids to fail their classes to study the effects (which would be highly unethical).", type: 'strength', term: "Useful when manipulating variables is unethical" },
      { id: 'co_l1', text: "The local news reported 'Phones CAUSE Failing Grades!' based on your study, which your math cannot actually prove.", type: 'limitation', term: "Can be easily misinterpreted by the general public" },
      { id: 'co_l2', text: "You realize that maybe failing kids just give up and use their phones more. You don't know which caused which.", type: 'limitation', term: "Directionality problem (which variable caused which?)" },
      { id: 'co_l3', text: "You realize that 'Having Strict Parents' might actually be causing BOTH the lower screen time AND the higher grades.", type: 'limitation', term: "Vulnerable to the 'third variable' problem" },
      { id: 'co_l4', text: "Even though the numbers line up perfectly, a statistical link is not enough to prove that one thing makes the other happen.", type: 'limitation', term: "Does NOT prove cause-and-effect (Causation)" }
    ]
  }
};

export default function App() {
  const [step, setStep] = useState(1);
  const [currentDate] = useState(new Date().toLocaleDateString());
  
  // Track findings for ALL methodologies
  const [discovered, setDiscovered] = useState(() => {
    const init = {};
    Object.keys(METHODOLOGIES).forEach(k => {
      init[k] = { strengths: [], limitations: [] };
    });
    return init;
  });

  // State for active simulation (Step 2)
  const [activeMethodId, setActiveMethodId] = useState(null);
  const [shuffledEvents, setShuffledEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [feedback, setFeedback] = useState(null); 
  const [errorCount, setErrorCount] = useState(0);

  // State for Report (Step 3)
  const [finalSelection, setFinalSelection] = useState(null);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper variables
  const completedMethodsCount = Object.values(discovered).filter(d => d.strengths.length + d.limitations.length === 8).length;
  const allMethodsComplete = completedMethodsCount === Object.keys(METHODOLOGIES).length;

  const isMethodComplete = (id) => discovered[id].strengths.length + discovered[id].limitations.length === 8;

  // Start a specific methodology simulation
  const handleMethodSelect = (methodId) => {
    if (isMethodComplete(methodId)) return; // Prevent re-entry if already done
    
    setActiveMethodId(methodId);
    
    // Find remaining undiscovered events for this methodology
    const allEvents = METHODOLOGIES[methodId].events;
    const remaining = allEvents.filter(e => 
      !discovered[methodId].strengths.find(s => s.id === e.id) &&
      !discovered[methodId].limitations.find(l => l.id === e.id)
    );
    
    setShuffledEvents(remaining.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedCategory(null);
    setFeedback(null);
    setStep(2);
  };

  const currentEvent = shuffledEvents[currentIndex];

  const handleCategoryGuess = (guessedType) => {
    if (guessedType === currentEvent.type) {
      setSelectedCategory(guessedType);
      setFeedback(null);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({
        type: 'error',
        message: guessedType === 'strength' 
          ? "INVALID: Re-evaluate context. This limits empirical validity." 
          : "INVALID: Re-evaluate context. This represents a methodological advantage."
      });
    }
  };

  const handleTermGuess = (guessedTerm) => {
    if (guessedTerm === currentEvent.term) {
      // Correct!
      setFeedback({ type: 'success', message: "VERIFIED. Concept logged to official record." });
      
      // Add to discovered for this specific methodology
      setDiscovered(prev => ({
        ...prev,
        [activeMethodId]: {
          ...prev[activeMethodId],
          [currentEvent.type + 's']: [...prev[activeMethodId][currentEvent.type + 's'], currentEvent]
        }
      }));

      // Move to next after delay
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedCategory(null);
        setFeedback(null);
      }, 1500);
    } else {
      // Wrong term
      setErrorCount(prev => prev + 1);
      setFeedback({ type: 'error', message: "MISMATCH: Identify the correct standardized terminology." });
    }
  };

  const getAvailableTerms = (type) => {
    if (!activeMethodId) return [];
    const allTerms = METHODOLOGIES[activeMethodId].events.filter(e => e.type === type).map(e => e.term);
    const discoveredTerms = discovered[activeMethodId][type + 's'].map(e => e.term);
    return allTerms.filter(t => !discoveredTerms.includes(t));
  };

  const copyToClipboard = () => {
    if (!finalSelection) return;
    const methodObj = METHODOLOGIES[finalSelection];
    const stats = discovered[finalSelection];
    
    const textToCopy = `[FORM EP-30] FINAL METHODOLOGY RECOMMENDATION\n\nRESEARCH OBJECTIVE: ${RESEARCH_OBJECTIVE}\nSIMULATION ERRORS LOGGED: ${errorCount}\nSELECTED DESIGN: ${methodObj.name.toUpperCase()}\n\nSTRENGTHS OF SELECTED DESIGN:\n${stats.strengths.map(s => "- " + s.term).join('\n')}\n\nLIMITATIONS OF SELECTED DESIGN:\n${stats.limitations.map(l => "- " + l.term).join('\n')}\n\nBOARD RECOMMENDATION / DEFENSE:\n${draft}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="text-slate-900 font-serif pb-6 pt-2 px-0 selection:bg-slate-300">
      
      {/* Global Styles for Fonts and Print */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700&display=swap');
        .font-serif { font-family: 'Lora', serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        
        .brutal-shadow { box-shadow: 6px 6px 0px rgba(15,23,42,1); }
        .brutal-shadow-sm { box-shadow: 3px 3px 0px rgba(15,23,42,1); }
        .brutal-shadow-hover:hover { box-shadow: 8px 8px 0px rgba(15,23,42,1); transform: translateY(-2px); }
        
        @media print {
          @page { margin: 0.75in; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-border-none { border: none !important; box-shadow: none !important; }
          .print-p-0 { padding: 0 !important; }
          .print-w-full { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .dossier-page { border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
          textarea { border: none !important; box-shadow: none !important; height: auto !important; overflow: visible !important; }
          .page-break-before { page-break-before: always; }
        }
      `}} />

      {/* Main Document Container */}
      <main className={`mx-auto transition-all ${step === 4 ? 'max-w-4xl bg-white border-2 border-slate-300 p-6 md:p-8 dossier-page' : 'max-w-5xl bg-transparent border-0 p-0 md:p-0'} relative print:shadow-none print:border-none print:bg-white print:p-0 print:w-full`}>
        
        {/* Institutional Watermark - Hidden on Dossier Step */}
        {step !== 4 && (
          <div className="hidden lg:block absolute top-64 -right-12 rotate-90 opacity-10 font-mono text-5xl tracking-widest text-slate-900 pointer-events-none select-none no-print">
            FORM EP-30
          </div>
        )}

        {/* Formal Header - Hidden on Dossier Step */}
        {step !== 4 && (
          <header className="border-b-8 border-slate-900 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="font-mono text-xs font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                <Microscope className="w-4 h-4" /> Dept. of Experimental Psychology
              </div>
              <h1 className="font-bold text-3xl md:text-4xl text-slate-900 leading-tight">
                Methodology Simulator
              </h1>
            </div>
            
            {/* Navigation / Progress Track */}
            <div className="flex gap-3 text-xs font-mono tracking-widest uppercase text-slate-500 font-bold border-2 border-slate-900 p-2 bg-white no-print brutal-shadow-sm">
              <button 
                onClick={() => setStep(1)}
                className={`transition-colors ${step === 1 ? 'text-slate-900 bg-slate-200 px-2' : 'px-2 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                01. Hub
              </button>
              <button 
                disabled={true} // Only active via Hub
                className={`transition-colors opacity-50 ${step === 2 ? 'text-slate-900 bg-slate-200 px-2 opacity-100' : 'px-2'}`}
              >
                02. Field
              </button>
              <button 
                onClick={() => { if (allMethodsComplete) setStep(3); }}
                disabled={!allMethodsComplete}
                className={`transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${step === 3 ? 'text-slate-900 bg-emerald-200 px-2' : 'px-2 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                03. Report
              </button>
              {step === 4 && (
                 <button className="text-slate-900 bg-amber-200 px-2 transition-colors">
                  04. Final Dossier
                </button>
              )}
            </div>
          </header>
        )}

        
        {/* STEP 1: HUB (CHOOSE METHODOLOGY) */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            
            {/* Mission Objective Panel */}
            <div className="mb-10 border-4 border-slate-900 bg-white p-6 brutal-shadow-sm">
              <span className="font-mono text-slate-500 font-bold tracking-widest text-xs uppercase block mb-2 border-b-2 border-slate-200 pb-2">
                Central Research Directive
              </span>
              <h2 className="text-xl font-bold mt-2 text-slate-900 font-serif italic">
                "{RESEARCH_OBJECTIVE}"
              </h2>
              <p className="text-slate-700 mt-4 font-serif text-sm leading-relaxed">
                Before seeking grant approval, you must evaluate <strong className="text-slate-900">4 distinct methodological approaches</strong> to answering this single research question. Run simulations for all 4 designs below to extract their empirical strengths and limitations.
              </p>
              
              <div className="mt-6 flex items-center gap-4 bg-slate-100 p-3 border-l-4 border-emerald-600 font-mono text-xs font-bold uppercase tracking-widest text-emerald-900">
                <span>Progress: {completedMethodsCount} / 4 Methodologies Extracted</span>
              </div>
            </div>
            
            {/* The 4 Methodology Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(METHODOLOGIES).map(m => {
                const complete = isMethodComplete(m.id);
                const progress = discovered[m.id].strengths.length + discovered[m.id].limitations.length;
                
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMethodSelect(m.id)}
                    disabled={complete}
                    className={`relative p-6 border-4 border-slate-900 text-left transition-all rounded-none group ${complete ? 'bg-slate-100 opacity-80' : 'bg-white brutal-shadow brutal-shadow-hover hover:-translate-y-1'}`}
                  >
                    {/* Status Tag */}
                    <div className={`absolute top-0 right-0 font-mono text-[10px] px-3 py-1 font-bold uppercase tracking-widest border-b-2 border-l-2 border-slate-900 ${complete ? 'bg-emerald-300 text-emerald-900' : progress > 0 ? 'bg-amber-300 text-amber-900' : 'bg-slate-900 text-white'}`}>
                      {complete ? 'DATA SECURED' : progress > 0 ? 'IN PROGRESS' : 'AWAITING DEPLOYMENT'}
                    </div>

                    <div className={`w-12 h-12 flex items-center justify-center mb-4 border-2 ${complete ? 'bg-emerald-100 text-emerald-900 border-emerald-900' : m.color} brutal-shadow-sm`}>
                      {complete ? <ShieldCheck className="w-6 h-6" /> : <m.icon className="w-6 h-6" />}
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-2 font-serif ${complete ? 'line-through text-slate-500' : 'text-slate-900'}`}>{m.name}</h3>
                    
                    <div className="bg-slate-50 border-t-2 border-slate-200 mt-4 pt-3">
                      <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-1">Approach Configuration</p>
                      <p className="text-sm text-slate-700 font-serif">"{m.scenario.desc}"</p>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs font-mono font-bold">
                      <span className={complete ? 'text-emerald-700' : 'text-slate-500'}>
                        [ {progress} / 8 Findings ]
                      </span>
                      {!complete && <span className="text-slate-900 group-hover:underline flex items-center gap-1">Initiate <ArrowRight className="w-3 h-3"/></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Unlock Final Report Button */}
            {allMethodsComplete && (
              <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 text-white border-4 border-slate-900 px-8 py-4 font-mono font-bold text-lg uppercase tracking-widest brutal-shadow brutal-shadow-hover hover:bg-emerald-700 transition-all flex items-center gap-3 mx-auto"
                >
                  <ShieldCheck className="w-6 h-6" /> Proceed to Final Recommendation
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SIMULATION (DEDUCTION GAME) */}
        {step === 2 && activeMethodId && (
          <div className="animate-in fade-in duration-500">
            
            {/* Completion Screen for the Active Method */}
            {currentIndex >= shuffledEvents.length ? (
              <div className="max-w-2xl mx-auto bg-white border-4 border-slate-900 p-10 brutal-shadow text-center mt-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 brutal-shadow-sm">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold font-serif text-slate-900 mb-2">Simulation Complete</h2>
                <p className="text-slate-600 font-serif mb-8">All empirical strengths and limitations for <strong>{METHODOLOGIES[activeMethodId].name}</strong> have been successfully extracted and logged to the main database.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="bg-slate-900 text-white font-mono font-bold tracking-widest uppercase px-6 py-3 border-2 border-slate-900 hover:bg-slate-800 transition-colors inline-flex items-center gap-2 brutal-shadow-sm hover:-translate-y-1"
                >
                  Return to Hub <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Standard Gameplay Screen
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Side: The "Game" Board */}
                <div className="lg:w-3/5 space-y-8">
                  
                  {/* Scenario Header */}
                  <div className="bg-slate-50 p-5 border-2 border-slate-900 brutal-shadow-sm">
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Approach Profile</span>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1 font-serif">
                      {METHODOLOGIES[activeMethodId].name} 
                    </h2>
                    <p className="text-slate-700 mt-3 text-sm font-serif border-l-2 border-slate-400 pl-3 italic">
                      {METHODOLOGIES[activeMethodId].scenario.desc}
                    </p>
                  </div>

                  {/* The Field Note Card */}
                  <div className="bg-white p-8 border-4 border-slate-900 brutal-shadow relative">
                    
                    {/* Action Required Tab */}
                    <div className="absolute -top-4 -left-1 bg-slate-900 text-white font-mono text-[10px] px-3 py-1 font-bold uppercase tracking-widest brutal-shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Action Required
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-slate-200 pb-2">
                      <span className="font-mono text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Field Note Extracted
                      </span>
                      <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-1 border border-slate-400">
                        {discovered[activeMethodId].strengths.length + discovered[activeMethodId].limitations.length + 1} / 8
                      </span>
                    </div>

                    <p className="text-2xl font-serif font-bold text-slate-900 leading-snug mb-8">
                      "{currentEvent?.text}"
                    </p>

                    {/* Deduction Task */}
                    <div className="bg-slate-50 p-6 border-2 border-slate-900">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 font-mono uppercase text-sm tracking-widest">
                        <Lightbulb className="w-4 h-4" /> Deduction Terminal
                      </h3>

                      {/* Phase 1: Strength or Limitation? */}
                      {!selectedCategory ? (
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-700 font-serif">Classify this observational event:</p>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleCategoryGuess('strength')}
                              className="flex-1 bg-[#f0fdf4] border-2 border-slate-900 text-emerald-900 p-4 font-mono font-bold uppercase text-xs tracking-widest brutal-shadow-hover transition-all text-center"
                            >
                              Methodological Strength
                            </button>
                            <button 
                              onClick={() => handleCategoryGuess('limitation')}
                              className="flex-1 bg-[#fff1f2] border-2 border-slate-900 text-rose-900 p-4 font-mono font-bold uppercase text-xs tracking-widest brutal-shadow-hover transition-all text-center"
                            >
                              Methodological Limitation
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Phase 2: Match the Formal Concept */
                        <div className="animate-in slide-in-from-right-4 duration-300">
                          <div className={`font-mono text-[10px] font-bold uppercase tracking-widest mb-4 px-3 py-1 border-2 border-slate-900 inline-block ${selectedCategory === 'strength' ? 'bg-[#f0fdf4] text-emerald-900' : 'bg-[#fff1f2] text-rose-900'}`}>
                            Classification Confirmed: {selectedCategory}
                          </div>
                          <p className="text-sm font-bold text-slate-700 mb-3 font-serif">Assign standard psychological terminology:</p>
                          <div className="grid grid-cols-1 gap-3">
                            {getAvailableTerms(selectedCategory).map(term => (
                              <button
                                key={term}
                                onClick={() => handleTermGuess(term)}
                                disabled={feedback?.type === 'success'}
                                className="text-left bg-white border-2 border-slate-900 hover:bg-slate-100 p-3 font-serif text-sm font-bold text-slate-900 transition-all brutal-shadow-sm disabled:opacity-50 hover:translate-x-1"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Message */}
                      {feedback && (
                        <div className={`mt-6 p-4 border-2 border-slate-900 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-3 ${feedback.type === 'success' ? 'bg-[#f0fdf4] text-emerald-900 brutal-shadow-sm' : 'bg-[#fff1f2] text-rose-900 brutal-shadow-sm'}`}>
                          {feedback.type === 'success' ? <CheckSquare className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                          {feedback.message}
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Right Side: The Discovered Fact Sheet */}
                <div className="lg:w-2/5">
                  <div className="bg-slate-900 border-4 border-slate-900 p-6 text-slate-200 brutal-shadow sticky top-8 min-h-[500px] flex flex-col">
                    <h3 className="font-bold text-white text-lg border-b-2 border-slate-700 pb-3 mb-4 flex items-center gap-2 font-serif">
                      <BookOpen className="w-5 h-5" /> Official Record
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6 border-l-2 border-slate-700 pl-2">
                      Verified findings log for {METHODOLOGIES[activeMethodId].name}. Data synchronizing.
                    </p>
                    
                    <div className="flex-1 space-y-8">
                      {/* Strengths Log */}
                      <div>
                        <h4 className="font-mono font-bold text-[#a7f3d0] mb-3 uppercase tracking-widest text-xs flex justify-between border-b border-[#065f46] pb-1">
                          <span>Verified Strengths</span>
                          <span>[{discovered[activeMethodId].strengths.length}/4]</span>
                        </h4>
                        <ul className="space-y-3">
                          {discovered[activeMethodId].strengths.length === 0 && <li className="text-slate-500 font-mono text-xs uppercase">Awaiting Data...</li>}
                          {discovered[activeMethodId].strengths.map((s, i) => (
                            <li key={i} className="text-sm font-serif bg-slate-800 p-3 border-l-4 border-[#34d399] flex gap-3 animate-in fade-in slide-in-from-right-4">
                              <span className="text-[#34d399] font-mono text-xs mt-0.5">[{i+1}]</span>
                              <span>{s.term}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limitations Log */}
                      <div>
                        <h4 className="font-mono font-bold text-[#fecdd3] mb-3 uppercase tracking-widest text-xs flex justify-between border-b border-[#9f1239] pb-1">
                          <span>Verified Limitations</span>
                          <span>[{discovered[activeMethodId].limitations.length}/4]</span>
                        </h4>
                        <ul className="space-y-3">
                          {discovered[activeMethodId].limitations.length === 0 && <li className="text-slate-500 font-mono text-xs uppercase">Awaiting Data...</li>}
                          {discovered[activeMethodId].limitations.map((l, i) => (
                            <li key={i} className="text-sm font-serif bg-slate-800 p-3 border-l-4 border-[#fb7185] flex gap-3 animate-in fade-in slide-in-from-right-4">
                              <span className="text-[#fb7185] font-mono text-xs mt-0.5">[{i+1}]</span>
                              <span>{l.term}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* STEP 3: FINAL EVALUATION REPORT */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            
            <div className="mb-10 border-l-4 border-slate-900 pl-4 bg-slate-100 p-4 no-print">
              <span className="font-mono text-slate-900 font-bold tracking-widest text-xs uppercase block mb-1">
                Phase 03 // Strategic Decision
              </span>
              <h2 className="text-2xl font-bold mt-2 text-slate-900 font-serif">Methodology Selection & Defense</h2>
              <p className="text-slate-700 mt-2 font-serif text-sm leading-relaxed max-w-3xl">
                You have successfully mapped the strengths and limitations of all 4 potential approaches to studying <strong>smartphone notifications and student attention</strong>. You must now select ONE design to present to the Ethics Review Board for your official grant application.
              </p>
            </div>

            {/* Selection UI (Hidden in Print) */}
            <div className="bg-white border-4 border-slate-900 brutal-shadow p-6 mb-10 no-print">
              <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Select Optimal Design:</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(METHODOLOGIES).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setFinalSelection(m.id)}
                    className={`p-3 border-2 transition-all font-serif font-bold text-sm text-center ${finalSelection === m.id ? 'bg-emerald-200 border-emerald-900 text-emerald-900 brutal-shadow-sm scale-105' : 'bg-slate-50 border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900'}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Area - Only shown once a selection is made */}
            {finalSelection && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-500">
                
                {/* Fact Sheet Summary for the Selected Method */}
                <div className="lg:col-span-1 bg-slate-50 p-6 border-4 border-slate-900 brutal-shadow h-fit print:border-none print:shadow-none print:p-0 print:bg-white">
                  <h3 className="font-serif font-bold text-xl text-slate-900 border-b-4 border-slate-900 pb-2 mb-4 uppercase">Selected Design</h3>
                  <div className="text-lg font-bold font-serif text-emerald-700 mb-6 bg-emerald-100 px-3 py-2 border-l-4 border-emerald-700 print:border-none print:bg-transparent print:p-0">
                    {METHODOLOGIES[finalSelection].name}
                  </div>

                  {/* Performance Metric Box */}
                  <div className="bg-white p-4 border-2 border-slate-900 mb-6 font-mono text-sm print:border-b-2 print:border-x-0 print:border-t-0 print:bg-transparent print:p-0 print:mb-4">
                    <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] border-b border-slate-200 pb-2 mb-2 text-center">Global Sim Performance</h4>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-600 text-xs">Errors Logged:</span>
                      <span className={`font-bold ${errorCount > 0 ? 'text-rose-600' : 'text-emerald-600'} print:text-black`}>{errorCount}</span>
                    </div>
                  </div>

                  <h4 className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-100 inline-block px-2 py-1 mb-3 uppercase tracking-widest border border-emerald-300">Strengths to Leverage</h4>
                  <ul className="text-xs font-serif space-y-3 mb-8 text-slate-900">
                    {discovered[finalSelection].strengths.map(s => <li key={s.id} className="flex gap-2"><span className="text-emerald-500 font-mono">::</span>{s.term}</li>)}
                  </ul>
                  
                  <h4 className="font-mono text-[10px] font-bold text-rose-900 bg-rose-100 inline-block px-2 py-1 mb-3 uppercase tracking-widest border border-rose-300">Limitations to Mitigate</h4>
                  <ul className="text-xs font-serif space-y-3 text-slate-900">
                    {discovered[finalSelection].limitations.map(l => <li key={l.id} className="flex gap-2"><span className="text-rose-500 font-mono">::</span>{l.term}</li>)}
                  </ul>
                </div>

                {/* Writing Area */}
                <div className="lg:col-span-2 flex flex-col bg-white border-4 border-slate-900 brutal-shadow min-h-[600px] print:shadow-none print:border-none print:mt-8 page-break-before">
                  
                  {/* Form Tool Bar (Hidden in Print) */}
                  <div className="bg-[#f0fdf4] border-b-4 border-slate-900 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                    <span className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Official Defense Form
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setStep(4)}
                        disabled={draft.trim().length < 50}
                        className="flex items-center gap-2 text-xs font-mono bg-emerald-900 border-2 border-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed px-4 py-2 transition-colors font-bold text-white uppercase tracking-widest brutal-shadow-sm"
                      >
                        <Award className="w-4 h-4" /> Finalize Report
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-100 border-b-2 border-slate-900 text-sm text-slate-900 font-serif no-print">
                    <p><strong className="font-mono uppercase text-xs tracking-widest mr-2 text-rose-700">Directive:</strong> Defend your choice of <strong>{METHODOLOGIES[finalSelection].name}</strong>. Explicitly state why its verified strengths make it the optimal choice for studying smartphone notifications compared to the other 3 designs, and propose <em>one specific operational safeguard</em> to mitigate its most severe limitation.</p>
                  </div>

                  <div className="flex-1 p-6 relative group">
                    <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 pointer-events-none no-print">Draft Input</div>
                    <textarea 
                      className="w-full h-full min-h-[400px] focus:outline-none resize-none bg-transparent text-slate-900 leading-relaxed font-serif text-lg placeholder:text-slate-300 print:text-black print:p-0"
                      placeholder="Commence board defense and safeguard proposal here..."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* STEP 4: FINAL DOSSIER (PDF EXPORT VIEW) */}
        {step === 4 && finalSelection && (
          <div className="animate-in zoom-in-95 duration-500 bg-white">
            
            {/* Top Toolbar - Hidden in Print */}
            <div className="no-print flex justify-between items-center mb-8 border-b-4 border-slate-900 pb-4">
               <button 
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 font-bold uppercase tracking-widest"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Edit Draft
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={printDocument}
                    className="flex items-center gap-2 text-sm font-mono bg-slate-900 text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors brutal-shadow-sm hover:-translate-y-1"
                  >
                    <Printer className="w-5 h-5" /> Save PDF for Classroom
                  </button>
                </div>
            </div>

            {/* Formatted Dossier Document */}
            <div className="border-8 border-double border-slate-900 p-8 md:p-12 relative min-h-[800px]">
              
              {/* Header */}
              <div className="text-center border-b-2 border-slate-300 pb-8 mb-8">
                <div className="w-16 h-16 mx-auto bg-slate-900 text-white flex items-center justify-center rounded-full mb-4">
                  <Microscope className="w-8 h-8" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-slate-900 uppercase tracking-wide mb-2">Ethics Review Board</h1>
                <h2 className="font-mono text-sm tracking-widest text-slate-500 font-bold uppercase">Official Methodology Dossier</h2>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-200 pb-1">Date Submitted</div>
                  <div className="font-serif font-bold text-slate-900">{currentDate}</div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-200 pb-1">Primary Directive</div>
                  <div className="font-serif italic text-slate-900 leading-snug text-xs">{RESEARCH_OBJECTIVE}</div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-200 pb-1">Selected Framework</div>
                  <div className="font-serif font-bold text-slate-900 text-lg">{METHODOLOGIES[finalSelection].name}</div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-200 pb-1">Simulation Accuracy</div>
                  <div className="font-serif flex items-center gap-2">
                    <span className={`text-2xl font-bold ${errorCount === 0 ? 'text-emerald-600' : errorCount < 3 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {errorCount}
                    </span> 
                    <span className="text-slate-600 leading-tight text-xs">Diagnostic<br/>Misses</span>
                  </div>
                </div>
              </div>

              {/* Methodology Data */}
              <div className="grid grid-cols-2 gap-8 mb-12 bg-slate-50 p-6 border-l-4 border-slate-900">
                <div>
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-3 border-b border-slate-300 pb-2">Verified Strengths</h3>
                  <ul className="list-disc pl-4 space-y-2 font-serif text-xs text-slate-800">
                    {discovered[finalSelection].strengths.map(s => <li key={s.id}>{s.term}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-3 border-b border-slate-300 pb-2">Verified Limitations</h3>
                  <ul className="list-disc pl-4 space-y-2 font-serif text-xs text-slate-800">
                    {discovered[finalSelection].limitations.map(l => <li key={l.id}>{l.term}</li>)}
                  </ul>
                </div>
              </div>

              {/* The Written Report */}
              <div className="mb-16">
                <h3 className="font-mono text-lg font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                  <span className="bg-slate-900 text-white px-3 py-1 text-sm">DEFENSE</span>
                  Board Recommendation
                </h3>
                
                <div className="font-serif text-slate-900 leading-loose text-base space-y-4">
                  {draft.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                    <p key={index} className="text-justify indent-8">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Formal Signature Footer */}
              <div className="mt-20 pt-8 border-t-2 border-slate-300 flex justify-between items-end">
                <div className="text-center w-64">
                  <div className="border-b border-slate-900 h-8 mb-2"></div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Lead Researcher Signature</span>
                </div>
                <div className="w-32 h-32 border-4 border-double border-slate-900 rounded-full flex items-center justify-center opacity-20 rotate-12">
                  <span className="font-mono text-xs font-bold uppercase text-center">Official<br/>Seal</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
