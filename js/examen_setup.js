/* ==========================================================
   🎯 MEbank 3.0 – Crear Examen (Funcionalidades Agregadas)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES (Lógica Arrays)
  const materias = BANK.subjects.map(s => {
    const total = BANK.questions.filter(q => {
        if (Array.isArray(q.materia)) return q.materia.includes(s.slug);
        return q.materia === s.slug;
    }).length;
    return { ...s, total };
  }).filter(m => m.total > 0);

  // Orden alfabético
  materias.sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  const totalAll = BANK.questions.length; 

  // Generamos la lista (Estilo original simple)
  const lista = materias.map(m => `
    <label style="display:flex;justify-content:space-between;
                  align-items:center;padding:8px 0;border-bottom:1px solid #e5e7eb; cursor:pointer;">
      <span style="display:flex; align-items:center;">
        <input type="checkbox" class="mk-mat" value="${m.slug}"
               onchange="updateMaxPreguntas()" checked style="margin-right:8px;">
        ${m.name}
      </span>
      <span style="color:#64748b;font-size:13px; font-weight:500;">(${m.total})</span>
    </label>
  `).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto; padding:20px;">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #e2e8f0;">
          <div style="display:flex; align-items:center; gap:10px;">
            <h2 style="margin:0;">🎯 Crear tu examen</h2>
            <button class="btn-small btn-ghost" onclick="mostrarInfoExamen()" style="padding: 2px 8px; font-weight:bold; border-radius:50%; border:1px solid #cbd5e1;">?</button>
          </div>
          <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <p style="color:#64748b; margin:0; font-size:14px;">Seleccioná las materias:</p>
        <label style="font-size:14px; color:#3b82f6; cursor:pointer; font-weight:600;">
            <input type="checkbox" id="chk-all" checked onchange="toggleSelectAll(this)"> Todos
        </label>
      </div>

      <div style="max-height: 400px; overflow-y: auto; margin-bottom:18px; padding-right: 5px; border:1px solid #f1f5f9; padding:5px; border-radius:6px;">
        ${lista}
      </div>

      <div style="border-top:1px solid #e2e8f0; margin-top:10px; padding-top:15px;"></div>

      <div style="display:flex;justify-content:space-between;align-items:center; flex-wrap:wrap;gap:16px;margin-top:14px;">
        <div>
          <label for="mk-total" style="font-size:14px;color:#64748b; font-weight:600;">Número de preguntas</label><br>
          <div style="display:flex; align-items:center; gap:5px; margin-top:5px;">
            <input id="mk-total" type="number" min="1" value="50" 
                   style="width:90px;padding:6px;border-radius:6px;border:1px solid #cbd5e1; font-size:16px; text-align:center;">
            <span id="mk-max-hint" style="font-size:12px; color:#94a3b8;">(Máx: ${totalAll})</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="mk-timer" checked>
          <label for="mk-timer" style="font-size:14px; cursor:pointer; font-weight:500;">⏱ Activar cronómetro</label>
        </div>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <button class="btn-main" style="width:100%; max-width:300px; padding:12px; font-size:1.1rem;" onclick="startExamenPersonalizado()">▶ Comenzar examen</button>
      </div>
    </div>
  `;
  
  updateMaxPreguntas();
}

/* ==========================================================
   FUNCIONES AUXILIARES
   ========================================================== */

// 1. Info Button
function mostrarInfoExamen() {
    alert("ℹ️ MODO CREADOR\n\nSelecciona una o varias materias y la cantidad de preguntas. El sistema creará un examen al azar combinando esos temas.");
}

// 2. Marcar/Desmarcar Todo
function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('.mk-mat');
    checkboxes.forEach(chk => chk.checked = source.checked);
    updateMaxPreguntas();
}

// 3. Actualizar Máximo (Mantiene el estilo original + lógica del Select All)
function updateMaxPreguntas() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  // Sincronizar el checkbox "Todos"
  const allCheckboxes = document.querySelectorAll(".mk-mat");
  const chkAll = document.getElementById("chk-all");
  if(chkAll) {
      if(checks.length === 0) chkAll.checked = false;
      else if(checks.length === allCheckboxes.length) chkAll.checked = true;
      else chkAll.indeterminate = true; // Estado intermedio visual
  }

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
      hint.textContent = `(Máx: ${poolSize})`;
  }
}

// 4. Iniciar (Sin cambios funcionales)
function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("Seleccioná al menos una materia.");
    return;
  }

  const totalInput = document.getElementById("mk-total");
  const total = parseInt(totalInput.value) || 10;
  const usarTimer = document.getElementById("mk-timer").checked;

  let pool = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  });

  if (!pool.length) {
    alert("No hay preguntas disponibles con esa selección.");
    return;
  }

  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado",
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Examen Personalizado"
  });
}
