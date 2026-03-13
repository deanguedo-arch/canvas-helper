export type BenchmarkStatus = "approved" | "draft";
export type BenchmarkSourceSupportMode = "hidden-by-default" | "optional" | "visible";

export type BenchmarkVisualSystem = {
  surface: string;
  palette: string;
  typography: string;
};

export type BenchmarkSourceSupportPolicy = {
  mode: BenchmarkSourceSupportMode;
  label?: string;
};

export type BenchmarkRecipeRef = {
  id: string;
  purpose: string;
  required?: boolean;
};

export type BenchmarkRecord = {
  id: string;
  label: string;
  sourceProjectSlug: string;
  status: BenchmarkStatus;
  tags: string[];
  intendedUse: string[];
  visualSystem: BenchmarkVisualSystem;
  sectionFlow: string[];
  activityFamilies: string[];
  checkpointFamilies: string[];
  sourceSupportPolicy: BenchmarkSourceSupportPolicy;
  recipeRefs: BenchmarkRecipeRef[];
  summary?: string;
};

export type RecipeRecord = {
  id: string;
  family: string;
  inputs: string[];
  optionalInputs: string[];
  renderingRules: string[];
  interactionRules: string[];
  persistenceRules: string[];
  constraints: string[];
  summary?: string;
};

export type ProjectBenchmarkSelection = {
  benchmarkId: string;
  sectionOverrides?: Record<string, string>;
  sourceSupportMode?: BenchmarkSourceSupportMode;
  activityOverrides?: Record<string, string>;
  notes?: string[];
};
