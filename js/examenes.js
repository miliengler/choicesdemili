/* ==========================================================
   📄 EXÁMENES ANTERIORES — Lista + acceso por año
   Mismo estilo y estructura que el módulo Choice por materia
   ========================================================== */

let currentExamSort = localStorage.getItem("examSort") || "desc";

/* ---------- Render principal ---------- */
function renderExamenesLista() {
  // lista base con conteo real desde BANK
  const base = [
    { slug: "examen_unico_2025", name: "Examen Único 2025" },
    { slug: "examen_unico_2024", name: "Examen Único 2024" },
    { slug: "examen_unico_2019", name: "Examen Único 2019" }
  ];

  const examenes = base.map(ex => ({
    ...ex,
    preguntas: (BANK.questions || []).filter(q =>
      normalizeString(q.examen || q.examen_nombre || "") === normalizeString(ex.slug)
    ).length
  }));

  // Ordenar por año
  examenes.sort((a, b) => {
    const ay = parseInt(a.name.match(/\d+/)?.[0] || "0");
    const by = parseInt(b.name.match(/\d+/)?.[0] || "0");
    return currentExamSort === "asc" ? ay - by : by - ay;
  });

  // Construir lista
  const list = examenes.map(ex => `
    <div class="choice-item" onclick="abrirExamen('${ex.slug}', ${ex.preguntas})">
      <div class="choice-top">
        <span class="choice-title">${ex.name}</span>
        <span style="color:#64748b;font-size:13px;">${ex.preguntas || 0} preguntas</span>
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
  const pool = (BANK.questions || []).filter(q =>
    normalizeString(q.examen || q.examen_nombre || "") === normalizeString(slug)
  );

  if (!pool.length) {
    alert("No se encontraron preguntas para este examen.");
    console.warn(`⚠️ No hay preguntas para ${slug}`);
    return;
  }

  iniciarResolucion({
    modo: "anteriores",
    preguntas: pool,
    usarTimer: true,
    mostrarNotas: true,
    permitirRetroceso: true,
    titulo: `📄 ${slug.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`
  });

  // Mostrar título del examen sobre el cronómetro
  setTimeout(() => {
    const timerEl = document.getElementById("exam-timer");
    if (timerEl) {
      const label = document.createElement("div");
      label.textContent = slug.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      label.style = `
        font-weight:600;
        font-size:13px;
        text-align:center;
        background:#0f172a;
        color:#fff;
        padding:4px 8px;
        border-radius:6px 6px 0 0;
        margin-bottom:2px;
      `;
      timerEl.parentNode.insertBefore(label, timerEl);
    }
  }, 400);
}

/* ---------- Exponer al scope global ---------- */
window.renderExamenesLista = renderExamenesLista;
window.abrirExamen = abrirExamen;
