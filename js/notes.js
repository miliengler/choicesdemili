/* ==========================================================
   📔 MEbank 3.0 – Sistema de Notas (Fix Teclado + Optimizado)
   ========================================================== */
const STORAGE_KEY_NOTES = "mebank_notes";

// Variables de estado
let notesSearchTerm = "";
let notesSortOrder = "newest"; 
let openGroups = {}; 

/* ----------------------------------------------------------
   🏠 Pantalla Principal
   ---------------------------------------------------------- */
function renderNotasMain() {
  const app = document.getElementById("app");
  
  // 1. DIBUJAR EL "SHELL" (Solo si no existe ya)
  // Esto evita que se borre el input y se cierre el teclado
  if (!document.getElementById("notas-shell")) {
      const styles = `
        <style>
          .controls-bar { display: flex; gap: 10px; margin-bottom: 20px; }
          .search-input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
          .sort-select { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; font-size: 14px; cursor: pointer; }

          .materia-accordion { background: white; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
          .accordion-header { padding: 15px; background: #f8fafc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; transition: background 0.2s; }
          .accordion-header:hover { background: #f1f5f9; }
          .badge-count { background: #e2e8f0; color: #64748b; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
          .accordion-icon { color: #94a3b8; font-size: 12px; transition: transform 0.3s ease; }
          .accordion-content { padding: 15px; border-top: 1px solid #f1f5f9; }

          .notas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
          .nota-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          .nota-card:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #cbd5e1; }
          .btn-trash { cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
          .btn-trash:hover { opacity: 1; transform: scale(1.1); }
        </style>
      `;

      app.innerHTML = `
        ${styles}
        <div id="notas-shell" class="card fade" style="max-width:1000px; margin:20px auto; padding:30px;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
             <div style="display:flex; align-items:center; gap:10px;">
                <h2 style="margin:0; font-size:24px; color:#0f172a;">📔 Mis Notas</h2>
                <button onclick="mostrarInfoNotas()" 
                        style="width:24px; height:24px; border-radius:50%; border:1px solid #cbd5e1; background:white; color:#64748b; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                  ?
                </button>
             </div>
             <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
          </div>

          <div class="controls-bar">
             <input type="text" id="notesSearchInput" class="search-input" 
                    placeholder="🔍 Buscar en notas o preguntas..." 
                    value="${notesSearchTerm}" 
                    oninput="onSearchInput(this.value)">
             
             <select id="notesSortSelect" class="sort-select" onchange="onSortChange(this.value)">
                 <option value="newest" ${notesSortOrder === 'newest' ? 'selected' : ''}>📅 Recientes</option>
                 <option value="oldest" ${notesSortOrder === 'oldest' ? 'selected' : ''}>📅 Antiguas</option>
                 <option value="az" ${notesSortOrder === 'az' ? 'selected' : ''}>A - Z</option>
             </select>
          </div>

          <div id="notas-list-container"></div>
        </div>
      `;
      
      // Enfocar el input si ya había texto (por si venimos de un reload raro)
      const input = document.getElementById("notesSearchInput");
      if(input && notesSearchTerm) {
          input.value = notesSearchTerm;
          input.focus();
      }
  }

  // 2. ACTUALIZAR SOLO EL CONTENIDO
  updateNotasList();
}

/* ----------------------------------------------------------
   🔄 LÓGICA DE ACTUALIZACIÓN (Solo la lista)
   ---------------------------------------------------------- */
