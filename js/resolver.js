/* ==========================================================
   🎯 MEbank – Motor de Resolución 2025 (compatible con layout.css)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}
};

/* ==========================================================
   🚀 Iniciar resolución
   ========================================================== */
function iniciarResolucion(config) {
  if (!config || !Array.isArray(config.preguntas) || !config.preguntas.length) {
    alert("⚠ No hay preguntas.");
    return;
  }

  stopTimer();

  CURRENT = {
    list: config.preguntas.slice(),
    i: 0,
    modo: config.modo || "general",
    config,
    session: {}
  };

  if (config.usarTimer) initTimer();

  renderPregunta();
}

/* ==========================================================
   🧩 Render pregunta
   ========================================================== */
function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];
  if (!q) return renderFin();

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const estado = CURRENT.session[q.id] || null;

  const opcionesHTML = q.opciones.map((op, idx) => {
    const letra = String.fromCharCode(97 + idx);

    let cls = "";
    if (estado) {
      if (idx === q.correcta) cls = " option-correct";
      else if (estado === "bad" && idx === getRespuestaMarcada(q.id))
        cls = " option-wrong";
    }

    return `
      <label class="q-option${cls}" onclick="answer(${idx})">
        <span class="q-option-letter">${letra})</span>
        <span class="q-option-text">${op}</span>
      </label>
    `;
  }).join("");

  app.innerHTML = `
    <div class="q-layout fade">

      <!-- COLUMNA IZQUIERDA -->
      <div class="q-main">
        <div class="q-card">

          <div class="q-header">
            <div class="q-title">
              <b>${CURRENT.config.titulo || "Práctica"}</b>
              <span class="q-counter">${numero}/${total}</span>
            </div>
            <div class="q-meta">
              <span class="q-materia">${getMateriaNombreForQuestion(q)}</span>
            </div>
          </div>

          <div class="q-enunciado">
            ${q.enunciado}
          </div>

          ${q.imagenes?.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">
            ${opcionesHTML}
          </div>

          <div class="q-nav-row">
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>
              ⬅ Anterior
            </button>

            <button class="btn-small" onclick="nextQuestion()">
              ${CURRENT.i === total - 1 ? "Finalizar ➜" : "Siguiente ➡"}
            </button>

            <button class="btn-small btn-ghost" onclick="salirResolucion()">🏠 Salir</button>
          </div>

        </div>
      </div>

      <!-- SIDEBAR DERECHA -->
      <aside class="q-sidebar">
        <div class="q-sidebar-header"><b>Índice</b></div>
        <div class="q-sidebar-grid">${renderSidebarCells()}</div>
      </aside>

    </div>
  `;
}

/* ==========================================================
   🖼 Imágenes
   ========================================================== */
function renderImagenesPregunta(imgs) {
  return `
    <div class="q-images">
      ${imgs.map(src => `
        <div class="q-image-wrap">
          <img src="${src}" class="q-image">
        </div>
      `).join("")}
    </div>
  `;
}

/* ==========================================================
   🧠 Respuesta
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];

  if (CURRENT.session[q.id]) return;

  const ok = (idx === q.correcta) ? "ok" : "bad";
  CURRENT.session[q.id] = ok;

  setRespuestaMarcada(q.id, idx);

  // Guardamos en PROG
  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = { status: ok, fecha: Date.now() };
  saveProgress();

  renderPregunta();
}

/* ==========================================================
   Navegación
   ========================================================== */
function nextQuestion() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    renderPregunta();
  } else {
    renderFin();
  }
}

function prevQuestion() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    renderPregunta();
  }
}

/* ==========================================================
   FIN
   ========================================================== */
function renderFin() {
  stopTimer();

  const values = Object.values(CURRENT.session);
  const total = CURRENT.list.length;
  const correctas = values.filter(v => v === "ok").length;
  const incorrectas = values.filter(v => v === "bad").length;
  const precision = total ? Math.round(correctas / total * 100) : 0;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>¡Finalizado!</h2>
      <p>Total: <b>${total}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${correctas}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${incorrectas}</p>
      <p><b>Precisión: ${precision}%</b></p>

      <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
    </div>
  `;
}

/* ==========================================================
   Sidebar
   ========================================================== */
function renderSidebarCells() {
  return CURRENT.list.map((q, idx) => {
    const estado = CURRENT.session[q.id] || null;
    const esActual = idx === CURRENT.i;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    if (estado === "bad") cls += " sb-bad";

    return `<div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>`;
  }).join("");
}

function irAPregunta(i) {
  CURRENT.i = i;
  renderPregunta();
}

/* ==========================================================
   TIMER
   ========================================================== */
let TIMER = { interval: null, start: 0, running: false };

function initTimer() {
  TIMER.start = Date.now();
  TIMER.running = true;

  let el = document.getElementById("exam-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "exam-timer";
    el.className = "exam-timer";
    document.body.appendChild(el);
  }

  TIMER.interval = setInterval(() => {
    if (!TIMER.running) return;
    const s = Math.floor((Date.now() - TIMER.start) / 1000);
    el.textContent = "⏱ " +
      String(Math.floor(s / 60)).padStart(2, "0") + ":" +
      String(s % 60).padStart(2, "0");
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  TIMER.running = false;
  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

/* ==========================================================
   Helpers
   ========================================================== */
function getMateriaNombreForQuestion(q) {
  const f = BANK.subjects.find(s => s.slug === q.materia);
  return f ? f.name : q.materia;
}

const RESP_MARCADAS = {};

function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }
