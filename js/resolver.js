/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución de preguntas
   Estilo examen único:
   - Marca correcta / incorrecta
   - NO cambia de pregunta automáticamente
   - No deja cambiar la respuesta (modo examen real)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}   // q.id -> "ok" | "bad"
};

/* ==========================================================
   🚀 Iniciar una resolución
   config = {
     modo: "materia" | "examen" | "reanudar" | ...,
     preguntas: [ array de preguntas ],
     usarTimer: true/false,
     permitirRetroceso: true/false,   // por ahora lo usamos poco
     mostrarNotas: true/false,        // reservado
     titulo: "texto"
   }
   ========================================================== */

function iniciarResolucion(config) {
  if (!config || !Array.isArray(config.preguntas) || !config.preguntas.length) {
    alert("⚠ No hay preguntas para resolver.");
    return;
  }

  // Detener timer previo si existía
  stopTimer();

  CURRENT = {
    list: config.preguntas.slice(), // copia defensiva
    i: 0,
    modo: config.modo || "general",
    config: config,
    session: {}   // arrancamos en limpio
  };

  // Timer
  if (config.usarTimer) {
    initTimer();
  }

  // Render primera pregunta
  renderPregunta();
}

/* ==========================================================
   🧩 Renderizar una pregunta
   ========================================================== */

function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];
  if (!q) {
    renderFin();
    return;
  }

  // Por si venimos de otra vista, scrollear arriba
  window.scrollTo({ top: 0, behavior: "smooth" });

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;

  const materiaNombre = getMateriaNombreForQuestion(q);

  // ¿La pregunta ya fue respondida en ESTA sesión?
  const estado = CURRENT.session[q.id] || null;

  // Opciones estilo bloque clásico
  const opcionesHTML = q.opciones.map((op, idx) => {
    const letra = String.fromCharCode(97 + idx); // a, b, c, d...

    let extraClass = "";
    if (estado) {
      const esCorrecta = (idx === q.correcta);
      const fueRespondidaMal = (estado === "bad" && idx === getRespuestaMarcada(q.id));

      if (esCorrecta) extraClass = " option-correct";
      else if (fueRespondidaMal) extraClass = " option-wrong";
    }

    return `
      <label class="q-option${extraClass}" onclick="answer(${idx})">
        <span class="q-option-letter">${letra})</span>
        <span class="q-option-text">${op}</span>
      </label>
    `;
  }).join("");

  app.innerHTML = `
    <div class="q-layout fade">

      <!-- COLUMNA PRINCIPAL -->
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

          <div class="q-enunciado">
            ${q.enunciado || ""}
          </div>

          ${q.imagenes && q.imagenes.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">
            ${opcionesHTML}
          </div>

          <div class="q-nav-row">
            <button class="btn-small"
                    onclick="prevQuestion()"
                    ${CURRENT.i === 0 ? "disabled" : ""}>
              ⬅ Anterior
            </button>

            <button class="btn-small"
                    onclick="nextQuestion()"
                    ${CURRENT.i === total - 1 ? "" : ""}>
              ${CURRENT.i === total - 1 ? "Finalizar ➜" : "Siguiente ➡"}
            </button>

            <button class="btn-small btn-ghost"
                    onclick="salirResolucion()">
              🏠 Salir
            </button>
          </div>
        </div>
      </div>

      <!-- SIDEBAR DERECHA -->
      <aside class="q-sidebar">
        <div class="q-sidebar-header">
          <b>Índice</b>
        </div>
        <div class="q-sidebar-grid">
          ${renderSidebarCells()}
        </div>
      </aside>
    </div>
  `;
}

/* ==========================================================
   🖼 Render imágenes (si existieran)
   ========================================================== */

function renderImagenesPregunta(imgs) {
  if (!Array.isArray(imgs) || !imgs.length) return "";
  // Por ahora mostramos en columna simple
  const htmlImgs = imgs.map(src => `
    <div class="q-image-wrap">
      <img src="${src}" alt="Imagen de la pregunta" class="q-image">
    </div>
  `).join("");
  return `<div class="q-images">${htmlImgs}</div>`;
}

