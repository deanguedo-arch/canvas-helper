export type StudioCommandName = "analyze" | "refs" | "verify" | "export" | "package" | "html";

export type SessionLogPayload = {
  savedAt?: string;
  sourcePath?: string;
  selectedMode?: "raw" | "workspace";
  compareMode?: boolean;
  sidebarOpen?: boolean;
  inspectorOpen?: boolean;
  devices?: {
    raw?: string;
    workspace?: string;
  };
  zooms?: {
    raw?: number;
    workspace?: number;
  };
  scrollTop?: {
    raw?: number | null;
    workspace?: number | null;
  };
  sourceFiles?: string[];
};
