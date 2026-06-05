/* inline script 1 */
const moduleTitle = "01 - Unit 1 Properties of Matter - Next Step Redesigned";
      const sourceParagraphs = ["Please use the information from the lesson to complete the guided notes right in the Google Doc. You have your own copy of notes for each lesson.","We are going to start off the course by exploring safety around household and workplace chemicals. Even though household chemicals are available to buy in stores and we often keep them around the house, they still pose many dangers. Many workplaces also require the use of chemicals, so it is important to know the basics to handle them safely.","1. When using chemicals, you should always keep the following questions in mind:","Does the substance have special handling or storage requirements?"];
      const sourceAnchors = [];
      const sourceFiles = ["01 - Unit 1 Properties of Matter - Next Step Redesigned.docx","02 - Unit 2 Energy Transfer Technologies - Next Step Redesigned.docx","03 - Unit 3 Matter and Energy in Living Systems - Next Step Redesigned.docx","04 - Unit 4 Matter and Energy in the Environment - Next Step Redesigned.docx"];

      const App = () => (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.3),_transparent_30rem),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#020617_100%)] text-slate-50">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
            <section className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-indigo-100">Doc-first import scaffold</div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">{moduleTitle}</h1>
              <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-slate-200">
                This starter workspace was generated from workbook documents because no HTML site entrypoint existed in the incoming bundle.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                <h2 className="text-2xl font-black tracking-tight text-white">Source Snapshot</h2>
                <div className="mt-5 space-y-4">
                  {sourceParagraphs.length > 0 ? sourceParagraphs.map((paragraph, index) => (
                    <p key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-slate-200">
                      {paragraph}
                    </p>
                  )) : (
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-slate-300">
                      No clean source preview was extracted. Use the reference documents directly while building the workspace.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                  <h2 className="text-xl font-black tracking-tight text-white">Detected Topics</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sourceAnchors.length > 0 ? sourceAnchors.map((anchor) => (
                      <span key={anchor} className="rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-indigo-100">
                        {anchor}
                      </span>
                    )) : (
                      <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-200">
                        Workbook content detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                  <h2 className="text-xl font-black tracking-tight text-white">Imported Sources</h2>
                  <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-200">
                    {sourceFiles.map((filePath) => (
                      <li key={filePath} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{filePath}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      );

      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(<App />);
