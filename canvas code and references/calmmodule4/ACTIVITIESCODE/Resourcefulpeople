import React, { useState } from 'react';
import { 
  BookOpen, 
  Edit3, 
  List, 
  ChevronRight, 
  CheckCircle,
  FileText
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('article');
  
  // State for Reflection Questions
  const [reflections, setReflections] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  });

  // State for Resource List
  const [resources, setResources] = useState({
    postSecondary: [
      { id: 1, name: '', contact: '', criteria: '', info: '' },
      { id: 2, name: '', contact: '', criteria: '', info: '' }
    ],
    financial: [
      { id: 1, name: '', contact: '', criteria: '', info: '' },
      { id: 2, name: '', contact: '', criteria: '', info: '' }
    ],
    scholarships: [
      { id: 1, name: '', contact: '', criteria: '', info: '' },
      { id: 2, name: '', contact: '', criteria: '', info: '' }
    ],
    contacts: [
      { id: 1, name: '', contact: '', criteria: '', info: '' },
      { id: 2, name: '', contact: '', criteria: '', info: '' }
    ]
  });

  const handleReflectionChange = (q, value) => {
    setReflections(prev => ({ ...prev, [q]: value }));
  };

  const handleResourceChange = (category, index, field, value) => {
    setResources(prev => {
      const newCategory = [...prev[category]];
      newCategory[index] = { ...newCategory[index], [field]: value };
      return { ...prev, [category]: newCategory };
    });
  };

  const questions = [
    { id: 'q1', text: 'What does it mean to be a "resourceful" person?' },
    { id: 'q2', text: 'Why is being resourceful important to success?' },
    { id: 'q3', text: 'What are some ways that you consider yourself to be a resourceful person?' },
    { id: 'q4', text: 'What are some of the characteristics of a resourceful person that you would like to personally work on or improve? Why?' }
  ];

  const resourceCategories = [
    { key: 'postSecondary', title: 'Possible Post-Secondary Institutions' },
    { key: 'financial', title: 'Financial Institutions (Student Loans)' },
    { key: 'scholarships', title: 'Scholarships / Bursaries' },
    { key: 'contacts', title: 'Career Contacts OR Apprenticeship Opportunities' }
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 font-sans selection:bg-fuchsia-500/30">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#07090E]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Resourceful<span className="text-fuchsia-400">People</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'article', icon: BookOpen, label: 'Article' },
                { id: 'reflection', icon: Edit3, label: 'Reflection' },
                { id: 'resources', icon: List, label: 'Resource List' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto border-t border-white/5 px-2 py-2 hide-scrollbar">
            {[
              { id: 'article', label: 'Article' },
              { id: 'reflection', label: 'Reflection' },
              { id: 'resources', label: 'Resources' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 mx-1 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-slate-400 bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. ARTICLE TAB */}
        {activeTab === 'article' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4">
                5 Characteristics of Resourceful People
              </h1>
              <p className="text-lg text-indigo-300/80">
                Discover the traits of well-organized, motivated, and successful individuals.
              </p>
            </header>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl text-slate-300 leading-relaxed shadow-xl">
              <p className="mb-8 text-lg">
                It is known that those who are resourceful are more successful. But, what are the characteristics of these seemingly well organized, motivated people? We did some research and compiled our top favourite characteristics for you to look at.
              </p>

              <div className="space-y-10">
                {[
                  {
                    title: "1. Open Minded.",
                    content: "The number one trait seems to be, having an open mind. Successful business people, entrepreneurs and all around resourceful people seem to be positively working at breaking boundaries and redefining what is possible and what is not. You must be able to be positive and willing to give new things a try and hope for the best outcome always. This seems like an impossibility when facing the daily struggles life throws at us, but maybe, just maybe being open-minded to trying new things could be the cure. Push yourself to go to that new event in town or meet that person you spoke to online. Stretch your horizon to new opportunities and in turn welcome new people into your life as well as letting go of the positive energy thieves. You never know what lies around the corner."
                  },
                  {
                    title: "2. They read.",
                    content: "Read a book, then another and then another. You can never read too much. Reading opens doors to imagination, education, and information like no other past time can. Resourceful people seem to be valuable to others because of the wealth of knowledge they have found through reading. If you struggle to think of conversational topics or icebreakers, pick up a book. You don't have to read an academic journal if that isn't your thing, but maybe try reading a book on animal behaviour or motivational speeches and watch your conversations flourish. When you find content that you like, follow the author or writer and keep up to date with their latest publications. You will never find a resourceful person lost for words."
                  },
                  {
                    title: "3. Imaginative.",
                    content: "Resourceful people ask the right questions, draw the right pictures, and say the right words. By this, we mean they never regret not asking someone that question they have on the tip of the tongue or find themselves regretting not being more observant. Being imaginative is not necessarily about creating something and is more to do with ingenuity. By making things look better and old things work more efficiently you are making yourself endlessly resourceful. Creative thoughts come and go quickly, one idea may not work but try another. One of those ideas may lead you to the solution you have been looking for."
                  },
                  {
                    title: "4. Resilient.",
                    content: "This is tough as we all have those bad days. Days where unfortunately we are not able to pick ourselves back up from something that shook us. Resourceful people, however, seem to have an ability to compartmentalize those things that throw us off balance, enabling them to power through and succeed. There is no such thing as procrastination in the mindset of those who are resourceful. Instead, they understand that what motivates them is what must come first. There is no sitting around, only doing. When opportunities arise (and they will) do not overthink the situation for fear of talking yourself out of them. Get on board and don't be a passive observer. Take life by the hands and grab at it."
                  },
                  {
                    title: "5. Honesty.",
                    content: "This is perhaps the most important trait that can be found in resourceful people. You will never find someone who is resourceful lie about a task or a promise. They are known for delivering not over-promising on things they cannot achieve. It is okay to say \"no\" or \"I don't know\" because in the end, it will waste more time to lie then it would be spending the time researching and learning through others. Instead of dreading the task because of your lie, resourceful people will remain hopeful that a solution can be found for any task. Train yourself to see the benefits of all situations. If you don't know something - great! It is an opportunity to learn."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-sm">
                        {idx + 1}
                      </span>
                      {item.title.substring(3)}
                    </h3>
                    <p className="pl-11 text-slate-400 group-hover:text-slate-300 transition-colors">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-indigo-900/40 to-fuchsia-900/40 border border-indigo-500/20 text-center">
                <p className="text-xl font-medium text-white">
                  Are you resourceful? The likely answer is YES. We are resourceful in our own way. It is about harnessing these abilities to be successful in our lives.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={() => setActiveTab('reflection')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Proceed to Reflection <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. REFLECTION TAB */}
        {activeTab === 'reflection' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Self Reflection</h2>
              <p className="text-slate-400">Answer the following questions to explore your own resourcefulness.</p>
            </div>

            <div className="grid gap-6">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_20px_rgba(217,70,239,0.15)] transition-all duration-300">
                  <label htmlFor={q.id} className="block text-lg font-medium text-white mb-4">
                    <span className="text-fuchsia-400 mr-2">{index + 1}.</span> {q.text}
                  </label>
                  <textarea
                    id={q.id}
                    rows={4}
                    value={reflections[q.id]}
                    onChange={(e) => handleReflectionChange(q.id, e.target.value)}
                    placeholder="Type your reflection here..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={() => setActiveTab('article')}
                className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-all"
              >
                Back
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Proceed to Resource List <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Resource List Activity</h2>
              <p className="text-slate-400 leading-relaxed bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg">
                The following chart is an activity to help you pull together a list of resources to help you make a decision about your potential career path and post-secondary education. You will need to research and provide information on two post-secondary institutions, two financial institutions, two scholarships or bursaries, and name two people that can specifically help you get connected.
              </p>
            </div>

            <div className="space-y-12">
              {resourceCategories.map((category) => (
                <div key={category.key} className="space-y-4">
                  <h3 className="text-xl font-semibold text-fuchsia-400 border-b border-fuchsia-500/20 pb-2">
                    {category.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {resources[category.key].map((item, index) => (
                      <div key={item.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            placeholder="Name / Institution..."
                            value={item.name}
                            onChange={(e) => handleResourceChange(category.key, index, 'name', e.target.value)}
                            className="bg-transparent border-b border-white/10 focus:border-indigo-400 focus:outline-none text-white font-medium px-2 py-1 w-full"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Phone/Contact Info</label>
                            <input
                              type="text"
                              value={item.contact}
                              onChange={(e) => handleResourceChange(category.key, index, 'contact', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded md p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Qualification Criteria</label>
                            <input
                              type="text"
                              value={item.criteria}
                              onChange={(e) => handleResourceChange(category.key, index, 'criteria', e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded md p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Important Info (Deadlines, etc.)</label>
                        <input
                          type="text"
                          value={item.info}
                          onChange={(e) => handleResourceChange(category.key, index, 'info', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded md p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-12">
          <button 
            onClick={() => setActiveTab('reflection')}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => setActiveTab('article')}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Finish Activity
          </button>
        </div>
      </div>
    )}

  </main>
</div>
);
};

export default App;