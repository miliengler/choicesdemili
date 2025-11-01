/* ========== 🔹 CRONÓMETRO UNIVERSAL (modular) ========== */
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

  // Crear UI del cronómetro
  const timerBox = document.createElement("div");
  timerBox.id = "timerBox";
  timerBox.style = `
    display:flex;
    align-items:center;
    justify-content:space-between;
    background:var(--soft);
    border:1px solid var(--line);
    border-radius:12px;
    padding:8px 14px;
    margin:12px auto;
    max-width:280px;
    font-weight:600;
  `;

  timerBox.innerHTML = `
    <span id="timerDisplay">🕐 00:00:00</span>
    <div style="display:flex;gap:6px;">
      <button class="btn-small" id="pauseBtn">⏸️</button>
      <button class="btn-small" id="resetBtn">🔄</button>
      <button class="btn-small" id="stopBtn">✖️</button>
    </div>
  `;

  container.prepend(timerBox);
  startTimer();

  document.getElementById("pauseBtn").onclick = togglePause;
  document.getElementById("resetBtn").onclick = resetTimer;
  document.getElementById("stopBtn").onclick = stopTimer;
}

/* ========== Lógica interna ========== */
function startTimer() {
  TIMER.startTime = Date.now() - TIMER.elapsed;
  TIMER.running = true;
  TIMER.interval = setInterval(updateTimer, 1000);
}

function togglePause() {
  if (TIMER.running) {
    TIMER.running = false;
    clearInterval(TIMER.interval);
    document.getElementById("pauseBtn").textContent = "▶️";
  } else {
    startTimer();
    document.getElementById("pauseBtn").textContent = "⏸️";
  }
}

function resetTimer() {
  TIMER.elapsed = 0;
  TIMER.startTime = Date.now();
  updateTimer();
}

function stopTimer() {
  clearInterval(TIMER.interval);
  TIMER.running = false;
  const total = formatTime(TIMER.elapsed);
  const el = document.getElementById("timerDisplay");
  if (el) el.textContent = `✅ Tiempo total: ${total}`;
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  document.getElementById("stopBtn").disabled = true;
}

function updateTimer() {
  TIMER.elapsed = Date.now() - TIMER.startTime;
  const el = document.getElementById("timerDisplay");
  if (el) el.textContent = "🕐 " + formatTime(TIMER.elapsed);
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
