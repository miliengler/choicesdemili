/* ==========================================================
   📝 MEbank 3.0 – Exámenes Anteriores (Con Configuración Completa)
   ========================================================== */

/* ==========================================================
   🎨 PALETA DE COLORES (Para el gráfico)
   ========================================================== */
const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#d946ef", "#e11d48", "#22c55e", "#64748b"
];

/* ==========================================================
   🔵 CÍRCULO DE PROGRESO (UI Exámenes)
   ========================================================== */
function renderProgressCircleExam(percent) {
  const size = 42;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
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
   🏠 Render Principal
   ========================================================== */
function renderExamenesMain() {
  const app = document.getElementById("app");
  const grupos = agruparExamenesPorGrupo();
  const gruposOrdenados = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

  const listaHtml = gruposOrdenados.map(g => renderGrupoExamen(g, grupos[g])).join("");

  // INYECCIÓN DE ESTILOS (Badges + Chart + Modal)
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
      
      .btn-review { background: white; border: 1px solid #3b82f6; color: #1d4ed8; font-weight: 700; }
      
      /* ESTILOS DEL GRÁFICO (MODAL) */
      .chart-container { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; margin-top: 10px; }
      .donut-chart {
        width: 140px; height: 140px; border-radius: 50%;
        position: relative; margin: 0 auto;
      }
      .donut-hole {
        width: 90px; height: 90px; background: var(--bg-card, white); border-radius: 50%;
        position: absolute; top: 25px; left: 25px;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
      }
      .chart-legend { flex: 1; min-width: 200px; max-height: 300px; overflow-y: auto; }
      .legend-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
      .legend-color { width: 10px; height: 10px; border-radius: 2px; margin-right: 8px; display: inline-block; }
      .legend-bar-bg { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; margin: 0 10px; overflow: hidden; }
      .legend-bar-fill { height: 100%; border-radius: 3px; }
      
      .disclaimer-box {
        margin-top: 20px; padding: 10px; background: #fffbeb; border: 1px solid #fcd34d; 
        border-radius: 8px; font-size: 11px; color: #92400e; display: flex; gap: 8px;
      }
      
      /* Checkbox bonito */
      .config-check { display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px; border-radius: 6px; border: 1px solid #f1f5f9; cursor: pointer; user-select: none; }
      .config-check:hover { background: #f8fafc; border-color: #e2e8f0; }
      .config-check input { cursor: pointer; accent-color: #3b82f6; width: 16px; height: 16px; }
      .config-label { font-size: 13px; color: #334155; font-weight: 600; }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    
    <div id="analysisModal" class="modal-overlay" onclick="closeModals(event)" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; backdrop-filter:blur(2px);">
        <div class="modal-content" style="background:var(--bg-card, white); padding:25px; border-radius:12px; max-width:600px; width:90%; box-shadow:0 10px 30px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
                <h3 id="analysisTitle" style="margin:0; font-size:18px; color:var(--text-main, #1e293b);">📊 Análisis</h3>
                <button onclick="document.getElementById('analysisModal').style.display='none'" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-sec, #64748b);">×</button>
            </div>
            <div id="analysisBody"></div>
        </div>
    </div>

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

function closeModals(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
}

function mostrarInfoExamenesOficiales() {
    alert("ℹ️ EXÁMENES OFICIALES\n\n• Pendiente: No iniciado.\n• En Curso: Progreso guardado.\n• Completado: 100% respondido.\n\nPodés usar el botón '📊' para ver estadísticas de qué materias se toman más.");
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
   🏛 Render de Grupos
   ========================================================== */
let examenesOpenGrupo = null;
let examenesOpenExamen = null;

function renderGrupoExamen(nombreGrupo, lista) {
  const abierto = examenesOpenGrupo === nombreGrupo;
  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px; background:white;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <div style="cursor:pointer; flex:1;" onclick="toggleGrupoExamen('${nombreGrupo}')">
            <b style="font-size:16px; color:#1e293b;">${nombreGrupo}</b>
            <div style="font-size:12px;color:#64748b;">${lista.length} exámenes disponibles</div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
             <button onclick="analizarGrupo('${nombreGrupo}')" title="Analizar todo el historial de ${nombreGrupo}"
                     style="background:#f0f9ff; border:1px solid #bae6fd; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;">
                📊
             </button>
             <div style="width:42px;height:42px; cursor:pointer;" onclick="toggleGrupoExamen('${nombreGrupo}')">
                ${renderProgressCircleExam(0)}
             </div> 
        </div>

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
  const bg = abierto ? '#f8fafc' : 'white';

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
   📘 Botonera Expandida (CONFIGURACIÓN)
   ========================================================== */
function renderExpandExamen(ex, preguntas, progreso) {
  const iniciado = progreso > 0;

  // NUEVO: Checkboxes de configuración
  return `
    <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #cbd5e1;">

      <div style="margin-bottom:15px; display:flex; flex-wrap:wrap; gap:10px;">
          <label class="config-check" for="timer-check-${ex.id}">
            <input type="checkbox" id="timer-check-${ex.id}">
            <span class="config-label">⏱ Reloj</span>
          </label>
          
          <label class="config-check" for="correction-check-${ex.id}">
            <input type="checkbox" id="correction-check-${ex.id}">
            <span class="config-label">📝 Corregir al final</span>
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
        <button class="btn-small" style="flex:1; background:#f8fafc; color:#475569;" onclick="analizarExamen('${ex.id}')">📊 Análisis</button>
        <button class="btn-small" style="flex:1; background:#f8fafc; color:#475569;" onclick="verNotasExamen('${ex.id}')">📒 Notas</button>
        
        ${iniciado ? 
           `<button class="btn-reset" onclick="resetearExamen('${ex.id}')">🗑️ Reset</button>` 
           : ''
        }
      </div>

    </div>
  `;
}

/* ==========================================================
   📊 LÓGICA DE ANÁLISIS (GRÁFICO)
   ========================================================== */
function analizarExamen(examId) {
    const preguntas = getQuestionsByExamen(examId);
    mostrarModalAnalisis(formatearNombreExamen(examId), preguntas);
}

function analizarGrupo(nombreGrupo) {
    if(typeof EXAMENES_META === 'undefined') return;
    
    // IDs del grupo
    const examenesDelGrupo = EXAMENES_META.filter(e => e.grupo === nombreGrupo);
    
    let todasLasPreguntas = [];
    examenesDelGrupo.forEach(ex => {
        todasLasPreguntas = todasLasPreguntas.concat(getQuestionsByExamen(ex.id));
    });

    mostrarModalAnalisis(`Histórico: ${nombreGrupo}`, todasLasPreguntas);
}

function mostrarModalAnalisis(titulo, preguntas) {
    const modal = document.getElementById('analysisModal');
    const titleEl = document.getElementById('analysisTitle');
    const bodyEl = document.getElementById('analysisBody');

    titleEl.textContent = `📊 Análisis: ${titulo}`;

    if(preguntas.length === 0) {
        bodyEl.innerHTML = "<p>No hay preguntas disponibles para analizar.</p>";
        modal.style.display = 'flex';
        return;
    }

    const counts = {};
    let totalTags = 0; 
    
    preguntas.forEach(q => {
        const materias = Array.isArray(q.materia) ? q.materia : [q.materia];
        materias.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
            totalTags++;
        });
    });

    const data = Object.keys(counts)
        .map(m => ({ name: m, count: counts[m] }))
        .sort((a, b) => b.count - a.count);

    const chartData = data.map((d, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        const percent = (d.count / totalTags) * 100;
        return { ...d, color, percent };
    });

    let gradientStr = "";
    let currentPerc = 0;
    chartData.forEach(d => {
        const endPerc = currentPerc + d.percent;
        gradientStr += `${d.color} ${currentPerc}% ${endPerc}%,`;
        currentPerc = endPerc;
    });
    gradientStr = gradientStr.slice(0, -1); 

    const listHtml = chartData.map(d => `
        <div class="legend-item">
            <div style="display:flex; align-items:center; width:130px;">
                <span class="legend-color" style="background:${d.color}"></span>
                <span style="font-weight:600; text-transform:capitalize; color:var(--text-main, #334155); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                   ${d.name.replace(/_/g, " ")}
                </span>
            </div>
            <div class="legend-bar-bg">
                <div class="legend-bar-fill" style="width:${d.percent}%; background:${d.color};"></div>
            </div>
            <div style="font-weight:700; color:var(--text-main, #1e293b); font-size:12px;">${d.count}</div>
        </div>
    `).join("");

    bodyEl.innerHTML = `
        <div class="chart-container">
            <div class="donut-chart" style="background: conic-gradient(${gradientStr});">
                <div class="donut-hole">
                    <div style="font-size:24px; font-weight:800; color:var(--text-main, #1e293b);">${preguntas.length}</div>
                    <div style="font-size:10px; color:var(--text-sec, #64748b); font-weight:600; text-transform:uppercase;">Preguntas</div>
                </div>
            </div>
            <div class="chart-legend">${listHtml}</div>
        </div>
        <div class="disclaimer-box">
           <span style="font-size:16px;">⚠️</span>
           <div><b>Nota:</b> El total de temas (${totalTags}) puede ser mayor al de preguntas por temas multidisciplinarios.</div>
        </div>
    `;

    modal.style.display = 'flex';
}

/* ==========================================================
   📊 Progreso y Helpers
   ========================================================== */
function calcularProgresoExamen(examenId) {
  const preguntas = getQuestionsByExamen(examenId);
  if (!preguntas.length) return 0;
  let resueltas = 0;
  preguntas.forEach(q => {
    // Busca en la materia de la pregunta si hay respuesta
    const mat = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const r = PROG[mat]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });
  return Math.round((resueltas / preguntas.length) * 100);
}

function getQuestionsByExamen(examId) {
    if (typeof BANK === 'undefined' || !BANK.questions) return [];
    return BANK.questions.filter(q => {
        if (q.examen === examId) return true;
        if (q.source === examId) return true;
        if (q.id && q.id.startsWith(examId)) return true;
        return false;
    });
}

// LÓGICA DE INICIO CON CONFIGURACIÓN
function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas.");
  
  // Leemos configs
  const checkTimer = document.getElementById(`timer-check-${id}`);
  const checkCorrection = document.getElementById(`correction-check-${id}`);
  
  iniciarResolucion({ 
      modo: "examen", 
      preguntas, 
      usarTimer: checkTimer ? checkTimer.checked : false, 
      titulo: formatearNombreExamen(id), 
      examenId: id,
      correccionFinal: checkCorrection ? checkCorrection.checked : false // Pasamos la config
  });
}

function reanudarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  // Filtramos pendientes
  const pendientes = preguntas.filter(q => { 
      const mat = Array.isArray(q.materia) ? q.materia[0] : q.materia;
      const r = PROG[mat]?.[q.id]; 
      return !r || (r.status !== 'ok' && r.status !== 'bad'); 
  });
  
  if(pendientes.length === 0) return alert("¡Examen completado!");
  
  // Leemos configs (el usuario puede cambiarlas al reanudar)
  const checkTimer = document.getElementById(`timer-check-${id}`);
  const checkCorrection = document.getElementById(`correction-check-${id}`);

  iniciarResolucion({ 
      modo: "reanudar", 
      preguntas: pendientes, 
      usarTimer: checkTimer ? checkTimer.checked : true, 
      titulo: formatearNombreExamen(id) + " (Cont.)", 
      examenId: id,
      correccionFinal: checkCorrection ? checkCorrection.checked : false // Pasamos la config
  });
}

function revisarExamen(id) {
    iniciarResolucion({ modo: "revision", preguntas: getQuestionsByExamen(id), usarTimer: false, titulo: "Rev: " + formatearNombreExamen(id), mostrarNotas: true });
}

function resetearExamen(id) {
    if(!confirm("⚠ ¿Reiniciar este examen? Se borrará todo el progreso.")) return;
    const preguntas = getQuestionsByExamen(id);
    let cambios = false;
    preguntas.forEach(q => { 
        const mat = Array.isArray(q.materia) ? q.materia[0] : q.materia;
        if(PROG[mat] && PROG[mat][q.id]) { delete PROG[mat][q.id]; cambios = true; } 
    });
    
    if(cambios) { 
        if(typeof saveProgress === 'function') saveProgress(); 
        renderExamenesMain(); 
    } else { 
        alert("No había progreso."); 
    }
}

function verNotasExamen(id) { renderNotasMain(); }
