import type { AssessmentProject } from '../../core/schema/assessment'
import type { ProjectValidationResult } from '../../core/validation/types'

type ValidationViewProps = {
  currentProject: AssessmentProject | null
  validationResult: ProjectValidationResult | null
}

function formatIssuePath(path: string[]) {
  return path.length > 0 ? path.join(' > ') : 'project'
}

export function ValidationView({
  currentProject,
  validationResult,
}: ValidationViewProps) {
  if (!currentProject || !validationResult) {
    return (
      <section className="workspace-panel">
        <h2>Validation</h2>
        <p>No project is loaded.</p>
      </section>
    )
  }

  return (
    <section className="workspace-panel validation-shell">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Pre-export Check</p>
          <h2>{currentProject.title}</h2>
        </div>
        <span className={validationResult.canExport ? 'status-badge good' : 'status-badge bad'}>
          {validationResult.canExport ? 'Export ready' : 'Blocked'}
        </span>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <strong>{validationResult.errors.length}</strong>
          <span>Errors</span>
        </article>
        <article className="summary-card">
          <strong>{validationResult.warnings.length}</strong>
          <span>Warnings</span>
        </article>
        <article className="summary-card">
          <strong>{validationResult.blockingIssues.length}</strong>
          <span>Blocking</span>
        </article>
        <article className="summary-card">
          <strong>{validationResult.questionResults.length}</strong>
          <span>Questions checked</span>
        </article>
      </div>

      {validationResult.issues.length === 0 ? (
        <p className="success-banner">No validation issues found. This draft can export.</p>
      ) : (
        <div className="issue-list">
          {validationResult.issues.map((issue) => (
            <article
              key={`${issue.code}-${issue.path.join('.')}-${issue.message}`}
              className={issue.severity === 'error' ? 'issue-card error' : 'issue-card warning'}
            >
              <div className="issue-card-header">
                <strong>{issue.code}</strong>
                <span>{issue.questionId ?? 'project'}</span>
              </div>
              <p>{issue.message}</p>
              <p className="issue-meta">Path: {formatIssuePath(issue.path)}</p>
              {issue.suggestedFix ? (
                <p className="issue-meta">Suggested fix: {issue.suggestedFix}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {validationResult.suggestedFixes.length > 0 ? (
        <section className="workspace-subpanel">
          <div className="panel-heading">
            <h3>Suggested Fixes</h3>
          </div>
          <ul className="compact-list">
            {validationResult.suggestedFixes.map((fix) => (
              <li key={`${fix.issueCode}-${fix.path.join('.')}`}>{fix.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}
