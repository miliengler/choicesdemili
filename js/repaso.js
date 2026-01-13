/* ==========================================================
   📚 MEbank 4.1 – Módulo de Repaso (FINAL - FIXED)
   ========================================================== */

let REPASO_FILTER = 'all'; 
let REPASO_MATERIA = 'all'; 
let REPASO_SEARCH = '';

// Variables Globales para la Navegación
let CURRENT_REPASO_LIST = []; // La lista filtrada actual
let CURRENT_Q_INDEX = -1;     // La posición de la pregunta abierta

function renderRepasoMain() {
  const app = document.getElementById("app");
  if (!document.getElementById("repaso-root")) {
      renderRepasoShell(app);
      // Evento de teclado para navegar
      document.addEventListener('keydown', handleModalKeys);
  }
  updateRepasoList();
}

/* 1. ESTRUCTURA (Shell) */
function renderRepasoShell(container) {
  let materiasOptions = `<option value="all">📚 Todas</option>`;
  if (typeof BANK !== 'undefined' && BANK.subjects) {
      const sortedSubjects = [...BANK.subjects].sort((a, b) => {
          const nameA = a.name.replace(/^[\W\s]+/, '');
          const nameB = b.name.replace(/^[\W\s]+/, '');
          return nameA.localeCompare(nameB);
      });
      materiasOptions += sortedSubjects.map(m => `<option value="${m.slug}">${m.name}</option>`).join("");
  }

  const styles = `
    <style>
      /* --- Estilos Base --- */
      .repaso-header { background: var(--bg-card, white); padding: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
      .btn-back-nav { background: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 14px; }
      .search-box { position: relative; margin-bottom: 15px; }
      .search-input { width: 100%; padding: 12px 15px 12px 40px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; background: var(--bg-input, white); color: var(--text-main, black); }
      .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
      
      /* Filtros */
      .filters-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .filter-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; flex-grow: 1; }
      .tab-btn { padding: 8px 14px; border-radius: 20px; border: 1px solid #e2e8f0; background: var(--bg-card, white); color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
      .tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
      .tab-btn.active-fav { background: #be123c; color: white; border-color: #be123c; }
      .tab-btn.active-note { background: #d97706; color: white; border-color: #d97706; }
      .materia-select-compact { max-width: 160px; padding: 8px 25px 8px 10px; border-radius: 20px; border: 1px solid #cbd5e1; background: white; font-size: 13px; font-weight: 500; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right .7em top 50%; background-size: .65em auto; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

      /* Lista */
      .repaso-item { background: var(--bg-card, white); border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: transform 0.1s; }
      .ri-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #94a3b8; }
      .tag-fav { color: #e11d48; background: #fff1f2; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
      .tag-note { color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }

      /* --- MODAL INTELIGENTE --- */
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 2000; display: none; justify-content: center; align-items: center; }
      .modal-content { background: white; width: 100%; max-width: 700px; height: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 4px 25px rgba(0,0,0,0.2); animation: zoomIn 0.2s ease-out; }
      @media (min-width: 768px) { .modal-content { border-radius: 16px; height: 85vh; } }
      @keyframes zoomIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

      /* Cabecera Modal */
      .modal-header { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 16px 16px 0 0; }
      .nav-controls { display: flex; gap: 10px; align-items: center; }
      .btn-nav { background: white; border: 1px solid #cbd5e1; color: #334155; width: 36px; height: 36px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.1s; }
      .btn-nav:hover { background: #e2e8f0; border-color: #94a3b8; }
      .btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
      .btn-close-modal { width: 30px; height: 30px; border: none; background: transparent; font-size: 24px; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .btn-close-modal:hover { color: #ef4444; }
      
      /* Cuerpo Modal */
      .modal-body { flex: 1; overflow-y: auto; padding: 25px; scroll-behavior: smooth; position: relative; }
      
      .mq-enunciado { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; line-height: 1.5; }
      .mq-opt { display: flex; gap: 10px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; align-items: flex-start; }
      .mq-opt:hover { background: #f8fafc; border-color: #cbd5e1; }
      .mq-opt.correct { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
      .mq-opt.wrong { border-color: #ef4444; background: #fef2f2; opacity: 0.7; }
      
      /* Clases para letras de opciones */
      .mq-opt-letter { font-weight: 700; color: #64748b; margin-right: 8px; min-width: 20px; }
      .mq-opt.wrong .mq-opt-letter { color: #ef4444; }
      .mq-opt.correct .mq-opt-letter { color: #166534; }

      /* --- EXPLICACIÓN (Corrección Display) --- */
      .mq-expl { 
          margin-top: 25px; 
          padding: 20px; 
          background: #f1f5f9; 
          border-radius: 10px; 
          font-size: 14px; 
          line-height: 1.6; 
          color: #334155; 
          display: none; /* Oculto por defecto */
          border-left: 4px solid #64748b; 
      }
      .mq-expl.visible { 
          display: block !important; /* Forzar mostrado */
          animation: fadeIn 0.4s; 
      }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

      .match-badge { font-size: 11px; background: #fef9c3; color: #854d0e; padding: 4px 8px; border-radius: 12px; font-weight: 600; border: 1px solid #fde047; display: inline-flex; align-items: center; gap: 4px; }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div id="repaso-root" class="fade" style="background:var(--bg-app, #f8fafc); min-height:100vh;">
       
       <div class="repaso-header">
           <div class="header-top">
               <div style="display:flex; align-items:center; gap:8px;">
                   <h2 style="margin:0; font-size:20px; color:var(--text-main, #1e293b);">📚 Mi Repaso</h2>
                   <button class="btn-help" onclick="alert('🔎 Buscador Inteligente:\n\nSi la palabra buscada está en la explicación o en tus notas, verás un aviso en la pregunta.\n\n⌨ Usa las flechas del teclado para navegar entre preguntas.')" style="width:24px; height:24px; border-radius:50%; border:none; background:#e2e8f0; color:#64748b; font-weight:bold; cursor:pointer;">?</button>
               </div>
               <button class="btn-back-nav" onclick="renderHome()">⬅ Volver</button>
           </div>
           
           <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" id="repaso-input-el" class="search-input" placeholder="Buscar en preguntas, notas, temas..." value="${REPASO_SEARCH}" oninput="onRepasoSearch(this.value)" autocomplete="off">
           </div>

           <div class="filters-row">
               <div class="filter-tabs">
                   <button id="tab-all" class="tab-btn" onclick="setRepasoFilter('all')">Todo</button>
                   <button id="tab-fav" class="tab-btn" onclick="setRepasoFilter('fav')">♥ Favoritas</button>
                   <button id="tab-notes" class="tab-btn" onclick="setRepasoFilter('notes')">📝 Notas</button>
               </div>
               <select class="materia-select-compact" onchange="setRepasoMateria(this.value)">
                   ${materiasOptions}
               </select>
           </div>
       </div>

       <div id="repaso-results-container" style="padding: 0 15px 40px 15px; max-width: 800px; margin: auto;"></div>

       <div id="repaso-modal" class="modal-overlay" onclick="cerrarModalRepaso(event)">
           <div class="modal-content" onclick="event.stopPropagation()">
               <div class="modal-header">
                   <div style="display:flex; align-items:center; gap:15px; flex:1;">
                       <div class="nav-controls">
                           <button class="btn-nav" id="btn-prev" onclick="navegarModal(-1)">❮</button>
                           <button class="btn-nav" id="btn-next" onclick="navegarModal(1)">❯</button>
                       </div>
                       <div style="display:flex; flex-direction:column;">
                           <span style="font-weight:700; color:#475569; font-size:13px;" id="modal-meta">Materia</span>
                           <span id="modal-match-info"></span> 
                       </div>
                   </div>
                   <button class="btn-close-modal" onclick="cerrarModalRepaso()">×</button>
               </div>

               <div class="modal-body" id="modal-body-content">
                   </div>
           </div>
       </div>

    </div>
  `;
}