function updateNotasList() {
    const container = document.getElementById("notas-list-container");
    if (!container) return; // Seguridad

    const NOTES = getNotes();
    const noteIds = Object.keys(NOTES);

    // Filtrado
    const allNotesData = [];
    noteIds.forEach(id => {
        const q = (typeof BANK !== 'undefined' && BANK.questions) ? BANK.questions.find(x => x.id === id) : null;
        if (!q) return;

        const nota = NOTES[id];
        const term = notesSearchTerm.toLowerCase();
        
        const matchSearch = term === "" || 
                            nota.text.toLowerCase().includes(term) || 
                            q.enunciado.toLowerCase().includes(term);

        if (matchSearch) {
            allNotesData.push({ id, q, nota });
        }
    });

    // Agrupamiento
    const grupos = {};
    allNotesData.forEach(item => {
        const materias = Array.isArray(item.q.materia) ? item.q.materia : [item.q.materia];
        materias.forEach(slug => {
            if (!grupos[slug]) grupos[slug] = [];
            grupos[slug].push(item);
        });
    });

    // Ordenamiento y Render
    let slugs = Object.keys(grupos);
    slugs.sort((a, b) => getMateriaName(a).localeCompare(getMateriaName(b)));

    slugs.forEach(slug => {
        grupos[slug].sort((a, b) => {
            if (notesSortOrder === 'newest') return new Date(b.nota.date) - new Date(a.nota.date);
            if (notesSortOrder === 'oldest') return new Date(a.nota.date) - new Date(b.nota.date);
            if (notesSortOrder === 'az') return a.q.enunciado.localeCompare(b.q.enunciado);
            return 0;
        });
    });

    if (slugs.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:40px; color:#64748b;">
             <div style="font-size:40px; margin-bottom:10px;">🔍</div>
             <p>${noteIds.length === 0 ? "No tenés notas guardadas aún." : "No se encontraron resultados."}</p>
          </div>`;
        return;
    }

    container.innerHTML = slugs.map(slug => {
        const items = grupos[slug];
        const name = getMateriaName(slug);
        
        const isOpen = notesSearchTerm !== "" || openGroups[slug]; 
        const displayStyle = isOpen ? "grid" : "none";
        const iconRotation = isOpen ? "transform: rotate(180deg);" : "";

        const cards = items.map(it => {
            const fechaStr = new Date(it.nota.date).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', year:'2-digit' });
            return `
              <div class="nota-card" onclick="irAPreguntaDesdeNota('${it.id}')">
                 <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:11px; color:#94a3b8;">
                     <span style="font-weight:700;">${fechaStr}</span>
                     <span class="btn-trash" onclick="event.stopPropagation(); deleteNoteGlobal('${it.id}')">🗑️</span>
                 </div>
                 <div style="font-weight:600; color:#1e293b; margin-bottom:8px; font-size:14px; line-height:1.4;">
                    ${recortarTexto(it.q.enunciado, 70)}
                 </div>
                 <div style="background:#fefce8; border-left:3px solid #facc15; padding:8px; font-size:13px; color:#854d0e; border-radius:4px; font-style:italic;">
                    "${recortarTexto(it.nota.text, 100)}"
                 </div>
              </div>
            `;
        }).join("");

        return `
          <div class="materia-accordion">
              <div class="accordion-header" onclick="toggleGroup('${slug}')">
                  <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-weight:700; color:#1e293b; font-size:16px;">${name}</span>
                      <span class="badge-count">${items.length}</span>
                  </div>
                  <div class="accordion-icon" style="${iconRotation}">▼</div>
              </div>
              <div id="content-${slug}" class="accordion-content notas-grid" style="display:${displayStyle};">
                  ${cards}
              </div>
          </div>
        `;
    }).join("");
}

/* ----------------------------------------------------------
   ⚡ EVENTOS Y ACCIONES
   ---------------------------------------------------------- */

function onSearchInput(val) {
    notesSearchTerm = val;
    updateNotasList(); // Solo actualizamos la lista, no el input
}

function onSortChange(val) {
    notesSortOrder = val;
    updateNotasList();
}

function toggleGroup(slug) {
    if (notesSearchTerm !== "") return;
    openGroups[slug] = !openGroups[slug];
    updateNotasList();
}

function mostrarInfoNotas() {
    alert("ℹ️ GESTOR DE NOTAS\n\nAquí se guardan tus anotaciones personales.\n\n• Tocá una tarjeta para ir a la pregunta original.\n• Usá el buscador para encontrar temas rápido.\n• Las notas están agrupadas por materia.");
}

/* ----------------------------------------------------------
   ⚙ Lógica de Guardado (Global)
   ---------------------------------------------------------- */
window.toggleNoteArea = (qid) => {
    const area = document.getElementById(`note-area-${qid}`);
    if(area) area.style.display = area.style.display === "none" ? "block" : "none";
};

window.saveNoteResolver = (qid) => {
    const txtInput = document.getElementById(`note-text-${qid}`);
    const txt = txtInput ? txtInput.value.trim() : "";
    const NOTES = getNotes();
    
    if (txt) {
        NOTES[qid] = { text: txt, date: new Date().toISOString() };
        alert("✅ Nota guardada");
    } else {
        delete NOTES[qid];
        alert("🗑 Nota eliminada");
    }
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(NOTES));
    if(typeof renderPregunta === 'function') renderPregunta();
};

window.deleteNoteGlobal = (id) => {
    if(!confirm("¿Borrar esta nota permanentemente?")) return;
    const NOTES = getNotes();
    delete NOTES[id];
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(NOTES));
    updateNotasList(); // Actualizar solo la lista
};

function getNotes() { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES) || "{}"); }

function getMateriaName(slug) {
    if(typeof BANK !== 'undefined' && BANK.subjects) {
        const m = BANK.subjects.find(s => s.slug === slug);
        if(m) return m.name;
    }
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, " ");
}

function recortarTexto(txt, len) {
    if(!txt) return "";
    return txt.length > len ? txt.substring(0, len) + "..." : txt;
}

function irAPreguntaDesdeNota(id) {
    const q = BANK.questions.find(x => x.id === id);
    if(!q) return alert("Pregunta no encontrada.");
    
    iniciarResolucion({
        modo: "revision",
        preguntas: [q],
        usarTimer: false,
        titulo: "Revisión de Nota"
    });
}
