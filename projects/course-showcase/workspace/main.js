const courses = [
  {
    id: "forensic-studies",
    title: "Forensic Studies 25",
    shortTitle: "Forensic Studies 25",
    category: "options",
    area: "Options",
    status: "Live",
    description: "Option 2 course shell with module navigation, assignment surfaces, and Google-hosted progress support.",
    url: "https://forensics25.web.app",
    image: "./assets/course-icons/forensic-studies.svg",
    version: "v2.5.1"
  },
  {
    id: "world-religions",
    title: "World Religions 30",
    shortTitle: "World Religions 30",
    category: "options",
    area: "Options",
    status: "Live",
    description: "World religions course build with chapter modules, readings, activities, and stakeholder-ready hosted delivery.",
    url: "https://worldreligion.web.app",
    image: "./assets/course-icons/world-religions.svg",
    version: "v3.0.4"
  },
  {
    id: "sports-wellness",
    title: "Sports Wellness",
    shortTitle: "Sports Wellness",
    category: "wellness",
    area: "Wellness",
    status: "Live",
    description: "Wellness course experience focused on activity, reflection, health literacy, and learner progress.",
    url: "https://sportwellness.web.app",
    image: "./assets/course-icons/sports-wellness.svg",
    version: "v1.8.0"
  },
  {
    id: "general-psychology",
    title: "General Psychology",
    shortTitle: "General Psychology",
    category: "options",
    area: "Options",
    status: "Live",
    description: "Independent studies psychology course with locked learner mode, guided units, and final reflection support.",
    url: "https://generalpsychology.web.app",
    image: "./assets/course-icons/general-psychology.svg",
    version: "v2.0.6"
  },
  {
    id: "career-portfolio",
    title: "CALM Career Portfolio",
    shortTitle: "CALM Career Portfolio",
    category: "calm",
    area: "CALM",
    status: "Live",
    description: "Career and portfolio module with planning activities, final reflections, and polished Google-hosted delivery.",
    url: "https://calmmodule4.web.app",
    image: "./assets/course-icons/calm-career-portfolio.svg",
    version: "v4.0.3"
  },
  {
    id: "calm-module-one",
    title: "CALM Module 1",
    shortTitle: "CALM Module 1",
    category: "calm",
    area: "CALM",
    status: "Live",
    description: "CALM personal choices module with guided reflection, learner activities, and Google-hosted progress support.",
    url: "https://calm-module-one.web.app",
    image: "./assets/course-icons/calm-module-2.svg",
    version: "v1.0.0"
  },
  {
    id: "calm-module-two",
    title: "CALM Module 2",
    shortTitle: "CALM Module 2",
    category: "calm",
    area: "CALM",
    status: "Live",
    description: "CALM module focused on life planning, decision-making, interactive checkpoints, and learner reflection.",
    url: "https://calmmodule2.web.app",
    image: "./assets/course-icons/calm-module-2.svg",
    version: "v2.2.0"
  },
  {
    id: "calm-module-three",
    title: "CALM Module 3",
    shortTitle: "CALM Module 3",
    category: "calm",
    area: "CALM",
    status: "Live",
    description: "CALM wellness module with structured lessons, learner activities, and accessible responsive presentation.",
    url: "https://calm3new.web.app",
    image: "./assets/course-icons/calm-module-3.svg",
    version: "v3.1.2"
  },
  {
    id: "experimental-psychology",
    title: "Experimental Psychology",
    shortTitle: "Experimental Psychology",
    category: "options",
    area: "Options",
    status: "Live",
    description: "Psychology course showcase for experimental thinking, research literacy, and applied analysis activities.",
    url: "https://experimentalpsychology.web.app",
    image: "./assets/course-icons/experimental-psychology.svg",
    version: "v1.4.5"
  },
  {
    id: "forensics-thirty-five",
    title: "Forensics 35",
    shortTitle: "Forensics 35",
    category: "options",
    area: "Options",
    status: "Live",
    description: "Dive into real-world forensic science through hands-on lessons, case studies, and interactive quizzes.",
    url: "https://forensics35.web.app",
    image: "./assets/course-icons/forensics-35.svg",
    version: "v3.5.2"
  },
  {
    id: "ai-course-resources",
    title: "AI Course Building Resources",
    shortTitle: "AI Course Building Resources",
    category: "resources",
    area: "Resources",
    status: "Live",
    description: "Resource hub for course-building support, AI workflows, assessment integrity, and digital presentation guidance.",
    url: "https://digitalpresentation.web.app",
    image: "./assets/course-icons/ai-course-resources.svg",
    version: "v1.0.0"
  }
];

