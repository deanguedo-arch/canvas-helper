import { jsx, jsxs } from "https://esm.sh/react@19.1.1/jsx-runtime";
import React, { useState, useEffect } from "https://esm.sh/react@19.1.1";
import { Brain, Car, Scale, AlertTriangle, Activity, Info, Beer, Wine, Martini, User, Clock, Calculator, FileText, ClipboardList } from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";
const BAC_STAGES = [
  {
    id: 0,
    name: "Sober / Normal",
    range: [0, 29],
    symptoms: ["Normal behavior", "No visible signs of impairment"],
    brainParts: "None significantly affected",
    drivingImpact: "Normal driving ability. Reaction times and judgment are at baseline.",
    color: "bg-emerald-100 border-emerald-500 text-emerald-800",
    glowColor: "",
    highlight: []
  },
  {
    id: 1,
    name: "Euphoria",
    range: [30, 120],
    symptoms: ["Increased sociability and talkativeness", "Lowered inhibitions", "Mild impairment of judgment and control", "Overconfidence"],
    brainParts: "Frontal Lobe",
    drivingImpact: "Overconfidence can lead to risky driving behaviors (e.g., speeding). There is a declining ability to divide attention between steering, scanning, and tracking speed.",
    color: "bg-yellow-100 border-yellow-400 text-yellow-800",
    glowColor: "rgba(234, 179, 8, 0.6)",
    // yellow
    highlight: ["frontal"]
  },
  {
    id: 2,
    name: "Excitement",
    range: [90, 250],
    symptoms: ["Emotional instability", "Loss of critical judgment", "Slower reaction time", "Sensory impairment (vision/hearing)"],
    brainParts: "Frontal Lobe, Parietal Lobe, Occipital Lobe",
    drivingImpact: "Reduced coordination makes it difficult to steer smoothly. Impaired tracking makes it hard to focus on moving objects. Slower reaction time means taking longer to hit the brakes.",
    color: "bg-orange-100 border-orange-500 text-orange-800",
    glowColor: "rgba(249, 115, 22, 0.6)",
    // orange
    highlight: ["frontal", "parietal", "occipital"]
  },
  {
    id: 3,
    name: "Confusion",
    range: [180, 300],
    symptoms: ["Disorientation and mental confusion", "Dizziness", "Exaggerated emotions", "Disturbed vision and perception of color/motion"],
    brainParts: "Cerebellum, Frontal Lobe, Occipital Lobe",
    drivingImpact: "Major loss of balance and coordination. Highly impaired vehicle control\u2014the driver cannot maintain lane position. Visual disturbances cause misjudgment of distances.",
    color: "bg-red-100 border-red-500 text-red-800",
    glowColor: "rgba(239, 68, 68, 0.6)",
    // red
    highlight: ["cerebellum", "frontal", "parietal", "occipital"]
  },
  {
    id: 4,
    name: "Stupor",
    range: [250, 400],
    symptoms: ["Apathy and general inertia", "Approaching loss of motor functions", "Inability to stand or walk", "Vomiting and incontinence"],
    brainParts: "Diencephalon, Motor Cortex, Cerebellum",
    drivingImpact: "Completely unable to drive. Cannot operate vehicle controls safely or process the driving environment.",
    color: "bg-rose-200 border-rose-600 text-rose-900",
    glowColor: "rgba(225, 29, 72, 0.7)",
    // rose
    highlight: ["diencephalon", "cerebellum", "frontal", "parietal", "occipital"]
  },
  {
    id: 5,
    name: "Coma",
    range: [350, 500],
    symptoms: ["Complete unconsciousness", "Depressed reflexes", "Subnormal body temperature", "Impairment of circulation and respiration", "Possible death"],
    brainParts: "Medulla Oblongata (Brain Stem) & Entire Brain",
    drivingImpact: "Unconscious. Fatalities highly likely due to alcohol poisoning or asphyxiation.",
    color: "bg-purple-200 border-purple-700 text-purple-900",
    glowColor: "rgba(126, 34, 206, 0.8)",
    // purple
    highlight: ["stem", "diencephalon", "cerebellum", "frontal", "parietal", "occipital"]
  }
];
function ImpairedDrivingApp() {
  const [bac, setBac] = useState(0);
  const [activeStage, setActiveStage] = useState(BAC_STAGES[0]);
  const [activeTab, setActiveTab] = useState("brain");
  const [weight, setWeight] = useState(160);
  const [sex, setSex] = useState("M");
  const [hours, setHours] = useState(1);
  const [drinks, setDrinks] = useState({ beer: 0, wine: 0, liquor: 0 });
  useEffect(() => {
    if (activeTab === "calc") {
      const totalDrinks = drinks.beer + drinks.wine + drinks.liquor;
      if (totalDrinks === 0) {
        setBac(0);
        return;
      }
      const alcoholGrams = totalDrinks * 14;
      const weightGrams = weight * 453.592;
      const r = sex === "M" ? 0.68 : 0.55;
      let rawBacPct = alcoholGrams / (weightGrams * r) * 100;
      let finalBacPct = rawBacPct - 0.015 * hours;
      if (finalBacPct < 0) finalBacPct = 0;
      const finalBacMg = Math.min(500, Math.round(finalBacPct * 1e3));
      setBac(finalBacMg);
    }
  }, [drinks, weight, sex, hours, activeTab]);
  useEffect(() => {
    let currentStage = BAC_STAGES[0];
    for (let i = BAC_STAGES.length - 1; i >= 0; i--) {
      if (bac >= BAC_STAGES[i].range[0]) {
        currentStage = BAC_STAGES[i];
        break;
      }
    }
    setActiveStage(currentStage);
  }, [bac]);
  const isHighlighted = (part) => activeStage.highlight.includes(part);
  const bacPercentage = (bac / 1e3).toFixed(3);
  const isOverLimit = bac >= 80;
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const findPromptForField = (field, indexInView) => {
    const row = field.closest("tr");
    if (row) {
      const leadCell = row.querySelector("td, th");
      const leadText = leadCell ? leadCell.innerText.trim() : "";
      if (leadText) return leadText;
    }
    const section = field.closest("section");
    if (section) {
      const sectionPrompt = section.querySelector("h3");
      if (sectionPrompt && sectionPrompt.innerText.trim()) {
        return sectionPrompt.innerText.trim();
      }
    }
    const wrapper = field.closest("div");
    if (wrapper) {
      const label = wrapper.querySelector(":scope > label");
      if (label && label.innerText.trim()) return label.innerText.trim();
    }
    if (field.placeholder && field.placeholder.trim()) return field.placeholder.trim();
    return `Response ${indexInView + 1}`;
  };
  const exportAssignmentReport = () => {
    const assignmentRoot = document.querySelector('[data-assignment-root="module5"]');
    if (!assignmentRoot) return;
    const fields = Array.from(assignmentRoot.querySelectorAll("textarea, select, input[type='text']"));
    const items = [];
    fields.forEach((field, idx) => {
      const rawValue = field.value ?? "";
      const value = rawValue.trim();
      if (!value || value === "-" || value === "Select...") return;
      items.push({
        prompt: findPromptForField(field, idx),
        value
      });
    });
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString();
    const responses = items.length ? items.map(
      (item, idx) => `
              <div class="entry">
                <div class="entry-index">${idx + 1}.</div>
                <div class="entry-body">
                  <div class="entry-prompt">${escapeHtml(item.prompt)}</div>
                  <div class="entry-value">${escapeHtml(item.value).replace(/\n/g, "<br>")}</div>
                </div>
              </div>
            `
    ).join("") : `<p>No responses captured yet. Complete at least one field and try again.</p>`;
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Impaired Driving Assignment Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #0f172a; background: #fff; line-height: 1.45; }
          .report-header { border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px; }
          .report-header h1 { margin: 0 0 6px 0; font-size: 22px; letter-spacing: 0.03em; text-transform: uppercase; }
          .report-meta { margin: 0; font-size: 12px; color: #334155; }
          .entry { display: flex; gap: 8px; margin-bottom: 10px; page-break-inside: avoid; }
          .entry-index { width: 24px; font-weight: 700; }
          .entry-body { flex: 1; }
          .entry-prompt { font-weight: 700; margin-bottom: 3px; }
          .entry-value { white-space: normal; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>
        <header class="report-header">
          <h1>Impaired Driving Assignment Report</h1>
          <p class="report-meta">Generated: ${escapeHtml(generatedAt)}</p>
        </header>
        ${responses}
      </body>
      </html>
    `;
    let printFrame = document.getElementById("module5-assignment-print-frame");
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "module5-assignment-print-frame";
      printFrame.setAttribute("aria-hidden", "true");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      document.body.appendChild(printFrame);
    }
    printFrame.onload = function() {
      setTimeout(() => {
        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        }
      }, 120);
    };
    printFrame.srcdoc = reportHtml;
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Activity, { className: "text-blue-600 w-8 h-8" }),
          "BAC Impairment Simulator"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2 text-lg", children: "Explore the physiological and behavioral changes caused by alcohol consumption." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-colors duration-500 ${isOverLimit ? "bg-red-50 border-red-500 text-red-700" : "bg-green-50 border-green-500 text-green-700"}`, children: [
        /* @__PURE__ */ jsx(Scale, { className: `w-8 h-8 ${isOverLimit ? "text-red-600" : "text-green-600"}` }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wider opacity-80", children: "Canadian Law (Criminal Code)" }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-lg", children: isOverLimit ? "Guilty of Impaired Driving" : "Below Criminal Limit" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Legal Limit: 80 mg/100mL (0.08%)" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-200 p-1 rounded-xl mb-6 w-fit mx-auto md:mx-0 overflow-x-auto", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("brain"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "brain" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Brain Map & Slider" }),
            /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Brain Map" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("calc"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "calc" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx(Calculator, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Drink Calculator" }),
            /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Calculator" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("assignment"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "assignment" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Assignment Worksheet" }),
            /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Assignment" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-1 lg:grid-cols-12 gap-6 ${activeTab === "assignment" ? "hidden" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 space-y-6", children: activeTab === "brain" ? /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in zoom-in-95 duration-300 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-6 flex items-center gap-2", children: "Blood Alcohol Concentration (BAC)" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-5xl font-black tracking-tighter text-blue-600", children: [
                bac,
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-xl font-medium text-slate-500", children: "mg/100mL" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-slate-400", children: [
                bacPercentage,
                "% BAC"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: "0",
                max: "500",
                value: bac,
                onChange: (e) => setBac(Number(e.target.value)),
                className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold text-slate-400", children: [
              /* @__PURE__ */ jsx("span", { children: "0 (Sober)" }),
              /* @__PURE__ */ jsx("span", { children: "250 (Danger)" }),
              /* @__PURE__ */ jsx("span", { children: "500 (Fatal)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col items-center", children: [
          /* @__PURE__ */ jsxs("h3", { className: "w-full text-lg font-bold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-slate-500" }),
            "Affected Brain Regions (Anatomical View)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-md aspect-square bg-slate-50 rounded-xl p-2 overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 500 450", className: "w-full h-full drop-shadow-lg filter transition-all duration-500", children: [
            /* @__PURE__ */ jsxs("defs", { children: [
              /* @__PURE__ */ jsx("pattern", { id: "cerebellum-stripes", width: "12", height: "8", patternUnits: "userSpaceOnUse", patternTransform: "rotate(-10)", children: /* @__PURE__ */ jsx("path", { d: "M 0,4 Q 6,0 12,4", fill: "none", stroke: "#64748b", strokeWidth: "1.5", opacity: "0.4" }) }),
              /* @__PURE__ */ jsxs("radialGradient", { id: "diencephalon-glow", cx: "50%", cy: "50%", r: "50%", children: [
                /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: activeStage.glowColor, stopOpacity: "1" }),
                /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: activeStage.glowColor, stopOpacity: "0" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: "transition-all duration-700 ease-out", style: { transform: isHighlighted("stem") ? "scale(1.03)" : "scale(1)", transformOrigin: "260px 320px" }, children: [
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M 240,260 C 235,300 230,350 240,400 L 280,390 C 285,350 285,300 280,270 C 260,265 250,265 240,260 Z",
                  fill: isHighlighted("stem") ? activeStage.glowColor : "#e2e8f0",
                  stroke: isHighlighted("stem") ? "#334155" : "#94a3b8",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ jsx("path", { d: "M 250,270 C 250,320 245,360 250,395", stroke: "#cbd5e1", strokeWidth: "2", fill: "none" }),
              /* @__PURE__ */ jsx("path", { d: "M 270,270 C 270,320 275,360 270,390", stroke: "#cbd5e1", strokeWidth: "2", fill: "none" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: "transition-all duration-700 ease-out", style: { transform: isHighlighted("cerebellum") ? "scale(1.03)" : "scale(1)", transformOrigin: "340px 300px" }, children: [
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M 280,270 C 300,320 350,360 400,340 C 440,320 440,260 380,240 C 360,250 320,260 280,270 Z",
                  fill: isHighlighted("cerebellum") ? activeStage.glowColor : "#d3dce6",
                  stroke: isHighlighted("cerebellum") ? "#334155" : "#94a3b8",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M 280,270 C 300,320 350,360 400,340 C 440,320 440,260 380,240 C 360,250 320,260 280,270 Z",
                  fill: "url(#cerebellum-stripes)"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 140,180 C 130,220 160,250 190,260 C 230,275 280,285 330,265 C 360,255 380,230 380,210 C 340,210 300,200 250,170 C 210,150 170,160 140,180 Z",
                fill: isHighlighted("temporal") || isHighlighted("diencephalon") ? activeStage.glowColor : "#f1f5f9",
                stroke: isHighlighted("temporal") || isHighlighted("diencephalon") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("temporal") || isHighlighted("diencephalon") ? "scale(1.02)" : "scale(1)", transformOrigin: "260px 220px" }
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 380,210 C 420,220 460,200 470,160 C 480,120 450,80 410,70 C 410,110 390,160 380,210 Z",
                fill: isHighlighted("occipital") ? activeStage.glowColor : "#f8fafc",
                stroke: isHighlighted("occipital") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("occipital") ? "scale(1.02)" : "scale(1)", transformOrigin: "420px 150px" }
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 260,20 C 330,20 380,40 410,70 C 380,110 370,160 380,210 C 340,210 300,160 250,170 C 240,110 250,60 260,20 Z",
                fill: isHighlighted("parietal") ? activeStage.glowColor : "#f8fafc",
                stroke: isHighlighted("parietal") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("parietal") ? "scale(1.02)" : "scale(1)", transformOrigin: "330px 110px" }
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 260,20 C 150,20 50,60 40,140 C 35,170 80,190 140,180 C 170,160 210,150 250,170 C 240,110 250,60 260,20 Z",
                fill: isHighlighted("frontal") ? activeStage.glowColor : "#ffffff",
                stroke: isHighlighted("frontal") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("frontal") ? "scale(1.02)" : "scale(1)", transformOrigin: "150px 100px" }
              }
            ),
            /* @__PURE__ */ jsx(
              "ellipse",
              {
                cx: "250",
                cy: "180",
                rx: "45",
                ry: "30",
                fill: "url(#diencephalon-glow)",
                opacity: isHighlighted("diencephalon") ? 1 : 0,
                className: "transition-opacity duration-700 pointer-events-none"
              }
            ),
            /* @__PURE__ */ jsxs("g", { opacity: "0.35", fill: "none", stroke: "#334155", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "pointer-events-none", children: [
              /* @__PURE__ */ jsx("path", { d: "M 75,120 Q 100,105 110,140 T 130,160" }),
              /* @__PURE__ */ jsx("path", { d: "M 115,75 Q 150,60 145,110 T 175,145" }),
              /* @__PURE__ */ jsx("path", { d: "M 175,45 Q 180,80 200,110 T 235,145" }),
              /* @__PURE__ */ jsx("path", { d: "M 220,35 Q 210,80 245,120" }),
              /* @__PURE__ */ jsx("path", { d: "M 60,145 Q 80,165 100,160" }),
              /* @__PURE__ */ jsx("path", { d: "M 285,35 Q 280,80 275,150" }),
              /* @__PURE__ */ jsx("path", { d: "M 335,45 Q 310,100 315,160" }),
              /* @__PURE__ */ jsx("path", { d: "M 375,65 Q 350,110 345,175" }),
              /* @__PURE__ */ jsx("path", { d: "M 290,100 Q 320,110 340,90" }),
              /* @__PURE__ */ jsx("path", { d: "M 430,95 Q 400,130 405,175" }),
              /* @__PURE__ */ jsx("path", { d: "M 455,135 Q 430,160 425,200" }),
              /* @__PURE__ */ jsx("path", { d: "M 410,140 Q 430,160 450,160" }),
              /* @__PURE__ */ jsx("path", { d: "M 160,205 Q 200,185 240,205 T 320,225" }),
              /* @__PURE__ */ jsx("path", { d: "M 180,235 Q 220,215 260,235 T 340,245" }),
              /* @__PURE__ */ jsx("path", { d: "M 220,195 Q 240,220 260,210" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("frontal") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "140", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Frontal Lobe" }),
              /* @__PURE__ */ jsx("text", { x: "140", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Frontal Lobe" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("parietal") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "325", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Parietal Lobe" }),
              /* @__PURE__ */ jsx("text", { x: "325", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Parietal Lobe" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("occipital") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "430", y: "150", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Occipital" }),
              /* @__PURE__ */ jsx("text", { x: "430", y: "150", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "#0f172a", children: "Occipital" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("temporal") || isHighlighted("diencephalon") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "240", y: "235", textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Temporal Lobe" }),
              /* @__PURE__ */ jsx("text", { x: "240", y: "235", textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: "#0f172a", children: "Temporal Lobe" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("cerebellum") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "345", y: "315", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Cerebellum" }),
              /* @__PURE__ */ jsx("text", { x: "345", y: "315", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Cerebellum" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("stem") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ jsx("text", { x: "210", y: "340", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Brain Stem" }),
              /* @__PURE__ */ jsx("text", { x: "210", y: "340", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "#0f172a", children: "Brain Stem" })
            ] })
          ] }) })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in zoom-in-95 duration-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
            /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-slate-500" }),
            " Person Profile"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setSex("M"), className: `flex-1 py-3 rounded-xl font-bold border-2 transition-all ${sex === "M" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`, children: "Male" }),
              /* @__PURE__ */ jsx("button", { onClick: () => setSex("F"), className: `flex-1 py-3 rounded-xl font-bold border-2 transition-all ${sex === "F" ? "border-pink-500 bg-pink-50 text-pink-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`, children: "Female" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "text-sm font-bold text-slate-600 flex justify-between mb-2", children: [
                "Body Weight: ",
                /* @__PURE__ */ jsxs("span", { className: "text-blue-600", children: [
                  weight,
                  " lbs"
                ] })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "range", min: "100", max: "300", step: "5", value: weight, onChange: (e) => setWeight(Number(e.target.value)), className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
            /* @__PURE__ */ jsx(Martini, { className: "w-5 h-5 text-slate-500" }),
            " Drinks Consumed"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-3 bg-amber-50 border border-amber-200 rounded-xl", children: [
              /* @__PURE__ */ jsx(Beer, { className: "w-8 h-8 text-amber-600 mb-2" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-xl text-amber-900", children: drinks.beer }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-3", children: "Beer (12oz)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, beer: Math.max(0, d.beer - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-amber-100 text-amber-600 font-black hover:bg-amber-100 transition-colors", children: "-" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, beer: d.beer + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-amber-100 text-amber-600 font-black hover:bg-amber-100 transition-colors", children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-3 bg-rose-50 border border-rose-200 rounded-xl", children: [
              /* @__PURE__ */ jsx(Wine, { className: "w-8 h-8 text-rose-600 mb-2" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-xl text-rose-900", children: drinks.wine }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-3", children: "Wine (5oz)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, wine: Math.max(0, d.wine - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-rose-100 text-rose-600 font-black hover:bg-rose-100 transition-colors", children: "-" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, wine: d.wine + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-rose-100 text-rose-600 font-black hover:bg-rose-100 transition-colors", children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-3 bg-indigo-50 border border-indigo-200 rounded-xl", children: [
              /* @__PURE__ */ jsx(Martini, { className: "w-8 h-8 text-indigo-600 mb-2" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-xl text-indigo-900", children: drinks.liquor }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-3", children: "Shot (1.5oz)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, liquor: Math.max(0, d.liquor - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-indigo-100 text-indigo-600 font-black hover:bg-indigo-100 transition-colors", children: "-" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setDrinks((d) => ({ ...d, liquor: d.liquor + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-indigo-100 text-indigo-600 font-black hover:bg-indigo-100 transition-colors", children: "+" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-slate-100 pt-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-md font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-slate-500" }),
              " Time Elapsed"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-bold text-slate-600 flex justify-between mb-2", children: [
              "Hours since first drink: ",
              /* @__PURE__ */ jsxs("span", { className: "text-blue-600", children: [
                hours,
                " hrs"
              ] })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "range", min: "0", max: "8", step: "0.5", value: hours, onChange: (e) => setHours(Number(e.target.value)), className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-blue-100 uppercase tracking-wider text-xs mb-1", children: "Estimated BAC Result" }),
          /* @__PURE__ */ jsxs("div", { className: "text-6xl font-black tracking-tighter drop-shadow-md", children: [
            bac,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-medium text-blue-200", children: "mg/100mL" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-blue-100 text-sm max-w-xs leading-tight", children: "Calculated using the standard Widmark Formula based on weight, sex, and time elapsed." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-sm p-6 border-2 transition-all duration-500 ${activeStage.color}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black uppercase tracking-tight", children: [
              activeStage.name,
              " Stage"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold bg-white/50 px-3 py-1 rounded-full", children: [
              activeStage.range[0],
              " - ",
              activeStage.range[1],
              " mg/100mL"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "opacity-90 font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }),
            activeStage.range[0] > 0 ? "Impairment is active and worsening." : "No alcohol detected."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col h-full", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ jsx(Activity, { className: "w-5 h-5 text-rose-500" }),
              "Physiological & Behavioral Symptoms"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-3 flex-grow", children: activeStage.symptoms.map((symptom, idx) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100", children: [
              /* @__PURE__ */ jsx("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "leading-snug", children: symptom })
            ] }, idx)) }),
            /* @__PURE__ */ jsx("div", { className: "mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200", children: /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-slate-700 flex flex-col", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-slate-500 mb-1", children: "Parts of Brain Affected" }),
              activeStage.brainParts
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col h-full", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ jsx(Car, { className: "w-5 h-5 text-blue-500" }),
              "Impact on Driving Ability"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-blue-50 text-blue-900 p-5 rounded-xl border border-blue-100 flex-grow text-lg leading-relaxed shadow-inner", children: activeStage.drivingImpact }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800", children: [
              /* @__PURE__ */ jsx(Info, { className: "w-6 h-6 flex-shrink-0 text-amber-600" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsx("strong", { children: "Assignment Helper:" }),
                " Need to identify two symptoms and explain how they impair driving? Look at the lists above."
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `space-y-8 animate-in fade-in zoom-in-95 duration-300 ${activeTab === "assignment" ? "block" : "hidden"}`, "data-assignment-root": "module5", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(ClipboardList, { className: "text-blue-400 w-8 h-8" }),
            "Impaired Driving Assignment"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-300 mt-2 text-lg", children: "Use the simulator to research and complete this worksheet." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: exportAssignmentReport,
              className: "rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20",
              children: "Print / Save PDF"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "bg-blue-600/30 border border-blue-400/50 text-blue-100 px-5 py-2 rounded-xl text-lg font-bold shadow-inner", children: "27 Marks Total" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 space-y-12", children: [
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-b-2 border-slate-100 pb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "1. Complete the chart summarizing physiological and behavioral changes." }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap", children: "(10 marks)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-200 shadow-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-100 text-slate-700", children: [
              /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 font-bold w-1/4", children: "BAC (mg/100mL)" }),
              /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 font-bold w-2/5", children: "Symptoms" }),
              /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 font-bold w-1/3", children: "Part(s) of Brain Affected" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-slate-100", children: [
              { level: "Euphoria", range: "30-120" },
              { level: "Excitement", range: "90-250" },
              { level: "Confusion", range: "180-300" },
              { level: "Stupor", range: "250-400" },
              { level: "Coma", range: "350-500" }
            ].map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
              /* @__PURE__ */ jsxs("td", { className: "p-4 font-bold text-slate-700", children: [
                row.level,
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-slate-400 font-medium", children: [
                  "(",
                  row.range,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "p-2", children: /* @__PURE__ */ jsx("textarea", { className: "w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm", placeholder: "Type symptoms here..." }) }),
              /* @__PURE__ */ jsx("td", { className: "p-2", children: /* @__PURE__ */ jsx("textarea", { className: "w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm", placeholder: "Type brain parts here..." }) })
            ] }, idx)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "2. Identify two specific symptoms caused by alcohol consumption that impair a person\u2019s ability to drive. Explain, in detail, how these two symptoms impair a person\u2019s ability to drive safely." }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(4 marks)" })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
              placeholder: "Example: 1) Slower reaction time means... \n2) Disturbed vision means..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-b-2 border-slate-100 pb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "3. State the BAC that defines a person as intoxicated under the law and guilty of impaired driving in Canada." }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap", children: "(1 mark)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "w-full md:w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-medium",
              placeholder: "Enter BAC level here..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "4. Given the information about the symptoms of alcohol consumption at various BACs, do you feel that the legal limit for impaired driving is too low, too high or just right? Justify your answer." }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(2 marks)" })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
              placeholder: "I feel the limit is [too low / too high / just right] because based on the physiological symptoms..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "5. Research 2 cases of impaired driving crimes in Canada." }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2 font-medium", children: "For each case, answer the following questions:" }),
              /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-slate-600 mt-2 space-y-1 ml-2", children: [
                /* @__PURE__ */ jsx("li", { children: "Describe the case in detail. What happened? Who was involved?" }),
                /* @__PURE__ */ jsx("li", { children: "What were the legal consequences for the driver?" }),
                /* @__PURE__ */ jsx("li", { children: "What were the consequences for the victim(s) and/or their friends and family?" }),
                /* @__PURE__ */ jsx("li", { children: "Do you feel that the punishment was fair? Explain why or why not." }),
                /* @__PURE__ */ jsx("li", { children: "Provide sources for your information." })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(10 marks)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4", children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-lg font-black text-blue-900 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-blue-600" }),
                "Case Study 1"
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  className: "w-full min-h-[300px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
                  placeholder: "Type your response for Case 1 here... Remember to include what happened, consequences, your opinion on fairness, and your sources."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4", children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-lg font-black text-indigo-900 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-indigo-600" }),
                "Case Study 2"
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  className: "w-full min-h-[300px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y leading-relaxed text-slate-700",
                  placeholder: "Type your response for Case 2 here... Remember to include what happened, consequences, your opinion on fairness, and your sources."
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  ImpairedDrivingApp as default
};
