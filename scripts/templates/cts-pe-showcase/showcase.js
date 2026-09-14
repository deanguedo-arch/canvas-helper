(() => {
  "use strict";
  const courses = [
    {slug:"pe10-online-pilot",title:"Physical Education 10 — Online",family:"Physical Education",summary:"Plan, complete, document and reflect on meaningful physical activity.",status:"50-hour review build"},
    {slug:"marketing-10-20-online",title:"Marketing 10–20 — Online",family:"Management & Marketing",summary:"Develop a small business through customer service, merchandising, advertising and retail operations.",status:"9 CTS modules"},
    {slug:"marketing-30-online",title:"Marketing 30 — Online",family:"Management & Marketing",summary:"Make business decisions, practise sales and develop a retail launch proposal.",status:"7 CTS modules"},
    {slug:"legal-studies-30-online",title:"Legal Studies 30 — Online",family:"Legal Studies",summary:"Investigate fictional cases and develop evidence-based legal arguments.",status:"7 CTS modules"},
    {slug:"tourism-10-20-online",title:"Tourism 10–20 — Online",family:"Tourism",summary:"Respond to traveller needs and create original travel and event plans.",status:"12 CTS modules"},
    {slug:"tourism-30-online",title:"Tourism 30 — Online",family:"Tourism",summary:"Manage destination, accommodation and transportation scenarios.",status:"7 CTS modules"}
  ];
  const select=document.querySelector("#course-select"),frame=document.querySelector("#course"),status=document.querySelector("#status"),copy=document.querySelector("#copy");
  const slugPattern=/^[a-z0-9-]+$/;
  const savedKey="next-step:course-library:navigation:v1";
  const validSlug=value=>typeof value==="string"&&slugPattern.test(value)&&courses.some(course=>course.slug===value);
  const validRoute=value=>typeof value==="string"&&/^[a-zA-Z0-9_-]{0,180}$/.test(value)?value:"";
  let active="",detach=()=>{};
  const readLink=()=>{const match=/^([a-z0-9-]+)(?:\/([a-zA-Z0-9_-]{0,180}))?$/.exec(location.hash.slice(1));if(match&&validSlug(match[1]))return{slug:match[1],route:validRoute(match[2]||"")};try{const saved=JSON.parse(localStorage.getItem(savedKey)||"null");if(validSlug(saved?.slug))return{slug:saved.slug,route:validRoute(saved.route||"")};}catch{}return{slug:courses[0].slug,route:"overview"};};
  const remember=(slug,route)=>{try{localStorage.setItem(savedKey,JSON.stringify({schemaVersion:1,slug,route:validRoute(route)}));}catch{}};
  const sync=()=>{try{if(!active||!frame.contentWindow.location.pathname.endsWith(`/courses/${active}/index.html`))return;const route=validRoute(frame.contentWindow.location.hash.slice(1));remember(active,route);history.replaceState(null,"",`#${active}${route?`/${route}`:""}`);}catch{}};
  const openCourse=({slug,route})=>{if(!validSlug(slug))slug=courses[0].slug;route=validRoute(route)||"overview";select.value=slug;remember(slug,route);if(slug===active){try{if(frame.contentWindow.location.hash.slice(1)!==route)frame.contentWindow.location.hash=route;}catch{}return;}detach();active=slug;frame.title=`${courses.find(course=>course.slug===slug)?.title||"Course"} preview`;frame.src=`courses/${slug}/index.html#${route}`;};
  courses.forEach(course=>{
    const option=document.createElement("option");option.value=course.slug;option.textContent=course.title;select.append(option);
    // Course descriptions live in each canonical course workspace; the selector stays intentionally small.
  });
  frame.addEventListener("load",()=>{try{const child=frame.contentWindow;if(!child.location.pathname.endsWith(`/courses/${active}/index.html`))return;child.addEventListener("hashchange",sync);detach=()=>child.removeEventListener("hashchange",sync);sync();}catch{status.textContent="The course could not be opened. Reload this page to try again.";}});
  select.addEventListener("change",()=>{const slug=select.value;history.pushState(null,"",`#${slug}/overview`);openCourse({slug,route:"overview"});});
  window.addEventListener("hashchange",()=>openCourse(readLink()));window.addEventListener("popstate",()=>openCourse(readLink()));
  copy.addEventListener("click",async()=>{sync();try{await navigator.clipboard.writeText(location.href);status.textContent="Review link copied.";}catch{status.textContent="Copy the review link from your browser address bar.";}});
  openCourse(readLink());
})();
