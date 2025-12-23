/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (Robusto)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}
};

// --- Configuración Paginado Sidebar ---
const SB_PAGE_SIZE = 60;
let SB_PAGE = 0;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/* ==========================================================
   🛠 HELPERS DE "TRADUCCIÓN" (La clave para que no falle)
   ========================================================== */

// Normaliza las opciones para que siempre sean una lista limpia ["Texto A", "Texto B"...]
function getOpcionesArray(q) {
  if (!q.opciones) return [];

  // Si ya es un array (Lista)
  if (Array.isArray(q.opciones)) {
    return q.opciones.map(txt => {
        // Truco: Si el texto empieza con "a. ", "b) ", se lo quitamos para que quede limpio
        return txt.replace(/^[a-eA-E][\.\)]\s*/, ""); 
    });
  }

  // Si es un objeto (Diccionario) { a: "...", b: "..." }
  if (typeof q.opciones === "object") {
    // Forzamos el orden a, b, c, d, e
    const keys = ["a", "b", "c", "d", "e"];
    const arr = [];
    keys.forEach(k => {
        if (q.opciones[k]) arr.push(q.opciones[k]);
    });
    return arr;
  }
  return [];
}

// "Traductor Universal" de respuesta correcta
function getCorrectIndex(q, totalOpciones) {
  let raw = q.correcta;

  // 1. Si no hay correcta definida
  if (raw === undefined || raw === null) return null;

  // 2. Si ya es un NÚMERO (ej: 0, 1, 2, 3)
  if (typeof raw === 'number') {
      // Validamos que esté dentro del rango de opciones
      return (raw >= 0 && raw < totalOpciones) ? raw : null;
  }

  // 3. Si es TEXTO (ej: "a", "A", "a.", "2")
  if (typeof raw === 'string') {
      // Limpiamos espacios, puntos y lo hacemos minúscula
      let s = raw.trim().toLowerCase().replace(/[\.\)]/g, "");

      // Si es un número en texto ("0", "1")
      if (!isNaN(s) && s !== "") {
          let num = parseInt(s, 10);
          return (num >= 0 && num < totalOpciones) ? num : null;
      }

      // Si es una letra (a, b, c, d, e)
      const mapa = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4 };
      if (mapa.hasOwnProperty(s)) {
          return mapa[s];
      }
  }

  return null; // No pudimos descifrarlo
}

/* ==========================================================
   🚀 Iniciar
   ========================================================== */
