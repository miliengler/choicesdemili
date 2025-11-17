/* ==========================================================
   ⏱ MEbank 3.0 – Timer simple para modo examen
   ========================================================== */

let TIMER = {
  interval: null,
  start: 0,
  running: false,
  elapsed: 0,
};

/* ----------------------------------------------------------
   ▶ Iniciar timer
   ---------------------------------------------------------- */
function initTimer() {
  // Evitar duplicados
  stopTimer();

  TIMER.start = Date.now();
  TIMER.running = true;
  TIMER.elapsed = 0;

  // Crear elemento si no existe
  let el = document.getElementById("exam-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "exam-timer";
    el.className = "exam-timer";
    el.style.position = "fixed";
    el.style.top = "10px";
    el.style.right = "14px";
    el.style.padding = "6px 10px";
    el.style.background = "#0f172a";
    el.style.color = "#ffffff";
    el.style.fontSize = "14px";
    el.style.borderRadius = "6px";
    el.style.zIndex = "9999";
    el.textContent = "⏱ 00:00";
    document.body.appendChild(el);
  }

  // Intervalo
  TIMER.interval = setInterval(() => {
    if (!TIMER.running) return;

    TIMER.elapsed = Date.now() - TIMER.start;

    const s = Math.floor(TIMER.elapsed / 1000);
    const m = Math.floor(s / 60);
    const mm = String(m).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");

    el.textContent = `⏱ ${mm}:${ss}`;
  }, 1000);
}

/* ----------------------------------------------------------
   ⏹ Detener timer
   ---------------------------------------------------------- */
function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  TIMER.running = false;

  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}
