/* ==========================================================
   📄 EXÁMENES ANTERIORES — Lista + acceso por año
   Mismo estilo y estructura que el módulo Choice por materia
   ========================================================== */

// Estado global de orden (por año descendente)
let currentExamSort = localStorage.getItem("examSort") || "desc";

/* ---------- Render principal ---------- */
function renderExamenesLista() {
  // simulación: lista base (en el futuro puede venir de BANK)
  const examenes = [
    { slug: "examen_unico_2025", name: "Examen Único 2025", preguntas: 100 },
    { slug: "examen_unico_2024", name: "Examen Único 2024", preguntas: 100 },
    { slug: "examen_unico_2019", name: "Examen Único 2019", preguntas: 100 }
  ];

  // Ordenar por año según configuración actual
  examenes.sort((a, b) => {
    const ay = parseInt(a.name.match(/\d+/)?.[0] || "0");
    const by = parseInt(b.name.match(/\d+/)?.[0] || "0");
    return currentExamSort === "asc" ? ay - by : by - ay;
  });

  // Construir lista visual
  const list = examenes.map(ex => `
    <div class="choice-item" onclick="abrirExamen('${ex.slug}', ${ex.preguntas})">
      <div class="choice-top">
        <span class="choice-title">${ex.name}</span>
        <span style="color:#64748b;font-size:13px;">${ex.preguntas} preguntas</span>
      </div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="choice-container fade">
      <div class="choice-header-global">
        <span>📄</span>
        <h2>Exámenes anteriores</h2>

        <div class="sort-control" style="margin-left:auto;">
          <label for="sort-exam">Ordenar:</label>
          <select id="sort-exam">
            <option value="desc" ${currentExamSort === "desc" ? "selected" : ""}>Más recientes</option>
            <option value="asc" ${currentExamSort === "asc" ? "selected" : ""}>Más antiguos</option>
          </select>
        </div>
      </div>

      <p class="choice-subtitle">Seleccioná un examen para practicar o revisar.</p>
      <div id="exam-list">${list}</div>

      <div style="text-align:center;margin-top:20px;">
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>
    </div>
  `;

  // Listener del selector de orden
  const sel = document.getElementById("sort-exam");
  if (sel) {
    sel.onchange = (e) => {
      currentExamSort = e.target.value;
      localStorage.setItem("examSort", currentExamSort);
      renderExamenesLista();
    };
  }
}

/* ---------- Abrir examen ---------- */
function abrirExamen(slug, total) {
  // Cargar las preguntas del examen correspondiente
  const pool = (BANK.questions || []).filter(q => q.examen === slug);
  if (!pool.length) {
    alert("No se encontraron preguntas para este examen.");
    return;
  }

  CURRENT = {
    list: pool,
    i: 0,
    materia: slug,
    modo: "anteriores"
  };

  iniciarResolucion({
    modo: "anteriores",
    preguntas: pool,
    usarTimer: true,
    mostrarNotas: true,
    permitirRetroceso: true,
    titulo: `Resolviendo ${slug.replace(/_/g, " ").toUpperCase()}`
  });
}

/* ---------- Exponer al scope global ---------- */
window.renderExamenesLista = renderExamenesLista;
window.abrirExamen = abrirExamen;
