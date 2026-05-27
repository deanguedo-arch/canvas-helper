const optionTwoCourses = [
  {
    id: "forensics-thirty-five",
    title: "Forensics 35",
    area: "Options",
    category: "options",
    status: "Live",
    url: "https://forensics35.web.app",
    icon: "./assets/course-icons/forensics-35.svg",
    description: "Dive into real-world forensic science through hands-on lessons, case studies, and interactive quizzes.",
    summary: "A tighter detail panel gives administrators the course information they need without competing with the preview.",
    highlight: "Evidence, cases, critical thinking.",
    resume: "Case Study 4: Trace Evidence",
    modules: 8,
    lessons: 42,
    quizzes: 12,
    time: "30h",
    rating: "4.8",
    updated: "May 20, 2025",
    version: "v3.5.2",
    accent: "rgba(89, 168, 68, 0.28)"
  },
  {
    id: "general-psychology",
    title: "Psychology 20",
    area: "Options",
    category: "options",
    status: "Live",
    url: "https://generalpsychology.web.app",
    icon: "./assets/course-icons/general-psychology.svg",
    description: "Independent studies psychology with guided units, readable activities, and final reflection support.",
    summary: "A clean psychology course preview for stakeholders who need to see flow, pacing, and learner supports quickly.",
    highlight: "Behaviour, thinking, reflection.",
    resume: "Module 3: Learning and Memory",
    modules: 7,
    lessons: 22,
    quizzes: 8,
    time: "18h",
    rating: "4.8",
    updated: "May 16, 2025",
    version: "v2.0.6",
    accent: "rgba(89, 168, 68, 0.2)"
  },
  {
    id: "learning-strategies-25",
    title: "Learning Strategies 25",
    area: "LDC",
    category: "ldc",
    status: "Live",
    url: "https://learningstrategies25.web.app",
    icon: "./assets/course-icons/learning-strategies.svg",
    description: "Organized lessons, visible module flow, and Google-hosted progress support for LDC learners.",
    summary: "A practical student-success course with calm pacing, progress language, and clear support structures.",
    highlight: "Skills, organization, agency.",
    resume: "Study Systems: Weekly Planning",
    modules: 6,
    lessons: 24,
    quizzes: 6,
    time: "16h",
    rating: "4.7",
    updated: "May 18, 2025",
    version: "v1.0.0",
    accent: "rgba(253, 191, 63, 0.24)"
  },
  {
    id: "career-portfolio",
    title: "CALM Career Portfolio",
    area: "CALM",
    category: "calm",
    status: "Live",
    url: "https://calmmodule4.web.app",
    icon: "./assets/course-icons/calm-career-portfolio.svg",
    description: "Career and portfolio planning with focused reflections, resume work, and polished hosted delivery.",
    summary: "A CALM workspace that keeps planning activities structured and easy to return to.",
    highlight: "Career planning, portfolio, goals.",
    resume: "Final Reflection Responses",
    modules: 5,
    lessons: 18,
    quizzes: 4,
    time: "12h",
    rating: "4.9",
    updated: "May 22, 2025",
    version: "v4.0.3",
    accent: "rgba(89, 168, 68, 0.22)"
  },
  {
    id: "sports-wellness",
    title: "Sports Wellness",
    area: "Wellness",
    category: "wellness",
    status: "Live",
    url: "https://sportwellness.web.app",
    icon: "./assets/course-icons/sports-wellness.svg",
    description: "Wellness course experience focused on activity, reflection, health literacy, and learner progress.",
    summary: "A wellness course view designed to feel active without looking like a noisy activity tracker.",
    highlight: "Activity, reflection, wellness.",
    resume: "Personal Wellness Plan",
    modules: 6,
    lessons: 20,
    quizzes: 5,
    time: "15h",
    rating: "4.7",
    updated: "May 14, 2025",
    version: "v1.8.0",
    accent: "rgba(89, 168, 68, 0.18)"
  },
  {
    id: "mental-health-wellness",
    title: "Mental Health & Wellness",
    area: "Wellness",
    category: "wellness",
    status: "Live",
    url: "https://mentalhealthandwellness.web.app",
    icon: "./assets/course-icons/mental-health-wellness.svg",
    description: "Guided units, readable lesson cards, and learner supports for mental health and wellness topics.",
    summary: "A careful wellness preview with simple hierarchy and low-friction navigation for sensitive content.",
    highlight: "Care, support, resilience.",
    resume: "Stress and Support Systems",
    modules: 7,
    lessons: 26,
    quizzes: 6,
    time: "20h",
    rating: "4.8",
    updated: "May 15, 2025",
    version: "v1.0.0",
    accent: "rgba(89, 168, 68, 0.18)"
  },
  {
    id: "world-religions",
    title: "World Religions 30",
    area: "Options",
    category: "options",
    status: "Live",
    url: "https://worldreligion.web.app",
    icon: "./assets/course-icons/world-religions.svg",
    description: "Chapter modules, readings, activities, and stakeholder-ready hosted delivery.",
    summary: "A humanities-style course preview that stays organized around chapters and source material.",
    highlight: "Cultures, beliefs, context.",
    resume: "Chapter 4: Faith and Society",
    modules: 9,
    lessons: 34,
    quizzes: 10,
    time: "28h",
    rating: "4.6",
    updated: "May 12, 2025",
    version: "v3.0.4",
    accent: "rgba(253, 191, 63, 0.22)"
  },
  {
    id: "ai-course-resources",
    title: "AI Course Resources",
    area: "Resources",
    category: "resources",
    status: "Live",
    url: "https://digitalpresentation.web.app",
    icon: "./assets/course-icons/ai-course-resources.svg",
    description: "Resource hub for course-building support, AI workflows, assessment integrity, and digital presentation guidance.",
    summary: "A resource preview for teachers who need repeatable course-building workflows and examples.",
    highlight: "Resources, workflows, examples.",
    resume: "Course Builder Workflow",
    modules: 4,
    lessons: 16,
    quizzes: 2,
    time: "8h",
    rating: "4.6",
    updated: "May 10, 2025",
    version: "v1.0.0",
    accent: "rgba(253, 191, 63, 0.2)"
  }
];

