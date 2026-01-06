/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (Final Fix)
   ========================================================== */

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
  
  // LOGICA DE ESTADO
  const isReview = (CURRENT.modo === "revision");
  const isExamMode = (CURRENT.config.correccionFinal === true) && !isReview;
  
  // Recuperamos qué marcó el usuario
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
      badgeHTML = `<div class="badge-oficial">⭐️ PREGUNTA DE EXAMEN</div>`;
  }

  // --- OPCIONES ---
  const opcionesHTML = opciones.map((texto, idx) => {
    let claseCSS = "q-option";
    let eventHandler = `onclick="answer(${idx})"`;
    let icon = `<span class="q-option-letter">${String.fromCharCode(97 + idx)})</span>`;

    // A) MODO REVISIÓN O NORMAL (YA RESPONDIDO)
    if ((!isExamMode && yaRespondio) || isReview) {
        claseCSS += " q-option-locked"; 
        eventHandler = ""; 
        
        if (idx === correctIndex) claseCSS += " option-correct"; 
        else if (idx === userIdx) claseCSS += " option-wrong";   
    }
    
    // B) MODO EXAMEN REAL (SOLO SELECCIONADA)
    else if (isExamMode && idx === userIdx) {
        claseCSS += " option-selected-neutral"; 
    }

    return `
      <label class="${claseCSS}" id="opt-${idx}" ${eventHandler}>
        ${icon}
        <span class="q-option-text">${texto}</span>
      </label>
    `;
  }).join("");

  // --- EXPLICACIÓN ---
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
         <div class="q-sidebar-pager">
             <button class="btn-small" onclick="changeSidebarPage(-1)" ${SB_PAGE===0?'disabled':''}>◀</button>
             <span class="q-sidebar-pageinfo" id="sbPageInfo"></span>
             <button class="btn-small" onclick="changeSidebarPage(1)">▶</button>
         </div>
         <div class="q-sidebar-grid" id="sbGrid">${renderSidebarCells()}</div>
         <button class="btn-close-mobile btn-small" style="width:100%; margin-top:15px;" onclick="toggleMobileSidebar()">Cerrar Índice</button>
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
  const isExamMode = (CURRENT.config.correccionFinal === true);

  // 1. Guardar la selección
  CURRENT.userAnswers[q.id] = selectedIndex;

  // 2. MODO EXAMEN REAL
  if (isExamMode) {
      const options = document.querySelectorAll(".q-option");
      options.forEach((el, idx) => {
          el.classList.remove("option-selected-neutral");
          if(idx === selectedIndex) el.classList.add("option-selected-neutral");
      });
      refreshSidebarContent();
      return; 
  }

  // 3. MODO INMEDIATO
  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);
  const esCorrecta = (correctIndex !== null && selectedIndex === correctIndex);
  
  CURRENT.session[q.id] = esCorrecta ? "ok" : "bad";
  
  saveSingleQuestionProgress(q, esCorrecta);

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

  if (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision') {
      procesarResultadosExamenFinal();
  }

  if (typeof renderDetailedResults === 'function') {
      renderDetailedResults();
  } else {
      alert("Error: Falta results.js. Volviendo a Home.");
      renderHome();
  }
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
   ⏱ UTILIDADES TIMER
   ========================================================== */
function initTimer() {
    stopTimer();
    TIMER.start = Date.now();
    
    let el = document.getElementById("exam-timer");
    if (!el) {
        el = document.createElement("div");
        el.id = "exam-timer";
        el.className = "exam-timer fade";
        document.body.appendChild(el);
    }
    TIMER.el = el;
    
    TIMER.interval = setInterval(updateTimer, 1000);
    updateTimer();
}

function stopTimer() {
    if (TIMER.interval) clearInterval(TIMER.interval);
    TIMER.interval = null;
    const el = document.getElementById("exam-timer");
    if (el) el.remove();
}

