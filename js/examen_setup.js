/* ==========================================================
   🧠 MEbank – Crear tu examen (v2)
   ========================================================== */

function renderExamenSetup() {
  const app = document.getElementById("app");

  const materias = BANK.subjects.slice().sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  // Construir lista de checkboxes
  let listHTML = "";
  materias.forEach(mat => {
    const total = BANK.questions.filter(q => q.materia === mat.slug).length;

    listHTML += `
      <label class="chk-mat" style="display:block;margin:6px 0;">
        <input type="checkbox" class="mat-check" 
               value="${mat.slug}" data-count="${total}" ${total ? "checked" : ""}>
        ${mat.name} 
        <span style="color:#64748b;">(${total})</span>
      </label>
    `;
  });

  app.innerHTML = `
    <div class="choice-container fade" style="max-width:750px;margin:auto;">
      <div class="choice-header-global">
        <span>🧠</span>
        <h2>Crear tu examen</h2>
      </div>

      <p class="choice-subtitle">
        Seleccioná las materias y la cantidad de preguntas.
      </p>

      <div id="matList">${listHTML}</div>

      <div style="margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <label style="font-size:14px;">Número de preguntas:</label>
        <input type="number" id="numPreg" min="1" value="1" 
               style="width:90px;border:1px solid var(--line);padding:6px;border-radius:6px;">
      </div>

      <div style="margin-top:10px;display:flex;align-items:center;gap:6px;">
        <input type="checkbox" id="chkTimer">
        <label for="chkTimer" style="font-size:14px;">⏱ Activar cronómetro</label>
      </div>

      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-main" onclick="startExamenPersonalizado()">🎯 Comenzar</button>
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;

  // Eventos
  document.querySelectorAll(".mat-check").forEach(chk => chk.addEventListener("change", updateExamenCount));

  updateExamenCount(); // inicial
}

/* ==========================================================
   🔢 Actualizar contador según materias seleccionadas
   ========================================================== */
function updateExamenCount() {
  const chks = Array.from(document.querySelectorAll(".mat-check"));
  const total = chks
    .filter(c => c.checked)
    .reduce((acc, c) => acc + Number(c.dataset.count || 0), 0);

  const numInput = document.getElementById("numPreg");
  if (!numInput) return;

  numInput.max = total || 1;
  if (!numInput._manual) numInput.value = total || 1;
}

document.addEventListener("input", (e) => {
  if (e.target.id === "numPreg") e.target._manual = true;
});

/* ==========================================================
   ▶ Comenzar examen personalizado
   ========================================================== */
function startExamenPersonalizado() {
  const chks = Array.from(document.querySelectorAll(".mat-check"));
  const seleccionadas = chks.filter(c => c.checked).map(c => c.value);

  if (!seleccionadas.length) {
    alert("Seleccioná al menos una materia.");
    return;
  }

  const numTotal = Number(document.getElementById("numPreg").value || 1);
  const usarTimer = document.getElementById("chkTimer").checked;

  // Juntar todas las preguntas de las materias seleccionadas
  const pool = BANK.questions.filter(q => seleccionadas.includes(q.materia));

  if (!pool.length) {
    alert("No hay preguntas en las materias seleccionadas.");
    return;
  }

  // Mezclar
  pool.sort(() => Math.random() - 0.5);

  // Tomar solo la cantidad elegida
  const chosen = pool.slice(0, Math.min(numTotal, pool.length));

  // Mandar al resolver
  iniciarResolucion({
    modo: "examen_personalizado",
    preguntas: chosen,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🧠 Examen personalizado"
  });
}
