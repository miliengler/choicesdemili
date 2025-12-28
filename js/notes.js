/* ==========================================================
   📒 MEbank 3.0 – Gestor de Notas (Fix Multi-Materia)
   ========================================================== */

function renderNotas() {
  const app = document.getElementById("app");
  const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
  const noteIds = Object.keys(savedNotes);

  if (noteIds.length === 0) {
    app.innerHTML = `
      <div class="card fade" style="max-width:600px; margin:auto; text-align:center; padding:40px;">
        <div style="font-size:40px; margin-bottom:10px;">📝</div>
        <h3>Mis Notas</h3>
        <p style="color:#64748b;">Todavía no tomaste ninguna nota.</p>
        <button class="btn-main" onclick="renderHome()">Volver al inicio</button>
      </div>
    `;
    return;
  }

  // 1. AGRUPAR NOTAS (Lógica Corregida)
  // Ahora la misma nota se agrega a VARIOS grupos si la pregunta es multi-materia.
  const grupos = {};

  noteIds.forEach(id => {
      const q = BANK.questions.find(item => item.id === id);
      if (!q) return; 

      // Convertimos siempre a array: "pediatria" -> ["pediatria"]
      // Si ya era ["pediatria", "infecto"], se mantiene igual.
      const materias = Array.isArray(q.materia) ? q.materia : [q.materia];

      materias.forEach(slug => {
          if (!grupos[slug]) grupos[slug] = [];
          
          // Agregamos la nota a este grupo
          grupos[slug].push({
              id: id,
              pregunta: q,
              nota: savedNotes[id].text,
              fecha: savedNotes[id].date
          });
      });
  });

  // 2. ORDENAR LOS TÍTULOS DE MATERIAS
  const slugsOrdenados = Object.keys(grupos).sort((a, b) => {
      const nameA = getMateriaName(a);
      const nameB = getMateriaName(b);
      return nameA.localeCompare(nameB);
  });

  // 3. GENERAR HTML
  let htmlGrupos = "";

  slugsOrdenados.forEach(slug => {
      const notasDelGrupo = grupos[slug];
      const nombreMateria = getMateriaName(slug);

      // Renderizamos las tarjetas
      const cardsHtml = notasDelGrupo.map(item => `
        <div class="nota-card" onclick="irAPreguntaDesdeNota('${item.id}')">
           <div style="font-size:12px; color:#94a3b8; margin-bottom:5px; font-weight:600; text-transform:uppercase;">
              Pregunta #${findQuestionIndex(item.id) + 1}
           </div>
           <div style="font-weight:600; color:#1e293b; margin-bottom:10px; font-size:15px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
              ${item.pregunta.enunciado}
           </div>
           <div style="background:#fefce8; border-left:3px solid #facc15; padding:10px; font-size:14px; color:#854d0e; font-style:italic; border-radius:0 4px 4px 0;">
              "${item.nota}"
           </div>
        </div>
      `).join("");

      htmlGrupos += `
        <div style="margin-bottom:40px;">
           <h3 style="color:#1e3a8a; border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
              ${nombreMateria} 
              <span style="background:#e0f2fe; color:#0284c7; font-size:0.6em; padding:2px 8px; border-radius:12px; vertical-align:middle;">${notasDelGrupo.length}</span>
           </h3>
           <div class="notas-grid">
              ${cardsHtml}
           </div>
        </div>
      `;
  });

  // Estilos CSS específicos para esta pantalla
  const styles = `
    <style>
      .notas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsive Grid */
        gap: 20px;
      }
      .nota-card {
        background: white; 
        border: 1px solid #e2e8f0; 
        border-radius: 12px; 
        padding: 20px;
        cursor: pointer; 
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        display: flex; flex-direction: column;
      }
      .nota-card:hover {
        transform: translateY(-3px); 
        box-shadow: 0 10px 25px rgba(0,0,0,0.06); 
        border-color: #cbd5e1;
      }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div class="card fade" style="max-width:1100px; margin:20px auto; padding:30px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
         <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:28px;">📒</div>
            <h2 style="margin:0; font-size:24px; color:#0f172a;">Mis Notas</h2>
         </div>
         <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      ${htmlGrupos}
    </div>
  `;
}

/* --- HELPERS --- */

function getMateriaName(slug) {
    if (typeof BANK !== 'undefined' && BANK.subjects) {
        const m = BANK.subjects.find(s => s.slug === slug);
        if (m) return m.name;
    }
    // Si no encuentra el nombre, capitaliza el slug
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

function findQuestionIndex(id) {
    return BANK.questions.findIndex(q => q.id === id);
}

function irAPreguntaDesdeNota(id) {
    // Abrimos el visualizador para esa pregunta puntual
    const q = BANK.questions.find(item => item.id === id);
    if(!q) return;

    iniciarResolucion({
        modo: "revision",
        preguntas: [q],
        usarTimer: false,
        titulo: "Revisión de Nota"
    });
}
