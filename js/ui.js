/* Shared drawing helpers, plan generator, device and app mock-ups.
   Taken from the presentation (v5-prezentacja/ui.js) so the site shows the same apps. */
const NS = "http://www.w3.org/2000/svg";
const svgEl = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const svgText = (p, x, y, s, a = {}) => { const t = svgEl("text", Object.assign({ x, y }, a), p); t.textContent = s; return t; };
const div = (cls, html = "", p) => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; if (p) p.appendChild(d); return d; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);                      // ease-out cubic
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease-in-out cubic
const lerp = (a, b, t) => a + (b - a) * t;
// thousands always grouped ("5 700"), pl-PL alone leaves 4-digit numbers ungrouped
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const C = { ink: "#121417", ink2: "#5B6068", ink3: "#9A9FA6", hair: "#CDD1D4", bg: "#EEF0EF", red: "#E0533F", green: "#2E9150", yel: "#F2C230", blue: "#2563EB",
  mRed: "rgba(255,96,96,.9)", mGreen: "rgba(80,200,120,.95)", mSel: "#FFE066" };

/* ---------- icons (Material-style paths, 24x24) ---------- */
const ICON = {
  qr: "M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 16h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm2-2h2v2h-2zm0-2h2v2h-2zm-4 0h2v2h-2zm4 4h2v2h-2z",
  chev: "M9.3 6.7 10.7 5.3 17.4 12l-6.7 6.7-1.4-1.4 5.3-5.3z",
  map: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM10 5.47l4 1.4v11.66l-4-1.4V5.47zm-5 .99 3-1.01v11.7l-3 1.16V6.46zm14 11.08-3 1.01V6.86l3-1.16v11.84z",
  search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  kb: "M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z",
  fit: "M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2h2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2h-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3v-2zM18 8H6v8h12V8z",
};
const icon = (name, size = 24, color = "currentColor") => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex:none;display:block"><path d="${ICON[name]}" fill="${color}"/></svg>`;

/* ---------- plan geometry (one floor of building B2, 1200 x 760 units) ---------- */
function planData(seed = 11, ratio = .45) {
  const R = rng(seed);
  const rooms = [[60, 60, 360, 320], [420, 60, 360, 320], [780, 60, 360, 320], [60, 380, 240, 320], [300, 380, 480, 320], [780, 380, 360, 320]];
  const walls = [[60, 60, 1140, 60], [1140, 60, 1140, 700], [1140, 700, 60, 700], [60, 700, 60, 60], [420, 60, 420, 380], [780, 60, 780, 700], [60, 380, 1140, 380], [300, 380, 300, 700]];
  const els = []; let idx = 601;
  walls.forEach(([x1, y1, x2, y2], wi) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 95));
    for (let i = 0; i < n; i++) { const t = (i + .5) / n; els.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, code: `${wi < 4 ? "W" : "WS"}_01_${idx++}S`, inst: R() < ratio }); }
  });
  rooms.forEach(([x, y, w, h]) => { const c = Math.round(w / 120); for (let i = 0; i < c; i++) els.push({ x: x + w * (i + .5) / c, y: y + h / 2, code: `SB_01_${idx++}`, inst: R() < ratio, slab: true }); });
  // the element used in every scan scene
  const T = els[16]; T.code = "W_01_627S"; T.inst = false;
  const T2 = els[22]; T2.code = "W_01_628S"; T2.inst = false;
  return { rooms, walls, els, T, T2 };
}

/* Draws a plan into an <svg viewBox="0 0 1200 760">.
   theme "dark" = how the apps render the CAD drawing (light lines on black),
   theme "paper" = thin ink drawing for diagrams. */
