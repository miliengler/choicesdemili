/* ==========================================================
   🎯 MEbank 3.0 – Crear Examen (Estética Unificada + Checkbox)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES (Soporte Arrays)
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

  // Generamos la lista (Estilo idéntico a Práctica, pero con Checkbox a la derecha)
  const lista = materias.map(m => `
    <label class="materia-row" onclick="updateMaxPreguntas()">
      
      <div style="flex:1;">
        <div style="font-weight:700; font-size:16px; color:#1e293b; margin-bottom:2px;">${m.name}</div>
        <div style="font-size:12px; color:#64748b;">${m.total} preguntas disponibles</div>
      </div>

      <div style="display:flex; align-items:center; gap:10px;">
        <input type="checkbox" class="mk-mat big-checkbox" value="${m.slug}" checked>
      </div>

    </label>
  `).join("");

  // Estilos específicos inyectados (para no tocar global css)
  const styles = `
    <style>
      .materia-row {
        display: flex; justify-content: space-between; align-items: center;
        border: 1px solid #e2e8f0; border-radius: 10px;
        padding: 16px; margin-bottom: 12px;
        background: white; cursor: pointer;
        transition: all 0.2s ease;
      }
      .materia-row:hover {
        border-color: #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.03);
      }
      /* Checkbox Gigante Custom */
      .big-checkbox {
        width: 24px; height: 24px; cursor: pointer;
        accent-color: #3b82f6; /* Azul MEbank */
        transform: scale(1.2);
      }
      /* Cuando está seleccionado, le damos un borde azulito suave a la fila */
      .materia-row:has(input:checked) {
        border-color: #bfdbfe; background: #eff6ff;
      }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div id="choice-shell" class="card fade" style="max-width:900px; margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <h2 style="margin:0;">🎯 Crear Examen</h2>
            <button onclick="mostrarInfoExamen()" 
                    style="width:24px; height:24px; border-radius:50%; border:1px solid #cbd5e1; background:white; color:#64748b; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ?
            </button>
          </div>
          <p style="color:#64748b; margin:0; font-size:14px;">
             Seleccioná las materias que querés incluir en tu simulacro.
          </p>
        </div>
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-bottom:15px;">
         <label style="font-size:14px; color:#1e3a8a; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px;">
            SELECCIONAR TODOS
            <input type="checkbox" id="chk-all" checked onchange="toggleSelectAll(this)" style="transform:scale(1.2);">
         </label>
      </div>

      <div style="margin-bottom:30px;">
        ${lista}
      </div>

      <div style="position:sticky; bottom:20px; background:white; padding:15px; border-radius:12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border:1px solid #e2e8f0; display:flex; flex-wrap:wrap; gap:15px; justify-content:space-between; align-items:center; z-index:100;">
        
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="text-align:right;">
             <div style="font-size:12px; color:#64748b; font-weight:600;">PREGUNTAS</div>
             <div id="mk-max-hint" style="font-size:11px; color:#94a3b8;">(Max: ${totalAll})</div>
          </div>
          <input id="mk-total" type="number" min="1" value="50" 
                 style="width:80px; padding:8px; border-radius:8px; border:1px solid #cbd5e1; font-size:18px; font-weight:bold; text-align:center; color:#334155;">
        </div>

        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="mk-timer" checked style="width:18px; height:18px;">
          <span style="font-size:14px; color:#334155; font-weight:600;">Cronómetro</span>
        </label>

        <button class="btn-main" style="padding:10px 25px; font-size:1.1rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);" 
                onclick="startExamenPersonalizado()">
          ▶ COMENZAR
        </button>

      </div>

    </div>
  `;
  
  updateMaxPreguntas();
}

/* ==========================================================
   ⚙️ LÓGICA AUXILIAR
   ========================================================== */

function mostrarInfoExamen() {
    alert("ℹ️ MODO CREADOR\n\n1. Marcá las materias que te interesan.\n2. Elegí cuántas preguntas responder abajo.\n3. ¡Dale a comenzar! El sistema mezclará todo al azar.");
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

  // Contar preguntas (soporte arrays)
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
      hint.textContent = `(Max: ${poolSize})`;
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
