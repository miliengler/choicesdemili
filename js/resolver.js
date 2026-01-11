/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (FULL VERSION)
   ========================================================== */

// 1. VARIABLES DE ESTADO
let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {},
  userAnswers: {} 
};

let TIMER = {
    interval: null,
    start: 0,
    el: null
};

// --- Configuración Paginado Sidebar ---
const SB_PAGE_SIZE = 60;
let SB_PAGE = 0;

/* ==========================================================
   🚀 INICIAR
   ========================================================== */
function iniciarResolucion(config) {
  if (!config || !Array.isArray(config.preguntas) || !config.preguntas.length) {
    alert("⚠ No hay preguntas disponibles.");
    return;
  }
  
  stopTimer();
  
  CURRENT = {
    list: config.preguntas.slice(),
    i: 0,
    modo: config.modo || "general",
    config: config,
    session: {},
    userAnswers: {}
  };
  
  SB_PAGE = 0;
  ensureSidebarOnCurrent();
  
  if (config.usarTimer) {
      initTimer();
  } else {
      const oldTimer = document.getElementById("exam-timer");
      if(oldTimer) oldTimer.remove();
  }

  renderPregunta();
}

/* ==========================================================
   🧩 RENDER PRINCIPAL
   ========================================================== */
function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];

  if (!q) return renderFin();

  window.scrollTo({ top: 0, behavior: "smooth" });

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const materiaNombre = getMateriaNombreForQuestion(q);
  const isReview = (CURRENT.modo === "revision");
  const isExamMode = (CURRENT.config.correccionFinal === true) && !isReview;
  const userIdx = CURRENT.userAnswers[q.id] !== undefined ? CURRENT.userAnswers[q.id] : null; 
  const yaRespondio = (userIdx !== null);
  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  // --- DATOS DE NOTAS Y FAVORITOS ---
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const currentNote = savedNotes[q.id]; 
  const noteText = currentNote ? currentNote.text : "";
  const hasNote = !!noteText;

  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const isFav = favorites.includes(q.id);

  // --- BADGE ---
  let badgeHTML = "";
  if (q.oficial === true) {
      let nombreExamen = q.examen || "Examen Oficial";
      if (nombreExamen.includes("_")) nombreExamen = nombreExamen.replace(/_/g, " ").toUpperCase();
      let detalle = q.anio ? `(${nombreExamen} ${q.anio})` : `(${nombreExamen})`;
      badgeHTML = `<div class="badge-oficial"><span style="font-size:1.1em; margin-right:4px;">⭐️</span> PREGUNTA TOMADA <span style="font-weight:400; opacity:0.8; margin-left:6px;">${detalle}</span></div>`;
  }

  // --- OPCIONES ---
  const opcionesHTML = opciones.map((texto, idx) => {
    let claseCSS = "q-option";
    let letra = String.fromCharCode(97 + idx); 
    let eventHandler = `onclick="answer(${idx})"`;
    if ((!isExamMode && yaRespondio) || isReview) {
        claseCSS += " q-option-locked"; 
        eventHandler = ""; 
        if (idx === correctIndex) claseCSS += " option-correct"; 
        else if (idx === userIdx) claseCSS += " option-wrong";   
    } else if (isExamMode && idx === userIdx) {
        claseCSS += " option-selected-neutral"; 
    }
    return `<label class="${claseCSS}" id="opt-${idx}" ${eventHandler}><span class="q-option-letter">${letra})</span><span class="q-option-text">${texto}</span></label>`;
  }).join("");

  // --- EXPLICACIÓN ---
  let explicacionInicial = "";
  if (q.explicacion && ( (!isExamMode && yaRespondio) || isReview )) {
      explicacionInicial = `<div class="q-explanation fade"><strong>💡 Explicación:</strong><br>${q.explicacion}<div style="margin-top:10px; text-align:right;"><button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button></div></div>`;
  }

  // --- CSS LOCAL PARA LAYOUT Y BOTONES ---
  const localStyles = `
    <style>
        /* Botonera de Navegación Dividida */
        .nav-container { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .nav-group { display: flex; gap: 10px; }
        .btn-res {
            padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
            border: 1px solid #e2e8f0; background: white; color: #475569; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .btn-res:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
        .btn-res:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Barra de Acciones (Favorito + Nota) */
        .action-bar { display: flex; gap: 10px; margin-top: 25px; border-top: 1px dashed #e2e8f0; padding-top: 15px; flex-wrap: wrap; }
        .btn-action-user {
            flex: 1; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 6px;
            padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
            border: 1px solid #e2e8f0; background: white; color: #64748b; transition: all 0.2s;
        }
        .btn-action-user:hover { background: #f8fafc; color: #334155; border-color: #cbd5e1; }
        
        .btn-action-user.has-note { background: #fefce8; border-color: #facc15; color: #854d0e; }
        .btn-action-user.is-fav { background: #1e293b; border-color: #0f172a; color: white; }

        .sb-pager-row { display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 12px; padding: 8px; background: #f8fafc; border-radius: 8px; }
    </style>
  `;

  app.innerHTML = `
    ${localStyles}
    <div id="imgModal" class="img-modal" onclick="closeImgModal()"><span class="img-modal-close">&times;</span><img class="img-modal-content" id="imgInModal"><div id="imgCaption" class="img-modal-caption"></div></div>
    <button class="btn-mobile-sidebar" onclick="toggleMobileSidebar()">☰ Índice</button>

    <div class="q-layout">
      <div class="q-main">
        <div class="q-card fade">
          <div class="q-header">
            <div class="q-title"><b>${isReview ? "👁️ REVISIÓN" : (CURRENT.config.titulo || "Práctica")}</b><span class="q-counter">${numero} / ${total}</span></div>
            <div class="q-meta"><span class="q-materia">${materiaNombre}</span></div>
          </div>
          ${badgeHTML}
          <div class="q-enunciado">${q.enunciado}</div>
          ${q.imagenes ? renderImagenesPregunta(q.imagenes) : ""}
          <div class="q-options">${opcionesHTML || `<p class="small">(Sin opciones)</p>`}</div>
          <div id="explanation-holder">${explicacionInicial}</div>

          <div class="action-bar">
             <button class="btn-action-user ${isFav ? 'is-fav' : ''}" id="btn-fav-${q.id}" onclick="toggleFav('${q.id}')">
                ${isFav ? '♥ Favorita' : '♡ Marcar como favorita'}
             </button>
             <button class="btn-action-user ${hasNote ? 'has-note' : ''}" onclick="toggleNoteArea('${q.id}')">
                ${hasNote ? '📝 Ver mi nota' : '➕ Nota personal'}
             </button>
          </div>

          <div id="note-area-${q.id}" style="display:none; margin-top:10px;">
                <textarea id="note-text-${q.id}" placeholder="Escribí acá..." style="width:100%; height:80px; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${noteText}</textarea>
                <div style="margin-top:6px; text-align:right;">
                   <button class="btn-small" style="background:#3b82f6; color:white; border:none;" onclick="saveNoteResolver('${q.id}')">💾 Guardar</button>
                </div>
          </div>

          <div class="nav-container">
            <div class="nav-group">
                <button class="btn-res" onclick="salirResolucion()">🚪 Salir</button>
                <button class="btn-res" onclick="intentarFinalizar()">🏁 Finalizar</button>
            </div>
            <div class="nav-group">
                <button class="btn-res" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
                <button class="btn-res" onclick="nextQuestion()" ${CURRENT.i === total - 1 ? "disabled" : ""}>Siguiente ➡</button>
            </div>
          </div>

        </div>
      </div>
      <aside class="q-sidebar" id="sidebarEl">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><div class="q-sidebar-header" style="margin:0;">Índice</div><button class="btn-small btn-close-mobile" onclick="toggleMobileSidebar()">✖</button></div>
        <div class="sb-pager-row"><button class="btn-small" style="padding:4px 10px;" onclick="sbPrevPage()">◀</button><span class="q-sidebar-pageinfo" id="sbInfo" style="font-weight:600; font-size:13px; color:#475569;">...</span><button class="btn-small" style="padding:4px 10px;" onclick="sbNextPage()">▶</button></div>
        <div class="q-sidebar-grid" id="sbGrid">${renderSidebarCells()}</div>
      </aside>
    </div>
  `;
  paintSidebarPageInfo();
}

