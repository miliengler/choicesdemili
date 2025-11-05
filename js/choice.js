// 🧩 ORDEN DINÁMICO – FIX estados "ok"/"bad" y soporte PROG mixto (slug / name / normalizado)

let currentChoiceSort = localStorage.getItem("choiceSort") || "az";

/* ---------- Render principal ---------- */
function renderChoicePorMateria() {
  let subs = subjectsFromBank();
  subs = applyChoiceSort(subs);

  const resumen = BANK.questions.reduce((acc, q) => {
    const key = normalize(q.materia);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const list = subs.map((s, idx) => {
    const key = normalize(s.slug);
    const total = resumen[key] || 0;

    // Soporta cualquier forma guardada de progreso
    const prog = PROG[key] || PROG[s.slug] || PROG[s.name] || {};
    const answered = Object.entries(prog).filter(([k]) => !k.startsWith("_"));
    const correctas = answered.filter(([, data]) => data?.status === "ok").length;
    const porcentaje = total ? Math.round((correctas / total) * 100) : 0;

    const progressCircle = renderProgressCircle(porcentaje);
    const lastIndex = answered.length ? answered.length : null;

    // 🔹 Efecto visual: resaltar la materia con más progreso
    const topMateria = idx === 0 && currentChoiceSort === "progress" ? "box-shadow:0 0 0 3px #86efac80;" : "";

    return `
      <div class="choice-item" style="${topMateria}" onclick="toggleChoiceMateria('${s.slug}', ${total})">
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
      </div>`;
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
    </div>`;
}

/* ---------- Aplicar orden ---------- */
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

      // 🔹 Buscar progreso tanto por clave normalizada, slug o nombre
      const progA = PROG[keyA] || PROG[a.slug] || PROG[a.name] || {};
      const progB = PROG[keyB] || PROG[b.slug] || PROG[b.name] || {};

      const okA = Object.values(progA).filter(p => p?.status === "ok").length;
      const okB = Object.values(progB).filter(p => p?.status === "ok").length;

      const pctA = totalA ? okA / totalA : 0;
      const pctB = totalB ? okB / totalB : 0;

      if (pctB === pctA)
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });

      return pctB - pctA; // mayor progreso primero
    });
  }

  return subs;
}

/* ---------- Cambiar modo de orden ---------- */
function changeChoiceSort(mode) {
  currentChoiceSort = mode;
  localStorage.setItem("choiceSort", mode);
  const listContainer = document.getElementById("choice-list");
  if (listContainer) {
    listContainer.classList.add("fade-out");
    setTimeout(() => renderChoicePorMateria(), 250);
  } else {
    renderChoicePorMateria();
  }
}

/* ---------- Export global ---------- */
window.renderChoicePorMateria = renderChoicePorMateria;
window.changeChoiceSort = changeChoiceSort;
