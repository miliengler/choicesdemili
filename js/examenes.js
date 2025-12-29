/* ==========================================================
   📝 MEbank 3.0 – Exámenes Anteriores (UI Final + Logic Fix)
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

  // Color dinámico
  let color = percent === 100 ? '#16a34a' : (percent > 0 ? '#3b82f6' : '#cbd5e1');

  return `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="#f1f5f9" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="${color}"
        stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="11" fill="#334155" font-weight="700">${percent}%</text>
    </svg>
  `;
}

/* ==========================================================
   🏠 Render principal (Con Header Nuevo y Estilos)
   ========================================================== */
function renderExamenesMain() {
  const app = document.getElementById("app");
  const grupos = agruparExamenesPorGrupo();
  const gruposOrdenados = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

  const listaHtml = gruposOrdenados.map(g => renderGrupoExamen(g, grupos[g])).join("");

  // Estilos CSS inyectados para Badges y Botones nuevos
  const styles = `
    <style>
      .badge-status { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; }
      .bg-gray { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }
      .bg-orange { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
      .bg-green { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
      
      .btn-reset {
         background: white; border: 1px solid #fca5a5; color: #ef4444; font-size: 12px; font-weight: 600;
         padding: 0 15px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
         display: flex; align-items: center; justify-content: center; height: 36px;
      }
      .btn-reset:hover { background: #fef2f2; }
      
      .btn-review {
         background: white; border: 1px solid #3b82f6; color: #1d4ed8; font-weight: 700;
      }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div class="card fade" style="max-width:900px;margin:auto;">
      
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

      <div>${listaHtml}</div>

    </div>
  `;
}

function mostrarInfoExamenesOficiales() {
    alert("ℹ️ EXÁMENES OFICIALES\n\n• Pendiente: No iniciado.\n• En Curso: Progreso guardado.\n• Completado: 100% respondido.\n\nPodés usar el botón 'Reiniciar' para borrar tu progreso de un examen específico y volver a practicarlo desde cero.");
}

