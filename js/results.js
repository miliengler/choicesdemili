/* ==========================================================
   📊 MEbank 3.0 – Pantalla de Resultados (Final)
   ========================================================== */

function renderDetailedResults() {
  const app = document.getElementById("app");

  // 1. SAFETY CHECK: Evitar errores si se llama sin datos
  if (!CURRENT || !CURRENT.list) {
      renderHome();
      return;
  }
  
  const list = CURRENT.list; 
  const userAnswers = CURRENT.userAnswers || {}; 
  let correctas = 0; 
  let incorrectas = 0; 
  let omitidas = 0;
  
  // 2. CÁLCULO DE PUNTAJES
  const gridData = list.map((q, idx) => {
      const userIdx = userAnswers[q.id];
      const realIdx = getCorrectIndex(q, getOpcionesArray(q).length);
      let status = "omitida";
      
      if (userIdx !== undefined && userIdx !== null) {
          if (userIdx === realIdx) { 
              status = "correcta"; 
              correctas++; 
          } else { 
              status = "incorrecta"; 
              incorrectas++; 
          }
      } else { 
          omitidas++; 
      }
      return { idx, status, qId: q.id };
  });

  const total = list.length;
  // Evitar división por cero
  const nota = total > 0 ? Math.round((correctas / total) * 100) : 0;

  // 3. CORRECCIÓN DEL TIEMPO (Lógica Acumulativa + Sesión Actual)
  let tiempoTotalSeg = 0;
  
  // A) Si venimos de resolver (Timer activo), sumamos lo acumulado + la sesión actual
  if (typeof TIMER !== 'undefined' && TIMER.sessionStart > 0) {
      const sessionSeconds = Math.floor((Date.now() - TIMER.sessionStart) / 1000);
      tiempoTotalSeg = (TIMER.accumulated || 0) + sessionSeconds;
  } 
  // B) Si el timer ya se detuvo o venimos de historial, usamos solo el acumulado
  else if (typeof TIMER !== 'undefined') {
      tiempoTotalSeg = TIMER.accumulated || 0;
  }
  
  if (isNaN(tiempoTotalSeg)) tiempoTotalSeg = 0;

  const tiempoPromedio = (total > 0 && tiempoTotalSeg > 0) ? Math.round(tiempoTotalSeg / total) : 0;
  const fmtTime = (s) => { 
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60); 
      const seg = s % 60; 
      if (h > 0) return `${h}h ${m}m ${seg}s`;
      return `${m}m ${seg}s`; 
  };

  // 4. RENDERIZADO HTML
  app.innerHTML = `
    <div class="card fade" style="max-width:1000px; margin:auto;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">🏁 Resultados</h2>
            <button class="btn-small" onclick="renderHome()">🏠 Inicio</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:15px; margin-bottom:30px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#16a34a;">${correctas}</div>
                <div style="font-size:11px; color:#15803d; font-weight:700; letter-spacing:0.5px;">ACERTADAS</div>
            </div>
            <div style="background:#fef2f2; border:1px solid #fecaca; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#ef4444;">${incorrectas}</div>
                <div style="font-size:11px; color:#b91c1c; font-weight:700; letter-spacing:0.5px;">FALLADAS</div>
            </div>
            <div style="background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color, #e2e8f0); padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:var(--text-muted, #64748b);">${omitidas}</div>
                <div style="font-size:11px; color:var(--text-muted, #64748b); font-weight:700; letter-spacing:0.5px;">OMITIDAS</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#3b82f6;">${nota}%</div>
                <div style="font-size:11px; color:#1e40af; font-weight:700; letter-spacing:0.5px;">NOTA FINAL</div>
            </div>
        </div>

        <div style="display:flex; justify-content:space-around; background:var(--bg-card, #fff); border:1px solid var(--border-color, #e2e8f0); border-radius:10px; padding:15px; margin-bottom:30px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
             <div style="text-align:center;">
                 <div style="font-size:18px; font-weight:700; color:var(--text-main, #334155);">${fmtTime(tiempoTotalSeg)}</div>
                 <div style="font-size:11px; color:var(--text-muted, #94a3b8); font-weight:600;">TIEMPO TOTAL</div>
             </div>
             <div style="text-align:center; border-left:1px solid var(--border-color, #e2e8f0); padding-left:20px;">
                 <div style="font-size:18px; font-weight:700; color:var(--text-main, #334155);">${tiempoPromedio}s</div>
                 <div style="font-size:11px; color:var(--text-muted, #94a3b8); font-weight:600;">PROMEDIO / PREGUNTA</div>
             </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border-color, #e2e8f0); padding-bottom:10px;">
            <h3 style="margin:0; font-size:16px; color:var(--text-main, #1e293b);">🗺️ Mapa de respuestas</h3>
            ${incorrectas > 0 ? `
            <button onclick="reviewIncorrectOnly()" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">
               👁️ Revisar errores
            </button>` : ''}
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); gap:6px; margin-bottom:30px;">
            ${gridData.map(item => {
                let color = "var(--bg-subtle, #f1f5f9)"; 
                let text = "var(--text-muted, #94a3b8)";
                if(item.status === 'correcta') { color = "#4ade80"; text = "#064e3b"; }
                if(item.status === 'incorrecta') { color = "#f87171"; text = "#7f1d1d"; }
                
                return `<div onclick="reviewQuestion(${item.idx})" 
                             title="Pregunta ${item.idx + 1}: ${item.status}"
                             style="background:${color}; color:${text}; font-weight:700; height:36px; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer; font-size:13px; transition:transform 0.1s;">
                             ${item.idx + 1}
                        </div>`;
            }).join("")}
        </div>

        <h3 style="margin-bottom:15px; border-bottom:1px solid var(--border-color, #e2e8f0); padding-bottom:10px; font-size:16px;">📊 Rendimiento por materia</h3>
        <div id="breakdown-container" style="margin-bottom:30px;">
            ${renderSubjectBreakdown(list, userAnswers)}
        </div>

        <div style="text-align:center;">
             <button class="btn-main" onclick="startReviewMode()" style="padding:12px 25px; font-size:16px;">
                👁️ REVISAR EXAMEN COMPLETO
             </button>
        </div>
    </div>
  `;
}

