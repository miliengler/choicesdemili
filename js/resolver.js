/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución (Full Optimizado.)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  config: {},
  session: {}
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
    session: {}
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
   🧩 RENDER PRINCIPAL (Sin Parpadeo)
   ========================================================== */
function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.list[CURRENT.i];

  if (!q) return renderFin();

  window.scrollTo({ top: 0, behavior: "smooth" });

  const total = CURRENT.list.length;
  const numero = CURRENT.i + 1;
  const materiaNombre = getMateriaNombreForQuestion(q);

  const userIdx = getRespuestaMarcada(q.id); 
  const yaRespondio = (userIdx !== null);

  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);

  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const currentNote = savedNotes[q.id]; 
  const noteText = currentNote ? currentNote.text : "";
  const hasNote = !!noteText;

  // --- 🏆 INSIGNIA "PREGUNTA TOMADA" ---
  let badgeHTML = "";
  const esModoExamen = (CURRENT.modo === "examen" || CURRENT.modo === "reanudar");

  if (!esModoExamen && q.oficial === true) {
      let nombreExamen = q.examen || "Examen Oficial";
      
      // Limpieza de nombre
      if (nombreExamen.includes("_")) {
          nombreExamen = nombreExamen.replace(/_/g, " ");
          nombreExamen = nombreExamen.replace(/\b\w/g, l => l.toUpperCase());
      }

      // Lógica Anti-Duplicado de Año
      let detalle = "";
      if (q.anio) {
          if (nombreExamen.includes(String(q.anio))) {
              detalle = `(${nombreExamen})`;
          } else {
              detalle = `(${nombreExamen} ${q.anio})`;
          }
      } else {
          detalle = `(${nombreExamen})`;
      }

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

    if (yaRespondio) {
        claseCSS += " q-option-locked"; 
        eventHandler = ""; // Quitamos click si ya respondió
        if (idx === correctIndex) claseCSS += " option-correct"; 
        else if (idx === userIdx) claseCSS += " option-wrong";   
    }

    // Agregamos ID único para poder pintarlo sin recargar
    return `
      <label class="${claseCSS}" id="opt-${idx}" ${eventHandler}>
        <span class="q-option-letter">${letra})</span>
        <span class="q-option-text">${texto}</span>
      </label>
    `;
  }).join("");

  // --- EXPLICACIÓN ---
  let explicacionInicial = "";
  if (yaRespondio && q.explicacion) {
      explicacionInicial = `
        <div class="q-explanation fade">
           <strong>💡 Explicación:</strong><br>${q.explicacion}
           <div style="margin-top:10px; text-align:right;">
              <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')" style="font-size:12px; border:1px solid #cbd5e1;">
                 📋 Agregar a mis notas
              </button>
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
              <b>${CURRENT.config.titulo || "Práctica"}</b>
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
            <button class="btn-small" onclick="prevQuestion()" ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
            <button class="btn-small" onclick="nextQuestion()">${CURRENT.i === total - 1 ? "Finalizar" : "Siguiente ➡"}</button>
            <button class="btn-small btn-ghost" onclick="salirResolucion()">Salir</button>
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
   ⚡️ RESPUESTA INSTANTÁNEA (DOM Patching - Sin Recargar)
   ========================================================== */
function answer(selectedIndex) {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return;
  
  // 1. Evitar doble respuesta
  if (getRespuestaMarcada(q.id) !== null) return;

  // 2. Guardar respuesta (Usamos setRespuestaMarcada, no saveRespuesta)
  setRespuestaMarcada(q.id, selectedIndex);

  // 3. Lógica de corrección
  const opciones = getOpcionesArray(q);
  const correctIndex = getCorrectIndex(q, opciones.length);
  const esCorrecta = (correctIndex !== null && selectedIndex === correctIndex);
  
  CURRENT.session[q.id] = esCorrecta ? "ok" : "bad";

  // Guardar progreso global
  const mat = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
  if (typeof PROG !== 'undefined') {
      if (!PROG[mat]) PROG[mat] = {};
      PROG[mat][q.id] = { status: CURRENT.session[q.id], fecha: Date.now() };
      if (window.saveProgress) window.saveProgress();
  }

  // Guardar stats diarias
  if (esCorrecta) {
    const hoy = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    stats[hoy] = (stats[hoy] || 0) + 1;
    localStorage.setItem("mebank_stats_daily", JSON.stringify(stats));
  }

  // 4. ACTUALIZACIÓN VISUAL SUAVE (Sin recargar toda la página)
  // Buscamos los botones por su ID o clase y los bloqueamos
  const container = document.querySelector(".q-options");
  if (container) {
      const labels = container.querySelectorAll("label");
      labels.forEach((el, idx) => {
          el.classList.add("q-option-locked");
          el.onclick = null; // Quitamos evento
          
          if (idx === correctIndex) {
              el.classList.add("option-correct"); // Pinta Verde
          } else if (idx === selectedIndex) {
              el.classList.add("option-wrong");   // Pinta Rojo
          }
      });
  }

  // 5. Mostrar explicación suavemente
  if (q.explicacion) {
      const holder = document.getElementById("explanation-holder");
      if (holder) {
          holder.innerHTML = `
            <div class="q-explanation fade" style="animation: fadeIn 0.5s ease;">
               <strong>💡 Explicación:</strong><br>${q.explicacion}
               <div style="margin-top:10px; text-align:right;">
                  <button class="btn-small btn-ghost" onclick="copiarExplicacionNota('${q.id}')" style="font-size:12px; border:1px solid #cbd5e1;">
                     📋 Agegar a mis notas
                  </button>
               </div>
            </div>
          `;
      }
  }


  // 6. Actualizar Sidebar (Solo la celda actual)
  // Como no tenemos IDs únicos en las celdas del sidebar en el render original,
  // recargamos solo el sidebar (es imperceptible)
  refreshSidebarContent();
}

/* ==========================================================
   🖼 GESTIÓN DE IMÁGENES (LIGHTBOX)
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

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") window.closeImgModal();
});

/* ==========================================================
   ⏭ Navegación y Sidebar
   ========================================================== */
function nextQuestion() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    ensureSidebarOnCurrent();
    renderPregunta();
  } else {
    renderFin();
  }
}

function prevQuestion() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    ensureSidebarOnCurrent();
    renderPregunta();
  }
}

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

  const out = [];
  for (let idx = start; idx < end; idx++) {
    const q = CURRENT.list[idx];
    const estado = CURRENT.session[q.id]; 
    const esActual = idx === CURRENT.i;

    let cls = "sb-cell";
    if (esActual) cls += " sb-active";
    if (estado === "ok") cls += " sb-ok";
    if (estado === "bad") cls += " sb-bad";
    if (savedNotes[q.id]) cls += " sb-note";

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
   🏁 Finalizar
   ========================================================== */
function renderFin() {
  stopTimer();
  const total = CURRENT.list.length;
  const values = Object.values(CURRENT.session);
  const ok = values.filter(v => v === "ok").length;
  const bad = values.filter(v => v === "bad").length;
  const skipped = total - ok - bad;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      <h2 style="margin-bottom:20px;">🏁 Resultados</h2>
      
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px;">
         <div style="background:#f1f5f9; padding:10px; border-radius:8px;">
            <div style="font-size:24px;">${total}</div>
            <div style="font-size:12px; color:#64748b;">Totales</div>
         </div>
         <div style="background:#dcfce7; padding:10px; border-radius:8px; color:#166534;">
            <div style="font-size:24px;">${ok}</div>
            <div style="font-size:12px;">Correctas</div>
         </div>
         <div style="background:#fee2e2; padding:10px; border-radius:8px; color:#991b1b;">
            <div style="font-size:24px;">${bad}</div>
            <div style="font-size:12px;">Incorrectas</div>
         </div>
      </div>

      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

function salirResolucion() {
  if (!confirm("¿Salir del examen actual?")) return;
  stopTimer();
  renderHome();
}

/* ==========================================================
   🕒 TIMER & HELPERS
   ========================================================== */
let TIMER = { interval: null, start: 0 };

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
        
    const box = document.getElementById("exam-timer");
    if (box) box.textContent = "⏱ " + timeString;
  }, 1000);
}

function stopTimer() {
  if (TIMER.interval) clearInterval(TIMER.interval);
  TIMER.interval = null;
  const el = document.getElementById("exam-timer");
  if (el) el.style.display = "none"; 
}

// Helpers de datos
const RESP_MARCADAS = {};
function setRespuestaMarcada(id, idx) { RESP_MARCADAS[id] = idx; }
function getRespuestaMarcada(id) { return RESP_MARCADAS[id] ?? null; }

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
      let s = raw.trim().toLowerCase().replace(/[\.\)]/g, "");
      if (!isNaN(s) && s !== "") {
          let num = parseInt(s, 10);
          return (num >= 0 && num < totalOpciones) ? num : null;
      }
      const mapa = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4 };
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
/* ==========================================================
   📋 NUEVA FUNCIÓN: Copiar Explicación a Notas
   ========================================================== */
window.copiarExplicacionNota = (qid) => {
    // 1. Buscamos la pregunta en la lista actual
    const q = CURRENT.list.find(item => item.id === qid);
    if (!q || !q.explicacion) return;

    // 2. Buscamos el textarea
    const textArea = document.getElementById(`note-text-${qid}`);
    const noteArea = document.getElementById(`note-area-${qid}`);
    if (!textArea || !noteArea) return;

    // 3. Limpieza de texto (convertimos <br> en saltos de linea y quitamos negritas)
    let textoLimpio = q.explicacion
        .replace(/<br\s*\/?>/gi, '\n') // <br> a salto de linea
        .replace(/<[^>]+>/g, '');      // Quitar resto de tags HTML (<b>, <i>, etc)

    // 4. Agregamos el texto
    if (textArea.value.trim()) {
        // Si ya hay texto, agregamos dos saltos de línea y un separador
        textArea.value += "\n\n--- Explicación ---\n" + textoLimpio;
    } else {
        textArea.value = textoLimpio;
    }

    // 5. Abrimos el área si está cerrada
    if (noteArea.style.display === "none") {
        noteArea.style.display = "block";
    }

    // 6. Efecto visual y foco
    textArea.focus();
    // Movemos el scroll al final del textarea
    textArea.scrollTop = textArea.scrollHeight;
    
    // Feedback visual breve en el botón (opcional, pero queda bien)
    const btn = event.target; // El botón que se clickeó
    const textoOriginal = btn.textContent;
    btn.textContent = "✅ ¡Copiado!";
    setTimeout(() => { btn.textContent = textoOriginal; }, 1500);
};