const state = {
  activeCourseId: "forensics-thirty-five",
  activeFilter: "all",
  activeDevice: "desktop"
};

const DESKTOP_PREVIEW_WIDTH = 1440;
const DESKTOP_PREVIEW_HEIGHT = 900;

const elements = {
  rail: document.querySelector("#courseRail"),
  desktopFrame: document.querySelector("#desktopFrame"),
  desktopViewportShell: document.querySelector("#desktopViewportShell"),
  tabletFrame: document.querySelector("#tabletFrame"),
  mobileFrame: document.querySelector("#mobileFrame"),
  desktopTitle: document.querySelector("#desktopTitle"),
  tabletTitle: document.querySelector("#tabletTitle"),
  phoneTitle: document.querySelector("#phoneTitle"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedDescription: document.querySelector("#selectedDescription"),
  selectedArea: document.querySelector("#selectedArea"),
  selectedStatus: document.querySelector("#selectedStatus"),
  selectedCategory: document.querySelector("#selectedCategory"),
  selectedHost: document.querySelector("#selectedHost"),
  selectedVersion: document.querySelector("#selectedVersion"),
  selectedIcon: document.querySelector("#selectedIcon"),
  openCourse: document.querySelector("#openCourse"),
  copyLink: document.querySelector("#copyLink"),
  previousCourse: document.querySelector("#previousCourse"),
  nextCourse: document.querySelector("#nextCourse"),
  fullScreenButton: document.querySelector("#fullScreenButton"),
  desktopDevice: document.querySelector("#desktopDevice"),
  devicesShowcase: document.querySelector("#devicesShowcase"),
  siteMenuToggle: document.querySelector("#siteMenuToggle"),
  siteMenu: document.querySelector("#siteMenu"),
  filterButtons: [...document.querySelectorAll(".filter-button")],
  deviceButtons: [...document.querySelectorAll(".device-button")]
};

let desktopPreviewResizeObserver;

function getFilteredCourses() {
  if (state.activeFilter === "all") {
    return courses;
  }
  return courses.filter((course) => course.category === state.activeFilter);
}

function getActiveCourse() {
  return courses.find((course) => course.id === state.activeCourseId) || courses[0];
}

function hostLabel(url) {
  return new URL(url).hostname.replace(".web.app", "");
}

function setFrameSource(frame, url) {
  if (frame.getAttribute("src") !== url) {
    frame.setAttribute("src", url);
  }
}

function updateDesktopPreviewScale() {
  if (!elements.desktopViewportShell) return;

  const rect = elements.desktopViewportShell.getBoundingClientRect();
  const rawScale = rect.width / DESKTOP_PREVIEW_WIDTH;
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? Math.min(rawScale, 1) : 1;
  const offsetX = Math.max(0, (rect.width - DESKTOP_PREVIEW_WIDTH * scale) / 2);
  const offsetY = 0;

  elements.desktopViewportShell.style.setProperty("--desktop-preview-scale", scale.toFixed(4));
  elements.desktopViewportShell.style.setProperty("--desktop-preview-offset-x", `${offsetX.toFixed(1)}px`);
  elements.desktopViewportShell.style.setProperty("--desktop-preview-offset-y", `${offsetY.toFixed(1)}px`);
}

function watchDesktopPreviewScale() {
  updateDesktopPreviewScale();
  window.addEventListener("resize", updateDesktopPreviewScale);

  if (typeof ResizeObserver === "function" && elements.desktopViewportShell) {
    desktopPreviewResizeObserver = new ResizeObserver(updateDesktopPreviewScale);
    desktopPreviewResizeObserver.observe(elements.desktopViewportShell);
  }

  window.requestAnimationFrame(updateDesktopPreviewScale);
}

function selectCourse(courseId) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return;

  state.activeCourseId = course.id;
  const host = hostLabel(course.url);

  setFrameSource(elements.desktopFrame, course.url);
  setFrameSource(elements.tabletFrame, course.url);
  setFrameSource(elements.mobileFrame, course.url);
  updateDesktopPreviewScale();

  elements.desktopTitle.textContent = course.title;
  elements.tabletTitle.textContent = course.title;
  elements.phoneTitle.textContent = course.title;
  elements.selectedTitle.textContent = course.title;
  elements.selectedDescription.textContent = course.description;
  elements.selectedArea.textContent = course.area;
  elements.selectedStatus.textContent = course.status;
  elements.selectedCategory.textContent = course.area;
  elements.selectedHost.textContent = host;
  elements.selectedVersion.textContent = course.version;
  elements.openCourse.href = course.url;

  renderRail();
  updateFilterClasses();
}

