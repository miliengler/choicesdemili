/* ==========================================================
   🎯 MEbank 3.0 – Crear Examen (Estilo Unificado)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES
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

  // Generamos la lista (Sin scroll interno, estilo limpio)
  const lista = materias.map(m => `
    <label class="mat-row" style="display:flex; justify-content:space-between; align-items:center; 
                  padding:15px 10px; border-bottom:1px solid #f1f5f9; cursor:pointer; transition: background 0.2s;">
      <div style="display:flex; align-items:center; gap:12px;">
        <input type="checkbox" class="mk-mat" value="${m.slug}"
               onchange="updateMaxPreguntas()" checked style="transform:scale(1.2); cursor:pointer;">
        <span style="font-size:16px; color:#1e293b; font-weight:500;">${m.name}</span>
      </div>
      <span style="background:#f1f5f9; color:#64748b; font-size:13px; font-weight:700; 
                   padding:4px 10px; border-radius:12px;">${m.total}</span>
    </label>
  `).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:800px; margin:20px auto; padding:30px;">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
          <h2 style="margin:0; font-size:1.8rem; color:#0f172a;">🛠 Crear Examen</h2>
          
          <div style="display:flex; gap:10px;">
            <button class="btn-small btn-ghost" onclick="mostrarInfoExamen()" title="Ayuda" 
                    style="font-size:18px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; padding:0;">
               ?
            </button>
            <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
          </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">
         <span style="font-size:1rem; font-weight:600; color:#64748b;">Materias disponibles</span>
         
         <label style="font-size:14px; color:#1e3a8a; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:6px; user-select:none;">
            <input type="checkbox" id="chk-all" checked onchange="toggleSelectAll(this)">
            SELECCIONAR TODOS
         </label>
      </div>

      <div style="margin-bottom:30px;">
        ${lista}
      </div>

      <div style="background:#f8fafc; border-radius:12px; padding:20px; border:1px solid #e2e8f0; display:flex; flex-wrap:wrap; gap:20px; justify-content:space-between; align-items:center;">
        
        <div>
          <label for="mk-total" style="font-size:14px; color:#475569; font-weight:700; display:block; margin-bottom:6px;">
            Preguntas totales:
          </label>
          <div style="display:flex; align-items:center; gap:8px;">
            <input id="mk-total" type="number" min="1" value="50" 
                   style="width:100px; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:18px; font-weight:bold; text-align:center; color:#334155;">
            <span id="mk-max-hint" style="font-size:13px; color:#94a3b8; font-weight:500;">(Máx: ${totalAll})</span>
          </div>
        </div>

        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; background:white; padding:10px 15px; border-radius:8px; border:1px solid #e2e8f0;">
          <input type="checkbox" id="mk-timer" checked style="width:20px; height:20px; cursor:pointer;">
          <span style="font-size:15px; color:#334155; font-weight:600;">⏱ Usar cronómetro</span>
        </label>

      </div>

      <div style="margin-top:30px; text-align:center;">
        <button class="btn-main" style="width:100%; max-width:400px; padding:15px; font-size:1.2rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);" 
                onclick="startExamenPersonalizado()">
          ▶ COMENZAR SIMULACRO
        </button>
      </div>

    </div>
  `;
  
  updateMaxPreguntas();
}

/* ==========================================================
   FUNCIONES AUXILIARES
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

  const allCheckboxes = document.querySelectorAll(".mk-mat");
  const chkAll = document.getElementById("chk-all");
  if(chkAll) {
      if(checks.length === 0) chkAll.checked = false;
      else if(checks.length === allCheckboxes.length) chkAll.checked = true;
      else chkAll.indeterminate = true; 
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
      hint.textContent = `(Disp: ${poolSize})`;
  }
}

function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("⚠ Seleccioná al menos una materia.");
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
    alert("No hay preguntas disponibles.");
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
