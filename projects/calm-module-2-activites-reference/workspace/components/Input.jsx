const Input = ({ label, type = "text", value, onChange, placeholder, prefix }) => (
            <div>
                {label && <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>}
                <div className="relative">
                    {prefix && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">{prefix}</div>}
                    <input 
                        type={type} 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full border-2 border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${prefix ? 'pl-8' : ''}`}
                    />
                </div>
            </div>
        );
