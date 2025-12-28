/* ==========================================================
   🎯 MEbank 3.0 – Modo Examen (Minimalista + Funcional)
   ========================================================== */

function renderCrearExamen() {

  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES (Corregido para Arrays)
  const materias = BANK.subjects.map(s => {
    const total = BANK.questions.filter(q => {
        if (Array.isArray(q.materia)) return q.materia.includes(s.slug);
        return q.materia === s.slug;
    }).length;
    return { ...s, total };
  }).filter(m => m.total > 0);

  // Orden alfabético limpio
  materias.sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  // Generamos la lista (Tu diseño original)
  const lista = materias.map(m => `
    <label style="display:flex;justify-content:space-between; align-items:center;
                  padding:8px 0; border-bottom:1px solid #e5e7eb; cursor:pointer;">
      <span style="display:flex; align-items:center;">
        <input type="checkbox" class="mk-mat" value="${m.slug}"
               onchange="updateMaxPreguntas()" checked style="margin-right:8px;">
        ${m.name}
      </span>
      <span style="color:#64748b;font-size:13px;">(${m.total})</span>
    </label>
  `).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:800px; margin:20px auto; padding:20px;">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <h2 style="margin:0;">🎯 Crear tu examen</h2>
            <button class="btn-small btn-ghost" onclick="mostrarInfoExamen()" title="Ayuda" 
                    style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;">
               ?
            </button>
          </div>
          <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      <div style="text-align:right; margin-bottom:10px;">
         <label style="font-size:14px; color:#1e3a8a; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <input type="checkbox" id="chk-all" checked onchange="toggleSelectAll(this)">
            SELECCIONAR TODOS
         </label>
      </div>

      <div style="margin-bottom:20px;">
        ${lista}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-top:14px; background:#f8fafc; padding:15px; border-radius:8px;">

        <div>
          <label for="mk-total" style="font-size:14px; color:#64748b; font-weight:600;">Número de preguntas</label><br>
          <div style="display:flex; align-items:center; gap:5px; margin-top:4px;">
             <input id="mk-total" type="number" min="1" value="50"
                 style="width:90px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; text-align:center;">
             <span id="mk-max-hint" style="font-size:12px; color:#94a3b8;">(Máx: ...)</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="mk-timer" checked>
          <label for="mk-timer" style="font-size:14px; cursor:pointer;">⏱ Activar cronómetro</label>
        </div>

      </div>

      <div style="margin-top:24px; text-align:center;">
        <button class="btn-main" style="width:100%; max-width:300px; padding:12px;" onclick="startExamenPersonalizado()">▶ Comenzar examen</button>
      </div>
    </div>
  `;

  // Calcular máximo inicial
  updateMaxPreguntas();
}

/* ==========================================================
   ⚙️ LÓGICA
   ========================================================== */

function mostrarInfoExamen() {
    alert("ℹ️ MODO CREADOR\n\nElige las materias y la cantidad de preguntas. El sistema generará un examen único mezclando esos temas al azar.");
}

function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('.mk-mat');
    checkboxes.forEach(chk => chk.checked = source.checked);
    updateMaxPreguntas();
}

function updateMaxPreguntas() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  // Sincronizar checkbox "Todos"
  const allCheckboxes = document.querySelectorAll(".mk-mat");
  const chkAll = document.getElementById("chk-all");
  if(chkAll) {
      if(checks.length === 0) chkAll.checked = false;
      else if(checks.length === allCheckboxes.length) chkAll.checked = true;
      else chkAll.indeterminate = true;
  }

  // Contar preguntas únicas (soporte arrays)
  const poolSize = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  }).length;

  const input = document.getElementById("mk-total");
  const hint = document.getElementById("mk-max-hint");

  if (input) {
      input.max = poolSize;
      if (parseInt(input.value) > poolSize) input.value = poolSize;
      if (poolSize === 0) input.value = 0;
  }
  
  if (hint) {
      hint.textContent = `(Disp: ${poolSize})`;
  }
}

function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("Seleccioná al menos una materia.");
    return;
  }

  const total = parseInt(document.getElementById("mk-total").value) || 1;
  const usarTimer = document.getElementById("mk-timer").checked;

  // Construir pool (Soporte Arrays)
  let pool = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  });

  if (!pool.length) {
    alert("No hay preguntas disponibles.");
    return;
  }

  // Aleatorizar
  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado", // IMPORTANTE: Esto activa las insignias en Resolver.js
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Examen Personalizado"
  });
}
