/* ========== DEBUG VISUAL (para iPad) ========== */
// Panel visual para mostrar errores o mensajes sin consola
window.debugLog = function(msg){
  const el = document.getElementById("debugLog") || (() => {
    const div = document.createElement("div");
    div.id = "debugLog";
    div.style = "position:fixed;bottom:0;left:0;width:100%;max-height:120px;overflow:auto;font-size:12px;background:#000;color:#0f0;padding:6px;font-family:monospace;z-index:9999;";
    document.body.appendChild(div);
    return div;
  })();
  el.innerHTML += msg + "<br>";
};

// Capturar errores globales
window.onerror = function(msg, src, line, col, err){
  debugLog("❌ ERROR: " + msg + " en " + src + ":" + line);
};

/* ========== INICIO AUTOMÁTICO ========== */
// Espera a que el DOM esté cargado antes de buscar #app
document.addEventListener("DOMContentLoaded", () => {
  debugLog("✅ DOM cargado");
  const app = document.getElementById("app");
  window.app = app; // la hace global para el resto del código
  renderHome();
});

/* ========== HOME ========== */
function renderHome() {
  debugLog("🏠 renderHome ejecutado");
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">🧩 Choice por materia</button>
      <button class="btn-main" onclick="alert('📄 Próximamente')">📄 Exámenes anteriores</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('🧠 Modo examen en desarrollo')">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('📊 Estadísticas próximamente')">📊 Estadísticas generales</button>
      <button class="btn-main" onclick="alert('📔 Mis notas próximamente')">📔 Mis notas</button>
    </div>
  `;
}

/* ========== LISTA DE MATERIAS ========== */
function renderSubjects() {
  debugLog("📘 renderSubjects ejecutado");
  
  const subs = subjectsFromBank().sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, '').localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu, ''), 'es', { sensitivity: 'base' }
    )
  );

  const list = subs.map(s => `
    <button class="btn-main" 
            style="background:#fff;color:var(--text);border:1px solid var(--line);text-align:left;max-width:500px;"
            onclick="startPractica('${s.slug}')">
      ${s.name}
      <span style="float:right;color:var(--muted);font-size:13px;">
        ${(BANK.questions || []).filter(q => q.materia === s.slug).length} preg.
      </span>
    </button>
  `).join("");

  app.innerHTML = `
    <div class="card" style="text-align:center">
      <button class="btn-small" style="margin-bottom:10px" onclick="renderHome()">⬅️ Volver</button>
      <p class="small" style="margin-bottom:8px;color:var(--muted)">
        Seleccioná una materia para comenzar a practicar
      </p>
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:auto;max-width:500px;">
        ${list}
      </div>
    </div>
  `;
}

/* ========== MOTOR DE PREGUNTAS ========== */
let CURRENT = { list: [], i: 0, materia: "" };

function startPractica(slug) {
  debugLog("▶️ startPractica ejecutado para " + slug);
  const listAll = (BANK.questions || []).filter(q => q.materia === slug).sort((a, b) => a.id.localeCompare(b.id));
  if (!listAll.length) {
    app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b>.</div>`;
    debugLog("⚠️ No hay preguntas en " + slug);
    return;
  }
  CURRENT = { list: listAll, i: 0, materia: slug };
  PROG[slug] = PROG[slug] || {};
  PROG[slug]._lastIndex = 0;
  saveAll();
  renderPregunta();
}

function renderPregunta() {
  const q = CURRENT.list[CURRENT.i];
  if (!q) {
    app.innerHTML = `<div class='card'>Sin preguntas.<br><button class='btn-main' onclick='renderHome()'>Volver</button></div>`;
    debugLog("⚠️ Sin preguntas para mostrar");
    return;
  }
  const prog = PROG[CURRENT.materia] || {};
  const ans = prog[q.id]?.chosen;

  const opts = q.opciones.map((t, i) => {
    let cls = '';
    if (ans != null) {
      if (i === q.correcta) cls = 'correct';
      else if (i === ans) cls = 'wrong';
    }
    return `<label class='option ${cls}' onclick='answer(${i})'><input type='radio' name='opt'> ${String.fromCharCode(97 + i)}) ${t}</label>`;
  }).join('');

  const exp = (ans != null) ? `<div class='explain'>${q.explicacion || ''}</div>` : '';

  app.innerHTML = `
    <div class="q-layout">
      <div>
        <div class='card'>
          <div><b>${CURRENT.materia.toUpperCase()}</b> · ${CURRENT.i + 1}/${CURRENT.list.length}</div>
          <div style='margin-top:8px;font-size:18px'>${q.enunciado}</div>
          <div class='options'>${opts}</div>
          ${exp}
          <div class='nav-row'>
            <button class='btn-small' onclick='prevQ()' ${CURRENT.i === 0 ? 'disabled' : ''}>Anterior</button>
            <button class='btn-small' onclick='nextQ()' ${CURRENT.i === CURRENT.list.length - 1 ? 'disabled' : ''}>Siguiente</button>
            <button class='btn-small' onclick='renderSubjects()'>Inicio</button>
          </div>
        </div>
      </div>
      <div class="sidebar">
        <div style="font-weight:600;margin-bottom:8px">Índice</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          ${CURRENT.list.map((_, ix) => `
            <button class="btn-small" style="font-size:12px;padding:6px;border-radius:8px;${ix === CURRENT.i ? 'background:#e0ecff;border-color:#1e40af' : ''}" onclick="jump(${ix})">${ix + 1}</button>
          `).join('')}
        </div>
      </div>
    </div>`;
}

/* ========== NAVEGACIÓN DE PREGUNTAS ========== */
window.jump = (ix) => { CURRENT.i = ix; updateLastIndex(); renderPregunta(); };
function prevQ() { if (CURRENT.i > 0) { CURRENT.i--; updateLastIndex(); renderPregunta(); } }
function nextQ() { if (CURRENT.i < CURRENT.list.length - 1) { CURRENT.i++; updateLastIndex(); renderPregunta(); } }

function updateLastIndex() {
  if (CURRENT.materia) {
    PROG[CURRENT.materia] = PROG[CURRENT.materia] || {};
    PROG[CURRENT.materia]._lastIndex = Math.max(PROG[CURRENT.materia]._lastIndex ?? 0, CURRENT.i);
    saveAll();
  }
}

function answer(i) {
  const q = CURRENT.list[CURRENT.i];
  const slug = CURRENT.materia || 'general';
  PROG[slug] = PROG[slug] || {};

  // Evitar cambiar respuestas ya registradas
  if (PROG[slug][q.id]) return;

  // Guardar resultado
  PROG[slug][q.id] = { chosen: i, status: (i === q.correcta ? 'ok' : 'bad') };
  PROG[slug]._lastIndex = CURRENT.i;
  PROG[slug]._lastDate = Date.now();

  saveAll();
  renderPregunta();
}
