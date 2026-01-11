/* ==========================================================
   🏠 MEbank 3.0 – Pantalla Home y Arranque (Con Dark Mode)
   ========================================================== */

// 🌙 1. LÓGICA DE MODO OSCURO (Se ejecuta al cargar)
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar preferencia guardada
    const isDark = localStorage.getItem("mebank_darkmode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
    }
});

// Función global para el botón
window.toggleDarkMode = function() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("mebank_darkmode", isDark);
    
    const btn = document.getElementById("btn-dark-mode");
    if(btn) btn.textContent = isDark ? "☀️" : "🌙";
};

// ✅ ESTA FUNCIÓN ARRANCA LA APP
async function initApp() {
  const app = document.getElementById("app");
  
  app.innerHTML = `
    <div style="text-align:center;margin-top:100px;">
      <div style="font-size:40px;margin-bottom:20px;">🚀</div>
      <p style="color:#64748b;">Iniciando MEbank...</p>
    </div>
  `;

  if (typeof loadAllBanks === 'function') {
      await loadAllBanks();
  } else {
      alert("Error crítico: No se encuentra el módulo Bank.js");
  }
}

// ✅ RENDERIZA EL MENÚ PRINCIPAL
function renderHome() {
  const app = document.getElementById("app");

  const cargado = (typeof BANK !== 'undefined' && BANK.loaded);
  const preguntas = cargado ? BANK.questions.length : 0;
  const daily = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
  const hoy = new Date().toISOString().split('T')[0];
  const hechasHoy = daily[hoy] || 0;

  // Contadores para "Mi Repaso"
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const countNotes = Object.keys(savedNotes).length;
  const countFavs = favorites.length;

  const isDark = document.body.classList.contains("dark-mode");
  const icon = isDark ? "☀️" : "🌙";

  app.innerHTML = `
    <div class="card fade" style="max-width:520px; margin:auto; text-align:center; position:relative;">
      
      <button id="btn-dark-mode" onclick="toggleDarkMode()" 
              style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; z-index:10; padding:0;">
          ${icon}
      </button>

      <h1 style="margin-bottom:6px;">MEbank</h1>
      <p style="color:#64748b; margin-bottom:25px;">
        Banco de Preguntas para Residencias
      </p>

      ${hechasHoy > 0 
        ? `<div class="daily-banner" style="margin-bottom:20px; padding:8px; background:#f0fdf4; color:#166534; border-radius:8px; font-size:14px;">
             🔥 Hoy respondiste <b>${hechasHoy}</b> preguntas correctamente.
           </div>`
        : ''
      }

      <div class="menu-buttons">
        <button class="btn-main menu-btn" onclick="goChoice()">📚 Práctica por materia</button>
        <button class="btn-main menu-btn" onclick="goExamenes()">📝 Exámenes anteriores</button>
        <button class="btn-main menu-btn" onclick="goCrearExamen()">🎯 Simulacro de examen</button>
        <button class="btn-main menu-btn" onclick="goStats()">📊 Estadísticas</button>
        
        <button class="btn-main menu-btn" onclick="goNotas()">
            📚 Mi Repaso 
            <span style="font-size:11px; opacity:0.8; display:block; font-weight:400;">${countFavs} Favs • ${countNotes} Notas</span>
        </button>
      </div>

      <div style="margin-top:25px; font-size:13px; color:#94a3b8;">
        ${cargado ? `✔ Sistema listo (${preguntas} preguntas)` : `⚠ Error de carga`}
      </div>

      <div style="margin-top:10px;">
        <button class="btn-small btn-ghost" onclick="recargarBancoDesdeHome()">
          🔄 Recargar todo
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🔀 Navegación
   ========================================================== */
function checkLoaded() {
  if (!BANK.loaded) {
    alert("Esperá a que carguen las preguntas...");
    return false;
  }
  return true;
}

function goChoice() { if(checkLoaded()) renderChoice(); }
function goExamenes() { if(checkLoaded()) renderExamenesMain(); }
function goCrearExamen() { if(checkLoaded()) renderCrearExamen(); }
function goStats() { if(checkLoaded()) renderStats(); }

// Redirige a la nueva pantalla de repaso
function goNotas() { if(checkLoaded()) renderRepasoMain(); }

async function recargarBancoDesdeHome() {
  if(!confirm("¿Recargar base de datos?")) return;
  document.getElementById("app").innerHTML = "<div style='text-align:center;margin-top:50px;'>Recargando...</div>";
  await loadAllBanks();
}

/* ==========================================================
   📚 MI REPASO (Buscador Global + Favoritos + Notas)
   ========================================================== */

let REPASO_FILTER = 'all'; // 'all', 'fav', 'notes'
let REPASO_SEARCH = '';

function renderRepasoMain() {
  const app = document.getElementById("app");
  
  const favorites = JSON.parse(localStorage.getItem("mebank_favorites") || "[]");
  const notes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  
  // Filtro Inteligente
  let list = BANK.questions.filter(q => {
      // Filtro Texto
      if (REPASO_SEARCH) {
          const term = REPASO_SEARCH.toLowerCase();
          const enun = (q.enunciado || "").toLowerCase();
          const expl = (q.explicacion || "").toLowerCase();
          const userNote = (notes[q.id] ? notes[q.id].text : "").toLowerCase();
          
          if (!enun.includes(term) && !expl.includes(term) && !userNote.includes(term)) {
              return false;
          }
      }

      // Filtro Pestañas
      if (REPASO_FILTER === 'fav') return favorites.includes(q.id);
      if (REPASO_FILTER === 'notes') return !!notes[q.id];
      if (REPASO_FILTER === 'all') {
          if (REPASO_SEARCH) return true; 
          return favorites.includes(q.id) || !!notes[q.id];
      }
      return false;
  });

  const totalResults = list.length;
  const displayList = list.slice(0, 50);

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

function onRepasoSearch(val) { REPASO_SEARCH = val; renderRepasoMain(); }
function setRepasoFilter(mode) { REPASO_FILTER = mode; renderRepasoMain(); }

function abrirModoLectura(qid) {
    const q = BANK.questions.find(x => x.id === qid);
    if(q) {
        iniciarResolucion({ modo: 'revision', preguntas: [q], usarTimer: false, titulo: 'Lectura Rápida', correccionFinal: false });
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

// Mantener compatibilidad
window.renderNotasMain = renderRepasoMain;
