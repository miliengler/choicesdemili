/* ==========================================================
   📊 MEbank 3.0 – Estadísticas Avanzadas
   ========================================================== */

let STATS_ORDER = "az";
let statsSearchTerm = "";

function renderStats() {
  const app = document.getElementById("app");
  
  // 1. Cálculos Globales
  const totalPreguntasBanco = BANK.questions.length;
  let correctas = 0;
  let incorrectas = 0;
  
  // Recorremos todo el progreso
  Object.values(PROG).forEach(materiaData => {
    Object.values(materiaData).forEach(qData => {
      if(qData.status === 'ok') correctas++;
      if(qData.status === 'bad') incorrectas++;
    });
  });

  const respondidas = correctas + incorrectas;
  const sinResponder = totalPreguntasBanco - respondidas;
  
  // Porcentaje de DOMINIO (Verde sobre Total del Banco)
  const porcentajeDominio = Math.round((correctas / totalPreguntasBanco) * 100);
  
  // Porcentaje de AVANCE (Respondidas sobre Total del Banco)
  // const porcentajeAvance = Math.round((respondidas / totalPreguntasBanco) * 100);

  app.innerHTML = `
    <div class="card fade" style="max-width:900px; margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0;">📊 Mi Progreso</h2>
        <button class="btn-small" onclick="renderHome()" style="background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:15px; margin-bottom:25px;">
        
        <div style="background:#f0fdf4; padding:15px; border-radius:12px; border:1px solid #bbf7d0; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#16a34a;">${correctas}</div>
          <div style="font-size:13px; font-weight:600; color:#15803d; text-transform:uppercase; letter-spacing:0.5px;">Correctas</div>
        </div>

        <div style="background:#fef2f2; padding:15px; border-radius:12px; border:1px solid #fecaca; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#dc2626;">${incorrectas}</div>
          <div style="font-size:13px; font-weight:600; color:#b91c1c; text-transform:uppercase; letter-spacing:0.5px;">Incorrectas</div>
        </div>

        <div style="background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#64748b;">${sinResponder}</div>
          <div style="font-size:13px; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Sin responder</div>
        </div>

      </div>

      <div style="margin-bottom:30px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:14px; font-weight:700; color:#1e293b;">Dominio del Banco</span>
            <span style="font-size:14px; font-weight:700; color:#16a34a;">${porcentajeDominio}% completado</span>
        </div>
        <div style="height:12px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
            <div style="width:${porcentajeDominio}%; background:#16a34a; height:100%; transition: width 1s ease-in-out;"></div>
        </div>
        <p style="font-size:12px; color:#64748b; margin-top:5px;">
           Representa cuántas preguntas ya respondiste correctamente sobre el total de ${totalPreguntasBanco}.
        </p>
      </div>

      <hr style="border:0; border-top:1px solid #e2e8f0; margin:30px 0;">

      <div style="margin-bottom:30px;">
        <h3 style="margin-top:0; color:#1e293b; margin-bottom:15px;">📅 Actividad Reciente</h3>
        
        <div style="height:180px; background:white; border:1px dashed #cbd5e1; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
            (Aquí iría el gráfico de barras semanal)
        </div>

        <div style="margin-top:15px; background:#eff6ff; border-left:4px solid #3b82f6; padding:12px; border-radius:6px;">
            <p style="margin:0; color:#1e40af; font-size:14px;">
               🎉 <b>¡Excelente ritmo!</b> Esta semana respondiste <b>${getRandomWeeklyCount()} preguntas</b>. 
               La constancia es la clave del éxito. ¡Seguí así!
            </p>
        </div>
      </div>

      <div style="margin-bottom:30px;">
         <h3 style="margin-top:0; color:#1e293b;">🧠 Sugerencias de Repaso</h3>
         <div id="suggestionsContainer">
            ${getSuggestionsHTML()}
         </div>
      </div>

      <hr style="border:0; border-top:1px solid #e2e8f0; margin:30px 0;">

      <div>
        <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; color:#1e293b;">📚 Detalle por Materia</h3>
            
            <div style="display:flex; gap:10px; flex:1; max-width:500px;">
                <input type="text" 
                       placeholder="🔍 Buscar materia..." 
                       value="${statsSearchTerm}"
                       oninput="onSearchStats(this.value)"
                       style="flex:1; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
                
                <select onchange="onChangeStatsOrder(this.value)" 
                        style="padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:white; font-size:14px; cursor:pointer;">
                    <option value="az" ${STATS_ORDER === 'az' ? 'selected' : ''}>A - Z</option>
                    <option value="progreso" ${STATS_ORDER === 'progreso' ? 'selected' : ''}>Progreso (Menor a Mayor)</option>
                    <option value="progreso_desc" ${STATS_ORDER === 'progreso_desc' ? 'selected' : ''}>Progreso (Mayor a Menor)</option>
                </select>
            </div>
        </div>

        <div id="statsListContainer">
            </div>
      </div>

    </div>
  `;

  renderStatsList();
  
  // Si tenés una función real de charts, llamala aquí: renderCharts();
}

