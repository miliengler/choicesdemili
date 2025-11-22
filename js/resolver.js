/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (versión estable)
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
    config: config,
    session: {}
  };

  if (config.usarTimer) initTimer();

  renderPregunta();
}

/* ==========================================================
   🧩 Helper: obtener opciones en formato array
   - Soporta:
   - q.opciones = [ "op1", "op2", ... ]
   - q.a, q.b, q.c, q.d
   ========================================================== */
function getOpcionesArray(q) {
  if (Array.isArray(q.opciones) && q.opciones.length) {
    return q.opciones;
  }

  // Soportar formato viejo a/b/c/d
  const posibles = [q.a, q.b, q.c, q.d].filter(v => v != null && v !== "");
  if (posibles.length) return posibles;

  return []; // sin opciones
}

/* ==========================================================
   🧩 Helper: índice correcto (0–3) aunque venga como "a"/"b"/"c"/"d"
   ========================================================== */
function getCorrectIndex(q) {
  let c = q.correcta;

  if (typeof c === "string") {
    const mapa = { a: 0, b: 1, c: 2, d: 3 };
    const key = c.trim().toLowerCase();
    return mapa[key] ?? 0;
  }

  if (typeof c === "number") return c;

  return 0;
}

/* ==========================================================
   🧩 Render Pregunta
   ========================================================== */
function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];

  if (!q) return renderFin();

  window.scrollTo({ top: 0, behavior: "smooth" });

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const materiaNombre = getMateriaNombreForQuestion(q);

  const estado = CURRENT.session[q.id] || null;
  const marcada = getRespuestaMarcada(q.id);

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q);

  /* ------ OPCIONES ------ */
  const opcionesHTML = opciones.map((op, idx) => {
    let cls = "q-option";

    if (estado) {
      if (idx === correctIndex) cls += " option-correct";
      else if (marcada === idx && estado === "bad") cls += " option-wrong";
    }

    return `
      <label class="${cls}" onclick="answer(${idx})">
        <span class="q-option-letter">${String.fromCharCode(97 + idx)})</span>
        <span class="q-option-text">${op}</span>
      </label>
    `;
  }).join("");

  /* ------ HTML COMPLETO ------ */
  app.innerHTML = `
    <div class="q-layout fade">

      <div class="q-main">
        <div class="q-card">

          <div class="q-header">
            <div class="q-title">
              <b>${CURRENT.config.titulo || "Resolución"}</b>
              <span class="q-counter">${numero}/${total}</span>
            </div>
            <div class="q-meta">
              <span class="q-materia">${materiaNombre || ""}</span>
            </div>
          </div>

          <div class="q-enunciado">${q.enunciado || ""}</div>

          ${q.imagenes && q.imagenes.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">
            ${opcionesHTML || `<p style="color:#94a3b8;font-size:14px;">(Pregunta sin opciones definidas)</p>`}
          </div>

          <div class="q-nav-row">
            <button class="btn-small"
                    onclick="prevQuestion()"
                    ${CURRENT.i === 0 ? "disabled" : ""}>
              ⬅ Anterior
            </button>

            <button class="btn-small"
                    onclick="nextQuestion()">
              ${CURRENT.i === total - 1 ? "Finalizar ➜" : "Siguiente ➡"}
            </button>

            <button class="btn-small btn-ghost"
                    onclick="salirResolucion()">
              🏠 Salir
            </button>
          </div>
        </div>
      </div>

      <aside class="q-sidebar">
        <div class="q-sidebar-header"><b>Índice</b></div>
        <div class="q-sidebar-grid">
          ${renderSidebarCells()}
        </div>
      </aside>

    </div>
  `;
}

/* ==========================================================
   🖼 Imágenes
   ========================================================== */
function renderImagenesPregunta(imgs) {
  if (!Array.isArray(imgs) || !imgs.length) return "";
  return `
    <div class="q-images">
      ${imgs.map(src => `
        <div class="q-image-wrap">
          <img class="q-image" src="${src}">
        </div>`).join("")}
    </div>
  `;
}

/* ==========================================================
   🧠 Responder
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  // no permitir cambiar respuesta en la misma sesión
  if (CURRENT.session[q.id]) return;

  const correctIndex = getCorrectIndex(q);
  const esCorrecta = idx === correctIndex;
  const estado = esCorrecta ? "ok" : "bad";

  CURRENT.session[q.id] = estado;
  setRespuestaMarcada(q.id, idx);

  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = { status: estado, fecha: Date.now() };
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
  const values = Object.values(CURRENT.session);
  const ok = values.filter(v => v === "ok").length;
  const bad = total - ok;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>${CURRENT.config.titulo || "Finalizado"}</h2>
      <p>Total: <b>${total}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>

      <div style="margin-top:20px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🚪 Salir
   ========================================================== */
function salirResolucion() {
  if (!confirm("¿Seguro que querés salir?")) return;
  stopTimer();
  renderHome();
}

/* ==========================================================
   🕒 Timer
   ========================================================== */
let TIMER = { interval: null, start: 0 };

function initTimer() {
  TIMER.start = Date.now();

  let el = document.getElementById("exam-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "exam-timer";
    el.className = "exam-timer";
    document.body.appendChild(el);
  }

  el.textContent = "⏱ 00:00";

  TIMER.interval = setInterval(() => {
    const ms = Date.now() - TIMER.start;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    const t = `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    const box = document.getElementById("exam-timer");
    if (box) box.textContent = "⏱ " + t;
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) {
    clearInterval(TIMER.interval);
    TIMER.interval = null;
  }
  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

/* ==========================================================
   📊 Sidebar
   ========================================================== */
function renderSidebarCells() {
  return CURRENT.list.map((q, idx) => {
    const estado = CURRENT.session[q.id];
    const esActual = idx === CURRENT.i;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    if (estado === "bad") cls += " sb-bad";

    return `<div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>`;
  }).join("");
}

function irAPregunta(idx) {
  if (idx < 0 || idx >= CURRENT.list.length) return;
  CURRENT.i = idx;
  renderPregunta();
}

/* ==========================================================
   Helpers
   ========================================================== */
const RESP_MARCADAS = {};
function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }

function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";
  const mat = BANK.subjects.find(s => s.slug === q.materia);
  return mat ? mat.name : q.materia;
}
