/* Slide definitions. Every slide has one message and one animation.
   build(el) returns render(t), t in 0..1 (linear time); render must be a pure function of t
   so the engine can play it forward and back. */
const SLIDES = [];
const slide = def => SLIDES.push(def);

function offIn(el, root) { let x = 0, y = 0; while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; }
const wrap = (p, x, y) => { const w = div("", "", p); w.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0`; return w; };
const overlay = (p, z = 3) => { const s = svgEl("svg", { width: 1600, height: 900, viewBox: "0 0 1600 900" }, p); s.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;z-index:${z}`; return s; };
const show = (el, a) => { el.style.opacity = a; };
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const fileChip = name => `<div style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid ${C.hair};border-radius:6px;padding:12px 16px;font-size:17px;white-space:nowrap"><svg width="26" height="32" viewBox="0 0 26 32"><path d="M1 1h16l8 8v22H1z" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/><path d="M17 1v8h8" fill="none" stroke="${C.ink}" stroke-width="1.5"/><text x="13" y="24" font-size="7" text-anchor="middle" font-weight="700" fill="${C.ink}">CAD</text></svg>${name}</div>`;
const tapAt = (tap, btn, root) => { const [bx, by] = offIn(btn, root); tap.style.left = (bx + btn.offsetWidth / 2) * .7128 + "px"; tap.style.top = (by + btn.offsetHeight / 2) * .7128 + "px"; };
function tapAnim(tap, a) { tap.style.opacity = a > 0 && a < 1 ? Math.sin(Math.PI * a) : 0; tap.style.transform = `scale(${lerp(.6, 1.3, a)})`; }
const QR_SCENE = `<div style="position:absolute;inset:0;background:#2A2C30"></div><div class="q" style="position:absolute;left:50%;top:42%;width:160px;height:160px;margin:-80px 0 0 -80px;background:#fff;padding:12px;transform-origin:center;opacity:0">${qrSvg(4, 6).replace("<svg ", '<svg style="width:100%;height:100%" ')}</div>`;
/* phone screens that follow one another like app routes: [screen, time the screen starts sliding in] */
function routes(list, t, d = .05) {
  list.forEach(([scr, at], i) => {
    const e = i === 0 ? 1 : eio(seg(t, at, at + d));
    const nx = list[i + 1] ? eio(seg(t, list[i + 1][1], list[i + 1][1] + d)) : 0;
    scr.style.transform = `translateX(${(1 - e) * 100 - 30 * nx}%)`;
    scr.style.zIndex = i + 1;
    scr.style.boxShadow = e > 0 && e < 1 ? "-8px 0 24px rgba(0,0,0,.2)" : "none";
  });
}

/* phone that scans the label and opens the plan */
function scanPhone(el, x, y, h, d) {
  const pw = wrap(el, x, y); const ph = makePhone(pw, 0, 0, h); const m = mobApp(ph.screen);
  const pl = mbPlan(m, d);
  const sc = mbScanner(m, `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#8E9194,#55585B 70%)"></div><div class="lb" style="position:absolute;left:50%;top:42%;transform-origin:center">${labelHtml("W_01_627S", 230)}</div>`);
  pl.scr.style.zIndex = 2;
  return { pw, ph, m, pl, sc, lb: sc.scene.querySelector(".lb") };
}
function planZoom(P, d, z, sel) {
  const full = [0, 0, 1200, 760], zoom = [d.T.x - 190, d.T.y - 300, 380, 600];
  const vb = full.map((v, i) => lerp(v, zoom[i], z)); P.pl.svg.setAttribute("viewBox", vb.join(" "));
  const sc = vb[2] / 1200; d.els.forEach(e => markState(e, e === d.T && sel ? "sel" : e.inst ? "inst" : "pend", sc));
  return vb;
}

/* =========================================================
   A. THE IDEA: FINDING THE ELEMENT'S PLACE
   ========================================================= */

/* 1. title */
slide({
  copy: { h: "FormNest", p: "Miejsce montażu każdego prefabrykatu w kilka sekund, prosto ze skanu etykiety. Montaż idzie szybciej, a o pomyłkę dużo trudniej.", cls: "title", style: "top:250px" },
  dur: 3.2,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 780 620" }, el); svg.style.cssText = "position:absolute;left:720px;top:130px;width:780px;height:620px";
    const parts = isoBuilding(svg);
    const cnt = div("note", "", el); cnt.style.cssText += "right:120px;top:780px;font-size:17px;font-variant-numeric:tabular-nums";
    div("hint", `<span class="key">spacja</span><span class="key">&rarr;</span><span>dalej</span><span style="margin-left:14px" class="key">F</span><span>pełny ekran</span>`, el);
    return t => {
      const N = parts.length, wave = t * (N + 10);
      parts.forEach((x, i) => {
        const a = Math.round(clamp((wave - i) / 10) * 100) / 100;
        if (a === x.a) return; x.a = a;
        x.p.setAttribute("opacity", a > 0 ? 1 : 0);
        x.p.setAttribute("transform", `translate(0 ${(-(1 - eo(a)) * 22).toFixed(1)})`);
        x.p.setAttribute("fill", a > 0 && a < 1 ? C.yel : x.fill);
        x.p.setAttribute("fill-opacity", a > 0 && a < 1 ? .35 + .65 * a : 1);
      });
      cnt.textContent = `${Math.round(clamp((wave - 5) / N) * N)} z ${N} zamontowano`;
      show(cnt, seg(t, 0, .06));
    };
  }
});

/* 2. the core: scan shows the place */
slide({
  copy: { h: "Skan etykiety pokazuje miejsce elementu na planie.", p: "Aplikacja sama przybliża plan i zaznacza element. Nie trzeba szukać jego lokalizacji w dokumentacji papierowej." },
  dur: 3.6,
  build(el) {
    const d = planData(); const P = scanPhone(el, 1000, 150, 650, d);
    return t => {
      const a = eio(seg(t, 0, .25));
      P.lb.style.transform = `translate(-50%,-50%) translate(${lerp(-430, 0, a)}px,${lerp(140, 0, a)}px) rotate(${lerp(-18, -3, a)}deg) scale(${lerp(.8, 1, a)})`;
      const ok = t >= .3; P.sc.frame.setAttribute("stroke", ok ? "#2563EB" : "#fff"); P.sc.hint.textContent = ok ? "Odczytano kod elementu" : "Skieruj aparat na etykietę elementu.";
      const s = eio(seg(t, .36, .56)); P.sc.scr.style.transform = `translateX(${-30 * s}%)`; P.pl.scr.style.transform = `translateX(${(1 - s) * 100}%)`;
      planZoom(P, d, eio(seg(t, .5, .82)), t > .5);
      P.pl.sheet.style.transform = `translateY(${(1 - eo(seg(t, .78, 1))) * 105}%)`;
    };
  }
});

/* 3. one code, one place */
slide({
  copy: { h: "Każdy prefabrykat ma swój kod i jedno właściwe miejsce." },
  dur: 2.2,
  build(el) {
    const d = planData();
    const pw = 720, ph = 456, px = 770, py = 220, k = pw / 1200;
    const svg = svgEl("svg", { viewBox: "0 0 1200 760" }, el); svg.style.cssText = `position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px`;
    drawPlan(svg, d, { theme: "paper", markers: false });
    const lab = div("", labelHtml("W_01_627S", 250), el); lab.style.cssText = "position:absolute;left:120px;top:520px";
    const o = overlay(el);
    const tx = px + d.T.x * k, ty = py + d.T.y * k;
    const path = svgEl("path", { d: `M370 590 H 730 V ${py + ph + 40} H ${tx} V ${ty + 12}`, fill: "none", stroke: C.ink, "stroke-width": 1.2 }, o);
    const L = path.getTotalLength(); path.setAttribute("stroke-dasharray", L);
    const ring = svgEl("circle", { cx: tx, cy: ty, r: 12, fill: "none", stroke: C.ink, "stroke-width": 1.2 }, o);
    const dot = svgEl("circle", { cx: tx, cy: ty, r: 7, fill: C.red, stroke: "#fff", "stroke-width": 2 }, o);
    const code = svgText(o, tx - 16, ty - 16, "W_01_627S", { "font-size": 16, fill: C.ink, "font-weight": 600, "text-anchor": "end" });
    return t => {
      path.setAttribute("stroke-dashoffset", L * (1 - eio(seg(t, .05, .6))));
      const a = eo(seg(t, .55, .75)); dot.setAttribute("r", 7 * a); dot.setAttribute("opacity", a > 0 ? 1 : 0);
      const b = seg(t, .62, 1); ring.setAttribute("r", 9 + 30 * eo(b)); ring.setAttribute("opacity", b > 0 ? 1 - b : 0);
      code.setAttribute("opacity", seg(t, .7, .9));
    };
  }
});