const favoriteCourseIds = new Set(["forensics-thirty-five", "general-psychology", "career-portfolio"]);

const state = {
  selectedId: "forensics-thirty-five",
  filter: "all",
  query: "",
  device: "desktop"
};

const elements = {
  search: document.querySelector("#optionTwoSearch"),
  cardList: document.querySelector("#optionTwoCourses"),
  filterButtons: [...document.querySelectorAll("[data-filter]")],
  shortcutButtons: [...document.querySelectorAll("[data-filter-shortcut]")],
  deviceButtons: [...document.querySelectorAll("[data-device]")],
  selectedFeature: document.querySelector("#selectedFeature"),
  selectedAreaPill: document.querySelector("#selectedAreaPill"),
  selectedStatusPill: document.querySelector("#selectedStatusPill"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedDescription: document.querySelector("#selectedDescription"),
  selectedHighlight: document.querySelector("#selectedHighlight"),
  openCourse: document.querySelector("#openCourse"),
  resumeCourse: document.querySelector("#resumeCourse"),
  statLessons: document.querySelector("#statLessons"),
  statModules: document.querySelector("#statModules"),
  statQuizzes: document.querySelector("#statQuizzes"),
  statTime: document.querySelector("#statTime"),
  metricModules: document.querySelector("#metricModules"),
  metricLessons: document.querySelector("#metricLessons"),
  metricQuizzes: document.querySelector("#metricQuizzes"),
  metricTime: document.querySelector("#metricTime"),
  activityTitle: document.querySelector("#activityTitle"),
  activityMeta: document.querySelector("#activityMeta"),
  detailSymbol: document.querySelector("#detailSymbol"),
  detailTitle: document.querySelector("#detailTitle"),
  detailSummary: document.querySelector("#detailSummary"),
  detailArea: document.querySelector("#detailArea"),
  detailStatus: document.querySelector("#detailStatus"),
  detailCategory: document.querySelector("#detailCategory"),
  detailHost: document.querySelector("#detailHost"),
  detailVersion: document.querySelector("#detailVersion"),
  detailUpdated: document.querySelector("#detailUpdated"),
  detailOpen: document.querySelector("#detailOpen"),
  copyLink: document.querySelector("#copyLink")
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function hostLabel(url) {
  return new URL(url).hostname.replace(".web.app", "");
}

function getSelectedCourse() {
  return optionTwoCourses.find((course) => course.id === state.selectedId) || optionTwoCourses[0];
}

function getFilteredCourses() {
  const query = state.query.trim().toLowerCase();
  return optionTwoCourses.filter((course) => {
    const matchesFilter = state.filter === "all"
      || (state.filter === "favorites" && favoriteCourseIds.has(course.id))
      || course.category === state.filter;
    const haystack = `${course.title} ${course.area} ${course.description} ${course.highlight}`.toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
}

function updateActiveControls() {
  elements.filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
  elements.shortcutButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filterShortcut === state.filter);
  });
  elements.deviceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.device === state.device);
  });
}

