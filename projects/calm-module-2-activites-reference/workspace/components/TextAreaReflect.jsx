const TextAreaReflect = ({ label, placeholder, value, onChange }) => (
            <div className="mt-6 bg-amber-50 border-2 border-amber-200 p-4 rounded-xl">
                <label className="block text-sm font-black text-amber-900 mb-2"><i className="fa-solid fa-pen-to-square mr-2"></i> Teacher Checkpoint: {label}</label>
                <textarea 
                    className="w-full border-2 border-amber-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-400 min-h-[100px] text-sm"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
