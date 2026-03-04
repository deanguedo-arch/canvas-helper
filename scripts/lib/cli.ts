export type ParsedArgs = {
  flags: Record<string, string | boolean>;
  positionals: string[];
};

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const trimmed = arg.slice(2);

    if (trimmed.includes("=")) {
      const [name, ...valueParts] = trimmed.split("=");
      flags[name] = valueParts.join("=");
      continue;
    }

    const nextArg = argv[index + 1];
    if (nextArg && !nextArg.startsWith("--")) {
      flags[trimmed] = nextArg;
      index += 1;
      continue;
    }

    flags[trimmed] = true;
  }

  return { flags, positionals };
}

export function getStringFlag(parsedArgs: ParsedArgs, name: string) {
  const value = parsedArgs.flags[name];
  return typeof value === "string" ? value : undefined;
}

export function hasFlag(parsedArgs: ParsedArgs, name: string) {
  return parsedArgs.flags[name] === true;
}
