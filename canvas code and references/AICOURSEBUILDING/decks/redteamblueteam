import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2, Download } from 'lucide-react';

const App = () => {
  const [phase, setPhase] = useState(1);
  const [blueNoteInput, setBlueNoteInput] = useState('');
  const [blueNotes, setBlueNotes] = useState([
    "Process-based grading eliminates the need to act as 'AI Detectives'."
  ]);
  
  const [redNoteInput, setRedNoteInput] = useState('');
  const [redNotes, setRedNotes] = useState([
    "150 live 5-minute teacher conferences per summative is a mathematical scaling nightmare."
  ]);

  const [purpleSolutions, setPurpleSolutions] = useState({
    target1: [],
    target2: [],
    target3: []
  });
  const [solutionInputs, setSolutionInputs] = useState({ target1: '', target2: '', target3: '' });

  const handleAddBlueNote = (e) => {
    e.preventDefault();
    if (blueNoteInput.trim()) {
      setBlueNotes([...blueNotes, blueNoteInput.trim()]);
      setBlueNoteInput('');
    }
  };

  const handleAddRedNote = (e) => {
    e.preventDefault();
    if (redNoteInput.trim()) {
      setRedNotes([...redNotes, redNoteInput.trim()]);
      setRedNoteInput('');
    }
  };

  const handleAddPurpleSolution = (e, target) => {
    e.preventDefault();
    if (solutionInputs[target].trim()) {
      setPurpleSolutions({
        ...purpleSolutions,
        [target]: [...purpleSolutions[target], solutionInputs[target].trim()]
      });
      setSolutionInputs({ ...solutionInputs, [target]: '' });
    }
  };

  const nextPhase = () => setPhase((prev) => Math.min(prev + 1, 6));
  const prevPhase = () => setPhase((prev) => Math.max(prev - 1, 1));

  const StickyNote = ({ text, color }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-l-4 border-blue-500 text-blue-900",
      red: "bg-red-50 border-l-4 border-red-500 text-red-900",
      purple: "bg-purple-50 border-l-4 border-purple-500 text-purple-900"
    };
    return (
      <div className={`p-4 rounded-r-lg shadow-sm mb-3 ${colorClasses[color]}`}>
        <p className="text-sm font-medium">{text}</p>
      </div>
    );
  };

  const renderPhase = () => {
    switch (phase) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to the Stress-Test</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Today we are looking at our new AI-Aware Assessment Framework. The core philosophy is simple: <strong>Product, Process, Defence.</strong> We are moving away from trying to 'catch' AI use, and instead asking students to prove their learning.
              </p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                <h3 className="font-semibold text-slate-800 mb-2">The Rules of Engagement:</h3>
                <p className="text-slate-600 text-sm mb-4">
                  A policy that looks good on paper can fail in the classroom if we don't anticipate the friction. Today, we are not here to nod and agree. We are here to break this plan and then fix it together.
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-center text-sm text-slate-700">
                    <ShieldCheck className="w-5 h-5 text-blue-500 mr-3" />
                    <strong>Blue Team:</strong> Defend pedagogical integrity and find the strengths.
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                    <strong>Red Team:</strong> Find the logistical nightmares and student loopholes.
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Lightbulb className="w-5 h-5 text-purple-500 mr-3" />
                    <strong>Purple Team:</strong> Build consensus and actionable solutions.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-blue-500">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Blue Team Deep Dive</h2>
                  <p className="text-slate-500 text-sm">Defenders of Pedagogical Integrity</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Discussion Prompts:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 mb-6">
                    <li>Why is the 50/25/25 split pedagogically stronger than grading just a final product?</li>
                    <li>How does the "AI Use Permit" empower student agency?</li>
                    <li>How does this protect teachers from the "AI Detective" trap?</li>
                  </ul>
                  
                  <form onSubmit={handleAddBlueNote} className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Add a Blue Sticky Note</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        value={blueNoteInput}
                        onChange={(e) => setBlueNoteInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter a strength..."
                      />
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-96 overflow-y-auto">
                  <h3 className="font-semibold text-slate-800 mb-4 text-center">Blue Board</h3>
                  {blueNotes.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm mt-10">No notes yet. Add one to the left.</p>
                  ) : (
                    blueNotes.map((note, idx) => <StickyNote key={idx} text={note} color="blue" />)
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-red-500">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Red Team Attack</h2>
                  <p className="text-slate-500 text-sm">The Stress-Testers</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Discussion Prompts:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 mb-6">
                    <li><strong>The Scaling Nightmare:</strong> How does the 5-minute teacher conference break you with 150 students?</li>
                    <li><strong>The Student Loophole:</strong> What if students use AI heavily but claim Level 0 to avoid paperwork?</li>
                    <li><strong>The Multiple Choice Problem:</strong> How do we run "verified multiple choice" efficiently?</li>
                  </ul>
                  
                  <form onSubmit={handleAddRedNote} className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Add a Red Sticky Note</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        value={redNoteInput}
                        onChange={(e) => setRedNoteInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter a vulnerability..."
                      />
                      <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-96 overflow-y-auto">
                  <h3 className="font-semibold text-slate-800 mb-4 text-center">Red Board</h3>
                  {redNotes.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm mt-10">No notes yet. Add one to the left.</p>
                  ) : (
                    redNotes.map((note, idx) => <StickyNote key={idx} text={note} color="red" />)
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">The Crossfire</h2>
              <p className="text-slate-500 text-sm text-center mb-8">Reviewing the battlefield before we find consensus.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" /> Why we MUST make this shift
                  </h3>
                  <div className="space-y-2">
                    {blueNotes.map((note, idx) => <StickyNote key={`blue-${idx}`} text={note} color="blue" />)}
                  </div>
                </div>
                
                <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
                  <h3 className="font-bold text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" /> Why this plan might FAIL
                  </h3>
                  <div className="space-y-2">
                    {redNotes.map((note, idx) => <StickyNote key={`red-${idx}`} text={note} color="red" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-purple-500">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Purple Team Consensus</h2>
                  <p className="text-slate-500 text-sm">Solving the Red Team's biggest attacks.</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Target 1 */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2">Target 1: The Defence Bottleneck</h3>
                  <p className="text-sm text-red-600 mb-4 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Problem: 150 live teacher conferences per summative is impossible.
                  </p>
                  <div className="mb-4">
                    {purpleSolutions.target1.map((sol, idx) => <StickyNote key={idx} text={sol} color="purple" />)}
                  </div>
                  <form onSubmit={(e) => handleAddPurpleSolution(e, 'target1')} className="flex">
                    <input 
                      type="text" 
                      value={solutionInputs.target1}
                      onChange={(e) => setSolutionInputs({...solutionInputs, target1: e.target.value})}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Brainstorm an alternative (e.g., async video)..."
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition text-sm">Add Idea</button>
                  </form>
                </div>

                {/* Target 2 */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2">Target 2: The Competency Gate Backlog</h3>
                  <p className="text-sm text-red-600 mb-4 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Problem: Teachers spending hours verifying AI permits early in the term.
                  </p>
                  <div className="mb-4">
                    {purpleSolutions.target2.map((sol, idx) => <StickyNote key={idx} text={sol} color="purple" />)}
                  </div>
                  <form onSubmit={(e) => handleAddPurpleSolution(e, 'target2')} className="flex">
                    <input 
                      type="text" 
                      value={solutionInputs.target2}
                      onChange={(e) => setSolutionInputs({...solutionInputs, target2: e.target.value})}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Brainstorm a solution (e.g., auto-grading)..."
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition text-sm">Add Idea</button>
                  </form>
                </div>

                {/* Target 3 */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2">Target 3: The "Concealed AI" Loophole</h3>
                  <p className="text-sm text-red-600 mb-4 font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Problem: Students hiding AI use to avoid the "Process" paperwork.
                  </p>
                  <div className="mb-4">
                    {purpleSolutions.target3.map((sol, idx) => <StickyNote key={idx} text={sol} color="purple" />)}
                  </div>
                  <form onSubmit={(e) => handleAddPurpleSolution(e, 'target3')} className="flex">
                    <input 
                      type="text" 
                      value={solutionInputs.target3}
                      onChange={(e) => setSolutionInputs({...solutionInputs, target3: e.target.value})}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Brainstorm a deterrent (e.g., rigid templates)..."
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition text-sm">Add Idea</button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Workshop Debrief</h2>
                <p className="text-slate-500 mt-2">Here is the blueprint we built together.</p>
              </div>
              
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
                    Solutions for Implementation
                    <button className="text-slate-500 hover:text-slate-800 transition flex items-center text-sm font-normal bg-white px-3 py-1 rounded border border-slate-200 shadow-sm" onClick={() => window.print()}>
                      <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">1. Alleviating the Defence Bottleneck</h4>
                      {purpleSolutions.target1.length > 0 ? (
                         <ul className="list-disc pl-5 text-slate-600 space-y-1">
                           {purpleSolutions.target1.map((sol, i) => <li key={i}>{sol}</li>)}
                         </ul>
                      ) : <p className="text-sm text-slate-400 italic">No consensus recorded.</p>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">2. Streamlining the Competency Gate</h4>
                      {purpleSolutions.target2.length > 0 ? (
                         <ul className="list-disc pl-5 text-slate-600 space-y-1">
                           {purpleSolutions.target2.map((sol, i) => <li key={i}>{sol}</li>)}
                         </ul>
                      ) : <p className="text-sm text-slate-400 italic">No consensus recorded.</p>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">3. Closing the Concealment Loophole</h4>
                      {purpleSolutions.target3.length > 0 ? (
                         <ul className="list-disc pl-5 text-slate-600 space-y-1">
                           {purpleSolutions.target3.map((sol, i) => <li key={i}>{sol}</li>)}
                         </ul>
                      ) : <p className="text-sm text-slate-400 italic">No consensus recorded.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const phaseNames = [
    "Briefing", 
    "Blue Team", 
    "Red Team", 
    "The Crossfire", 
    "Purple Consensus", 
    "Debrief"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header / Progress Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-slate-800 mb-4">AI Framework Stress-Test</h1>
          <div className="flex items-center justify-between">
            {phaseNames.map((name, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  phase > idx + 1 ? 'bg-green-500 text-white' : 
                  phase === idx + 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${phase === idx + 1 ? 'text-slate-800' : 'text-slate-400'} hidden md:block`}>
                  {name}
                </span>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute left-10 right-10 top-[3.25rem] h-1 bg-slate-100 -z-10 hidden md:block">
               <div 
                 className="h-full bg-blue-500 transition-all duration-500" 
                 style={{ width: `${((phase - 1) / 5) * 100}%` }}
               ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-8">
        {renderPhase()}
      </main>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={prevPhase} 
            disabled={phase === 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${phase === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </button>
          
          <span className="text-slate-500 font-medium text-sm">Phase {phase} of 6</span>

          {phase < 6 ? (
            <button 
              onClick={nextPhase} 
              className="flex items-center px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition shadow-sm"
            >
              Next Phase <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button 
              onClick={() => setPhase(1)} 
              className="flex items-center px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 transition"
            >
              Restart Workshop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;