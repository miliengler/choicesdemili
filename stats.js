/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Compatible con MEbank
   ========================================================== */

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

  const totalPregs = MEbank.questions.length;
  const totalRespondidas = Object.values(PROG)
    .flatMap(obj => Object.keys(obj))
    .filter(k => !k.startsWith("_")).length;

  const porMateria = {};

  MEbank.questions.forEach(q => {
    const mat = q.materia || "general";
    if (!porMateria[mat]) porMateria[mat] = { ok: 0, bad: 0, total: 0 };
    porMateria[mat].total++;
    const p = PROG[mat]?.[q.id];
    if (p) {
      if (p.status === "ok") porMateria[mat].ok++;
      if (p.status === "bad") porMateria[mat].bad++;
    }
  });

  const filas = Object.entries(porMateria)
    .sort((a, b) => a[0].localeCompare(b[0], "es"))
    .map(([mat, d]) => {
      const porc = d.total ? Math.round((d.ok / d.total) * 100) : 0;
      const color = porc >= 80 ? "#16a34a" : porc >= 50 ? "#facc15" : "#ef4444";
      return `
        <tr>
          <td>${mat.toUpperCase()}</td>
          <td>${d.total}</td>
          <td>${d.ok}</td>
          <td>${d.bad}</td>
          <td style="color:${color};font-weight:600;">${porc}%</td>
        </tr>`;
    }).join("");

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
        <tbody>${filas}</tbody>
      </table>
      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}