/* ==========================================================
   ⚡️ RESPUESTA
   ========================================================== */
function answer(selectedIndex) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;
  const isExamMode = (CURRENT.config.correccionFinal === true);

  CURRENT.userAnswers[q.id] = selectedIndex;

  if (isExamMode) {
      const options = document.querySelectorAll(".q-option");
      options.forEach((el, idx) => {
          el.classList.remove("option-selected-neutral");
          if(idx === selectedIndex) el.classList.add("option-selected-neutral");
      });
      refreshSidebarContent();
      return; 
  }

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);
  const esCorrecta = (correctIndex !== null && selectedIndex === correctIndex);
  
  CURRENT.session[q.id] = esCorrecta ? "ok" : "bad";

  const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
  if (typeof PROG !== 'undefined') {
      if (!PROG[mat]) PROG[mat] = {};
      PROG[mat][q.id] = { status: CURRENT.session[q.id], fecha: Date.now() };
      if (window.saveProgress) window.saveProgress();
  }

  if (esCorrecta) {
    const hoy = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    stats[hoy] = (stats[hoy] || 0) + 1;
    localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
  }

  const container = document.querySelector(".q-options");
  if (container) {
      const labels = container.querySelectorAll("label");
      labels.forEach((el, idx) => {
          el.classList.add("q-option-locked");
          el.onclick = null; 
          if (idx === correctIndex) el.classList.add("option-correct"); 
          else if (idx === selectedIndex) el.classList.add("option-wrong");   
      });
  }

  if (q.explicacion) {
      const holder = document.getElementById("explanation-holder");
      if (holder) {
          holder.innerHTML = `<div class="q-explanation fade" style="animation: fadeIn 0.5s ease;"><strong>💡 Explicación:</strong><br>${q.explicacion}<div style="margin-top:10px; text-align:right;"><button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button></div></div>`;
      }
  }
  refreshSidebarContent();
}