/* --- LOGICA AUXILIAR --- */

function renderSubjectBreakdown(list, userAnswers) {
    const stats = {};
    
    // Agrupar datos
    list.forEach(q => {
        const mat = Array.isArray(q.materia) ? q.materia[0] : q.materia;
        if(!stats[mat]) stats[mat] = { total:0, ok:0, bad:0, omit:0 };
        
        stats[mat].total++;
        const uIdx = userAnswers[q.id];
        const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
        
        if(uIdx === undefined || uIdx === null) stats[mat].omit++;
        else if (uIdx === rIdx) stats[mat].ok++;
        else stats[mat].bad++;
    });

    const rows = Object.keys(stats).map(slug => {
        const d = stats[slug];
        const name = getMateriaNombre(slug);
        const score = d.total > 0 ? Math.round((d.ok / d.total) * 100) : 0;
        
        // Color de la barra de porcentaje
        let scoreColor = "#3b82f6";
        if (score >= 70) scoreColor = "#16a34a";
        else if (score < 40) scoreColor = "#ef4444";

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color, #f1f5f9);">
              <div style="flex:1;">
                  <div style="font-weight:600; color:var(--text-main, #334155); font-size:14px;">${name}</div>
                  <div style="font-size:11px; color:var(--text-muted, #94a3b8);">${d.total} preguntas</div>
              </div>
              
              <div style="display:flex; gap:12px; text-align:center; font-size:13px; align-items:center;">
                  
                  <div style="width:30px;">
                    <div style="color:#16a34a; font-weight:bold;">${d.ok}</div>
                  </div>
                  
                  <div style="width:30px;">
                    <div style="color:#ef4444; font-weight:bold;">${d.bad}</div>
                  </div>
                  
                  <div style="width:30px;">
                    <div style="color:var(--text-muted, #94a3b8); font-weight:bold;">${d.omit}</div>
                  </div>

                  <div style="width:50px; text-align:right;">
                    <span style="font-size:15px; font-weight:800; color:${scoreColor};">${score}%</span>
                  </div>
              </div>
          </div>`;
    }).join("");

    return `
        <div style="background:var(--bg-card, #fff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; overflow:hidden;">
            <div style="display:flex; justify-content:flex-end; padding:8px 12px; background:var(--bg-subtle, #f8fafc); border-bottom:1px solid var(--border-color, #e2e8f0); font-size:10px; color:var(--text-muted, #64748b); font-weight:700; gap:12px;">
                <span style="width:30px; text-align:center;">BIEN</span>
                <span style="width:30px; text-align:center;">MAL</span>
                <span style="width:30px; text-align:center;">N/C</span>
                <span style="width:50px; text-align:right;">NOTA</span>
            </div>
            ${rows}
        </div>`;
}

// Helper seguro para nombre de materia
function getMateriaNombre(slug) {
    if (typeof BANK !== 'undefined' && BANK.subjects) {
      const mat = BANK.subjects.find(s => s.slug === slug);
      if (mat) return mat.name;
    }
    // Fallback: formatear el slug
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, " ");
}

/* --- ACCIONES DE REVISIÓN --- */

function startReviewMode() { 
    CURRENT.i = 0; 
    CURRENT.modo = "revision"; 
    renderPregunta(); 
}

function reviewQuestion(idx) { 
    CURRENT.i = idx; 
    CURRENT.modo = "revision"; 
    renderPregunta(); 
}

function reviewIncorrectOnly() {
    const wrongQuestions = CURRENT.list.filter(q => {
        const uIdx = CURRENT.userAnswers[q.id];
        const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
        return (uIdx === undefined || uIdx === null || uIdx !== rIdx);
    });

    if (wrongQuestions.length === 0) { 
        alert("¡Felicitaciones! 🎉\nNo tenés respuestas incorrectas para revisar."); 
        return; 
    }

    CURRENT.list = wrongQuestions; 
    CURRENT.i = 0; 
    CURRENT.modo = "revision"; 
    renderPregunta();
}
