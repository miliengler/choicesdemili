/* ==========================================================
   📔 MEbank 3.0 – Sistema de Notas (Fix Multi-Materia)
   ========================================================== */
const STORAGE_KEY_NOTES = "mebank_notes";

/* ----------------------------------------------------------
   🏠 Pantalla Principal: "Mis Notas" (Agrupadas por Materia)
   ---------------------------------------------------------- */
function renderNotasMain() {
  const app = document.getElementById("app");
  const NOTES = getNotes();
  const noteIds = Object.keys(NOTES);

  if (!noteIds.length) {
    app.innerHTML = `
      <div class="card fade" style="text-align:center; max-width:500px; margin:auto; padding:40px;">
        <div style="font-size:40px; margin-bottom:10px;">📝</div>
        <h3>Mis Notas</h3>
        <p style="color:#64748b; margin-bottom:20px;">
            Todavía no agregaste notas a ninguna pregunta.
        </p>
        <button class="btn-main" onclick="renderHome()">⬅ Volver al inicio</button>
      </div>`;
    return;
  }

  // 1. AGRUPAR NOTAS (La lógica clave)
  // Creamos un diccionario donde la clave es la materia y el valor es una lista de notas
  const grupos = {};

  noteIds.forEach(id => {
      const notaData = NOTES[id];
      // Buscamos la pregunta en el banco
      const q = (typeof BANK !== 'undefined' && BANK.questions) 
                ? BANK.questions.find(x => x.id === id) 
                : null;
      
      if (!q) return; // Si la pregunta no existe (raro), la saltamos

      // Normalizamos: siempre tratamos las materias como un Array
      // Si q.materia es "pediatria" -> ["pediatria"]
      // Si q.materia es ["pediatria", "infectologia"] -> se queda igual
      const materias = Array.isArray(q.materia) ? q.materia : [q.materia];

      // Ahora recorremos CADA materia de esa pregunta
      materias.forEach(slug => {
          if (!grupos[slug]) grupos[slug] = [];
          
          // Agregamos la nota a este grupo. 
          // (Si la pregunta tiene 2 materias, este código se ejecuta 2 veces)
          grupos[slug].push({
              id: id,
              pregunta: q,
              textoNota: notaData.text,
              fecha: notaData.date
          });
      });
  });

  // 2. ORDENAR LOS TÍTULOS DE MATERIAS (Alfabéticamente)
  const slugsOrdenados = Object.keys(grupos).sort((a, b) => {
      const nameA = getMateriaName(a);
      const nameB = getMateriaName(b);
      return nameA.localeCompare(nameB);
  });

  // 3. GENERAR EL HTML
  let htmlContenido = "";

  slugsOrdenados.forEach(slug => {
      const notasDelGrupo = grupos[slug];
      const nombreMateria = getMateriaName(slug);
      
      // Ordenamos las notas dentro del grupo por fecha (nuevas arriba)
      notasDelGrupo.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

      // Generamos las tarjetas para este grupo
      const cardsHtml = notasDelGrupo.map(item => {
          const fechaStr = new Date(item.fecha).toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' });
          
          return `
            <div class="nota-card" onclick="irAPreguntaDesdeNota('${item.id}')">
               <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                   <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">ID: ${item.id}</span>
                   <span style="font-size:11px; color:#cbd5e1;">${fechaStr}</span>
               </div>
               
               <div style="font-weight:600; color:#1e293b; margin-bottom:10px; font-size:14px; line-height:1.4;">
                  ${recortarTexto(item.pregunta.enunciado, 80)}
               </div>
               
               <div style="background:#fefce8; border-left:3px solid #facc15; padding:8px 10px; font-size:13px; color:#854d0e; font-style:italic; border-radius:4px;">
                  "${recortarTexto(item.textoNota, 120)}"
               </div>

               <div style="margin-top:10px; text-align:right;">
                  <button class="btn-small btn-ghost" style="padding:4px 8px; font-size:11px; color:#ef4444;" 
                          onclick="event.stopPropagation(); deleteNoteGlobal('${item.id}')">
                      🗑️ Borrar
                  </button>
               </div>
            </div>
          `;
      }).join("");

      // Agregamos el bloque de la materia
      htmlContenido += `
        <div style="margin-bottom:30px;">
           <h3 style="color:#1e3a8a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:15px; display:flex; align-items:center; gap:10px; font-size:18px;">
              ${nombreMateria} 
              <span style="background:#e0f2fe; color:#0284c7; font-size:12px; padding:2px 8px; border-radius:12px; font-weight:700;">${notasDelGrupo.length}</span>
           </h3>
           <div class="notas-grid">
              ${cardsHtml}
           </div>
        </div>
      `;
  });

  // 4. ESTILOS INYECTADOS (Grid para las tarjetas)
  const styles = `
    <style>
      .notas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 15px;
      }
      .nota-card {
        background: white; 
        border: 1px solid #e2e8f0; 
        border-radius: 10px; 
        padding: 15px;
        cursor: pointer; 
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .nota-card:hover {
        transform: translateY(-2px); 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
        border-color: #cbd5e1;
      }
      .btn-ghost:hover { background: #fef2f2; }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div class="card fade" style="max-width:1000px; margin:20px auto; padding:30px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
         <div style="display:flex; align-items:center; gap:10px;">
            <h2 style="margin:0; font-size:24px; color:#0f172a;">📔 Mis Notas</h2>
         </div>
         <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      ${htmlContenido}
    </div>
  `;
}

/* ----------------------------------------------------------
   ⚙ Lógica de Guardado (Sin cambios funcionales)
   ---------------------------------------------------------- */
window.toggleNoteArea = (qid) => {
    const area = document.getElementById(`note-area-${qid}`);
    if(area) {
        area.style.display = area.style.display === "none" ? "block" : "none";
    }
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
    
    // Si estamos en la pantalla de resolución, renderizamos de nuevo para actualizar íconos
    if(typeof renderPregunta === 'function') renderPregunta();
};

window.deleteNoteGlobal = (id) => {
    if(!confirm("¿Seguro que querés borrar esta nota?")) return;
    const NOTES = getNotes();
    delete NOTES[id];
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(NOTES));
    renderNotasMain(); // Recargamos para ver los cambios
};

/* ----------------------------------------------------------
   🔧 Helpers
   ---------------------------------------------------------- */
function getNotes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES) || "{}");
}

function getMateriaName(slug) {
    if(typeof BANK !== 'undefined' && BANK.subjects) {
        // Intenta buscar en el banco
        const m = BANK.subjects.find(s => s.slug === slug);
        if(m) return m.name;
    }
    // Si no encuentra, o es un slug raro, lo devuelve capitalizado
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
