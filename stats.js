/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Compatible con MEbank (versión final)
   ========================================================== */

(function () {
  // 🔹 Dibuja la tabla principal (global o por materia)
  function pintarStats(filtroMateria = null) {
    const totalPregs = (MEbank?.questions || []).length;

    // Si todavía no hay preguntas cargadas
    if (!totalPregs) {
      app.innerHTML = `
        <div class="card fade" style="text-align:center;">
          <h2>📊 Estadísticas</h2>
          <p>Aún no hay datos cargados. Intentá nuevamente en unos segundos.</p>
          <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
        </div>`;
      return;
    }

    // 🧮 Si se pidió filtrar por materia (slug)
    const filtroNorm = filtroMateria
      ? filtroMateria.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()
      : null;

    const preguntasFiltradas = filtroNorm
      ? MEbank.questions.filter(q =>
          q.materia &&
          q.materia.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === filtroNorm
        )
      : MEbank.questions;

    const totalPregsUsadas = preguntasFiltradas.length;

    // Total respondidas (ignora claves internas _lastIndex / _lastDate)
    const totalRespondidas = Object.values(PROG || {})
      .flatMap(obj => Object.keys(obj || {}))
      .filter(k => !k.startsWith("_")).length;

    // Agregación por materia o global
    const porMateria = {};
    preguntasFiltradas.forEach(q => {
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

    // 🖼 Render final
    app.innerHTML = `
      <div class="card fade" style="text-align:center;max-width:800px;margin:auto;">
        <h2>📊 ${filtroMateria ? "Estadísticas de " + filtroMateria.toUpperCase() : "Estadísticas generales"}</h2>
        <p>Preguntas totales: <b>${totalPregsUsadas}</b></p>
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

        <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${filtroMateria ? 
            `<button class="btn-main" onclick="renderSubjects()">⬅️ Volver a materias</button>` :
            `<button class="btn-main" onclick="renderHome()">🏠 Volver al inicio</button>`}
        </div>
      </div>
    `;
  }

  // 🔹 Función pública con reintento (por si MEbank todavía se carga)
  function renderStatsGlobal(filtroMateria = null) {
    if (!MEbank || !Array.isArray(MEbank.questions) || !MEbank.questions.length) {
      setTimeout(() => {
        try {
          renderStatsGlobal(filtroMateria);
        } catch {
          app.innerHTML = `
            <div class="card fade" style="text-align:center;">
              <h2>📊 Estadísticas</h2>
              <p>No se pudieron cargar los datos. Intentá nuevamente.</p>
              <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
            </div>`;
        }
      }, 500);
      return;
    }

    try {
      pintarStats(filtroMateria);
    } catch (err) {
      console.error("Error al generar estadísticas:", err);
      app.innerHTML = `
        <div class="card fade" style="text-align:center;">
          <h2>📊 Estadísticas</h2>
          <p>Ocurrió un error inesperado al generar las estadísticas.</p>
          <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
        </div>`;
    }
  }

  // 🔹 Export global
  window.renderStatsGlobal = renderStatsGlobal;
})();
