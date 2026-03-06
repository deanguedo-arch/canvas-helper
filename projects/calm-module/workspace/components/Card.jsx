const Card = ({ children, className = '' }) => (
          <div className={`bg-white rounded-[2rem] p-6 md:p-10 mb-8 border-2 border-slate-100 shadow-[0_8px_0_0_#e2e8f0,0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-300 print:break-inside-avoid print:shadow-none print:border-slate-300 ${className}`}>
            {children}
          </div>
        );
