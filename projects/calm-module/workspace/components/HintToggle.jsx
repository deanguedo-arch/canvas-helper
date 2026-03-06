const HintToggle = ({ example }) => {
          const [isOpen, setIsOpen] = useState(false);
          return (
            <div className="mb-3 mt-1 print:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs font-black uppercase tracking-wider text-violet-500 hover:text-violet-700 transition-colors flex items-center bg-violet-50 px-3 py-1.5 rounded-xl border-2 border-violet-100 hover:border-violet-300 active:bg-violet-100"
              >
                <i className="fa-solid fa-lightbulb w-4 h-4 mr-2"></i>
                {isOpen ? "Hide Idea" : "Need an idea?"}
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-slate-50 text-slate-600 text-sm font-medium rounded-2xl border-2 border-slate-200 border-dashed">
                  <strong className="text-slate-800 block mb-1">Example Answer:</strong> 
                  "{example}"
                </div>
              </div>
            </div>
          );
        };
