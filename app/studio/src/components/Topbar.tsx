import { useEffect, useMemo, useRef, useState } from "react";

import {
  getProjectGroupLabel,
  getProjectLabel,
  getProjectStatusLabel,
  getVisibleStudioProjects
} from "../lib/project-display";
import type { ProjectBundle } from "../lib/types";

type StudioMode = "course" | "assessment";
type PreviewConnectionStatus = "starting" | "ready" | "error";

type TopbarProps = {
  studioMode: StudioMode;
  projects: ProjectBundle[];
  selectedSlug: string;
  favoriteSlugs: string[];
  recentSlugs: string[];
  previewStatus: PreviewConnectionStatus;
  previewMessage: string;
  onStudioModeChange: (mode: StudioMode) => void;
  onProjectChange: (slug: string) => void;
  onToggleFavorite: (slug: string) => void;
  onNewProject: () => void;
  onRetryPreview: () => void;
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="m10 2.9 2.08 4.22 4.66.68-3.37 3.28.8 4.64L10 13.53l-4.17 2.19.8-4.64L3.26 7.8l4.66-.68L10 2.9Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function uniqueProjects(projects: ProjectBundle[]) {
  return projects.filter((project, index, all) => (
    all.findIndex((candidate) => candidate.manifest.slug === project.manifest.slug) === index
  ));
}

export function Topbar({
  studioMode,
  projects,
  selectedSlug,
  favoriteSlugs,
  recentSlugs,
  previewStatus,
  previewMessage,
  onStudioModeChange,
  onProjectChange,
  onToggleFavorite,
  onNewProject,
  onRetryPreview
}: TopbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchShellRef = useRef<HTMLDivElement | null>(null);
  const visibleProjects = useMemo(() => getVisibleStudioProjects(projects), [projects]);
  const projectBySlug = useMemo(
    () => new Map(visibleProjects.map((project) => [project.manifest.slug, project])),
    [visibleProjects]
  );
  const favoriteSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);

  const resultSections = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (query) {
      const matches = visibleProjects.filter((project) => {
        const label = getProjectLabel(project).toLocaleLowerCase();
        const slug = project.manifest.slug.toLocaleLowerCase();
        return label.includes(query) || slug.includes(query);
      });
      return [{ label: "Results", projects: matches.slice(0, 12) }];
    }

    const favorites = favoriteSlugs.map((slug) => projectBySlug.get(slug)).filter(Boolean) as ProjectBundle[];
    const recents = recentSlugs
      .map((slug) => projectBySlug.get(slug))
      .filter((project): project is ProjectBundle => project !== undefined && !favoriteSet.has(project.manifest.slug));
    const seen = new Set([...favorites, ...recents].map((project) => project.manifest.slug));
    const more = visibleProjects.filter((project) => !seen.has(project.manifest.slug)).slice(0, 8);
    return [
      { label: "Favorites", projects: uniqueProjects(favorites) },
      { label: "Recent", projects: uniqueProjects(recents) },
      { label: "All courses", projects: more }
    ].filter((section) => section.projects.length > 0);
  }, [favoriteSet, favoriteSlugs, projectBySlug, recentSlugs, searchValue, visibleProjects]);

  useEffect(() => {
    setSearchValue("");
    setSearchOpen(false);
  }, [selectedSlug]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
        return;
      }
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        searchRef.current?.blur();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (searchShellRef.current && !searchShellRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [searchOpen]);

  const chooseProject = (slug: string) => {
    onProjectChange(slug);
    onStudioModeChange("course");
    setSearchOpen(false);
  };

  const firstResult = resultSections.flatMap((section) => section.projects)[0];

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

      <div className="studio-search-shell" ref={searchShellRef}>
        <label className="studio-global-search">
          <span className="sr-only">Search courses</span>
          <SearchIcon />
          <input
            ref={searchRef}
            value={searchValue}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && firstResult) {
                event.preventDefault();
                chooseProject(firstResult.manifest.slug);
              }
            }}
            placeholder="Search courses…"
            autoComplete="off"
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="studio-course-results"
            data-testid="course-search-input"
          />
          <kbd>⌘K</kbd>
        </label>

        {searchOpen ? (
          <section className="course-finder" id="studio-course-results" aria-label="Course finder" data-testid="course-finder">
            {resultSections.length ? resultSections.map((section) => (
              <div className="course-finder-section" key={section.label}>
                <h2>{section.label}</h2>
                {section.projects.map((project) => {
                  const slug = project.manifest.slug;
                  const favorite = favoriteSet.has(slug);
                  return (
                    <div className={slug === selectedSlug ? "course-finder-row selected" : "course-finder-row"} key={slug}>
                      <button
                        type="button"
                        className="course-finder-result"
                        onClick={() => chooseProject(slug)}
                        data-testid={`course-result-${slug}`}
                      >
                        <strong>{getProjectLabel(project)}</strong>
                        <span>{getProjectGroupLabel(project)} · {getProjectStatusLabel(project)}</span>
                      </button>
                      <button
                        type="button"
                        className={favorite ? "course-favorite active" : "course-favorite"}
                        onClick={() => onToggleFavorite(slug)}
                        aria-label={`${favorite ? "Remove" : "Add"} ${getProjectLabel(project)} ${favorite ? "from" : "to"} favorites`}
                        aria-pressed={favorite}
                      >
                        <StarIcon filled={favorite} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )) : (
              <div className="course-finder-empty">No matching courses.</div>
            )}
            <button type="button" className="course-finder-new" onClick={onNewProject} data-testid="new-project-button">
              <span aria-hidden="true">+</span>
              <span><strong>New Project</strong><small>Import from local intake</small></span>
            </button>
          </section>
        ) : null}
      </div>

      <button type="button" className="topbar-new-project" onClick={onNewProject} data-testid="topbar-new-project">
        <span aria-hidden="true">+</span> New Project
      </button>

      <button
        type="button"
        className={`studio-connection ${previewStatus}`}
        onClick={previewStatus === "error" ? onRetryPreview : undefined}
        title={previewMessage || undefined}
        data-testid="preview-connection"
      >
        <span aria-hidden="true" />
        {previewStatus === "ready" ? "Preview ready" : previewStatus === "error" ? "Reconnect preview" : "Starting preview"}
      </button>
    </header>
  );
}
