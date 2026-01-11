/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (Botonera Dividida)
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

  // LÓGICA DE MODOS
  const isReview = (CURRENT.modo === "revision");
  const isExamMode = (CURRENT.config.correccionFinal === true) && !isReview;

  // Recuperamos respuesta del usuario
  const userIdx = CURRENT.userAnswers[q.id] !== undefined ? CURRENT.userAnswers[q.id] : null; 
  const yaRespondio = (userIdx !== null);

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const currentNote = savedNotes[q.id]; 
  const noteText = currentNote ? currentNote.text : "";
  const hasNote = !!noteText;

  // --- 🏆 INSIGNIA "PREGUNTA TOMADA" ---
  let badgeHTML = "";
  if (q.oficial === true) {
      let nombreExamen = q.examen || "Examen Oficial";
      if (nombreExamen.includes("_")) {
          nombreExamen = nombreExamen.replace(/_/g, " ");
          nombreExamen = nombreExamen.replace(/\b\w/g, l => l.toUpperCase());
      }
      let detalle = q.anio ? `(${nombreExamen} ${q.anio})` : `(${nombreExamen})`;
      
      badgeHTML = `
        <div class="badge-oficial">
           <span style="font-size:1.1em; margin-right:4px;">⭐️</span> 
           PREGUNTA TOMADA 
           <span style="font-weight:400; opacity:0.8; margin-left:6px;">${detalle}</span>
        </div>
      `;
  }

  // --- OPCIONES ---
  const opcionesHTML = opciones.map((texto, idx) => {
    let claseCSS = "q-option";
    let letra = String.fromCharCode(97 + idx); 
    let eventHandler = `onclick="answer(${idx})"`;

    // CASO A: MODO REVISIÓN O NORMAL (YA RESPONDIDO Y CORREGIDO)
    if ((!isExamMode && yaRespondio) || isReview) {
        claseCSS += " q-option-locked"; 
        eventHandler = ""; 
        if (idx === correctIndex) claseCSS += " option-correct"; 
        else if (idx === userIdx) claseCSS += " option-wrong";   
    }
    // CASO B: MODO EXAMEN REAL (SELECCIONADA PERO OCULTA LA VERDAD)
    else if (isExamMode && idx === userIdx) {
        claseCSS += " option-selected-neutral"; 
    }

    return `
      <label class="${claseCSS}" id="opt-${idx}" ${eventHandler}>
        <span class="q-option-letter">${letra})</span>
        <span class="q-option-text">${texto}</span>
      </label>
    `;
  }).join("");

  // --- EXPLICACIÓN ---
  let explicacionInicial = "";
  if (q.explicacion && ( (!isExamMode && yaRespondio) || isReview )) {
      explicacionInicial = `
        <div class="q-explanation fade">
           <strong>💡 Explicación:</strong><br>${q.explicacion}
           <div style="margin-top:10px; text-align:right;">
              <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button>
           </div>
        </div>`;
  }

  app.innerHTML = `
    <div id="imgModal" class="img-modal" onclick="closeImgModal()">
      <span class="img-modal-close">&times;</span>
      <img class="img-modal-content" id="imgInModal">
      <div id="imgCaption" class="img-modal-caption"></div>
    </div>

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

          <div class="q-options">
            ${opcionesHTML || `<p class="small">(Sin opciones)</p>`}
          </div>

          <div id="explanation-holder">${explicacionInicial}</div>

          <div style="margin-top:25px; border-top:1px dashed #e2e8f0; padding-top:15px;">
             <button class="btn-small" 
                     style="background:${hasNote ? '#fefce8' : 'white'}; border-color:${hasNote ? '#facc15' : '#e2e8f0'}; color:${hasNote ? '#854d0e' : '#64748b'};"
                     onclick="toggleNoteArea('${q.id}')">
                ${hasNote ? '📝 Ver mi nota' : '➕ Nota personal'}
             </button>
             <div id="note-area-${q.id}" style="display:none; margin-top:10px;">
                <textarea id="note-text-${q.id}" placeholder="Escribí acá..." style="width:100%; height:80px; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">${noteText}</textarea>
                <div style="margin-top:6px; text-align:right;">
                   <button class="btn-small" style="background:#3b82f6; color:white; border:none;" onclick="saveNoteResolver('${q.id}')">💾 Guardar</button>
                </div>
             </div>
          </div>

          <div class="q-nav-row">
            
            <div class="nav-group">
                <button class="btn-nav btn-nav-ghost" onclick="salirResolucion()">
                    🚪 Salir
                </button>
                <button class="btn-nav btn-nav-danger" onclick="intentarFinalizar()">
                    🏁 Terminar
                </button>
            </div>

            <div class="nav-group">
                <button class="btn-nav btn-nav-primary" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>
                    ⬅ Anterior
                </button>
                <button class="btn-nav btn-nav-primary" onclick="nextQuestion()" ${CURRENT.i === total - 1 ? "disabled" : ""}>
                    Siguiente ➡
                </button>
            </div>

          </div>

        </div>
      </div>

      <aside class="q-sidebar" id="sidebarEl">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div class="q-sidebar-header" style="margin:0;">Índice</div>
            <button class="btn-small btn-close-mobile" onclick="toggleMobileSidebar()">✖</button>
        </div>
        
        <div class="q-sidebar-pager">
          <button class="btn-small" onclick="sbPrevPage()">◀</button>
          <div class="q-sidebar-pageinfo" id="sbInfo">...</div>
          <button class="btn-small" onclick="sbNextPage()">▶</button>
        </div>
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

  // 1. Guardar respuesta en CURRENT
  CURRENT.userAnswers[q.id] = selectedIndex;

  // 2. MODO EXAMEN: Solo marcamos visualmente
  if (isExamMode) {
      const options = document.querySelectorAll(".q-option");
      options.forEach((el, idx) => {
          el.classList.remove("option-selected-neutral");
          if(idx === selectedIndex) {
              el.classList.add("option-selected-neutral");
          }
      });
      refreshSidebarContent();
      return; 
  }

  // 3. MODO PRÁCTICA: Corregimos al toque
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
          holder.innerHTML = `
            <div class="q-explanation fade" style="animation: fadeIn 0.5s ease;">
               <strong>💡 Explicación:</strong><br>${q.explicacion}
               <div style="margin-top:10px; text-align:right;">
                  <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')">📋 Agregar a mis notas</button>
               </div>
            </div>
          `;
      }
  }
  refreshSidebarContent();
}

/* ==========================================================
   ⏮ ⏭ NAVEGACIÓN Y CONTROL (Lógica Actualizada)
   ========================================================== */

function nextQuestion() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
  // NOTA: Ya no finaliza automáticamente al llegar al final.
}

function prevQuestion() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
}

// NUEVO: Lógica del botón "Terminar"
function intentarFinalizar() {
    // Contar respondidas
    const total = CURRENT.list.length;
    let respondidas = 0;
    
    // Contamos claves en userAnswers que correspondan a preguntas de la lista actual
    // (Por si userAnswers tiene basura de otras cosas, aunque se limpia al iniciar)
    CURRENT.list.forEach(q => {
        if (CURRENT.userAnswers[q.id] !== undefined && CURRENT.userAnswers[q.id] !== null) {
            respondidas++;
        }
    });

    const faltan = total - respondidas;
    let msg = "";

    if (faltan === 0) {
        msg = "Has respondido todas las preguntas.\n¿Deseas finalizar el examen y ver tu calificación?";
    } else {
        msg = `⚠️ Aún te faltan responder ${faltan} de ${total} preguntas.\n\nSi finalizas ahora, se calculará tu nota basándose en lo que has hecho (las vacías cuentan como error).\n¿Estás seguro de terminar?`;
    }

    if (confirm(msg)) {
        renderFin(); // Esto dispara el guardado en Historial y muestra Results
    }
}

// NUEVO: Lógica del botón "Salir"
function salirResolucion() {
  let msg = "¿Deseas salir al menú principal?";
  
  if (CURRENT.modo === 'personalizado') {
      // Simulacro: Se pierde si sale
      msg += "\n\n⚠️ ATENCIÓN: Estás en un Simulacro Personalizado.\nSi sales ahora sin 'Terminar', este intento NO se guardará en el historial y perderás el progreso de esta sesión.";
  } else {
      // Oficial / Práctica: Se guarda (Pausa)
      msg += "\n\n(Tu progreso parcial se mantendrá guardado y podrás continuar luego).";
  }

  if (confirm(msg)) {
      stopTimer();
      renderHome();
  }
}

/* ==========================================================
   🖼 GESTIÓN DE IMÁGENES & SIDEBAR (Igual que antes)
   ========================================================== */
function renderImagenesPregunta(imgs) {
  if (!Array.isArray(imgs) || !imgs.length) return "";
  return `
    <div class="q-images-container">
       ${imgs.map((src, idx) => `
          <div class="q-image-thumbnail" onclick="openImgModal('${src}', 'Imagen ${idx+1}')">
             <img src="${src}" alt="Imagen clínica" loading="lazy">
             <div class="q-image-zoom-hint">🔍 Ampliar</div>
          </div>
       `).join("")}
    </div>
  `;
}

window.openImgModal = (src, caption) => {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("imgInModal");
  const captionText = document.getElementById("imgCaption");
  if(modal && modalImg) {
      modal.style.display = "flex";
      modalImg.src = src;
      if(captionText) captionText.innerHTML = caption || "";
  }
};

window.closeImgModal = () => {
  const modal = document.getElementById("imgModal");
  if(modal) modal.style.display = "none";
};

function toggleMobileSidebar() {
    const sb = document.getElementById("sidebarEl");
    if(sb) sb.classList.toggle("active-mobile");
}

function sbNextPage() {
    const totalPages = Math.ceil(CURRENT.list.length / SB_PAGE_SIZE);
    if (SB_PAGE < totalPages - 1) {
        SB_PAGE++;
        refreshSidebarContent();
    }
}

function sbPrevPage() {
    if (SB_PAGE > 0) {
        SB_PAGE--;
        refreshSidebarContent();
    }
}

function refreshSidebarContent() {
    const grid = document.getElementById("sbGrid");
    if(grid) grid.innerHTML = renderSidebarCells();
    paintSidebarPageInfo();
}

function ensureSidebarOnCurrent() {
  const targetPage = Math.floor(CURRENT.i / SB_PAGE_SIZE);
  SB_PAGE = targetPage;
}

function paintSidebarPageInfo() {
    const el = document.getElementById("sbInfo");
    if(!el) return;
    const totalPages = Math.ceil(CURRENT.list.length / SB_PAGE_SIZE);
    el.textContent = `${SB_PAGE + 1}/${totalPages}`;
}

function renderSidebarCells() {
  const total = CURRENT.list.length;
  const start = SB_PAGE * SB_PAGE_SIZE;
  const end = Math.min(total, start + SB_PAGE_SIZE);
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  
  const isExamMode = (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision');

  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const esActual = idx === CURRENT.i;
    const userAns = CURRENT.userAnswers[q.id];

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (savedNotes[q.id]) cls += " sb-note";

    if (isExamMode) {
        if (userAns !== undefined && userAns !== null) cls += " sb-answered-neutral";
    } else {
        const estado = CURRENT.session[q.id]; 
        if (estado === "ok") cls += " sb-ok";
        if (estado === "bad") cls += " sb-bad";
        
        if (CURRENT.modo === 'revision' && userAns !== undefined) {
             const ops = getOpcionesArray(q);
             const rIdx = getCorrectIndex(q, ops.length);
             if(!cls.includes('sb-ok') && !cls.includes('sb-bad')) {
                 cls += (userAns === rIdx) ? " sb-ok" : " sb-bad";
             }
        }
    }

    out.push(`<div class="${cls}" onclick="irAPregunta(${idx}); toggleMobileSidebar();">${idx + 1}</div>`);
  }
  return out.join("");
}

function irAPregunta(idx) {
  if (idx < 0 || idx >= CURRENT.list.length) return;
  CURRENT.i = idx;
  renderPregunta();
}

/* ==========================================================
   🏁 FINALIZAR
   ========================================================== */
function renderFin() {
  stopTimer();

  // 1. Procesar corrección
  if (CURRENT.config.correccionFinal === true && CURRENT.modo !== 'revision') {
      procesarResultadosExamenFinal();
  }

  // 2. Guardar Historial (Simulacros / Examenes Oficiales)
  // Ahora manejamos ambos casos con 'window.guardarResultadoSimulacro' si tienen metadata
  if ((CURRENT.modo === 'personalizado' || CURRENT.modo === 'examen' || CURRENT.modo === 'reanudar') 
      && typeof window.guardarResultadoSimulacro === 'function' 
      && CURRENT.config.metaSubjects) {
      
      let correctas = 0;
      let total = CURRENT.list.length;
      
      CURRENT.list.forEach(q => {
          const uIdx = CURRENT.userAnswers[q.id];
          const rIdx = getCorrectIndex(q, getOpcionesArray(q).length);
          if (uIdx !== undefined && uIdx !== null && uIdx === rIdx) {
              correctas++;
          }
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
          date: new Date().toISOString(),
          score: score,
          correctCount: correctas,
          totalQ: total,
          timeStr: timeStr,
          subjects: CURRENT.config.metaSubjects || [],
          isOfficial: CURRENT.config.metaIsOfficial || false,
          examId: CURRENT.config.examenId || null // Guardamos ID de examen si existe
      };

      window.guardarResultadoSimulacro(resultado);
  }

  // 3. Pantalla Resultados
  if (typeof renderDetailedResults === 'function') {
      renderDetailedResults();
  } else {
      renderFinSimple();
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

function renderFinSimple() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card" style="text-align:center"><h2>Examen Finalizado</h2><button class="btn-main" onclick="renderHome()">Inicio</button></div>`;
}