function drawPlan(svg, d, { theme = "dark", markerR = 9, markers = true, codes = false, cadNoise = false } = {}) {
  const dark = theme === "dark";
  const line = dark ? "#D7D7D7" : C.ink, faint = dark ? "#4A4A4A" : "#C3C7CA", txt = dark ? "#8A8A8A" : C.ink3;
  const g = svgEl("g", {}, svg);
  if (dark) svgEl("rect", { x: -2000, y: -2000, width: 5200, height: 4760, fill: "#111" }, g);
  const ax = svgEl("g", { stroke: faint, "stroke-width": 1, "stroke-dasharray": "16 5 2 5" }, g);
  [240, 420, 600, 780, 960].forEach(x => svgEl("line", { x1: x, y1: 24, x2: x, y2: 736 }, ax));
  [220, 380, 540].forEach(y => svgEl("line", { x1: 24, y1: y, x2: 1176, y2: y }, ax));
  const dim = svgEl("g", { stroke: line, "stroke-width": 1 }, g);
  svgEl("line", { x1: 60, y1: 34, x2: 1140, y2: 34 }, dim);
  [60, 420, 780, 1140].forEach(x => svgEl("line", { x1: x - 5, y1: 39, x2: x + 5, y2: 29 }, dim));
  [240, 600, 960].forEach(x => svgText(g, x, 27, "3600", { "text-anchor": "middle", "font-size": 13, fill: txt }));
  // walls as double CAD lines
  const wg = svgEl("g", { stroke: line, "stroke-width": 1.6, fill: "none" }, g);
  d.walls.forEach(([x1, y1, x2, y2], i) => {
    const o = i < 4 ? 9 : 6, h = y1 === y2;
    svgEl("line", { x1: x1 - (h ? 0 : o), y1: y1 - (h ? o : 0), x2: x2 - (h ? 0 : o), y2: y2 - (h ? o : 0) }, wg);
    svgEl("line", { x1: x1 + (h ? 0 : o), y1: y1 + (h ? o : 0), x2: x2 + (h ? 0 : o), y2: y2 + (h ? o : 0) }, wg);
  });
  const dr = svgEl("g", { stroke: line, "stroke-width": 1, fill: "none" }, g);
  [[420, 200], [780, 520], [300, 560]].forEach(([x, y]) => { svgEl("rect", { x: x - 10, y: y - 24, width: 20, height: 48, fill: dark ? "#111" : C.bg, stroke: "none" }, g); svgEl("path", { d: `M${x} ${y - 24} a48 48 0 0 1 44 38`, "stroke-dasharray": "3 3" }, dr); });
  const st = svgEl("g", { stroke: line, "stroke-width": 1 }, g);
  for (let i = 0; i <= 8; i++) svgEl("line", { x1: 330 + i * 18, y1: 400, x2: 330 + i * 18, y2: 470 }, st);
  svgEl("rect", { x: 330, y: 400, width: 144, height: 70, fill: "none", stroke: line, "stroke-width": 1 }, g);
  d.rooms.forEach(([x, y, w, h], i) => svgText(g, x + 18, y + h - 18, `M${i + 1}`, { "font-size": 13, fill: txt }));
  d.els.filter(e => e.slab).forEach(e => svgEl("rect", { x: e.x - 36, y: e.y - 13, width: 72, height: 26, fill: "none", stroke: faint, "stroke-dasharray": "4 3" }, g));
  let noise = null;
  if (cadNoise) {
    noise = svgEl("g", {}, svg);
    d.els.forEach(e => { e.tag = svgText(noise, e.x + 12, e.y - 11, "3D" + e.code, { "font-size": 11, fill: txt }); });
  }
  const mg = svgEl("g", {}, svg);
  if (markers) d.els.forEach(e => {
    const m = svgEl("g", { transform: `translate(${e.x.toFixed(1)},${e.y.toFixed(1)})` }, mg);
    e.dot = svgEl("circle", { r: markerR, fill: e.inst ? C.mGreen : C.mRed, stroke: "#fff", "stroke-width": markerR * .28 }, m);
    if (codes) e.lab = svgText(m, 0, -markerR - 6, e.code, { "text-anchor": "middle", "font-size": 12, fill: dark ? "#BBB" : C.ink2 });
    e.m = m; e.r0 = markerR;
  });
  return { g, mg, noise };
}
function markState(e, s, scale = 1) {
  if (!e.dot) return;
  const r = e.r0 * scale;
  if (s === "sel") { e.dot.setAttribute("fill", e.inst ? C.mGreen : C.mRed); e.dot.setAttribute("stroke", C.mSel); e.dot.setAttribute("r", r * 1.3); e.dot.setAttribute("stroke-width", r * .38); }
  else { e.dot.setAttribute("fill", s === "inst" ? C.mGreen : C.mRed); e.dot.setAttribute("stroke", "#fff"); e.dot.setAttribute("r", r); e.dot.setAttribute("stroke-width", r * .28); }
}

