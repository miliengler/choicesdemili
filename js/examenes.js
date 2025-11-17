/* ==========================================================
   📝 MEbank 3.0 – Exámenes anteriores
   ========================================================== */

function renderExamenesMain() {
  const app = document.getElementById("app");

  // Agrupar por grupo institucional
  const grupos = agruparExamenesPorGrupo();

  const gruposOrdenados = Object.keys(grupos)
    .sort((a, b) => a.localeCompare(b)); // Orden alfabético de instituciones

  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto;">
      
      <h2 style="margin-bottom:6px;">📝 Exámenes anteriores</h2>
      <p style="color:#64748b;margin-bottom:25px;">
        Elegí un examen para practicar
      </p>

      <div id="listaExamenes">
        ${gruposOrdenados.map(g => renderGrupoExamenes(g, grupos[g])).join("")}
      </div>

      <div style="text-align:center;margin-top:25px;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

    </div>
  `;

  activarEventosExamenes();
}

/* ==========================================================
   📚 Agrupar EXAMENES_META por grupo (institución)
   ========================================================== */
function agruparExamenesPorGrupo() {
  const grupos = {};

  EXAMENES_META.forEach(ex => {
    if (!grupos[ex.grupo]) grupos[ex.grupo] = [];
    grupos[ex.grupo].push(ex);
  });

  // Orden de exámenes dentro de cada grupo → por año descendente
  Object.keys(grupos).forEach(g => {
    grupos[g].sort((a, b) => b.anio - a.anio);
  });

  return grupos;
}

/* ==========================================================
   🏛 Render de grupo institucional (Examen Único, CABA, etc.)
   ========================================================== */
function renderGrupoExamenes(nombreGrupo, lista) {

  const items = lista.map(ex => renderItemExamen(ex)).join("");

  return `
    <div class="grupo-examen">
      <h3 class="grupo-title">${nombreGrupo}</h3>
      <div class="grupo-items">
        ${items}
      </div>
    </div>
  `;
}

/* ==========================================================
   📄 Render de un examen individual
   ========================================================== */
function renderItemExamen(ex) {
  const preguntas = getQuestionsByExamen(ex.id);
  const total = preguntas.length;
  const progreso = calcularProgresoExamen(ex.id);

  return `
    <div class="examen-item" data-id="${ex.id}">
      <div class="examen-header">

        <div>
          <b>${ex.id.replace(/_/g, " ").toUpperCase()}</b>
          <div style="color:#64748b;font-size:13px;">${total} preguntas</div>
        </div>

        <div class="progress-circle" style="background:
          conic-gradient(#16a34a ${progreso * 3.6}deg, #e5e7eb ${progreso * 3.6}deg 360deg)">
          <span>${progreso}%</span>
        </div>
      </div>

      <div class="examen-expand" id="exp-${ex.id}" style="display:none;">
        ${renderExpandExamen(ex, preguntas)}
      </div>
    </div>
  `;
}

/* ==========================================================
   📂 Expandir examen seleccionado
   ========================================================== */
function renderExpandExamen(ex, preguntas) {

  const hayProgreso = preguntas.some(q => {
    const r = PROG[q.materia]?.[q.id];
    return r && (r.status === "ok" || r.status === "bad");
  });

  return `
    <div class="subcard" style="margin-top:12px;">

      <div style="margin-bottom:14px;color:#64748b;">
        ${preguntas.length} preguntas en este examen
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">

        <button class="btn-main" onclick="iniciarExamen('${ex.id}')">
          ▶ Iniciar examen
        </button>

        ${hayProgreso
          ? `<button class="btn-main" onclick="reanudarExamen('${ex.id}')">⏳ Reanudar</button>`
          : ""}

        <button class="btn-main" onclick="verNotasExamen('${ex.id}')">
          📝 Notas
        </button>

        <button class="btn-main" onclick="verStatsExamen('${ex.id}')">
          📊 Estadísticas
        </button>

      </div>

    </div>
  `;
}

/* ==========================================================
   🔽 Expandir/contraer items al tocar
   ========================================================== */
function activarEventosExamenes() {
  document.querySelectorAll(".examen-item").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      const box = document.getElementById("exp-" + id);
      const visible = box.style.display === "block";
      box.style.display = visible ? "none" : "block";
    };
  });
}

/* ==========================================================
   📊 Progreso por examen
   ========================================================== */
function calcularProgresoExamen(examenId) {
  const preguntas = getQuestionsByExamen(examenId);
  if (!preguntas.length) return 0;

  let resueltas = 0;

  preguntas.forEach(q => {
    const r = PROG[q.materia]?.[q.id];
    if (r && (r.status === "ok" || r.status === "bad")) resueltas++;
  });

  return Math.round((resueltas / preguntas.length) * 100);
}

/* ==========================================================
   ▶ Iniciar examen
   ========================================================== */
function iniciarExamen(id) {
  const preguntas = getQuestionsByExamen(id);
  if (!preguntas.length) return alert("No se encontraron preguntas.");

  iniciarResolucion({
    modo: "examen",
    preguntas,
    usarTimer: true,
    titulo: id.replace(/_/g, " ").toUpperCase(),
  });
}

/* ==========================================================
   ⏳ Reanudar examen
   ========================================================== */
function reanudarExamen(id) {
  const preguntas = getQuestionsByExamen(id);

  iniciarResolucion({
    modo: "reanudar",
    preguntas,
    usarTimer: true,
    titulo: id.replace(/_/g, " ").toUpperCase(),
  });
}

/* ==========================================================
   📝 Notas por examen
   ========================================================== */
function verNotasExamen(id) {
  renderNotasMain(id);
}

/* ==========================================================
   📊 Stats por examen
   ========================================================== */
function verStatsExamen(id) {
  renderStatsExamen(id);
}
