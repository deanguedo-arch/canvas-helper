const Label = ({ children, description }) => (
          <div className="mb-2 mt-6 print:break-after-avoid">
            <label className="block text-base font-bold text-slate-700">
              {children}
            </label>
            {description && <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>}
          </div>
        );
