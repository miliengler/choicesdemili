/* ==========================================================
   🧩 MEbank – Choice por materia (v2, estética mejorada)
   ========================================================== */

function renderChoice() {
  const app = document.getElementById("app");

  // Ordenar materias por nombre
  const materias = BANK.subjects
    .slice()
    .sort((a, b) =>
      a.name.replace(/[^\p{L}\p{N} ]/gu, "")
        .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
    );

  let html = `
    <div class="choice-container fade">
      <div class="choice-header-global">
        <span>🧩</span>
        <h2>Práctica por materia</h2>
      </div>
      <p class="choice-subtitle">Elegí una materia para comenzar.</p>
      <div id="choice-list">
  `;

  materias.forEach(mat => {
    const pool = BANK.questions.filter(q => q.materia === mat.slug);
    const total = pool.length;

    html += `
      <div class="choice-item" onclick="toggleChoice('${mat.slug}')">
        <div class="choice-top">
          <span class="choice-title">${mat.name}</span>
          <span style="font-size:13px;color:#64748b;">${total} preguntas</span>
        </div>

        <div id="body-${mat.slug}" class="choice-body" style="display:none;">
          <p class="choice-count">
            <strong>${total} cargadas</strong>
          </p>

          <div class="choice-row">
            <label>Desde #</label>
            <input type="number" id="start-${mat.slug}"
              min="1" max="${total}" value="1">
            
            <div class="choice-buttons">
              <button onclick="startChoice('${mat.slug}', event)">Práctica</button>
              <button onclick="startRepaso('${mat.slug}', event)">Repaso</button>
              ${renderReanudar(mat.slug)}
              <button onclick="openNotas('${mat.slug}', event)">Notas</button>
            </div>
          </div>
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
   🔽 Expandir/cerrar materia
   ========================================================== */
function toggleChoice(slug) {
  document.querySelectorAll(".choice-body").forEach(el => {
    if (el.id !== `body-${slug}`) el.style.display = "none";
  });

  const body = document.getElementById(`body-${slug}`);
  if (!body) return;

  body.style.display = body.style.display === "block" ? "none" : "block";

  // Ajustar max si cambian bancos
  const total = BANK.questions.filter(q => q.materia === slug).length;
  document.getElementById(`start-${slug}`).max = total;
}

/* ==========================================================
   ▶ Práctica
   ========================================================== */
function startChoice(slug, e) {
  e.stopPropagation();

  const desde = Number(document.getElementById(`start-${slug}`).value || 1);

  const pool = BANK.questions.filter(q => q.materia === slug);
  const list = pool.slice(desde - 1);

  if (!list.length) return alert("No hay preguntas disponibles.");

  iniciarResolucion({
    modo: "choice",
    preguntas: list,
    usarTimer: true,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: `🧩 ${slug.toUpperCase()}`
  });
}

/* ==========================================================
   🔁 Repaso (incorrectas)
   ========================================================== */
function startRepaso(slug, e) {
  e.stopPropagation();

  const prog = PROG[slug] || {};
  const idsIncorrectas = Object.keys(prog)
    .filter(id => prog[id]?.status === "bad");

  const pool = BANK.questions.filter(q => idsIncorrectas.includes(q.id));

  if (!pool.length) return alert("No tenés incorrectas para repasar.");

  iniciarResolucion({
    modo: "repaso",
    preguntas: pool,
    usarTimer: true,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: `🔁 Repaso – ${slug.toUpperCase()}`
  });
}

/* ==========================================================
   🔄 Reanudar
   ========================================================== */
function renderReanudar(slug) {
  const prog = PROG[slug] || {};
  const respondidas = Object.keys(prog).filter(k => !k.startsWith("_")).length;

  if (!respondidas) return "";

  return `<button onclick="resumeChoice('${slug}', event)">Reanudar (${respondidas})</button>`;
}

function resumeChoice(slug, e) {
  e.stopPropagation();

  const pool = BANK.questions.filter(q => q.materia === slug);
  if (!pool.length) return;

  iniciarResolucion({
    modo: "choice",
    preguntas: pool,
    usarTimer: true,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: `🧩 ${slug.toUpperCase()}`
  });
}

/* ==========================================================
   📝 Notas
   ========================================================== */
function openNotas(slug, e) {
  e.stopPropagation();
  alert(`Notas de ${slug} (próximamente 😀)`);
}
