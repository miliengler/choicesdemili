/* ========== 🔹 CRONÓMETRO UNIVERSAL (modular) – Estilo B (barra inferior del card) ========== */
let TIMER = {
  interval: null,
  startTime: 0,
  elapsed: 0,
  running: false
};

/**
 * Inicia un cronómetro visible dentro del contenedor indicado (por defecto "app").
 * @param {string} containerId - ID del contenedor donde insertar el cronómetro.
 */
function initTimer(containerId = "app") {
  const container = document.getElementById(containerId);
  if (!container) return;

  TIMER.elapsed = 0;
  TIMER.running = false;
  clearInterval(TIMER.interval);

  // 🔹 Crear UI del cronómetro (en la parte inferior del card)
  const timerBox = document.createElement("div");
  timerBox.id = "timerBox";
  timerBox.style = `
    text-align:center;
    margin-top:14px;
    color:var(--muted);
    font-size:14px;
    font-weight:600;
  `;
  timerBox.innerHTML = `⏱️ <span id="timerDisplay">00:00:00</span>`;

  // se agrega al final del contenedor principal
  container.append(timerBox);

  startTimer();
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
}

function updateTimer() {
  TIMER.elapsed = Date.now() - TIMER.startTime;
  const el = document.getElementById("timerDisplay");
  if (el) el.textContent = formatTime(TIMER.elapsed);
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
