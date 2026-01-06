/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (Soporte Modo Examen Real)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {},    // Para guardar ok/bad (legacy/progreso)
  userAnswers: {} // NUEVO: Para guardar el índice seleccionado { qId: optionIndex }
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
  
  // LOGICA DE ESTADO
  const isReview = (CURRENT.modo === "revision");
  const isExamMode = (CURRENT.config.correccionFinal === true) && !isReview;
  
  // Recuperamos qué marcó el usuario (si marcó algo)
  const userIdx = CURRENT.userAnswers[q.id] !== undefined ? CURRENT.userAnswers[q.id] : null;
  const yaRespondio = (userIdx !== null);

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  // Notas
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const hasNote = !!savedNotes[q.id];

  // --- BADGE OFICIAL ---
  let badgeHTML = "";
  if (q.oficial === true) {
      // (Tu lógica de badge existente...)
      badgeHTML = `<div class="badge-oficial">⭐️ PREGUNTA DE EXAMEN</div>`;
  }

  // --- OPCIONES ---
  const opcionesHTML = opciones.map((texto, idx) => {
    let claseCSS = "q-option";
    let eventHandler = `onclick="answer(${idx})"`;
    let icon = `<span class="q-option-letter">${String.fromCharCode(97 + idx)})</span>`;

    // A) MODO REVISIÓN O MODO NORMAL (YA RESPONDIDO)
    if ((!isExamMode && yaRespondio) || isReview) {
        claseCSS += " q-option-locked"; 
        eventHandler = ""; // Bloqueado
        
        if (idx === correctIndex) claseCSS += " option-correct"; 
        else if (idx === userIdx) claseCSS += " option-wrong";   
    }
    
    // B) MODO EXAMEN REAL (RESPUESTA SELECCIONADA PERO OCULTA)
    else if (isExamMode && idx === userIdx) {
        claseCSS += " option-selected-neutral"; // Clase nueva (Azul/Gris)
    }

    return `
      <label class="${claseCSS}" id="opt-${idx}" ${eventHandler}>
        ${icon}
        <span class="q-option-text">${texto}</span>
      </label>
    `;
  }).join("");

  // --- EXPLICACIÓN (Solo si NO es examen real o si es Revisión) ---
  let explicacionHTML = "";
  if (q.explicacion && ( (!isExamMode && yaRespondio) || isReview )) {
      explicacionHTML = `
        <div id="explanation-holder" class="q-explanation fade">
           <strong>💡 Explicación:</strong><br>${q.explicacion}
           <div style="margin-top:10px; text-align:right;">
              <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button>
           </div>
        </div>`;
  } else {
      // Placeholder vacio para inyectar si es modo inmediato
      explicacionHTML = `<div id="explanation-holder"></div>`;
  }

  app.innerHTML = `
    <div id="imgModal" class="img-modal" onclick="closeImgModal()"><img class="img-modal-content" id="imgInModal"></div>
    <button class="btn-mobile-sidebar" onclick="toggleMobileSidebar()">☰ Índice</button>

    <div class="q-layout">
      <div class="q-main">
        <div class="q-card fade">
          <div class="q-header">
            <div class="q-title">
              <b>${isReview ? "👁️ REVISIÓN" : (CURRENT.config.titulo || "Práctica")}</b>
              <span class="q-counter">${numero} / ${total}</span>
            </div>
            <div class="q-meta"><span class="q-materia">${materiaNombre}</span></div>
          </div>

          ${badgeHTML}
          <div class="q-enunciado">${q.enunciado}</div>
          ${q.imagenes ? renderImagenesPregunta(q.imagenes) : ""}

          <div class="q-options">${opcionesHTML}</div>
          ${explicacionHTML}

          <div style="margin-top:25px; border-top:1px dashed #e2e8f0; padding-top:15px;">
             <button class="btn-small" style="background:${hasNote?'#fefce8':'white'}" onclick="toggleNoteArea('${q.id}')">
                ${hasNote ? '📝 Ver mi nota' : '➕ Nota personal'}
             </button>
             <div id="note-area-${q.id}" style="display:none; margin-top:10px;">
                <textarea id="note-text-${q.id}" class="note-input">${savedNotes[q.id]?.text || ""}</textarea>
                <button class="btn-small" onclick="saveNoteResolver('${q.id}')">💾 Guardar</button>
             </div>
          </div>

          <div class="q-nav-row">
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
            <button class="btn-small" onclick="nextQuestion()">${CURRENT.i === total - 1 ? "Finalizar" : "Siguiente ➡"}</button>
            <button class="btn-small btn-ghost" onclick="salirResolucion()">Salir</button>
          </div>
        </div>
      </div>
      <aside class="q-sidebar" id="sidebarEl">
         <div class="q-sidebar-grid" id="sbGrid">${renderSidebarCells()}</div>
      </aside>
    </div>
  `;
  
  paintSidebarPageInfo();
}

