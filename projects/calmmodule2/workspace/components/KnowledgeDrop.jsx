const KnowledgeDrop = ({ title, children, defaultOpen = true }) => {
            const [isOpen, setIsOpen] = useState(defaultOpen);
            return (
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 mb-6 overflow-hidden transition-all">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="w-full flex items-center justify-between p-4 bg-amber-100/50 hover:bg-amber-100 text-amber-900 font-bold"
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-amber-500 text-xl"></i>
                            <span>{title}</span>
                        </div>
                        <i className={`fa-solid fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {isOpen && <div className="p-6 text-amber-900 space-y-4 leading-relaxed">{children}</div>}
                </div>
            );
        };