/* ---------- devices ---------- */
const KEYBOARD = (() => {
  let k = `<svg viewBox="0 0 820 480">`; const x0 = 70, w = 680, kh = 34, gap = 6;
  const rows = [14, 14, 13, 12, 11];
  rows.forEach((n, r) => { const kw = (w - gap * (n - 1)) / n; for (let i = 0; i < n; i++) k += `<rect x="${(x0 + i * (kw + gap)).toFixed(1)}" y="${34 + r * (kh + gap)}" width="${kw.toFixed(1)}" height="${kh}" rx="5" fill="#C6C9CD" stroke="#B4B7BB"/>`; });
    k += `<rect x="270" y="270" width="280" height="180" rx="12" fill="#CFD2D5" stroke="#BCBFC3"/></svg>`;
  return k;
})();
function makeLaptop(parent, x, y, width) {
  const root = div("laptop", `<div class="l3d"><div class="deck">${KEYBOARD}<div class="lip"></div></div><div class="lid"><div class="face back"></div><div class="face front"><div class="cam"></div><div class="screen"><div class="off"></div></div></div></div></div>`, parent);
  const s = width / 880;
  root.style.left = x + "px"; root.style.top = y + "px"; root.style.transform = `scale(${s})`;
  const lid = root.querySelector(".lid"), screen = root.querySelector(".screen"), off = root.querySelector(".off");
  return {
    root, screen, s, h: 546 * s,
    open(a) { lid.style.transform = `rotateX(${lerp(-89, 0, a)}deg)`; },
    power(a) { off.style.opacity = 1 - a; off.style.display = a >= 1 ? "none" : ""; },
  };
}
function makePhone(parent, x, y, height) {
  const root = div("phone", `<div class="island"></div><div class="screen"></div>`, parent);
  const s = height / 620;
  root.style.left = x + "px"; root.style.top = y + "px"; root.style.transform = `scale(${s})`;
  return { root, screen: root.querySelector(".screen"), s, w: 300 * s };
}

