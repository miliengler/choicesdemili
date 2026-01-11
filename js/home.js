/* ==========================================================
   🏠 MEbank 3.0 – Home & Mi Repaso (Buscador Global)
   ========================================================== */

// --- Variables de Estado para el Repaso ---
let REPASO_FILTER = 'all'; // 'all', 'fav', 'notes'
let REPASO_SEARCH = '';

function renderHome() {
  const app = document.getElementById("app");
  
  // Resumen rápido para el dashboard
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const countNotes = Object.keys(savedNotes).length;
  const countFavs = favorites.length;

  app.innerHTML = `
    <div class="fade">
      <div style="text-align:center; margin-bottom: 30px; padding-top: 20px;">
        <h1 style="margin:0; font-size: 28px; color: #1e293b;">MEbank 3.0</h1>
        <p style="color: #64748b; margin-top: 5px;">Tu banco de preguntas inteligente</p>
      </div>

      <div class="menu-grid" style="display: grid; gap: 15px; max-width: 600px; margin: auto;">
        
        <div class="card menu-card" onclick="renderChoice()" style="cursor:pointer; transition:transform 0.2s;">
           <div style="display:flex; align-items:center; gap: 15px;">
              <div style="background:#eff6ff; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">💊</div>
              <div>
                 <h3 style="margin:0; font-size:18px; color:#1e293b;">Práctica por Materias</h3>
                 <p style="margin:0; font-size:13px; color:#64748b;">Entrená temas específicos</p>
              </div>
           </div>
        </div>

        <div class="card menu-card" onclick="renderSimulacroSetup()" style="cursor:pointer; transition:transform 0.2s;">
           <div style="display:flex; align-items:center; gap: 15px;">
              <div style="background:#f0fdf4; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">⏱</div>
              <div>
                 <h3 style="margin:0; font-size:18px; color:#1e293b;">Simulacro Personalizado</h3>
                 <p style="margin:0; font-size:13px; color:#64748b;">Creá tu propia prueba</p>
              </div>
           </div>
        </div>

        <div class="card menu-card" onclick="renderExamenesMain()" style="cursor:pointer; transition:transform 0.2s;">
           <div style="display:flex; align-items:center; gap: 15px;">
              <div style="background:#fff7ed; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">📜</div>
              <div>
                 <h3 style="margin:0; font-size:18px; color:#1e293b;">Exámenes Oficiales</h3>
                 <p style="margin:0; font-size:13px; color:#64748b;">Resolvé exámenes reales</p>
              </div>
           </div>
        </div>

        <div class="card menu-card" onclick="renderStats()" style="cursor:pointer; transition:transform 0.2s;">
           <div style="display:flex; align-items:center; gap: 15px;">
              <div style="background:#f5f3ff; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">📊</div>
              <div>
                 <h3 style="margin:0; font-size:18px; color:#1e293b;">Estadísticas</h3>
                 <p style="margin:0; font-size:13px; color:#64748b;">Seguí tu progreso</p>
              </div>
           </div>
        </div>

        <div class="card menu-card" onclick="renderRepasoMain()" style="cursor:pointer; transition:transform 0.2s;">
           <div style="display:flex; align-items:center; gap: 15px;">
              <div style="background:#fff1f2; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">📚</div>
              <div>
                 <h3 style="margin:0; font-size:18px; color:#1e293b;">Mi Repaso</h3>
                 <p style="margin:0; font-size:13px; color:#64748b;">
                    <span style="font-weight:700; color:#e11d48;">${countFavs}</span> Favoritas • 
                    <span style="font-weight:700; color:#d97706;">${countNotes}</span> Notas
                 </p>
              </div>
           </div>
        </div>

      </div>
      
      <div style="text-align:center; margin-top:30px; font-size:12px; color:#cbd5e1;">
         v3.0 - MEbank
      </div>
    </div>
  `;
}

/* ==========================================================
   📚 LÓGICA DE "MI REPASO" (Buscador + Favoritos)
   ========================================================== */
