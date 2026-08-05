import type { CourseBuildBrief } from "../../../shared/course-build-brief.js";
import { buildCourseBuildBriefPacket } from "../lib/course-build-brief";

type CourseBuildBriefPanelProps = {
  brief: CourseBuildBrief | null;
  loading: boolean;
  error: string;
  copyStatus: string;
  onCopy: (packet: string) => void;
};

function statusLabel(status: CourseBuildBrief["status"]) {
  return status === "proposal-only" ? "Needs source route" : status;
}

export function CourseBuildBriefPanel({ brief, loading, error, copyStatus, onCopy }: CourseBuildBriefPanelProps) {
  const packet = brief ? buildCourseBuildBriefPacket(brief) : "";

  return (
    <section className="panel-card course-build-brief" data-testid="course-build-brief">
      <div className="section-header">
        <div>
          <h3>Course build brief</h3>
          <p>Small, local map of where this course can safely change.</p>
        </div>
        {brief ? <span className={`brief-status ${brief.status}`}>{statusLabel(brief.status)}</span> : null}
      </div>
      {loading ? <p className="empty-state" role="status">Checking the declared course route…</p> : null}
      {error ? <p className="inspection-warning">{error}</p> : null}
      {brief ? (
        <div className="course-build-brief-details">
          <dl>
            <div>
              <dt>Driver</dt>
              <dd data-testid="course-build-brief-driver">{brief.driver ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{brief.mode ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>{brief.generatedOutput ? "Generated" : "Direct"}</dd>
            </div>
          </dl>
          <div className="brief-path-list">
            <strong>Editable sources</strong>
            {brief.editableSources.length ? brief.editableSources.map((source) => <code key={source}>{source}</code>) : <span>No safe editable source is declared.</span>}
          </div>
          {brief.sharedSources.length ? (
            <div className="brief-path-list">
              <strong>Shared sources</strong>
              {brief.sharedSources.map((source) => <code key={source}>{source}</code>)}
            </div>
          ) : null}
          <p className="inspection-target"><strong>Rebuild</strong><code>{brief.rebuildCommand ?? "Not declared."}</code></p>
          <p className="inspection-target"><strong>Validate</strong><code>{brief.validationCommand}</code></p>
          {brief.issues.map((issue) => <p key={`${issue.code}-${issue.message}`} className="inspection-warning">{issue.message}</p>)}
          <pre className="inspection-packet course-build-brief-packet" data-testid="course-build-brief-packet">{packet}</pre>
          <div className="inspection-actions">
            <button type="button" className="ghost-button compact active-toggle" onClick={() => onCopy(packet)} data-testid="copy-course-build-brief">
              Copy build brief
            </button>
            {copyStatus ? <span className="inspection-copy-status" role="status">{copyStatus}</span> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
