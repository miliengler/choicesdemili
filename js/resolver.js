/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución de preguntas (FINAL)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}
};

/* ==========================================================
   🚀 Iniciar una resolución
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
   🧩 Renderizar una pregunta
   ========================================================== */

function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];
  if (!q) return renderFin();

  window.scrollTo({ top: 0, behavior: "smooth" });

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const estado = CURRENT.session[q.id] || null;
  const materiaNombre = getMateriaNombreForQuestion(q);

  /* ---------- GENERAR OPCIONES (compatible con tu CSS) ---------- */
  const opcionesHTML = q.opciones.map((op, idx) => {
    const letra = String.fromCharCode(97 + idx);

    let cls = "option";
    if (estado) {
      const esCorrecta = idx === q.correcta;
      const marcada = getRespuestaMarcada(q.id);

      if (esCorrecta) cls += " correct";
      else if (marcada === idx && estado === "bad") cls += " wrong";
    }

    return `
      <label class="${cls}" onclick="answer(${idx})">
        <span class="option-letter">${letra})</span>
        <span class="option-text">${op}</span>
      </label>
    `;
  }).join("");

  /* ---------- RENDER FINAL ---------- */
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
              <span class="q-materia">${materiaNombre}</span>
            </div>
          </div>

          <div class="q-enunciado">${q.enunciado || ""}</div>

          ${q.imagenes?.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="options">
            ${opcionesHTML}
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

            <button class="btn-small btn-ghost" onclick="salirResolucion()">
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
   🧠 Responder
   ========================================================== */

function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  if (CURRENT.session[q.id]) return;

  const correct = idx === q.correcta;
  const estado = correct ? "ok" : "bad";

  CURRENT.session[q.id] = estado;
  setRespuestaMarcada(q.id, idx);

  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = {
    status: estado,
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
   🏁 Pantalla final
   ========================================================== */

function renderFin() {
  stopTimer();

  const total = CURRENT.list.length;
  const correctas = Object.values(CURRENT.session).filter(v => v === "ok").length;
  const incorrectas = total - correctas;
  const precision = total ? Math.round(correctas / total * 100) : 0;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>${CURRENT.config.titulo || "Finalizado"}</h2>

      <p>Total: <b>${total}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${correctas}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${incorrectas}</p>
      <p><b>Precisión:</b> ${precision}%</p>

      <div style="margin-top:20px;">
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
   ⏱ Timer
   ========================================================== */

let ME_TIMER = {
  interval: null,
  start: 0,
  running: false
};

function initTimer() {
  ME_TIMER.start = Date.now();
  ME_TIMER.running = true;

  let el = document.getElementById("exam-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "exam-timer";
    el.className = "exam-timer";
    document.body.appendChild(el);
  }
  el.textContent = "⏱ 00:00";

  ME_TIMER.interval = setInterval(() => {
    if (!ME_TIMER.running) return;
    const elapsed = Date.now() - ME_TIMER.start;
    el.textContent = "⏱ " + formatTimer(elapsed);
  }, 1000);
}

function stopTimer() {
  if (ME_TIMER.interval) {
    clearInterval(ME_TIMER.interval);
    ME_TIMER.interval = null;
  }
  ME_TIMER.running = false;

  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

function formatTimer(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ==========================================================
   📊 Sidebar
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

function irAPregunta(idx) {
  CURRENT.i = idx;
  renderPregunta();
}

/* ==========================================================
   🔎 Helpers
   ========================================================== */

function getMateriaNombreForQuestion(q) {
  const found = BANK.subjects.find(s => s.slug === q.materia);
  return found ? found.name : q.materia;
}

const RESP_MARCADAS = {};

function setRespuestaMarcada(id, idx) {
  RESP_MARCADAS[id] = idx;
}

function getRespuestaMarcada(id) {
  return RESP_MARCADAS[id] ?? null;
}