/* 2. ACTUALIZAR LISTA & GUARDAR REFERENCIA */
function updateRepasoList() {
  const container = document.getElementById("repaso-results-container");
  if (!container) return;

  // Actualizar Tabs
  document.getElementById('tab-all').className = `tab-btn ${REPASO_FILTER==='all'?'active':''}`;
  document.getElementById('tab-fav').className = `tab-btn ${REPASO_FILTER==='fav'?'active-fav':''}`;
  document.getElementById('tab-notes').className = `tab-btn ${REPASO_FILTER==='notes'?'active-note':''}`;

  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");

  // FILTRADO
  let list = BANK.questions.filter(q => {
      if (REPASO_MATERIA !== 'all') {
          const qMateriaArr = Array.isArray(q.materia) ? q.materia : [q.materia];
          if (!qMateriaArr.includes(REPASO_MATERIA)) return false;
      }
      if (REPASO_SEARCH) {
          const term = REPASO_SEARCH.toLowerCase();
          const enun = (q.enunciado || "").toLowerCase();
          const expl = (q.explicacion || "").toLowerCase();
          const userNote = (notes[q.id] ? notes[q.id].text : "").toLowerCase();
          const submat = Array.isArray(q.submateria) ? q.submateria.join(" ") : (q.submateria || "");
          if (!enun.includes(term) && !expl.includes(term) && !userNote.includes(term) && !submat.toLowerCase().includes(term)) return false;
      }
      if (REPASO_FILTER === 'fav') return favorites.includes(q.id);
      if (REPASO_FILTER === 'notes') return !!notes[q.id];
      if (REPASO_FILTER === 'all') {
         if (REPASO_SEARCH.length > 1 || REPASO_MATERIA !== 'all') return true;
         return favorites.includes(q.id) || !!notes[q.id];
      }
      return false;
  });

  // GUARDAMOS LA LISTA GLOBALMENTE PARA LA NAVEGACIÓN
  CURRENT_REPASO_LIST = list;

  const displayList = list.slice(0, 50);

  if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#94a3b8;"><div style="font-size:48px; margin-bottom:15px; opacity:0.5;">🔍</div><p>No se encontraron resultados.</p></div>`;
      return;
  }

  container.innerHTML = `
    <div style="margin-bottom:10px; font-size:12px; color:#64748b; text-align:right;">${list.length} resultados encontrados</div>
    ${displayList.map(q => {
      const isFav = favorites.includes(q.id);
      const hasNote = !!notes[q.id];
      const matName = getMateriaNombre(Array.isArray(q.materia) ? q.materia[0] : q.materia);
      let notePreview = hasNote ? `<div style="margin-top:8px; font-size:12px; color:#b45309; background:#fffbeb; padding:8px; border-radius:6px; border-left:3px solid #f59e0b;">📝 ${notes[q.id].text.substring(0, 80)}...</div>` : "";
      
      // Enviamos el ID a la función de apertura
      return `
        <div class="repaso-item" onclick="abrirModalRepasoPorID('${q.id}')">
            <div class="ri-header"><span style="font-weight:600; color:#64748b;">${matName}</span><div class="ri-tags">${isFav ? '<span class="tag-fav">♥</span>' : ''}${hasNote ? '<span class="tag-note">📝</span>' : ''}</div></div>
            <div style="font-size:14px; color:var(--text-main, #334155); line-height:1.5;">${highlightSearchTerm(q.enunciado.substring(0, 150) + "...", REPASO_SEARCH)}</div>
            ${notePreview}
        </div>`;
    }).join("")}`;
}