function agruparExamenesPorGrupo() {
  const grupos = {};
  if(typeof EXAMENES_META !== 'undefined') {
      EXAMENES_META.forEach(ex => {
        if (!grupos[ex.grupo]) grupos[ex.grupo] = [];
        grupos[ex.grupo].push(ex);
      });
      Object.keys(grupos).forEach(g => {
        grupos[g].sort((a, b) => b.anio - a.anio);
      });
  }
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
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px; background:white;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleGrupoExamen('${nombreGrupo}')">
        <div>
            <b style="font-size:16px; color:#1e293b;">${nombreGrupo}</b>
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
  
  // Fondo sutilmente distinto si está abierto
  const bg = abierto ? '#f8fafc' : 'white';

  // Badges
  let badge = `<span class="badge-status bg-gray">Pendiente</span>`;
  if (progreso > 0 && progreso < 100) badge = `<span class="badge-status bg-orange">En Curso</span>`;
  if (progreso === 100) badge = `<span class="badge-status bg-green">Completado</span>`;

  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px; background:${bg}; transition:background 0.2s;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleExamenItem('${ex.id}')">
        
        <div style="flex:1;">
            <div style="display:flex; align-items:center; flex-wrap:wrap;">
                <b style="color:#334155;">${formatearNombreExamen(ex.id)}</b>
                ${badge}
            </div>
            <div style="font-size:12px;color:#64748b; margin-top:2px;">${total} preguntas</div>
        </div>

        <div style="width:36px;height:36px; margin-left:10px;">${renderProgressCircleExam(progreso)}</div>
      </div>
      ${abierto ? renderExpandExamen(ex, preguntas, progreso) : ""}
    </div>
  `;
}

function toggleExamenItem(id) {
  examenesOpenExamen = examenesOpenExamen === id ? null : id;
  renderExamenesMain();
}

function formatearNombreExamen(id) { return id.replace(/_/g, " ").toUpperCase(); }

/* ==========================================================
   📘 Contenido interno (BOTONERA MEJORADA)
   ========================================================== */
function renderExpandExamen(ex, preguntas, progreso) {
  const iniciado = progreso > 0;

  return `
    <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #cbd5e1;">

      <div style="margin-bottom:15px; display:flex; align-items:center; gap:8px; background:white; padding:8px; border-radius:6px; border:1px solid #f1f5f9; width:fit-content;">
        <input type="checkbox" id="timer-check-${ex.id}" style="cursor:pointer; width:16px; height:16px; accent-color:#3b82f6;">
        <label for="timer-check-${ex.id}" style="font-size:13px; color:#334155; cursor:pointer; font-weight:600;">
           ⏱ Activar cronómetro
        </label>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
        <button class="btn-main" onclick="${iniciado ? `reanudarExamen('${ex.id}')` : `iniciarExamen('${ex.id}')`}">
           ${iniciado ? '⏩ Reanudar' : '▶ Iniciar Examen'}
        </button>
        
        ${iniciado ? 
           `<button class="btn-main btn-review" onclick="revisarExamen('${ex.id}')">👁️ Revisar</button>` 
           : `<button class="btn-disabled" disabled style="opacity:0.5; cursor:not-allowed;">👁️ Revisar</button>`
        }
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn-small" style="flex:1; background:#f8fafc; color:#475569;" onclick="verNotasExamen('${ex.id}')">📒 Notas</button>
        <button class="btn-small" style="flex:1; background:#f8fafc; color:#475569;" onclick="verStatsExamen('${ex.id}')">📊 Stats</button>
        
        ${iniciado ? 
           `<button class="btn-reset" onclick="resetearExamen('${ex.id}')">🗑️ Reiniciar</button>` 
           : ''
        }
      </div>

    </div>
  `;
}

/* ==========================================================
   📊 Progreso y Datos
   ========================================================== */
function calcularProgresoExamen(examenId) {
  const preguntas = getQuestionsByExamen(examenId);
  if (!preguntas.length) return 0;
  let resueltas = 0;
  preguntas.forEach(q => {
    // Busca progreso global. Ajustar si tu estructura PROG es distinta.
    const r = PROG[q.materia]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });
  return Math.round((resueltas / preguntas.length) * 100);
}

// 🔥 FIX IMPORTANTE: Búsqueda robusta de preguntas
function getQuestionsByExamen(examId) {
    if (typeof BANK === 'undefined' || !BANK.questions) return [];
    
    return BANK.questions.filter(q => {
        // 1. Coincidencia exacta de propiedad 'examen' o 'source'
        if (q.examen === examId) return true;
        if (q.source === examId) return true;
        
        // 2. Coincidencia por prefijo en el ID (ej: "eu_2023_01" empieza con "eu_2023")
        if (q.id && q.id.startsWith(examId)) return true;
        
        return false;
    });
}

/* ==========================================================
   ▶ Lógica de Botones
   ========================================================== */

function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas.");

  const checkEl = document.getElementById(`timer-check-${id}`);
  const usarTimer = checkEl ? checkEl.checked : false;

  iniciarResolucion({
    modo: "examen",
    preguntas,
    usarTimer: usarTimer,
    titulo: formatearNombreExamen(id),
    examenId: id
  });
}

function reanudarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  // Filtrar solo las pendientes
  const pendientes = preguntas.filter(q => {
      const r = PROG[q.materia]?.[q.id];
      return !r || (r.status !== 'ok' && r.status !== 'bad');
  });

  if(pendientes.length === 0) return alert("¡Examen completado! Usá 'Revisar' para ver tus respuestas.");

  const checkEl = document.getElementById(`timer-check-${id}`);
  const usarTimer = checkEl ? checkEl.checked : true; // Por defecto true al reanudar

  iniciarResolucion({
    modo: "reanudar",
    preguntas: pendientes,
    usarTimer: usarTimer, 
    titulo: formatearNombreExamen(id) + " (Cont.)",
    examenId: id
  });
}

function revisarExamen(id) {
    const preguntas = getQuestionsByExamen(id);
    // Revisión: Enviamos todas las preguntas para ver el sidebar completo
    iniciarResolucion({
        modo: "revision",
        preguntas: preguntas,
        usarTimer: false,
        titulo: "Revisión: " + formatearNombreExamen(id),
        mostrarNotas: true
    });
}

function resetearExamen(id) {
    if(!confirm("⚠️ ¿Estás seguro de querer REINICIAR este examen?\n\nSe borrarán todas tus respuestas de este examen específico. Esta acción no se puede deshacer.")) {
        return;
    }

    const preguntas = getQuestionsByExamen(id);
    let cambios = false;

    // Borrado quirúrgico en PROG
    preguntas.forEach(q => {
        if(PROG[q.materia] && PROG[q.materia][q.id]) {
            delete PROG[q.materia][q.id];
            cambios = true;
        }
    });

    if(cambios) {
        if(typeof saveProgress === 'function') saveProgress();
        alert("♻️ Examen reiniciado.");
        renderExamenesMain(); // Refrescar pantalla
    } else {
        alert("No se encontró progreso para borrar.");
    }
}

function verNotasExamen(id) { renderNotasMain(); } // Redirige al main de notas
function verStatsExamen(id) { renderStatsExamen(id); } // (Si tenés esta función definida)
