export function parseTruthyFlag(value: string | boolean | undefined) {
  if (value === true) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(normalized);
}

export function readSubagentModeFromEnv(env = process.env) {
  return parseTruthyFlag(env.SUBAGENT_MODE) || parseTruthyFlag(env.CANVAS_HELPER_SUBAGENT_MODE);
}
