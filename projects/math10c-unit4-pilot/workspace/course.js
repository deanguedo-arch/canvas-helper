(function () {
  "use strict";

  var defaultRoute = "u4-overview";
  var pages = Array.prototype.slice.call(document.querySelectorAll(".course-page[id]"));
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-route]"));
  var body = document.body;
  var menuButton = document.getElementById("menu-button");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var scrim = document.getElementById("scrim");
  var referencePanel = document.getElementById("reference-panel");
  var referenceOpen = document.getElementById("reference-open");
  var referenceClose = document.getElementById("reference-close");
  var status = document.getElementById("build-status");

  function knownRoute(route) {
    return pages.some(function (page) { return page.id === route; });
  }

  function currentRoute() {
    var route = window.location.hash.replace(/^#/, "");
    return knownRoute(route) ? route : defaultRoute;
  }

  function showRoute() {
    var route = currentRoute();
    pages.forEach(function (page) { page.hidden = page.id !== route; });
    links.forEach(function (link) {
      if (link.getAttribute("href") === "#" + route) {
        link.setAttribute("aria-current", "page");
        var group = link.closest("details");
        if (group) group.open = true;
      } else {
        link.removeAttribute("aria-current");
      }
    });
    body.classList.remove("nav-open");
    if (status && !window.Chapter4MasteryReview) status.textContent = "Course work is loading";
    var heading = document.querySelector("#" + route + " h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent("chapter4:route-shown",{detail:{route:route}}));
    if(window.Chapter4MasteryReview&&window.Chapter4MasteryReview.registerExposure&&route==="u4-42"){
      window.Chapter4MasteryReview.registerExposure("radical|square|entire|3|5|45","lesson:u4-42:mixed-entire-example","lesson example","C4-42c");
    }
  }

  function closeNavigation() { body.classList.remove("nav-open"); }
  function closeReference() {
    if (referencePanel) referencePanel.hidden = true;
    if (referenceOpen) referenceOpen.setAttribute("aria-expanded", "false");
  }

  window.addEventListener("hashchange", showRoute);
  if (menuButton) menuButton.addEventListener("click", function () { body.classList.toggle("nav-open"); });
  if (scrim) scrim.addEventListener("click", closeNavigation);
  if (sidebarToggle) sidebarToggle.addEventListener("click", function () { body.classList.toggle("sidebar-collapsed"); });
  if (referenceOpen) referenceOpen.addEventListener("click", function () {
    var route=currentRoute(), taskId=route.indexOf("u4-4")===0?route.slice(3):"";
    if(window.Chapter4MasteryReview&&taskId)window.Chapter4MasteryReview.recordSupport(taskId,"reference sheet");
    referencePanel.hidden = false;
    referenceOpen.setAttribute("aria-expanded", "true");
    referenceClose.focus();
  });
  if (referenceClose) referenceClose.addEventListener("click", function () {
    closeReference();
    referenceOpen.focus();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeNavigation();
    if (referencePanel && !referencePanel.hidden) closeReference();
  });
  document.addEventListener("click",function(event){
    var link=event.target.closest&&event.target.closest("a[href]");if(!link)return;
    var href=link.getAttribute("href")||"", supportRoutes=["#u4-reference","#u4-radical-lab","#u4-exponent-lab","#u4-support-library"];
    if(supportRoutes.indexOf(href)<0)return;
    var route=currentRoute(), taskId=route.indexOf("u4-4")===0?route.slice(3):"";
    if(window.Chapter4MasteryReview&&taskId)window.Chapter4MasteryReview.recordSupport(taskId,link.textContent.trim().toLowerCase());
  });

  if (!window.location.hash || !knownRoute(window.location.hash.slice(1))) {
    history.replaceState(null, "", "#" + defaultRoute);
  }
  showRoute();
}());