/* ---------- desktop app (Formnest-DESKTOP) ---------- */
const DK_NAV = ["Dashboard", "Projekty", "Archiwum", "Użytkownicy", "Subskrypcja", "Ustawienia"];
function deskApp(screen, active = "Dashboard") {
  const root = div("dk", `<nav class="dk-side"><div class="dk-logo">FormNest</div><ul class="dk-nav">${DK_NAV.map(n => `<li${n === active ? ' class="on"' : ""}>${n}</li>`).join("")}</ul><div class="dk-out">Wyloguj</div></nav><main class="dk-main"></main>`, screen);
  const main = root.querySelector(".dk-main"), nav = [...root.querySelectorAll(".dk-nav li")];
  return { root, main, setNav(n) { nav.forEach(li => li.classList.toggle("on", li.textContent === n)); } };
}
const PROJECTS = [["Budynek B2", "Osiedle Zielona Dolina, Kraków", 612, 914, "07.10.2026"], ["Hala magazynowa H1", "Strefa Przemysłowa Wschód, Rzeszów", 344, 402, "06.10.2026"], ["Parking wielopoziomowy P3", "ul. Kolejowa 12, Katowice", 128, 655, "03.10.2026"], ["Budynek B3", "Osiedle Zielona Dolina, Kraków", 0, 896, "01.10.2026"], ["Szkoła Podstawowa nr 4", "ul. Lipowa 3, Tarnów", 1012, 1040, "29.09.2026"]];
function dkDashboard(app) {
  const p = div("dk-page", `<div class="dk-head"><h1>Dashboard</h1><span class="dk-btn2">Odśwież</span></div>
    <div class="dk-stats"><div class="dk-card"><div class="l">Aktywne projekty</div><div class="v">5</div></div>
    <div class="dk-card"><div class="l">Zamontowane elementy</div><div class="v"><span class="n">2096</span> <small>/ 3907</small></div><div class="dk-track"><i style="width:54%"></i></div><div class="dk-muted" style="margin-top:6px"><span class="pc">54</span>%</div></div></div>
    <h2>Ostatnie projekty</h2><div class="dk-list">${PROJECTS.slice(0, 4).map(r => `<div class="dk-row"><div><b>${r[0]}</b><span class="dk-muted">${r[1]}</span></div><div><div class="dk-track"><i style="width:${Math.round(r[2] / r[3] * 100)}%"></i></div><span class="dk-muted">${r[2]} / ${r[3]}</span></div><span class="dk-muted" style="text-align:right">${r[4]}</span></div>`).join("")}</div>`, app.main);
  return { page: p, num: p.querySelector(".n"), pc: p.querySelector(".pc"), bar: p.querySelector(".dk-stats .dk-track i"), rowNum: p.querySelector(".dk-row .dk-muted:not([style])") };
}
function dkProject(app) {
  const p = div("dk-page", `<div class="dk-head"><h1>Budynek B2</h1><span class="dk-btn">Dodaj plan</span></div><div class="dk-muted">Osiedle Zielona Dolina, Kraków · Użytkownicy: 7</div>
    <table class="dk-table"><thead><tr><th>Plan</th><th>Plik</th><th>Elementy</th></tr></thead><tbody>
    <tr><td>Parter</td><td>KP-23.1-1041</td><td>228</td></tr></tbody></table>
    <div class="dk-drop"><div><div style="font-size:18px;color:#1a2332;margin-bottom:6px">Upuść plik projektu</div>eksport z programu CAD</div></div>`, app.main);
  return { page: p, body: p.querySelector("tbody"), drop: p.querySelector(".dk-drop") };
}
function dkPlan(app, d, { codes = false, title = "Kondygnacja +1", sub = "" } = {}) {
  const p = div("dk-page", `<span class="dk-btn2">&larr; Wróć do projektu</span><div style="margin-top:12px"><h1 style="font-size:26px;margin:0">${title}</h1><span class="dk-muted st">${sub}</span></div>
    <div class="dk-plan-tb"><span class="dk-btn2">&minus;</span><span class="dk-muted">100%</span><span class="dk-btn2">+</span><span class="dk-btn2">Dopasuj</span><span class="sp"></span><span class="dk-btn2">Dodaj element</span><span class="dk-btn">Zapisz zmiany</span></div>
    <div class="dk-ws" style="height:560px"><div class="dk-vp"><svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet"></svg></div>
    <div class="dk-ps"><div class="dk-in">Szukaj po kodzie...</div><ul class="dk-el"></ul><div class="dk-panel"><b>Wybrany element</b><br><span class="pc">Kliknij element na planie</span></div></div></div>`, app.main);
  const svg = p.querySelector("svg");
  // the viewport is ~704 px wide for 1200 units: keep markers at the app's 14 px
  const vpScale = 704 / 1200;
  const pl = drawPlan(svg, d, { theme: "dark", markerR: 7 / vpScale, codes, cadNoise: codes });
  const list = p.querySelector(".dk-el");
  d.els.slice(0, 26).forEach(e => { const li = document.createElement("li"); li.innerHTML = `<span>${e.code}</span><i style="background:${e.inst ? C.mGreen : C.mRed}"></i>`; e.li = li; list.appendChild(li); });
  return { page: p, svg, pl, list, search: p.querySelector(".dk-in"), panel: p.querySelector(".dk-panel .pc"), sub: p.querySelector(".st") };
}
function qrSvg(seed, cell = 8) {
  const R = rng(seed); let s = `<svg width="${21 * cell}" height="${21 * cell}" viewBox="0 0 ${21 * cell} ${21 * cell}">`;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); let on;
    if (f) { const ex = x > 13 ? x - 14 : x, ey = y > 13 ? y - 14 : y; on = ex === 0 || ex === 6 || ey === 0 || ey === 6 || (ex >= 2 && ex <= 4 && ey >= 2 && ey <= 4); } else on = R() > .52;
    if (on) s += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
  }
  return s + "</svg>";
}
function dkUsers(app) {
  const users = [["a.nowak@firma-przyklad.pl", "Manager"], ["j.kowalski", "Engineer"], ["p.wisniewski", "Engineer"], ["m.zielinski", "Engineer"], ["admin@firma-przyklad.pl", "Administrator"]];
  const p = div("dk-page", `<div class="dk-head"><h1>Użytkownicy</h1><span class="dk-btn">Dodaj użytkownika</span></div>
    <table class="dk-table"><thead><tr><th>Login</th><th>Rola</th><th>Akcje</th></tr></thead><tbody>${users.map(u => `<tr><td>${u[0]}</td><td>${u[1]}</td><td>${u[1] === "Engineer" ? '<span class="dk-btn2">Kod QR</span>' : ""}</td></tr>`).join("")}</tbody></table>
    <div class="dk-modal"><div><h3>Kod QR logowania</h3><div style="display:flex;gap:22px;align-items:center"><div class="qr">${qrSvg(4, 8)}</div><div class="dk-muted" style="line-height:1.6">Użytkownik<br><b style="color:#1a2332">j.kowalski</b><br><br>Zeskanuj w aplikacji<br>FormNest na telefonie.</div></div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px"><span class="dk-btn2">Unieważnij kod</span><span class="dk-btn">Zamknij</span></div></div></div>`, app.main);
  return { page: p, modal: p.querySelector(".dk-modal") };
}
function dkProjects(app) {
  const p = div("dk-page", `<div class="dk-head"><h1>Projekty</h1><span class="dk-btn">Dodaj projekt</span></div>
    <table class="dk-table"><thead><tr><th>Nazwa</th><th>Lokalizacja</th><th>Użytkownicy</th></tr></thead><tbody>${PROJECTS.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td><span class="as"></span></td></tr>`).join("")}</tbody></table>`, app.main);
  return { page: p, rows: [...p.querySelectorAll("tbody tr")], as: [...p.querySelectorAll(".as")] };
}

/* ---------- mobile app (flutter_app_formnest) ---------- */
function mobApp(screen) {
  const root = div("mb", "", screen);
  return { root };
}
const mbStatus = () => `<div class="mb-status"><span>10:42</span><span style="display:flex;gap:6px;align-items:center"><svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="6" rx="1"/><rect x="10" y="2.5" width="3" height="8.5" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="#1A2332"/><rect x="2" y="2" width="16" height="8" rx="1.5"/></svg></span></div>`;
const mbStatusDark = () => mbStatus().replace('class="mb-status"', 'class="mb-status" style="background:#1F2937;color:#fff;fill:#fff"').replace('stroke="#1A2332"', 'stroke="#fff"');
function mbLogin(app) {
  const s = div("mb-scr", `${mbStatus()}<div style="padding:70px 24px 0"><div style="text-align:center;font-size:28px;font-weight:700">FormNest</div><div style="text-align:center" class="mb-m">Montaż elementów prefabrykowanych</div>
    <div style="background:#fff;border-radius:12px;padding:24px 20px 20px;margin-top:28px"><div style="border:1px solid #D1D5DB;border-radius:6px;padding:14px;color:#9CA3AF;margin-bottom:14px">Login</div><div style="border:1px solid #D1D5DB;border-radius:6px;padding:14px;color:#9CA3AF;margin-bottom:18px">Hasło</div><div class="mb-btn blue">Zaloguj</div></div>
    <div style="text-align:center;margin:18px 0" class="mb-m">lub</div><div class="mb-btn out">${icon("qr", 20)}Zaloguj kodem QR</div></div>`, app.root);
  return s;
}
function mbProjects(app, list = PROJECTS.slice(0, 2)) {
  const s = div("mb-scr", `${mbStatusDark()}<div class="mb-bar"><span>FormNest</span><span class="sp"></span>${icon("logout", 22, "#fff")}</div>
    <div class="mb-body"><div class="mb-h">Projekty</div><div class="mb-m">j.kowalski</div><div class="cards">${list.map(projCard).join("")}</div></div>`, app.root);
  return { scr: s, cards: s.querySelector(".cards") };
}
const projCard = r => `<div class="mb-card"><div class="t"><b>${r[0]}</b><div class="mb-m">${r[1]}</div><div class="mb-m" style="font-size:12px;margin-top:4px">${r[2]} / ${r[3]} zamontowanych · 4 plany</div></div>${icon("chev", 22, "#6B7280")}</div>`;
function mbScanner(app, inner = "") {
  const s = div("mb-scr", `${mbStatusDark()}<div class="mb-bar">${icon("back", 22, "#fff")}<span>Skanuj element</span></div>
    <div class="mb-cam"><div class="scene" style="position:absolute;inset:0">${inner}</div>
    <svg class="mb-frame" viewBox="0 0 250 250"><path class="fr" d="M2 40V12Q2 2 12 2h28M210 2h28q10 0 10 10v28M248 210v28q0 10-10 10h-28M40 248H12q-10 0-10-10v-28" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>
    <div class="mb-hint">Skieruj aparat na etykietę elementu.</div><div class="mb-manual">Wpisz ręcznie</div></div>`, app.root);
  return { scr: s, scene: s.querySelector(".scene"), frame: s.querySelector(".fr"), hint: s.querySelector(".mb-hint") };
}
function mbPlan(app, d, { title = "Kondygnacja +1", count = "212 / 231 zamontowanych" } = {}) {
  const s = div("mb-scr", `${mbStatusDark()}<div class="mb-bar">${icon("back", 22, "#fff")}<div><span>${title}</span><small class="cnt">${count}</small></div><span class="sp"></span>${icon("search", 22, "#fff")}${icon("layers", 22, "#fff")}${icon("fit", 22, "#fff")}</div>
    <div class="mb-plan"><svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet"></svg></div>
    <div class="mb-sheet"><div class="code">W_01_627S</div><div class="row"><i style="background:${C.mRed}"></i><span class="stt">Niezamontowany</span></div><div class="mb-btn green act">${icon("check", 20, "#fff")}<span>Oznacz jako zamontowany</span></div></div>`, app.root);
  const svg = s.querySelector(".mb-plan svg");
  // 390 px wide screen shows 1200 units: markers at ~14 px
  const pl = drawPlan(svg, d, { theme: "dark", markerR: 7 / (390 / 1200) });
  return { scr: s, svg, pl, sheet: s.querySelector(".mb-sheet"), stt: s.querySelector(".stt"), dot: s.querySelector(".row i"), btn: s.querySelector(".act"), cnt: s.querySelector(".cnt"), code: s.querySelector(".code") };
}
/* A printed element label (etykieta) as it sits on a prefab element. */
function labelHtml(code, w = 220, where = "Budynek B2 · kondygnacja +1") {
  const R = rng(code.length * 31); let bars = ""; let x = 0;
  while (x < 200) { const bw = 1 + Math.floor(R() * 3); if (R() > .42) bars += `<rect x="${x}" y="0" width="${bw}" height="36"/>`; x += bw + 1; }
  return `<div style="width:${w}px;background:#F7F5EE;border:1px solid #BDBAB0;padding:10px 12px 8px;font-family:Arial,sans-serif;color:#111"><div style="font-size:10.5px;color:#555;white-space:nowrap">Producent-Prefabrykatów Sp. z o.o.</div><svg viewBox="0 0 200 36" preserveAspectRatio="none" style="width:100%;height:38px;margin:6px 0 4px;display:block">${bars}</svg><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:700;font-size:17px;letter-spacing:.02em">${code}</span><span style="font-size:11px;color:#555">2,9 t</span></div><div style="font-size:11px;color:#555">${where}</div></div>`;
}