/* ==========================================================
   ⏮ ⏭ NAVEGACIÓN & LOGICA FIN
   ========================================================== */
function nextQuestion() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
}

function prevQuestion() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
}

function intentarFinalizar() {
    const total = CURRENT.list.length;
    let respondidas = 0;
    CURRENT.list.forEach(q => { if (CURRENT.userAnswers[q.id] !== undefined && CURRENT.userAnswers[q.id] !== null) respondidas++; });
    const faltan = total - respondidas;
    let msg = faltan === 0 ? "Has respondido todas las preguntas.\n¿Deseas finalizar el examen?" : `⚠️ Te faltan ${faltan} de ${total} preguntas.\n\nSi finalizas, las no respondidas contarán como incorrectas.\n¿Finalizar de todos modos?`;
    if (confirm(msg)) renderFin(); 
}

function salirResolucion() {
  let msg = "¿Deseas salir al menú principal?";
  if (CURRENT.modo === 'personalizado') msg += "\n\n⚠️ ATENCIÓN: Es un Simulacro. Si sales sin 'Finalizar', el intento se perderá.";
  else msg += "\n\n(Tu progreso se guardará automáticamente).";
  if (confirm(msg)) { stopTimer(); renderHome(); }
}

/* ==========================================================
   🏁 RENDER FIN (CON FIX DE FUSIÓN DE DATOS)
   ========================================================== */
function renderFin() {
  stopTimer();

  // 1. Guardar progreso actual
  if (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision') {
      procesarResultadosExamenFinal();
  }

  // 2. FUSIÓN DE DATOS (Fix para Reanudar Examen)
  if (CURRENT.config.allQuestionsRef && CURRENT.config.allQuestionsRef.length > 0) {
      CURRENT.list = CURRENT.config.allQuestionsRef; // Usamos la lista completa de 100
      CURRENT.list.forEach(q => {
          if (CURRENT.userAnswers[q.id] !== undefined && CURRENT.userAnswers[q.id] !== null) return; // Ya respondida hoy
          // Rellenar con memoria PROG
          const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
          if (PROG[mat] && PROG[mat][q.id]) {
              const status = PROG[mat][q.id].status;
              const correctIdx = getCorrectIndex(q, getOpcionesArray(q).length);
              // Si estaba bien, marcamos la correcta. Si estaba mal, marcamos incorrecta (dummy).
              CURRENT.userAnswers[q.id] = (status === 'ok') ? correctIdx : ((correctIdx === 0) ? 1 : 0);
          }
      });
  }

  // 3. Guardar en Historial
  if ((CURRENT.modo === 'personalizado' || CURRENT.modo === 'examen' || CURRENT.modo === 'reanudar') 
      && typeof window.guardarResultadoSimulacro === 'function' && CURRENT.config.metaSubjects) {
      
      let correctas = 0;
      let total = CURRENT.list.length;
      CURRENT.list.forEach(q => {
          const uIdx = CURRENT.userAnswers[q.id];
          const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
          if (uIdx !== undefined && uIdx !== null && uIdx === rIdx) correctas++;
      });
      const score = total > 0 ? Math.round((correctas / total) * 100) : 0;
      
      let timeStr = "--:--";
      if (TIMER.start > 0) {
          const totalSeconds = Math.floor((Date.now() - TIMER.start) / 1000);
          const h = Math.floor(totalSeconds / 3600);
          const m = Math.floor((totalSeconds % 3600) / 60);
          timeStr = h > 0 ? `${h}h ${m}m` : `${m} min`;
      }

      const resultado = {
          date: new Date().toISOString(), score, correctCount: correctas, totalQ: total, timeStr,
          subjects: CURRENT.config.metaSubjects || [],
          isOfficial: CURRENT.config.metaIsOfficial || false,
          examId: CURRENT.config.examenId || null 
      };
      window.guardarResultadoSimulacro(resultado);
  }

  renderDetailedResults();
}

