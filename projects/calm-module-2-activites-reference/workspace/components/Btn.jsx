const Btn = ({ children, onClick, color = "blue", className = "", disabled = false }) => {
            const colors = {
                blue: "bg-blue-600 hover:bg-blue-700 text-white",
                slate: "bg-slate-200 hover:bg-slate-300 text-slate-800",
                rose: "bg-rose-500 hover:bg-rose-600 text-white",
                emerald: "bg-emerald-500 hover:bg-emerald-600 text-white"
            };
            return (
                <button 
                    disabled={disabled}
                    onClick={onClick} 
                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${colors[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'} ${className}`}
                >
                    {children}
                </button>
            );
        };
