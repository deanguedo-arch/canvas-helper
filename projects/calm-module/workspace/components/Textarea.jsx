const Textarea = ({ value, onChange, placeholder, rows = 3 }) => {
          const textareaRef = useRef(null);

          useEffect(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
          }, [value]);

          return (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              rows={rows}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-colors duration-200 outline-none hover:border-violet-300 resize-none leading-relaxed overflow-hidden print:bg-white print:border-slate-300 print:shadow-none"
            />
          );
        };
