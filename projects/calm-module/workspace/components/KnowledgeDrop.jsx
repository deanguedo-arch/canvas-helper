const KnowledgeDrop = ({ title, children, defaultOpen = true, color = "sky" }) => {
          const [isOpen, setIsOpen] = useState(defaultOpen);
          
          const colorStyles = {
            sky: "bg-sky-50 border-sky-200 text-sky-900 shadow-[0_4px_0_0_#bae6fd]",
            amber: "bg-amber-50 border-amber-200 text-amber-900 shadow-[0_4px_0_0_#fde68a]",
            emerald: "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-[0_4px_0_0_#a7f3d0]",
            rose: "bg-rose-50 border-rose-200 text-rose-900 shadow-[0_4px_0_0_#fecdd3]",
            violet: "bg-violet-50 border-violet-200 text-violet-900 shadow-[0_4px_0_0_#ddd6fe]"
          };

          const iconColors = {
            sky: "bg-sky-200 text-sky-700",
            amber: "bg-amber-200 text-amber-700",
            emerald: "bg-emerald-200 text-emerald-700",
            rose: "bg-rose-200 text-rose-700",
            violet: "bg-violet-200 text-violet-700"
          };

          return (
            <div className={`rounded-2xl border-2 mb-8 transition-all duration-300 overflow-hidden print:break-inside-avoid print:shadow-none ${colorStyles[color]}`}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 md:p-5 focus:outline-none focus:bg-white/50 transition-colors print:hidden"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
                    <i className="fa-solid fa-lightbulb text-lg"></i>
                  </div>
                  <span className="font-black text-lg md:text-xl tracking-tight">Read This First: {title}</span>
                </div>
                {isOpen ? <i className="fa-solid fa-chevron-up text-xl opacity-60"></i> : <i className="fa-solid fa-chevron-down text-xl opacity-60"></i>}
              </button>

              {/* Print-only title */}
              <div className="hidden print:flex items-center gap-3 p-4 border-b-2 border-slate-200">
                <i className="fa-solid fa-lightbulb w-5 h-5"></i>
                <span className="font-black text-lg tracking-tight">Read This First: {title}</span>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out print:max-h-none print:opacity-100 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 md:p-6 pt-0 text-base font-medium leading-relaxed opacity-90 border-t-2 border-white/40 mt-2 print:border-none print:pt-4">
                  {children}
                </div>
              </div>
            </div>
          );
        };
