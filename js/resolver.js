/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (LIMPIO Y CONECTADO)
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

  // 1. Detener timer anterior si existía
  if (window.stopTimer) window.stopTimer();

  // 2. Configurar estado actual
  CURRENT = {
    list: config.preguntas.slice(),
    i: 0,
    modo: config.modo || "general",
    config: config,
    session: {}
  };

  // 3. Inicializar Sidebar externo
  if (window.initSidebar) {
    window.initSidebar(CURRENT.list);
  }

  // 4. Inicializar Timer externo (si corresponde)
  if (config.usarTimer && window.initTimer) {
    window.initTimer();
  } else {
    // Si no se usa timer, aseguramos que no quede uno viejo
    if (window.stopTimer) window.stopTimer();
  }

  // 5. Renderizar primera pregunta
  renderPregunta();
}

/* ==========================================================
   🧩 Helper: obtener opciones en formato array
   ========================================================== */
function getOpcionesArray(q) {
  if (Array.isArray(q.opciones) && q.opciones.length) return q.opciones;

  if (q.opciones && typeof q.opciones === "object") {
    const keys = ["a", "b", "c", "d", "e"];
    const arr = keys.map(k => q.opciones[k]).filter(v => v != null && v !== "");
    if (arr.length) return arr;
  }
  return [];
}

/* ==========================================================
   🧩 Helper: índice correcto (0–3)
   ========================================================== */
function getCorrectIndex(q, opcionesLen) {
  const mapa = { a: 0, b: 1, c: 2, d: 3, e: 4 };
  let c = q.correcta;

  if (typeof c === "number" && Number.isFinite(c) && c >= 0) return c;
  
  if (typeof c === "string") {
    const key = c.trim().toLowerCase();
    return mapa[key] != null ? mapa[key] : null;
  }
  return null;
}

/* ==========================================================
   🧩 Render Pregunta Principal
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
    // Lógica visual de colores
    if (estado) {
      if (correctIndex != null && idx === correctIndex) cls += " option-correct";
      else if (marcada === idx && estado === "bad") cls += " option-wrong";
    }

    return `
      <label class="${cls}" onclick="answer(${idx})">
        <span class="q-option-letter">${String.fromCharCode(97 + idx)})</span>
        <span class="q-option-text">${op}</span>
      </label>
    `;
  }).join("");

  /* ------ ACTUALIZAR SIDEBAR EXTERNO ------ */
  if (window.renderSidebarPage) {
    // Le avisamos al sidebar que se mueva a la página de la pregunta actual
    window.renderSidebarPage(CURRENT.i);
  }

  /* ------ HTML PRINCIPAL ------ */
  app.innerHTML = `
    <div class="q-layout fade">
      
      <div class="q-main">
        <div class="q-card">

          <div class="q-header">
            <div class="q-title">
              <span class="q-counter">${numero}/${total}</span>
              <b>${CURRENT.config.titulo || "Resolución"}</b>
            </div>
            <div class="q-meta">
              <span class="q-materia">${materiaNombre || ""}</span>
            </div>
          </div>

          <div class="q-enunciado">${q.enunciado || ""}</div>

          ${q.imagenes && q.imagenes.length ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">
            ${opcionesHTML || `<p style="color:#94a3b8;">(Sin opciones)</p>`}
          </div>

          <div class="q-nav-row">
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>
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
      ${imgs.map(src => `<div class="q-image-wrap"><img class="q-image" src="${src}"></div>`).join("")}
    </div>
  `;
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

  const esCorrecta = (correctIndex != null) ? (idx === correctIndex) : false;
  const estado = esCorrecta ? "ok" : "bad";

  // Guardar estado sesión
  CURRENT.session[q.id] = estado;
  setRespuestaMarcada(q.id, idx);

  // Guardar progreso global (localStorage)
  const mat = q.materia || "otras";
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = { status: estado, fecha: Date.now() };
  saveProgress();

  // Re-renderizar (pinta colores y actualiza sidebar)
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
  if (window.stopTimer) window.stopTimer();
  // Ocultar sidebar al terminar
  if (window.hideSidebar) window.hideSidebar();
  const btn = document.getElementById("sb-openbtn");
  if (btn) btn.style.display = "none";

  const total = CURRENT.list.length;
  const values = Object.values(CURRENT.session);
  const ok = values.filter(v => v === "ok").length;
  const bad = total - ok; // (incluye no respondidas como bad si finaliza)

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2>${CURRENT.config.titulo || "Finalizado"}</h2>
      
      <div style="display:flex;justify-content:center;gap:20px;margin:20px 0;font-size:18px;">
        <div style="color:#16a34a;">✔ ${ok} Correctas</div>
        <div style="color:#ef4444;">✖ ${bad} Incorrectas</div>
      </div>
      <p style="color:#64748b;">Total: <b>${total}</b> preguntas</p>

      <div style="margin-top:30px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🚪 Salir
   ========================================================== */
function salirResolucion() {
  if (!confirm("¿Seguro que querés salir? Se perderá el progreso de esta sesión.")) return;
  
  if (window.stopTimer) window.stopTimer();
  
  // Limpiar sidebar
  const sb = document.getElementById("exam-sidebar");
  if (sb) sb.remove();
  const btn = document.getElementById("sb-openbtn");
  if (btn) btn.remove();

  renderHome();
}

/* ==========================================================
   Helpers
   ========================================================== */
const RESP_MARCADAS = {};
function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }

function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";
  // Busca nombre bonito en CONFIG
  const mat = BANK.subjects.find(s => s.slug === q.materia);
  return mat ? mat.name : q.materia;
}
