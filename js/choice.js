/* ==========================================================
   🧩 MODO CHOICE POR MATERIA – Versión limpia con info dentro del desplegable
   ========================================================== */

function renderChoicePorMateria() {
  const subs = subjectsFromBank().sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

  const resumen = BANK.questions.reduce((acc, q) => {
    const key = normalize(q.materia);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const list = subs.map(s => {
    const key = normalize(s.slug);
    const total = resumen[key] || 0;

    // progreso guardado
    const prog = PROG[key] || {};
    const answered = Object.keys(prog).filter(k => !k.startsWith("_"));
    const lastIndex = answered.length ? answered.length : null;

    return `
  <div class="choice-item" onclick="toggleChoiceMateria('${s.slug}', ${total})">
    <div class="choice-top">
      <span class="choice-title">${s.name}</span>
    </div>

    <div id="choice-body-${s.slug}" class="choice-body" style="display:none;">
      <p class="choice-count">${total} preguntas cargadas</p>

      <div class="choice-row">
        <label>Desde #</label>
        <input 
          type="number" 
          id="start-${s.slug}" 
          value="1" 
          min="1" 
          max="${total || 1}"
        >

        <div class="choice-buttons">
          <button class="btn-practica" onclick="startChoice('${s.slug}', event)">Práctica</button>
          <button class="btn-repaso" onclick="startRepaso('${s.slug}', event)">Repaso</button>
          ${lastIndex ? `<button class="btn-repaso" onclick="resumeChoice('${s.slug}', event)">Reanudar (${lastIndex})</button>` : ""}
          <button class="btn-notas" onclick="openNotas('${s.slug}', event)">Notas</button>
        </div>
      </div>
    </div>
  </div>
`;
  }).join("");

  app.innerHTML = `
    <div class="choice-container fade">
      <div class="choice-header-global">
        <span>🧩</span>
        <h2>Practicá por materia</h2>
      </div>
      <p class="choice-subtitle">Elegí una materia para comenzar tu práctica.</p>
      <div id="choice-list">${list}</div>
    </div>
  `;
}

/* ---------- Toggle materia ---------- */
function toggleChoiceMateria(slug, total) {
  document.querySelectorAll(".choice-body").forEach(el => {
    if (el.id !== `choice-body-${slug}`) el.style.display = "none";
  });

  const body = document.getElementById(`choice-body-${slug}`);
  if (!body) return;
  body.style.display = body.style.display === "block" ? "none" : "block";

  const input = document.getElementById(`start-${slug}`);
  if (input) input.max = total;
}

/* ---------- Funciones ---------- */
function startChoice(slug, e) {
  e.stopPropagation();
  const input = document.getElementById(`start-${slug}`);
  const desde = parseInt(input?.value || "1", 10);

  const pool = BANK.questions.filter(q => normalize(q.materia) === normalize(slug));
  const list = pool.slice(desde - 1);
  if (!list.length) return alert("No hay preguntas disponibles.");

  CURRENT = { list, i: 0, materia: slug, modo: "choice" };
  renderResolverPregunta();
}

function startRepaso(slug, e) {
  e.stopPropagation();
  const prog = PROG[slug] || {};
  const incorrectas = Object.entries(prog)
    .filter(([id, data]) => data && data.status === "bad")
    .map(([id]) => id);

  const pool = BANK.questions.filter(q => incorrectas.includes(q.id));
  if (!pool.length) return alert("No tenés incorrectas para repasar.");

  CURRENT = { list: pool, i: 0, materia: slug, modo: "repaso" };
  renderResolverPregunta();
}

function resumeChoice(slug, e) {
  e.stopPropagation();
  const prog = PROG[slug] || {};
  const answered = Object.keys(prog).filter(k => !k.startsWith("_"));
  const resumeIndex = answered.length;

  const pool = BANK.questions.filter(q => normalize(q.materia) === normalize(slug));
  if (!pool.length) return alert("No hay preguntas disponibles.");

  CURRENT = { list: pool, i: resumeIndex, materia: slug, modo: "choice" };
  renderResolverPregunta();
}

function openNotas(slug, e) {
  e.stopPropagation();
  alert(`📘 Abrir notas de ${slug}`);
}