/* 4. searching on paper, with a magnifier */
slide({
  copy: { h: "Na papierowym planie trzeba to miejsce znaleźć samemu.", p: "Kod z etykiety trzeba porównywać z opisami na rysunku, element po elemencie." },
  dur: 4.4,
  build(el) {
    const d = planData();
    const pw = 720, ph = 456, px = 770, py = 260;
    const svg = svgEl("svg", { viewBox: "0 0 1200 760" }, el); svg.style.cssText = `position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;overflow:visible`;
    const root = svgEl("g", { id: "s4plan" }, svg);
    drawPlan(root, d, { theme: "paper", markers: false, cadNoise: true });
    const visit = [d.els[3], d.els[30], d.els[9], d.els[40], d.els[27], d.els[12], d.T];
    const pts = visit.map(e => [e.x, e.y]);
    let dstr = `M${pts[0][0]} ${pts[0][1]}`; const parts = [dstr];
    for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, e] = pts[i]; dstr += ` Q ${(a + c) / 2 + (i % 2 ? 60 : -60)} ${(b + e) / 2 - 50} ${c} ${e}`; parts.push(dstr); }
    const path = svgEl("path", { d: dstr, fill: "none", stroke: C.red, "stroke-width": 2, "stroke-dasharray": "7 7", opacity: .7 }, svg);
    const L = path.getTotalLength();
    const tmp = svgEl("path", { d: "" }, svg); const fr = parts.map(p => { tmp.setAttribute("d", p); return tmp.getTotalLength() / L; }); tmp.remove();
    const mask = svgEl("mask", { id: "s4m" }, svg); svgEl("rect", { x: -100, y: -100, width: 1400, height: 1000, fill: "#000" }, mask);
    const mp = svgEl("path", { d: dstr, fill: "none", stroke: "#fff", "stroke-width": 6 }, mask); mp.setAttribute("stroke-dasharray", L);
    path.setAttribute("mask", "url(#s4m)");
    const nope = visit.slice(0, -1).map(e => { const g = svgEl("g", { opacity: 0, transform: `translate(${e.x} ${e.y})` }, svg); svgEl("path", { d: "M-9 -9 L9 9 M9 -9 L-9 9", stroke: C.red, "stroke-width": 3, "stroke-linecap": "round" }, g); return g; });
    const found = svgEl("circle", { cx: d.T.x, cy: d.T.y, r: 16, fill: "none", stroke: C.green, "stroke-width": 4, opacity: 0 }, svg);
    const R = 96, M = 2.2;
    const clip = svgEl("clipPath", { id: "s4c" }, svg); const cc = svgEl("circle", { r: R }, clip);
    const lens = svgEl("g", { opacity: 0 }, svg);
    const inner = svgEl("g", { "clip-path": "url(#s4c)" }, lens);
    const bg = svgEl("circle", { r: R, fill: "#F7F8F8" }, inner);
    const use = svgEl("use", { href: "#s4plan" }, inner);
    const ring = svgEl("circle", { r: R, fill: "none", stroke: C.ink, "stroke-width": 3 }, lens);
    const handle = svgEl("line", { stroke: C.ink, "stroke-width": 12, "stroke-linecap": "round" }, lens);
    const watch = div("", `<div style="font-size:15px;color:${C.ink2}">czas szukania</div><div class="w" style="font-size:44px;font-weight:600;font-variant-numeric:tabular-nums">0:00</div>`, el);
    watch.style.cssText = "position:absolute;left:770px;top:150px";
    const w = watch.querySelector(".w");
    return t => {
      const q = seg(t, .04, .9), e = eio(q);
      mp.setAttribute("stroke-dashoffset", L * (1 - e));
      const pt = path.getPointAtLength(L * e);
      cc.setAttribute("cx", pt.x); cc.setAttribute("cy", pt.y); bg.setAttribute("cx", pt.x); bg.setAttribute("cy", pt.y);
      ring.setAttribute("cx", pt.x); ring.setAttribute("cy", pt.y);
      handle.setAttribute("x1", pt.x + R * .72); handle.setAttribute("y1", pt.y + R * .72); handle.setAttribute("x2", pt.x + R * 1.3); handle.setAttribute("y2", pt.y + R * 1.3);
      use.setAttribute("transform", `translate(${pt.x} ${pt.y}) scale(${M}) translate(${-pt.x} ${-pt.y})`);
      lens.setAttribute("opacity", seg(t, 0, .04) * (1 - seg(t, .93, 1)));
      // mark each visited element once the lens has moved on from it
      nope.forEach((g, i) => g.setAttribute("opacity", e > fr[i] + .03 ? 1 : 0));
      found.setAttribute("opacity", seg(t, .9, .96));
      w.textContent = mmss(408 * q);
    };
  }
});

/* 5. the time difference */
slide({
  copy: { h: "W aplikacji to samo zajmuje kilka sekund.", p: "Szacowany czas odnalezienia miejsca jednego elementu." },
  dur: 3.4,
  build(el) {
    const rows = [["Dokumentacja papierowa", "porównywanie kodów na rysunku", 408, C.ink], ["FormNest", "skan etykiety", 5, C.green]];
    const W = 710, MAX = 420;
    const box = div("", rows.map(r => `<div style="margin-bottom:70px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><div style="font-size:26px;font-weight:600">${r[0]}</div><div style="font-size:17px;color:${C.ink2}">${r[1]}</div></div><div class="v" style="font-size:44px;font-weight:600;font-variant-numeric:tabular-nums">0:00</div></div>
      <div style="position:relative;height:16px;margin-top:16px;border-bottom:1px solid ${C.hair}"><i style="position:absolute;left:0;top:0;height:16px;width:0;background:${r[3]}"></i></div></div>`).join(""), el);
    box.style.cssText = `position:absolute;left:770px;top:270px;width:${W}px`;
    const vs = [...box.querySelectorAll(".v")], bars = [...box.querySelectorAll("i")];
    return t => {
      const clock = MAX * seg(t, .03, .97);
      rows.forEach((r, i) => { const s = Math.min(r[2], clock); vs[i].textContent = mmss(s); bars[i].style.width = (s / MAX * W) + "px"; vs[i].style.color = s >= r[2] && i === 1 ? C.green : C.ink; });
    };
  }
});

/* 6. how many elements */
slide({
  copy: { h: "Na jednym budynku montuje się kilkaset takich elementów.", p: "Na przykładowym budynku mieszkalnym z czterema kondygnacjami jest ich 914." },
  dur: 2.6,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 720 580" }, el); svg.style.cssText = "position:absolute;left:770px;top:170px;width:720px;height:580px";
    const types = [["Ściany zewnętrzne", 236, C.ink], ["Ściany wewnętrzne", 318, "#6E737A"], ["Stropy", 312, "#B3B8BD"], ["Schody i inne", 48, "#fff"]];
    const cols = 38, sz = 15.4, gap = 3.2, cells = []; let n = 0;
    types.forEach(([, c, f], ti) => { for (let i = 0; i < c; i++) { const cx = n % cols, cy = Math.floor(n / cols); cells.push({ r: svgEl("rect", { x: cx * (sz + gap), y: cy * (sz + gap), width: sz, height: sz, fill: f, stroke: C.ink, "stroke-width": ti === 3 ? 1 : 0, opacity: 0 }, svg), o: cx + cy * 1.6, a: -1 }); n++; } });
    const maxO = Math.max(...cells.map(c => c.o));
    const ly = Math.ceil(n / cols) * (sz + gap) + 34, leg = [];
    types.forEach(([name, c, f], i) => { const g = svgEl("g", { opacity: 0 }, svg), x = (i % 2) * 360, y = ly + Math.floor(i / 2) * 32; svgEl("rect", { x, y: y - 13, width: 15, height: 15, fill: f, stroke: C.ink, "stroke-width": 1 }, g); svgText(g, x + 26, y, name, { "font-size": 18, fill: C.ink }); svgText(g, x + 330, y, c, { "font-size": 18, fill: C.ink, "text-anchor": "end" }); leg.push(g); });
    return t => {
      const w = seg(t, 0, .8) * (maxO + 14);
      cells.forEach(c => { const a = Math.round(clamp((w - c.o) / 14) * 20) / 20; if (a !== c.a) { c.a = a; c.r.setAttribute("opacity", a); } });
      leg.forEach((g, i) => g.setAttribute("opacity", seg(t, .72 + i * .05, .86 + i * .05)));
    };
  }
});

