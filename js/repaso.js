/* ==========================================================
   📚 MEbank 3.0 – Módulo de Repaso (Versión Mejorada)
   ========================================================== */

let REPASO_FILTER = 'all'; // 'all', 'fav', 'notes'
let REPASO_MATERIA = 'all'; // Nueva variable para el filtro de materias
let REPASO_SEARCH = '';

// Función Principal
function renderRepasoMain() {
  const app = document.getElementById("app");
  
  // Si no existe el "esqueleto", lo creamos. Si ya existe, solo actualizamos datos.
  if (!document.getElementById("repaso-root")) {
      renderRepasoShell(app);
  }
  
  updateRepasoList();
}

// 1. DIBUJAR LA ESTRUCTURA FIJA
function renderRepasoShell(container) {
  // Generamos las opciones del Select de Materias desde BANK.subjects
  let materiasOptions = `<option value="all">📚 Todas las materias</option>`;
  if (typeof BANK !== 'undefined' && BANK.subjects) {
      // Ordenamos alfabéticamente para facilitar la búsqueda
      const sortedSubjects = [...BANK.subjects].sort((a,b) => a.name.localeCompare(b.name));
      materiasOptions += sortedSubjects.map(m => 
          `<option value="${m.slug}">${m.name}</option>`
      ).join("");
  }

  const styles = `
    <style>
      .repaso-header { background: var(--bg-card, white); padding: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      
      .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
      
      .btn-help { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-weight: bold; border: none; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .btn-help:hover { background: #cbd5e1; color: #1e293b; }

      .btn-back-nav { background: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 14px; transition: 0.2s; }
      .btn-back-nav:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }

      .search-box { position: relative; margin-bottom: 10px; }
      .search-input { width: 100%; padding: 12px 15px 12px 40px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; transition: border 0.2s; background: var(--bg-input, white); color: var(--text-main, black); }
      .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
      
      /* Select de Materias */
      .materia-select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #334155; font-size: 14px; margin-bottom: 15px; cursor: pointer; outline: none; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right .7em top 50%; background-size: .65em auto; }
      .materia-select:focus { border-color: #3b82f6; }

      .filter-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
      .tab-btn { padding: 8px 14px; border-radius: 20px; border: 1px solid #e2e8f0; background: var(--bg-card, white); color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
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
           <div class="header-top">
               <div style="display:flex; align-items:center; gap:8px;">
                   <h2 style="margin:0; font-size:20px; color:var(--text-main, #1e293b);">📚 Mi Repaso</h2>
                   <button class="btn-help" onclick="alert('💡 En esta pantalla puedes buscar cualquier pregunta del banco.\n\n🔎 Usa el buscador para filtrar por texto.\n📂 Filtra por materia con el desplegable.\n❤ Revisa tus favoritos y notas guardadas.')">?</button>
               </div>
               <button class="btn-back-nav" onclick="renderHome()">⬅ Volver</button>
           </div>
           
           <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" 
                      id="repaso-input-el"
                      class="search-input" 
                      placeholder="Buscar en preguntas, notas, temas, explicaciones..." 
                      value="${REPASO_SEARCH}" 
                      oninput="onRepasoSearch(this.value)"
                      autocomplete="off">
           </div>

           <select class="materia-select" onchange="setRepasoMateria(this.value)">
               ${materiasOptions}
           </select>

           <div class="filter-tabs">
               <button id="tab-all" class="tab-btn" onclick="setRepasoFilter('all')">Todo</button>
               <button id="tab-fav" class="tab-btn" onclick="setRepasoFilter('fav')">♥ Mis Favoritas</button>
               <button id="tab-notes" class="tab-btn" onclick="setRepasoFilter('notes')">📝 Mis Notas</button>
           </div>
       </div>

       <div id="repaso-results-container" style="padding: 0 15px 40px 15px;"></div>

    </div>
  `;
}

// 2. ACTUALIZAR LISTA (Lógica de filtrado combinada)
function updateRepasoList() {
  const container = document.getElementById("repaso-results-container");
  if (!container) return;

  // Actualizar estilos de pestañas
  document.getElementById('tab-all').className = `tab-btn ${REPASO_FILTER==='all'?'active':''}`;
  document.getElementById('tab-fav').className = `tab-btn ${REPASO_FILTER==='fav'?'active-fav':''}`;
  document.getElementById('tab-notes').className = `tab-btn ${REPASO_FILTER==='notes'?'active-note':''}`;

  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  
  // FILTRADO
  let list = BANK.questions.filter(q => {
      // 1. Filtro de Materia (Dropdown)
      if (REPASO_MATERIA !== 'all') {
          // Normalizamos porque a veces materia es Array y a veces String
          const qMateriaArr = Array.isArray(q.materia) ? q.materia : [q.materia];
          if (!qMateriaArr.includes(REPASO_MATERIA)) return false;
      }

      // 2. Filtro de Texto (Buscador)
      if (REPASO_SEARCH) {
          const term = REPASO_SEARCH.toLowerCase();
          const enun = (q.enunciado || "").toLowerCase();
          const expl = (q.explicacion || "").toLowerCase();
          const userNote = (notes[q.id] ? notes[q.id].text : "").toLowerCase();
          // Añadimos submateria (tema) a la búsqueda
          const submat = Array.isArray(q.submateria) ? q.submateria.join(" ") : (q.submateria || "");
          
          if (!enun.includes(term) && !expl.includes(term) && !userNote.includes(term) && !submat.toLowerCase().includes(term)) {
              return false;
          }
      }

      // 3. Filtro de Pestañas (Tabs)
      if (REPASO_FILTER === 'fav') return favorites.includes(q.id);
      if (REPASO_FILTER === 'notes') return !!notes[q.id];
      
      // Default 'All': Si no hay búsqueda ni filtro de materia, limitamos para no colgar.
      // Pero si seleccionó una materia específica, mostramos todas las de esa materia.
      if (REPASO_FILTER === 'all') {
         if (REPASO_SEARCH.length > 1 || REPASO_MATERIA !== 'all') return true;
         // Si está en "Todo" limpio, mostramos solo guardadas por default
         return favorites.includes(q.id) || !!notes[q.id];
      }
      
      return false;
  });

  const totalResults = list.length;
  const displayList = list.slice(0, 50);

  if (displayList.length === 0) {
      // Mensaje personalizado según el contexto
      let msg = "No se encontraron resultados.";
      if (REPASO_FILTER === 'all' && REPASO_MATERIA === 'all' && !REPASO_SEARCH) {
          msg = "Tu biblioteca muestra por defecto tus preguntas guardadas.<br>Usa el buscador o selecciona una materia para ver más.";
      }
      
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
            <div style="font-size:48px; margin-bottom:15px; opacity:0.5;">🔍</div>
            <p style="font-weight:600;">${msg}</p>
        </div>`;
      return;
  }

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
                ${highlightSearchTerm(q.enunciado.substring(0, 150) + "...", REPASO_SEARCH)}
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
    updateRepasoList(); 
}

function setRepasoFilter(mode) {
    REPASO_FILTER = mode;
    updateRepasoList();
}

// Nueva función para el dropdown de materias
function setRepasoMateria(slug) {
    REPASO_MATERIA = slug;
    updateRepasoList();
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
