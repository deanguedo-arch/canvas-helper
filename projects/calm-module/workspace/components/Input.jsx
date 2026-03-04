const Input = ({ value, onChange, placeholder, type = "text" }) => (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 outline-none hover:border-violet-300 print:bg-white print:border-slate-300 print:shadow-none"
          />
        );
