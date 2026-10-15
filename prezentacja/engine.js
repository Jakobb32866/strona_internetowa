/* Deck engine. Each press is one beat: the slide arrives, then its animation plays.
   A slide with `steps: n` splits its animation into n beats (one press per stage).
   Keyboard first (arrows, space, Enter, PageUp/Down, Home/End), then click, wheel and swipe. */
(function () {
  const stage = document.getElementById("stage"), track = document.getElementById("track");
  const MOVE = 900; // ms, slide-to-slide
  const slides = SLIDES.map((def, i) => {
    const el = document.createElement("section"); el.className = "slide"; el.dataset.i = i;
    const inner = document.createElement("div"); inner.className = "inner"; el.appendChild(inner);
    inner.innerHTML = `<div class="copy ${def.copy.cls || ""}" style="${def.copy.style || ""}"><h2>${def.copy.h}</h2>${def.copy.p ? `<p>${def.copy.p}</p>` : ""}</div>`;
    track.appendChild(el);
    return { def, el, inner, t: -1, render: null };
  });
  slides.forEach(s => { s.render = s.def.build(s.inner); setT(s, 0); });
  function setT(s, t) { if (s.t === t) return; s.t = t; s.render(t); }

  // beat list: [slide index, stage k of n]; k = 0 means the slide has just arrived
  const BEATS = [];
  slides.forEach((s, i) => { const n = s.def.steps || 1; for (let k = 0; k <= n; k++) BEATS.push({ i, k, n }); });
  const N = BEATS.length;
  let beat = 0, busy = false, queued = 0, tw = null;
  const count = document.getElementById("count"), prog = document.querySelector("#prog i");

  // The stage takes the window's proportions, so it always fills the screen;
  // the 1600x900 composition is centred inside it and scaled to fit.
  // The deck is always shown in landscape: in any window taller than wide (a phone held upright,
  // a narrow browser window) the whole deck is turned a quarter clockwise.
  const view = document.getElementById("view");
  let H = 900, rot = false;
  function fit() {
    rot = innerHeight > innerWidth;
    const vw = rot ? innerHeight : innerWidth, vh = rot ? innerWidth : innerHeight, ar = vw / vh;
    view.classList.toggle("rot", rot);
    view.style.width = rot ? vw + "px" : ""; view.style.height = rot ? vh + "px" : "";
    const W = Math.max(1600, 900 * ar); H = Math.max(900, 1600 / ar);
    stage.style.width = W + "px"; stage.style.height = H + "px";
    stage.style.setProperty("--W", W + "px"); stage.style.setProperty("--H", H + "px");
    stage.style.transform = `scale(${vw / W})`;
  }
  addEventListener("resize", () => { fit(); place(BEATS[beat].i, false); }); fit();

  function hud() {
    const i = BEATS[beat].i;
    count.textContent = `${String(i + 1).padStart(2, "0")} / ${slides.length}`;
    prog.style.width = ((beat + 1) / N * 100) + "%";
    history.replaceState(null, "", "#" + (beat + 1));
  }
  function place(i, animate) {
    track.style.transition = animate ? `transform ${MOVE}ms cubic-bezier(.65,0,.35,1)` : "none";
    track.style.transform = `translateY(${-i * H}px)`;
    slides.forEach((s, k) => s.el.classList.toggle("on", k === i));
    // keep only neighbours rendered by the compositor
    slides.forEach((s, k) => s.el.style.visibility = Math.abs(k - i) <= 1 ? "" : "hidden");
  }

  function tween(s, to, dur, done) {
    tw = { s, from: s.t, to, dur: Math.max(.05, dur * Math.abs(to - s.t)), el: 0, last: performance.now(), speed: 1, done };
    requestAnimationFrame(loop);
  }
  function loop(now) {
    if (!tw) return;
    const dt = (now - tw.last) / 1000; tw.last = now; tw.el += dt * tw.speed;
    const q = Math.min(1, tw.el / tw.dur);
    setT(tw.s, lerp(tw.from, tw.to, q));
    if (q >= 1) { const d = tw.done; tw = null; d(); return; }
    requestAnimationFrame(loop);
  }

  function finish() { busy = false; if (queued) { const q = queued; queued = 0; step(q); } }
  function step(dir) {
    if (busy) { queued = dir; if (tw) tw.speed = Math.max(tw.speed, (tw.dur - tw.el) / .22); return; }
    const to = beat + dir; if (to < 0 || to >= N) return;
    const A = BEATS[beat], B = BEATS[to], j = B.i;
    busy = true; beat = to; hud();
    if (A.i === B.i) {                    // animation stage inside one slide
      const s = slides[j];
      tween(s, B.k / B.n, dir > 0 ? s.def.dur : s.def.dur * .45, finish);
    } else {                              // move to the neighbouring slide
      setT(slides[j], dir > 0 ? 0 : 1);
      place(j, true);
      setTimeout(finish, MOVE + 20);
    }
  }
  function jump(b) {
    tw = null; busy = false; queued = 0;
    beat = clamp(b, 0, N - 1); const B = BEATS[beat], j = B.i;
    slides.forEach((s, k) => setT(s, k < j ? 1 : k > j ? 0 : B.k / B.n));
    place(j, false); hud();
  }

  addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" && !["ArrowDown", "ArrowUp", " ", "Enter", "PageDown", "PageUp"].includes(e.key)) return;
    const k = e.key;
    if (k === "f" || k === "F") { e.preventDefault(); toggleFull(); return; }
    if (k === "Home" || k === "End") { e.preventDefault(); jump(k === "Home" ? 0 : N - 1); return; }
    const fwd = k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === "Enter" || (k === " " && !e.shiftKey);
    const back = k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey);
    if (!fwd && !back) return;
    e.preventDefault(); if (e.repeat) return;
    step(fwd ? 1 : -1);
  });
  document.getElementById("next").onclick = e => { e.stopPropagation(); step(1); };
  document.getElementById("prev").onclick = e => { e.stopPropagation(); step(-1); };
  function toggleFull() {
    const d = document, de = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (de.requestFullscreen || de.webkitRequestFullscreen).call(de);
  }
  document.getElementById("full").onclick = e => { e.stopPropagation(); toggleFull(); };
  document.getElementById("view").addEventListener("click", e => { if (e.target.closest(".no-adv,button,input,a")) return; step(1); });

  // wheel / trackpad: one step per gesture
  let wheelLock = false, wheelTimer = 0;
  addEventListener("wheel", e => {
    if (e.target.closest && e.target.closest(".no-adv")) return;
    e.preventDefault();
    clearTimeout(wheelTimer); wheelTimer = setTimeout(() => wheelLock = false, 220);
    if (wheelLock || Math.abs(e.deltaY) < 8) return;
    wheelLock = true; step(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  let ty = null;
  addEventListener("touchstart", e => { ty = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  addEventListener("touchend", e => {
    if (!ty) return;
    let dx = e.changedTouches[0].clientX - ty[0], dy = e.changedTouches[0].clientY - ty[1]; ty = null;
    if (rot) [dx, dy] = [dy, -dx]; // screen movement expressed in the turned deck's own directions
    const d = Math.abs(dy) > Math.abs(dx) ? dy : dx; if (Math.abs(d) > 40) step(d < 0 ? 1 : -1);
  });

  window.deck = { jump, step, slides, BEATS, get beat() { return beat; } };
  jump((parseInt(location.hash.slice(1)) || 1) - 1);
  document.fonts && document.fonts.ready.then(() => slides.forEach(s => { const t = s.t; s.t = -1; setT(s, t); }));
})();
