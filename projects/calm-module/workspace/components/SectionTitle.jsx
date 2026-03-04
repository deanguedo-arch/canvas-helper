const SectionTitle = ({ children, subtitle }) => (
          <div className="mb-10 text-center md:text-left print:break-after-avoid">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              {children}
            </h2>
            {subtitle && (
              <div className="mt-3 inline-block bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-violet-200 print:border-none print:bg-transparent print:p-0 print:text-slate-600">
                {subtitle}
              </div>
            )}
          </div>
        );
