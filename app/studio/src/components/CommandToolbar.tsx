import { STUDIO_COMMANDS, type StudioCommandName, type StudioCommandStatus } from "../lib/types";

type CommandToolbarProps = {
  commandStatus: Record<StudioCommandName, StudioCommandStatus>;
  commandOutputVisible: boolean;
  commandBanner: string;
  commandBannerIsError: boolean;
  commandLog: string;
  anyCommandRunning: boolean;
  onRunCommand: (command: StudioCommandName) => void;
  onToggleOutput: () => void;
};

export function CommandToolbar({
  commandStatus,
  commandOutputVisible,
  commandBanner,
  commandBannerIsError,
  commandLog,
  anyCommandRunning,
  onRunCommand,
  onToggleOutput
}: CommandToolbarProps) {
  return (
    <div className="workspace-actions-footer">
      <div className="workspace-actions-row">
        <div className="run-controls">
          {STUDIO_COMMANDS.map((command) => {
            const status = commandStatus[command.id];
            const buttonClass =
              status === "success"
                ? "ghost-button compact run-button success"
                : status === "error"
                  ? "ghost-button compact run-button error"
                  : status === "running"
                    ? "ghost-button compact run-button running"
                    : "ghost-button compact run-button";

            return (
              <button
                key={command.id}
                type="button"
                className={buttonClass}
                disabled={anyCommandRunning}
                onClick={() => onRunCommand(command.id)}
              >
                {status === "running" ? `${command.label}...` : command.label}
              </button>
            );
          })}
        </div>

        <button type="button" className="ghost-button compact workspace-output-toggle" onClick={onToggleOutput}>
          {commandOutputVisible ? "Hide Output" : "Show Output"}
        </button>
      </div>

      {commandOutputVisible && commandBanner ? (
        <div className={commandBannerIsError ? "status-banner error" : "status-banner"}>{commandBanner}</div>
      ) : null}

      {commandOutputVisible && commandLog ? <pre className="command-output">{commandLog}</pre> : null}
    </div>
  );
}
