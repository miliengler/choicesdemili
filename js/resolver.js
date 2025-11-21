/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución de preguntas
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
    alert("⚠ No hay preguntas para resolver.");
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
   🧩 Renderizar pregunta
   ========================================================== */
function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];

  if (!q) return renderFin();

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const materiaNombre = getMateriaNombreForQuestion(q);
  const estado = CURRENT.session[q.id] || null;

  const opcionesHTML = q.opciones.map((op, idx) => {
    const letra = String.fromCharCode(97 + idx);

    let cls = "option";
    if (estado) {
      if (idx === q.correcta) cls += " option-correct";
      else if (idx === getRespuestaMarcada(q.id)) cls += " option-wrong";
    }

    return `
      <div class="${cls}" onclick="answer(${idx})">
        <b>${letra})</b> ${op}
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="resolver-layout">

      <!-- Pregunta -->
      <div class="resolver-main">
        <div class="resolver-card">

          <div class="resolver-header">
            <div class="resolver-title">
              <b>${CURRENT.config.titulo}</b>
              <span>${numero}/${total}</span>
            </div>
            <div class="resolver-materia">${materiaNombre || ""}</div>
          </div>

          <div class="resolver-enunciado">
            ${q.enunciado}
          </div>

          ${q.imagenes?.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="resolver-opciones">
            ${opcionesHTML}
          </div>

          <div class="resolver-nav">
            <button class="btn-small" onclick="prevQuestion()" 
                    ${CURRENT.i === 0 ? "disabled" : ""}>
              ⬅ Anterior
            </button>

            <button class="btn-small" onclick="nextQuestion()">
              ${CURRENT.i === total - 1 ? "Finalizar ➜" : "Siguiente ➡"}
            </button>

            <button class="btn-small btn-ghost" onclick="salirResolucion()">
              🏠 Salir
            </button>
          </div>

        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="resolver-sidebar">
        <div class="sidebar-title">Índice</div>
        <div class="sidebar-grid">
          ${renderSidebarCells()}
        </div>
      </div>

    </div>
  `;
}

/* ==========================================================
   🖼 Imágenes
   ========================================================== */
function renderImagenesPregunta(arr) {
  return `
    <div class="resolver-imgs">
      ${arr.map(src => `<img src="${src}" class="resolver-img">`).join("")}
    </div>
  `;
}

/* ==========================================================
   🧠 Responder
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  if (CURRENT.session[q.id]) return;

  const correct = (idx === q.correcta);
  CURRENT.session[q.id] = correct ? "ok" : "bad";
  setRespuestaMarcada(q.id, idx);

  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = {
    status: correct ? "ok" : "bad",
    fecha: Date.now()
  };
  saveProgress();

  renderPregunta();
}

/* ==========================================================
   ⏭ Navegación
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
   🏁 Fin
   ========================================================== */
function renderFin() {
  stopTimer();
  const total = CURRENT.list.length;
  const cor = Object.values(CURRENT.session).filter(v => v === "ok").length;
  const bad = total - cor;
  const prec = Math.round(cor / total * 100);

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>${CURRENT.config.titulo}</h2>
      <p><b>${total}</b> preguntas</p>
      <p style="color:#16a34a;">✔ Correctas: ${cor}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
      <p><b>Precisión:</b> ${prec}%</p>

      <button class="btn-main" onclick="renderHome()" style="margin-top:16px;">
        🏠 Volver al inicio
      </button>
    </div>
  `;
}

/* ==========================================================
   🔎 Sidebar
   ========================================================== */
function renderSidebarCells() {
  return CURRENT.list.map((q, idx) => {
    const estado = CURRENT.session[q.id];
    const active = idx === CURRENT.i;

    let cls = "sb-item";
    if (active) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    else if (estado === "bad") cls += " sb-bad";

    return `
      <div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>
    `;
  }).join("");
}

function irAPregunta(i) {
  CURRENT.i = i;
  renderPregunta();
}

/* ==========================================================
   🕒 Timer
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

  el.textContent = "⏱ 00:00";

  TIMER.interval = setInterval(() => {
    if (!TIMER.running) return;

    const diff = Date.now() - TIMER.start;
    el.textContent = "⏱ " + formatTimer(diff);
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  TIMER.running = false;

  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

function formatTimer(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

/* ==========================================================
   📝 Helpers
   ========================================================== */
const RESP_MARCADAS = {};
function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }

function getMateriaNombreForQuestion(q) {
  const m = BANK.subjects.find(s => s.slug === q.materia);
  return m ? m.name : "";
}
