const Card = ({ children, className = "" }) => (
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${className}`}>
                {children}
            </div>
        );
