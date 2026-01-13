/* ==========================================================
   📚 MEbank 3.0 – Módulo de Repaso (Optimizado - Fluido)
   ========================================================== */

let REPASO_FILTER = 'all'; // 'all', 'fav', 'notes'
let REPASO_SEARCH = '';

// Función Principal: Orquesta todo
function renderRepasoMain() {
  const app = document.getElementById("app");
  
  // Si ya estamos en la pantalla de repaso, NO redibujamos todo (para no cerrar el teclado)
  if (!document.getElementById("repaso-root")) {
      renderRepasoShell(app);
  }
  
  // Solo actualizamos la lista de resultados y los estilos de los botones
  updateRepasoList();
}

// 1. DIBUJAR LA ESTRUCTURA FIJA (Solo ocurre una vez al entrar)
function renderRepasoShell(container) {
  const styles = `
    <style>
      .repaso-header { background: var(--bg-card, white); padding: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; position: sticky; top: 0; z-index: 10; }
      
      .search-box { position: relative; margin-bottom: 15px; }
      .search-input { width: 100%; padding: 12px 15px 12px 40px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; transition: border 0.2s; background: var(--bg-input, white); color: var(--text-main, black); }
      .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
      
      .filter-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
      .tab-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: var(--bg-card, white); color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all 0.2s; }
      .tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
      .tab-btn.active-fav { background: #be123c; color: white; border-color: #be123c; }
      .tab-btn.active-note { background: #d97706; color: white; border-color: #d97706; }

      .repaso-item { background: var(--bg-card, white); border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: transform 0.1s; }
      .repaso-item:hover { transform: translateY(-1px); border-color: #94a3b8; }
      
      .ri-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #94a3b8; }
      .ri-tags { display: flex; gap: 6px; }
      .tag-fav { color: #e11d48; font-weight: bold; background: #fff1f2; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
      .tag-note { color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div id="repaso-root" class="fade" style="max-width: 800px; margin: auto; padding:0; background:var(--bg-app, #f8fafc); min-height:100vh;">
       
       <div class="repaso-header">
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
               <h2 style="margin:0; font-size:22px; color:var(--text-main, #1e293b);">📚 Mi Repaso</h2>
               <button class="btn-small" onclick="renderHome()" style="background:var(--bg-card, white); border:1px solid #e2e8f0; color:#475569;">
                  🏠 Inicio
               </button>
           </div>
           
           <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" 
                      id="repaso-input-el"
                      class="search-input" 
                      placeholder="Buscar en preguntas, notas, temas..." 
                      value="${REPASO_SEARCH}" 
                      oninput="onRepasoSearch(this.value)"
                      autocomplete="off">
           </div>

           <div class="filter-tabs">
               <button id="tab-all" class="tab-btn" onclick="setRepasoFilter('all')">Todo</button>
               <button id="tab-fav" class="tab-btn" onclick="setRepasoFilter('fav')">♥ Favoritas</button>
               <button id="tab-notes" class="tab-btn" onclick="setRepasoFilter('notes')">📝 Con Notas</button>
           </div>
       </div>

       <div id="repaso-results-container" style="padding: 0 15px 40px 15px;"></div>

    </div>
  `;
}