/* ==========================================================
   🧠 Responder (NO avanza de pregunta, no se puede cambiar)
   ========================================================== */

function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  // Si ya tenía respuesta en esta sesión, no dejamos cambiar
  if (CURRENT.session[q.id]) return;

  const esCorrecta = (idx === q.correcta);
  const estado = esCorrecta ? "ok" : "bad";

  // Guardar en sesión
  CURRENT.session[q.id] = estado;
  setRespuestaMarcada(q.id, idx);

  // Guardar en PROG global (por materia)
  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  if (!PROG[mat][q.id]) PROG[mat][q.id] = {};

  PROG[mat][q.id].status = estado;
  PROG[mat][q.id].fecha = Date.now();
  saveProgress();

  // Re-render de la pregunta para aplicar clases correct/incorrect
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
    // Última -> fin
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
   🏁 Final del bloque
   ========================================================== */

function renderFin() {
  stopTimer();

  const total = CURRENT.list.length;
  const values = Object.values(CURRENT.session);
  const correctas = values.filter(v => v === "ok").length;
  const incorrectas = values.filter(v => v === "bad").length;
  const precision = total ? Math.round(correctas / total * 100) : 0;

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>${CURRENT.config.titulo || "Finalizado"}</h2>
      <p>Total de preguntas: <b>${total}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${correctas}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${incorrectas}</p>
      <p><b>Precisión:</b> ${precision}%</p>

      <div style="margin-top:20px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🚪 Salir de la resolución
   ========================================================== */

function salirResolucion() {
  const ok = confirm("¿Seguro que querés salir de la resolución?");
  if (!ok) return;

  stopTimer();
  renderHome();
}

/* ==========================================================
   🕒 Timer minimalista
   ========================================================== */

let TIMER = {
  interval: null,
  start: 0,
  running: false
};

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
    const elapsed = Date.now() - TIMER.start;
    document.getElementById("exam-timer").textContent =
      "⏱ " + formatTimer(elapsed);
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) {
    clearInterval(TIMER.interval);
    TIMER.interval = null;
  }
  TIMER.running = false;

  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

function formatTimer(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/* ==========================================================
   📊 Sidebar (índice de preguntas)
   ========================================================== */

function renderSidebarCells() {
  const total = CURRENT.list.length;

  return CURRENT.list.map((q, idx) => {
    const num = idx + 1;
    const estado = CURRENT.session[q.id] || null;
    const esActual = (idx === CURRENT.i);

    // ¿Tiene nota guardada?
    const mat = q.materia || "otras";
    const nota = PROG[mat] && PROG[mat][q.id] && PROG[mat][q.id].nota;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    else if (estado === "bad") cls += " sb-bad";
    if (nota) cls += " sb-note";

    return `
      <div class="${cls}" onclick="irAPregunta(${idx})">
        ${num}
      </div>
    `;
  }).join("");
}

function irAPregunta(idx) {
  if (idx < 0 || idx >= CURRENT.list.length) return;
  CURRENT.i = idx;
  renderPregunta();
}

/* ==========================================================
   🔎 Helpers para materia / respuesta marcada
   ========================================================== */

function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";

  const slug = q.materia;
  const found = BANK.subjects.find(s => s.slug === slug);
  return found ? found.name : slug;
}

/*
  Guardamos (solo en memoria) qué opción se eligió
  por si en el futuro queremos reabrir y marcarla distinta.
  Por ahora se usa sólo para pintar rojo la que marcó mal.
*/
const RESP_MARCADAS = {};  // q.id -> idx

function setRespuestaMarcada(id, idx) {
  RESP_MARCADAS[id] = idx;
}

function getRespuestaMarcada(id) {
  return RESP_MARCADAS[id] ?? null;
}
