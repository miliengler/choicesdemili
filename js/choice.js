/* ==========================================================
   🧩 ORDEN DINÁMICO EN CHOICE POR MATERIA – versión corregida
   ========================================================== */

let currentChoiceSort = localStorage.getItem("choiceSort") || "az";

function renderChoicePorMateria() {
  let subs = subjectsFromBank();

  // 🔢 Ordenar según modo actual
  subs = applyChoiceSort(subs);

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

    const progressCircle = renderProgressCircle(porcentaje);
    const lastIndex = answered.length ? answered.length : null;

    return `
      <div class="choice-item" onclick="toggleChoiceMateria('${s.slug}', ${total})">
        <div class="choice-top">
          <span class="choice-title">${s.name}</span>
          ${progressCircle}
        </div>
        <div id="choice-body-${s.slug}" class="choice-body" style="display:none;">
          <p class="choice-count"><strong style="color:#64748b;font-size:13px;">${total} preguntas cargadas</strong></p>
          <div class="choice-row" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <label style="font-size:14px;">Desde #</label>
            <input type="number" id="start-${s.slug}" value="1" min="1" max="${total || 1}"
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
        <div class="sort-control">
          <label for="sort-choice">Ordenar:</label>
          <select id="sort-choice" onchange="changeChoiceSort(this.value)">
            <option value="az" ${currentChoiceSort === "az" ? "selected" : ""}>A–Z</option>
            <option value="progress" ${currentChoiceSort === "progress" ? "selected" : ""}>Por progreso</option>
          </select>
        </div>
      </div>
      <p class="choice-subtitle">Elegí una materia para comenzar tu práctica.</p>
      <div id="choice-list" class="animated-list">${list}</div>
    </div>
  `;
}

/* ---------- Ordenador auxiliar ---------- */
function applyChoiceSort(subs) {
  if (currentChoiceSort === "az") {
    return subs.sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  }

  if (currentChoiceSort === "progress") {
    return subs.sort((a, b) => {
      const keyA = normalize(a.slug);
      const keyB = normalize(b.slug);

      const totalA = BANK.questions.filter(q => normalize(q.materia) === keyA).length;
      const totalB = BANK.questions.filter(q => normalize(q.materia) === keyB).length;

      const progA = PROG[keyA] || {};
      const progB = PROG[keyB] || {};

      const goodA = Object.values(progA).filter(p => p?.status === "good").length;
      const goodB = Object.values(progB).filter(p => p?.status === "good").length;

      const pctA = totalA ? goodA / totalA : 0;
      const pctB = totalB ? goodB / totalB : 0;

      if (pctB === pctA)
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });

      return pctB - pctA; // mayor progreso primero
    });
  }

  return subs;
}

/* ---------- Cambio de orden ---------- */
function changeChoiceSort(mode) {
  currentChoiceSort = mode;
  localStorage.setItem("choiceSort", mode);

  const listContainer = document.getElementById("choice-list");
  if (!listContainer) {
    renderChoicePorMateria();
    return;
  }

  // 🌀 Transición suave al reordenar
  listContainer.classList.add("fade-out");
  setTimeout(() => {
    renderChoicePorMateria();
  }, 250);
}
