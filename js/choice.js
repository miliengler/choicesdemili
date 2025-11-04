/* ==========================================================
   🧩 MODO CHOICE POR MATERIA – FASE 1 (Diseño + despliegue)
   ========================================================== */

function renderSubjects() {
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
    return `
      <div class="mat-card" onclick="toggleMateria('${s.slug}', ${total})">
        <div class="mat-header">
          <div class="mat-title">${s.name}</div>
          <div class="mat-count">${total} preguntas</div>
        </div>
        <div id="mat-body-${s.slug}" class="mat-body" style="display:none;">
          <div class="mat-options">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
              <label>Desde #</label>
              <input type="number" id="start-${s.slug}" value="1" min="1" max="${total || 1}"
                     style="width:70px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;">
            </div>
            <div class="mat-btns">
              <button class="btn-small" onclick="startChoice('${s.slug}')">🎯 Práctica</button>
              <button class="btn-small" onclick="startRepaso('${s.slug}')">📘 Repaso (incorrectas)</button>
              <button class="btn-small" onclick="openStats('${s.slug}')">📊 Estadísticas</button>
              <button class="btn-small" onclick="openNotas('${s.slug}')">🗒️ Notas</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:750px;margin:auto;">
      <h2>🧩 Practicá por materia</h2>
      <p>Elegí una materia para practicar o repasar tus preguntas.</p>
      <div id="materias-list">${list}</div>
      <div class="nav-row">
        <button class="btn-small" onclick="renderHome()">⬅️ Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ---------- Toggle materia desplegable ---------- */
function toggleMateria(slug, total) {
  document.querySelectorAll(".mat-body").forEach(el => {
    if (el.id !== `mat-body-${slug}`) el.style.display = "none";
  });

  const body = document.getElementById(`mat-body-${slug}`);
  if (!body) return;

  const visible = body.style.display === "block";
  body.style.display = visible ? "none" : "block";

  if (!visible) {
    const input = document.getElementById(`start-${slug}`);
    if (input) input.max = total;
  }
}

/* ---------- Placeholder funciones ---------- */
function startChoice(slug) {
  alert(`Práctica iniciada en ${slug}`);
}

function startRepaso(slug) {
  alert(`Modo repaso (incorrectas) para ${slug}`);
}

function openStats(slug) {
  alert(`Estadísticas de ${slug}`);
}

function openNotas(slug) {
  alert(`Notas de ${slug}`);
}