function iniciarResolucion(config) {
  if (!config || !Array.isArray(config.preguntas) || !config.preguntas.length) {
    alert("⚠ No hay preguntas disponibles.");
    return;
  }
  stopTimer();
  CURRENT = {
    list: config.preguntas.slice(), // Copia
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

  // Datos de estado
  const userIdx = getRespuestaMarcada(q.id); // null o índice (0,1,2...)
  const yaRespondio = (userIdx !== null);

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  // --- Notas ---
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const currentNote = savedNotes[q.id]; 
  const noteText = currentNote ? currentNote.text : "";
  const hasNote = !!noteText;

  // --- Construcción de Opciones ---
  const opcionesHTML = opciones.map((texto, idx) => {
    let claseCSS = "q-option";
    let letra = String.fromCharCode(97 + idx); // a, b, c...

    if (yaRespondio) {
        claseCSS += " q-option-locked"; // Bloquea clicks

        // LÓGICA DE COLORES VISUAL
        if (idx === correctIndex) {
            claseCSS += " option-correct"; // Siempre pinta la correcta de VERDE
        } else if (idx === userIdx) {
            claseCSS += " option-wrong";   // Si te equivocaste, pinta la tuya de ROJO
        }
    }

    return `
      <label class="${claseCSS}" onclick="answer(${idx})">
        <span class="q-option-letter">${letra})</span>
        <span class="q-option-text">${texto}</span>
      </label>
    `;
  }).join("");

  // --- Render del HTML ---
  app.innerHTML = `
    <div class="q-layout fade">
      <div class="q-main">
        <div class="q-card">
          <div class="q-header">
            <div class="q-title">
              <b>${CURRENT.config.titulo || "Práctica"}</b>
              <span class="q-counter">${numero} / ${total}</span>
            </div>
            <div class="q-meta"><span class="q-materia">${materiaNombre}</span></div>
          </div>

          <div class="q-enunciado">${q.enunciado}</div>
          ${q.imagenes ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">
            ${opcionesHTML || `<p class="small">(Sin opciones)</p>`}
          </div>

          ${yaRespondio && q.explicacion ? `
            <div class="q-explanation">
               <strong>💡 Explicación:</strong><br>${q.explicacion}
            </div>
          ` : ""}

          <div style="margin-top:25px; border-top:1px dashed #e2e8f0; padding-top:15px;">
             <button class="btn-small" 
                     style="background:${hasNote ? '#fefce8' : 'white'}; border-color:${hasNote ? '#facc15' : '#e2e8f0'}; color:${hasNote ? '#854d0e' : '#64748b'};"
                     onclick="toggleNoteArea('${q.id}')">
                ${hasNote ? '📝 Ver mi nota' : '➕ Nota personal'}
             </button>
             <div id="note-area-${q.id}" style="display:none; margin-top:10px;">
                <textarea id="note-text-${q.id}" placeholder="Escribí acá..." style="width:100%; height:80px; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${noteText}</textarea>
                <div style="margin-top:6px; text-align:right;">
                   <button class="btn-small" style="background:#3b82f6; color:white; border:none;" onclick="saveNoteResolver('${q.id}')">💾 Guardar</button>
                </div>
             </div>
          </div>

          <div class="q-nav-row" style="margin-top:25px;">
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
            <button class="btn-small" onclick="nextQuestion()">${CURRENT.i === total - 1 ? "Finalizar" : "Siguiente ➡"}</button>
            <button class="btn-small btn-ghost" onclick="salirResolucion()">Salir</button>
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
        <div class="q-sidebar-grid" id="sbGrid">${renderSidebarCells()}</div>
      </aside>
    </div>
  `;
  
  paintSidebarPageInfo();
}

/* ==========================================================
   🧠 Lógica de Respuesta
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;

  // Si ya respondió, bloqueamos
  if (getRespuestaMarcada(q.id) !== null) return;

  // Guardamos qué tocó el usuario
  setRespuestaMarcada(q.id, idx);

  // Determinamos si acertó
  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);
  const esCorrecta = (correctIndex !== null && idx === correctIndex);
  
  // Guardamos estado (ok/bad)
  CURRENT.session[q.id] = esCorrecta ? "ok" : "bad";

  // Estadísticas y Progreso
  const mat = q.materia || "otras";
  if (typeof PROG !== 'undefined') {
      if (!PROG[mat]) PROG[mat] = {};
      PROG[mat][q.id] = { status: CURRENT.session[q.id], fecha: Date.now() };
      if (window.saveProgress) window.saveProgress();
  }
  if (esCorrecta) {
    const hoy = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    stats[hoy] = (stats[hoy] || 0) + 1;
    localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
  }

  renderPregunta(); // Re-render para mostrar colores
}

/* ==========================================================
   ⏭ Navegación y Sidebar
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

// Helpers del Sidebar
function ensureSidebarOnCurrent() {
  const totalPages = Math.max(1, Math.ceil(CURRENT.list.length / SB_PAGE_SIZE));
  const targetPage = Math.floor(CURRENT.i / SB_PAGE_SIZE);
  SB_PAGE = clamp(targetPage, 0, totalPages - 1);
}

function renderSidebarCells() {
  const total = CURRENT.list.length;
  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(total, start + SB_PAGE_SIZE);
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");

  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const estado = CURRENT.session[q.id]; // "ok" o "bad" o undefined
    const esActual = idx === CURRENT.i;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    if (estado === "bad") cls += " sb-bad";
    if (savedNotes[q.id]) cls += " sb-note";

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
   🏁 Finalizar
   ========================================================== */
function renderFin() {
  stopTimer();
  const total = CURRENT.list.length;
  const values = Object.values(CURRENT.session);
  const ok = values.filter(v => v === "ok").length;
  const bad = values.filter(v => v === "bad").length;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>Resultados</h2>
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
  if (!confirm("¿Salir del examen?")) return;
  stopTimer();
  renderHome();
}

/* ==========================================================
   🕒 Timer & Helpers Menores
   ========================================================== */
let TIMER = { interval: null, start: 0 };

function initTimer() {
  stopTimer();
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
    const totalSeconds = Math.floor((Date.now() - TIMER.start) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const box = document.getElementById("exam-timer");
    if (box) box.textContent = "⏱ " + (h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

// Helpers de datos
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

function renderImagenesPregunta(imgs) {
  if (!Array.isArray(imgs) || !imgs.length) return "";
  return `<div class="q-images">${imgs.map(src => `<div class="q-image-wrap"><img class="q-image" src="${src}"></div>`).join("")}</div>`;
}