function procesarResultadosExamenFinal() {
    const list = CURRENT.list;
    const answers = CURRENT.userAnswers;
    list.forEach(q => {
        const uIdx = answers[q.id];
        if (uIdx !== undefined && uIdx !== null) {
            const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
            const esCorrecta = (uIdx === rIdx);
            const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
            if (!PROG[mat]) PROG[mat] = {};
            PROG[mat][q.id] = { status: esCorrecta ? 'ok' : 'bad', fecha: Date.now() };

            if(esCorrecta) {
                const hoy = new Date().toISOString().split('T')[0];
                const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
                stats[hoy] = (stats[hoy] || 0) + 1;
                localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
            }
        }
    });
    if (window.saveProgress) window.saveProgress();
}

/* ==========================================================
   📊 PANTALLA DE RESULTADOS (TU DISEÑO + BOTÓN REVISAR)
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
  const tiempoTotalSeg = Math.floor((Date.now() - TIMER.start) / 1000);
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
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#64748b;">${omitidas}</div>
                <div style="font-size:12px; color:#475569; font-weight:700;">OMITIDAS</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:15px; border-radius:10px; text-align:center;">
                <div style="font-size:32px; font-weight:800; color:#3b82f6;">${nota}%</div>
                <div style="font-size:12px; color:#1e40af; font-weight:700;">NOTA FINAL</div>
            </div>
        </div>
        <div style="display:flex; justify-content:space-around; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:15px; margin-bottom:30px;">
             <div style="text-align:center;">
                 <div style="font-size:18px; font-weight:700; color:#334155;">${fmtTime(tiempoTotalSeg)}</div>
                 <div style="font-size:11px; color:#94a3b8;">TIEMPO TOTAL</div>
             </div>
             <div style="text-align:center; border-left:1px solid #e2e8f0; padding-left:20px;">
                 <div style="font-size:18px; font-weight:700; color:#334155;">${tiempoPromedio}s</div>
                 <div style="font-size:11px; color:#94a3b8;">PROMEDIO / PREGUNTA</div>
             </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
            <h3 style="margin:0;">🗺️ Mapa de calor</h3>
            <button onclick="reviewIncorrectOnly()" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer;">
               👁️ Revisar Incorrectas
            </button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap:8px; margin-bottom:30px;">
            ${gridData.map(item => {
                let color = "#e2e8f0"; let text = "#64748b";
                if(item.status === 'correcta') { color = "#4ade80"; text = "#064e3b"; }
                if(item.status === 'incorrecta') { color = "#f87171"; text = "#7f1d1d"; }
                return `<div onclick="reviewQuestion(${item.idx})" style="background:${color}; color:${text}; font-weight:700; height:40px; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer; font-size:14px; transition:transform 0.1s;">${item.idx + 1}</div>`;
            }).join("")}
        </div>

        <h3 style="margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">📊 Desglose por Materia</h3>
        <div id="breakdown-container">${renderSubjectBreakdown(list, userAnswers)}</div>
        <div style="margin-top:40px; text-align:center;">
             <button class="btn-main" onclick="startReviewMode()" style="padding:15px 30px; font-size:18px;">👁️ REVISAR EXAMEN COMPLETO</button>
        </div>
    </div>
  `;
}

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
        const name = getMateriaNombreForQuestion({materia:slug}); // Reutilizamos helper
        const score = Math.round((d.ok / d.total) * 100);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9;">
              <div style="font-weight:600; color:#334155; flex:1;">${name}</div>
              <div style="display:flex; gap:15px; text-align:center; font-size:13px;">
                  <div style="width:40px;"><div style="color:#16a34a; font-weight:bold;">${d.ok}</div><div style="font-size:10px; color:#cbd5e1;">BIEN</div></div>
                  <div style="width:40px;"><div style="color:#ef4444; font-weight:bold;">${d.bad}</div><div style="font-size:10px; color:#cbd5e1;">MAL</div></div>
                  <div style="width:40px;"><div style="color:#64748b; font-weight:bold;">${d.omit}</div><div style="font-size:10px; color:#cbd5e1;">N/C</div></div>
                  <div style="width:50px; text-align:right;"><span style="font-size:16px; font-weight:800; color:#3b82f6;">${score}%</span></div>
              </div>
          </div>`;
    }).join("");
    return `<div style="background:white; border:1px solid #e2e8f0; border-radius:8px;">${rows}</div>`;
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

/* ==========================================================
   AUXILIARES
   ========================================================== */
