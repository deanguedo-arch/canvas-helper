import { useEffect, useMemo, useState } from "react";

import { STUDIO_COMMANDS, shouldRefreshProjectsAfterCommand } from "../../../shared/studio-commands.js";
import { loadCommandOutputVisible, saveCommandOutputVisible } from "../lib/storage";
import type { StudioCommandName, StudioCommandResult, StudioCommandStatus } from "../lib/types";

type UseProjectCommandsOptions = {
  selectedSlug: string;
  refreshProjects: () => Promise<void>;
};

export function useProjectCommands({ selectedSlug, refreshProjects }: UseProjectCommandsOptions) {
  const [commandStatus, setCommandStatus] = useState<Record<StudioCommandName, StudioCommandStatus>>(() =>
    Object.fromEntries(STUDIO_COMMANDS.map((command) => [command.id, "idle"])) as Record<
      StudioCommandName,
      StudioCommandStatus
    >
  );
  const [commandLog, setCommandLog] = useState("");
  const [commandBanner, setCommandBanner] = useState("");
  const [commandBannerIsError, setCommandBannerIsError] = useState(false);
  const [commandOutputVisible, setCommandOutputVisible] = useState(() => loadCommandOutputVisible());

  useEffect(() => {
    saveCommandOutputVisible(commandOutputVisible);
  }, [commandOutputVisible]);

  const anyCommandRunning = useMemo(
    () => Object.values(commandStatus).some((status) => status === "running"),
    [commandStatus]
  );

  const runProjectCommand = async (command: StudioCommandName) => {
    if (!selectedSlug || anyCommandRunning) {
      return;
    }

    setCommandBanner("");
    setCommandBannerIsError(false);
    setCommandStatus((current) => ({
      ...current,
      [command]: "running"
    }));

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedSlug)}/commands/${encodeURIComponent(command)}`,
        { method: "POST" }
      );
      const payload = (await response.json()) as StudioCommandResult | { error: string };

      if (!("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Command failed.");
      }

      const logs = [payload.stdout, payload.stderr].filter(Boolean).join("\n\n").trim();
      setCommandLog(logs || "Command completed without output.");
      setCommandStatus((current) => ({
        ...current,
        [command]: payload.ok ? "success" : "error"
      }));

      if (!payload.ok) {
        setCommandBanner(`${command} failed (exit ${payload.exitCode}).`);
        setCommandBannerIsError(true);
        setCommandOutputVisible(true);
        return;
      }

      setCommandBanner(`${command} completed for ${selectedSlug}.`);
      if (shouldRefreshProjectsAfterCommand(command)) {
        await refreshProjects();
      }
    } catch (error) {
      setCommandStatus((current) => ({
        ...current,
        [command]: "error"
      }));
      setCommandBanner(error instanceof Error ? error.message : "Command failed.");
      setCommandBannerIsError(true);
      setCommandOutputVisible(true);
    }
  };

  return {
    commandStatus,
    commandLog,
    commandBanner,
    commandBannerIsError,
    commandOutputVisible,
    setCommandOutputVisible,
    anyCommandRunning,
    runProjectCommand
  };
}
