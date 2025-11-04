/* ==========================================================
   🧩 MODO CHOICE POR MATERIA – con progreso circular + orden elegante persistente
   ========================================================== */

// 🔹 Cargar el orden guardado o iniciar en "az"
let currentChoiceSort = localStorage.getItem("choiceSort") || "az";

function renderChoicePorMateria() {
  let subs = subjectsFromBank();

  // 🔢 Orden dinámico según el selector
  if (currentChoiceSort === "az") {
    subs = subs.sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  } else if (currentChoiceSort === "progress") {
    subs = subs.sort((a, b) => {
      const keyA = normalize(a.slug);
      const keyB = normalize(b.slug);

      const totalA = BANK.questions.filter(q => normalize(q.materia) === keyA).length;
      const totalB = BANK.questions.filter(q => normalize(q.materia) === keyB).length;

      const progA = PROG[keyA] || {};
      const progB = PROG[keyB] || {};

      const goodA = Object.values(progA).filter(p => p.status === "good").length;
      const goodB = Object.values(progB).filter(p => p.status === "good").length;

      const pctA = totalA ? (goodA / totalA) : 0;
      const pctB = totalB ? (goodB / totalB) : 0;

      return pctB - pctA; // mayor progreso primero
    });
  }

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
    const answered = Object.entries(prog).filter(([k]) => !k.startsWith("_"));
    const correctas = answered.filter(([k, data]) => data?.status === "good").length;
    const porcentaje = total ? Math.round((correctas / total) * 100) : 0;

    // usamos el nuevo componente modular
    const progressCircle = renderProgressCircle(porcentaje);

    // último punto guardado
    const lastIndex = answered.length ? answered.length : null;

    return `
      <div class="choice-item" onclick="toggleChoiceMateria('${s.slug}', ${total})">
        <div class="choice-top">
          <span class="choice-title">${s.name}</span>
          ${progressCircle}
        </div>

        <div id="choice-body-${s.slug}" class="choice-body" style="display:none;">
          <p class="choice-count">
            <strong style="color:#64748b;font-size:13px;">
              ${total} preguntas cargadas
            </strong>
          </p>

          <div class="choice-row" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <label style="font-size:14px;">Desde #</label>
            <input 
              type="number" 
              id="start-${s.slug}" 
              value="1" 
              min="1" 
              max="${total || 1}"
              style="width:70px;padding:4px 6px;border:1px solid var(--line);
                     border-radius:6px;text-align:center;background:#fff;">
            <div class="choice-buttons" style="margin-top:0;">
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

        <!-- 🔽 Selector elegante de orden -->
        <div class="sort-control">
          <label for="sort-choice">Ordenar:</label>
          <select id="sort-choice" onchange="changeChoiceSort(this.value)">
            <option value="az" ${currentChoiceSort === "az" ? "selected" : ""}>A–Z</option>
            <option value="progress" ${currentChoiceSort === "progress" ? "selected" : ""}>Por progreso</option>
          </select>
        </div>
      </div>

      <p class="choice-subtitle">Elegí una materia para comenzar tu práctica.</p>
      <div id="choice-list">${list}</div>
    </div>
  `;
}

/* ---------- Cambio de orden ---------- */
function changeChoiceSort(mode) {
  currentChoiceSort = mode;
  localStorage.setItem("choiceSort", mode); // 💾 guardar elección
  renderChoicePorMateria();
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
