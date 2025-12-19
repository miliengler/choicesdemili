/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (CORREGIDO)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}
};

/* ==========================================================
   📊 Estado Interno del Sidebar
   ========================================================== */
const SB_PAGE_SIZE = 60; 
let SB_PAGE = 0;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/* Sincronizar página del sidebar */
function ensureSidebarOnCurrent() {
  const totalPages = Math.max(1, Math.ceil(CURRENT.list.length / SB_PAGE_SIZE));
  const targetPage = Math.floor(CURRENT.i / SB_PAGE_SIZE);
  SB_PAGE = clamp(targetPage, 0, totalPages - 1);
}

/* Renderizar info de paginado */
function paintSidebarPageInfo() {
  const info = document.getElementById("sbInfo");
  const prev = document.getElementById("sbPrev");
  const next = document.getElementById("sbNext");
  if (!info || !prev || !next) return;

  const total = CURRENT.list.length;
  const totalPages = Math.max(1, Math.ceil(total / SB_PAGE_SIZE));

  SB_PAGE = clamp(SB_PAGE, 0, totalPages - 1);

  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(total, start + SB_PAGE_SIZE);

  info.textContent = `${start + 1}–${end} (Pág ${SB_PAGE + 1}/${totalPages})`;
  prev.disabled = SB_PAGE === 0;
  next.disabled = SB_PAGE === totalPages - 1;
}

/* Botones Sidebar */
function sbPrevPage() {
  const totalPages = Math.max(1, Math.ceil(CURRENT.list.length / SB_PAGE_SIZE));
  SB_PAGE = clamp(SB_PAGE - 1, 0, totalPages - 1);
  renderPregunta();
}

function sbNextPage() {
  const totalPages = Math.max(1, Math.ceil(CURRENT.list.length / SB_PAGE_SIZE));
  SB_PAGE = clamp(SB_PAGE + 1, 0, totalPages - 1);
  renderPregunta();
}

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

  SB_PAGE = 0;
  ensureSidebarOnCurrent();

  if (config.usarTimer) initTimer();

  renderPregunta();
}

/* ==========================================================
   🧩 Helpers de Opciones (LÓGICA MEJORADA)
   ========================================================== */
function getOpcionesArray(q) {
  // 1. Si ya es array
  if (Array.isArray(q.opciones) && q.opciones.length) return q.opciones;

  // 2. Si es objeto {a: "...", b: "..."}
  if (q.opciones && typeof q.opciones === "object") {
    // Forzamos el orden a, b, c, d, e
    const keys = ["a", "b", "c", "d", "e"];
    const arr = keys.map(k => q.opciones[k]).filter(v => v != null && v !== "");
    if (arr.length) return arr;
  }
  return [];
}

function getCorrectIndex(q, opcionesLen) {
  let c = q.correcta;

  // 1. Si es número (ej: 0)
  if (typeof c === "number") {
    return (c >= 0 && c < opcionesLen) ? c : null;
  }

  // 2. Si es string
  if (typeof c === "string") {
    c = c.trim().toLowerCase();

    // Si es "0", "1", "2"...
    if (!isNaN(c) && c !== "") {
      const num = parseInt(c, 10);
      return (num >= 0 && num < opcionesLen) ? num : null;
    }

    // Si es letra "a", "b", "c"...
    const mapa = { a: 0, b: 1, c: 2, d: 3, e: 4 };
    const idx = mapa[c];
    if (idx != null && idx < opcionesLen) return idx;
  }

  return null;
}

