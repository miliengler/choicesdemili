/* ==========================================================
   📊 MEbank 3.0 – Estadísticas (Diseño Clásico + Funciones)
   ========================================================== */

let STATS_ORDER = "az";
let statsSearchTerm = "";

function renderStats() {
  const app = document.getElementById("app");
  
  // --- 1. CÁLCULOS GLOBALES ---
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
  
  // Porcentaje de Dominio (Sobre el TOTAL del banco)
  const porcentajeDominio = Math.round((correctas / totalPreguntasBanco) * 100);

  // --- 2. RENDERIZADO ---
  app.innerHTML = `
    <div class="card fade" style="max-width:900px; margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0;">📊 Mi Progreso</h2>
        <button class="btn-small" onclick="renderHome()" style="background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:10px; margin-bottom:20px;">
        
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; text-align:center;">
            <div style="font-size:24px; font-weight:bold; color:#16a34a;">${correctas}</div>
            <div style="font-size:12px; color:#64748b; text-transform:uppercase;">Correctas</div>
        </div>

        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; text-align:center;">
            <div style="font-size:24px; font-weight:bold; color:#ef4444;">${incorrectas}</div>
            <div style="font-size:12px; color:#64748b; text-transform:uppercase;">Incorrectas</div>
        </div>

        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; text-align:center; background:#f8fafc;">
            <div style="font-size:24px; font-weight:bold; color:#94a3b8;">${sinResponder}</div>
            <div style="font-size:12px; color:#64748b; text-transform:uppercase;">Sin Responder</div>
        </div>

      </div>

      <div style="margin-bottom:30px; padding:15px; border:1px solid #e2e8f0; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-weight:600; color:#334155; font-size:14px;">Dominio del Banco</span>
            <span style="font-weight:bold; color:#16a34a; font-size:14px;">${porcentajeDominio}%</span>
        </div>
        <div style="height:10px; background:#f1f5f9; border-radius:5px; overflow:hidden;">
            <div style="width:${porcentajeDominio}%; background:#16a34a; height:100%; transition: width 0.5s ease;"></div>
        </div>
        <div style="font-size:12px; color:#94a3b8; margin-top:5px; text-align:center;">
            Preguntas correctas sobre el total de preguntas (${totalPreguntasBanco}).
        </div>
      </div>

      <hr style="margin:20px 0; border:0; border-top:1px solid #e2e8f0;">

      <div style="margin-bottom:30px;">
        <h3 style="margin-top:0; font-size:18px;">📅 Actividad Semanal</h3>
        
        <div style="height:150px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px;">
           (Gráfico de actividad aquí)
        </div>

        <div style="margin-top:10px; padding:10px; background:#eff6ff; border-radius:6px; font-size:14px; color:#1e40af; text-align:center;">
            🎉 <b>¡Bien hecho!</b> Esta semana avanzaste con <b>${getRandomWeeklyCount()}</b> preguntas. ¡Mantené el ritmo!
        </div>
      </div>

      <div style="margin-bottom:30px;">
         <h3 style="margin-top:0; font-size:18px;">🧠 Sugerencias de Repaso</h3>
         <div id="suggestionsContainer">
            ${getSuggestionsHTML()}
         </div>
      </div>

      <hr style="margin:20px 0; border:0; border-top:1px solid #e2e8f0;">

      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; font-size:18px;">📚 Detalle por Materia</h3>
            
            <div style="display:flex; gap:8px;">
                <input type="text" 
                       placeholder="Buscar..." 
                       value="${statsSearchTerm}"
                       oninput="onSearchStats(this.value)"
                       style="padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; max-width:120px;">
                
                <select onchange="onChangeStatsOrder(this.value)" 
                        style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; background:white;">
                    <option value="az" ${STATS_ORDER === 'az' ? 'selected' : ''}>A-Z</option>
                    <option value="progreso" ${STATS_ORDER === 'progreso' ? 'selected' : ''}>% Menor</option>
                    <option value="progreso_desc" ${STATS_ORDER === 'progreso_desc' ? 'selected' : ''}>% Mayor</option>
                </select>
            </div>
        </div>

        <div id="statsListContainer">
            </div>
      </div>

    </div>
  `;

  renderStatsList();
}

/* ==========================================================
   🔄 RENDER LISTA (Lógica Zero Flicker)
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
                ? statA.percent - statB.percent
                : statB.percent - statA.percent;
        });
    }

    // 3. HTML (Diseño Fila Simple)
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:14px;">No hay resultados.</div>`;
        return;
    }

    container.innerHTML = list.map(m => {
        const s = getMateriaStatsSimple(m.slug);
        
        // Color barra pequeña
        let colorBar = '#3b82f6';
        if (s.percent >= 70) colorBar = '#16a34a'; // Verde
        if (s.percent < 30) colorBar = '#ef4444'; // Rojo

        return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f1f5f9;">
            <div style="flex:1; padding-right:15px;">
                <div style="font-weight:600; font-size:14px; color:#334155;">${m.name}</div>
                <div style="background:#f1f5f9; height:5px; border-radius:3px; overflow:hidden; width:100%; max-width:120px; margin-top:4px;">
                    <div style="width:${s.percent}%; background:${colorBar}; height:100%;"></div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; font-size:14px; color:#1e293b;">${s.percent}%</div>
                <div style="font-size:11px; color:#94a3b8;">${s.ok}/${s.total}</div>
            </div>
        </div>
        `;
    }).join("");
}

/* --- EVENTOS --- */
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

function getRandomWeeklyCount() {
    let totalOk = 0;
    Object.values(PROG).forEach(m => Object.values(m).forEach(q => { if(q.status==='ok') totalOk++ }));
    return totalOk > 0 ? totalOk : 0; 
}

function getSuggestionsHTML() {
    let suggestions = [];
    BANK.subjects.forEach(m => {
        const s = getMateriaStatsSimple(m.slug);
        const bad = (PROG[m.slug] ? Object.values(PROG[m.slug]).filter(x=>x.status==='bad').length : 0);
        
        if (bad > 0 || (s.total > 0 && s.percent < 20)) {
            suggestions.push({ name: m.name, bad });
        }
    });

    suggestions.sort((a,b) => b.bad - a.bad);

    if (suggestions.length === 0) {
        return `<div style="color:#64748b; font-size:13px; font-style:italic;">No hay sugerencias por ahora.</div>`;
    }

    return suggestions.slice(0, 3).map(s => `
        <div style="background:#fff7ed; padding:8px 12px; border-radius:6px; margin-bottom:6px; font-size:13px; color:#c2410c;">
           ⚠ Repasá <b>${s.name}</b> (${s.bad} errores).
        </div>
    `).join("");
}
