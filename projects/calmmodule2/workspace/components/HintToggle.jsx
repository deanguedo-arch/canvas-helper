const HintToggle = ({ hint }) => {
            const [show, setShow] = useState(false);
            return (
                <div className="mt-2">
                    <button onClick={() => setShow(!show)} className="text-sm font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-2">
                        <i className="fa-solid fa-circle-question"></i> {show ? 'Hide Hint' : 'Stuck? Show Hint'}
                    </button>
                    {show && <div className="mt-2 p-3 bg-violet-50 rounded-xl border border-violet-100 text-sm text-violet-800 italic">{hint}</div>}
                </div>
            );
        };
