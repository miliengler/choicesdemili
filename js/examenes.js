/* ==========================================================
   📝 MEbank 3.0 – Exámenes anteriores (Con Checkbox Timer)
   ========================================================== */

/* ==========================================================
   🔵 CÍRCULO DE PROGRESO ANIMADO
   ========================================================== */
function renderProgressCircleExam(percent) {
  const size = 42;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="#e2e8f0" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="${percent === 0 ? '#cbd5e1' : '#16a34a'}"
        stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#334155" font-weight="600">${percent}%</text>
    </svg>
  `;
}

/* ==========================================================
   🏠 Render principal 
   ========================================================== */
function renderExamenesMain() {
  const app = document.getElementById("app");
  const grupos = agruparExamenesPorGrupo();
  const gruposOrdenados = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">
      <h2 style="margin-bottom:6px;">Exámenes anteriores</h2>
      <p style="color:#64748b;margin:0 0 25px 0;">Elegí un examen para practicar.</p>
      ${gruposOrdenados.map(g => renderGrupoExamen(g, grupos[g])).join("")}
      <div style="margin-top:24px;text-align:center;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;
}

function agruparExamenesPorGrupo() {
  const grupos = {};
  EXAMENES_META.forEach(ex => {
    if (!grupos[ex.grupo]) grupos[ex.grupo] = [];
    grupos[ex.grupo].push(ex);
  });
  Object.keys(grupos).forEach(g => {
    grupos[g].sort((a, b) => b.anio - a.anio);
  });
  return grupos;
}

/* ==========================================================
   🏛 Render de grupo e items
   ========================================================== */
let examenesOpenGrupo = null;
let examenesOpenExamen = null;

function renderGrupoExamen(nombreGrupo, lista) {
  const abierto = examenesOpenGrupo === nombreGrupo;
  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleGrupoExamen('${nombreGrupo}')">
        <div><b>${nombreGrupo}</b><div style="font-size:12px;color:#64748b;">${lista.length} exámenes disponibles</div></div>
        <div style="width:42px;height:42px;">${renderProgressCircleExam(0)}</div>
      </div>
      ${abierto ? renderGrupoExamenExpanded(lista) : ""}
    </div>
  `;
}

function toggleGrupoExamen(grupo) {
  examenesOpenGrupo = examenesOpenGrupo === grupo ? null : grupo;
  examenesOpenExamen = null;
  renderExamenesMain();
}

function renderGrupoExamenExpanded(lista) {
  return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;">${lista.map(ex => renderItemExamen(ex)).join("")}</div>`;
}

function renderItemExamen(ex) {
  const preguntas = getQuestionsByExamen(ex.id);
  const total = preguntas.length;
  const progreso = calcularProgresoExamen(ex.id);
  const abierto = examenesOpenExamen === ex.id;

  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleExamenItem('${ex.id}')">
        <div><b>${formatearNombreExamen(ex.id)}</b><div style="font-size:12px;color:#64748b;">${total} preguntas</div></div>
        <div style="width:42px;height:42px;">${renderProgressCircleExam(progreso)}</div>
      </div>
      ${abierto ? renderExpandExamen(ex, preguntas) : ""}
    </div>
  `;
}

function toggleExamenItem(id) {
  examenesOpenExamen = examenesOpenExamen === id ? null : id;
  renderExamenesMain();
}

function formatearNombreExamen(id) { return id.replace(/_/g, " ").toUpperCase(); }

/* ==========================================================
   📘 Contenido interno (AQUÍ ESTÁ EL CAMBIO DEL CHECKBOX)
   ========================================================== */
function renderExpandExamen(ex, preguntas) {
  const hayProgreso = preguntas.some(q => {
    const r = PROG[q.materia]?.[q.id];
    return r && (r.status === "ok" || r.status === "bad");
  });

  // 👇 AQUÍ AGREGAMOS EL CHECKBOX ÚNICO PARA ESTE EXAMEN
  return `
    <div style="margin-top:12px;padding-top:10px;border-top:1px dashed #e2e8f0;">

      <div style="margin-bottom:15px; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="timer-check-${ex.id}" style="cursor:pointer;">
        <label for="timer-check-${ex.id}" style="font-size:14px; color:#334155; cursor:pointer;">
           ⏱ Activar cronómetro para este examen
        </label>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn-main" onclick="iniciarExamen('${ex.id}')">Iniciar examen</button>
        ${hayProgreso ? `<button class="btn-main" onclick="reanudarExamen('${ex.id}')">Reanudar</button>` : ""}
        <button class="btn-main" onclick="verNotasExamen('${ex.id}')">Notas</button>
        <button class="btn-main" onclick="verStatsExamen('${ex.id}')">Estadísticas</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   📊 Progreso
   ========================================================== */
function calcularProgresoExamen(examenId) {
  const preguntas = getQuestionsByExamen(examenId);
  if (!preguntas.length) return 0;
  let resueltas = 0;
  preguntas.forEach(q => {
    const r = PROG[q.materia]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });
  return Math.round((resueltas / preguntas.length) * 100);
}

/* ==========================================================
   ▶ Iniciar examen (LEE EL CHECKBOX)
   ========================================================== */
function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas.");

  // 👇 BUSCAMOS EL CHECKBOX ESPECÍFICO DE ESTE EXAMEN
  const checkEl = document.getElementById(`timer-check-${id}`);
  const usarTimer = checkEl ? checkEl.checked : false;

  iniciarResolucion({
    modo: "examen",
    preguntas,
    usarTimer: usarTimer, // ✅ Opcional real
    titulo: formatearNombreExamen(id)
  });
}

function reanudarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  // Al reanudar, asumimos que querés seguir como estabas o sin timer por defecto, 
  // pero podés forzarlo a true si querés. Lo dejo en false o true según prefieras.
  // Por ahora sin timer al reanudar para no molestar.
  iniciarResolucion({
    modo: "reanudar",
    preguntas,
    usarTimer: true, 
    titulo: formatearNombreExamen(id)
  });
}

function verNotasExamen(id) { renderNotasMain(id); }
function verStatsExamen(id) { renderStatsExamen(id); }
