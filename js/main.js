/* ========== INICIO AUTOMÁTICO ========== */
// Carga inicial de la app
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  window.app = app; // la hace global
  renderHome();
});

/* ========== HOME ========== */
function renderHome() {
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

/* ========== LISTA DE MATERIAS (versión con botones blancos) ========== */
function renderSubjects() {
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
let CURRENT_SESSION = { list: [], i: 0, materia: "" };

function startPractica(slug) {
  const listAll = (BANK.questions || []).filter(q => q.materia === slug).sort((a, b) => a.id.localeCompare(b.id));
  if (!listAll.length) {
    app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b>.</div>`;
    return;
  }
  CURRENT_SESSION = { list: listAll, i: 0, materia: slug };
  PROG[slug] = PROG[slug] || {};
  PROG[slug]._lastIndex = 0;
  saveAll();
  renderPregunta();
}

function startRepaso(slug) {
  const listAll = (BANK.questions || []).filter(q => q.materia === slug);
  const prog = PROG[slug] || {};
  const list = listAll.filter(q => prog[q.id]?.status === 'bad');
  if (!list.length) {
    app.innerHTML = `<div class='card'>No tenés incorrectas para repasar en <b>${slug}</b>.<br><br><button class='btn-main' onclick='renderSubjects()'>Volver</button></div>`;
    return;
  }
  CURRENT_SESSION = { list, i: 0, materia: slug };
  renderPregunta();
}

function renderPregunta() {
  const q = CURRENT_SESSION.list[CURRENT_SESSION.i];
  if (!q) {
    app.innerHTML = `<div class='card'>Sin preguntas.<br><button class='btn-main' onclick='renderHome()'>Volver</button></div>`;
    return;
  }
  const prog = PROG[CURRENT_SESSION.materia] || {};
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
          <div><b>${CURRENT_SESSION.materia.toUpperCase()}</b> · ${CURRENT_SESSION.i + 1}/${CURRENT_SESSION.list.length}</div>
          <div style='margin-top:8px;font-size:18px'>${q.enunciado}</div>
          <div class='options'>${opts}</div>
          ${exp}
          <div class='nav-row'>
            <button class='btn-small' onclick='prevQ()' ${CURRENT_SESSION.i === 0 ? 'disabled' : ''}>Anterior</button>
            <button class='btn-small' onclick='nextQ()' ${CURRENT_SESSION.i === CURRENT_SESSION.list.length - 1 ? 'disabled' : ''}>Siguiente</button>
            <button class='btn-small' onclick='renderSubjects()'>Inicio</button>
          </div>
        </div>
      </div>
      <div class="sidebar">
        <div style="font-weight:600;margin-bottom:8px">Índice</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          ${CURRENT_SESSION.list.map((_, ix) => `
            <button class="btn-small" style="font-size:12px;padding:6px;border-radius:8px;${ix === CURRENT_SESSION.i ? 'background:#e0ecff;border-color:#1e40af' : ''}" onclick="jump(${ix})">${ix + 1}</button>
          `).join('')}
        </div>
      </div>
    </div>`;
}

/* ========== NAVEGACIÓN DE PREGUNTAS ========== */
window.jump = (ix) => { CURRENT_SESSION.i = ix; updateLastIndex(); renderPregunta(); };
function prevQ() { if (CURRENT_SESSION.i > 0) { CURRENT_SESSION.i--; updateLastIndex(); renderPregunta(); } }
function nextQ() { if (CURRENT_SESSION.i < CURRENT_SESSION.list.length - 1) { CURRENT_SESSION.i++; updateLastIndex(); renderPregunta(); } }

function updateLastIndex() {
  if (CURRENT_SESSION.materia) {
    PROG[CURRENT_SESSION.materia] = PROG[CURRENT_SESSION.materia] || {};
    PROG[CURRENT_SESSION.materia]._lastIndex = Math.max(PROG[CURRENT_SESSION.materia]._lastIndex ?? 0, CURRENT_SESSION.i);
    saveAll();
  }
}

function answer(i) {
  const q = CURRENT_SESSION.list[CURRENT_SESSION.i];
  const slug = CURRENT_SESSION.materia || 'general';
  PROG[slug] = PROG[slug] || {};
  if (PROG[slug][q.id]) return;

  PROG[slug][q.id] = { chosen: i, status: (i === q.correcta ? 'ok' : 'bad') };
  PROG[slug]._lastIndex = CURRENT_SESSION.i;
  PROG[slug]._lastDate = Date.now();

  saveAll();
  renderPregunta();
}
