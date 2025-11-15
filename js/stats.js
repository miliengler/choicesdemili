/* ==========================================================
   📊 MEbank – Estadísticas generales (v2)
   ========================================================== */

/* ----------------------------------------------------------
   🔥 Render principal
---------------------------------------------------------- */
function renderStatsGlobal() {
  const app = document.getElementById("app");

  const materias = BANK.subjects;
  let total = BANK.questions.length;

  // Contadores globales
  let ok = 0;
  let bad = 0;

  materias.forEach(m => {
    const prog = PROG[m.slug] || {};
    const valores = Object.values(prog).filter(v => typeof v === "object" && "status" in v);

    ok += valores.filter(v => v.status === "ok").length;
    bad += valores.filter(v => v.status === "bad").length;
  });

  const respondidas = ok + bad;
  const precision = respondidas ? Math.round(ok * 100 / respondidas) : 0;

  /* ═══════════ HTML PRINCIPAL ═══════════ */
  app.innerHTML = `
    <div class="card fade" style="max-width:700px;margin:auto;text-align:center;">
      <h2>📊 Estadísticas generales</h2>
      <p><b>Total de preguntas:</b> ${total}</p>
      <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
      <p><b>Precisión global:</b> ${precision}%</p>

      <hr class="divider">

      <h3>📆 Actividad semanal</h3>
      <div id="weekActivity" style="text-align:left;max-width:350px;margin:auto;"></div>

      <hr class="divider">

      <h3>💡 Sugerencias de repaso</h3>
      <div id="sugerencias"></div>

      <hr class="divider">

      <h3>📈 Por materia</h3>
      <ul id="materiasStats" style="list-style:none;padding:0;"></ul>

      <div style="margin-top:20px;">
        <button class="btn-small btn-grey" onclick="resetDailyStats()">Reiniciar actividad</button>
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;

  renderActividadSemanal();
  renderSugerencias();
  renderStatsPorMateria();
}

/* ==========================================================
   📆 Actividad semanal
========================================================== */
function renderActividadSemanal() {
  const cont = document.getElementById("weekActivity");
  const stats = JSON.parse(localStorage.getItem("mebank_daily") || "{}");

  const today = new Date();
  let html = "";

  // Últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const dd = key.slice(8, 10);
    const mm = key.slice(5, 7);
    const cant = stats[key] || 0;

    html += `
      <div style="display:flex;justify-content:space-between;margin:3px 0;">
        <span style="color:#64748b;">${dd}/${mm}</span>
        <b style="color:#16a34a;">${cant}</b>
      </div>
    `;
  }

  cont.innerHTML = html;
}

/* ==========================================================
   💡 Sugerencias inteligentes
========================================================== */
function renderSugerencias() {
  const cont = document.getElementById("sugerencias");
  const materias = BANK.subjects;

  let datos = [];

  materias.forEach(m => {
    const pool = BANK.questions.filter(q => q.materia === m.slug);
    const prog = PROG[m.slug] || {};

    const total = pool.length;
    const valores = Object.values(prog).filter(v => typeof v === "object" && "status" in v);

    const ok = valores.filter(v => v.status === "ok").length;
    const pct = total ? Math.round(ok * 100 / total) : null;

    // Último día practicado
    const last = prog._lastDate ? Number(prog._lastDate) : null;
    const dias = last ? Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24)) : null;

    datos.push({ materia: m, pct, dias });
  });

  // Ordenamos: peores porcentajes primero
  datos = datos.filter(d => d.pct !== null).sort((a, b) => a.pct - b.pct);

  const top3 = datos.slice(0, 3);

  if (!top3.length) {
    cont.innerHTML = `<p style="color:#64748b;">Aún no hay suficientes datos.</p>`;
    return;
  }

  cont.innerHTML = top3
    .map(d => `
      <div style="margin:10px 0;text-align:center;">
        <b>${d.materia.name}</b> – ${d.pct}% correctas  
        <br>
        ${d.dias !== null ? `<span style="color:#64748b;">Hace ${d.dias} días que no practicás</span><br>` : ""}
        <button class="btn-small" onclick="openMateriaDesdeStats('${d.materia.slug}')">
          Practicar
        </button>
      </div>
    `)
    .join("");
}

function openMateriaDesdeStats(slug) {
  renderChoice();
  setTimeout(() => toggleChoice(slug), 50);
}

/* ==========================================================
   📈 Por materia
========================================================== */
function renderStatsPorMateria() {
  const cont = document.getElementById("materiasStats");

  const materias = BANK.subjects.slice().sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  cont.innerHTML = materias
    .map(mat => {
      const pool = BANK.questions.filter(q => q.materia === mat.slug);
      const total = pool.length;

      const prog = PROG[mat.slug] || {};
      const valores = Object.values(prog).filter(v => typeof v === "object" && "status" in v);

      const ok = valores.filter(v => v.status === "ok").length;
      const bad = valores.filter(v => v.status === "bad").length;
      const noresp = total - ok - bad;
      const pct = total ? Math.round(ok * 100 / total) : 0;

      return `
        <li class="acc-item" style="margin:8px 0;">
          <div class="acc-header" onclick="toggleStatAcc('${mat.slug}')"
               style="background:var(--card);border:1px solid var(--line);
                      border-radius:10px;padding:12px 16px;cursor:pointer;
                      display:flex;justify-content:space-between;align-items:center;">
            <span>${mat.name}</span>
            <span style="color:#64748b;">${pct}%</span>
          </div>

          <div id="acc-${mat.slug}" class="acc-content" style="display:none;padding:12px;">
            <p><b>Total:</b> ${total}</p>
            <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
            <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
            <p style="color:#64748b;">⚪ No respondidas: ${noresp}</p>

            <button class="btn-small" onclick="openMateriaDesdeStats('${mat.slug}')">
              Practicar
            </button>
          </div>
        </li>
      `;
    })
    .join("");
}

function toggleStatAcc(slug) {
  const el = document.getElementById(`acc-${slug}`);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

/* ==========================================================
   ♻ Reiniciar actividad diaria
========================================================== */
function resetDailyStats() {
  if (!confirm("¿Reiniciar todos los registros de actividad?")) return;
  localStorage.removeItem("mebank_daily");
  renderStatsGlobal();
}