function renderOptionTwoCards() {
  const courses = getFilteredCourses();

  if (courses.length === 0) {
    elements.cardList.innerHTML = `
      <article class="course-mini-card">
        <button type="button" disabled>
          <span class="course-card-body">
            <strong>No courses found</strong>
            <p>Try a different search or category.</p>
          </span>
        </button>
      </article>
    `;
    return;
  }

  elements.cardList.innerHTML = courses.map((course) => {
    const selectedClass = course.id === state.selectedId ? " is-selected" : "";
    const favoriteIcon = favoriteCourseIds.has(course.id) ? "&#9829;" : "&#9825;";
    return `
      <article class="course-mini-card${selectedClass}" style="--card-accent: ${course.accent}">
        <button type="button" data-course-card="${escapeHtml(course.id)}" aria-label="Preview ${escapeHtml(course.title)}">
          <span class="course-card-art">
            <img src="${escapeHtml(course.icon)}" alt="" aria-hidden="true" />
            <span class="favorite-button" aria-hidden="true">${favoriteIcon}</span>
          </span>
          <span class="course-card-body">
            <strong>${escapeHtml(course.title)}</strong>
            <p>${escapeHtml(course.area)} - ${escapeHtml(course.status)}</p>
            <span class="course-card-meta">
              <span>Star ${escapeHtml(course.rating)}</span>
              <span>${course.lessons} lessons</span>
            </span>
          </span>
        </button>
      </article>
    `;
  }).join("");
}

function selectOptionTwoCourse(courseId) {
  const course = optionTwoCourses.find((item) => item.id === courseId);
  if (!course) return;

  state.selectedId = course.id;
  const host = hostLabel(course.url);

  elements.selectedAreaPill.textContent = course.area;
  elements.selectedStatusPill.textContent = course.status;
  elements.selectedTitle.textContent = course.title;
  elements.selectedDescription.textContent = course.description;
  elements.selectedHighlight.textContent = course.highlight;
  elements.openCourse.href = course.url;
  elements.resumeCourse.href = course.url;
  elements.resumeCourse.textContent = `Resume: ${course.resume}`;

  elements.statLessons.textContent = String(course.lessons);
  elements.statModules.textContent = String(course.modules);
  elements.statQuizzes.textContent = String(course.quizzes);
  elements.statTime.textContent = course.time;
  elements.metricModules.textContent = String(course.modules);
  elements.metricLessons.textContent = String(course.lessons);
  elements.metricQuizzes.textContent = String(course.quizzes);
  elements.metricTime.textContent = course.time;

  elements.activityTitle.textContent = course.resume;
  elements.activityMeta.textContent = `In progress - Last accessed ${course.updated}`;
  elements.detailTitle.textContent = course.title;
  elements.detailSummary.textContent = course.summary;
  elements.detailArea.textContent = course.area;
  elements.detailStatus.textContent = course.status;
  elements.detailCategory.textContent = course.area;
  elements.detailHost.textContent = host;
  elements.detailVersion.textContent = course.version;
  elements.detailUpdated.textContent = course.updated;
  elements.detailOpen.href = course.url;
  elements.detailSymbol.style.backgroundImage = `radial-gradient(circle at center, ${course.accent}, transparent 28%), url("${course.icon}")`;
  elements.detailSymbol.style.backgroundSize = "100% 100%, 34px 34px";
  elements.detailSymbol.style.backgroundPosition = "center, center";
  elements.detailSymbol.style.backgroundRepeat = "no-repeat, no-repeat";
  elements.selectedFeature.dataset.device = state.device;

  renderOptionTwoCards();
}

function setOptionTwoFilter(filter) {
  state.filter = filter;
  const courses = getFilteredCourses();
  if (courses.length > 0 && !courses.some((course) => course.id === state.selectedId)) {
    state.selectedId = courses[0].id;
  }
  updateActiveControls();
  selectOptionTwoCourse(state.selectedId);
}

function setDevice(device) {
  state.device = device;
  updateActiveControls();
  elements.selectedFeature.dataset.device = device;
}

elements.cardList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-course-card]");
  if (!button) return;
  selectOptionTwoCourse(button.dataset.courseCard);
});

elements.filterButtons.forEach((button) => {
  button.addEventListener("click", () => setOptionTwoFilter(button.dataset.filter));
});

elements.shortcutButtons.forEach((button) => {
  button.addEventListener("click", () => setOptionTwoFilter(button.dataset.filterShortcut));
});

elements.deviceButtons.forEach((button) => {
  button.addEventListener("click", () => setDevice(button.dataset.device));
});

elements.search.addEventListener("input", () => {
  state.query = elements.search.value;
  renderOptionTwoCards();
});

document.querySelector("[data-filter-all]")?.addEventListener("click", () => {
  state.query = "";
  elements.search.value = "";
  setOptionTwoFilter("all");
});

document.querySelector("[data-scroll-preview]")?.addEventListener("click", () => {
  document.querySelector("#browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

elements.copyLink.addEventListener("click", async () => {
  const course = getSelectedCourse();
  try {
    await navigator.clipboard.writeText(course.url);
    elements.copyLink.textContent = "Copied";
    window.setTimeout(() => {
      elements.copyLink.textContent = "Copy Preview Link";
    }, 1400);
  } catch {
    elements.copyLink.textContent = course.url;
  }
});

updateActiveControls();
renderOptionTwoCards();
selectOptionTwoCourse(state.selectedId);