/* 7. hours */
slide({
  copy: { h: "Szukanie ich wszystkich w dokumentacji papierowej to ponad 100 godzin pracy.", p: "Szacunek: 914 elementów po 6,8 minuty." },
  dur: 2.6,
  build(el) {
    const head = div("", `<span style="color:${C.ink2}">914 × 6,8 min =</span> <b class="h" style="font-weight:600;font-variant-numeric:tabular-nums">0 h</b>`, el);
    head.style.cssText = "position:absolute;left:800px;top:176px;font-size:40px";
    const g = div("", "", el); g.style.cssText = "position:absolute;left:800px;top:270px;display:grid;grid-template-columns:repeat(13,40px);gap:8px";
    const fill = []; for (let i = 0; i < 104; i++) { const b = div("", "", g); b.style.cssText = `height:40px;border:1px solid ${C.hair}`; const f = div("", "", b); f.style.cssText = `width:100%;height:100%;background:${C.ink};transform-origin:left;transform:scaleX(0)`; fill.push(f); }
    const cap = div("note", "jeden kwadrat to jedna godzina", el); cap.style.cssText += "left:800px;top:676px";
    const hh = head.querySelector(".h");
    return t => {
      const q = seg(t, 0, .85) * 104;
      fill.forEach((f, i) => f.style.transform = `scaleX(${eo(clamp(q - i)).toFixed(3)})`);
      hh.textContent = Math.round(Math.min(103.6, q)) + " h";
      show(cap, seg(t, .85, 1));
    };
  }
});

/* =========================================================
   B. HOW IT WORKS
   ========================================================= */

/* 8. desktop + mobile */
slide({
  copy: { h: "FormNest działa na komputerze i na telefonie.", p: "Aplikacja desktopowa służy do zarządzania projektami i planami, mobilna do pracy na budowie. Obie korzystają z tych samych danych.", cls: "wide", style: "width:1360px" },
  dur: 3.4,
  build(el) {
    const lap = makeLaptop(el, 240, 352, 680); const app = deskApp(lap.screen); dkDashboard(app);
    const pw = wrap(el, 1130, 352); const ph = makePhone(pw, 0, 0, 470); const m = mobApp(ph.screen); mbProjects(m);
    return t => {
      lap.open(eio(seg(t, 0, .5))); lap.power(seg(t, .4, .6));
      // the phone rises from below the slide
      pw.style.transform = `translateY(${(1 - eo(seg(t, .42, .9))) * 640}px)`;
    };
  }
});

/* 9. plan import from CAD */
slide({
  copy: { h: "Plan wczytuje się prosto z projektu CAD.", p: "Wystarczy eksport z programu CAD. Nikt nie musi przerysowywać planu." },
  dur: 3,
  build(el) {
    const LX = 700, LY = 230, LW = 780, lap = makeLaptop(el, LX, LY, LW); lap.open(1); lap.power(1);
    const app = deskApp(lap.screen, "Projekty"), pg = dkProject(app);
    const chip = div("", fileChip("KP-23.1-1051"), el); chip.style.cssText = "position:absolute;left:120px;top:560px;transform-origin:0 0";
    const prog = div("", `<div style="width:360px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;margin:0 auto 10px"><i style="display:block;height:100%;background:#2563eb;width:0"></i></div><span class="pt">Import planu…</span>`, pg.drop); prog.style.cssText = "position:absolute;left:0;right:0;top:80px;text-align:center;font-size:16px;color:#1a2332";
    pg.drop.style.position = "relative";
    const dropInner = pg.drop.firstChild, pbar = prog.querySelector("i"), pt = prog.querySelector(".pt");
    const row = document.createElement("tr"); row.innerHTML = `<td>Kondygnacja +1</td><td>KP-23.1-1051</td><td>231</td>`; pg.body.appendChild(row);
    let target = null;
    return t => {
      if (!target) { const [ax, ay] = offIn(pg.drop, app.root), k = .6156 * lap.s; target = [LX + 46 * lap.s + ax * k, LY + 16 * lap.s + ay * k, pg.drop.offsetWidth * k, pg.drop.offsetHeight * k]; }
      const a = eio(seg(t, .02, .38));
      const cx = target[0] + target[2] / 2 - 130, cy = target[1] + target[3] / 2 - 28;
      chip.style.transform = `translate(${lerp(0, cx - 120, a)}px,${lerp(0, cy - 560, a)}px) scale(${lerp(1, .9, a)})`;
      chip.style.opacity = 1 - seg(t, .38, .46); chip.style.visibility = t >= .46 ? "hidden" : "";
      const hot = t >= .25 && t < .66;
      pg.drop.style.borderColor = hot ? "#2563eb" : "#d1d5db"; pg.drop.style.background = hot ? "#eff6ff" : "transparent";
      const p = seg(t, .42, .66); dropInner.style.opacity = t < .38 || t > .7 ? 1 : 0; prog.style.opacity = p > 0 && t < .7 ? 1 : 0;
      pbar.style.width = (p * 100) + "%"; pt.textContent = p < 1 ? `Import planu… ${Math.round(p * 100)}%` : "Gotowe";
      row.style.opacity = seg(t, .7, .85); row.style.background = `rgba(255,224,102,${.55 * (1 - seg(t, .85, 1))})`;
    };
  }
});

/* 10. element recognition */
slide({
  copy: { h: "Program sam odczytuje z rysunku kody i położenie elementów.", p: "Elementów nie trzeba nanosić ręcznie. Na rysunkach testowych z PrefaBCad program rozpoznał wszystkie." },
  dur: 3.4,
  build(el) {
    const lap = makeLaptop(el, 700, 230, 780); lap.open(1); lap.power(1);
    const d = planData(3, 0); d.els.forEach(e => e.inst = false);
    const app = deskApp(lap.screen, "Projekty"), pg = dkPlan(app, d, { codes: true, title: "Kondygnacja +1", sub: "KP-23.1-1051" });
    const scan = svgEl("rect", { x: 0, y: -40, width: 4, height: 840, fill: "#3B82F6" }, pg.svg);
    pg.list.querySelectorAll("li").forEach(li => li.style.opacity = 0);
    return t => {
      const q = seg(t, .03, .85), sx = lerp(20, 1180, eio(q));
      scan.setAttribute("x", sx); scan.setAttribute("opacity", q > 0 && q < 1 ? 1 : 0);
      let n = 0;
      d.els.forEach(e => { const on = q > 0 && e.x < sx; if (on) n++; if (e._on === on) return; e._on = on; e.m.setAttribute("opacity", on ? 1 : 0); if (e.li) e.li.style.opacity = on ? 1 : 0; });
      pg.pl.noise.setAttribute("opacity", 1 - seg(t, .86, 1));
      pg.sub.textContent = `KP-23.1-1051 · znaleziono ${Math.round(n / d.els.length * 139)} elementów`;
    };
  }
});

