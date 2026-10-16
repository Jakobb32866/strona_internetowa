/* FormNest website: product mock-ups (drawn with ui.js), the plan demo, tabs,
   the desktop app tour, the DXF before/after slider and the contact form. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const installed = d => `${d.els.filter(e => e.inst).length} / ${d.els.length}`;

  /* ---------- mock-up helpers ---------- */
  // a fixed-size design box scaled to the width of its host
  const fitters = new Map();
  const ro = new ResizeObserver(es => es.forEach(e => { const f = fitters.get(e.target); if (f) f(); }));
  function frame(host, w, h) {
    host.style.aspectRatio = `${w} / ${h}`;
    const box = div("frame-box", "", host); box.style.width = w + "px"; box.style.height = h + "px";
    const fit = () => { if (host.clientWidth) box.style.transform = `scale(${host.clientWidth / w})`; };
    fitters.set(host, fit); ro.observe(host); fit();
    return box;
  }
  // desktop app inside a flat window (1280 x 836)
  function deskWindow(parent, active) {
    const w = div("win", `<div class="win-bar"><i></i><i></i><i></i><span>FormNest</span></div><div class="win-body"></div>`, parent);
    return deskApp(w.querySelector(".win-body"), active);
  }
  const phoneApp = (box, x = 0, y = 0, h = 620) => mobApp(makePhone(box, x, y, h).screen);
  // phone plan zoomed on one element, with its sheet
  function focusPhone(pl, d, e) {
    const vb = [e.x - 190, e.y - 300, 380, 600];
    pl.svg.setAttribute("viewBox", vb.join(" "));
    d.els.forEach(x => markState(x, x === e ? "sel" : x.inst ? "inst" : "pend", vb[2] / 1200));
  }
  function sheetState(pl, e) {
    pl.code.textContent = e.code;
    pl.dot.style.background = e.inst ? C.mGreen : C.mRed;
    pl.stt.textContent = e.inst ? `Zamontowany · ${e.at || "07.10.2026 10:42"}` : "Niezamontowany";
    pl.btn.className = "mb-btn act " + (e.inst ? "out" : "green");
    pl.btn.querySelector("span").textContent = e.inst ? "Cofnij oznaczenie" : "Oznacz jako zamontowany";
    pl.btn.querySelector("svg").style.display = e.inst ? "none" : "";
  }
  function dkArchive(app) {
    const rows = [["Budynek A1", "Osiedle Zielona Dolina, Kraków", "902 / 902"], ["Hala magazynowa H0", "Strefa Przemysłowa Wschód, Rzeszów", "388 / 388"]];
    return div("dk-page", `<div class="dk-head"><h1>Archiwum</h1><span class="dk-btn2">Odśwież</span></div>
      <table class="dk-table"><thead><tr><th>Nazwa</th><th>Lokalizacja</th><th>Zamontowane</th><th>Status</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><span class="dk-chip">Zarchiwizowany</span></td></tr>`).join("")}</tbody></table>`, app.main);
  }
  const labelScene = `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#8E9194,#55585B 70%)"></div><div style="position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) rotate(-3deg)">${labelHtml("W_01_627S", 230)}</div>`;

  /* ---------- static mock-ups, by data-mock ---------- */
  const MOCKS = {
    hero(host) {
      const box = frame(host, 960, 700);
      const ww = div("", "", box); ww.style.cssText = "position:absolute;left:0;top:0;transform-origin:0 0;transform:scale(.68)";
      const d = planData(), app = deskWindow(ww, "Projekty");
      dkPlan(app, d, { title: "Kondygnacja +1", sub: `Budynek B2 · zamontowane: ${installed(d)}` });
      const d2 = planData(), m = phoneApp(box, 690, 180, 500), pl = mbPlan(m, d2, { count: `${installed(d2)} zamontowanych` });
      focusPhone(pl, d2, d2.T); sheetState(pl, d2.T); pl.sheet.style.transform = "none";
    },
    crew(host) {
      const box = frame(host, 300, 620), d = planData(), m = phoneApp(box);
      d.T.inst = true;
      const pl = mbPlan(m, d, { count: `${installed(d)} zamontowanych` });
      focusPhone(pl, d, d.T); sheetState(pl, d.T); pl.sheet.style.transform = "none";
    },
    lead(host) {
      const box = frame(host, 1280, 836), d = planData(), app = deskWindow(box, "Projekty");
      const pg = dkPlan(app, d, { title: "Kondygnacja +1", sub: `Budynek B2 · zamontowane: ${installed(d)}` });
      pg.search.textContent = "W_01_627"; pg.search.classList.add("filled");
      [...pg.list.children].forEach((li, i) => { li.style.display = d.els[i].code.startsWith("W_01_627") ? "" : "none"; li.classList.toggle("sel", d.els[i] === d.T); });
      d.els.forEach(e => markState(e, e === d.T ? "sel" : e.inst ? "inst" : "pend"));
      pg.panel.innerHTML = `Kod: <b>W_01_627S</b><br>Status: niezamontowany<br>Pozycja: ${Math.round(d.T.x)}, ${Math.round(d.T.y)}<br><span class="dk-btn2" style="margin-top:8px">Usuń element</span>`;
    },
    // the element from the phone mock-up, as the desktop app shows it after installation
    sync(host) {
      const box = frame(host, 1280, 836), d = planData(), app = deskWindow(box, "Projekty");
      d.T.inst = true;
      const pg = dkPlan(app, d, { title: "Kondygnacja +1", sub: `Budynek B2 · zamontowane: ${installed(d)}` });
      pg.search.textContent = d.T.code; pg.search.classList.add("filled");
      [...pg.list.children].forEach((li, i) => { li.style.display = d.els[i] === d.T ? "" : "none"; li.classList.toggle("sel", d.els[i] === d.T); });
      d.els.forEach(e => markState(e, e === d.T ? "sel" : e.inst ? "inst" : "pend"));
      pg.panel.innerHTML = `Kod: <b>${d.T.code}</b><br>Status: zamontowany<br>Data montażu: <b>07.10.2026 10:42</b>`;
    },
    office(host) {
      const box = frame(host, 1280, 836); dkDashboard(deskWindow(box, "Dashboard"));
    },
    "m-login"(host) { mbLogin(phoneApp(frame(host, 300, 620))); },
    "m-projects"(host) { mbProjects(phoneApp(frame(host, 300, 620)), PROJECTS.slice(0, 3)); },
    "m-scan"(host) {
      const sc = mbScanner(phoneApp(frame(host, 300, 620)), labelScene);
      sc.frame.setAttribute("stroke", "#2563EB"); sc.hint.textContent = "Odczytano kod elementu";
    },
    "m-plan"(host) {
      const d = planData(), pl = mbPlan(phoneApp(frame(host, 300, 620)), d, { count: `${installed(d)} zamontowanych` });
      focusPhone(pl, d, d.T); sheetState(pl, d.T); pl.sheet.style.transform = "none";
    },
  };
  $$("[data-mock]").forEach(h => { const f = MOCKS[h.dataset.mock]; if (f) f(h); });

  /* ---------- tabs ---------- */
  $$("[data-tabs]").forEach(root => {
    const tabs = $$('[role="tab"]', root), panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    const show = (i, focus) => {
      tabs.forEach((t, j) => { const on = i === j; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; panels[j].hidden = !on; });
      if (focus) tabs[i].focus();
      root.dispatchEvent(new CustomEvent("tabchange", { detail: i }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", e => {
        const n = tabs.length, to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (to !== undefined) { e.preventDefault(); show(to, true); }
      });
    });
    root.showTab = show;
  });

  /* ---------- home: mobile / desktop switch ---------- */
  $$("[data-switch]").forEach(root => {
    const tabs = $$('[role="tab"]', root), panes = tabs.map(t => document.getElementById(t.getAttribute("aria-controls"))), vis = $$(".app-vis", root);
    const show = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        panes[j].classList.toggle("is-on", on); panes[j].inert = !on;
        vis[j].classList.toggle("is-on", on);
      });
      root.style.setProperty("--i", i);
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", e => { const to = { ArrowRight: 1, ArrowLeft: 0, Home: 0, End: 1 }[e.key]; if (to !== undefined) { e.preventDefault(); show(to, true); } });
    });
    show(0);
  });

  /* ---------- home: plan demo ---------- */
  const demo = $("#demo-phone");
  if (demo) {
    const box = frame(demo, 300, 620), d = planData(), m = phoneApp(box);
    const pl = mbPlan(m, d, { title: "Kondygnacja +1" });
    const picks = [d.T, d.T2, d.els.find(e => e.code.startsWith("WS_") && !e.inst), d.els.find(e => e.slab && !e.inst)].filter(Boolean);
    const msg = $("#demo-msg"), input = $("#demo-code"), labs = [];
    let vb = [0, 0, 1200, 760], sel = null, raf = 0;
    pl.sheet.style.transition = REDUCED ? "none" : "transform .35s ease";
    pl.btn.setAttribute("role", "button"); pl.btn.tabIndex = -1;
    const count = () => { pl.cnt.textContent = `${installed(d)} zamontowanych`; };
    const paint = () => {
      pl.svg.setAttribute("viewBox", vb.map(v => v.toFixed(1)).join(" "));
      d.els.forEach(e => markState(e, e === sel ? "sel" : e.inst ? "inst" : "pend", vb[2] / 1200));
    };
    const zoom = to => {
      cancelAnimationFrame(raf);
      const from = vb.slice(), t0 = performance.now(), ms = REDUCED ? 1 : 650;
      const step = now => { const q = Math.min(1, (now - t0) / ms); vb = from.map((v, i) => lerp(v, to[i], eio(q))); paint(); if (q < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    const stamp = () => { const n = new Date(), p = x => String(x).padStart(2, "0"); return `${p(n.getDate())}.${p(n.getMonth() + 1)}.${n.getFullYear()} ${p(n.getHours())}:${p(n.getMinutes())}`; };
    const select = e => {
      sel = e; msg.textContent = "";
      zoom(e ? [e.x - 190, e.y - 300, 380, 600] : [0, 0, 1200, 760]);
      if (e) sheetState(pl, e);
      pl.sheet.style.transform = e ? "none" : "translateY(105%)"; pl.btn.tabIndex = e ? 0 : -1;
      labs.forEach(b => b.setAttribute("aria-pressed", b.el === e));
      // on phones the plan sits above the controls: bring it into view
      if (e && innerWidth < 1000) demo.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
    };
    const toggle = () => { if (!sel) return; sel.inst = !sel.inst; sel.at = sel.inst ? stamp() : null; sheetState(pl, sel); paint(); count(); };
    pl.btn.addEventListener("click", toggle);
    pl.btn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    d.els.forEach(e => e.m.addEventListener("click", () => select(e)));
    picks.forEach(e => {
      e.inst = false;
      const b = document.createElement("button"); b.type = "button"; b.className = "lab"; b.el = e; b.setAttribute("aria-pressed", "false");
      b.innerHTML = `<small>Producent-Prefabrykatów Sp. z o.o.</small><span class="lab-row"><b>${e.code}</b><span>${e.slab ? "4,1 t" : "2,9 t"}</span></span>`;
      b.addEventListener("click", () => select(e));
      $(".demo-labels").appendChild(b); labs.push(b);
    });
    // edit distance between two codes (a swap of neighbouring characters counts as one edit)
    const dist = (a, b) => {
      const D = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
      for (let j = 1; j <= b.length; j++) D[0][j] = j;
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
        D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) D[i][j] = Math.min(D[i][j], D[i - 2][j - 2] + 1);
      }
      return D[a.length][b.length];
    };
    const sorted = c => [...c].sort().join("");
    const suggest = code => {
      let best = d.els[0], bd = Infinity;
      // among equally close codes, prefer one made of the same characters (digits typed in the wrong order)
      d.els.forEach(e => { const c = e.code.toUpperCase(), k = dist(code, c) - (sorted(c) === sorted(code) ? .5 : 0); if (k < bd) { bd = k; best = e; } });
      // nothing close enough: offer any element from the plan
      return bd <= Math.max(2, Math.round(code.length * .4)) ? best : d.els[Math.floor(Math.random() * d.els.length)];
    };
    $("#demo-form").addEventListener("submit", ev => {
      ev.preventDefault();
      const code = input.value.trim().toUpperCase();
      if (!code) { msg.textContent = ""; input.focus(); return; }
      const e = d.els.find(x => x.code.toUpperCase() === code);
      if (e) { select(e); return; }
      const hint = suggest(code), b = document.createElement("button");
      b.type = "button"; b.className = "hint"; b.textContent = hint.code;
      b.addEventListener("click", () => { input.value = hint.code; select(hint); });
      msg.textContent = `Na tym planie nie ma elementu „${code}”. Czy chodziło o `;
      msg.append(b, "?");
    });
    $("#demo-reset").addEventListener("click", () => select(null));
    count(); paint();
  }

  /* ---------- product: desktop app tour ---------- */
  const tw = $("#tour-win");
  if (tw) {
    const root = tw.closest("[data-tabs]"), box = frame(tw, 1280, 836), app = deskWindow(box, "Dashboard");
    const d = planData();
    const dash = dkDashboard(app), proj = dkProjects(app);
    const plan = dkPlan(app, d, { title: "Kondygnacja +1", sub: `Budynek B2 · zamontowane: ${installed(d)}` });
    const users = dkUsers(app); users.modal.style.display = "none";
    const pages = [dash.page, proj.page, plan.page, users.page, dkArchive(app)];
    const NAV = ["Dashboard", "Projekty", "Projekty", "Użytkownicy", "Archiwum"];
    const showPage = i => { pages.forEach((p, j) => p.style.display = i === j ? "" : "none"); app.setNav(NAV[i]); };
    root.addEventListener("tabchange", e => showPage(e.detail));
    // clicking inside the window works like the real app
    const go = i => root.showTab(i);
    $$(".dk-nav li", app.root).forEach(li => { const i = { Dashboard: 0, Projekty: 1, Archiwum: 4, "Użytkownicy": 3 }[li.textContent]; if (i !== undefined) li.addEventListener("click", () => go(i)); });
    proj.rows.forEach(r => r.addEventListener("click", () => go(2)));
    $$(".dk-row", dash.page).forEach(r => { r.style.cursor = "pointer"; r.addEventListener("click", () => go(2)); });
    plan.page.querySelector(".dk-btn2").addEventListener("click", () => go(1));
    $$(".dk-btn2", users.page).filter(b => b.textContent === "Kod QR").forEach(b => b.addEventListener("click", () => { users.modal.style.display = ""; }));
    $$(".dk-modal .dk-btn, .dk-modal .dk-btn2", users.page).forEach(b => b.addEventListener("click", () => { users.modal.style.display = "none"; }));
    const pick = e => {
      d.els.forEach(x => markState(x, x === e ? "sel" : x.inst ? "inst" : "pend"));
      [...plan.list.children].forEach((li, i) => li.classList.toggle("sel", d.els[i] === e));
      plan.panel.innerHTML = `Kod: <b>${e.code}</b><br>Status: ${e.inst ? "zamontowany" : "niezamontowany"}<br>Pozycja: ${Math.round(e.x)}, ${Math.round(e.y)}`;
    };
    d.els.forEach(e => { e.m.style.cursor = "pointer"; e.m.addEventListener("click", () => pick(e)); });
    [...plan.list.children].forEach((li, i) => { li.style.cursor = "pointer"; li.addEventListener("click", () => pick(d.els[i])); });
    root.showTab(0);
  }
  // remaining tab groups start on their first tab
  $$("[data-tabs]").forEach(root => { if (!$$('[role="tab"][aria-selected="true"]', root).length) root.showTab(0); });

  /* ---------- product: CAD drawing before / after ---------- */
  const dv = $("#dxf-view");
  if (dv) {
    const before = svgEl("svg", { viewBox: "0 0 1200 760" }, $(".dxf-before", dv));
    drawPlan(before, planData(3, 0), { theme: "paper", markers: false, cadNoise: true });
    const after = svgEl("svg", { viewBox: "0 0 1200 760" }, $(".dxf-after", dv));
    drawPlan(after, planData(3, 0), { theme: "dark", markerR: 9, codes: true });
    const inp = $("input", dv), upd = () => dv.style.setProperty("--pos", inp.value + "%");
    inp.addEventListener("input", upd); upd();
  }

  /* ---------- contact: the building grows with the form, which opens a ready e-mail ---------- */
  const form = $("#meeting-form"), bh = $("#build");
  if (form) {
    const tel = $("#f-tel"), f = id => $("#" + id).value.trim(), digits = () => tel.value.replace(/\D/g, "").length;
    const checkTel = () => tel.setCustomValidity(!tel.value.trim() || digits() >= 9 ? "" : "Proszę podać numer telefonu, co najmniej 9 cyfr.");
    tel.addEventListener("input", checkTel);
    let building = null;

    if (bh) {
      const svg = svgEl("svg", { viewBox: "0 0 780 620" }, bh), parts = isoBuilding(svg), N = parts.length;
      const PER = 29, BASE = PER, ROOF = 7; // the ground floor stands from the start
      const DUR = REDUCED ? 1 : 520, STAG = REDUCED ? 0 : 22;
      const count = $("#build-count"), tag = div("build-tag", "", bh);
      const at = q => q.p.getAttribute("points").split(" ").map(v => v.split(",").map(Number));
      parts.forEach((x, i) => {
        const fl = Math.floor(i / PER), slab = i % PER >= PER - ROOF;
        x.on = false; x.dir = 0; x.t0 = 0; x.p.style.pointerEvents = "none";
        x.code = `${slab ? "SB" : "W"}_0${fl}_${701 + i}${slab ? "" : "S"}`;
        x.where = fl ? `kondygnacja +${fl}` : "parter";
      });
      const ring = svgEl("circle", { r: 0, fill: "none", stroke: C.ink, "stroke-width": 1.4, opacity: 0 }, svg);
      const roof = at(parts[N - 4]); ring.setAttribute("cx", roof.reduce((a, q) => a + q[0], 0) / 4); ring.setAttribute("cy", roof.reduce((a, q) => a + q[1], 0) / 4);
      let raf = 0, ringT = -1, sent = false;
      const frame = now => {
        let busy = false;
        parts.forEach(x => {
          if (!x.dir) return;
          const a = clamp((now - x.t0) / DUR);
          if (x.dir > 0) {
            x.p.setAttribute("opacity", a > 0 ? 1 : 0);
            x.p.setAttribute("transform", `translate(0 ${(-(1 - eo(a)) * 26).toFixed(1)})`);
            x.p.setAttribute("fill", a > 0 && a < 1 ? C.yel : x.fill);
          } else {
            x.p.setAttribute("opacity", 1 - a);
            x.p.setAttribute("transform", `translate(0 ${(-eo(a) * 14).toFixed(1)})`);
          }
          if (a < 1) busy = true; else x.dir = 0;
        });
        if (ringT >= 0) {
          const r = clamp((now - ringT) / 900);
          ring.setAttribute("r", 10 + 80 * eo(r)); ring.setAttribute("opacity", 1 - r);
          if (r < 1) busy = true; else ringT = -1;
        }
        raf = busy ? requestAnimationFrame(frame) : 0;
      };
      const setTarget = n => {
        const now = performance.now();
        let k = 0;
        parts.forEach((x, i) => { if (i < n && !x.on) { x.on = true; x.dir = 1; x.t0 = now + k++ * STAG; x.p.style.pointerEvents = ""; } });
        k = 0;
        for (let i = N - 1; i >= 0; i--) { const x = parts[i]; if (i >= n && x.on) { x.on = false; x.dir = -1; x.t0 = now + k++ * STAG / 2; x.p.style.pointerEvents = "none"; } }
        count.textContent = `Zamontowano ${n} z ${N} elementów`;
        if (!raf) raf = requestAnimationFrame(frame);
      };
      // one character typed in any field installs one element, one deleted character removes one
      const chars = () => ["f-name", "f-company", "f-mail", "f-tel", "f-msg"].reduce((n, id) => n + $("#" + id).value.length, 0);
      const progress = () => { if (!sent) setTarget(Math.min(N, BASE + chars())); };
      form.addEventListener("input", progress); form.addEventListener("change", progress);
      building = { finish: () => { hide(); sent = true; setTarget(N); ringT = performance.now() + (REDUCED ? 0 : 7 * STAG + DUR); if (!raf) raf = requestAnimationFrame(frame); } };
      // the ground floor goes up when the building comes into view
      const start = () => { setTarget(BASE); setTimeout(progress, REDUCED ? 0 : 900); };
      if ("IntersectionObserver" in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); start(); } }, { threshold: .3 }); o.observe(bh); } else start();

      // pointing at an element shows its label
      function hide() { tag.classList.remove("is-on"); }
      let hot = null;
      svg.addEventListener("pointermove", e => {
        const x = parts.find(q => q.p === e.target);
        if (hot && hot !== x && !hot.dir) hot.p.setAttribute("fill", hot.fill);
        if (!x || !x.on || x.dir) { hot = null; hide(); return; }
        hot = x; x.p.setAttribute("fill", C.yel);
        const r = bh.getBoundingClientRect();
        tag.innerHTML = `Producent-Prefabrykatów Sp. z o.o.<b>${x.code}</b>Budynek B2 · ${x.where}`;
        tag.style.left = (e.clientX - r.left) + "px"; tag.style.top = (e.clientY - r.top) + "px";
        tag.classList.add("is-on");
      });
      svg.addEventListener("pointerleave", () => { if (hot && !hot.dir) hot.p.setAttribute("fill", hot.fill); hot = null; hide(); });
    }

    // sent through FormSubmit (formsubmit.co): no account, the first message has to be activated from the main address.
    // For now jaszoch@gmail.com is the main address and kontakt@formnest.pl gets a copy, until that mailbox exists.
    const ENDPOINT = "https://formsubmit.co/ajax/jaszoch@gmail.com", COPY = "kontakt@formnest.pl";
    const send = $("#f-send"), status = $("#form-done");
    const say = (html, err) => { status.innerHTML = html; status.classList.toggle("is-error", !!err); status.hidden = false; };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      checkTel();
      if (!form.reportValidity()) return;
      const pref = form.querySelector('input[name="pref"]:checked').value;
      const data = {
        "Imię i nazwisko": f("f-name"), "Firma": f("f-company"), "E-mail": f("f-mail"), "Telefon": f("f-tel"),
        "Preferowana forma kontaktu": pref, "Wiadomość": f("f-msg") || "(brak)",
        _subject: `Spotkanie FormNest: ${f("f-company")}`, _replyto: f("f-mail"), _cc: COPY, _template: "table", _honey: $("#f-honey").value,
      };
      send.disabled = true; send.textContent = "Wysyłanie…"; status.hidden = true;
      try {
        const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) !== "true") throw new Error(json.message || res.status);
        form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
        send.textContent = "Wysłano";
        say("<b>Dziękujemy, wiadomość została wysłana.</b>Odezwiemy się, żeby ustalić termin spotkania.");
        if (building) building.finish();
        // on phones the building is above the form: show the roof going up
        if (bh && innerWidth < 1000) bh.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
      } catch (err) {
        send.disabled = false; send.textContent = "Wyślij";
        say('<b>Nie udało się wysłać wiadomości.</b>Prosimy spróbować ponownie albo napisać na adres <a href="mailto:kontakt@formnest.pl">kontakt@formnest.pl</a>.', true);
      }
    });
  }

  /* ---------- header ---------- */
  const top = $("#top"), mark = () => top.classList.toggle("is-scrolled", scrollY > 4);
  addEventListener("scroll", mark, { passive: true }); mark();
  const menu = $("#menu"), mb = $(".menu-btn");
  const openMenu = o => { menu.classList.toggle("is-open", o); mb.setAttribute("aria-expanded", o); };
  mb.addEventListener("click", () => openMenu(!menu.classList.contains("is-open")));
  menu.addEventListener("click", e => { if (e.target.closest("a")) openMenu(false); });
  // a tap anywhere outside the header closes the open menu
  document.addEventListener("click", e => { if (menu.classList.contains("is-open") && !top.contains(e.target)) openMenu(false); });
  addEventListener("resize", () => { if (innerWidth >= 720 && menu.classList.contains("is-open")) openMenu(false); }, { passive: true });
  addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("is-open")) { openMenu(false); mb.focus(); } });

  /* ---------- Polish typesetting: no one-letter words or short numbers at line ends ---------- */
  const ORPHAN = /(^|[\s(„])([aiouwzAIOUWZ]|\d{1,3})\s+(?=\S)/g;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest("script,style,svg,.frame-box,.dk,.mb,option,textarea") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n; (n = walk.nextNode());) {
    let t = n.nodeValue, prev;
    do { prev = t; t = t.replace(ORPHAN, "$1$2 "); } while (t !== prev);
    if (t !== n.nodeValue) n.nodeValue = t;
  }
})();
