/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Totalmente compatible con MEbank
   ========================================================== */

/* ---------- Normalizador local ---------- */
function normalizeStats(str) {
  return str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";
}

/* ---------- Render principal ---------- */
function renderStatsGlobal() {
  try {
    if (!window.MEbank || !MEbank.questions || MEbank.questions.length === 0) {
      app.innerHTML = `
        <div class="card fade" style="text-align:center;">
          <h2>📊 Estadísticas</h2>
          <p>No hay datos disponibles todavía.</p>
          <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
        </div>`;
      return;
    }

    const totalPregs = MEbank.questions.length;
    let totalRespondidas = 0;

    // Contador global de respondidas
    Object.values(PROG).forEach(mat => {
      Object.keys(mat).forEach(k => {
        if (!k.startsWith("_")) totalRespondidas++;
      });
    });

    const porMateria = {};

    (MEbank.questions || []).forEach(q => {
      const matKey = normalizeStats(q.materia || "general");
      if (!porMateria[matKey]) {
        porMateria[matKey] = { name: q.materia || "General", ok: 0, bad: 0, total: 0 };
      }
      porMateria[matKey].total++;
      const p = PROG[matKey]?.[q.id];
      if (p) {
        if (p.status === "ok") porMateria[matKey].ok++;
        else if (p.status === "bad") porMateria[matKey].bad++;
      }
    });

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
  } catch (err) {
    console.error("❌ Error en renderStatsGlobal:", err);
    alert("⚠️ Ocurrió un error al generar las estadísticas.");
  }
}

/* ---------- Export global garantizado ---------- */
window.renderStatsGlobal = renderStatsGlobal;
