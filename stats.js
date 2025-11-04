/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Compatible con MEbank
   ========================================================== */

function renderStatsGlobal() {
  // 🔹 Asegura acceso global correcto
  const bank = window.MEbank || {};
  const prog = window.PROG || {};

  const preguntas = bank.questions || [];
  if (!preguntas.length) {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>📊 Estadísticas</h2>
        <p>No hay preguntas cargadas todavía.<br>
        Tocá <b>Actualizar bancos</b> o respondé alguna pregunta.</p>
        <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
      </div>`;
    return;
  }

  // 🔹 Totales globales
  const totalPregs = preguntas.length;
  const todasResp = Object.values(prog)
    .flatMap(obj => Object.keys(obj))
    .filter(k => !k.startsWith("_"));
  const totalRespondidas = todasResp.length;

  // 🔹 Estadísticas por materia
  const porMateria = {};
  preguntas.forEach(q => {
    const mat = q.materia || "general";
    if (!porMateria[mat]) porMateria[mat] = { ok: 0, bad: 0, total: 0 };
    porMateria[mat].total++;

    const p = prog[mat]?.[q.id];
    if (p) {
      if (p.status === "ok") porMateria[mat].ok++;
      else if (p.status === "bad") porMateria[mat].bad++;
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
    }).join("") || `
      <tr><td colspan="5" style="color:var(--muted);padding:10px;">Sin respuestas registradas aún</td></tr>
    `;

  // 🔹 Render final
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

// 🔹 Garantiza acceso global y registro visible
window.renderStatsGlobal = renderStatsGlobal;
console.log("📊 Módulo de estadísticas cargado correctamente (v2)");