/* 11. QR login */
slide({
  copy: { h: "Szybkie logowanie bez hasła.", p: "Wystarczy zeskanować kod QR z aplikacji desktopowej. Dostęp można w każdej chwili wyłączyć." },
  dur: 3.2,
  build(el) {
    const lap = makeLaptop(el, 704, 330, 516); lap.open(1); lap.power(1);
    const app = deskApp(lap.screen, "Użytkownicy"); dkUsers(app);
    const pw = wrap(el, 1240, 210); const ph = makePhone(pw, 0, 0, 500); const m = mobApp(ph.screen);
    const sc = mbScanner(m, QR_SCENE); const pr = mbProjects(m);
    const q = sc.scene.querySelector(".q"), cam = sc.scr.querySelector(".mb-cam");
    const line = div("", "", cam); line.style.cssText = "position:absolute;left:70px;right:70px;height:2px;background:#2563EB";
    const ok = div("", `<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="#2563EB"/><path d="M22 37l9 9 19-20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, cam); ok.style.cssText = "position:absolute;left:50%;top:42%;margin:-36px 0 0 -36px;transform-origin:center";
    return t => {
      // the phone is lifted and tilted towards the QR on the laptop screen, then lowered
      const lift = eio(seg(t, 0, .3)) * (1 - eio(seg(t, .62, .9)));
      pw.style.transformOrigin = `${ph.w / 2}px 250px`;
      pw.style.transform = `translateY(${-28 * lift}px) rotate(${-3 * lift}deg)`;
      // the code enters the frame from outside the camera view
      const a = eio(seg(t, .08, .38));
      q.style.opacity = t > .08 ? 1 : 0;
      q.style.transform = `translate(${lerp(330, 0, a)}px,${lerp(-60, 0, a)}px) rotate(${lerp(-12, 0, a)}deg) scale(${lerp(.7, 1.05, a)})`;
      const found = t >= .42;
      sc.frame.setAttribute("stroke", found ? "#2563EB" : "#fff");
      line.style.opacity = t > .05 && !found ? 1 : 0; line.style.top = (130 + 220 * (.5 + .5 * Math.sin(t * 40))) + "px";
      const c = eo(seg(t, .42, .52)); ok.style.opacity = c * (1 - seg(t, .62, .7)); ok.style.transform = `scale(${lerp(.6, 1, c)})`;
      sc.hint.textContent = found ? "Zalogowano: j.kowalski" : "Skieruj aparat na kod QR otrzymany od kierownika.";
      routes([[sc.scr, 0], [pr.scr, .66]], t, .26);
    };
  }
});

/* 12. assignment */
slide({
  copy: { h: "Łatwe przypisywanie użytkowników do projektów.", p: "W aplikacji mobilnej każdy widzi tylko projekty, do których ma dostęp." },
  dur: 2.4,
  build(el) {
    const lap = makeLaptop(el, 704, 330, 516); lap.open(1); lap.power(1);
    const app = deskApp(lap.screen, "Projekty"), pg = dkProjects(app);
    const pw = wrap(el, 1240, 210); const ph = makePhone(pw, 0, 0, 500); const m = mobApp(ph.screen);
    const pr = mbProjects(m, []);
    const empty = div("mb-m", "Nie masz przypisanych projektów.<br>Poproś kierownika o dodanie do projektu.", pr.cards); empty.style.cssText = "text-align:center;margin-top:60px;line-height:1.5";
    const picks = [0, 3];
    const cards = picks.map(i => div("", projCard(PROJECTS[i]), pr.cards));
    const chips = picks.map(i => { pg.as[i].innerHTML = `<span class="dk-chip">j.kowalski</span>`; return pg.as[i]; });
    return t => {
      picks.forEach((ri, k) => {
        const a = seg(t, .1 + k * .3, .3 + k * .3);
        pg.rows[ri].style.background = `rgba(255,224,102,${.5 * Math.sin(Math.PI * a)})`;
        chips[k].style.opacity = a;
        const c = eo(seg(t, .25 + k * .3, .5 + k * .3)); cards[k].style.opacity = c; cards[k].style.transform = `translateY(${(1 - c) * 24}px)`;
        cards[k].style.display = c > 0 ? "" : "none";
      });
      empty.style.display = t > .25 ? "none" : "";
    };
  }
});

/* 13. one tap */
slide({
  copy: { h: "Po zamontowaniu wystarczy jedno dotknięcie.", p: "Aplikacja zapisuje datę i godzinę montażu. Pomyłkę można cofnąć." },
  dur: 2.2,
  build(el) {
    const d = planData(); const P = scanPhone(el, 1000, 150, 650, d);
    P.sc.scr.style.display = "none"; P.pl.scr.style.transform = "none"; P.pl.sheet.style.transform = "none";
    const tap = div("tap", "", P.ph.screen), btnTxt = P.pl.btn.querySelector("span");
    return t => {
      const a = seg(t, .1, .45); tapAt(tap, P.pl.btn, P.m.root); tapAnim(tap, a);
      const done = t >= .3; d.T.inst = done; planZoom(P, d, 1, true);
      P.pl.dot.style.background = done ? C.mGreen : C.mRed;
      P.pl.stt.textContent = done ? "Zamontowany · 07.10.2026 10:42" : "Niezamontowany";
      P.pl.btn.className = "mb-btn act " + (done ? "out" : "green"); btnTxt.textContent = done ? "Cofnij oznaczenie" : "Oznacz jako zamontowany";
      P.pl.btn.querySelector("svg").style.display = done ? "none" : "";
      P.pl.btn.style.filter = a > .1 && a < .35 ? "brightness(.85)" : "none";
      P.pl.cnt.textContent = done ? "213 / 231 zamontowanych" : "212 / 231 zamontowanych";
    };
  }
});

/* =========================================================
   C. INFORMATION FROM THE SITE
   ========================================================= */

/* 14. the desktop app sees it at once */
slide({
  copy: { h: "Każdy zamontowany element od razu widać w aplikacji desktopowej.", cls: "wide", style: "width:1360px" },
  dur: 3,
  build(el) {
    const LX = 160, LY = 300, LW = 760, LINE = 540;
    const dl = planData(); dl.T.inst = true;
    const lap = makeLaptop(el, LX, LY, LW); lap.open(1); lap.power(1);
    const app = deskApp(lap.screen, "Projekty"), pg = dkPlan(app, dl, { sub: "Zamontowane: 213 / 231" });
    const d = planData(); d.T.inst = true;
    const pw = wrap(el, 1120, 290); const ph = makePhone(pw, 0, 0, 500); const m = mobApp(ph.screen); const pl = mbPlan(m, d, { count: "213 / 231 zamontowanych" });
    pl.code.textContent = "W_01_628S"; pl.sheet.style.transform = "none";
    const vb = [d.T2.x - 190, d.T2.y - 300, 380, 600]; pl.svg.setAttribute("viewBox", vb.join(" "));
    const tap = div("tap", "", ph.screen);
    const o = overlay(el); const ln = svgEl("line", { x1: 1110, y1: LINE, x2: 940, y2: LINE, stroke: C.ink3, "stroke-width": 1.2, "stroke-dasharray": "3 5" }, o);
    const pk = svgEl("circle", { r: 5, cy: LINE, fill: C.green }, o);
    const LS = LW / 880, k = .6156 * LS;
    const ring = svgEl("circle", { r: 10, fill: "none", stroke: C.yel, "stroke-width": 2.5 }, o);
    return t => {
      const a = seg(t, .05, .3); tapAt(tap, pl.btn, m.root); tapAnim(tap, a);
      const done = t >= .2; d.T2.inst = done; d.els.forEach(e => markState(e, e === d.T2 ? "sel" : e.inst ? "inst" : "pend", vb[2] / 1200));
      pl.dot.style.background = done ? C.mGreen : C.mRed; pl.stt.textContent = done ? "Zamontowany · 07.10.2026 10:44" : "Niezamontowany";
      pl.btn.className = "mb-btn act " + (done ? "out" : "green"); pl.btn.querySelector("span").textContent = done ? "Cofnij oznaczenie" : "Oznacz jako zamontowany"; pl.btn.querySelector("svg").style.display = done ? "none" : "";
      pl.cnt.textContent = done ? "214 / 231 zamontowanych" : "213 / 231 zamontowanych";
      const p = eio(seg(t, .25, .55)); pk.setAttribute("cx", lerp(1110, 940, p)); pk.setAttribute("opacity", p > 0 && p < 1 ? 1 : 0); ln.setAttribute("opacity", seg(t, .2, .3) * (1 - seg(t, .8, 1)));
      const arrived = t >= .55; dl.T2.inst = arrived; markState(dl.T2, arrived ? "inst" : "pend");
      if (dl.T2.li) dl.T2.li.querySelector("i").style.background = arrived ? C.mGreen : C.mRed;
      pg.sub.textContent = arrived ? "Zamontowane: 214 / 231" : "Zamontowane: 213 / 231";
      const vp = pg.svg.parentNode, [vx, vy] = offIn(vp, app.root), vw = vp.offsetWidth, vh = vp.offsetHeight;
      const sc = Math.min(vw / 1200, vh / 760), ox = (vw - 1200 * sc) / 2, oy = (vh - 760 * sc) / 2;
      const mx = LX + 46 * LS + (vx + ox + dl.T2.x * sc) * k, my = LY + 16 * LS + (vy + oy + dl.T2.y * sc) * k;
      const r = seg(t, .55, 1); ring.setAttribute("cx", mx); ring.setAttribute("cy", my); ring.setAttribute("r", 8 + 22 * eo(r)); ring.setAttribute("opacity", r > 0 ? 1 - r : 0);
    };
  }
});

/* 15. progress per floor */
slide({
  copy: { h: "Postęp montażu na każdej kondygnacji.", p: "Łatwo zauważyć, na którym piętrze prace się opóźniają." },
  dur: 3.6,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 700 500" }, el); svg.style.cssText = "position:absolute;left:780px;top:200px;width:700px;height:500px";
    const fl = [["+3", 227], ["+2", 228], ["+1", 231], ["Parter", 228]];
    svgEl("line", { x1: 100, y1: 40, x2: 600, y2: 40, stroke: C.ink, "stroke-width": 1.2 }, svg);
    for (let w = 0; w <= 12; w++) { const x = 100 + w / 12 * 500; svgEl("line", { x1: x, y1: 34, x2: x, y2: 46, stroke: C.ink, "stroke-width": 1 }, svg); if (w % 3 === 0) svgText(svg, x, 22, `tydz. ${w}`, { "font-size": 15, fill: C.ink2, "text-anchor": "middle" }); }
    const mk = svgEl("path", { d: "M0 0 l-6 -10 h12 z", fill: C.red }, svg);
    const bars = fl.map(([n], i) => { const y = 110 + i * 92; svgText(svg, 0, y + 20, n, { "font-size": 20, fill: C.ink }); svgEl("rect", { x: 100, y, width: 500, height: 28, fill: "none", stroke: C.hair }, svg); const r = svgEl("rect", { x: 100, y, width: 0, height: 28, fill: C.ink }, svg); const v = svgText(svg, 700, y + 21, "", { "font-size": 18, fill: C.ink, "text-anchor": "end" }); return { r, v, i: 3 - i }; });
    return t => {
      const w = 12 * eio(seg(t, 0, .95)); mk.setAttribute("transform", `translate(${100 + w / 12 * 500},32)`);
      bars.forEach(b => { const f = clamp((w - b.i * 2.5) / 4.2); b.r.setAttribute("width", 500 * f); b.v.textContent = `${Math.round(f * 100)}%`; });
    };
  }
});

/* 16. list of installed elements */
slide({
  copy: { h: "Aktualne zestawienie zamontowanych elementów.", p: "Każda pozycja ma datę montażu, co ułatwia rozliczenie etapu prac." },
  dur: 3,
  build(el) {
    const R = rng(7), rows = []; for (let i = 0; i < 11; i++) { const dd = 1 + Math.floor(i / 2); rows.push([i + 1, (i < 7 ? "W_01_6" + (21 + i) + "S" : "SB_01_6" + (44 + i)), `0${dd}.10.2026 ${String(7 + Math.floor(R() * 8)).padStart(2, "0")}:${String(Math.floor(R() * 60)).padStart(2, "0")}`]); }
    const doc = div("doc", `<div style="padding:18px 14px 6px;font-weight:600;font-size:17px">Zamontowane elementy</div><div style="padding:0 14px 14px;color:${C.ink2};font-size:14px">Budynek B2, kondygnacja +1, 01.10–07.10.2026</div>
      <table><thead><tr><th style="width:50px">Lp.</th><th>Element</th><th style="width:200px">Data montażu</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td style="color:${C.green}">${r[2]}</td></tr>`).join("")}<tr><td></td><td style="color:${C.ink2}">… kolejne 220 pozycji</td><td></td></tr></tbody></table>
      <div style="display:flex;justify-content:space-between;padding:16px 14px 6px;border-top:1.5px solid ${C.ink};margin-top:6px;font-size:17px"><span>Razem zamontowano</span><b class="tot" style="font-variant-numeric:tabular-nums">0 z 231</b></div>`, el);
    doc.style.cssText += "left:840px;top:150px;width:600px;padding-bottom:10px";
    const trs = [...doc.querySelectorAll("tbody tr")], tot = doc.querySelector(".tot");
    return t => {
      trs.forEach((r, i) => { const a = seg(t, i * .06, i * .06 + .1); r.style.opacity = a; r.style.transform = `translateY(${(1 - eo(a)) * 8}px)`; });
      tot.textContent = `${Math.round(231 * eo(seg(t, .3, 1)))} z 231`;
    };
  }
});