/* ==========================================================
   🔄 LÓGICA DE LISTA POR MATERIA (Zero Flicker)
   ========================================================== */

function renderStatsList() {
    const container = document.getElementById("statsListContainer");
    if(!container) return;

    let list = [...BANK.subjects];
    const term = normalize(statsSearchTerm);

    // 1. Filtrar
    if (term) {
        list = list.filter(s => normalize(s.name).includes(term));
    }

    // 2. Ordenar
    if (STATS_ORDER === 'az') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        list.sort((a, b) => {
            const statA = getMateriaStatsSimple(a.slug);
            const statB = getMateriaStatsSimple(b.slug);
            return STATS_ORDER === 'progreso' 
                ? statA.percent - statB.percent  // Menor a Mayor (Lo que más falta estudiar)
                : statB.percent - statA.percent; // Mayor a Menor (Lo que mejor sé)
        });
    }

    // 3. Generar HTML
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">No se encontraron materias.</div>`;
        return;
    }

    container.innerHTML = list.map(m => {
        const s = getMateriaStatsSimple(m.slug);
        
        // Color de la barra pequeña según porcentaje
        let colorBar = '#3b82f6'; // Azul default
        if (s.percent >= 70) colorBar = '#16a34a'; // Verde
        if (s.percent < 30) colorBar = '#ef4444'; // Rojo

        return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #f1f5f9;">
            <div style="flex:1; padding-right:15px;">
                <div style="font-weight:600; color:#334155; margin-bottom:4px;">${m.name}</div>
                <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden; width:100%; max-width:150px;">
                    <div style="width:${s.percent}%; background:${colorBar}; height:100%;"></div>
                </div>
            </div>
            
            <div style="text-align:right; font-size:13px;">
                <div style="font-weight:bold; color:#1e293b;">${s.percent}%</div>
                <div style="color:#64748b; font-size:11px;">${s.ok} / ${s.total}</div>
            </div>
        </div>
        `;
    }).join("");
}

/* --- EVENTOS DE FILTROS --- */
function onSearchStats(val) {
    statsSearchTerm = val;
    renderStatsList();
}

function onChangeStatsOrder(val) {
    STATS_ORDER = val;
    renderStatsList();
}

/* --- HELPERS --- */
function getMateriaStatsSimple(slug) {
    // Calculo rápido para la lista
    const total = BANK.questions.filter(q => {
      if (Array.isArray(q.materia)) return q.materia.includes(slug);
      return q.materia === slug;
    }).length;

    const progMat = PROG[slug] || {};
    let ok = 0;
    Object.values(progMat).forEach(r => { if(r && r.status === 'ok') ok++; });

    const percent = total ? Math.round((ok / total) * 100) : 0;
    return { total, ok, percent };
}

// Simulador de conteo semanal (hasta que tengamos fechas reales)
function getRandomWeeklyCount() {
    // Aquí podrías sumar realmente si tuviéramos timestamps
    // Por ahora mostramos un número basado en el total de correctas para motivar
    let totalOk = 0;
    Object.values(PROG).forEach(m => Object.values(m).forEach(q => { if(q.status==='ok') totalOk++ }));
    return totalOk > 0 ? totalOk : 0; 
}

function getSuggestionsHTML() {
    // Lógica simple: Busca materias con mucho error
    let suggestions = [];
    BANK.subjects.forEach(m => {
        const s = getMateriaStatsSimple(m.slug);
        const bad = (PROG[m.slug] ? Object.values(PROG[m.slug]).filter(x=>x.status==='bad').length : 0);
        
        // Si hay errores o progreso muy bajo habiendo intentado
        if (bad > 0 || (s.total > 0 && s.percent < 20)) {
            suggestions.push({ name: m.name, bad });
        }
    });

    // Ordenar por cantidad de errores
    suggestions.sort((a,b) => b.bad - a.bad);

    if (suggestions.length === 0) {
        return `<div style="color:#64748b; font-size:14px;">¡Todo viene genial! Seguí practicando materias nuevas.</div>`;
    }

    return suggestions.slice(0, 3).map(s => `
        <div style="background:#fff7ed; padding:10px 15px; border-left:3px solid #f97316; margin-bottom:8px; border-radius:4px; font-size:14px; color:#9a3412;">
           Revisá <b>${s.name}</b> (Tenés ${s.bad} errores registrados).
        </div>
    `).join("");
}