/* ==========================================================
   ⚡️ RESPUESTA (Lógica Dual)
   ========================================================== */
function answer(selectedIndex) {
  const q = CURRENT.list[CURRENT.i];
  const isExamMode = (CURRENT.config.correccionFinal === true);

  // 1. Guardar la selección del usuario
  CURRENT.userAnswers[q.id] = selectedIndex;

  // 2. Si es MODO EXAMEN REAL:
  if (isExamMode) {
      // Solo actualizamos visualmente la selección (Azul/Neutro)
      const options = document.querySelectorAll(".q-option");
      options.forEach((el, idx) => {
          el.classList.remove("option-selected-neutral");
          if(idx === selectedIndex) el.classList.add("option-selected-neutral");
      });
      // Actualizamos sidebar (se pone gris de "respondida")
      refreshSidebarContent();
      return; // NO MOSTRAR CORRECCIÓN NI EXPLICACIÓN
  }

  // 3. Si es MODO INMEDIATO (Normal):
  // (Lógica original de colores y bloqueos)
  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);
  const esCorrecta = (correctIndex !== null && selectedIndex === correctIndex);
  
  CURRENT.session[q.id] = esCorrecta ? "ok" : "bad";
  
  // Guardar stats inmediato
  saveSingleQuestionProgress(q, esCorrecta);

  // Update UI Visual
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

  // Mostrar explicación
  if (q.explicacion) {
      const holder = document.getElementById("explanation-holder");
      if (holder) {
          holder.innerHTML = `
            <div class="q-explanation fade">
               <strong>💡 Explicación:</strong><br>${q.explicacion}
               <div style="margin-top:10px; text-align:right;">
                  <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button>
               </div>
            </div>`;
      }
  }
  refreshSidebarContent();
}

/* ==========================================================
   🏁 FINALIZAR
   ========================================================== */
function renderFin() {
  stopTimer();

  // Si estábamos en MODO EXAMEN REAL, ahora es el momento de guardar todo
  if (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision') {
      procesarResultadosExamenFinal();
  }

  // LLAMAR A LA NUEVA PANTALLA DE RESULTADOS
  if (typeof renderDetailedResults === 'function') {
      renderDetailedResults();
  } else {
      alert("Error: Falta results.js");
      renderHome();
  }
}

function procesarResultadosExamenFinal() {
    // Recorre todas las respuestas y las guarda en el historial y stats
    // Solo se ejecuta al dar click en "Finalizar"
    const list = CURRENT.list;
    const answers = CURRENT.userAnswers;
    
    list.forEach(q => {
        const uIdx = answers[q.id];
        if (uIdx !== undefined && uIdx !== null) {
            const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
            const esCorrecta = (uIdx === rIdx);
            
            // Guardar en PROG global
            const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
            if (!PROG[mat]) PROG[mat] = {};
            PROG[mat][q.id] = { status: esCorrecta ? 'ok' : 'bad', fecha: Date.now() };

            // Stats Diarias
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
   SIDEBAR & HELPERS
   ========================================================== */
function renderSidebarCells() {
  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(CURRENT.list.length, start + SB_PAGE_SIZE);
  const isExamMode = (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision');
  
  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const esActual = (idx === CURRENT.i);
    const userAns = CURRENT.userAnswers[q.id];
    
    let cls = "sb-cell";
    if (esActual) cls += " sb-active";

    if (isExamMode) {
        // En examen solo mostramos si está respondida (gris oscuro)
        if (userAns !== undefined && userAns !== null) cls += " sb-answered-neutral"; 
    } else {
        // Modo inmediato o revisión (colores verdad)
        const estado = CURRENT.session[q.id]; // Ojo: session se llena en modo inmediato
        if(isReview && userAns !== undefined) {
             const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
             cls += (userAns === rIdx) ? " sb-ok" : " sb-bad";
        } else {
            if (estado === "ok") cls += " sb-ok";
            if (estado === "bad") cls += " sb-bad";
        }
    }
    out.push(`<div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>`);
  }
  return out.join("");
}

// ... Resto de funciones helpers (irAPregunta, next, prev, etc) se mantienen igual ...
// Solo agregá el estilo CSS nuevo para "sb-answered-neutral" y "option-selected-neutral"