/* ==========================================================
   🕒 TIMER & NOTAS
   ========================================================== */
function initTimer() {
  stopTimer();
  TIMER.start = Date.now();
  let el = document.getElementById("exam-timer");
  if (!el) {
    el = document.createElement("div");
    el.id = "exam-timer";
    el.className = "exam-timer";
    document.body.appendChild(el);
  }
  el.style.display = "block"; 
  el.textContent = "⏱ 00:00";
  
  TIMER.interval = setInterval(() => {
    const totalSeconds = Math.floor((Date.now() - TIMER.start) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const timeString = h > 0 
        ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        
    if (el) el.textContent = "⏱ " + timeString;
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  const el = document.getElementById("exam-timer");
  if (el) el.style.display = "none"; 
}

function toggleNoteArea(id) {
    const area = document.getElementById(`note-area-${id}`);
    if(area) area.style.display = (area.style.display === "none") ? "block" : "none";
}

function saveNoteResolver(id) {
    const txt = document.getElementById(`note-text-${id}`).value;
    if (!txt.trim()) return alert("Nota vacía");
    const saved = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    saved[id] = { text: txt, date: Date.now() };
    localStorage.setItem("mebank_notes", JSON.stringify(saved));
    alert("Nota guardada");
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

/* ==========================================================
   HELPERS
   ========================================================== */
function getOpcionesArray(q) {
  if (!q.opciones) return [];
  if (Array.isArray(q.opciones)) return q.opciones.map(t => t.replace(/^[a-eA-E][\.\)]\s*/, ""));
  if (typeof q.opciones === "object") {
    return ["a", "b", "c", "d", "e"].map(k => q.opciones[k]).filter(v => v);
  }
  return [];
}

function getCorrectIndex(q, totalOpciones) {
  let raw = q.correcta;
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') return (raw >= 0 && raw < totalOpciones) ? raw : null;
  if (typeof raw === 'string') {
      const mapa = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4 };
      let s = raw.trim().toLowerCase().replace(/[\.\)]/g, "");
      return mapa[s] ?? null;
  }
  return null;
}

function getMateriaNombreForQuestion(q) {
  if (!q || !q.materia) return "";
  const materias = Array.isArray(q.materia) ? q.materia : [q.materia];
  const nombres = materias.map(slug => {
    if (typeof BANK !== 'undefined' && BANK.subjects) {
      const mat = BANK.subjects.find(s => s.slug === slug);
      return mat ? mat.name : slug;
    }
    return slug;
  });
  return nombres.join(" | ");
}