/* 17. look up an element */
slide({
  copy: { h: "Po wpisaniu kodu widać, gdzie i kiedy zamontowano element.", p: "Wyszukiwarka działa w aplikacji desktopowej." },
  dur: 2.8,
  build(el) {
    const lap = makeLaptop(el, 700, 230, 780); lap.open(1); lap.power(1);
    const d = planData(); d.T.inst = true;
    const app = deskApp(lap.screen, "Projekty"), pg = dkPlan(app, d, { sub: "Zamontowane: 214 / 231" });
    const items = [...pg.list.children];
    return t => {
      const q = "W_01_627S", n = Math.round(seg(t, .05, .45) * q.length);
      pg.search.textContent = n ? q.slice(0, n) : "Szukaj po kodzie..."; pg.search.classList.toggle("filled", n > 0);
      const typed = q.slice(0, n);
      items.forEach((li, i) => { const e = d.els[i]; li.style.display = !n || e.code.startsWith(typed) ? "" : "none"; li.classList.toggle("sel", n === q.length && e === d.T); });
      const s = t >= .5; d.els.forEach(e => markState(e, s && e === d.T ? "sel" : e.inst ? "inst" : "pend"));
      pg.panel.innerHTML = s ? `Kod: <b>W_01_627S</b><br>Miejsce: kondygnacja +1, oś C/4<br>Status: zamontowany<br>Data montażu: <b>07.10.2026 10:42</b>` : "Kliknij element na planie";
      pg.panel.style.opacity = s ? seg(t, .5, .7) : 1;
    };
  }
});

/* =========================================================
   D. WHAT A WRONG ELEMENT COSTS
   ========================================================= */

/* elevation of a wall panel in a 300 x 200 box; both variants are identical except the window */
function panelSvg(g, x, y, acoustic) {
  const s = svgEl("g", { transform: `translate(${x} ${y})` }, g);
  svgEl("rect", { x: 0, y: 0, width: 300, height: 200, fill: "#fff", stroke: C.ink, "stroke-width": 1.6 }, s);
  svgEl("rect", { x: 130, y: 50, width: 90, height: 100, fill: C.bg, stroke: C.ink, "stroke-width": 1.2 }, s);
  svgEl("line", { x1: 175, y1: 50, x2: 175, y2: 150, stroke: C.ink, "stroke-width": 1 }, s);
  svgEl("rect", { x: 136, y: 56, width: 78, height: 88, fill: "none", stroke: C.ink, "stroke-width": 1 }, s);
  [60, 240].forEach(ax => svgEl("rect", { x: ax - 8, y: -6, width: 16, height: 12, fill: C.ink }, s));
  svgEl("rect", { x: 40, y: 120, width: 18, height: 18, fill: "none", stroke: C.ink, "stroke-width": 1.2 }, s);
  const lab = svgText(s, 175, 176, acoustic ? "okno Rw 42 dB" : "okno Rw 32 dB", { "font-size": 14, fill: C.ink, "text-anchor": "middle", "font-weight": 600 });
  return { s, lab };
}

