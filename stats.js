/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Compatible con MEbank
   ========================================================== */

/* ---------- Normalizador local (para evitar conflictos globales) ---------- */
const normalizeSt = str =>
  str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";

/* ---------- Render principal ---------- */
function renderStatsGlobal() {
  if (!MEbank || !MEbank.questions || MEbank.questions.length === 0) {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>📊 Estadísticas</h2>
        <p>No hay datos disponibles todavía.</p>
        <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
      </div>`;
    return;
  }

  // Totales globales
  const totalPregs = MEbank.questions.length;

  const totalRespondidas = Object.values(PROG)
    .flatMap(obj => Object.keys(obj))
    .filter(k => !k.startsWith("_")).length;

  // Estructura por materia
  const porMateria = {};

  MEbank.questions.forEach(q => {
    const matKey = normalizeSt(q.materia || "general");
    if (!porMateria[matKey]) porMateria[matKey] = { ok: 0, bad: 0, total: 0, name: q.materia || "General" };
    porMateria[matKey].total++;

    const p = PROG[matKey]?.[q.id];
    if (p) {
      if (p.status === "ok") porMateria[matKey].ok++;
      else if (p.status === "bad") porMateria[matKey].bad++;
    }
  });

  // Tabla de resultados
  const filas = Object.values(porMateria)
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map(d => {
      const porc = d.total ? Math.round((d.ok / d.total) * 100) : 0;
      const color = porc >= 80 ? "#16a34a" : porc >= 50 ? "#facc15" : "#ef4444";
      return `
        <tr>
          <td>${d.name.toUpperCase()}</td>
          <td>${d.total}</td>
          <td>${d.ok}</td>
          <td>${d.bad}</td>
          <td style="color:${color};font-weight:600;">${porc}%</td>
        </tr>`;
    }).join("");

  // Render final
  app.innerHTML = `
    <div class="card fade" style="text-align:center;max-width:800px;margin:auto;">
      <h2>📊 Estadísticas generales</h2>
      <p>Preguntas totales: <b>${totalPregs}</b></p>
      <p>Preguntas respondidas: <b>${totalRespondidas}</b></p>
      <table class="stats-table" style="width:100%;margin-top:15px;border-collapse:collapse;">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Total</th>
            <th>✔ Correctas</th>
            <th>✖ Incorrectas</th>
            <th>Precisión</th>
          </tr>
        </thead>
        <tbody>${filas || "<tr><td colspan='5'>Sin datos</td></tr>"}</tbody>
      </table>
      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}

/* ---------- Export global ---------- */
window.renderStatsGlobal = renderStatsGlobal;
