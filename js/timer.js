/* ========== 🔹 CRONÓMETRO UNIVERSAL (modular) – Estilo C (flotante circular) ========== */
let TIMER = {
  interval: null,
  startTime: 0,
  elapsed: 0,
  running: false
};

/**
 * Inicia un cronómetro visible, flotante arriba a la derecha.
 */
function initTimer(containerId = "app") {
  const container = document.getElementById(containerId);
  if (!container) return;

  TIMER.elapsed = 0;
  TIMER.running = false;
  clearInterval(TIMER.interval);

  // 🔹 Crear el círculo flotante
  const timerCircle = document.createElement("div");
  timerCircle.id = "timerCircle";
  timerCircle.style = `
    position:fixed;
    top:12px;
    right:16px;
    width:50px;
    height:50px;
    border-radius:50%;
    background:#1e3a8a;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:600;
    font-size:13px;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
    z-index:999;
    cursor:pointer;
    transition:opacity 0.3s;
  `;
  timerCircle.innerHTML = `<span id="timerDisplay">00:00</span>`;

  document.body.append(timerCircle);
  startTimer();

  // 🔸 Toque para pausar/reanudar
  timerCircle.onclick = () => {
    if (TIMER.running) {
      clearInterval(TIMER.interval);
      TIMER.running = false;
      timerCircle.style.opacity = 0.5;
    } else {
      startTimer();
      timerCircle.style.opacity = 1;
    }
  };
}

/* ========== Lógica interna ========== */
function startTimer() {
  TIMER.startTime = Date.now() - TIMER.elapsed;
  TIMER.running = true;
  TIMER.interval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(TIMER.interval);
  TIMER.running = false;
  const el = document.getElementById("timerCircle");
  if (el) el.remove(); // elimina el círculo al terminar
}

function updateTimer() {
  TIMER.elapsed = Date.now() - TIMER.startTime;
  const el = document.getElementById("timerDisplay");
  if (el) el.textContent = formatTimeShort(TIMER.elapsed);
}

function formatTimeShort(ms) {
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}
