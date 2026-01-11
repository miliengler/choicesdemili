/* ==========================================================
   📝 MEbank 3.0 – Exámenes Anteriores (Rediseño Estético UI)
   ========================================================== */

/* ==========================================================
   🎨 PALETA DE COLORES (Para gráficos)
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
  const size = 38; // Un poco más sutil
  const stroke = 3;
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
      <text x="50%" y="55%" text-anchor="middle" font-size="10" fill="#334155" font-weight="700">${percent}%</text>
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

  // Estilos específicos para igualar a Simulacro/Choice
  const styles = `
    <style>
      /* Estilos unificados con Simulacro */
      .exam-box { 
          background: white; border: 1px solid #e2e8f0; border-radius: 12px; 
          margin-bottom: 12px; transition: all 0.2s; overflow: hidden;
      }
      .exam-header {
          padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          background: white;
      }
      .exam-header:hover { background: #f8fafc; }
      
      .exam-expanded {
          padding: 0 16px 16px 16px;
          border-top: 1px solid #f1f5f9;
          background: #fdfdfd;
          animation: fadeIn 0.3s ease;
      }

      /* Badges */
      .badge-status { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; }
      .bg-gray { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }
      .bg-orange { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
      .bg-green { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
      
      /* Switches (Iguales a Simulacro) */
      .toggle-switch { position: relative; display: inline-block; width: 34px; height: 20px; margin-right: 8px; vertical-align: middle; }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 20px; }
      .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #16a34a; }
      input:checked + .slider:before { transform: translateX(14px); }
      .slider-orange input:checked + .slider { background-color: #ea580c; }
      
      .config-row { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; padding-top: 15px; }
      .config-item { display: flex; align-items: center; font-size: 13px; color: #334155; font-weight: 600; cursor: pointer; }

      /* Botones de Acción */
      .action-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 15px; }
      .btn-outline-blue { background: white; border: 1px solid #3b82f6; color: #1d4ed8; font-weight: 700; border-radius: 8px; padding: 10px; transition:0.2s; }
      .btn-outline-blue:hover { background: #eff6ff; }
      .btn-ghost-muted { background: transparent; border: 1px solid #e2e8f0; color: #64748b; font-size: 12px; border-radius: 8px; padding: 8px; }

      /* Historial Mini */
      .mini-history { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #64748b; }
      .hist-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
      .hist-item:last-child { border-bottom: none; }
      .hist-score-bad { color: #ef4444; font-weight: 700; }
      .hist-score-ok { color: #16a34a; font-weight: 700; }
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
             Seleccioná un examen oficial para practicar o analizar.
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
    alert("ℹ️ EXÁMENES OFICIALES\n\n• Cada examen guarda su progreso automáticamente.\n• Podés activar 'Corregir al final' para simular condiciones reales.\n• En 'Intentos previos' verás tu historial de finalización.");
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
  
  // Icono de flecha
  const arrow = abierto ? "▼" : "▶";

  return `
    <div class="exam-box">
      <div class="exam-header" onclick="toggleGrupoExamen('${nombreGrupo}')" style="background:${abierto ? '#f8fafc' : 'white'}">
        <div style="display:flex; align-items:center; gap:10px; flex:1;">
            <span style="font-size:12px; color:#94a3b8; width:15px;">${arrow}</span>
            <div>
                <b style="font-size:16px; color:#1e293b;">${nombreGrupo}</b>
                <div style="font-size:12px;color:#64748b;">${lista.length} exámenes</div>
            </div>
        </div>
        
        <button onclick="event.stopPropagation(); analizarGrupo('${nombreGrupo}')" title="Analizar grupo"
                style="background:white; border:1px solid #e2e8f0; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; margin-right:10px;">
            📊
        </button>
      </div>
      ${abierto ? renderGrupoExamenExpanded(lista) : ""}
    </div>
  `;
}

function toggleGrupoExamen(grupo) {
  examenesOpenGrupo = examenesOpenGrupo === grupo ? null : grupo;
  examenesOpenExamen = null; // Cerrar hijos al cerrar padre
  renderExamenesMain();
}

function renderGrupoExamenExpanded(lista) {
  return `<div style="border-top:1px solid #e2e8f0;">${lista.map(ex => renderItemExamen(ex)).join("")}</div>`;
}

/* ==========================================================
   📄 Render Ítem Examen
   ========================================================== */
function renderItemExamen(ex) {
  const preguntas = getQuestionsByExamen(ex.id);
  const total = preguntas.length;
  const progreso = calcularProgresoExamen(ex.id);
  const abierto = examenesOpenExamen === ex.id;
  const bg = abierto ? '#f1f5f9' : 'white';

  let badge = `<span class="badge-status bg-gray">Pendiente</span>`;
  if (progreso > 0 && progreso < 100) badge = `<span class="badge-status bg-orange">En Curso</span>`;
  if (progreso === 100) badge = `<span class="badge-status bg-green">Completado</span>`;

  return `
    <div style="background:${bg}; border-bottom:1px solid #f1f5f9; transition:background 0.2s;">
      <div style="padding:12px 16px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleExamenItem('${ex.id}')">
        
        <div style="flex:1; display:flex; align-items:center; gap:12px;">
           <div style="width:38px; height:38px;">${renderProgressCircleExam(progreso)}</div>
           <div>
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
                 <b style="color:#334155; font-size:15px;">${ex.anio}</b>
                 ${badge}
              </div>
              <div style="font-size:12px; color:#64748b;">${total} preguntas</div>
           </div>
        </div>

        <div style="font-size:12px; color:#94a3b8;">
           ${abierto ? '▲' : '▼'}
        </div>
      </div>
      
      ${abierto ? renderExpandExamen(ex, preguntas, progreso) : ""}
    </div>
  `;
}

function toggleExamenItem(id) {
  examenesOpenExamen = examenesOpenExamen === id ? null : id;
  renderExamenesMain();
}

/* ==========================================================
   ⚙️ Panel Expandido (Configuración + Acciones)
   ========================================================== */
function renderExpandExamen(ex, preguntas, progreso) {
  const iniciado = progreso > 0;
  
  // 1. Obtener historial real de este examen
  const historial = getExamHistory(ex.id);

  // 2. Renderizar lista de historial
  let historyHTML = `<div style="text-align:center; padding:5px;">Sin intentos previos.</div>`;
  if (historial.length > 0) {
      historyHTML = historial.map(h => {
          const date = new Date(h.date).toLocaleDateString();
          const scoreClass = h.score >= 60 ? "hist-score-ok" : "hist-score-bad";
          return `
            <div class="hist-item">
               <span>📅 ${date}</span>
               <span>⏱ ${h.timeStr || '--'}</span>
               <span class="${scoreClass}">${h.score}%</span>
            </div>
          `;
      }).join("");
  }

  return `
    <div class="exam-expanded">
      
      <div class="config-row">
          <label class="config-item" onclick="event.stopPropagation()">
             <div class="toggle-switch">
                <input type="checkbox" id="timer-check-${ex.id}" checked>
                <span class="slider"></span>
             </div>
             <span>Reloj activado</span>
          </label>

          <label class="config-item" onclick="event.stopPropagation()">
             <div class="toggle-switch slider-orange">
                <input type="checkbox" id="correction-check-${ex.id}">
                <span class="slider"></span>
             </div>
             <span>Corregir al final</span>
          </label>
      </div>

      <div class="action-grid">
         <button class="btn-main" style="margin:0; width:100%; max-width:none;" 
                 onclick="${iniciado ? `reanudarExamen('${ex.id}')` : `iniciarExamen('${ex.id}')`}">
             ${iniciado ? '⏩ Continuar Intento' : '▶ Iniciar Examen'}
         </button>
         
         <button class="btn-outline-blue" style="font-weight:600; color:#475569; border-color:#e2e8f0;"
                 onclick="analizarExamen('${ex.id}')">
             📊 Análisis
         </button>
      </div>
      
      ${iniciado ? `
        <div style="text-align:center; margin-bottom:15px;">
           <span style="font-size:12px; color:#ef4444; cursor:pointer; text-decoration:underline;" onclick="resetearExamen('${ex.id}')">
              Reiniciar progreso actual (Borrar respuestas)
           </span>
        </div>
      ` : ''}

      <div class="mini-history">
         <div style="font-weight:700; margin-bottom:6px; color:#334155;">📋 Intentos previos</div>
         ${historyHTML}
      </div>

    </div>
  `;
}

/* ==========================================================
   📊 LÓGICA & HELPERS
   ========================================================== */

function getExamHistory(examId) {
    // Busca en el historial general (el mismo de simulacros)
    // pero filtra por este ID específico.
    const STORAGE_KEY_HISTORY = "MEbank_Simulacros_History_v1";
    try {
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        if(!raw) return [];
        const allHistory = JSON.parse(raw);
        // Filtramos donde el sujeto sea el examId o tenga un flag
        // Nota: En resolver.js guardaremos 'examId' en el objeto resultado.
        return allHistory.filter(h => h.examId === examId).sort((a,b) => new Date(b.date) - new Date(a.date));
    } catch(e) { return []; }
}

function formatearNombreExamen(id) { return id.replace(/_/g, " ").toUpperCase(); }

function getQuestionsByExamen(examId) {
    if (typeof BANK === 'undefined' || !BANK.questions) return [];
    return BANK.questions.filter(q => {
        if (q.examen === examId) return true;
        if (q.source === examId) return true;
        if (q.id && q.id.startsWith(examId)) return true;
        return false;
    });
}

function calcularProgresoExamen(examenId) {
  const preguntas = getQuestionsByExamen(examenId);
  if (!preguntas.length) return 0;
  let resueltas = 0;
  preguntas.forEach(q => {
    const mat = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const r = PROG[mat]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });
  return Math.round((resueltas / preguntas.length) * 100);
}

/* --- ACCIONES --- */

function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas.");
  
  const checkTimer = document.getElementById(`timer-check-${id}`);
  const checkCorrection = document.getElementById(`correction-check-${id}`);
  
  iniciarResolucion({ 
      modo: "examen", // Esto le dice al resolver que es un examen oficial
      preguntas, 
      usarTimer: checkTimer ? checkTimer.checked : false, 
      titulo: formatearNombreExamen(id), 
      examenId: id, // IMPORTANTE: Para guardar historial luego
      correccionFinal: checkCorrection ? checkCorrection.checked : false 
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
  
  const checkTimer = document.getElementById(`timer-check-${id}`);
  const checkCorrection = document.getElementById(`correction-check-${id}`);

  iniciarResolucion({ 
      modo: "reanudar", 
      preguntas: pendientes, 
      usarTimer: checkTimer ? checkTimer.checked : true, 
      titulo: formatearNombreExamen(id) + " (Cont.)", 
      examenId: id,
      correccionFinal: checkCorrection ? checkCorrection.checked : false 
  });
}

function resetearExamen(id) {
    if(!confirm("⚠ ¿Reiniciar este examen? Se borrará el progreso actual (no el historial).")) return;
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

/* --- ANÁLISIS --- */
function analizarExamen(examId) {
    const preguntas = getQuestionsByExamen(examId);
    mostrarModalAnalisis(formatearNombreExamen(examId), preguntas);
}

function analizarGrupo(nombreGrupo) {
    if(typeof EXAMENES_META === 'undefined') return;
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
        bodyEl.innerHTML = "<p>No hay preguntas disponibles.</p>";
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
    `;

    modal.style.display = 'flex';
}
