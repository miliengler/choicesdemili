/* ========== INICIO AUTOMÁTICO ========== */
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  window.app = app;
  renderHome();
});

/* ========== HOME ========== */
function renderHome() {
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">🧩 Choice por materia</button>
      <button class="btn-main" onclick="alert('📄 Próximamente')">📄 Exámenes anteriores</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="renderExamenSetup()">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="renderStatsGlobal()">📊 Estadísticas generales</button>
      <button class="btn-main" onclick="alert('📔 Mis notas próximamente')">📔 Mis notas</button>
      <hr style="width:60%;margin:20px 0;border:0;border-top:1px solid var(--line)">
      <button class="btn-small" style="background:#475569;color:white;" onclick="manualBankReload()">🔄 Actualizar bancos</button>
    </div>
  `;
}

/* ========== LISTA DE MATERIAS ========== */
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
    app.innerHTML = `
      <div class='card'>
        Sin preguntas.<br>
        <button class='btn-main' onclick='renderHome()'>Volver</button>
      </div>`;
    return;
  }

  const prog = PROG[CURRENT_SESSION.materia] || {};
  const ans = prog[q.id]?.chosen;

  // Opciones
  const opts = q.opciones.map((t, i) => {
    let cls = '';
    if (ans != null) {
      if (i === q.correcta) cls = 'correct';
      else if (i === ans) cls = 'wrong';
    }
    return `
      <label class='option ${cls}' onclick='answer(${i})'>
        <input type='radio' name='opt'>
        ${String.fromCharCode(97 + i)}) ${t}
      </label>`;
  }).join('');

  // Explicación si ya respondió
  const exp = (ans != null)
    ? `<div class='explain'>${q.explicacion || ''}</div>`
    : '';

  // Render principal
  app.innerHTML = `
    <div class="q-layout">
      <div class="q-card fade">
        <div><b>${CURRENT_SESSION.materia.toUpperCase()}</b> · ${CURRENT_SESSION.i + 1}/${CURRENT_SESSION.list.length}</div>
        <div class="enunciado">${q.enunciado}</div>
        <div class="options">${opts}</div>
        ${exp}
        <div class="nav-row">
          <button class="btn-small" onclick="prevQ()" ${CURRENT_SESSION.i === 0 ? 'disabled' : ''}>⬅️ Anterior</button>
          <button class="btn-small" onclick="nextQ()" ${CURRENT_SESSION.i === CURRENT_SESSION.list.length - 1 ? 'disabled' : ''}>Siguiente ➡️</button>
          <button class="btn-small" style="background:#64748b;border-color:#64748b" onclick="renderSubjects()">🏠 Inicio</button>
        </div>
      </div>

      <!-- Barra lateral -->
      <div class="sidebar">
        <div style="font-weight:600;margin-bottom:8px">Índice</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          ${CURRENT_SESSION.list.map((_, ix) => `
            <button
              class="btn-small"
              style="
                font-size:12px;
                padding:6px;
                border-radius:8px;
                ${ix === CURRENT_SESSION.i ? 'background:#e0ecff;border-color:#1e40af' : ''}
              "
              onclick="jump(${ix})">${ix + 1}</button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
/* ========== NAVEGACIÓN ========== */
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

/* ========== 🔹 REGISTRO DE RESPUESTA (actualizado) ========== */
function answer(i) {
  const q = CURRENT_SESSION.list[CURRENT_SESSION.i];
  const slug = CURRENT_SESSION.materia || 'general';
  PROG[slug] = PROG[slug] || {};

  // Evita sobrescribir si ya respondió
  if (PROG[slug][q.id]) return;

  // Guarda respuesta y estado
  PROG[slug][q.id] = { chosen: i, status: (i === q.correcta ? 'ok' : 'bad') };

  // Guarda índice y fecha del último intento
  PROG[slug]._lastIndex = CURRENT_SESSION.i;
  PROG[slug]._lastDate = Date.now();   // 🟢 Marca la fecha para sugerencias

  saveAll();
  renderPregunta();
}

/* ========== RECARGA MANUAL DE BANCOS ========== */
async function manualBankReload() {
  alert("⏳ Actualizando bancos...");
  await loadAllBanks(); // función ya definida en bank.js
  alert("✅ Bancos actualizados correctamente");
}
/* ==========================================================
   🔍 TEST DE DIAGNÓSTICO – CARGA DE FUNCIONES
   ========================================================== */
window.addEventListener("load", () => {
  const diag = document.createElement("div");
  diag.id = "diag-box";
  diag.style = `
    position:fixed;
    bottom:10px;
    left:10px;
    background:#1e3a8a;
    color:white;
    padding:8px 12px;
    font-size:13px;
    border-radius:8px;
    z-index:9999;
    font-family:monospace;
  `;

  const tests = [
    ["renderExamenSetup", typeof renderExamenSetup],
    ["renderStatsGlobal", typeof renderStatsGlobal],
    ["subjectsFromBank", typeof subjectsFromBank],
    ["BANK", typeof BANK],
    ["initSidebar", typeof initSidebar],
  ];

  let html = "🩺 Diagnóstico:\n";
  tests.forEach(([name, type]) => {
    html += `${name.padEnd(20)} → ${type}\n`;
  });

  diag.textContent = html;
  document.body.appendChild(diag);
});
