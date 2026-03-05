import { getStringFlag, parseArgs } from "./cli.js";

export type StudioAutoOptions = {
  host?: string;
  port?: string;
};

export type NpmSpawnPlan = {
  command: string;
  args: string[];
  shell: boolean;
};

export function parseStudioAutoOptions(argv: string[]): StudioAutoOptions {
  const parsedArgs = parseArgs(argv);

  return {
    host: getStringFlag(parsedArgs, "host"),
    port: getStringFlag(parsedArgs, "port")
  };
}

export function buildStudioArgs(options: StudioAutoOptions): string[] {
  const args = ["run", "studio"];
  const forwardedFlags: string[] = [];

  if (options.host) {
    forwardedFlags.push("--host", options.host);
  }

  if (options.port) {
    forwardedFlags.push("--port", options.port);
  }

  if (forwardedFlags.length > 0) {
    args.push("--", ...forwardedFlags);
  }

  return args;
}

export function buildNpmSpawnPlan(args: string[], platform = process.platform): NpmSpawnPlan {
  const isWindows = platform === "win32";
  const npmCommand = isWindows ? "npm.cmd" : "npm";

  return {
    command: isWindows ? [npmCommand, ...args].join(" ") : npmCommand,
    args: isWindows ? [] : args,
    shell: isWindows
  };
}
