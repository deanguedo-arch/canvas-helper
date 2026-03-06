const PillRadioGroup = ({ options, name, value, onChange }) => (
          <div className="flex flex-wrap gap-3 mt-3 mb-6 print:break-inside-avoid">
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <label 
                  key={opt} 
                  className={`
                    cursor-pointer select-none inline-flex items-center px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 border-2
                    ${isSelected 
                      ? 'bg-violet-500 border-violet-600 text-white shadow-[0_4px_0_0_#5b21b6] translate-y-[-2px] print:bg-violet-100 print:text-violet-900 print:border-violet-400 print:shadow-none print:translate-y-0' 
                      : 'bg-white border-slate-200 text-slate-600 shadow-[0_4px_0_0_#e2e8f0] hover:border-violet-200 hover:text-violet-600 active:translate-y-[2px] active:shadow-none print:shadow-none'}
                  `}
                >
                  <input
                    type="radio"
                    name={name}
                    value={opt}
                    checked={isSelected}
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              )
            })}
          </div>
        );