function updateTimer() {
    if (!TIMER.el) return;
    const diff = Math.floor((Date.now() - TIMER.start) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    TIMER.el.textContent = `⏱ ${m}:${s < 10 ? '0' : ''}${s}`;
}

/* ==========================================================
   SIDEBAR HELPERS
   ========================================================== */
function changeSidebarPage(delta) {
    const totalPages = Math.ceil(CURRENT.list.length / SB_PAGE_SIZE);
    SB_PAGE += delta;
    if (SB_PAGE < 0) SB_PAGE = 0;
    if (SB_PAGE >= totalPages) SB_PAGE = totalPages - 1;
    
    const grid = document.getElementById("sbGrid");
    if (grid) grid.innerHTML = renderSidebarCells();
    paintSidebarPageInfo();
}

function paintSidebarPageInfo() {
    const info = document.getElementById("sbPageInfo");
    const btns = document.querySelectorAll(".q-sidebar-pager button");
    if(!info) return;

    const totalPages = Math.ceil(CURRENT.list.length / SB_PAGE_SIZE);
    if (totalPages <= 1) {
        document.querySelector(".q-sidebar-pager").style.display = "none";
        return;
    }
    document.querySelector(".q-sidebar-pager").style.display = "flex";
    info.textContent = `Pág ${SB_PAGE+1}/${totalPages}`;
    
    if (btns.length === 2) {
        btns[0].disabled = (SB_PAGE === 0);
        btns[1].disabled = (SB_PAGE === totalPages - 1);
    }
}

function refreshSidebarContent() {
    const grid = document.getElementById("sbGrid");
    if (grid) grid.innerHTML = renderSidebarCells();
}

function ensureSidebarOnCurrent() {
    SB_PAGE = Math.floor(CURRENT.i / SB_PAGE_SIZE);
}

function renderSidebarCells() {
  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(CURRENT.list.length, start + SB_PAGE_SIZE);
  const isExamMode = (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision');
  
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");

  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const esActual = (idx === CURRENT.i);
    const userAns = CURRENT.userAnswers[q.id];
    const hasNote = !!savedNotes[q.id];
    
    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (hasNote) cls += " sb-note";

    if (isExamMode) {
        if (userAns !== undefined && userAns !== null) cls += " sb-answered-neutral"; 
    } else {
        const estado = CURRENT.session[q.id]; 
        if (estado === "ok") cls += " sb-ok";
        if (estado === "bad") cls += " sb-bad";

        if (CURRENT.modo === 'revision' && userAns !== undefined && userAns !== null) {
             const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
             if (!cls.includes("sb-ok") && !cls.includes("sb-bad")) {
                 cls += (userAns === rIdx) ? " sb-ok" : " sb-bad";
             }
        }
    }
    out.push(`<div class="${cls}" onclick="irAPregunta(${idx})">${idx + 1}</div>`);
  }
  return out.join("");
}

/* ==========================================================
   NAVEGACIÓN PREGUNTA
   ========================================================== */
function irAPregunta(idx) {
    if (idx < 0 || idx >= CURRENT.list.length) return;
    CURRENT.i = idx;
    ensureSidebarOnCurrent();
    renderPregunta();
}

function nextQuestion() {
    if (CURRENT.i < CURRENT.list.length - 1) {
        CURRENT.i++;
        ensureSidebarOnCurrent();
        renderPregunta();
    } else {
        if (confirm("¿Finalizar examen?")) {
            renderFin();
        }
    }
}

function prevQuestion() {
    if (CURRENT.i > 0) {
        CURRENT.i--;
        ensureSidebarOnCurrent();
        renderPregunta();
    }
}

function salirResolucion() {
    if (confirm("¿Salir? Se perderá el progreso de esta sesión.")) {
        stopTimer();
        renderHome();
    }
}

/* ==========================================================
   HELPERS GLOBALES
   ========================================================== */
function getMateriaNombreForQuestion(q) {
  const slug = Array.isArray(q.materia) ? q.materia[0] : q.materia;
  const mat = BANK.subjects.find(s => s.slug === slug);
  return mat ? mat.name : slug;
}

function getOpcionesArray(q) {
  return [q.opcion_a, q.opcion_b, q.opcion_c, q.opcion_d].filter(x => x !== undefined && x !== null);
}

function getCorrectIndex(q, totalOpciones) {
  if (typeof q.correcta === 'number') return q.correcta;
  return q.correcta;
}

function saveSingleQuestionProgress(q, esCorrecta) {
    const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
    
    if (!PROG[mat]) PROG[mat] = {};
    PROG[mat][q.id] = { status: esCorrecta ? 'ok' : 'bad', fecha: Date.now() };

    if (window.saveProgress) window.saveProgress();

    if(esCorrecta) {
        const hoy = new Date().toISOString().split('T')[0];
        const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
        stats[hoy] = (stats[hoy] || 0) + 1;
        localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
    }
}

// Mobile sidebar
function toggleMobileSidebar() {
    const sb = document.getElementById("sidebarEl");
    if(sb) sb.classList.toggle("active-mobile");
}

/* ==========================================================
   VISUALIZADOR IMÁGENES
   ========================================================== */
function renderImagenesPregunta(imgs) {
    if(!imgs || !imgs.length) return "";
    return `<div class="q-images">
      ${imgs.map(src => `
        <div class="q-image-thumbnail" onclick="openImgModal('${src}')">
          <img src="${src}" alt="Imagen pregunta" loading="lazy">
          <div class="q-image-zoom-hint">🔍 Clic para ampliar</div>
        </div>
      `).join('')}
    </div>`;
}

function openImgModal(src) {
    const modal = document.getElementById("imgModal");
    const img = document.getElementById("imgInModal");
    img.src = src;
    modal.style.display = "flex";
}
function closeImgModal() {
    document.getElementById("imgModal").style.display = "none";
}

/* ==========================================================
   NOTAS EN RESOLVER
   ========================================================== */
function toggleNoteArea(id) {
    const area = document.getElementById(`note-area-${id}`);
    if (area) area.style.display = (area.style.display === "none") ? "block" : "none";
}

function saveNoteResolver(id) {
    const txt = document.getElementById(`note-text-${id}`).value;
    if (!txt.trim()) return alert("La nota está vacía.");
    
    const saved = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    saved[id] = { text: txt, date: Date.now() };
    localStorage.setItem("mebank_notes", JSON.stringify(saved));
    
    alert("Nota guardada!");
    renderPregunta(); 
}

function copiarExplicacionNota(id) {
    const q = CURRENT.list.find(x => x.id == id);
    if (!q || !q.explicacion) return;
    
    const area = document.getElementById(`note-text-${id}`);
    if (area) {
        if(area.value) area.value += "\n\n";
        area.value += "Explicación: " + q.explicacion;
        
        const div = document.getElementById(`note-area-${id}`);
        if(div) div.style.display = "block";
    }
}
