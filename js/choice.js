/* ==========================================================
   🧩 MODO CHOICE POR MATERIA
   ========================================================== */

function renderSubjects() {
  const subs = subjectsFromBank().sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "").localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" }
    )
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
      <li style="margin:8px 0;">
        <div class="card fade" style="text-align:left;padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <b>${s.name}</b><br>
              <span class="small">${total} preguntas disponibles</span>
            </div>
            ${
              total
                ? `<button class="btn-small" style="background:#1e40af;border-color:#1e40af;" onclick="startChoice('${s.slug}')">
                     Practicar ➜
                   </button>`
                : `<span class="small" style="color:var(--muted)">Sin preguntas</span>`
            }
          </div>
        </div>
      </li>`;
  }).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:700px;margin:auto;">
      <h2>🧩 Practicá por materia</h2>
      <p>Elegí una materia para resolver preguntas del banco.</p>
      <ul style="list-style:none;padding:0;margin:20px 0;">${list}</ul>
      <div class="nav-row">
        <button class="btn-small" onclick="renderHome()">⬅️ Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ---------- Iniciar modo choice ---------- */
function startChoice(slug) {
  const materia = subjectsFromBank().find(s => s.slug === slug);
  if (!materia) {
    alert("No se encontró la materia seleccionada.");
    return;
  }

  const pool = (BANK.questions || []).filter(q => normalize(q.materia) === normalize(slug));
  if (!pool.length) {
    alert("No hay preguntas cargadas para esta materia.");
    return;
  }

  pool.sort(() => Math.random() - 0.5);

  CURRENT = {
    list: pool,
    i: 0,
    materia: slug,
    modo: "choice",
    session: {},
  };

  // Reutilizamos el motor de resolver.js
  renderResolverPregunta(false); // sin cronómetro
}
