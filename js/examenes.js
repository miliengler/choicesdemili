/* ==========================================================
   📄 MEbank – Exámenes anteriores (v2, estética Choice)
   ========================================================== */

function renderExamenes() {
  const app = document.getElementById("app");

  // 🗂 Extraer lista de exámenes disponibles del banco transversal
  const examenes = colectarExamenes();

  let html = `
    <div class="choice-container fade">
      <div class="choice-header-global">
        <span>📄</span>
        <h2>Exámenes anteriores</h2>
      </div>
      <p class="choice-subtitle">Seleccioná un examen para practicar.</p>

      <div id="exam-list">
  `;

  examenes.forEach(ex => {
    html += `
      <div class="choice-item" onclick="toggleExam('${ex.slug}')">
        <div class="choice-top">
          <span class="choice-title">${ex.name}</span>
          <span style="font-size:13px;color:#64748b;">
            ${ex.total} preguntas
          </span>
        </div>

        <div id="exam-body-${ex.slug}" class="choice-body" style="display:none;">
          ${ex.total > 0  
            ? `
              <div class="choice-row">
                <div class="choice-buttons">
                  <button onclick="abrirExamen('${ex.slug}', event)">Iniciar examen</button>
                  <button onclick="openNotasExamen('${ex.slug}', event)">Notas</button>
                </div>
              </div>
            `
            : `<p style="color:#64748b;font-size:13px;">⚠ Sin preguntas cargadas</p>`
          }
        </div>
      </div>
    `;
  });

  html += `
      </div>

      <div style="text-align:center;margin-top:20px;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;

  app.innerHTML = html;
}

/* ==========================================================
   🧠 Recolectar exámenes del banco transversal
   ========================================================== */
function colectarExamenes() {

  // Sacar todos los exámenes (oficiales y privados)
  const examSet = new Set();

  BANK.questions.forEach(q => {
    if (q.examen) examSet.add(q.examen);
  });

  // Convertir a array y ordenar (años descendentes)
  const examenes = Array.from(examSet).sort((a, b) => {
    const ay = Number(a.replace(/\D/g, ""));
    const by = Number(b.replace(/\D/g, ""));
    return by - ay;
  });

  // Mapear para construir la data visual
  return examenes.map(slug => {
    const pool = BANK.questions.filter(q => q.examen === slug);
    const total = pool.length;

    return {
      slug,
      total,
      name: formatearNombreExamen(slug)
    };
  });
}

/* ==========================================================
   🎨 Convertir slug → nombre visible en pantalla
   ========================================================== */
function formatearNombreExamen(slug) {
  if (slug.startsWith("examen_unico_")) {
    return `Examen Único ${slug.slice(-4)}`;
  }
  if (slug.startsWith("austral_")) {
    return `Austral ${slug.slice(-4)}`;
  }
  if (slug.startsWith("italiano_")) {
    return `Italiano ${slug.slice(-4)}`;
  }
  if (slug.startsWith("britanico_")) {
    return `Británico ${slug.slice(-4)}`;
  }

  return slug.toUpperCase();
}

/* ==========================================================
   🔽 Expandir / cerrar examen
   ========================================================== */
function toggleExam(slug) {
  document.querySelectorAll(".choice-body").forEach(el => {
    if (el.id !== `exam-body-${slug}`) el.style.display = "none";
  });

  const body = document.getElementById(`exam-body-${slug}`);
  if (!body) return;

  body.style.display = body.style.display === "block" ? "none" : "block";
}

/* ==========================================================
   ▶ Abrir examen (resolver universal)
   ========================================================== */
function abrirExamen(slug, e) {
  e.stopPropagation();

  const pool = BANK.questions.filter(q => q.examen === slug);
  if (!pool.length) return alert("No hay preguntas disponibles.");

  // Mezclar (como examen real)
  pool.sort(() => Math.random() - 0.5);

  iniciarResolucion({
    modo: "examen",
    preguntas: pool,
    usarTimer: true,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: `📄 ${formatearNombreExamen(slug)}`
  });
}

/* ==========================================================
   📝 Notas por examen (futura sección)
   ========================================================== */
function openNotasExamen(slug, e) {
  e.stopPropagation();
  alert(`Notas del examen ${formatearNombreExamen(slug)} (pronto 😉)`);
}
