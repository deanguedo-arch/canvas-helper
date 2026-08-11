import { useEffect, useMemo, useRef, useState } from "react";

import { getProjectLabel, getVisibleStudioProjects } from "../lib/project-display";
import type { ProjectBundle } from "../lib/types";

type StudioMode = "course" | "assessment";

type TopbarProps = {
  studioMode: StudioMode;
  projects: ProjectBundle[];
  selectedSlug: string;
  previewConnected: boolean;
  onStudioModeChange: (mode: StudioMode) => void;
  onProjectChange: (slug: string) => void;
};

function StudioMark() {
  return (
    <span className="studio-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M7.25 4.75h9.5a2.5 2.5 0 0 1 2.5 2.5v9.5a2.5 2.5 0 0 1-2.5 2.5h-9.5a2.5 2.5 0 0 1-2.5-2.5v-9.5a2.5 2.5 0 0 1 2.5-2.5Z" />
        <path d="M14.75 8.25h-4.5a2 2 0 0 0-2 2v3.5a2 2 0 0 0 2 2h4.5M13.25 11l2.75 1-2.75 1" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg className="studio-search-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="8.5" cy="8.5" r="5.25" />
      <path d="m12.5 12.5 4 4" />
    </svg>
  );
}

export function Topbar({
  studioMode,
  projects,
  selectedSlug,
  previewConnected,
  onStudioModeChange,
  onProjectChange
}: TopbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const visibleProjects = useMemo(() => getVisibleStudioProjects(projects), [projects]);

  useEffect(() => {
    setSearchValue("");
  }, [selectedSlug]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const chooseSearchResult = (value: string) => {
    const normalized = value.trim().toLocaleLowerCase();
    if (!normalized) return;
    const exact = visibleProjects.find((project) => {
      const label = getProjectLabel(project.manifest.slug).toLocaleLowerCase();
      return label === normalized || project.manifest.slug.toLocaleLowerCase() === normalized;
    });
    const partial = visibleProjects.find((project) =>
      getProjectLabel(project.manifest.slug).toLocaleLowerCase().includes(normalized)
    );
    const match = exact ?? partial;
    if (!match) return;
    onProjectChange(match.manifest.slug);
    onStudioModeChange("course");
  };

  return (
    <header className="topbar" data-testid="studio-topbar">
      <div className="studio-brand" aria-label="Canvas Studio">
        <StudioMark />
        <strong>Canvas Studio</strong>
      </div>

      <nav className="studio-mode-switch" aria-label="Studio mode" data-testid="studio-mode-switch">
        <button
          type="button"
          className={studioMode === "course" ? "active" : ""}
          onClick={() => onStudioModeChange("course")}
          data-testid="course-studio-tab"
        >
          Courses
        </button>
        <button
          type="button"
          className={studioMode === "assessment" ? "active" : ""}
          onClick={() => onStudioModeChange("assessment")}
          data-testid="assessment-studio-tab"
        >
          Assessments
        </button>
      </nav>

      <label className="studio-global-search">
        <span className="sr-only">Search courses</span>
        <SearchIcon />
        <input
          ref={searchRef}
          list="studio-course-options"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onBlur={(event) => chooseSearchResult(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              chooseSearchResult(event.currentTarget.value);
              event.currentTarget.blur();
            }
          }}
          placeholder="Search courses…"
          autoComplete="off"
          data-testid="course-search-input"
        />
        <datalist id="studio-course-options">
          {visibleProjects.map((project) => (
            <option key={project.manifest.id} value={getProjectLabel(project.manifest.slug)} />
          ))}
        </datalist>
        <kbd>⌘K</kbd>
      </label>

      <div className={previewConnected ? "studio-connection connected" : "studio-connection"}>
        <span aria-hidden="true" />
        {previewConnected ? "Preview ready" : "Starting preview"}
      </div>
    </header>
  );
}