function setFilter(filter) {
  state.activeFilter = filter;
  const filtered = getFilteredCourses();
  if (!filtered.some((course) => course.id === state.activeCourseId)) {
    state.activeCourseId = filtered[0]?.id || courses[0].id;
  }
  selectCourse(state.activeCourseId);
}

function setDevice(device) {
  state.activeDevice = device;
  elements.devicesShowcase.dataset.deviceMode = device;
  elements.deviceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.device === device);
  });
  updateDesktopPreviewScale();
}

function renderRail() {
  const filteredCourses = getFilteredCourses();
  elements.rail.innerHTML = filteredCourses
    .map((course) => {
      const activeClass = course.id === state.activeCourseId ? " is-active" : "";
      return `
        <button class="course-selector${activeClass}" type="button" data-course-id="${course.id}" aria-label="Preview ${course.title}">
          <span class="course-button" aria-hidden="true"></span>
          <span class="course-title">${course.shortTitle}</span>
        </button>
      `;
    })
    .join("");
}

function updateFilterClasses() {
  elements.filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.activeFilter);
  });
}

function moveCourse(direction) {
  const filteredCourses = getFilteredCourses();
  const currentIndex = filteredCourses.findIndex((course) => course.id === state.activeCourseId);
  const nextIndex = (currentIndex + direction + filteredCourses.length) % filteredCourses.length;
  selectCourse(filteredCourses[nextIndex].id);
}

function setSiteMenuOpen(isOpen) {
  document.body.classList.toggle("site-menu-open", isOpen);
  elements.siteMenuToggle?.setAttribute("aria-expanded", String(isOpen));
  if (elements.siteMenu) {
    elements.siteMenu.hidden = !isOpen;
  }
}

function closeSiteMenuAfterChoice() {
  if (window.matchMedia("(max-width: 900px)").matches) {
    setSiteMenuOpen(false);
  }
}

function requestActiveDeviceFullscreen() {
  const target = state.activeDevice === "tablet"
    ? elements.tabletFrame.closest(".live-device")
    : state.activeDevice === "mobile"
      ? elements.mobileFrame.closest(".live-device")
      : elements.desktopDevice;
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  if (target?.requestFullscreen) {
    target.requestFullscreen();
  }
}

elements.rail.addEventListener("click", (event) => {
  const button = event.target.closest(".course-selector");
  if (!button) return;
  selectCourse(button.dataset.courseId);
});

elements.rail.addEventListener("dblclick", requestActiveDeviceFullscreen);
elements.desktopDevice.addEventListener("dblclick", requestActiveDeviceFullscreen);
elements.tabletFrame.closest(".live-device")?.addEventListener("dblclick", requestActiveDeviceFullscreen);
elements.mobileFrame.closest(".live-device")?.addEventListener("dblclick", requestActiveDeviceFullscreen);
elements.fullScreenButton.addEventListener("click", requestActiveDeviceFullscreen);
elements.previousCourse.addEventListener("click", () => moveCourse(-1));
elements.nextCourse.addEventListener("click", () => moveCourse(1));

elements.filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
    closeSiteMenuAfterChoice();
  });
});

elements.deviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDevice(button.dataset.device);
    closeSiteMenuAfterChoice();
  });
});

elements.siteMenuToggle?.addEventListener("click", () => {
  setSiteMenuOpen(!document.body.classList.contains("site-menu-open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSiteMenuOpen(false);
  }
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("site-menu-open")) {
    return;
  }
  if (event.target.closest(".topbar")) {
    return;
  }
  setSiteMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 900px)").matches) {
    setSiteMenuOpen(false);
  }
});

elements.copyLink.addEventListener("click", async () => {
  const course = getActiveCourse();
  try {
    await navigator.clipboard.writeText(course.url);
    elements.copyLink.textContent = "Copied";
    window.setTimeout(() => {
      elements.copyLink.textContent = "Copy preview link";
    }, 1600);
  } catch {
    elements.copyLink.textContent = course.url;
  }
});

renderRail();
watchDesktopPreviewScale();
setDevice(state.activeDevice);
selectCourse(state.activeCourseId);