/* Isometric building, drawn panel by panel (title slide). */
function isoBuilding(svg, { W = 7, D = 4, F = 4, s = 44, h = 56, ox = 390, oy = 120 } = {}) {
  const a = s * Math.cos(Math.PI / 6), b = s * Math.sin(Math.PI / 6);
  const P = (x, y, z) => [ox + (x - y) * a, oy + (x + y) * b - z * h + F * h];
  const poly = pts => pts.map(p => P(...p).map(v => v.toFixed(1)).join(",")).join(" ");
  const gg = svgEl("g", { stroke: "#D5D8DA", "stroke-width": 1 }, svg);
  for (let i = -2; i <= W + 2; i++) { const A = P(i, -2, 0), B = P(i, D + 2, 0); svgEl("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, gg); }
  for (let j = -2; j <= D + 2; j++) { const A = P(-2, j, 0), B = P(W + 2, j, 0); svgEl("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, gg); }
  const gh = svgEl("g", { fill: "none", stroke: C.ink3, "stroke-dasharray": "4 5", "stroke-width": 1 }, svg);
  [[[0, 0, 0], [W, 0, 0]], [[0, 0, 0], [0, D, 0]], [[W, 0, 0], [W, D, 0]], [[0, D, 0], [W, D, 0]], [[0, 0, F], [W, 0, F]], [[0, 0, F], [0, D, F]], [[W, 0, F], [W, D, F]], [[0, D, F], [W, D, F]], [[0, 0, 0], [0, 0, F]], [[W, 0, 0], [W, 0, F]], [[0, D, 0], [0, D, F]], [[W, D, 0], [W, D, F]]]
    .forEach(([p, q]) => { const A = P(...p), B = P(...q); svgEl("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, gh); });
  const parts = [];
  const add = (pts, fill) => parts.push({ p: svgEl("polygon", { points: poly(pts), fill, stroke: C.ink, "stroke-width": 1.1, "stroke-linejoin": "round", opacity: 0 }, svg), fill, a: -1 });
  for (let f = 0; f < F; f++) {
    for (let i = 0; i < W; i++) add([[i, 0, f], [i + 1, 0, f], [i + 1, 0, f + 1], [i, 0, f + 1]], "#C2C6C9");
    for (let j = 0; j < D; j++) add([[0, j, f], [0, j + 1, f], [0, j + 1, f + 1], [0, j, f + 1]], "#C9CDD0");
    for (let j = 0; j < D; j++) add([[W, j, f], [W, j + 1, f], [W, j + 1, f + 1], [W, j, f + 1]], "#D6D9DB");
    for (let i = 0; i < W; i++) add([[i, D, f], [i + 1, D, f], [i + 1, D, f + 1], [i, D, f + 1]], "#E4E6E7");
    for (let i = 0; i < W; i++) add([[i, 0, f + 1], [i + 1, 0, f + 1], [i + 1, D, f + 1], [i, D, f + 1]], "#F4F5F5");
  }
  return parts;
}
