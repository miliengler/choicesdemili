/* ==========================================================
   📝 MEbank 3.0 – Exámenes Anteriores (UI Final + Checkbox)
   ========================================================== */

// NOTA: Asegurate de tener definida EXAMENES_META en bank.js o aquí mismo.
// Si no la tenés, descomentá esto para probar:
/*
const EXAMENES_META = [
  { id: 'eu_2023', grupo: 'Examen Único', anio: 2023 },
  { id: 'eu_2022', grupo: 'Examen Único', anio: 2022 },
  { id: 'caba_2023', grupo: 'Municipales CABA', anio: 2023 }
];
*/

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
        stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#334155" font-weight="600">${percent}%</text>
    </svg>
  `;
}

/* ==========================================================
   🏠 Render Principal (Con Header Nuevo)
   ========================================================== */
function renderExamenesMain() {
  const app = document.getElementById("app");
  
  // Agrupamos datos
  const grupos = agruparExamenesPorGrupo();
  const gruposOrdenados = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

  // Generamos el HTML de la lista
  const listaHtml = gruposOrdenados.map(g => renderGrupoExamen(g, grupos[g])).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:900px; margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <h2 style="margin:0;">📝 Exámenes Anteriores</h2>
            <button onclick="mostrarInfoExamenesOficiales()" 
                    style="width:24px; height:24px; border-radius:50%; border:1px solid #cbd5e1; background:white; color:#64748b; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ?
            </button>
          </div>
          <p style="color:#64748b; margin:0; font-size:14px;">
             Elegí un examen oficial para practicar.
          </p>
        </div>
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div>
         ${listaHtml}
      </div>

    </div>
  `;
}

/* ==========================================================
   ⚙️ Lógica de Ayuda
   ========================================================== */
function mostrarInfoExamenesOficiales() {
    alert("ℹ️ EXÁMENES OFICIALES\n\nAquí encontrarás exámenes completos de años anteriores agrupados por institución.\n\n• Podés activar el cronómetro con la casilla de verificación antes de iniciar.\n• Al finalizar, podrás revisar tus notas y estadísticas específicas de ese examen.");
}

/* ==========================================================
   🏛 Lógica de Grupos
   ========================================================== */
function agruparExamenesPorGrupo() {
  const grupos = {};
  if (typeof EXAMENES_META === 'undefined') return {}; // Seguridad

  EXAMENES_META.forEach(ex => {
    if (!grupos[ex.grupo]) grupos[ex.grupo] = [];
    grupos[ex.grupo].push(ex);
  });
  Object.keys(grupos).forEach(g => {
    grupos[g].sort((a, b) => b.anio - a.anio);
  });
  return grupos;
}

let examenesOpenGrupo = null;
let examenesOpenExamen = null;

function renderGrupoExamen(nombreGrupo, lista) {
  const abierto = examenesOpenGrupo === nombreGrupo;
  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px; background:white;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleGrupoExamen('${nombreGrupo}')">
        <div>
           <b style="color:#1e293b; font-size:16px;">${nombreGrupo}</b>
           <div style="font-size:12px;color:#64748b;">${lista.length} exámenes disponibles</div>
        </div>
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
  return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;">${lista.map(ex => renderItemExamen(ex)).join("")}</div>`;
}

function renderItemExamen(ex) {
  const preguntas = getQuestionsByExamen(ex.id);
  const total = preguntas.length;
  const progreso = calcularProgresoExamen(ex.id);
  const abierto = examenesOpenExamen === ex.id;
  
  // Fondo sutilmente distinto para items internos
  const bg = abierto ? '#f8fafc' : 'white'; 

  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px; background:${bg};">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleExamenItem('${ex.id}')">
        <div>
            <b style="color:#334155;">${formatearNombreExamen(ex.id)}</b>
            <div style="font-size:12px;color:#64748b;">${total} preguntas</div>
        </div>
        <div style="width:36px;height:36px;">${renderProgressCircleExam(progreso)}</div>
      </div>
      ${abierto ? renderExpandExamen(ex, preguntas) : ""}
    </div>
  `;
}

function toggleExamenItem(id) {
  examenesOpenExamen = examenesOpenExamen === id ? null : id;
  renderExamenesMain();
}

function formatearNombreExamen(id) { 
    return id.replace(/_/g, " ").toUpperCase(); 
}

/* ==========================================================
   📘 Contenido interno (Checkbox + Botones)
   ========================================================== */
function renderExpandExamen(ex, preguntas) {
  const hayProgreso = preguntas.some(q => {
    const r = PROG[q.materia]?.[q.id];
    return r && (r.status === "ok" || r.status === "bad");
  });

  return `
    <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #cbd5e1;">

      <div style="margin-bottom:15px; display:flex; align-items:center; gap:8px; background:white; padding:8px; border-radius:6px; border:1px solid #f1f5f9; width:fit-content;">
        <input type="checkbox" id="timer-check-${ex.id}" style="cursor:pointer; width:16px; height:16px; accent-color:#3b82f6;">
        <label for="timer-check-${ex.id}" style="font-size:13px; color:#334155; cursor:pointer; font-weight:600;">
           ⏱ Activar cronómetro
        </label>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <button class="btn-main" style="flex:1;" onclick="iniciarExamen('${ex.id}')">▶ Iniciar</button>
        
        ${hayProgreso ? `<button class="btn-main" style="flex:1; background:white; border:1px solid #3b82f6; color:#1d4ed8;" onclick="reanudarExamen('${ex.id}')">⏩ Reanudar</button>` : ""}
        
        <button class="btn-small" style="flex:1; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;" onclick="alert('Próximamente: Notas de este examen')">📒 Notas</button>
        <button class="btn-small" style="flex:1; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;" onclick="alert('Próximamente: Estadísticas de este examen')">📊 Stats</button>
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
    // Nota: Ajustá esta lógica si PROG guarda diferente
    // Asumo PROG[materia][id]
    const r = PROG[q.materia]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });
  return Math.round((resueltas / preguntas.length) * 100);
}

// Helper si no lo tenés global
function getQuestionsByExamen(examId) {
    if (typeof BANK === 'undefined') return [];
    // Asume que BANK.questions tiene una propiedad 'source' o que el ID empieza con el examId
    // AJUSTAR SEGÚN TU ESTRUCTURA REAL. 
    // Opción A (por propiedad): return BANK.questions.filter(q => q.source === examId);
    // Opción B (por prefijo ID): 
    return BANK.questions.filter(q => q.id.startsWith(examId)); 
}

/* ==========================================================
   ▶ Iniciar examen
   ========================================================== */
function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas para este examen.");

  const checkEl = document.getElementById(`timer-check-${id}`);
  const usarTimer = checkEl ? checkEl.checked : false;

  iniciarResolucion({
    modo: "examen",
    preguntas,
    usarTimer: usarTimer,
    titulo: formatearNombreExamen(id)
  });
}

function reanudarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  // Al reanudar, solemos querer seguir con las pendientes
  // Filtramos las ya respondidas
  const pendientes = preguntas.filter(q => {
      const r = PROG[q.materia]?.[q.id];
      return !r || (r.status !== 'ok' && r.status !== 'bad');
  });

  if(pendientes.length === 0) return alert("¡Ya completaste todas las preguntas de este examen!");

  iniciarResolucion({
    modo: "reanudar",
    preguntas: pendientes,
    usarTimer: true, 
    titulo: formatearNombreExamen(id) + " (Continuación)"
  });
}
