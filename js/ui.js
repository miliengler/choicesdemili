/* ==========================================================
   🏠 INTERFAZ PRINCIPAL – Home, materias y práctica
   (Adaptado al sistema unificado MEbank)
   ========================================================== */

/* ---------- HOME ---------- */
function renderHome() {
  app.innerHTML = `
    <div class="home-menu fade">
      <button class="btn-main btn-blue" onclick="renderSubjects()">🧩 Choice por materia</button>
      <button class="btn-main btn-blue" onclick="alert('📄 Próximamente')">📄 Exámenes anteriores</button>
      <button class="btn-main btn-blue" onclick="renderExamenSetup()">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main btn-blue" onclick="alert('📊 Estadísticas próximamente')">📊 Estadísticas generales</button>
      <button class="btn-main btn-blue" onclick="alert('📔 Mis notas próximamente')">📔 Mis notas</button>
      <hr class="divider">
      <button class="btn-small btn-grey" onclick="manualBankReload()">🔄 Actualizar bancos</button>
    </div>
  `;
}

/* ---------- Normalizador ---------- */
const normalize = str =>
  str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";

/* ---------- LISTA DE MATERIAS ---------- */
function renderSubjects() {
  // 🔹 Materias desde MEbank
  const subs = (MEbank.subjects || []).sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "").localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" }
    )
  );

  // 🔹 Contador de preguntas por materia
  const resumen = (MEbank.questions || []).reduce((acc, q) => {
    const key = normalize(q.materia);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 🔹 Render de materias
  const list = subs.map(s => {
    const key = normalize(s.slug);
    const count = resumen[key] || 0;
    const prog = PROG[s.slug] || {};
    const last = prog._lastIndex != null ? prog._lastIndex + 1 : null;
    const reanudarBtn = last
      ? `<button class='btn-small' onclick='resumeSubject("${s.slug}")'>🔄 Reanudar (${last})</button>`
      : ``;

    return `
      <li class="acc-item">
        <div class="acc-header" onclick="toggleAcc('${s.slug}')">
          <div class="acc-title">${s.name}</div>
          <div class="acc-count hidden" id="count-${s.slug}">${count} preguntas</div>
        </div>
        <div class="acc-content" id="acc-${s.slug}">
          <div class="acc-actions">
            <label class="small">📘 Desde # 
              <input type="number" id="start-${s.slug}" min="1" max="${count}" value="1">
            </label>
            <button class="btn-small" onclick='startPractica("${s.slug}", getStart("${s.slug}", ${count})-1)'>🧩 Práctica</button>
            <button class="btn-small" onclick='startRepaso("${s.slug}")'>📖 Repasar</button>
            ${reanudarBtn}
            <button class="btn-small" onclick='showStats("${s.slug}")'>📊 Estadísticas</button>
          </div>
        </div>
      </li>`;
  }).join("");

  app.innerHTML = `
    <div class="card fade">
      <button class="btn-small btn-grey" onclick="renderHome()">⬅️ Volver</button>
      <ul class="accordion">${list}</ul>
    </div>
  `;
}

/* ---------- Acordeón ---------- */
window.toggleAcc = (slug) => {
  const el = document.getElementById(`acc-${slug}`);
  const cnt = document.getElementById(`count-${slug}`);
  const open = el.style.display === "block";
  document.querySelectorAll(".acc-content").forEach(e => (e.style.display = "none"));
  document.querySelectorAll(".acc-count").forEach(c => c.classList.add("hidden"));
  if (!open) {
    el.style.display = "block";
    cnt.classList.remove("hidden");
  }
};

/* ---------- Helpers ---------- */
function getStart(slug, total) {
  const el = document.getElementById(`start-${slug}`);
  let v = parseInt((el && el.value) ? el.value : "1", 10);
  if (isNaN(v) || v < 1) v = 1;
  if (v > total) v = total;
  return v;
}

/* ---------- Reanudar ---------- */
function resumeSubject(slug) {
  const progreso = PROG[slug] || {};
  const start = progreso._lastIndex || 0;
  startPractica(slug, start);
}

/* ---------- Estadísticas placeholder ---------- */
function showStats(slug) {
  alert(`📊 Próximamente estadísticas para ${slug}`);
}

/* ==========================================================
   🔹 MOTOR DE PREGUNTAS
   ========================================================== */
let CURRENT = { list: [], i: 0, materia: "" };

function startPractica(slug, startIndex = 0) {
  // 🔹 Ahora usamos directamente MEbank.byMateria
  const listAll = (MEbank.byMateria?.[slug] || [])
    .sort((a, b) => a.id.localeCompare(b.id));

  if (!listAll.length) {
    app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b>.</div>`;
    return;
  }

  CURRENT = { list: listAll.slice(startIndex), i: 0, materia: slug };
  PROG[slug] = PROG[slug] || {};
  PROG[slug]._lastIndex = startIndex;
  saveAll();
  renderPregunta();
}

function startRepaso(slug) {
  const listAll = (MEbank.byMateria?.[slug] || [])
    .sort((a, b) => a.id.localeCompare(b.id));

  const prog = PROG[slug] || {};
  const list = listAll.filter(q => prog[q.id]?.status === "bad");

  if (!list.length) {
    app.innerHTML = `<div class='card'>No tenés incorrectas en <b>${slug}</b>.<br><br><button class='btn-main' onclick='renderSubjects()'>Volver</button></div>`;
    return;
  }

  CURRENT = { list, i: 0, materia: slug };
  renderPregunta();
}

/* ---------- Render de pregunta ---------- */
function renderPregunta() {
  const q = CURRENT.list[CURRENT.i];
  if (!q) {
    app.innerHTML = `<div class='card'>Sin preguntas.<br><button class='btn-main' onclick='renderSubjects()'>Volver</button></div>`;
    return;
  }

  const prog = PROG[CURRENT.materia] || {};
  const ans = prog[q.id]?.chosen;

  const opts = q.opciones.map((t, i) => {
    let cls = "";
    if (ans != null) {
      if (i === q.correcta) cls = "correct";
      else if (i === ans) cls = "wrong";
    }
    return `<label class='option ${cls}' onclick='answer(${i})'><input type='radio' name='opt'> ${String.fromCharCode(97 + i)}) ${t}</label>`;
  }).join("");

  const exp = ans != null ? `<div class='explain'>${q.explicacion || ""}</div>` : "";

  app.innerHTML = `
    <div class="q-layout">
      <div class="q-card fade">
        <div><b>${CURRENT.materia.toUpperCase()}</b> · ${CURRENT.i + 1}/${CURRENT.list.length}</div>
        <div class="enunciado">${q.enunciado}</div>
        <div class="options">${opts}</div>
        ${exp}
        <div class="nav-row">
          <button class="btn-small" onclick="prevQ()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅️ Anterior</button>
          <button class="btn-small" onclick="nextQ()" ${CURRENT.i === CURRENT.list.length - 1 ? "disabled" : ""}>Siguiente ➡️</button>
          <button class="btn-small btn-grey" onclick="renderSubjects()">🏠 Volver</button>
        </div>
      </div>
    </div>
  `;

  // 🧭 Sidebar moderna
  if (!document.getElementById("exam-sidebar")) {
    initSidebar();
  } else {
    renderSidebarPage();
  }
}

/* ==========================================================
   🧭 NAVEGACIÓN Y RESPUESTAS
   ========================================================== */

window.jump = (ix) => {
  CURRENT.i = ix;
  updateLastIndex();
  renderPregunta();
};

function prevQ() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    updateLastIndex();
    renderPregunta();
  }
}

function nextQ() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    updateLastIndex();
    renderPregunta();
  }
}

function updateLastIndex() {
  if (CURRENT.materia) {
    PROG[CURRENT.materia] = PROG[CURRENT.materia] || {};
    PROG[CURRENT.materia]._lastIndex = Math.max(PROG[CURRENT.materia]._lastIndex ?? 0, CURRENT.i);
    saveAll();
  }
}

function answer(i) {
  const q = CURRENT.list[CURRENT.i];
  const slug = CURRENT.materia || "general";
  PROG[slug] = PROG[slug] || {};
  if (PROG[slug][q.id]) return;
  PROG[slug][q.id] = { chosen: i, status: i === q.correcta ? "ok" : "bad" };
  PROG[slug]._lastIndex = CURRENT.i;
  saveAll();
  renderPregunta();
}
/* ==========================================================
   🚀 ARRANQUE AUTOMÁTICO DE LA APP
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const appEl = document.getElementById("app");
  if (appEl && typeof renderHome === "function") {
    window.app = appEl;
    renderHome();
  } else {
    console.warn("⚠️ No se pudo iniciar la interfaz principal (renderHome no encontrado)");
  }
});