/* 18. similar elements */
slide({
  copy: { h: "Wiele prefabrykatów wygląda prawie tak samo.", p: "Te dwa elementy różnią się tylko izolacyjnością akustyczną okna. Na budowie łatwo je pomylić." },
  dur: 2.8,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 720 460" }, el); svg.style.cssText = "position:absolute;left:770px;top:230px;width:720px;height:460px";
    const A = panelSvg(svg, 20, 60, 0), B = panelSvg(svg, 400, 60, 1);
    svgText(svg, 170, 300, "W_01_627S", { "font-size": 20, "font-weight": 600, fill: C.ink, "text-anchor": "middle" });
    svgText(svg, 550, 300, "W_01_628S", { "font-size": 20, "font-weight": 600, fill: C.ink, "text-anchor": "middle" });
    // the window labels sit at x 175, y 236 in both panels (60 + 176)
    const ringA = svgEl("rect", { x: 20 + 175 - 62, y: 60 + 158, width: 124, height: 26, rx: 13, fill: "none", stroke: C.ink2, "stroke-width": 1.6, opacity: 0 }, svg);
    const ringB = svgEl("rect", { x: 400 + 175 - 62, y: 60 + 158, width: 124, height: 26, rx: 13, fill: "none", stroke: C.red, "stroke-width": 2.2, opacity: 0 }, svg);
    const note = svgEl("g", { opacity: 0 }, svg);
    svgText(note, 0, 370, "Jedyna różnica: okno o podwyższonej izolacyjności akustycznej.", { "font-size": 19, fill: C.ink });
    svgText(note, 0, 400, "Element z oknem 42 dB ma trafić od strony ulicy.", { "font-size": 19, fill: C.red });
    return t => {
      const a = eo(seg(t, 0, .35)); [A.s, B.s].forEach((g, i) => { g.setAttribute("opacity", a); g.setAttribute("transform", `translate(${i ? 400 : 20} ${60 + (1 - a) * 20})`); });
      ringA.setAttribute("opacity", seg(t, .42, .55)); ringB.setAttribute("opacity", seg(t, .52, .65));
      note.setAttribute("opacity", seg(t, .7, .9));
    };
  }
});

/* 19. the mistake shows up later: acoustic windows on the wrong side */
slide({
  copy: { h: "Pomyłkę często widać dopiero po czasie.", p: "Okna akustyczne mają wychodzić na ulicę. Jeśli elementy zamieniono miejscami, trzeba je zdjąć i zamontować ponownie." },
  dur: 3.6,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 720 580" }, el); svg.style.cssText = "position:absolute;left:770px;top:190px;width:720px;height:580px";
    const BX = 40, BW = 470, TOP = 70, BOT = 330, WX = 275;
    svgText(svg, BX, 40, "podwórze", { "font-size": 17, fill: C.ink2 });
    svgEl("rect", { x: 0, y: 400, width: 720, height: 70, fill: "#DADDDF" }, svg);
    svgEl("line", { x1: 0, y1: 435, x2: 720, y2: 435, stroke: "#fff", "stroke-width": 3, "stroke-dasharray": "26 18" }, svg);
    svgText(svg, 14, 425, "ulica", { "font-size": 17, fill: C.ink2 });
    // building seen from above, double wall lines
    const wall = svgEl("g", { fill: "none", stroke: C.ink, "stroke-width": 1.4 }, svg);
    svgEl("rect", { x: BX, y: TOP, width: BW, height: BOT - TOP }, wall); svgEl("rect", { x: BX + 12, y: TOP + 12, width: BW - 24, height: BOT - TOP - 24 }, wall);
    const win = (y, acoustic) => { const g = svgEl("g", {}, svg); svgEl("rect", { x: WX - 50, y: y - 1, width: 100, height: 14, fill: C.bg }, g); for (let i = 0; i < (acoustic ? 3 : 2); i++) svgEl("line", { x1: WX - 50, y1: y + 3 + i * 4, x2: WX + 50, y2: y + 3 + i * 4, stroke: C.ink, "stroke-width": 1 }, g); return g; };
    win(TOP, true); win(BOT - 12, false);
    svgText(svg, WX, TOP + 44, "W_01_628S · okno akustyczne", { "font-size": 15, fill: C.ink, "text-anchor": "middle" });
    svgText(svg, WX, BOT - 30, "W_01_627S · zwykłe okno", { "font-size": 15, fill: C.ink, "text-anchor": "middle" });
    const waves = [0, 1, 2].map(() => svgEl("path", { fill: "none", stroke: C.ink3, "stroke-width": 1.6 }, svg));
    const badBot = svgEl("rect", { x: WX - 58, y: BOT - 20, width: 116, height: 30, fill: "none", stroke: C.red, "stroke-width": 2.5, opacity: 0 }, svg);
    const badTop = svgEl("rect", { x: WX - 58, y: TOP - 8, width: 116, height: 30, fill: "none", stroke: C.red, "stroke-width": 2.5, opacity: 0 }, svg);
    const ad = `M${WX + 70} ${TOP + 6} C ${BX + BW + 120} ${TOP + 20}, ${BX + BW + 120} ${BOT - 20}, ${WX + 70} ${BOT - 6}`;
    const arrow = svgEl("path", { d: ad, fill: "none", stroke: C.red, "stroke-width": 2, "stroke-dasharray": "6 5" }, svg);
    const aL = arrow.getTotalLength();
    const am = svgEl("mask", { id: "s19m" }, svg); svgEl("rect", { x: 0, y: 0, width: 720, height: 580, fill: "#000" }, am);
    const amp = svgEl("path", { d: ad, fill: "none", stroke: "#fff", "stroke-width": 6 }, am); amp.setAttribute("stroke-dasharray", aL); arrow.setAttribute("mask", "url(#s19m)");
    const arrowLab = svgText(svg, BX + BW + 64, (TOP + BOT) / 2 + 6, "zamienione", { "font-size": 17, fill: C.red, opacity: 0 });
    const t1 = svgText(svg, 0, 520, "Od strony ulicy zamontowano zwykłe okno.", { "font-size": 19, fill: C.ink, opacity: 0 });
    const t2 = svgText(svg, 0, 552, "Element z oknem akustycznym trafił na podwórze.", { "font-size": 19, fill: C.red, opacity: 0 });
    return t => {
      waves.forEach((w, i) => { const q = seg(t, .02 + i * .07, .3 + i * .07); const r = lerp(20, 90, q); w.setAttribute("d", `M${WX - r} 400 A ${r} ${r * .7} 0 0 1 ${WX + r} 400`); w.setAttribute("opacity", q > 0 ? 1 - q : 0); });
      badBot.setAttribute("opacity", seg(t, .35, .45)); t1.setAttribute("opacity", seg(t, .38, .5));
      badTop.setAttribute("opacity", seg(t, .5, .6)); t2.setAttribute("opacity", seg(t, .53, .65));
      amp.setAttribute("stroke-dashoffset", aL * (1 - eio(seg(t, .66, .9)))); arrowLab.setAttribute("opacity", seg(t, .86, 1));
    };
  }
});

