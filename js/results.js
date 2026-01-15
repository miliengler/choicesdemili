/* ==========================================================
   📊 MEbank 3.0 – Pantalla de Resultados (Fix Tiempo Acumulado)
   ========================================================== */

function renderDetailedResults() {
  const app = document.getElementById("app");
  
  const list = CURRENT.list; 
  const userAnswers = CURRENT.userAnswers || {}; 
  let correctas = 0; let incorrectas = 0; let omitidas = 0;
  
  const gridData = list.map((q, idx) => {
      const userIdx = userAnswers[q.id];
      const realIdx = getCorrectIndex(q, getOpcionesArray(q).length);
      let status = "omitida";
      if (userIdx !== undefined && userIdx !== null) {
          if (userIdx === realIdx) { status = "correcta"; correctas++; } 
          else { status = "incorrecta"; incorrectas++; }
      } else { omitidas++; }
      return { idx, status, qId: q.id };
  });

  const total = list.length;
  const nota = Math.round((correctas / total) * 100);

  // --- CORRECCIÓN DEL TIEMPO (Lógica Acumulativa) ---
  let tiempoTotalSeg = 0;
  
  // 1. Si hay una sesión activa, sumamos (Acumulado + Actual)
  if (TIMER && TIMER.sessionStart > 0) {
      const sessionSeconds = Math.floor((Date.now() - TIMER.sessionStart) / 1000);
      tiempoTotalSeg = (TIMER.accumulated || 0) + sessionSeconds;
  } 
  // 2. Si no hay sesión (ej. revisión), mostramos solo el acumulado histórico
  else if (TIMER) {
      tiempoTotalSeg = TIMER.accumulated || 0;
  }
  
  // 3. Fallback de seguridad por si TIMER falla
  if (isNaN(tiempoTotalSeg)) tiempoTotalSeg = 0;

  const tiempoPromedio = total > 0 ? Math.round(tiempoTotalSeg / total) : 0;
  const fmtTime = (s) => { const m = Math.floor(s / 60); const seg = s % 60; return `${m}m ${seg}s`; };

  app.innerHTML = `
    <div class="card fade" style="max-width:1000px; margin:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">🏁 Resultados del Simulacro</h2>
            <button class="btn-small" onclick="renderHome()">🏠 Ir al Inicio</button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-bottom:30px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#16a34a;">${correctas}</div>
                <div style="font-size:12px; color:#15803d; font-weight:700;">ACERTADAS</div>
            </div>
            <div style="background:#fef2f2; border:1px solid #fecaca; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#ef4444;">${incorrectas}</div>
                <div style="font-size:12px; color:#b91c1c; font-weight:700;">FALLADAS</div>
            </div>
            <div style="background:var(--bg-subtle); border:1px solid var(--border-color); padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:var(--text-muted);">${omitidas}</div>
                <div style="font-size:12px; color:var(--text-muted); font-weight:700;">OMITIDAS</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#3b82f6;">${nota}%</div>
                <div style="font-size:12px; color:#1e40af; font-weight:700;">NOTA FINAL</div>
            </div>
        </div>
        <div style="display:flex; justify-content:space-around; background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:15px; margin-bottom:30px;">
             <div style="text-align:center;">
                 <div style="font-size:18px; font-weight:700; color:var(--text-main);">${fmtTime(tiempoTotalSeg)}</div>
                 <div style="font-size:11px; color:var(--text-muted);">TIEMPO TOTAL</div>
             </div>
             <div style="text-align:center; border-left:1px solid var(--border-color); padding-left:20px;">
                 <div style="font-size:18px; font-weight:700; color:var(--text-main);">${tiempoPromedio}s</div>
                 <div style="font-size:11px; color:var(--text-muted);">PROMEDIO / PREGUNTA</div>
             </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
            <h3 style="margin:0;">🗺️ Mapa de calor</h3>
            <button onclick="reviewIncorrectOnly()" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer;">
               👁️ Revisar Incorrectas
            </button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap:8px; margin-bottom:30px;">
            ${gridData.map(item => {
                let color = "var(--bg-subtle)"; let text = "var(--text-muted)";
                if(item.status === 'correcta') { color = "#4ade80"; text = "#064e3b"; }
                if(item.status === 'incorrecta') { color = "#f87171"; text = "#7f1d1d"; }
                return `<div onclick="reviewQuestion(${item.idx})" style="background:${color}; color:${text}; font-weight:700; height:40px; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer; font-size:14px; transition:transform 0.1s;">${item.idx + 1}</div>`;
            }).join("")}
        </div>

        <h3 style="margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">📊 Desglose por Materia</h3>
        <div id="breakdown-container">${renderSubjectBreakdown(list, userAnswers)}</div>
        <div style="margin-top:40px; text-align:center;">
             <button class="btn-main" onclick="startReviewMode()" style="padding:15px 30px; font-size:18px;">👁️ REVISAR EXAMEN COMPLETO</button>
        </div>
    </div>
  `;
}

/* --- LOGICA AUXILIAR --- */
function renderSubjectBreakdown(list, userAnswers) {
    const stats = {};
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
        const score = Math.round((d.ok / d.total) * 100);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color);">
              <div style="font-weight:600; color:var(--text-main); flex:1;">${name}</div>
              <div style="display:flex; gap:15px; text-align:center; font-size:13px;">
                  <div style="width:40px;"><div style="color:#16a34a; font-weight:bold;">${d.ok}</div><div style="font-size:10px; color:var(--text-muted);">BIEN</div></div>
                  <div style="width:40px;"><div style="color:#ef4444; font-weight:bold;">${d.bad}</div><div style="font-size:10px; color:var(--text-muted);">MAL</div></div>
                  <div style="width:40px;"><div style="color:var(--text-muted); font-weight:bold;">${d.omit}</div><div style="font-size:10px; color:var(--text-muted);">N/C</div></div>
                  <div style="width:50px; text-align:right;"><span style="font-size:16px; font-weight:800; color:#3b82f6;">${score}%</span></div>
              </div>
          </div>`;
    }).join("");
    return `<div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px;">${rows}</div>`;
}

function getMateriaNombre(slug) {
    if (typeof BANK !== 'undefined' && BANK.subjects) {
      const mat = BANK.subjects.find(s => s.slug === slug);
      return mat ? mat.name : slug;
    }
    return slug;
}

function startReviewMode() { CURRENT.i = 0; CURRENT.modo = "revision"; renderPregunta(); }
function reviewQuestion(idx) { CURRENT.i = idx; CURRENT.modo = "revision"; renderPregunta(); }

function reviewIncorrectOnly() {
    const wrongQuestions = CURRENT.list.filter(q => {
        const uIdx = CURRENT.userAnswers[q.id];
        const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
        return (uIdx === undefined || uIdx === null || uIdx !== rIdx);
    });
    if (wrongQuestions.length === 0) { alert("¡No tenés respuestas incorrectas! 🎉"); return; }
    CURRENT.list = wrongQuestions; CURRENT.i = 0; CURRENT.modo = "revision"; renderPregunta();
}