/* 3. LÓGICA DEL MODAL INTELIGENTE */

function abrirModalRepasoPorID(qid) {
    const index = CURRENT_REPASO_LIST.findIndex(q => q.id === qid);
    if (index !== -1) {
        renderModalQuestion(index);
        document.getElementById("repaso-modal").style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function renderModalQuestion(index) {
    if (index < 0 || index >= CURRENT_REPASO_LIST.length) return;
    
    CURRENT_Q_INDEX = index;
    const q = CURRENT_REPASO_LIST[index];
    const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    const userNote = notes[q.id] ? notes[q.id].text : null;

    // Actualizar Botones Navegación
    document.getElementById("btn-prev").disabled = (index === 0);
    document.getElementById("btn-next").disabled = (index === CURRENT_REPASO_LIST.length - 1);

    // Metadata
    const matName = getMateriaNombre(Array.isArray(q.materia) ? q.materia[0] : q.materia);
    document.getElementById("modal-meta").innerText = `${matName} (${index + 1}/${CURRENT_REPASO_LIST.length})`;

    // DETECTOR DE COINCIDENCIAS OCULTAS
    let matchInfoHTML = "";
    if (REPASO_SEARCH) {
        const term = REPASO_SEARCH.toLowerCase();
        const explMatches = (q.explicacion || "").toLowerCase().includes(term);
        const noteMatches = (userNote || "").toLowerCase().includes(term);
        
        if (explMatches && noteMatches) matchInfoHTML = `<span class="match-badge">⚠️ Ojo: "${REPASO_SEARCH}" está en Explicación y Notas</span>`;
        else if (explMatches) matchInfoHTML = `<span class="match-badge">⚠️ Encontrado en Explicación</span>`;
        else if (noteMatches) matchInfoHTML = `<span class="match-badge">📝 Encontrado en tus Notas</span>`;
    }
    document.getElementById("modal-match-info").innerHTML = matchInfoHTML;

    // Cuerpo
    const body = document.getElementById("modal-body-content");
    const opcionesHTML = getOpcionesArray(q).map((txt, idx) => {
        const letra = String.fromCharCode(97 + idx);
        // CORRECCIÓN: Usamos la clase mq-opt-letter para que JS pueda encontrarla luego
        return `<div class="mq-opt" id="mopt-${idx}" onclick="checkModalAnswer(${idx})">
                  <span class="mq-opt-letter">${letra})</span>
                  <span>${highlightSearchTerm(txt, REPASO_SEARCH)}</span>
                </div>`;
    }).join("");
    
    // Imágenes
    let imgsEnunciado = q.imagenes ? (typeof renderImagenesPregunta === 'function' ? renderImagenesPregunta(q.imagenes) : "") : "";

    body.innerHTML = `
        <div class="mq-enunciado">${highlightSearchTerm(q.enunciado, REPASO_SEARCH)}</div>
        ${imgsEnunciado}
        
        <div class="mq-options-list">${opcionesHTML}</div>
        
        <div id="modal-expl" class="mq-expl">
            <div style="margin-bottom:10px; font-weight:bold;">💡 Explicación:</div>
            ${highlightSearchTerm(q.explicacion, REPASO_SEARCH)}
            ${q.explicacion_img ? (typeof renderImagenesExplicacion === 'function' ? renderImagenesExplicacion(q.explicacion_img) : "") : ""}
            
            ${userNote ? `<div style="margin-top:15px; padding-top:15px; border-top:1px dashed #cbd5e1; color:#d97706;">
                <strong>📝 Tu Nota:</strong><br>${highlightSearchTerm(userNote, REPASO_SEARCH)}
            </div>` : ''}
        </div>
    `;

    // Scroll arriba al cambiar de pregunta
    body.scrollTop = 0;
}

function checkModalAnswer(selectedIndex) {
    const q = CURRENT_REPASO_LIST[CURRENT_Q_INDEX];
    if (!q) return;

    // 1. Verificar respuesta
    const opciones = getOpcionesArray(q);
    const correctIndex = getCorrectIndex(q, opciones.length);

    // 2. Marcar visualmente (Verde/Rojo)
    const allOpts = document.querySelectorAll(".mq-opt");
    allOpts.forEach((el, idx) => {
        el.onclick = null; // Bloquear nuevos clicks
        el.style.cursor = "default";
        if (idx === correctIndex) {
            el.classList.add("correct");
            // CORRECCIÓN: Ahora sí encuentra el elemento porque le pusimos la clase
            el.querySelector(".mq-opt-letter").innerHTML = "✓";
        } else if (idx === selectedIndex) {
            el.classList.add("wrong");
            el.querySelector(".mq-opt-letter").innerHTML = "✕";
        } else {
            el.style.opacity = "0.5";
        }
    });

    // 3. MOSTRAR EXPLICACIÓN Y SCROLLEAR
    const explDiv = document.getElementById("modal-expl");
    if (explDiv) {
        explDiv.style.display = "block"; 
        setTimeout(() => {
             explDiv.classList.add("visible"); 
             // Scroll suave hasta la explicación
             explDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    }
}


function navegarModal(offset) {
    const newIndex = CURRENT_Q_INDEX + offset;
    renderModalQuestion(newIndex);
}

function handleModalKeys(e) {
    const modal = document.getElementById("repaso-modal");
    if (modal.style.display === "flex") {
        if (e.key === "ArrowRight") navegarModal(1);
        if (e.key === "ArrowLeft") navegarModal(-1);
        if (e.key === "Escape") cerrarModalRepaso();
    }
}

function cerrarModalRepaso(e) {
    // Si viene del botón o del overlay
    document.getElementById("repaso-modal").style.display = "none";
    document.body.style.overflow = "";
}

// Helpers
function onRepasoSearch(val) { REPASO_SEARCH = val; updateRepasoList(); }
function setRepasoFilter(mode) { REPASO_FILTER = mode; updateRepasoList(); }
function setRepasoMateria(slug) { REPASO_MATERIA = slug; updateRepasoList(); }
function getMateriaNombre(slug) { if (typeof BANK !== 'undefined' && BANK.subjects) { const mat = BANK.subjects.find(s => s.slug === slug); return mat ? mat.name : slug; } return slug; }

function highlightSearchTerm(text, term) {
    if (!term || term.trim() === "" || typeof text !== 'string') return text;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, "gi");
    return text.replace(regex, '<mark style="background:#fef08a; color:#854d0e; padding:0 2px; border-radius:2px;">$1</mark>');
}

function getOpcionesArray(q) {
    if (Array.isArray(q.opciones)) return q.opciones;
    return ["a", "b", "c", "d"].map(k => q.opciones[k]).filter(v => v !== undefined);
}
function getCorrectIndex(q, total) {
    if (typeof q.correcta === "number") return q.correcta; 
    const map = { a:0, b:1, c:2, d:3, e:4 };
    if (typeof q.correcta === "string" && map[q.correcta.toLowerCase()] !== undefined) return map[q.correcta.toLowerCase()];
    return 0;
}

window.renderNotasMain = renderRepasoMain;