/* 20. what a mistake costs, as ranges (crane rates: published 2026 price lists; the rest are estimates) */
const COSTS = [
  ["Dźwig przy zdjęciu i ponownym montażu", "2–6 h, 250–1 200 zł/h z operatorem", 500, 7200],
  ["Ekipa przy poprawce", "4–6 osób, 2–6 h, 50–90 zł/h", 400, 3200],
  ["Przestój ekipy i dźwigu", "od pół dnia do całego dnia", 1800, 14000],
  ["Nowy element, jeśli stary się uszkodzi", "produkcja i transport, element 2–4 m³", 3000, 12000],
];
const COST_MIN = COSTS.reduce((s, c) => s + c[2], 0), COST_MAX = COSTS.reduce((s, c) => s + c[3], 0);
/* an interval: light band between two end markers, opening from the middle */
function intervalMark(svg, y, color) {
  const band = svgEl("rect", { y: y - 6, height: 12, rx: 6, fill: color, "fill-opacity": .22 }, svg);
  const line = svgEl("line", { y1: y, y2: y, stroke: color, "stroke-width": 2 }, svg);
  const a = svgEl("circle", { cy: y, r: 6, fill: color }, svg), b = svgEl("circle", { cy: y, r: 6, fill: color }, svg);
  return (x1, x2, q) => {
    const mid = (x1 + x2) / 2, l = lerp(mid, x1, q), r = lerp(mid, x2, q);
    band.setAttribute("x", l - 6); band.setAttribute("width", Math.max(0, r - l + 12));
    line.setAttribute("x1", l); line.setAttribute("x2", r);
    a.setAttribute("cx", l); b.setAttribute("cx", r);
    [band, line, a, b].forEach(e => e.setAttribute("opacity", q > 0 ? 1 : 0));
  };
}
slide({
  copy: { h: "Poprawka to dźwig, ekipa i stracony czas.", p: "Szacunkowe przedziały kosztów jednej pomyłki. Zależą od dźwigu, wielkości ekipy i tego, czy element przetrwa demontaż." },
  dur: 3.8,
  build(el) {
    const X = 770, W = 710, SX = 360, SW = W - SX - 10, MAX = 15000, sx = v => SX + v / MAX * SW;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} 470` }, el); svg.style.cssText = `position:absolute;left:${X}px;top:150px;width:${W}px;height:470px`;
    [0, 5000, 10000, 15000].forEach(v => { svgEl("line", { x1: sx(v), x2: sx(v), y1: 26, y2: 420, stroke: "#E0E3E5" }, svg); svgText(svg, sx(v), 16, v ? `${v / 1000} tys. zł` : "0", { "font-size": 14, fill: C.ink2, "text-anchor": v === 15000 ? "end" : v ? "middle" : "start" }); });
    const rows = [...COSTS, ["Kary umowne za opóźnienie", "zależnie od umowy", 0, 0]].map((c, i) => {
      const y = 36 + i * 78;
      svgText(svg, 0, y + 22, c[0], { "font-size": 18, fill: C.ink }); svgText(svg, 0, y + 44, c[1], { "font-size": 14, fill: C.ink2 });
      svgEl("line", { x1: 0, x2: W, y1: y + 64, y2: y + 64, stroke: C.hair }, svg);
      if (!c[3]) { // open-ended: no amount, depends on the contract
        const dash = svgEl("line", { x1: sx(0), x2: sx(0), y1: y + 18, y2: y + 18, stroke: C.ink, "stroke-width": 2, "stroke-dasharray": "6 5" }, svg);
        const head = svgEl("path", { d: "M0 -6 L10 0 L0 6", fill: "none", stroke: C.ink, "stroke-width": 2 }, svg);
        const lab = svgText(svg, sx(0), y + 48, "procent wynagrodzenia za każdy dzień opóźnienia", { "font-size": 14, fill: C.ink, "font-weight": 600 });
        return { i, draw: q => { const x2 = lerp(sx(0), sx(MAX) - 10, q); dash.setAttribute("x2", x2); head.setAttribute("transform", `translate(${x2} ${y + 18})`); head.setAttribute("opacity", q > 0 ? 1 : 0); lab.setAttribute("opacity", seg(q, .6, 1)); } };
      }
      const mark = intervalMark(svg, y + 18, i === 3 ? C.red : C.ink);
      const lab = svgText(svg, sx(c[2]), y + 48, `${fmt(c[2])} – ${fmt(c[3])} zł`, { "font-size": 14, fill: C.ink, "font-weight": 600 });
      return { i, draw: q => { mark(sx(c[2]), sx(c[3]), q); lab.setAttribute("opacity", seg(q, .7, 1)); } };
    });
    // the total, as an interval on its own scale
    const tw = 460, tmax = 40000, tx = v => 240 + v / tmax * tw;
    const ts = svgEl("svg", { viewBox: "0 0 710 130" }, el); ts.style.cssText = `position:absolute;left:${X}px;top:640px;width:710px;height:130px`;
    svgText(ts, 0, 34, "Razem jedna pomyłka", { "font-size": 20, fill: C.ink, "font-weight": 600 });
    svgText(ts, 0, 58, "plus ewentualne kary umowne", { "font-size": 14, fill: C.ink2 });
    [0, 20000, 40000].forEach(v => { svgEl("line", { x1: tx(v), x2: tx(v), y1: 14, y2: 62, stroke: "#E0E3E5" }, ts); svgText(ts, tx(v), 92, v ? `${v / 1000} tys.` : "0", { "font-size": 13, fill: C.ink2, "text-anchor": v === tmax ? "end" : v ? "middle" : "start" }); });
    const tot = intervalMark(ts, 38, C.red);
    const tl = svgText(ts, tx(COST_MIN), 122, "", { "font-size": 17, fill: C.ink, "font-weight": 600 });
    return t => {
      rows.forEach(r => r.draw(eo(seg(t, r.i * .13, r.i * .13 + .3))));
      const q = eio(seg(t, .66, 1)); tot(tx(COST_MIN), tx(COST_MAX), q);
      tl.textContent = `${fmt(COST_MIN)} – ${fmt(COST_MAX)} zł`; tl.setAttribute("opacity", seg(t, .85, 1));
    };
  }
});

/* =========================================================
   E. TIME SAVED ON SITE
   ========================================================= */

/* 25. estimated time saved on one building */
slide({
  copy: { h: "Szacujemy, że montaż budynku skróci się o około 6 dni roboczych.", p: "Założenia: 914 elementów, 3 minuty mniej na element, jedna ekipa pracująca 8 godzin dziennie, 80 dni montażu bez aplikacji.", cls: "wide", style: "width:1360px" },
  dur: 3.4,
  build(el) {
    const svg = svgEl("svg", { viewBox: "0 0 1360 460" }, el); svg.style.cssText = "position:absolute;left:120px;top:350px;width:1360px;height:460px";
    const m = { l: 60, r: 20, t: 70, b: 46 }, W = 1360, H = 460, iw = W - m.l - m.r, ih = H - m.t - m.b, DAYS = 86;
    const X = d => m.l + d / DAYS * iw, Y = v => m.t + ih - v / 914 * ih;
    [0, 300, 600, 914].forEach(v => { svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: v ? "#DADDDF" : C.ink, "stroke-width": v ? 1 : 1.2 }, svg); svgText(svg, m.l - 12, Y(v) + 5, v, { "text-anchor": "end", "font-size": 15, fill: C.ink2 }); });
    for (let d = 0; d <= 80; d += 10) svgText(svg, X(d), H - 14, d ? `${d} dni` : "start", { "text-anchor": d ? "middle" : "start", "font-size": 15, fill: C.ink2 });
    // slow start, then a steady pace until the last element, so the end of assembly is a clear point
    const A = .18, curve = (d, end) => { const x = clamp(d / end); return 914 * (x < A ? x * x / (2 * A) : x - A / 2) / (1 - A / 2); };
    const E1 = 74, E0 = 80;
    const pts = end => { const p = []; for (let d = 0; d <= DAYS; d += .5) p.push([X(d), Y(curve(d, end))]); return p; };
    const pathOf = p => p.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" ");
    const p1 = pts(E1), p0 = pts(E0);
    const clip = svgEl("clipPath", { id: "c25" }, svg); const cr = svgEl("rect", { x: 0, y: 0, width: 0, height: H }, clip);
    const g = svgEl("g", { "clip-path": "url(#c25)" }, svg);
    svgEl("path", { d: pathOf(p1) + " " + pathOf([...p0].reverse()).replace("M", "L") + " Z", fill: C.green, "fill-opacity": .12 }, g);
    svgEl("path", { d: pathOf(p0), fill: "none", stroke: C.ink3, "stroke-width": 2, "stroke-dasharray": "7 6" }, g);
    svgEl("path", { d: pathOf(p1), fill: "none", stroke: C.green, "stroke-width": 3 }, g);
    svgText(g, X(30) - 14, Y(curve(30, E1)) - 6, "z FormNest", { "font-size": 18, fill: C.green, "font-weight": 600, "text-anchor": "end" });
    svgText(g, X(46) + 16, Y(curve(46, E0)) + 22, "bez FormNest", { "font-size": 17, fill: C.ink2 });
    const ends = svgEl("g", { opacity: 0 }, svg);
    [[E1, C.green, "74 dni"], [E0, C.ink3, "80 dni"]].forEach(([e, c, l], i) => { svgEl("line", { x1: X(e), x2: X(e), y1: Y(914), y2: Y(0), stroke: c, "stroke-width": 1.2, "stroke-dasharray": "3 4" }, ends); svgEl("circle", { cx: X(e), cy: Y(914), r: 6, fill: c }, ends); svgText(ends, X(e) + (i ? 10 : -10), Y(914) + 26, l, { "font-size": 16, fill: i ? C.ink2 : C.green, "font-weight": 600, "text-anchor": i ? "start" : "end" }); });
    svgEl("path", { d: `M${X(E1)} ${Y(914) - 16} v-10 H${X(E0)} v10`, fill: "none", stroke: C.ink, "stroke-width": 1.4 }, ends);
    svgText(ends, (X(E1) + X(E0)) / 2, Y(914) - 34, "6 dni krócej", { "font-size": 17, fill: C.ink, "text-anchor": "middle", "font-weight": 600 });
    return t => { cr.setAttribute("width", m.l + iw * eio(seg(t, 0, .85)) + 8); ends.setAttribute("opacity", seg(t, .85, 1)); };
  }
});

/* 26. rollout: the steps in text, the apps showing each step next to it */
slide({
  copy: { h: "Wdrożenie trwa około tygodnia." },
  dur: 7, steps: 5, // one press per stage
  build(el) {
    const STEPS = ["Zakładamy konto firmy i pierwszy projekt.", "Państwa zespół wczytuje plany w aplikacji desktopowej.", "Tworzymy konta użytkowników i kody QR do logowania.", "Pokazujemy aplikację ekipie na budowie. Zajmuje to około 30 minut.", "Ekipa skanuje elementy i oznacza montaż."];
    const list = div("", STEPS.map((s, i) => `<div style="display:grid;grid-template-columns:44px 1fr;padding:13px 0;border-top:1px solid ${C.hair};font-size:19px;line-height:1.35"><b style="font-weight:600">${i + 1}</b><span>${s}</span></div>`).join(""), el);
    list.style.cssText = "position:absolute;left:120px;top:300px;width:520px";
    const rows = [...list.children];
    const lap = makeLaptop(el, 704, 330, 516); lap.open(1); lap.power(1);
    const app = deskApp(lap.screen, "Projekty");
    const pProj = dkProjects(app);
    const nr = document.createElement("tr"); nr.innerHTML = `<td><b>Państwa budowa</b></td><td>lokalizacja budowy</td><td></td>`; pProj.rows[0].parentNode.insertBefore(nr, pProj.rows[0]);
    const d = planData(5, 0); const pPlan = dkPlan(app, d, { title: "Państwa budowa", sub: "" });
    const pUsers = dkUsers(app);
    d.els.forEach(e => e.m.setAttribute("opacity", 0));
    const pw = wrap(el, 1250, 230); const ph = makePhone(pw, 0, 0, 480); const m = mobApp(ph.screen);
    const login = mbLogin(m), sc = mbScanner(m, QR_SCENE), pr = mbProjects(m, [["Państwa budowa", "lokalizacja budowy", 0, 231, ""]]);
    const d2 = planData(5, 0); const pl = mbPlan(m, d2, { title: "Kondygnacja +1", count: "0 / 231 zamontowanych" });
    const vb = [d2.T.x - 190, d2.T.y - 300, 380, 600]; pl.svg.setAttribute("viewBox", vb.join(" "));
    const q = sc.scene.querySelector(".q"), tap = div("tap", "", ph.screen);
    return t => {
      const cur = t <= 0 ? -1 : Math.min(4, Math.floor(t * 5 - 1e-9));
      rows.forEach((r, i) => { r.style.opacity = i === cur ? 1 : i < cur ? .55 : .3; });
      // laptop: projects, plan, users, then the plan again when the first element is confirmed
      const page = cur < 1 ? 0 : cur === 1 || cur === 4 ? 1 : 2;
      [pProj.page, pPlan.page, pUsers.page].forEach((p, i) => p.style.display = i === page ? "" : "none");
      app.setNav(["Projekty", "Projekty", "Użytkownicy"][page]);
      nr.style.opacity = seg(t, .03, .12); nr.style.background = `rgba(255,224,102,${.55 * Math.sin(Math.PI * seg(t, .03, .2))})`;
      const shown = Math.round(seg(t, .22, .36) * d.els.length);
      d.els.forEach((e, i) => { const on = i < shown; if (e._on !== on) { e._on = on; e.m.setAttribute("opacity", on ? 1 : 0); } });
      pPlan.sub.textContent = shown ? `znaleziono ${Math.round(shown / d.els.length * 231)} elementów` : "";
      pUsers.modal.style.opacity = seg(t, .44, .5);
      // phone: login, QR scan, projects, plan and the first confirmed element
      const a = eio(seg(t, .64, .72)); q.style.opacity = t > .64 ? 1 : 0;
      q.style.transform = `translate(${lerp(330, 0, a)}px,${lerp(-60, 0, a)}px) scale(${lerp(.7, 1.05, a)})`;
      sc.frame.setAttribute("stroke", t >= .72 ? "#2563EB" : "#fff");
      routes([[login, 0], [sc.scr, .6], [pr.scr, .74], [pl.scr, .82]], t, .04);
      pl.sheet.style.transform = `translateY(${(1 - eo(seg(t, .86, .9))) * 105}%)`;
      const ta = seg(t, .9, .96); tapAt(tap, pl.btn, m.root); tapAnim(tap, ta);
      const done = t >= .93; d2.T.inst = done; d2.els.forEach(e => markState(e, e === d2.T ? "sel" : "pend", vb[2] / 1200));
      pl.dot.style.background = done ? C.mGreen : C.mRed; pl.stt.textContent = done ? "Zamontowany · teraz" : "Niezamontowany";
      pl.btn.className = "mb-btn act " + (done ? "out" : "green"); pl.btn.querySelector("span").textContent = done ? "Cofnij oznaczenie" : "Oznacz jako zamontowany"; pl.btn.querySelector("svg").style.display = done ? "none" : "";
      pl.cnt.textContent = done ? "1 / 231 zamontowanych" : "0 / 231 zamontowanych";
      d.T.inst = t >= .95; markState(d.T, d.T.inst ? "inst" : "pend");
    };
  }
});

/* 27. invitation to a meeting */
slide({
  copy: { h: "Zapraszamy na spotkanie.", p: "Pokażemy, jak FormNest sprawdzi się na Państwa budowie, i odpowiemy na pytania." },
  dur: 3.4,
  build(el) {
    const lap = makeLaptop(el, 700, 300, 540); lap.open(1); lap.power(1);
    const d = planData(5, 0); const app = deskApp(lap.screen, "Projekty"), pg = dkPlan(app, d, { title: "Państwa budowa", sub: "" });
    const pw = wrap(el, 1268, 270); const ph = makePhone(pw, 0, 0, 440); const m = mobApp(ph.screen);
    const pr = mbProjects(m, [["Państwa budowa", "lokalizacja budowy", 0, 231, ""]]);
    const meta = pr.cards.querySelectorAll(".mb-card .mb-m"), cardMeta = meta[meta.length - 1];
    const mail = div("", `<div style="font-size:16px;color:${C.ink2}">Kontakt</div><div style="font-size:30px;font-weight:600;margin-top:4px">kontakt@formnest.pl</div>`, el); mail.style.cssText = "position:absolute;left:120px;top:660px";
    const order = d.els.map((e, i) => i).sort((a, b) => d.els[a].y - d.els[b].y || d.els[a].x - d.els[b].x);
    return t => {
      const p = eio(seg(t, 0, .95)), n = Math.round(p * d.els.length), total = Math.round(p * 231);
      order.forEach((idx, k) => { const e = d.els[idx]; const on = k < n; if (e._on !== on) { e._on = on; e.inst = on; markState(e, on ? "inst" : "pend"); if (e.li) e.li.querySelector("i").style.background = on ? C.mGreen : C.mRed; } });
      pg.sub.textContent = `Zamontowane: ${total} / 231`;
      cardMeta.textContent = `${total} / 231 zamontowanych · 4 plany`;
    };
  }
});
