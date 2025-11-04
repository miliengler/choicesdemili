/* ==========================================================
   📄 EXÁMENES ANTERIORES – Interfaz unificada (lista para futuro)
   ========================================================== */

/* ---------- Render principal ---------- */
function renderExamenesAnteriores() {
  const exKeys = Object.keys(MEbank.byExamen || {}).filter(k => k !== "oculto");
  const exList = exKeys.map(key => {
    const grupo = MEbank.byExamen[key];
    const nombre = grupo[0]?.examen || key;
    const cant = grupo.length;
    return `
      <li class="acc-item">
        <div class="acc-header" onclick="toggleAcc('${key}')">
          <div class="acc-title">${nombre}</div>
          <div class="acc-count hidden" id="count-${key}">${cant} preguntas</div>
        </div>
        <div class="acc-content" id="acc-${key}">
          <div class="acc-actions">
            <button class="btn-small" onclick="startExamenAnterior('${key}')">🎯 Comenzar</button>
            <button class="btn-small" onclick="showExamStats('${key}')">📊 Estadísticas</button>
          </div>
        </div>
      </li>`;
  }).join("");

  app.innerHTML = `
    <div class="card fade">
      <button class="btn-small btn-grey" onclick="renderHome()">⬅️ Volver</button>
      <h2 style="margin-top:8px;">📄 Exámenes anteriores</h2>
      <ul class="accordion">${exList || "<p class='small'>No hay exámenes cargados todavía.</p>"}</ul>
    </div>
  `;
}

/* ---------- Acordeón reutilizable ---------- */
window.toggleAcc = (slug) => {
  const el = document.getElementById(`acc-${slug}`);
  const cnt = document.getElementById(`count-${slug}`);
  const open = el.style.display === "block";
  document.querySelectorAll(".acc-content").forEach(e => (e.style.display = "none"));
  document.querySelectorAll(".acc-count").forEach(c => c.classList.add("hidden"));
  if (!open) {
    el.style.display = "block";
    cnt.classList.remove("hidden");
  }
};

/* ---------- Iniciar examen ---------- */
function startExamenAnterior(slug) {
  const list = MEbank.byExamen[slug] || [];
  if (!list.length) {
    alert("⚠️ Este examen no tiene preguntas cargadas aún.");
    return;
  }

  CURRENT = {
    list,
    i: 0,
    materia: slug,
    modo: "examen",
    session: {}
  };

  renderExamenPregunta(); // usa el motor unificado ya existente
}

/* ---------- Placeholder para estadísticas ---------- */
function showExamStats(slug) {
  alert(`📊 Próximamente estadísticas para ${slug}`);
}

/* ---------- Carga inicial (si se entra directo al módulo) ---------- */
window.addEventListener("DOMContentLoaded", () => {
  if (location.hash === "#examenes") renderExamenesAnteriores();
});