function initTimer() {
  stopTimer(); TIMER.start = Date.now();
  let el = document.getElementById("exam-timer");
  if (!el) { el = document.createElement("div"); el.id = "exam-timer"; el.className = "exam-timer"; document.body.appendChild(el); }
  el.style.display = "block"; el.textContent = "⏱ 00:00";
  TIMER.interval = setInterval(() => {
    const totalSeconds = Math.floor((Date.now() - TIMER.start) / 1000);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    el.textContent = "⏱ " + (Math.floor(totalSeconds/3600)>0 ? `${Math.floor(totalSeconds/3600)}:` : "") + `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);
}
function stopTimer() { if (TIMER.interval) clearInterval(TIMER.interval); TIMER.interval = null; const el = document.getElementById("exam-timer"); if (el) el.style.display = "none"; }
function toggleNoteArea(id) { const area = document.getElementById(`note-area-${id}`); if(area) area.style.display = (area.style.display === "none") ? "block" : "none"; }
function saveNoteResolver(id) {
    const txt = document.getElementById(`note-text-${id}`).value;
    if (!txt.trim()) return alert("Nota vacía");
    const saved = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    saved[id] = { text: txt, date: Date.now() };
    localStorage.setItem("mebank_notes", JSON.stringify(saved));
    alert("Nota guardada"); renderPregunta(); 
}
function copiarExplicacionNota(id) {
    const q = CURRENT.list.find(x => x.id == id); if (!q || !q.explicacion) return;
    const area = document.getElementById(`note-text-${id}`); if (area) { if(area.value) area.value += "\n\n"; area.value += "Explicación: " + q.explicacion; const div = document.getElementById(`note-area-${id}`); if(div) div.style.display = "block"; }
}
function toggleFav(id) {
    const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
    const index = favorites.indexOf(id);
    const btn = document.getElementById(`btn-fav-${id}`);
    if (index === -1) { favorites.push(id); if(btn) { btn.classList.add('is-fav'); btn.innerHTML = '♥ Favorita'; } } 
    else { favorites.splice(index, 1); if(btn) { btn.classList.remove('is-fav'); btn.innerHTML = '♡ Marcar como favorita'; } }
    localStorage.setItem("mebank_favorites", JSON.stringify(favorites));
}
function getOpcionesArray(q) {
  if (!q.opciones) return [];
  if (Array.isArray(q.opciones)) return q.opciones.map(t => t.replace(/^[a-eA-E][\.\)]\s*/, ""));
  if (typeof q.opciones === "object") return ["a", "b", "c", "d", "e"].map(k => q.opciones[k]).filter(v => v);
  return [];
}
function getCorrectIndex(q, totalOpciones) {
  let raw = q.correcta; if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') return (raw >= 0 && raw < totalOpciones) ? raw : null;
  if (typeof raw === 'string') { const mapa = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4 }; let s = raw.trim().toLowerCase().replace(/[\.\)]/g, ""); return mapa[s] ?? null; }
  return null;
}
function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";
  const materias = Array.isArray(q.materia) ? q.materia : [q.materia];
  const nombres = materias.map(slug => { if (typeof BANK !== 'undefined' && BANK.subjects) { const mat = BANK.subjects.find(s => s.slug === slug); return mat ? mat.name : slug; } return slug; });
  return nombres.join(" | ");
}