/* ==========================================================
   🧩 Render Principal
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
  const correctIndex = getCorrectIndex(q, opciones.length);

  /* ------ OPCIONES HTML ------ */
  const opcionesHTML = opciones.map((op, idx) => {
    let cls = "q-option";
    let icon = "";

    if (estado) {
      if (correctIndex != null && idx === correctIndex) {
        cls += " option-correct";
        icon = " ✅";
      }
      else if (marcada === idx && estado === "bad") {
        cls += " option-wrong";
        icon = " ❌";
      }
    }

    return `
      <label class="${cls}" onclick="answer(${idx})">
        <span class="q-option-letter">${String.fromCharCode(97 + idx)})</span>
        <span class="q-option-text">${op}${icon}</span>
      </label>
    `;
  }).join("");

  /* ------ LAYOUT ------ */
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
            ${opcionesHTML || `<p style="color:#94a3b8;font-size:14px;">(Sin opciones)</p>`}
          </div>
          
          ${estado && q.explicacion ? `
            <div style="margin-top:20px; padding:15px; background:#f0fdf4; border-left:4px solid #22c55e; border-radius:6px; color:#14532d; line-height:1.5;">
               <b style="display:block;margin-bottom:5px;">💡 Explicación:</b> ${q.explicacion}
            </div>
          ` : ""}

          <div class="q-nav-row">
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
            <button class="btn-small" onclick="nextQuestion()">
              ${CURRENT.i === total - 1 ? "Finalizar ➜" : "Siguiente ➡"}
            </button>
            <button class="btn-small btn-ghost" onclick="salirResolucion()">🏠 Salir</button>
          </div>
        </div>
      </div>

      <aside class="q-sidebar">
        <div class="q-sidebar-header">Índice</div>
        <div class="q-sidebar-pager">
          <button class="btn-small" id="sbPrev" onclick="sbPrevPage()">◀</button>
          <div class="q-sidebar-pageinfo" id="sbInfo">...</div>
          <button class="btn-small" id="sbNext" onclick="sbNextPage()">▶</button>
        </div>
        <div class="q-sidebar-grid" id="sbGrid">
          ${renderSidebarCells()}
        </div>
      </aside>

    </div>
  `;

  paintSidebarPageInfo();
}

/* ==========================================================
   🧠 Responder
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  // Bloquear si ya respondió
  if (CURRENT.session[q.id]) return;

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  // Lógica de corrección
  const esCorrecta = (correctIndex != null) ? (idx === correctIndex) : false;
  const estado = esCorrecta ? "ok" : "bad";

  // 1. Guardar en sesión temporal
  CURRENT.session[q.id] = estado;
  setRespuestaMarcada(q.id, idx);

  // 2. Guardar progreso permanente
  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = { status: estado, fecha: Date.now() };
  if (window.saveProgress) window.saveProgress();

  // 3. 📊 ACTUALIZAR ESTADÍSTICAS DIARIAS (Para el gráfico semanal)
  if (esCorrecta) {
    const hoy = new Date().toISOString().split('T')[0]; 
    const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    stats[hoy] = (stats[hoy] || 0) + 1;
    localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
  }

  renderPregunta();
}

/* ==========================================================
   🖼 Helpers Visuales
   ========================================================== */
function renderImagenesPregunta(imgs) {
  if (!Array.isArray(imgs) || !imgs.length) return "";
  return `
    <div class="q-images">
      ${imgs.map(src => `<div class="q-image-wrap"><img class="q-image" src="${src}"></div>`).join("")}
    </div>
  `;
}

/* ==========================================================
   ⏭ Navegación
   ========================================================== */
function nextQuestion() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    ensureSidebarOnCurrent();
    renderPregunta();
  } else {
    renderFin();
  }
}

function prevQuestion() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
}

/* ==========================================================
   📊 Render Sidebar Cells
   ========================================================== */
function renderSidebarCells() {
  const total = CURRENT.list.length;
  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(total, start + SB_PAGE_SIZE);

  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const estado = CURRENT.session[q.id];
    const esActual = idx === CURRENT.i;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    if (estado === "bad") cls += " sb-bad";

    out.push(`<div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>`);
  }
  return out.join("");
}

function irAPregunta(idx) {
  if (idx < 0 || idx >= CURRENT.list.length) return;
  CURRENT.i = idx;
  renderPregunta();
}

/* ==========================================================
   🏁 Fin / Salir / Timer
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
      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

function salirResolucion() {
  if (confirm("¿Seguro que querés salir?")) {
    stopTimer();
    renderHome();
  }
}

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
    const s = Math.floor((Date.now() - TIMER.start) / 1000);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    el.textContent = `⏱ ${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

/* ==========================================================
   🛠 Helpers
   ========================================================== */
const RESP_MARCADAS = {};
function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }

function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";
  if (typeof BANK !== 'undefined' && BANK.subjects) {
    const mat = BANK.subjects.find(s => s.slug === q.materia);
    return mat ? mat.name : q.materia;
  }
  return q.materia;
}
