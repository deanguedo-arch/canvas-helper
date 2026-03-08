import type { AssessmentProject } from '../../core/schema/assessment'
import type { ExportResult } from '../../export/shared/exportResult'

type ExportViewProps = {
  currentProject: AssessmentProject | null
  exportResult: ExportResult | null
  onDownloadCsv: () => void
}

export function ExportView({
  currentProject,
  exportResult,
  onDownloadCsv,
}: ExportViewProps) {
  if (!currentProject || !exportResult) {
    return (
      <section className="workspace-panel">
        <h2>Export</h2>
        <p>No project is loaded.</p>
      </section>
    )
  }

  return (
    <section className="workspace-panel export-shell">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Brightspace CSV</p>
          <h2>{exportResult.fileName}</h2>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={onDownloadCsv}
          disabled={exportResult.status !== 'success'}
        >
          Download CSV
        </button>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <strong>{exportResult.status}</strong>
          <span>Status</span>
        </article>
        <article className="summary-card">
          <strong>{exportResult.rows.length}</strong>
          <span>CSV rows</span>
        </article>
        <article className="summary-card">
          <strong>{exportResult.diagnostics.length}</strong>
          <span>Diagnostics</span>
        </article>
        <article className="summary-card">
          <strong>{currentProject.questions.length}</strong>
          <span>Questions</span>
        </article>
      </div>

      <section className="workspace-subpanel">
        <div className="panel-heading">
          <h3>Diagnostics</h3>
        </div>
        {exportResult.diagnostics.length === 0 ? (
          <p className="success-banner">No exporter diagnostics were generated.</p>
        ) : (
          <div className="issue-list">
            {exportResult.diagnostics.map((diagnostic) => (
              <article
                key={`${diagnostic.code}-${diagnostic.questionId ?? 'project'}-${diagnostic.message}`}
                className={
                  diagnostic.severity === 'error'
                    ? 'issue-card error'
                    : diagnostic.severity === 'warning'
                      ? 'issue-card warning'
                      : 'issue-card info'
                }
              >
                <div className="issue-card-header">
                  <strong>{diagnostic.code}</strong>
                  <span>{diagnostic.questionId ?? 'project'}</span>
                </div>
                <p>{diagnostic.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-subpanel">
        <div className="panel-heading">
          <h3>CSV Preview</h3>
        </div>
        <textarea
          className="csv-preview"
          readOnly
          rows={18}
          value={exportResult.content ?? ''}
        />
      </section>
    </section>
  )
}