// 2. ACTUALIZAR LISTA (Lógica dinámica)
function updateRepasoList() {
  const container = document.getElementById("repaso-results-container");
  if (!container) return; // Seguridad

  // Actualizar clases de los botones (Visual)
  document.getElementById('tab-all').className = `tab-btn ${REPASO_FILTER==='all'?'active':''}`;
  document.getElementById('tab-fav').className = `tab-btn ${REPASO_FILTER==='fav'?'active-fav':''}`;
  document.getElementById('tab-notes').className = `tab-btn ${REPASO_FILTER==='notes'?'active-note':''}`;

  // Obtener Datos
  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  
  // FILTRADO INTELIGENTE
  let list = BANK.questions.filter(q => {
      // A. Filtro por Texto (Buscador Global)
      if (REPASO_SEARCH) {
          const term = REPASO_SEARCH.toLowerCase();
          const enun = (q.enunciado || "").toLowerCase();
          const expl = (q.explicacion || "").toLowerCase();
          const userNote = (notes[q.id] ? notes[q.id].text : "").toLowerCase();
          const mat = (Array.isArray(q.materia) ? q.materia.join(" ") : q.materia).toLowerCase();
          
          // Busca en: Enunciado, Explicación, Nota, Materia
          if (!enun.includes(term) && !expl.includes(term) && !userNote.includes(term) && !mat.includes(term)) {
              return false;
          }
      }

      // B. Filtro por Pestañas
      if (REPASO_FILTER === 'fav') return favorites.includes(q.id);
      if (REPASO_FILTER === 'notes') return !!notes[q.id];
      
      // C. Filtro 'All'
      if (REPASO_FILTER === 'all') {
          // Si el usuario escribe algo, busca en TODO el banco (aunque no sea fav)
          if (REPASO_SEARCH && REPASO_SEARCH.length > 1) return true; 
          // Si NO escribe, solo mostramos lo guardado para no colapsar la app con 5000 items
          return favorites.includes(q.id) || !!notes[q.id];
      }
      
      return false;
  });

  const totalResults = list.length;
  const displayList = list.slice(0, 50); // Limitamos visualización

  if (displayList.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
            <div style="font-size:48px; margin-bottom:15px; opacity:0.5;">🔍</div>
            <p style="font-weight:600;">No se encontraron resultados.</p>
            <p style="font-size:13px;">${REPASO_SEARCH ? 'Probá con otra palabra.' : 'Guardá preguntas o escribí para buscar en todo el banco.'}</p>
        </div>`;
      return;
  }

  // Generar HTML
  const listHTML = displayList.map(q => {
      const isFav = favorites.includes(q.id);
      const hasNote = !!notes[q.id];
      const matName = getMateriaNombre(Array.isArray(q.materia) ? q.materia[0] : q.materia);

      let notePreview = "";
      if (hasNote) {
          notePreview = `<div style="margin-top:8px; font-size:12px; color:#b45309; background:#fffbeb; padding:8px; border-radius:6px; border-left:3px solid #f59e0b;">📝 ${notes[q.id].text.substring(0, 80)}${notes[q.id].text.length>80?'...':''}</div>`;
      }

      return `
        <div class="repaso-item" onclick="abrirModoLectura('${q.id}')">
            <div class="ri-header">
                <span style="font-weight:600; color:#64748b;">${matName}</span>
                <div class="ri-tags">
                    ${isFav ? '<span class="tag-fav">♥ Favorita</span>' : ''}
                    ${hasNote ? '<span class="tag-note">NOTA</span>' : ''}
                </div>
            </div>
            <div style="font-size:14px; color:var(--text-main, #334155); line-height:1.5;">
                ${highlightSearchTerm(q.enunciado.substring(0, 140) + "...", REPASO_SEARCH)}
            </div>
            ${notePreview}
        </div>
      `;
  }).join("");

  container.innerHTML = `
    <div style="margin-bottom:10px; font-size:12px; color:#64748b; text-align:right;">
        ${totalResults > 50 ? `Mostrando 50 de ${totalResults} resultados` : `${totalResults} resultados`}
    </div>
    ${listHTML}
  `;
}

/* ==========================================================
   🔧 FUNCIONES AUXILIARES
   ========================================================== */

function onRepasoSearch(val) {
    REPASO_SEARCH = val;
    // IMPORTANTE: Llamamos a updateRepasoList, NO a renderRepasoMain
    updateRepasoList(); 
}

function setRepasoFilter(mode) {
    REPASO_FILTER = mode;
    updateRepasoList(); // Solo actualizamos la lista
}

function abrirModoLectura(qid) {
    const q = BANK.questions.find(x => x.id === qid);
    if(q) {
        iniciarResolucion({
            modo: 'revision',
            preguntas: [q],
            usarTimer: false,
            titulo: 'Lectura Rápida',
            correccionFinal: false
        });
    }
}

function getMateriaNombre(slug) {
    if (typeof BANK !== 'undefined' && BANK.subjects) {
      const mat = BANK.subjects.find(s => s.slug === slug);
      return mat ? mat.name : slug;
    }
    return slug;
}

function highlightSearchTerm(text, term) {
    if (!term || term.trim() === "") return text;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, "gi");
    return text.replace(regex, '<mark style="background:#fef08a; color:#854d0e; padding:0 2px; border-radius:2px;">$1</mark>');
}

window.renderNotasMain = renderRepasoMain;
