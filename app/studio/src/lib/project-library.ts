const PROJECT_LIBRARY_STORAGE_KEY = "canvas-helper/studio-project-library-v1";
const PROJECT_LIBRARY_MAX_FAVORITES = 50;
const PROJECT_LIBRARY_MAX_RECENTS = 8;

export type ProjectRecent = {
  slug: string;
  openedAt: number;
};

export type ProjectLibrary = {
  favorites: string[];
  recents: ProjectRecent[];
};

const EMPTY_LIBRARY: ProjectLibrary = { favorites: [], recents: [] };

function isSafeSlug(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value);
}

export function normalizeProjectLibrary(value: unknown): ProjectLibrary {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY_LIBRARY;
  const parsed = value as { favorites?: unknown; recents?: unknown };
  const favorites = Array.isArray(parsed.favorites)
    ? [...new Set(parsed.favorites.filter(isSafeSlug))].slice(0, PROJECT_LIBRARY_MAX_FAVORITES)
    : [];
  const recents = Array.isArray(parsed.recents)
    ? parsed.recents
        .filter((recent): recent is ProjectRecent => Boolean(
          recent &&
          typeof recent === "object" &&
          isSafeSlug((recent as ProjectRecent).slug) &&
          Number.isFinite((recent as ProjectRecent).openedAt) &&
          (recent as ProjectRecent).openedAt > 0 &&
          (recent as ProjectRecent).openedAt <= Date.now()
        ))
        .sort((left, right) => right.openedAt - left.openedAt)
        .filter((recent, index, all) => all.findIndex((candidate) => candidate.slug === recent.slug) === index)
        .slice(0, PROJECT_LIBRARY_MAX_RECENTS)
    : [];
  return { favorites, recents };
}

export function loadProjectLibrary(): ProjectLibrary {
  if (typeof window === "undefined") return EMPTY_LIBRARY;
  try {
    return normalizeProjectLibrary(JSON.parse(window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY) ?? "null"));
  } catch {
    return EMPTY_LIBRARY;
  }
}

export function saveProjectLibrary(library: ProjectLibrary) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PROJECT_LIBRARY_STORAGE_KEY, JSON.stringify(normalizeProjectLibrary(library)));
    return true;
  } catch {
    return false;
  }
}

export function touchRecentProject(library: ProjectLibrary, slug: string, openedAt = Date.now()) {
  if (!isSafeSlug(slug)) return library;
  return normalizeProjectLibrary({
    ...library,
    recents: [{ slug, openedAt }, ...library.recents.filter((recent) => recent.slug !== slug)]
  });
}

export function toggleFavoriteProject(library: ProjectLibrary, slug: string) {
  if (!isSafeSlug(slug)) return library;
  const favorites = library.favorites.includes(slug)
    ? library.favorites.filter((favorite) => favorite !== slug)
    : [slug, ...library.favorites];
  return normalizeProjectLibrary({ ...library, favorites });
}
