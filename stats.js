<!-- stats.js -->
/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Compatible con MEbank (con reintento)
   ========================================================== */

(function () {
  function pintarStats() {
    const totalPregs = (MEbank?.questions || []).length;

    // Si todavía no hay preguntas cargadas, mostramos un mensajito y salimos
    if (!totalPregs) {
      app.innerHTML = `
        <div class="card fade" style="text-align:center;">
          <h2>📊 Estadísticas</h2>
          <p>Aún no hay datos. Intentá nuevamente en unos segundos.</p>
          <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
        </div>`;
      return;
    }

    // Total respondidas (ignora claves internas _lastIndex / _lastDate)
    const totalRespondidas = Object.values(PROG || {})
      .flatMap(obj => Object.keys(obj || {}))
      .filter(k => !k.startsWith("_")).length;

    // Agregación por materia (usa el mismo identificador que usamos en práctica: slug normalizado)
    const porMateria = {};
    (MEbank.questions || []).forEach(q => {
      const mat = q.materia || "general";
      if (!porMateria[mat]) porMateria[mat] = { ok: 0, bad: 0, total: 0 };
      porMateria[mat].total++;
      const p = (PROG?.[mat] || {})[q.id];
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

  // Función pública con reintento suave (por si MEbank todavía se está cargando)
  function renderStatsGlobal() {
    // Si todavía no hay banco cargado, esperamos un toque y reintenta una vez
    if (!MEbank || !Array.isArray(MEbank.questions)) {
      setTimeout(() => {
        try { pintarStats(); } catch { /* noop */ }
      }, 400);
      return;
    }
    try {
      pintarStats();
    } catch {
      app.innerHTML = `
        <div class="card fade" style="text-align:center;">
          <h2>📊 Estadísticas</h2>
          <p>Ocurrió un error inesperado al generar las estadísticas.</p>
          <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
        </div>`;
    }
  }

  // 🔹 Export explícito para que main.js encuentre la función
  window.renderStatsGlobal = renderStatsGlobal;
})();
