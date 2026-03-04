const AutoExpandingTextarea = ({ value, onChange, placeholder, className = "" }) => {
            const textareaRef = useRef(null);
            useEffect(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                }
            }, [value]);
            return (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`clay-input w-full p-4 text-slate-700 resize-none overflow-hidden ${className}`}
                    rows={2}
                />
            );
        };