function renderRepasoMain() {
  const app = document.getElementById("app");
  
  // 1. Obtener Datos
  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  
  // 2. Filtrado Inteligente
  let list = [];
  
  // Si no hay búsqueda ni filtro activo, por defecto mostramos TODO lo guardado (Fav + Notas)
  // para no mostrar las 5000 preguntas del banco de una.
  const showSavedOnly = (REPASO_FILTER === 'all' && REPASO_SEARCH.trim() === '');

  list = BANK.questions.filter(q => {
      // A. Filtro por Texto (Buscador Global)
      if (REPASO_SEARCH) {
          const term = REPASO_SEARCH.toLowerCase();
          const enun = (q.enunciado || "").toLowerCase();
          const expl = (q.explicacion || "").toLowerCase();
          const userNote = (notes[q.id] ? notes[q.id].text : "").toLowerCase();
          
          // Debe coincidir con algo
          if (!enun.includes(term) && !expl.includes(term) && !userNote.includes(term)) {
              return false;
          }
      }

      // B. Filtro por Pestañas
      if (REPASO_FILTER === 'fav') return favorites.includes(q.id);
      if (REPASO_FILTER === 'notes') return !!notes[q.id];
      
      // C. Filtro 'All' (Default)
      if (REPASO_FILTER === 'all') {
          if (REPASO_SEARCH) return true; // Si busca, busca en todo el banco
          return favorites.includes(q.id) || !!notes[q.id]; // Si no busca, muestra solo guardados
      }
      
      return false;
  });

  const totalResults = list.length;
  // Paginación visual (Max 50) para no colgar el DOM
  const displayList = list.slice(0, 50);

  // 3. Estilos Locales
  const styles = `
    <style>
      .repaso-header { background: white; padding: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; position: sticky; top: 0; z-index: 10; }
      
      .search-box { position: relative; margin-bottom: 15px; }
      .search-input { width: 100%; padding: 12px 15px 12px 40px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; transition: border 0.2s; }
      .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
      
      .filter-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
      .tab-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all 0.2s; }
      .tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
      .tab-btn.active-fav { background: #be123c; color: white; border-color: #be123c; }
      .tab-btn.active-note { background: #d97706; color: white; border-color: #d97706; }

      .repaso-item { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: transform 0.1s; }
      .repaso-item:hover { transform: translateY(-1px); border-color: #94a3b8; }
      .ri-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #94a3b8; }
      .ri-tags { display: flex; gap: 6px; }
      .tag-fav { color: #e11d48; font-weight: bold; background: #fff1f2; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
      .tag-note { color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    </style>
  `;

  // 4. Generar HTML de Lista
  const listHTML = displayList.map(q => {
      const isFav = favorites.includes(q.id);
      const hasNote = !!notes[q.id];
      const matName = getMateriaNombre(Array.isArray(q.materia) ? q.materia[0] : q.materia);

      // Previsualización de la nota (si existe)
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
            <div style="font-size:14px; color:#334155; line-height:1.5;">
                ${highlightSearchTerm(q.enunciado.substring(0, 140) + "...", REPASO_SEARCH)}
            </div>
            ${notePreview}
        </div>
      `;
  }).join("");

  const emptyState = `
    <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
        <div style="font-size:48px; margin-bottom:15px; opacity:0.5;">🔍</div>
        <p style="font-weight:600;">No se encontraron resultados.</p>
        <p style="font-size:13px;">Intentá buscar otra palabra clave o agregá preguntas a tus favoritos.</p>
    </div>
  `;

  app.innerHTML = `
    ${styles}
    <div class="fade" style="max-width: 800px; margin: auto; padding:0; background:#f8fafc; min-height:100vh;">
       
       <div class="repaso-header">
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
               <h2 style="margin:0; font-size:22px; color:#1e293b;">📚 Mi Repaso</h2>
               <button class="btn-small" onclick="renderHome()" style="background:white; border:1px solid #e2e8f0; color:#475569;">
                  🏠 Inicio
               </button>
           </div>
           
           <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" class="search-input" placeholder="Buscar en preguntas, notas, temas..." 
                      value="${REPASO_SEARCH}" oninput="onRepasoSearch(this.value)">
           </div>

           <div class="filter-tabs">
               <button class="tab-btn ${REPASO_FILTER==='all'?'active':''}" onclick="setRepasoFilter('all')">Todo</button>
               <button class="tab-btn ${REPASO_FILTER==='fav'?'active-fav':''}" onclick="setRepasoFilter('fav')">♥ Favoritas</button>
               <button class="tab-btn ${REPASO_FILTER==='notes'?'active-note':''}" onclick="setRepasoFilter('notes')">📝 Con Notas</button>
           </div>
       </div>

       <div style="padding: 0 15px 40px 15px;">
           <div style="margin-bottom:10px; font-size:12px; color:#64748b; text-align:right;">
               ${totalResults > 50 ? `Mostrando 50 de ${totalResults} resultados` : `${totalResults} resultados`}
           </div>
           ${displayList.length > 0 ? listHTML : emptyState}
       </div>

    </div>
  `;
}

/* --- HELPERS --- */

function onRepasoSearch(val) {
    REPASO_SEARCH = val;
    renderRepasoMain(); 
}

function setRepasoFilter(mode) {
    REPASO_FILTER = mode;
    renderRepasoMain();
}

function abrirModoLectura(qid) {
    // Busca la pregunta completa
    const q = BANK.questions.find(x => x.id === qid);
    if(q) {
        // Usamos el resolver en modo "Revisión"
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
    const regex = new RegExp(`(${term})`, "gi");
    return text.replace(regex, '<mark style="background:#fef08a; color:#854d0e; padding:0 2px; border-radius:2px;">$1</mark>');
}

// Mantener compatibilidad si algún botón llama a renderNotasMain
window.renderNotasMain = renderRepasoMain; 
/* ==========================================================
   🚀 INICIALIZACIÓN (AGREGAR AL FINAL DE home.js)
   ========================================================== */

function initApp() {
    console.log("Iniciando MEbank 3.0...");
    renderHome();
}

// Aseguramos que sea global
window.initApp = initApp;
